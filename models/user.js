const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAuth: {
    type: Boolean,
    default: false,
  },
  order: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Order", 
  },
  journal: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Journal",
  },
  favoriteTargets: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Target",
  },
  account: {
    type: Number,
    default: 1000000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
