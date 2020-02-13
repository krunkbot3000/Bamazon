//=== NPM PACKAGES ===
var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');
const fs = require("fs");



var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Passw0rd!",
  database: "bamazon_db"
});

connection.connect(function (err) {
  if (err) throw err;
});


console.log("Hello World This is the BAMAZON app");



var showIt = function () {
  connection.query("SELECT * FROM products", function (err, res) {
    var table = new Table({
      head: ['Item ID', 'Product Name', 'Department', 'Price', 'Quantity Available']
    });
    console.log("Inventory List");
    for (var i = 0; i < res.length; i++) {
      table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
    }
    console.log(table.toString());
    console.log("------------------------------------")
  });
  connection.end();
};



var runSearch = function () {
  inquirer.prompt({
    name: "action",
    type: "list",
    message: "What would you like to do?",
    choices: ["Order Products", "Just Browse Available Products"]
  }).then(function (answer) {
    switch (answer.action) {
      case "Order Products":
        display();
        break;
      case "Just Browse Available Products":
        showIt();
        break;
    }
  })
}



var display = function () {
  connection.query("SELECT * FROM products", function (err, res) {
    var table = new Table({
      head: ['Item ID', 'Product Name', 'Department', 'Price', 'Quantity Available']
    });
    console.log("Inventory List");
    for (var i = 0; i < res.length; i++) {
      table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
    }
    console.log(table.toString());
    console.log("------------------------------------")

    inquirer.prompt([
      {
        name: "item_id",
        type: "input",
        message: "Input the ID of the product you want to purchase"
      },
      {
        name: "units",
        type: "input",
        message: "How many would you like to purchase?",
        validate: function (value) {
          if ((value) === true || value > res.stock_quantity + 1) {
            console.log("invalid");
          } else {
            return true;
          }
        }
      },
    ]).then(function (user) {
      console.log("User Buy Input: " + user.units);
      console.log("User product ID Input: " + user.item_id);




      //---- ASSIGN PRODUCT ---   
      var productID = parseInt(user.item_id);
      productID = productID - 1;
      var price = res[productID].price;
      console.log("Item Price" + " " + price)

      //--- QUANTITY CHECK  ---
      var qtyAvailable = res[productID].stock_quantity;
      console.log("In Stock" + " " + qtyAvailable);

      //=== CHECK ORDER ===
      if (user.units > qtyAvailable) {
        console.log("Insufficient Quantity");
      } else {

        //--- PRINT FINAL PRICE ---
        var finalPrice = user.units * price;
        console.log("Final price is: $" + finalPrice);
        console.log("Order placed! Expect Shipment in 10-12 business days");


        //=== CONNECT TO SQL/ UPDATE UNIT ===
        connection.query("Update products SET ? WHERE ?", [{
          stock_quantity: qtyAvailable - user.units
        }, {
          item_id: res[productID].item_id
        }], function (err, res) { });
      }
      showIt();
    });
  });
};


runSearch();
