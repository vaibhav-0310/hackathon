import axios from "axios";

/**
 * Service for interacting with the Hugging Face API
 */
export const fetchHuggingFaceModels = async (limit = 10) => {
  try {
    const response = await axios.get(`https://huggingface.co/api/models?limit=${limit}`);
    
    if (!response.data || response.data.length === 0) {
      throw new Error("No models found");
    }
    
    // Transform the data to match our schema
    const transformedModels = response.data.map(model => ({
      modelId: model.modelId,
      link: `https://huggingface.co/${model.modelId}`,
      likes: model.likes || 0,
      downloads: model.downloads || 0,
      tags: model.tags || [],
      library_name: model.pipeline_tag || model.library_name || null,
      rawData: model, // Store the complete raw data
    }));
    
    return transformedModels;
  } catch (error) {
    console.error("Error fetching Hugging Face models:", error.message);
    throw error;
  }
};

/**
 * Fetch README for a specific model
 */
export const fetchModelReadme = async (modelId) => {
  try {
    const readmeUrl = `https://huggingface.co/${modelId}/raw/main/README.md`;
    const response = await axios.get(readmeUrl);
    return response.data;
  } catch (error) {
    console.error(`Error fetching README for ${modelId}:`, error.message);
    return null; // Return null if README not found
  }
};