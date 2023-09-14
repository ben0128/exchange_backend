const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    default: Date.now,
  },
  targetName: {
    type: String,
    required: true,
  },
  shares: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["buy", "sell"],
    required: true,
  },
  state: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    type: Number,
    ref: "User",
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
