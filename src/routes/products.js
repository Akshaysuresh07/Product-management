const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, price, quantity, created_at FROM products ORDER BY created_at DESC'
    );
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  const { name, description, price, quantity } = req.body;

  if (!name || price == null || quantity == null) {
    return res.status(400).json({ message: 'Name, price, and quantity are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, quantity) VALUES (?, ?, ?, ?)',
      [name, description || '', Number(price), Number(quantity)]
    );

    return res.status(201).json({ id: result.insertId, name, description: description || '', price: Number(price), quantity: Number(quantity) });
  } catch (err) {
    return next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, quantity } = req.body;

  if (!name || price == null || quantity == null) {
    return res.status(400).json({ message: 'Name, price, and quantity are required' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, quantity = ? WHERE id = ?',
      [name, description || '', Number(price), Number(quantity), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ id: Number(id), name, description: description || '', price: Number(price), quantity: Number(quantity) });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
