import mysql from "mysql2"

import dotenv from "dotenv"
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export async function getUsers () {
    const [rows] = await pool.query("SELECT * FROM users")
    return rows
}

export async function getRunner (name){
    const [rows] = await pool.query(`
        SELECT *
        FROM users
        WHERE full_name = ?
        `, [name])
    return rows[0]
}

export async function createRunner(name, race, grade){
    const today = new Date().toISOString().split('T')[0]
    const [result] = await pool.query(`
        INSERT INTO users (full_name, race, tday, grade)
        VALUES(?, ?, ?, ?)`, [name, race, today, grade])
    const id = result.insertId;
    return getRunner(name)
}

export async function updatedate(){
    const today = new Date().toISOString().split('T')[0]
    console.log(today); 
    // Output: "2025-12-22"
    const [result] = await pool.query(`
        UPDATE users
        SET tday = ?
        `, [today])
    const [runs] = await pool.query(`
        SELECT TWR5K, TWR10K, SL10K
        FROM calendar
        WHERE run_day = ?
        `, [today])
    const run = runs
    console.log(run)
    const [TWR5K] = await pool.query(`
        UPDATE users
        SET tday_run = ?
        WHERE race = "TWR5K"
        `, [run.TWR5K])
    const [TWR10K] = await pool.query(`
        UPDATE users
        SET tday_run = ?
        WHERE race = "TWR10K"
        `, [run.TWR10K])
    const [SL10K] = await pool.query(`
        UPDATE users
        SET tday_run = ?
        WHERE race = "SL10K"
        `, [run.SL10K])
    return result, TWR5K, TWR10K, SL10K
}

export async function addRuns(date, TWR5K, TWR10K, SL10K){
    const [result] = await pool.query(`
        INSERT INTO calendar (run_day, TWR5K, TWR10K, SL10K)
        VALUES(?, ?, ?, ?)
        `, [date, TWR5K, TWR10K, SL10K])
    const id = result.insertId;
    return id
}

export async function getRuns(date, code){
    const [result] = await pool.query(`
        SELECT ?
        FROM calendar
        WHERE run_day = ?
        `, [date, code])
    return result
}

export async function getCalendar(){
    const [rows] = await pool.query("SELECT * FROM calendar")
    return rows
}

export async function getCodedCalendar(code){
    // Whitelist valid column names to prevent SQL injection
    const validCodes = ['TWR5K', 'TWR10K', 'SL10K'];
    if (!validCodes.includes(code)) {
        throw new Error('Invalid race code');
    }
    
    const [rows] = await pool.query(`
        SELECT ${code}, run_day
        FROM calendar
        `)
    return rows
}

import fs from 'fs';

// Read the TSV file
const tsvData = fs.readFileSync('Untitled spreadsheet - Sheet3.tsv', 'utf-8');

// Split into rows, then split each row by tabs
const nestedArray = tsvData
    .trim()                          // Remove trailing whitespace/newlines
    .split('\n')                     // Split into rows
    .map(row => row.split('\t'));    // Split each row by tabs


const dataOnly = nestedArray.shift(); // Removes the first row (headers)

/*for (const row of nestedArray){
    const result = await addRuns(row[0], row[1], row[2], row[3]);
}*/

//const runner = await createRunner("Lachlan Currie", "TWR10K", 10)
const result = await updatedate();
console.log(result);