import mongoose from "mongoose";

const ModelDataSchema = new mongoose.Schema({

  common_title: String,
  common_platform: String,    
  common_link: String,
  common_description: String,
  common_summary: String,
  common_tags: [String],      
  common_type: String,         

  // 🔁 Common fields across all platforms
  common_title: {
    type: String,
    required: true,
    trim: true
  },
  common_platform: {
    type: String,
    required: true,
    enum: ["Hugging Face", "arXiv", "GitHub"]
  },
  common_link: {
    type: String,
    required: true
  },
  common_description: {
    type: String,
    default: ""
  },
  common_summary: {
    type: String,
    default: ""
  },
  common_tags: {
    type: [String],
    default: []
  },
  common_type: {
    type: String,
    default: ""
  },

  // 🤗 Hugging Face specific
  hf_modelId: String,
  hf_downloads: {
    type: Number,
    default: 0
  },
  hf_library_name: String,

  // 📚 arXiv specific
  arxiv_authors: String,
  arxiv_published: Date,
  arxiv_pdfLink: String,

  // 🐙 GitHub specific
  github_name: String,
  github_owner: String,
  github_stars: {
    type: Number,
    default: 0
  },
  github_language: String,
  github_updatedAt: Date,

  // 🧪 Optional: Full raw response from APIs
  sourceData: {
    type: Object,
    select: false // Don't return this field by default in queries
  },

  likes: {
    type: Number,
    default: 0,
  },

  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      text: String,
      timestamp: {
        type: Date,
        default: Date.now,
      }
    }
  ],
}, { timestamps: true });

// Create a text index for searching
ModelDataSchema.index({ 
  common_title: 'text', 
  common_description: 'text', 
  common_summary: 'text',
  common_tags: 'text'
});

export default mongoose.model("ModelData", ModelDataSchema);