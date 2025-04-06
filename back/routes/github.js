import express from "express";
import { fetchAndProcessRepos, getStoredRepos } from "../controllers/githubController.js";

const router = express.Router();

// Route to fetch repositories from GitHub, process with Gemini and save to DB
router.get("/fetch", fetchAndProcessRepos);

// Route to get stored repositories from our database
router.get("/", getStoredRepos);

export default router;