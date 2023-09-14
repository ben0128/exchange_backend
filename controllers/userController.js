const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = require("../routes/index");
const getUser = require("../utils/_helpers");
const getNextId = require("../utils/getId");
const { hashPassword, comparePassword } = require("../utils/bcrypt");

const userController = {
  signUp: async (req, res, next) => {
    const { email, password, checkPassword } = req.body;

    if (password !== checkPassword) {
      return res.status(200).json("兩次密碼輸入不同！");
    }

    if (password.length < 6) {
      return res.status(200).json("密碼長度不足6位數！");
    }

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(200).json("此信箱已註冊！");
      }
      const id = await getNextId("userId");
      const hashedPassword = await hashPassword(password);
      await User.create({ email, password: hashedPassword, id });

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
        return res.status(400).json("此信箱尚未註冊！");
      }
      const isMatch = comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json("密碼錯誤！");
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1 day",
      });
      return res.status(200).json({ token, user });
    } catch (err) {
      return res.status(500).json("伺服器錯誤！");
    }
  },
  getUser: (req, res, next) => {
    return res.status(200).json("取得使用者資料！");
  },
  logout: (req, res, next) => {
    return res.status(200).json("登出成功！");
  },
  putUser: (req, res, next) => {
    return res.status(200).json("修改使用者資料！");
  },
};

module.exports = userController;
