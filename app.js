const express = require("express");
const airports = require("./routes/alaska");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/apis", airports);

module.exports = app;
