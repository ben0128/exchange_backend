const express = require("express");
const passport = require("passport");
const cors = require("cors");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const router = require("./routes/index");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();

require("./config/mongoose");

app.use(cors({
  origin: ['http://localhost:8080', 'https://accounts.google.com', 'https://exchange-frontend-tawny.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(flash());
app.use(passport.initialize());
app.use("/api", router);

app.listen(port, () => {
  console.log(`App is running on ${port}`);
});

module.exports = app;