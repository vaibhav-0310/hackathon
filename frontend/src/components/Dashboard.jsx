import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "./Card";

const Dashboard = () => {
  const [allModels, setAllModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [platformInput, setPlatformInput] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const fetchModels = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/models`);
      setAllModels(res.data);
      setFilteredModels(res.data);
    } catch (err) {
      console.error("Error fetching models:", err);
    }
  };

  const handleSubscribe = async () => {
    try {
      await axios.post(
        `http://localhost:8080/api/subscribe`);

      // Send welcome email
      await axios.post(`http://localhost:8080/api/send-email`);

      setIsSubscribed(true);
      alert("You're now subscribed and a welcome email has been sent!");
    } catch (err) {
      console.error("Subscription or email failed:", err);
    }
  };

  const handlePlatformInputChange = (e) => {
    const value = e.target.value;
    setPlatformInput(value);
    if (value.trim() === "" || value === "All") {
      setFilteredModels(allModels);
    } else {
      setFilteredModels(
        allModels.filter((model) =>
          model.common_platform?.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">AI Digest</h1>
        {!isSubscribed && (
          <button
            onClick={handleSubscribe}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Subscribe
          </button>
        )}
        {isSubscribed && (
          <span className="text-green-600 font-semibold">Subscribed ✅</span>
        )}
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Enter platform (e.g., GitHub, ArXiv, Hugging Face)"
          value={platformInput}
          onChange={handlePlatformInputChange}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model, index) => (
          <Card key={index} item={model} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
