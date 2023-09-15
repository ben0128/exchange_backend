const mongoose = require("mongoose");

const TargetSchema = new mongoose.Schema({
  targetName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Target = mongoose.model(
  "Target",
  TargetSchema
);

module.exports = Target;
