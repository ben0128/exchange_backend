const Counter = require("../models/counter");

// 函數用於獲取下一個可用的 ID
const getNextId = async (counterName) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: counterName },
      { $inc: { seq: 1 } },
      { new: true }
    );

    if (!counter) {
      // 如果計數器不存在，創建一個新的計數器
      const newCounter = new Counter({
        _id: counterName,
        seq: 1,
      });
      await newCounter.save();
      return 1; // 返回第一個 ID
    }

    return counter.seq;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = getNextId;
