var mysql = require("mysql");

var connection = mysql.createConnection({
  user: "root",
  password: "Passw0rd!",
  host: "localhost",
  port: 3306,
  database: "Bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
});

module.exports = connection;