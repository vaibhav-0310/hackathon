import axios from "axios";
import "dotenv/config";

// GitHub API headers with token
const getHeaders = () => {
  const headers = {
    Accept: "application/vnd.github.v3+json"
  };
  
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  } else {
    console.warn("GITHUB_TOKEN not found in environment variables. Using unauthenticated requests.");
  }
  
  return headers;
};

/**
 * Fetch AI-related repositories from GitHub
 * @param {Number} perPage - Number of results per page
 * @returns {Array} Array of repository objects
 */
export const fetchGithubRepos = async (perPage = 5) => {
  try {
    // Query for AI-related repositories
    const query = encodeURIComponent('ai+model+transformer');
    const url = `https://api.github.com/search/repositories?q=${query}&sort=updated&order=desc&per_page=${perPage}`;

    console.log(`Fetching GitHub repositories from: ${url}`);
    const response = await axios.get(url, { headers: getHeaders() });
    console.log("GitHub response data:", JSON.stringify(response.data, null, 2));

    // Log rate limit information
    console.log('GitHub API Rate Limit:', {
      limit: response.headers['x-ratelimit-limit'],
      remaining: response.headers['x-ratelimit-remaining'],
      reset: new Date(parseInt(response.headers['x-ratelimit-reset']) * 1000)
    });
    
    if (!response.data || !response.data.items) {
      console.log('GitHub API response:', response.data);
      throw new Error("No GitHub repositories found");
    }
    
    console.log(`Found ${response.data.items.length} repositories`);
    
    return response.data.items.map(repo => ({
      name: repo.name,
      owner: repo.owner.login,
      description: repo.description || "No description available",
      stars: repo.stargazers_count,
      url: repo.html_url,
      updatedAt: repo.updated_at,
      language: repo.language || "Not specified",
      topics: repo.topics || [],
      rawData: repo // Store complete raw data
    }));
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error.response?.status, error.response?.data || error.message);
    
    // Check for rate limiting
    if (error.response?.status === 403 && error.response?.data?.message?.includes('rate limit')) {
      console.error("GitHub API rate limit exceeded. Consider adding a GitHub token or waiting before retrying.");
    }
    
    throw error;
  }
};

/**
 * Fetch README content for a GitHub repository
 * @param {String} owner - Repository owner
 * @param {String} repo - Repository name
 * @returns {String} README content or null if not found
 */
export const fetchRepoReadme = async (owner, repo) => {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
    console.log(`Fetching README from: ${url}`);
    
    const response = await axios.get(url, { 
      headers: { 
        ...getHeaders(),
        Accept: "application/vnd.github.raw" 
      }
    });
    
    return response.data;
  } catch (error) {
    // Don't treat missing README as a fatal error
    if (error.response?.status === 404) {
      console.log(`No README found for ${owner}/${repo}`);
      return null;
    }
    
    console.error(`Error fetching README for ${owner}/${repo}:`, error.response?.status, error.response?.data || error.message);
    
    // Check for rate limiting
    if (error.response?.status === 403 && error.response?.data?.message?.includes('rate limit')) {
      console.error("GitHub API rate limit exceeded while fetching README.");
    }
    
    return null;
  }
};