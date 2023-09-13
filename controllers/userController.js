const jwt = require("jsonwebtoken");
const User = require("../models/user");

const { getUser } = require("../_helpers");
const { hashPassword } = require("../utils/bcrypt");

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
  
      const hashedPassword = await hashPassword(password);
      await User.create({ email, password: hashedPassword });
  
      return res.status(200).json("註冊成功！");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  signIn:  (req, res, next) => {
    return res.status(200).json("登入成功！");
  },
  getUser:  (req, res, next) => {
    return res.status(200).json("取得使用者資料！");
  },
  logout:  (req, res, next) => {
    return res.status(200).json("登出成功！");
  },
  putUser:  (req, res, next) => {
    return res.status(200).json("修改使用者資料！");
  },
};

module.exports = userController;