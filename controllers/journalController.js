const Journal = require("../models/journal");

const journalController = {
  getJournals: async (req, res) => {
    const user = req.user;
    try {
      const journals = await Journal.find({ userId: user.id }).lean();
      return res.status(200).json({ journals });
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  addJournal: async (req, res) => {
    const user = req.user;
    const { title, content } = req.body;
    try {
      await Journal.create({
        title,
        content,
        userId: user.id,
      });
      return res.status(200).json("新增日記成功！");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  putJournal: async (req, res) => {
    const { title, content } = req.body;
    const id = req.params.journalId;
    const user = req.user;
    try {
      const journal = await Journal.findOneAndUpdate(
        { _id: id, userId: user.id },
        { title, content, updatedAt: Date.now() },
        { new: true }
      );
      if (!journal) {
        return res.status(400).json("指定日記不存在！");
      }
      return res.status(200).json("更新日記成功！");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  deleteJournal: async (req, res) => {
    const id = req.params.journalId;
    const user = req.user;
    try {
      const journal = await Journal.findOneAndDelete({
        _id: id,
        userId: user.id,
      });
      if (!journal) {
        return res.status(400).json("指定日記不存在！");
      }
      return res.status(200).json("刪除日記成功！");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
};

module.exports = journalController;
