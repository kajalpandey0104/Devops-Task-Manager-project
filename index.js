/**
 * DevOps Task Manager API
 * 
 * This file serves as the main entry point for the DevOps Task Manager application.
 * It initializes an Express server, configures essential middleware, defines health check
 * and core routes, implements centralized error handling, and manages graceful shutdowns.
 * 
 * Usage:
 *   - Local Development: Run `node index.js` (starts on port 5000 by default or PROCESS.ENV.PORT)
 *   - Docker Environment: Port 5000 is exposed and mapped via Docker Compose.
 */

const express = require("express");

// Initialize the Express application
const app = express();

// =========================================================================
// 1. CONFIGURATION
// =========================================================================
// Retrieve the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// =========================================================================
// 2. MIDDLEWARES
// =========================================================================

/**
 * Request Logger Middleware
 * Logs incoming HTTP requests with a timestamp, method, and URL.
 * Crucial for DevOps observability and troubleshooting.
 */
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - Client IP: ${req.ip}`);
  next();
});

// Parse incoming requests with JSON payloads
app.use(express.json());

// Parse incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// =========================================================================
// 3. CORE ROUTE HANDLERS
// =========================================================================

/**
 * @route   GET /
 * @desc    Root endpoint to confirm the API is up and running
 * @access  Public
 */
app.get("/", (req, res) => {
  res.status(200).send("DevOps Task Manager API is running.");
});

/**
 * @route   GET /health
 * @desc    Comprehensive health check endpoint providing service & system status
 *          Used by DevOps health monitors, Docker healthchecks, or Kubernetes probes
 * @access  Public
 */
app.get("/health", (req, res) => {
  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)} seconds`,
    memoryUsage: {
      rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
    },
    environment: NODE_ENV,
    nodeVersion: process.version
  };

  res.status(200).json(healthData);
});

// =========================================================================
// 4. ERROR & 404 HANDLING
// =========================================================================

/**
 * 404 (Not Found) Fallback Middleware
 * Catches all requests to undefined routes and responds with a 404 status.
 */
app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url}`
  });
});

/**
 * Centralized Global Error Handling Middleware
 * Gracefully intercepts all unhandled controller or database errors.
 */
app.use((err, req, res, next) => {
  console.error(`[Error] Unhandled error encountered: ${err.message}`);
  res.status(500).json({
    error: "Internal Server Error",
    message: NODE_ENV === "development" ? err.message : "An unexpected error occurred."
  });
});

// =========================================================================
// 5. SERVER BOOT & GRACEFUL SHUTDOWN
// =========================================================================

// Start listening for incoming connections
const server = app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` DevOps Task Manager server successfully started!`);
  console.log(` Running in [${NODE_ENV}] mode on port: ${PORT}`);
  console.log(` Health check available at: http://localhost:${PORT}/health`);
  console.log(`===================================================`);
});

/**
 * Graceful Shutdown Handler
 * Intercepts termination signals (SIGINT, SIGTERM) to safely close all active connections
 * and shutdown resources before the container exits.
 */
const handleGracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown procedure...`);
  
  // Stop accepting new connections
  server.close(() => {
    console.log("HTTP server closed. Releasing active resources...");
    
    // Perform any other cleanup tasks here (e.g., closing database connections, flushing logs)
    
    console.log("Graceful shutdown complete. Exiting process safely.");
    process.exit(0);
  });

  // Force exit after a timeout (e.g., 10 seconds) if connections don't close cleanly
  setTimeout(() => {
    console.error("Forced shutdown triggered: server failed to close connections within timeout.");
    process.exit(1);
  }, 10000);
};

// Listen for process termination signals
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));