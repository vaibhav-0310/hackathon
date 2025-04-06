import { fetchGithubRepos, fetchRepoReadme } from "../services/githubService.js";
import { generateModelSummary } from "../services/geminiService.js";
import ModelData from "../models/modeldata.js";

/**
 * Fetch repositories from GitHub, generate summaries with Gemini, and save to DB
 */
export const fetchAndProcessRepos = async (req, res) => {
  try {
    const perPage = req.query.limit ? parseInt(req.query.limit) : 5;
    console.log(`Processing GitHub repositories with limit: ${perPage}`);
    
    // Step 1: Fetch repositories from GitHub
    const repos = await fetchGithubRepos(perPage);
    
    if (!repos || repos.length === 0) {
      console.log("No repositories returned from GitHub API");
      return res.status(200).json([]);
    }
    
    console.log(`Processing ${repos.length} repositories...`);
    
    // Step 2: Process each repo with Gemini and save to DB
    const processedReposPromises = repos.map(async (repo) => {
      try {
        // Check if repo already exists in our database
        let existingRepo = await ModelData.findOne({ 
          github_name: repo.name,
          github_owner: repo.owner
        });
        
        if (existingRepo) {
          console.log(`Repository ${repo.owner}/${repo.name} already exists in database`);
          
          return {
            id: existingRepo._id,
            platform: "GitHub",
            title: existingRepo.common_title,
            createdAt: existingRepo.github_updatedAt || existingRepo.createdAt,
            summary: existingRepo.common_summary,
            tags: existingRepo.common_tags,
            link: existingRepo.common_link,
            stars: existingRepo.github_stars,
            owner: existingRepo.github_owner,
            language: existingRepo.github_language
          };
        }
        
        console.log(`Processing new repository: ${repo.owner}/${repo.name}`);
        
        // Fetch README content
        const readmeContent = await fetchRepoReadme(repo.owner, repo.name);
        
        // Generate description using Gemini based on README and repo description
        let content = `Repository name: ${repo.name}\nDescription: ${repo.description}\n`;
        if (readmeContent) {
          // Truncate README content if it's too large for the API
          const truncatedReadme = readmeContent.length > 30000 
            ? readmeContent.substring(0, 30000) + "...[content truncated due to length]" 
            : readmeContent;
            
          content += `\nREADME:\n${truncatedReadme}`;
        }
        
        console.log(`Generating summary for ${repo.owner}/${repo.name} with Gemini API`);
        const enhancedDescription = await generateModelSummary(content);
        
        // Create tags from repository topics and language
        const tags = [...new Set([
          ...(repo.topics || []).map(topic => 
            topic.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')
          ),
          repo.language
        ])].filter(tag => tag && tag !== "Not specified");
        
        // Add default tag if no tags are found
        if (tags.length === 0) {
          tags.push("AI Repository");
        }
        
        console.log(`Creating database entry for ${repo.owner}/${repo.name}`);
        // Create new repo entry in database
        existingRepo = await ModelData.create({
          // Common fields
          common_title: repo.name,
          common_platform: "GitHub",
          common_link: repo.url,
          common_description: enhancedDescription,
          common_summary: enhancedDescription.substring(0, 200) + (enhancedDescription.length > 200 ? '...' : ''),
          common_tags: tags,
          common_type: "Repository",
          
          // GitHub specific
          github_name: repo.name,
          github_owner: repo.owner,
          github_stars: repo.stars,
          github_language: repo.language,
          github_updatedAt: new Date(repo.updatedAt),
          
          // Source data
          sourceData: repo.rawData,
        });
        
        return {
          id: existingRepo._id,
          platform: "GitHub",
          title: existingRepo.common_title,
          createdAt: existingRepo.github_updatedAt || existingRepo.createdAt,
          summary: existingRepo.common_summary,
          tags: existingRepo.common_tags,
          link: existingRepo.common_link,
          stars: existingRepo.github_stars,
          owner: existingRepo.github_owner,
          language: existingRepo.github_language
        };
      } catch (error) {
        console.error(`Error processing repository ${repo.owner}/${repo.name}:`, error);
        return null; // Return null for failed repos
      }
    });
    
    // Process all repos and filter out any that failed
    const processedRepos = (await Promise.all(processedReposPromises)).filter(repo => repo !== null);
    
    console.log(`Successfully processed ${processedRepos.length} out of ${repos.length} repositories`);
    return res.status(200).json(processedRepos);
  } catch (error) {
    console.error("Error in fetchAndProcessRepos:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get repositories that have already been processed and stored in our DB
 */
export const getStoredRepos = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    
    const repos = await ModelData.find({ common_platform: "GitHub" })
      .sort({ github_updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const formattedRepos = repos.map(repo => ({
      id: repo._id,
      platform: repo.common_platform,
      title: repo.common_title,
      createdAt: repo.github_updatedAt || repo.createdAt,
      summary: repo.common_summary,
      tags: repo.common_tags,
      link: repo.common_link,
      stars: repo.github_stars,
      owner: repo.github_owner,
      language: repo.github_language
    }));
    
    return res.status(200).json(formattedRepos);
  } catch (error) {
    console.error("Error in getStoredRepos:", error);
    return res.status(500).json({ error: error.message });
  }
};