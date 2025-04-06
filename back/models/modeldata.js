import mongoose from "mongoose";

const ModelDataSchema = new mongoose.Schema({
  // 🔁 Common fields across all platforms
  common_title: String,
  common_platform: String,     // e.g. "Hugging Face", "arXiv", "GitHub"
  common_link: String,
  common_description: String,
  common_summary: String,
  common_tags: [String],       // e.g. ["LLM", "NLP", "multimodal"]
  common_type: String,         // e.g. "LLM", "CV", etc.

  // 🤗 Hugging Face specific
  hf_modelId: String,

  // 📚 arXiv specific
  arxiv_authors: String,
  arxiv_published: Date,

  // 🐙 GitHub specific
  github_name: String,

  // 🧪 Optional: Full raw response from APIs
  sourceData: Object,

  likes: {
    type: Number,
    default: 0,
  },

  comments: [
    {
      user: String, // or mongoose.Schema.Types.ObjectId if you have a User model
      text: String,
      timestamp: {
        type: Date,
        default: Date.now,
      }
    }
  ],


}, { timestamps: true });

export default mongoose.model("ModelData", ModelDataSchema);
