const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// GET: Obtener todos los tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tickets ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los tickets' });
  }
});

// POST: Crear un nuevo ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const { asunto, solicitante, descripcion, categoria, prioridad, estado, fechaRegistro } = req.body;
    const [result] = await pool.query(
      'INSERT INTO tickets (asunto, solicitante, descripcion, categoria, prioridad, estado, fechaRegistro) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [asunto, solicitante, descripcion, categoria || 'Soporte Técnico', prioridad || 'Media', estado || 'Abierto', fechaRegistro]
    );
    res.status(201).json({ id: result.insertId, message: 'Ticket creado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el ticket' });
  }
});

// PUT: Actualizar un ticket existente
app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { asunto, solicitante, descripcion, categoria, prioridad, estado } = req.body;
    await pool.query(
      'UPDATE tickets SET asunto = ?, solicitante = ?, descripcion = ?, categoria = ?, prioridad = ?, estado = ? WHERE id = ?',
      [asunto, solicitante, descripcion, categoria, prioridad, estado, id]
    );
    res.json({ message: 'Ticket actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el ticket' });
  }
});

// DELETE: Eliminar un ticket
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tickets WHERE id = ?', [id]);
    res.json({ message: 'Ticket eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el ticket' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});