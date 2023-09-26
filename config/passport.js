const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const {
  comparePassword,
  generatePassword,
  hashPassword,
} = require("../utils/bcrypt");
const User = require("../models/user");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
require("dotenv").config();

//登入
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "使用者不存在" });
        }
        const isMatch = comparePassword(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "密碼不正確" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

//註冊
const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || "secret",
};

passport.use(
  new JWTStrategy(jwtOptions, (jwt_payload, cb) => {
    //解析token
    const { _id } = jwt_payload;
    User.findOne({ _id })
      .lean()
      .then((user) => cb(null, user))
      .catch((err) => cb(err, false));
  })
);

// facebook登入
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: process.env.BASE_URL,
      profileFields: ["email", "displayName"],
    },
    (accessToken, refreshToken, profile, cb) => {
      const { email } = profile._json;
      User.findOne({ email }).then((user) => {
        if (user) return cb(null, user);
        generatePassword()
          .then((randomPassword) => {
            return hashPassword(randomPassword);
          })
          .then((hash) => User.create({ email, password: hash }))
          .then((user) => cb(null, user))
          .catch((err) => cb(err, false));
      });
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
      passReqToCallback: true,
    },
    (_, _, _, profile, done) => {
      const { email } = profile._json;
      User.findOne({ email }).then((user) => {
        if (user) return done(null, user);
        generatePassword()
          .then((randomPassword) => {
            return hashPassword(randomPassword);
          })
          .then((hash) => User.create({ email, password: hash }))
          .then((user) => done(null, user))
          .catch((err) => done(err, false));
      });
    }
  )
);

//序列化
passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

//反序列化
passport.deserializeUser((_id, cb) => {
  User.findOne({ _id })
    .lean()
    .then((user) => {
      if (!user) {
        console.error("未找到用户");
        return cb(null, null);
      }
      // console.log(user);
      cb(null, user);
    })
    .catch((err) => cb(err, null));
});

module.exports = passport;
