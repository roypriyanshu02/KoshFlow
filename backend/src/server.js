import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/contacts.js";
import productRoutes from "./routes/products.js";
import transactionRoutes from "./routes/transactions.js";
import accountRoutes from "./routes/accounts.js";
import reportRoutes from "./routes/reports.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { authenticateToken } from "./middleware/auth.js";
import { performanceMiddleware, timeoutMiddleware, memoryMonitorMiddleware } from "./middleware/performance.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Prisma Client with optimizations
export const prisma = new PrismaClient({
  log: ['error'],
  errorFormat: 'minimal',
});

// Performance middleware
app.use(compression()); // Enable gzip compression
app.use(timeoutMiddleware(30000)); // 30 second timeout
app.use(performanceMiddleware);
app.use(memoryMonitorMiddleware);

// Security middleware
app.use(helmet());

// Optimized CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.CORS_ORIGIN || "https://your-domain.com"]
  : [
      "http://localhost:5173",
      "http://localhost:8080",
      "http://127.0.0.1:5173", 
      "http://127.0.0.1:8080"
    ];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // Cache preflight for 24 hours
  })
);

// Optimized rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parsing middleware with optimized limits
app.use(express.json({ 
  limit: "1mb", // Reduced from 10mb for better performance
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: "1mb",
  parameterLimit: 20
}));

// Optimized logging middleware
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes with optimized rate limiting
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/contacts", authenticateToken, contactRoutes);
app.use("/api/products", authenticateToken, productRoutes);
app.use("/api/transactions", authenticateToken, transactionRoutes);
app.use("/api/accounts", authenticateToken, accountRoutes);
app.use("/api/reports", authenticateToken, reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

export default app;
