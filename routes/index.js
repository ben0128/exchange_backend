const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const authenticator = require("../middleware/auth");

const { apiErrorHandler } = require("../middleware/errorHandler");

const userController = require("../controllers/userController");
const targetController = require("../controllers/targetController");
const journalController = require("../controllers/journalController");
const orderController = require("../controllers/orderController");

// 登入、註冊相關
router.post("/signup", userController.signUp); // 註冊
router.post(
  "/signin",
  passport.authenticate("local", {
    session: false,
    failureFlash: true,
  }),
  userController.signIn
); // 登入

router.post("/auth/google", userController.googleLogin); // google登入

// 使用者相關
router.get("/user", authenticator, userController.getUser); // 取得使用者資料
router.put("/user", authenticator, userController.putUser); // 修改使用者資料

// 目標相關
router.get("/targets/isLiked", authenticator, targetController.isLiked); // 取得使用者是否喜愛目標
router.get("/targets", authenticator, targetController.getTargets); // 取得使用者喜愛目標
router.post("/targets", authenticator, targetController.addTarget); // 新增使用者喜愛目標
router.delete("/targets/:targetId", authenticator, targetController.deleteTarget); // 刪除使用者喜愛目標

// 日記相關
router.get("/journals", authenticator, journalController.getJournals); // 取得使用者日記
router.post("/journals", authenticator, journalController.addJournal); // 新增使用者日記
router.put("/journals/:journalId", authenticator, journalController.putJournal); // 修改使用者日記
router.delete(
  "/journals/:journalId",
  authenticator,
  journalController.deleteJournal
); // 刪除使用者日記

// 訂單相關
router.get("/orders", authenticator, orderController.getOrders); // 取得使用者訂單
router.post("/orders/limitOrder", authenticator, orderController.addLimitOrder); // 新增使用者訂單
router.post(
  "/orders/marketOrder",
  authenticator,
  orderController.addMarketOrder
); // 新增使用者訂單
router.put("/orders", authenticator, orderController.putOrder); // 修改使用者訂單
router.delete("/orders", authenticator, orderController.deleteOrder); // 刪除使用者訂單

router.use("/", apiErrorHandler); // 註冊錯誤處理器

module.exports = router;
