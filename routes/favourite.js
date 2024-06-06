var express = require("express");
var router = express.Router();

// Verificar si un producto es favorito.
router.get('/isFavourite', async function(req, res, next) {
    const pool = req.app.get('db');
    const { productId, type, userId } = req.query;
  
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

// Obtener lista de favoritos para productos.
router.get('/list_product', async function(req, res, next) {
  const pool = req.app.get('db');
  const { userId } = req.query;

  try {
    const query = `
      SELECT p.*, p.type
      FROM Favourite f
      LEFT JOIN (
        SELECT id, name, description, stock, imagelinksquare, imagelinkportrait, extrainfo, ratingscount, type, index, average_rating FROM product
        UNION ALL
        SELECT id, name, description, stock, imagelinksquare, imagelinkportrait, extrainfo, ratingscount, type, index, average_rating FROM pack
      ) p ON f.productId = p.id
      WHERE f.userId = $1
      and p.id is not null
    `;

    const result = await pool.query(query, [userId]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Obtener lista de favoritos para packs.
router.get('/list_pack', async function(req, res, next) {
  const pool = req.app.get('db');
  const { userId } = req.query;

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
  
  // Agregar un producto a favoritos.
  router.post('/addFavourite', async function(req, res, next) {
    const pool = req.app.get('db');
    const { productId, type, userId } = req.query;
  
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
  
  // Eliminar producto de favoritos.
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
