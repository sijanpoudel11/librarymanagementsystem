var passport = require("passport");
var localstrategy = require("passport-local").Strategy;
var admin = require("../models/adminschema");
var bcrypt = require("bcryptjs");

module.exports = function(passport) {
  passport.serializeUser(function(admin, done) {
    done(null, admin.id);
  });

  passport.deserializeUser(function(id, done) {
    admin.findById(id, function(err, admin) {
      done(err, admin);
    });
  });

  passport.use(
    "login",
    new localstrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true
      },
      function(req, username, password, done) {
        admin.findOne({ username: username }, function(err, user) {
          if (err) {
            return done(err);
          }

          if (!user) {
            console.log("no user found");
            req.flash("loginerror","Please Enter Correct Username And Password");
            return done(null, false);
          }

          if (!bcrypt.compareSync(password, user.password)) {
            console.log("password do not match");
            req.flash("loginerror","Please Enter Correct Username And Password");
            return done(null, false);
          }
          if (user) {
            console.log(user);
            return done(null, user);
          }
        });
      }
    )
  );
};
