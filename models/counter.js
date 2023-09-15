const mongoose = require("mongoose"); // 載入 mongoose

const counterSchema = new mongoose.Schema({
  seq: {
    type: Number,
    default: 0
  }
})

const Counter = mongoose.model("Counter", counterSchema)

module.exports = Counter