const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const client = new Client({
  user: 'your_db_user',
  host: 'localhost',
  database: 'acme_hr_directory',
  password: 'your_db_password',
  port: 5432,
});
client.connect();

app.get('/api/employees', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM employees');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM departments');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees', async (req, res) => {
  const { name, department_id } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO employees (name, department_id) VALUES ($1, $2) RETURNING *',
      [name, department_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await client.query('DELETE FROM employees WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { name, department_id } = req.body;
  try {
    const result = await client.query(
      'UPDATE employees SET name = $1, department_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, department_id, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
