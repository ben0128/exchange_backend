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
      await Target.create({
        targetName,
        userId: user.id,
      });
      return res.status(200).json("新增目標成功！");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  deleteTarget: async (req, res) => {
    const { id } = req.body;
    const user = req.user;
    try {
      await Target.findOneAndDelete({
        _id: id,
        userId: user.id,
      });
      return res.status(200).json("刪除目標成功！");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
};

module.exports = targetController;
