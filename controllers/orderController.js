const User = require("../models/user");
const Order = require("../models/order");
const mongoose = require("mongoose");
const getNetShares = require("../utils/getNetShares");
const getTargetPrice = require("../utils/getTargetPrice");
require("dotenv").config();

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
    const orderId = new mongoose.Types.ObjectId();
    try {
      const newOrder = new Order({
        _id: orderId,
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
          { $inc: { account: -shares * price } },
          { new: true, session }
        );
        await updatedUser.save({ session });
      }
      if (type === "sell") {
        const netShares = (await getNetShares(targetName)) || 0;
        if (netShares < shares) {
          return res.status(400).json("賣出後的股數不得為負數！");
        }
      }
      console.log(newOrder)
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
  addMarketOrder: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const user = req.user;
    const { targetName, shares, type } = req.body;
    let updatedUser;
    const newOrder = new Order({
      targetName,
      shares,
      type,
      userId: user.id,
      state: "completed",
      price: (await getTargetPrice(targetName)) || 180,
    });
    try {
      if (type === "buy") {
        if (user.account < shares * newOrder.price) {
          return res.status(400).json("餘額不足！");
        }
        updatedUser = await User.findOneAndUpdate(
          {
            _id: user.id,
          },
          { $inc: { account: -shares * newOrder.price } },
          {
            new: true,
            session,
          }
        );
      }
      if (type === "sell") {
        const netShares = (await getNetShares(targetName)) || 0;
        if (netShares < shares) {
          return res.status(400).json("賣出後的股數不得為負數！");
        }
        updatedUser = await User.findOneAndUpdate(
          {
            _id: user.id,
          },
          { $inc: { account: +shares * newOrder.price } },
          {
            new: true,
            session,
          }
        );
      }
      console.log(updatedUser)
      await updatedUser.save({ session });
      await newOrder.save({ session });
      await session.commitTransaction();
      return res.status(201).json("新增市價單成功！");
    } catch (err) {
      await session.abortTransaction();
      return res.status(500).json(err);
    } finally {
      session.endSession();
    }
  },
  putOrder: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const { shares, price, _id } = req.body;
    const user = req.user;
    try {
      const oldOrder = await Order.findOne({ _id, userId: user.id }).lean();
      if (!oldOrder) {
        await session.abortTransaction();
        return res.status(400).json("指定訂單不存在或已完成！");
      }

      let updatedUserAccount = user.account;
      if (oldOrder.type === "buy") {
        // 檢查餘額是否足夠
        if (user.account >= shares * price - oldOrder.shares * oldOrder.price) {
          updatedUserAccount +=
            oldOrder.shares * oldOrder.price - shares * price;
        } else {
          await session.abortTransaction();
          return res.status(400).json("餘額不足！");
        }
      }

      // 更新訂單
      const newOrder = await Order.findOneAndUpdate(
        {
          _id,
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

      if (!newOrder) {
        await session.abortTransaction();
        return res.status(400).json("指定訂單不存在或已完成！");
      }

      // 更新user餘額
      await User.findOneAndUpdate(
        { _id: user.id },
        {
          account: updatedUserAccount,
        },
        { new: true, session }
      );

      await session.commitTransaction();
      return res.status(200).json("修改訂單成功！");
    } catch (err) {
      console.error(err);
      await session.abortTransaction();
      return res.status(500).json(err);
    } finally {
      session.endSession();
    }
  },
  deleteOrder: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const _id = req.params.orderId;
    const user = req.user;
    try {
      const deletedOrder = await Order.findOneAndDelete(
        {
          _id,
          userId: user.id,
        },
        { session }
      );
      //如果訂單是買單，則退還餘額、賣單的話就不用更新餘額
      if (deletedOrder.type === "buy") {
        await User.findOneAndUpdate(
          { _id: user.id },
          { $inc: { account: +deletedOrder.shares * deletedOrder.price } },
          { new: true, session }
        );
      }
      if (!deletedOrder) {
        return res.status(400).json("指定訂單不存在或已完成！");
      }
      await session.commitTransaction();
      return res.status(200).json("刪除訂單成功！");
    } catch (err) {
      await session.abortTransaction();
      console.error(err);
      return res.status(500).json(err);
    } finally {
      await session.endSession();
    }
  },
};

module.exports = orderController;
