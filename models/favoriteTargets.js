const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoriteTargetsSchema = new Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
})