import { fetchHuggingFaceModels, fetchModelReadme } from "../services/huggingfaceService.js";
import { generateModelSummary } from "../services/geminiService.js";
import ModelData from "../models/modeldata.js";
import mongoose from "mongoose";
/**
 * Fetch models from Hugging Face, generate summaries with Gemini, and save to DB
 */
export const fetchAndProcessModels = async (req, res) => {
  try {
    await ModelData.deleteMany({});
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    // Step 1: Fetch models from Hugging Face
    const models = await fetchHuggingFaceModels(limit);
    
    // Step 2: Process each model with Gemini and save to DB
    const processedModels = await Promise.all(
      models.map(async (model) => {
        // Check if model already exists in our database
        let existingModel = await ModelData.findOne({ hf_modelId: model.modelId });
        
        if (!existingModel) {
          // Fetch README content
          const readmeContent = await fetchModelReadme(model.modelId);
          
          // Generate description using Gemini
          const description = await generateModelSummary(readmeContent);
          
          // Create new model entry in database
          existingModel = await ModelData.create({
            // Common fields
            common_title: model.modelId.split('/').pop(),
            common_platform: "Hugging Face",
            common_link: model.link,
            common_description: description,
            common_summary: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
            common_tags: model.tags,
            common_type: model.library_name,
            
            // Hugging Face specific
            hf_modelId: model.modelId,
            
            // Source data
            sourceData: model.rawData,
          });
        }
        
        return {
          id: existingModel._id,
          platform: "Hugging Face",
          title: existingModel.common_title,
          createdAt: existingModel.createdAt,
          summary: existingModel.common_summary,
          tags: existingModel.common_tags,
          link: existingModel.common_link,
          likes: existingModel.likes,
          downloads: model.downloads,
          library_name: model.library_name
        };
      })
    );
    
    return res.status(200).json(processedModels);
  } catch (error) {
    console.error("Error in fetchAndProcessModels:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get models that have already been processed and stored in our DB
 */
export const getStoredModels = async (req, res) => {
  try {
    const models = await ModelData.find({ common_platform: "Hugging Face" });
    
    const formattedModels = models.map(model => ({
      id: model._id,
      platform: model.common_platform,
      title: model.common_title,
      createdAt: model.createdAt,
      summary: model.common_summary,
      tags: model.common_tags,
      link: model.common_link,
      likes: model.likes,
      hf_modelId: model.hf_modelId
    }));
    
    return res.status(200).json(formattedModels);
  } catch (error) {
    console.error("Error in getStoredModels:", error);
    return res.status(500).json({ error: error.message });
  }
};