const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/summary', async (req, res, next) => {
  try {
    const [[totals]] = await pool.query(
      'SELECT COUNT(*) AS productCount, IFNULL(SUM(price * quantity), 0) AS inventoryValue FROM products'
    );

    const [[latest]] = await pool.query(
      'SELECT name, created_at FROM products ORDER BY created_at DESC LIMIT 1'
    );

    return res.json({
      productCount: totals.productCount,
      inventoryValue: Number(totals.inventoryValue || 0),
      latestProduct: latest || null,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
