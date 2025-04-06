import axios from "axios";
import { parseStringPromise } from "xml2js";

/**
 * Fetch recent AI papers from arXiv
 * @param {Number} maxResults - Maximum number of results to return
 * @returns {Array} Array of paper objects
 */
export const fetchArxivPapers = async (maxResults = 5) => {
  try {
    const url = `http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;

    const response = await axios.get(url);
    const json = await parseStringPromise(response.data, { explicitArray: false });

    const entries = Array.isArray(json.feed.entry) ? json.feed.entry : [json.feed.entry];

    return entries.map((paper) => ({
      title: paper.title.trim(),
      authors: Array.isArray(paper.author)
        ? paper.author.map((a) => a.name).join(", ")
        : paper.author.name,
      published: paper.published,
      summary: paper.summary.trim().replace(/\s+/g, " "),
      link: paper.id,
      pdfLink: paper.link.find((l) => l.$.title === "pdf").$.href,
      arxivId: paper.id.split("/").pop(),
      rawData: paper // Store complete raw data
    }));
  } catch (error) {
    console.error("Error fetching arXiv papers:", error.message);
    throw error;
  }
};