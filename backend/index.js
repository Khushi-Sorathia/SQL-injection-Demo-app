import express from 'express';
import pkg from 'pg';
import cors from 'cors';

const { Pool } = pkg;

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Main application pool using the restricted 'demouser'
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'demouser',
  password: process.env.DB_PASSWORD || 'demopass',
  database: process.env.DB_NAME || 'sqli_demo',
});

// Admin pool for reset functionality
const adminPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.ADMIN_DB_USER || 'postgres',
  password: process.env.ADMIN_DB_PASSWORD || 'postgrespassword',
  database: process.env.DB_NAME || 'sqli_demo',
});

// Utility to measure query execution time
const executeQuery = async (query, params = null) => {
  const start = performance.now();
  let result;
  let error = null;
  try {
    if (params) {
      result = await pool.query(query, params);
    } else {
      // allow multiple statements if no params for the vulnerable multi-query
      result = await pool.query(query);
    }
  } catch (err) {
    error = err.message;
  }
  const end = performance.now();
  const timeMs = end - start;

  let data = [];
  if (result) {
    if (Array.isArray(result)) {
      // Return rows from the last query in a multi-query string
      data = result[result.length - 1].rows || [];
    } else {
      data = result.rows || [];
    }
  }

  return {
    success: !error,
    timeMs: timeMs.toFixed(2),
    data,
    error,
    query // raw query for display
  };
};

// Scenario A: Authentication Bypass
// VULNERABLE Endpoint
app.post('/api/scenario/a/vulnerable', async (req, res) => {
  const { username, password } = req.body;

  // Intentionally vulnerable string concatenation
  const rawQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  const result = await executeQuery(rawQuery);
  res.json(result);
});

// SECURE Endpoint
app.post('/api/scenario/a/secure', async (req, res) => {
  const { username, password } = req.body;

  // Secure parameterized query
  const query = `SELECT * FROM users WHERE username = $1 AND password = $2`;
  const params = [username, password];

  const result = await executeQuery(query, params);

  // Override query in result to show parameterization clearly
  result.query = `SELECT * FROM users WHERE username = $1 AND password = $2 \n-- Parameters: [${username}, ${password}]`;
  res.json(result);
});

// Scenario B: Data Exfiltration (Search)
// VULNERABLE Endpoint
app.get('/api/scenario/b/vulnerable', async (req, res) => {
  const searchTerm = req.query.q || '';

  // Intentionally vulnerable string concatenation
  const rawQuery = `SELECT id, name, description, price FROM products WHERE name ILIKE '%${searchTerm}%'`;

  const result = await executeQuery(rawQuery);
  res.json(result);
});

// SECURE Endpoint
app.get('/api/scenario/b/secure', async (req, res) => {
  const searchTerm = req.query.q || '';

  // Secure parameterized query
  const query = `SELECT id, name, description, price FROM products WHERE name ILIKE $1`;
  const params = [`%${searchTerm}%`];

  const result = await executeQuery(query, params);

  result.query = `SELECT id, name, description, price FROM products WHERE name ILIKE $1 \n-- Parameters: [%${searchTerm}%]`;
  res.json(result);
});

// Scenario C: Blind / Error-based
// VULNERABLE Endpoint
app.get('/api/scenario/c/vulnerable', async (req, res) => {
    const id = req.query.id || '1';

    // Intentionally vulnerable
    const rawQuery = `SELECT id, username, role FROM users WHERE id = ${id}`;

    const result = await executeQuery(rawQuery);
    res.json(result);
});

// SECURE Endpoint
app.get('/api/scenario/c/secure', async (req, res) => {
    const id = req.query.id || '1';

    // Check if ID is a valid number to prevent execution
    if (isNaN(parseInt(id))) {
      return res.json({
        success: false,
        timeMs: '0.00',
        data: [],
        error: 'Invalid input: id must be a number',
        query: `SELECT id, username, role FROM users WHERE id = $1 \n-- Validation failed before query execution`
      });
    }

    const query = `SELECT id, username, role FROM users WHERE id = $1`;
    const params = [id];

    const result = await executeQuery(query, params);

    result.query = `SELECT id, username, role FROM users WHERE id = $1 \n-- Parameters: [${id}]`;
    res.json(result);
});

// Admin Route to Reset Database
app.post('/api/admin/reset', async (req, res) => {
  try {
    // Call the reset function using the admin pool
    await adminPool.query('SELECT reset_db()');
    res.json({ success: true, message: 'Database reset to initial state.' });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset database.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
