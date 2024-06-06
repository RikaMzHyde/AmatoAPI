var express = require('express');
var router = express.Router();

// Obtener la lista de packs.
router.get('/', function(req, res, next) {
  const pool = req.app.get('db');
  
  const query = `
    SELECT Pack.*, json_agg(json_build_object('size', PricePack.size, 'price', PricePack.price, 'currency', PricePack.currency) ORDER BY (PricePack.price::numeric)) as prices
    FROM Pack
    LEFT JOIN PricePack ON Pack.id = PricePack.productid
    GROUP BY Pack.id
  `;

  pool.query(query, (error, results) => {
    if (error) {
      next(error);
    } else {
      res.json(results.rows);
    }
  });
});


// Obtener pack por ID.
router.get('/:packId', function(req, res, next) {
    const pool = req.app.get('db');
    const packId = req.params.packId;
    
    const query = `
      SELECT Pack.*, json_agg(json_build_object('size', PricePack.size, 'price', PricePack.price, 'currency', PricePack.currency) ORDER BY (PricePack.price::numeric)) as prices
      FROM Pack
      LEFT JOIN PricePack ON Pack.id = PricePack.productid
      WHERE Pack.id = $1
      GROUP BY Pack.id
    `;
  
    pool.query(query, [packId], (error, results) => {
      if (error) {
        next(error);
      } else {
        res.json(results.rows[0]);
      }
    });
  });

module.exports = router;
