const express = require("express");
const {
  createEnvironment,
  getAllEnvironments,
  getEnvironmentById,
  updateEnvironment,
  deleteEnvironment,
} = require("../controllers/environmentController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createEnvironment);
router.get("/", authMiddleware, getAllEnvironments);
router.get("/:id", authMiddleware, getEnvironmentById);
router.put("/:id", authMiddleware, updateEnvironment);
router.delete("/:id", authMiddleware, deleteEnvironment);

module.exports = router;
