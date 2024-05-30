var express = require('express');
var router = express.Router();

/* GET product listing. */
router.get('/', function(req, res, next) {
  const pool = req.app.get('db');
  
  // Realizamos la consulta a la base de datos
  const query = `
    SELECT Product.*, json_agg(json_build_object('size', Price.size, 'price', Price.price, 'currency', Price.currency) 
    ORDER BY (Price.price::numeric)) as prices
    FROM Product
    LEFT JOIN Price ON Product.id = Price.productid
    GROUP BY Product.id
  `;

  pool.query(query, (error, results) => {
    if (error) {
      // Si hay un error, lo pasamos al manejador de errores
      next(error);
    } else {
      // Si no hay errores, enviamos los resultados como respuesta
      res.json(results.rows);
    }
  });
});

/* GET specific product by ID. */
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
