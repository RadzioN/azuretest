// index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Konfiguracja połączenia z PostgreSQL:
// Jeśli jest DATABASE_URL, użyj connectionString:
const poolConfig = {};
if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
  // Jeśli potrzebujesz SSL i URL nie zawiera parametrów, można dodać:
  if (process.env.PGSSLMODE && process.env.PGSSLMODE !== 'disable') {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
} else {
  // użyj osobnych zmiennych
  poolConfig.host = process.env.PGHOST;
  poolConfig.user = process.env.PGUSER;
  poolConfig.password = process.env.PGPASSWORD;
  poolConfig.database = process.env.PGDATABASE;
  poolConfig.port = process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432;
  if (process.env.PGSSLMODE && process.env.PGSSLMODE !== 'disable') {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
}

const pool = new Pool(poolConfig);

// Inicjalizacja DB: tworzenie tabeli, jeśli nie istnieje
async function initDb() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log('Tabela items sprawdzona/utworzona.');
  } catch (err) {
    console.error('Błąd podczas inicjalizacji bazy:', err);
    process.exit(1);
  }
}

// Middleware
app.use(express.json());
// Serwowanie statycznych plików frontend z katalogu public
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint GET /api/items — zwraca listę wszystkich rekordów
app.get('/api/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/items error:', err);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// Endpoint POST /api/items — dodaje nowy rekord
app.post('/api/items', async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Pole "name" jest wymagane' });
  }
  try {
    const insertQuery = 'INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *';
    const values = [name, description || null];
    const result = await pool.query(insertQuery, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/items error:', err);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// Opcjonalny endpoint healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start serwera po inicjalizacji DB
initDb().then(() => {
  app.listen(port, () => {
    console.log(`Server uruchomiony na porcie ${port}`);
  });
});