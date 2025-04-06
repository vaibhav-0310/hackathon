import { fetchArxivPapers } from "../services/arxivService.js";
import { generateModelSummary } from "../services/geminiService.js";
import ModelData from "../models/modeldata.js";

/**
 * Fetch papers from arXiv, generate summaries with Gemini, and save to DB
 */
export const fetchAndProcessPapers = async (req, res) => {
  try {
    const maxResults = req.query.limit ? parseInt(req.query.limit) : 5;
    
    // Step 1: Fetch papers from arXiv
    const papers = await fetchArxivPapers(maxResults);
    
    // Step 2: Process each paper with Gemini and save to DB
    const processedPapers = await Promise.all(
      papers.map(async (paper) => {
        // Check if paper already exists in our database
        let existingPaper = await ModelData.findOne({ 
          arxiv_authors: paper.authors,
          common_title: paper.title
        });
        
        if (!existingPaper) {
          // Generate concise summary using Gemini
          const enhancedSummary = await generateModelSummary(paper.summary);
          
          // Extract tags from the paper summary
          const aiKeywords = ["neural network", "deep learning", "transformer", "llm", "machine learning", 
                              "ai", "generative", "reinforcement learning", "computer vision"];
          
          const tags = aiKeywords
            .filter(keyword => 
              paper.title.toLowerCase().includes(keyword) || 
              paper.summary.toLowerCase().includes(keyword))
            .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1));
            
          // Add "AI Research" as default tag if no other tags are found
          if (tags.length === 0) {
            tags.push("AI Research");
          }
          
          // Create new paper entry in database
          existingPaper = await ModelData.create({
            // Common fields
            common_title: paper.title,
            common_platform: "arXiv",
            common_link: paper.link,
            common_description: enhancedSummary,
            common_summary: enhancedSummary.substring(0, 200) + (enhancedSummary.length > 200 ? '...' : ''),
            common_tags: tags,
            common_type: "Research Paper",
            
            // arXiv specific
            arxiv_authors: paper.authors,
            arxiv_published: new Date(paper.published),
            arxiv_pdfLink: paper.pdfLink,
            
            // Source data
            sourceData: paper.rawData,
          });
        }
        
        return {
          id: existingPaper._id,
          platform: "arXiv",
          title: existingPaper.common_title,
          createdAt: existingPaper.arxiv_published || existingPaper.createdAt,
          summary: existingPaper.common_summary,
          tags: existingPaper.common_tags,
          link: existingPaper.common_link,
          authors: existingPaper.arxiv_authors,
          pdfLink: existingPaper.arxiv_pdfLink
        };
      })
    );
    
    return res.status(200).json(processedPapers);
  } catch (error) {
    console.error("Error in fetchAndProcessPapers:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get papers that have already been processed and stored in our DB
 */
export const getStoredPapers = async (req, res) => {
  try {
    const papers = await ModelData.find({ common_platform: "arXiv" })
      .sort({ arxiv_published: -1 });
    
    const formattedPapers = papers.map(paper => ({
      id: paper._id,
      platform: paper.common_platform,
      title: paper.common_title,
      createdAt: paper.arxiv_published || paper.createdAt,
      summary: paper.common_summary,
      tags: paper.common_tags,
      link: paper.common_link,
      authors: paper.arxiv_authors,
      pdfLink: paper.arxiv_pdfLink
    }));
    
    return res.status(200).json(formattedPapers);
  } catch (error) {
    console.error("Error in getStoredPapers:", error);
    return res.status(500).json({ error: error.message });
  }
};