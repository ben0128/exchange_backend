const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const authenticator = require("../middleware/auth");

const { apiErrorHandler } = require('../middleware/errorHandler')

const userController = require("../controllers/userController");
// const targetController = require("../controllers/targetController");
// const journalController = require("../controllers/journalController");
// const orderController = require("../controllers/orderController");

// 使用者相關
router.post(
  "/signup",
  userController.signUp
); // 註冊
router.post('/signin', passport.authenticate("local", {
  session: false,
  failureMessage: true,
}), userController.signIn) // 登入
router.get('/user', userController.getUser) // 取得使用者資料
router.put('/user', userController.putUser) // 修改使用者資料
router.get('/logout', userController.logout) // 登出

// // 目標相關
// router.get('/targets', authenticator, targetController.getTargets) // 取得使用者喜愛目標
// router.post('/targets', authenticator, targetController.addTarget) // 新增使用者喜愛目標
// router.delete('/targets/:targetId', authenticator, targetController.deleteTarget) // 刪除使用者喜愛目標

// // 日記相關
// router.get('/journals', authenticator, journalController.getJournals) // 取得使用者日記
// router.post('/journals', authenticator, journalController.addJournal) // 新增使用者日記
// router.put('/journals/:journalId', authenticator, journalController.putJournal) // 修改使用者日記
// router.delete('/journals/:journalId', authenticator, journalController.deleteJournal) // 刪除使用者日記

// // 訂單相關
// router.get('/orders', authenticator, orderController.getOrders) // 取得使用者訂單
// router.post('/orders', authenticator, orderController.addOrder) // 新增使用者訂單
// router.put('/orders/:orderId', authenticator, orderController.putOrder) // 修改使用者訂單
// router.delete('/orders/:orderId', authenticator, orderController.deleteOrder) // 刪除使用者訂單

router.use('/', apiErrorHandler) // 註冊錯誤處理器

module.exports = router;