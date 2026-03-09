# Run Club Site V2

A web application for tracking and managing run club activities, featuring a dynamic calendar and administrative tools.

## Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Docker](https://www.docker.com/) (Optional, for containerized deployment)

### Local Configuration
1. **Dependencies:** Install required packages:
   ```bash
   npm install
   ```
2. **Environment Variables:** Create or update your `.env` file:
   ```env
   DB_BUCKET_NAME="esmo-runclub-db-to"
   PORT=3000
   ```
   *Note: Ensure you have Google Cloud authentication configured if you wish to sync with the remote bucket.*

### Running the App
Start the local development server:
```bash
npm start
```
The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure
- `app.js`: Main Express application.
- `database.js`: SQLite database logic with Google Cloud Storage backup/restore.
- `public/`: Frontend assets (HTML, JS, CSS).
- `schema.sql`: Database schema definition.
- `Untitled spreadsheet - Sheet3.tsv`: Initial calendar data source.

## Deployment Info (GCP)
- **Service Name:** `esmo-runclub`
- **Region:** `northamerica-northeast1`
- **Project Number:** `305548427367`
- **GCS Bucket:** `esmo-runclub-db-to` (used for database persistence)

## Tech Stack
- **Backend:** Node.js, Express
- **Database:** SQLite3
- **Storage:** Google Cloud Storage (Backups)
- **Deployment:** Google Cloud Run
- **Frontend:** Vanilla JS, HTML5, CSS3
