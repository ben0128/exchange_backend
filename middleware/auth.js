const passport = require("../config/passport");

const authenticator = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      console.error("JWT解析错误：", err);
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }
    if (!user) {
      console.error("未找到用户");
      return res.status(401).json({
        status: "error",
        message: "No user found",
      });
    }
    req.user = {
      id: user.id,
      email: user.email,
      account: user.account,
    };
    return next();
  })(req, res, next);
};

module.exports = authenticator