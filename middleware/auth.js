const passport = require("../config/passport");

const authenticator = (req, res, next) => {
  passport.authenticate(
    "jwt",
    {
      session: false,
    },
    (err, user) => {
      if (err) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
      }
      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "No user found",
        });
      }

      req.user = user;
      return next();
    }
  )(req, res, next);
};

module.exports = authenticator