import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import dataRoutes from "./Routes/dataRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: '*',  // Allow all origins
    credentials: true
}));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Dynamic File Reader API is running successfully!",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        endpoints: {
            "GET /api/data": "Read all files from data directory",
            "GET /api/data/file/:filename": "Read specific file",
            "GET /api/data/directory-info": "Get directory information",
            "POST /api/data/custom-directory": "Read files from custom directory"
        }
    });
});

// API Routes
app.use('/api/data', dataRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Dynamic File Reader API Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}`);
    console.log(`📁 Data Directory: ${path.join(__dirname, 'data')}`);
    console.log('\n📋 Available Endpoints:');
    console.log(`  GET  http://localhost:${PORT}/api/data`);
    console.log(`  GET  http://localhost:${PORT}/api/data/file/:filename`);
    console.log(`  GET  http://localhost:${PORT}/api/data/directory-info`);
    console.log(`  POST http://localhost:${PORT}/api/data/custom-directory`);
    console.log('\n✅ Server is ready to accept requests!');
});
