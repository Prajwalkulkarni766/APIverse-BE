const express = require("express");
const { getHistory, deleteHistory } = require("../controllers/historyController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getHistory);
router.delete("/:id", authMiddleware, deleteHistory);
router.get("/search", authMiddleware, searchHistory);

module.exports = router;
