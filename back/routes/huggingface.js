import express from "express";
import { fetchAndProcessModels, getStoredModels } from "../controllers/huggingfaceController.js";

const router = express.Router();

// Route to fetch models from Hugging Face, process with Gemini and save to DB
router.get("/fetch", fetchAndProcessModels);

// Route to get stored models from our database
router.get("/", getStoredModels);

export default router;