const User = require("../models/user");
const Order = require("../models/order");
const mongoose = require("mongoose");
const getNetShares = require("../utils/getNetShares");
const getTargetPrice = require("../utils/getTargetPrice");
const axios = require("axios");

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
    let isTransactionSuccess = false;
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
          { account: user.account - shares * price },
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
      // 將訂單資訊傳送到colab做webhook
      console.log(orderId.toString(), targetName, price, type)
      const axiosResponse = await axios.post(
        "https://7e1a-34-81-137-91.ngrok.io/api/receive_order",
        {
          id: orderId.toString(),
          targetName: targetName,
          price: price,
          type: type,
        }
      );

      console.log(axiosResponse.data);
      await newOrder.save({ session });
      await session.commitTransaction();
      isTransactionSuccess = true;
      return res.status(201).json("新增限價單成功！");
    } catch (err) {
      if (!isTransactionSuccess) {
        await session.abortTransaction();
      }
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
      return res.status(201).json("新增市價單成功！");
    } catch (err) {
      await session.abortTransaction();
      return res.status(500).json(err);
    } finally {
      session.endSession();
    }
  },
  completeLimitOrder: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const _id = req.params.orderId;
    const type = req.body.type;
    try {
      // 如果是限價賣單，就要增加餘額，買單則不用
      if (!_id) {
        return res.status(400).json("請輸入訂單id！");
      }
      if (type === "buy") {
        await Order.findOneAndUpdate({ _id }, { state: "completed" });
      } else if (type === "sell") {
        // 更新user餘額，和order狀態
        const completedOrder = await Order.findOneAndUpdate(
          { _id },
          { state: "completed" },
          { new: true, session }
        );
        //需要將原始的餘額加上賣出的股票價格
        await User.findOneAndUpdate(
          { _id: completedOrder.userId },
          { $inc: { account: completedOrder.shares * completedOrder.price } }
        );
      }
      await session.commitTransaction();
      return res.status(200).json("完成訂單成功！");
    } catch (err) {
      console.error(err);
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
      // 检查旧订单是否存在
      const oldOrder = await Order.findOne({ _id, userId: user.id }).lean();
      if (!oldOrder) {
        await session.abortTransaction();
        return res.status(400).json("指定訂單不存在或已完成！");
      }

      let updatedUserAccount = user.account;
      if (oldOrder.type === "buy") {
        // 检查余额是否足够
        if (user.account >= shares * price - oldOrder.shares * oldOrder.price) {
          updatedUserAccount +=
            oldOrder.shares * oldOrder.price - shares * price;
        } else {
          await session.abortTransaction();
          return res.status(400).json("餘額不足！");
        }
      }

      // 更新订单
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

      // 检查更新是否成功
      if (!newOrder) {
        await session.abortTransaction();
        return res.status(400).json("指定訂單不存在或已完成！");
      }

      // 更新用户余额
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
          {
            account: user.account + deletedOrder.shares * deletedOrder.price,
          },
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
