var express = require("express");
var router = express.Router();

// Añadir pedidos al historial de pedidos
router.post('/addOrderHistory', async function(req, res, next) {
    const pool = req.app.get('db');
    const { cartList, totalPrice, userId } = req.body;  // Extract CartList, totalPrice, and userId from request body
  
    try {
      // Insert into ORDER_HISTORY and get the generated ORDER_ID
      const result = await pool.query(
        'INSERT INTO ORDER_HISTORY (TOTAL_PRICE, USERID) VALUES ($1, $2) RETURNING ORDER_ID',
        [totalPrice, userId]
      );
      const orderId = result.rows[0].order_id;
  
      // Insert each item in CartList into ORDER_HISTORY_PRODUCT
      for (let item of cartList) {
        // Insert into ORDER_HISTORY_PRODUCT and get the generated ID
        const productResult = await pool.query(
          'INSERT INTO ORDER_HISTORY_PRODUCT (ORDER_ID, PRODUCTID, TYPE) VALUES ($1, $2, $3) RETURNING ID',
          [orderId, item.id, item.type]
        );
        const orderProductId = productResult.rows[0].id;
  
        // For each price option in the item, insert into ORDER_HISTORY_QUANTITY
        for (let priceOption of item.prices) {
          await pool.query(
            'INSERT INTO ORDER_HISTORY_QUANTITY (ORDER_PRODUCT_ID, SIZE, QUANTITY) VALUES ($1, $2, $3)',
            [orderProductId, priceOption.size, priceOption.quantity]
          );
        }
      }
  
      res.status(201).json({ message: 'Added to order history' });
    } catch (err) {
      next(err);
    }
  });
  
  // Recoger historial de pedidos
  router.get('/getOrderHistory', async function(req, res, next) {
    const pool = req.app.get('db');
    const { userId } = req.query;
  
    try {
      const result = await pool.query(
        `SELECT 
          oh.order_id, 
          oh.date AS "OrderDate", 
          oh.total_price AS "CartListPrice", 
          ohp.productid AS "productId",
          p.id, p.name, p.description, p.stock, p.imagelinksquare, p.imagelinkportrait, p.extrainfo, p.ratingscount, p.type, p.index, p.average_rating,
          ohq.size, pr.currency, pr.price, ohq.quantity
        FROM order_history oh
        INNER JOIN order_history_product ohp ON oh.order_id = ohp.order_id
        INNER JOIN order_history_quantity ohq ON ohp.id = ohq.order_product_id
        LEFT JOIN (
          SELECT id, name, description, stock, imagelinksquare, imagelinkportrait, extrainfo, ratingscount, type, index, average_rating FROM product
          UNION ALL
          SELECT id, name, description, stock, imagelinksquare, imagelinkportrait, extrainfo, ratingscount, type, index, average_rating FROM pack
        ) p ON ohp.productid = p.id
        LEFT JOIN (
          SELECT size, productid, currency, price FROM price
          UNION ALL
          SELECT size, productid, currency, price FROM pricepack
        ) pr ON ohp.productid = pr.productid AND ohq.size = pr.size
        WHERE oh.userid = $1
        ORDER BY oh.date DESC`,
        [userId]
      );
  
      const rawOrderHistory = result.rows;
  
      const orderHistoryMap = new Map();
  
      rawOrderHistory.forEach(row => {
        const { order_id, OrderDate, CartListPrice, productId, ...productDetails } = row;
  
        if (!orderHistoryMap.has(order_id)) {
          orderHistoryMap.set(order_id, {
            order_id,
            OrderDate: new Date(OrderDate),
            CartListPrice,
            CartList: []
          });
        }
  
        const order = orderHistoryMap.get(order_id);
        const existingProduct = order.CartList.find(p => p.product.id === productId);
  
        const priceDetail = {
          size: row.size,
          currency: row.currency,
          price: parseFloat(row.price),
          quantity: row.quantity
        };
  
        if (existingProduct) {
          existingProduct.product.prices.push(priceDetail);
          existingProduct.product.ItemPrice += priceDetail.price * priceDetail.quantity;
        } else {
          order.CartList.push({
            id: productId,
            type: productDetails.type,
            product: {
              ...productDetails,
              prices: [priceDetail],
              ItemPrice: priceDetail.price * priceDetail.quantity
            }
          });
        }
      });
  
      const orderHistory = Array.from(orderHistoryMap.values());
  
      orderHistory.forEach(order => {
        const dateString = order.OrderDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeString = order.OrderDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        order.OrderDate = `${dateString}\n${timeString}`;
      });
  
      res.status(200).json({ message: 'Retrieved order history', orderHistory });
    } catch (err) {
      next(err);
    }
  });
  
  

  module.exports = router;
  