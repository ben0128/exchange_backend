const User = require("../models/user");
const Order = require("../models/order");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const getNetShares = require("../utils/getNetShares");
const getTargetPrice = require("../utils/getTargetPrice");

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
  addMarketOrder: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const user = req.user;
    const { targetName, shares, type } = req.body;
    let updatedUser
    const newOrder = new Order({
      targetName,
      shares,
      type,
      userId: user.id,
      state: "completed",
      price: await getTargetPrice(targetName),
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
          {
            account: user.account - shares * newOrder.price,
          },
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
          {
            account: user.account + shares * newOrder.price,
          },
          {
            new: true,
            session,
          }
        );
      }

      await updatedUser.save({ session });
      await newOrder.save({ session });
      await session.commitTransaction();
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
      // 拿價錢和shares
      const oldOrder = await Order.findOne({ _id, userId: user.id }).lean();
      if (!oldOrder) {
        return res.status(400).json("指定訂單不存在或已完成！");
      }
      if (oldOrder.type === "buy") {
        if (user.account >= shares * price - oldOrder.shares * oldOrder.price) {
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
          const updatedUser = await User.findOneAndUpdate(
            { _id: user.id },
            {
              account:
                user.account +
                oldOrder.shares * oldOrder.price -
                shares * price,
            },
            { new: true, session }
          );
          await newOrder.save({ session });
          await updatedUser.save({ session });
          await session.commitTransaction();
          return res.status(200).json("修改訂單成功！");
        } else {
          session.abortTransaction();
          return res.status(400).json("餘額不足！");
        }
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    } finally {
      session.endSession();
    }
  },
  deleteOrder: async (req, res) => {
    const { _id } = req.body;
    const user = req.user;
    try {
      const deletedOrder = await Order.findOneAndDelete({
        _id,
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
