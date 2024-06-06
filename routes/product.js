var express = require('express');
var router = express.Router();

// Obtener listado de productos.
router.get('/', function(req, res, next) {
  const pool = req.app.get('db');
  
  const query = `
    SELECT Product.*, json_agg(json_build_object('size', Price.size, 'price', Price.price, 'currency', Price.currency) 
    ORDER BY (Price.price::numeric)) as prices
    FROM Product
    LEFT JOIN Price ON Product.id = Price.productid
    GROUP BY Product.id
  `;

  pool.query(query, (error, results) => {
    if (error) {
      next(error);
    } else {
      res.json(results.rows);
    }
  });
});

// Obtener producto por ID.
router.get('/:productId', function(req, res, next) {
  const pool = req.app.get('db');
  const productId = req.params.productId;
  
  const query = `
    SELECT Product.*, json_agg(json_build_object('size', Price.size, 'price', Price.price, 'currency', Price.currency) ORDER BY (Price.price::numeric)) as prices
    FROM Product
    LEFT JOIN Price ON Product.id = Price.productid
    WHERE Product.id = $1
    GROUP BY Product.id
  `;

  pool.query(query, [productId], (error, results) => {
    if (error) {
      next(error);
    } else {
      res.json(results.rows[0]);
    }
  });
});

module.exports = router;
