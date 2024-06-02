var express = require("express");
var router = express.Router();

// Check if a product is a favourite
router.get('/isFavourite', async function(req, res, next) {
    const pool = req.app.get('db');
    const { productId, type, userId } = req.query;  // Extract parameters from query string
  
    try {
      const result = await pool.query(
        'SELECT 1 FROM Favourite WHERE productId = $1 AND type = $2 AND userId = $3',
        [productId, type, userId]
      );
  
      res.json({ isFavourite: result.rowCount > 0 });
    } catch (err) {
      next(err);
    }
  });

// Get favorites list
router.get('/list_product', async function(req, res, next) {
  const pool = req.app.get('db');
  const { userId } = req.query;  // Extract userId from query string

  try {
    const query = `
      SELECT p.*, 'Product' as type
      FROM Favourite f
      JOIN Product p ON f.productId = p.id
      WHERE f.userId = $1
    `;

    const result = await pool.query(query, [userId]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});
// Get favorites list
router.get('/list_pack', async function(req, res, next) {
  const pool = req.app.get('db');
  const { userId } = req.query;  // Extract userId from query string

  try {
    const query = `
      SELECT p.*, 'Pack' as type
      FROM Favourite f
      JOIN Pack p ON f.productId = p.id
      WHERE f.userId = $1
    `;

    const result = await pool.query(query, [userId]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});
  
  // Add a product to favourites
  router.post('/addFavourite', async function(req, res, next) {
    const pool = req.app.get('db');
    const { productId, type, userId } = req.query;  // Extract parameters from query string
  
    try {
      await pool.query(
        'INSERT INTO Favourite (productId, userId, type) VALUES ($1, $2, $3)',
        [productId, userId, type]
      );
      res.status(201).json({ message: 'Added to favourites' });
    } catch (err) {
      next(err);
    }
  });
  
  // Remove a product from favourites
  router.delete('/removeFavourite', async function(req, res, next) {
    const pool = req.app.get('db');
    const { productId, type, userId } = req.query;
  
    try {
      await pool.query(
        'DELETE FROM Favourite WHERE productId = $1 AND type = $2 AND userId = $3',
        [productId, type, userId]
      );
      res.json({ message: 'Removed from favourites' });
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
