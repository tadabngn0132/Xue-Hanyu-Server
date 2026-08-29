import express from "express";
import {
  getWord,
  createWord,
  updateWord,
  deleteWord,
} from "../controllers/index.js";

const router = express.Router();

router.get("/word/:id", getWord);
router.post("/word", createWord);
router.put("/word/:id", updateWord);
router.delete("/word/:id", deleteWord);

export default router;
