import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import apiRoutes from "./routes/index.js";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import passport from "passport";
import {Strategy} from "passport-local";
import User from "./models/usermodel.js";
import UserRoutes from "./routes/user.routes.js";
import MailRoutes from "./routes/mailer.router.js";

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Get MongoDB connection string from environment variable or use default
const mongoUrl = process.env.MONGO_URI || "mongodb://127.0.0.1/ai";

app.use(
  session({
    store: MongoStore.create({ mongoUrl }),
    secret: process.env.SESSION_SECRET || "random",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure:false,
    },
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new Strategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  if(req.user){
    console.log(req.user);
  }
  else{
    console.log("user not found");
  }
  next();
})

app.use("/api", MailRoutes);
// Mount user routes under /api
app.use("/api", UserRoutes);
//user routes
app.use("/api",UserRoutes);
// API Routes
app.use("/api", apiRoutes);


app.get("/user",(req,res)=>{
  console.log(req.user.subscribed);
});
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