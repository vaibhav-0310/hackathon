import express from "express";
import axios from "axios";
import {parseStringPromise} from "xml2js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/data", async (req, res) => {
  try {
    const response = await axios.get("https://huggingface.co/api/models?limit=1");
    if (!response || !response.data || response.data.length === 0) {
      return res.status(400).json({ message: "No model data found" });
    }
    const modelId = response.data[0].modelId;
    const readmeUrl = `https://huggingface.co/${modelId}/raw/main/README.md`;
    const readmeResponse = await axios.get(readmeUrl);
    const descriptionMarkdown = readmeResponse.data;
    return res.status(200).json({
      modelId,
      link: `https://huggingface.co/${modelId}`,
      description: descriptionMarkdown.slice(0, 2000) + "...", 
    });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: e.message });
  }
});

app.get("/arxiv", async (req, res) => {
  try {
    const url =
      "http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=5";

    const response = await axios.get(url);
    const json = await parseStringPromise(response.data, { explicitArray: false });

    const entries = Array.isArray(json.feed.entry) ? json.feed.entry : [json.feed.entry];

    const papers = entries.map((paper) => ({
      title: paper.title.trim(),
      authors: Array.isArray(paper.author)
        ? paper.author.map((a) => a.name).join(", ")
        : paper.author.name,
      published: paper.published,
      summary: paper.summary.trim().replace(/\s+/g, " ").slice(0, 300) + "...",
      pdfLink: paper.link.find((l) => l.$.title === "pdf").$.href,
    }));

    // ⬇ Return just the array instead of { papers: [...] }
    return res.status(200).json(papers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch or parse arXiv data" });
  }
});

app.listen(8080, () => {
  console.log("Server started at http://localhost:8080");
});
