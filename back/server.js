import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import apiRoutes from "./routes/index.js";

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Server Error", 
    message: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong"
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", message: "The requested resource was not found" });
});

// Port configuration
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});