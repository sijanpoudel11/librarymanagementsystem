var express = require("express");
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var path = require("path");
var passport = require("passport");
var session = require("express-session");
var bcrypt = require("bcryptjs");
var auth = require("./passport/auth");
var router = require("./routes/route");
var flash = require('connect-flash');
var adminschema = require("./models/adminschema");
require("./passport/passport")(passport);

// MIDDLEWARES

var app = express();
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60
    }
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
mongoose
  .connect(
    "mongodb+srv://test1:test1@cluster0-cxzwg.mongodb.net/test?retryWrites=true&w=majority",
    { useUnifiedTopology: true, useNewUrlParser: true,useFindAndModify:false }
  )
  .then(() => {
    console.log("database connected");
  }).catch(err=>{
    console.log(err);
  })
//ROUTES

app.use("/", router);

// SERVER SETUP

app.listen("8000", (req, res) => {
  console.log("listening to port 8000");
});
