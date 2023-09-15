//插入種子資料
const db = require("../../config/mongoose");
const User = require("../user");
// const getNextId = require("../../utils/getId");
const { hashedPassword } = require("../../utils/bcrypt");
const Order = require("../order");
const { hash } = require("bcryptjs");

const createUser = async () => {
  try {
    const newUser = new User({
      email: "1455454hhh342@example.com",
      password: await hashedPassword("123456"),
      account: 1000000,
    });
    const newOrder = new Order({
      userId: newUser._id,
      targetName: "AAPL",
      shares: 4,
      price: 180,
      type: "buy",
      state: "pending",
    });
    console.log("newUser", newUser);
    await newUser.save();
    console.log("seed user done");
    console.log("newOrder", newOrder);
    await newOrder.save();
    console.log("seed order done");
  } catch (err) {
    console.log("seed user error");
  } finally {
    db.close();
    console.log("db connection closed");
  }
};

createUser();
