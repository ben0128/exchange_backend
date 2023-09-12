const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const bcryptUtils = require("../utils/bcrypt");
const User = require("../models/user");

module.exports = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passReqToCallback: true,
        failureFlash: true,
      },
      (req, email, password, done) => {
        User.findOne({ email })
          .then((user) => {
            if (!user) {
              return done(
                null,
                false,
                req.flash("warning_msg", "That email is not registered!")
              );
            }
            return bcryptUtils
              .comparePassword(password, user.password)
              .then((isMatch) => {
                if (!isMatch) {
                  return done(
                    null,
                    false,
                    req.flash("warning_msg", "Email or Password incorrect.")
                  );
                }
                return done(null, user);
              });
          })
          .then((err) => done(err, false));
      }
    )
  );
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: process.env.BASE_URL,
        profileFields: ["email", "displayName"],
      },
      (accessToken, refreshToken, profile, done) => {
        const { email } = profile._json;
        User.findOne({ email }).then((user) => {
          if (user) return done(null, user);
          bcryptUtils
            .generatePassword()
            .then((randomPassword) => {
              return bcryptUtils.hashPassword(randomPassword);
            })
            .then((hash) => User.create({ email, password: hash }))
            .then((user) => done(null, user))
            .catch((err) => done(err, false));
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .lean()
      .then((user) => done(null, user))
      .catch((err) => done(err, false));
  });
};