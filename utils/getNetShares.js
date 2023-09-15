const Order = require("../models/order");

const calculateNetShares = async (targetName) => {
  try {
    const pipeline = [
      {
        $match: {
          targetName: targetName, // 替换为您的目标名称
          state: { $in: ["pending", "completed"] }, // 仅考虑待处理和已完成订单,
          type: { $in: ["buy", "sell"] }, // 仅考虑买入和卖出订单
        },
      },
      {
        $group: {
          _id: "$targetName",
          buyShares: {
            $sum: {
              $cond: [{ $eq: ["$type", "buy"] }, "$shares", 0],
            },
          },
          sellShares: {
            $sum: {
              $cond: [{ $eq: ["$type", "sell"] }, "$shares", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          buyShares: 1,
          sellShares: 1,
        },
      },
    ];
    const result = await Order.aggregate(pipeline);
    // console.log("result", result);
    const netShares = (result[0].buyShares - result[0].sellShares) || 0;
    return netShares;
  } catch (error) {
    console.error("发生错误:", error);
  }
};

module.exports = calculateNetShares;
