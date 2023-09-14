const User = require("../models/user");
const Order = require("../models/order");
const getNextId = require("../utils/getId");
const getUser = require("../utils/_helpers");

const orderController = {
  getOrders: (req, res) => {
    const user = getUser(req);
    // console.log("user", user);
    Order.find({ userId: user.id })
      .lean()
      .then((orders) => {
        return res.status(200).json({ orders });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json(err);
      });
  },
  addOrder: async (req, res) => {
    const user = getUser(req);
    const { targetName, shares, price, type } = req.body;
    try {
      await Order.create({
        id: await getNextId("orderId"),
        targetName,
        shares,
        price,
        type,
        userId: user.id,
        state: "pending",
      });
      // console.log("order", order);
      return res.status(200).json("新增訂單成功！");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  putOrder: async (req, res) => {
    const { shares, price, id } = req.body;
    const user = getUser(req);
    try {
      // 需要先檢查這張訂單是否是pending狀態
      const updatedOrder = await Order.findOneAndUpdate(
        { id, state: "pending", userId: user.id },
        { shares, price, updatedAt: Date.now() }
      );
      if (!updatedOrder) {
        return res.status(400).json("修改訂單失敗！");
      }
      return res.status(200).json("修改訂單成功！");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  deleteOrder: async (req, res) => {
    const { id } = req.body;
    const user = getUser(req);
    try {
      const deletedOrder = await Order.findOneAndDelete({
        id,
        state: "pending",
        userId: user.id,
      });
      if (!deletedOrder) {
        return res.status(400).json("指定訂單不存在或已完成！");
      }
      return res.status(200).json("刪除訂單成功！");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
};

module.exports = orderController;
