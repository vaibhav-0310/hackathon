import express from "express";
import huggingfaceRoutes from "./huggingface.js";
import arxivRoutes from "./arxiv.js";
import githubRoutes from "./github.js";

const router = express.Router();

// Platform-specific routes
router.use("/huggingface", huggingfaceRoutes);
router.use("/arxiv", arxivRoutes);
router.use("/github", githubRoutes);

// Combined models route
router.get("/models", async (req, res) => {
  try {
    const ModelData = (await import("../models/modeldata.js")).default;
    const limit = req.query.limit ? parseInt(req.query.limit) : 30;
    
    const models = await ModelData.find({})
      .sort({ createdAt: -1 })
      .limit(limit);
    
    const formattedModels = models.map(model => ({
      id: model._id,
      platform: model.common_platform,
      title: model.common_title,
      createdAt: model.createdAt,
      summary: model.common_summary,
      tags: model.common_tags,
      link: model.common_link
    }));
    
    return res.status(200).json(formattedModels);
  } catch (error) {
    console.error("Error fetching models:", error);
    return res.status(500).json({ error: error.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const ModelData = (await import("../models/modeldata.js")).default;

    // Case-insensitive regex search on 3 fields
    const regex = new RegExp(q, "i");

    const models = await ModelData.find({
      $or: [
        { common_title: regex },
        { common_description: regex },
        { common_summary: regex }
      ]
    }).limit(20);

    const formattedModels = models.map(model => ({
      id: model._id,
      platform: model.common_platform,
      title: model.common_title,
      createdAt: model.createdAt,
      summary: model.common_summary,
      tags: model.common_tags,
      link: model.common_link
    }));

    return res.status(200).json(formattedModels);
  } catch (error) {
    console.error("Error searching models:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;