const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
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
    type: [mongoose.Schema.Types.ObjectId], // 如果是关联到其他数据，请使用对应的数据类型
    ref: 'Order', // 可能关联到的订单模型
  },
  journal: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Journal', // 可能关联到的日记模型
  },
  favoriteTargets: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Targets', // 可能关联到的喜爱目标模型
  },
  createdAt: {
    type: Date,
    default: Date.now //伺服器將註冊資料送給資料庫時，執行 Date.now 並產生當下的時間戳記。如果是Date.now()則會紀錄專案生成Schema時的時間
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User