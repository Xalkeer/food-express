require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, process.env.DB_PATH);
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base SQLite :', err.message);
    } else {
        console.log('Connecté à la base SQLite3');
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS users (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     email TEXT UNIQUE NOT NULL,
     password TEXT NOT NULL,
     role TEXT NOT NULL DEFAULT 'user'
    )
`);

module.exports = db;
