const User = require("../models/user");
const Order = require("../models/order");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const getNetShares = require("../utils/getNetShares");


const orderController = {
  getOrders: async (req, res) => {
    try {
      const user = req.user;
      const order = await Order.find({ userId: user.id }).lean();
      return res.status(200).json({ order });
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  addLimitOrder: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const user = req.user;
    const { targetName, shares, price, type } = req.body;
    try {
      const newOrder = new Order({
        targetName,
        shares,
        price,
        type,
        userId: user.id,
        state: "pending",
      });
      if (type === "buy") {
        if (user.account < shares * price) {
          return res.status(400).json("餘額不足！");
        }
  
        const updatedUser = await User.findOneAndUpdate(
          { _id: user.id },
          { account: user.account - shares * price },
          { new: true, session }
        );
        await updatedUser.save({ session });
      }
      if (type === "sell") {
        const netShares = (await getNetShares(targetName)) || 0;
        // console.log("netShares", netShares)
        if (netShares < shares) {
          return res.status(400).json("賣出後的股數不得為負數！");
        }
      }
      await newOrder.save({ session });
      await session.commitTransaction();
      return res.status(201).json("新增限價單成功！");
    } catch (err) {
      await session.abortTransaction();
      return res.status(500).json(err);
    } finally {
      session.endSession();
    }
  },
  // addMarketOrder: async (req, res) => {
  //   const session = await mongoose.startSession();
  //   session.startTransaction();
  //   const user = req.user;
  //   const { targetName, shares, type } = req.body;
  //   try {
  //     if (type === 'buy') {
  //       const updatedUser = await User.findOneAndUpdate(
  //         { _id: user.id },
  //         { account: user.account - shares * 100 },
  //         { new: true, session }
  //       );
  //       await updatedUser.save({ session });
  //     }
  //   } catch (err) {

  //   }
  // },
  putOrder: async (req, res) => {
    const { shares, price, id } = req.body;
    const user = req.user;
    try {
      // 拿價錢和shares
      const oldOrder = await Order.findOne({ _id: id, userId: user.id }).lean();
      if (!oldOrder) {
        return res.status(400).json("指定訂單不存在或已完成！");
      }
      if (oldOrder.type === "buy") {
        if (user.account >= shares * price - oldOrder.shares * oldOrder.price) {
          const session = await mongoose.startSession();
          session.startTransaction();
          const newOrder = await Order.findOneAndUpdate(
            {
              _id: id,
              state: "pending",
              userId: user.id,
            },
            {
              shares,
              price,
              updatedAt: Date.now(),
            },
            { new: true, session }
          );
          const updatedUser = await User.findOneAndUpdate(
            { _id: user.id },
            {
              account:
                user.account +
                oldOrder.shares * oldOrder.price -
                shares * price,
            },
            { new: true, session }
          ).populate("orders");
          await newOrder.save({ session });
          await updatedUser.save({ session });
          await session.commitTransaction();
          return res.status(200).json("修改訂單成功！");
        } else {
          session.abortTransaction();
          session.endSession();
          return res.status(400).json("餘額不足！");
        }
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  deleteOrder: async (req, res) => {
    const { id } = req.body;
    const user = req.user;
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
