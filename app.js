import express from "express"
import path from 'path';
import multer from 'multer';
import fs from 'fs';

import { getUsers, getRunner, createRunner, getRuns, getCalendar, getCodedCalendar, bulkUpdateCalendar } from "./database.js"

import compression from "compression";
import helmet from "helmet";

const app = express();

app.use(compression());
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for simplicity if needed for inline scripts/styles, or configure properly
}));

app.use(express.static("public", {
    maxAge: "0", // Cache static assets for 1 day
    etag: true
}));
app.use(express.json());

app.get("/users", async (req, res) => {
    const runners = await getUsers()
    res.send(runners)
});

app.get("/calendar", async (req, res) => {
    const calendar = await getCalendar()
    res.send(calendar)
});

app.get("/users/:full_name", async (req, res) => {
    const name = req.params.full_name
    const runner = await getRunner(name)
    res.send(runner)
});

app.post("/users", async (req, res) => {
    const { full_name, race, grade } = req.body
    const result = await createRunner(full_name, race, grade)
    res.status(201).send(result)
});

app.get("/calendar/:code/:day", async (req, res) => {
    const day = req.params.day
    const code = req.params.code
    const tday_run = await getRuns(day, code)
    res.send(tday_run)
});

app.get("/calendar/:code", async (req, res) => {
    const code = req.params.code
    const calendar = await getCodedCalendar(code)
    res.send(calendar)
});

// --- Admin / Bulk Update ---

// Configure Multer for temporary file storage
const upload = multer({ dest: '/tmp/uploads/' });

app.post('/api/calendar/bulk', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Received file upload: ${req.file.originalname} (${req.file.size} bytes)`);

    try {
        const result = await bulkUpdateCalendar(req.file.path);

        // Clean up temp file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.json({ message: 'Calendar updated successfully', count: result.count });
    } catch (error) {
        console.error("API Bulk Update Error:", error);

        // Ensure temp file is cleaned up even on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: error.message || 'Failed to update calendar' });
    }
});

app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(500).send("Something broke!")
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});