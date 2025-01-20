const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  method: { type: String, required: true },
  url: { type: String, required: true },
  status: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("History", historySchema);
