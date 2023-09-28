const Target = require("../models/target");

const targetController = {
  getTargets: async (req, res) => {
    const user = req.user;
    try {
      const targets = await Target.find({ userId: user.id }).lean();
      return res.status(200).json({ targets });
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  addTarget: async (req, res) => {
    const user = req.user;
    const { targetName } = req.body;
    try {
      const target = await Target.findOne({ targetName, userId: user.id });
      if (!target) {
        await Target.create({
          targetName,
          userId: user.id,
        });
        return res.status(200).json("成功加入收藏！");
      } else {
        return res.status(200).json("目標已經加入收藏！");
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  deleteTarget: async (req, res) => {
    const targetId = req.params.targetId;
    const user = req.user;
    try {
      await Target.findOneAndDelete({
        _id: targetId,
        userId: user.id,
      });
      return res.status(200).json("刪除目標成功！");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  isLiked: async (req, res) => {
    const user = req.user;
    const { target } = req.body
    try {
      const status = await Target.findOne({ userId: user.id, targetName: target }).lean();
      if (status) {
        return res.status(200).json(true);
      } else {
        return res.status(200).json(false);
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  }
};

module.exports = targetController;
