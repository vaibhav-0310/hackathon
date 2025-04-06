import React, { useEffect, useState } from "react";

export default function Sidebar() {
  const [allModels, setAllModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [query, setQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedSource, setSelectedSource] = useState("All Sources");
  const [isShowingFavorites, setIsShowingFavorites] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/models");
        const data = await response.json();
        setAllModels(data);
        setFilteredModels(data);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModels();
  }, []);

  // Extract sources
  const sources = [
    "All Sources",
    ...new Set(allModels.map((item) => item.source)),
  ].filter(Boolean);

  // Handle sort/filter/search logic here...

  return (
    <div className="flex">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        searchTerm={query}
        onSearchChange={(e) => setQuery(e.target.value)}
        selectedSource={selectedSource}
        onSourceChange={(source) => setSelectedSource(source)}
        onShowFavorites={() => setIsShowingFavorites(true)}
        onShowAll={() => setIsShowingFavorites(false)}
        isShowingFavorites={isShowingFavorites}
        sources={sources}
        sortBy={sortBy}
        onSortChange={(val) => setSortBy(val)}
      />
      <main className="flex-1 p-4">
        {/* Your dashboard content like cards, model previews, etc. */}
        <h1 className="text-xl font-bold mb-4">AI Digest Dashboard</h1>
        {/* Map over filteredModels here */}
      </main>
    </div>
  );
}
