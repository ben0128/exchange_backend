const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const {
  comparePassword,
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

module.exports = passport;
