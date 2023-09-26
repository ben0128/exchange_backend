const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = require("../routes/index");

const { hashPassword, comparePassword } = require("../utils/bcrypt");

const userController = {
  signUp: async (req, res, next) => {
    const { email, password, checkPassword } = req.body;

    if (password !== checkPassword) {
      return res.status(400).json("兩次密碼輸入不同！");
    }

    if (password.length < 6) {
      return res.status(400).json("密碼長度不足6位數！");
    }

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json("此信箱已註冊！");
      }
      const hashedPassword = await hashPassword(password);
      await User.create({ email, password: hashedPassword });
      return res.status(200).json("註冊成功！");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  signIn: async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email }).lean();
      if (!user) {
        return res.status(400).json("登入失敗！");
      }
      const isMatch = comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json("登入失敗！");
      }
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1 day",
      });
      res.cookie("token", token, {
        maxAge: 86400000,
        httpOnly: true,
        secure: true,
      });
      //導到 實際網址markets/allMarkets
      return res.status(200).json({ token });
    } catch (err) {
      return res.status(500).json("伺服器錯誤！");
    }
  },
  getUser: (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(200).json("無法取得使用者資料！");
    }
    const data = {
      email: user.email,
      account: user.account,
    };
    return res.status(200).json(data);
  },
  putUser: async (req, res, next) => {
    const { password, checkPassword } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(200).json("無法取得使用者資料！");
    }
    if (password !== checkPassword) {
      return res.status(400).json("兩次密碼輸入不同！");
    }
    try {
      const hash = await hashPassword(password);
      await User.findOneAndUpdate(
        { id: user.id },
        { password: hash, updatedAt: Date.now() }
      );
      return res.status(200).json("修改使用者資料！");
    } catch (err) {
      console.error(err);
      return res.status(500).json("無法修改資料！");
    }
  },
  googleLogin: async (req, res, next) => {
    const { email } = req.body;
    try {
      const user = User.findOne({ email }).lean();
      if (user) {
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1 day",
        });
        res.cookie("token", token, {
          maxAge: 86400000,
          httpOnly: true,
          secure: true,
        });
        return res.status(200).json({ token });
      } else {
        const hash = await hashPassword(generatePassword());
        const newUser = await User.create({ email, password: hash });
        console.log(newUser)
        const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
          expiresIn: "1 day",
        });
        res.cookie("token", token, {
          maxAge: 86400000,
          httpOnly: true,
          secure: true,
        });
        return res.status(200).json({ token });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json("伺服器錯誤！");
    }
  },
};

module.exports = userController;
