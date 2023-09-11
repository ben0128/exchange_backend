const express = require("express");
const session = require("express-session");
const usePassport = require("./config/passport");
// const flash = require("connect-flash");
const methodOverride = require("method-override");
const routes = require("./routes");
const app = express();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

require("./config/mongoose");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

usePassport(app);
// app.use(flash());
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user;
  // res.locals.success_msg = req.flash("success_msg");
  // res.locals.warning_msg = req.flash("warning_msg");
  next();
})

app.use(routes);

app.listen(process.env.PORT, () => {
  console.log(`App is running on http://localhost:${process.env.PORT}`);
})