const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8000;

//creating connection with mongodb
const connectToMongo = require("./database");
connectToMongo();

//configuting the dotenv
const dotenv = require('dotenv');
dotenv.config();

//serve static files
app.use("/static", express.static("static")); 
app.use(express.urlencoded());

//setting the template engine as html
var cons = require("consolidate");
app.engine("html", cons.swig);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

//main route


// different routes
app.use(require("./routes/render"));
app.use(require("./routes/auth"));

// starting the server
app.listen(port, () => {
  console.log(`The application started successfully on port ${port}`);
});
