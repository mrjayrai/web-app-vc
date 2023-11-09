//db
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'AVNS_V8VLKjPWe1Yz_quI9MM',
  database: 'dorvi',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting ', err);
  } else {
    console.log('Connected ');
  }
});

module.exports = connection;

//db
