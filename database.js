import sqlite3 from 'sqlite3';
import fs from 'fs';
import dotenv from "dotenv";
import { Storage } from '@google-cloud/storage';

dotenv.config();

const dbFileName = '/tmp/running_club.db';
const bucketName = process.env.DB_BUCKET_NAME || 'esmo-runclub-db-to';
const storage = new Storage();
const bucket = storage.bucket(bucketName);

// --- Backup & Restore Logic ---

async function downloadDatabase() {
    console.log(`Checking for database in bucket: ${bucketName}...`);
    try {
        const file = bucket.file(dbFileName);
        const [exists] = await file.exists();
        if (exists) {
            console.log("Database found in GCS. Downloading...");
            await file.download({ destination: dbFileName });
            console.log("Database downloaded successfully.");
        } else {
            console.log("No database found in GCS. Starting with fresh DB.");
        }
    } catch (error) {
        console.error("Error checking/downloading database from GCS:", error);
        // Continue even if download fails, to allow app to start (though data might be missing)
    }
}

async function uploadDatabase() {
    console.log("Backing up database to GCS...");
    try {
        if (!fs.existsSync(dbFileName)) {
            console.log("No local database file to backup yet.");
            return;
        }
        await bucket.upload(dbFileName, {
            destination: dbFileName,
            metadata: {
                cacheControl: 'no-cache',
            },
        });
        console.log("Database backup successful.");
    } catch (error) {
        console.error("Error uploading database to GCS:", error);
    }
}

// Perform download BEFORE connecting to SQLite
// Top-level await is supported in Node.js ES modules
await downloadDatabase();

// --- Database Connection ---

const dbPromise = new sqlite3.Database(dbFileName, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Setup Periodic Backup (every 5 minutes)
const backupInterval = 5 * 60 * 1000;
setInterval(uploadDatabase, backupInterval);

// Setup Shutdown Backup
async function handleShutdown() {
    console.log("Shutting down... performing final backup.");
    await uploadDatabase();
    process.exit(0);
}

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

// --- Standard Database Functions ---

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        dbPromise.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        dbPromise.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function initializeDatabase() {
    console.log("Initializing database schema...");

    await run(`CREATE TABLE IF NOT EXISTS users (
        id integer PRIMARY KEY AUTOINCREMENT,
        full_name VARCHAR(255) NOT NULL,
        race VARCHAR(255) NOT NULL,
        tday DATE NOT NULL,
        tday_run TEXT,
        grade INT NOT NULL,
        created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await run(`CREATE TABLE IF NOT EXISTS calendar (
        id integer PRIMARY KEY AUTOINCREMENT,
        run_day DATE NOT NULL,
        TWR5K VARCHAR(255) NOT NULL,
        TWR10K VARCHAR(255) NOT NULL,
        SL10K VARCHAR(255) NOT NULL
    )`);

    // Check if calendar is empty, if so, populate from TSV
    const rows = await all("SELECT COUNT(*) as count FROM calendar");
    if (rows[0].count === 0) {
        console.log("Calendar empty. Populating from TSV...");
        try {
            const tsvData = fs.readFileSync('Untitled spreadsheet - Sheet3.tsv', 'utf-8');
            const lines = tsvData.trim().split('\n');
            const headers = lines.shift();

            for (const line of lines) {
                const [run_day, TWR5K, TWR10K, SL10K] = line.split('\t');
                if (run_day) {
                    await run(`INSERT INTO calendar (run_day, TWR5K, TWR10K, SL10K) VALUES (?, ?, ?, ?)`,
                        [run_day, TWR5K, TWR10K, SL10K]);
                }
            }
            console.log("Calendar populated successfully.");
            // Immediate backup after initial population
            await uploadDatabase();
        } catch (error) {
            console.error("Error reading or processing TSV:", error);
        }
    } else {
        console.log("Calendar already initialized.");
    }
}

export async function getUsers() {
    const rows = await all("SELECT * FROM users");
    return rows;
}

export async function getRunner(name) {
    const rows = await all(`
        SELECT *
        FROM users
        WHERE full_name = ?
        `, [name]);
    return rows[0];
}

export async function createRunner(name, race, grade) {
    const today = new Date().toISOString().split('T')[0];
    const result = await run(`
        INSERT INTO users (full_name, race, tday, grade)
        VALUES(?, ?, ?, ?)`, [name, race, today, grade]);
    return getRunner(name);
}

export async function updatedate() {
    const today = new Date().toISOString().split('T')[0];
    console.log("Updating date to:", today);

    await run(`
        UPDATE users
        SET tday = ?
        `, [today]);

    const runs = await all(`
        SELECT TWR5K, TWR10K, SL10K
        FROM calendar
        WHERE run_day = ?
        `, [today]);

    const runData = runs[0];
    if (!runData) {
        console.log("No run data found for today.");
        return;
    }

    await run(`UPDATE users SET tday_run = ? WHERE race = "TWR5K"`, [runData.TWR5K]);
    await run(`UPDATE users SET tday_run = ? WHERE race = "TWR10K"`, [runData.TWR10K]);
    await run(`UPDATE users SET tday_run = ? WHERE race = "SL10K"`, [runData.SL10K]);

    return { result: "Updated", ...runData };
}

export async function addRuns(date, TWR5K, TWR10K, SL10K) {
    const result = await run(`
        INSERT INTO calendar (run_day, TWR5K, TWR10K, SL10K)
        VALUES(?, ?, ?, ?)
        `, [date, TWR5K, TWR10K, SL10K]);
    return result.lastID;
}

export async function getRuns(date, code) {
    const validCodes = ['TWR5K', 'TWR10K', 'SL10K'];
    if (!validCodes.includes(code)) {
        throw new Error('Invalid race code');
    }

    const rows = await all(`
        SELECT ${code} as run
        FROM calendar
        WHERE run_day = ?
        `, [date]);
    return rows;
}

export async function getCalendar() {
    const rows = await all("SELECT * FROM calendar");
    return rows;
}

export async function getCodedCalendar(code) {
    const validCodes = ['TWR5K', 'TWR10K', 'SL10K'];
    if (!validCodes.includes(code)) {
        throw new Error('Invalid race code');
    }

    const rows = await all(`
        SELECT ${code}, run_day
        FROM calendar
        `);
    return rows;
}