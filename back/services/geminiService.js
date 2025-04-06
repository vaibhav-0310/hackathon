import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Generate a summary/description from README content using Gemini
 */
export const generateModelSummary = async (readmeContent) => {
  if (!readmeContent) {
    return "No README content available for this model.";
  }

  try {
    const prompt = `
    Summarize the following AI model README in a clear, concise paragraph. 
    Focus on the model's purpose, capabilities, and key features. 
    Keep the summary under 250 words:
    
    ${readmeContent}
    `;

    const response = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
    });

    const generatedDescription = response.response?.candidates?.[0]?.content?.parts?.[0]?.text || 
      "Unable to generate summary.";

    return generatedDescription;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error.message);
    return "Failed to generate model summary.";
  }
};