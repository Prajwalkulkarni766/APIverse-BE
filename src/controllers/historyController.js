const History = require("../models/History");

const getHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const history = await History.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history", error: err.message });
  }
};

const deleteHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const history = await History.findById(id);

    if (!history) {
      return res.status(404).json({ message: "History not found" });
    }

    await history.deleteOne();
    res.status(200).json({ message: "History deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete history", error: err.message });
  }
};

const searchHistory = async (req, res) => {
  const { query } = req.query;
  const userId = req.user.id;

  try {
    const history = await History.find({
      userId,
      $or: [
        { url: { $regex: query, $options: "i" } },
        { method: { $regex: query, $options: "i" } },
        { statusCode: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to search history", error: err.message });
  }
};


module.exports = { getHistory, deleteHistory, searchHistory };