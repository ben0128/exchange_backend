//插入種子資料
const db = require("../../config/mongoose");
const User = require("../user");
const getNextId = require("../../utils/getId");
const Order = require("../order");

const createUser = async () => {
  try {
    const userId = await getNextId("userId");
    const newUser = new User({
      id: userId,
      email: "1455454342@example.com",
      password: "123456",
    });
    const orderId = await getNextId("orderId");
    const newOrder = new Order({
      id: orderId,
      userId: 1,
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
