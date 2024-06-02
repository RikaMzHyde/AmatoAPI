
require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Importación del módulo 'pg'
const { Pool } = require('pg');

// Configuración de la conexión a la base de datos
// LOCAL
/*const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '123',
  port: 5432,
});*/

console.log('Starting server...');
console.log('Environment Variables:', {
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: process.env.DATABASE_PORT,
  DATABASE_NAME: process.env.DATABASE_NAME,
  DATABASE_SSL_CA: process.env.DATABASE_SSL_CA ? '[CA provided]' : '[No CA]'
});
// SERVER
const config = {
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  ssl: {
      rejectUnauthorized: true,
      ca: process.env.DATABASE_SSL_CA,
  },
};
const pool = new Pool(config);

// VAR ROUTES
var productRouter = require('./routes/product');
var packRouter = require('./routes/pack');
var favouriteRouter = require('./routes/favourite');

var app = express();



// Almacenamos la conexión a la base de datos en la aplicación
app.set('db', pool);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
app.use('/product', productRouter);
app.use('/pack', packRouter);
app.use('/favourite', favouriteRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


// Función para verificar la conexión a la base de datos
async function checkDatabaseConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows);
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

// Verificar la conexión a la base de datos al iniciar el servidor
checkDatabaseConnection();