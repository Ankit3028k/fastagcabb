import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from 'url';
import dbConnect from "./Db/dbConnect.js";
import authRoutes from "./Routes/authroute.js";
import userRoutes from "./Routes/userRoutes.js";
import dataRoutes from "./Routes/dataRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    console.error('🔧 Please check your .env file or environment configuration');
    // Don't exit in production, just log the error
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Enhanced CORS configuration to ensure mobile app connectivity
app.use(cors({
    origin: '*',  // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get("/", (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    res.status(200).json({
        success: true,
        message: "API is running successfully!",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
            status: dbStatus,
            name: mongoose.connection.name || 'not connected'
        },
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                logout: 'POST /api/auth/logout',
                test: 'GET /api/auth/test',
                sendOtp: 'POST /api/auth/send-otp',
                verifyOtp: 'POST /api/auth/verify-otp'
            },
            users: 'GET /api/users',
            data: 'GET /api/data'
        }
    });
});

// Network connectivity test endpoint for mobile app debugging
app.get("/api/test/connectivity", (req, res) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    res.status(200).json({
        success: true,
        message: "Network connectivity test successful!",
        timestamp: new Date().toISOString(),
        client: {
            ip: clientIP,
            userAgent: userAgent,
            headers: req.headers
        },
        server: {
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            cors: 'enabled'
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/data', dataRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`📱 Mobile URL: http://192.168.79.132:${PORT}`);
    console.log(`📋 Available endpoints:`);
    console.log(`  GET  /`);
    console.log(`  POST /api/auth/send-otp`);
    console.log(`  POST /api/auth/verify-otp`);
    console.log(`  POST /api/auth/resend-otp`);
    console.log(`  POST /api/auth/login`);
    console.log(`  POST /api/auth/register`);
    console.log(`  POST /api/auth/logout`);
    console.log(`  GET  /api/auth/test`);
    console.log(`✅ Server is ready to accept requests!`);

    // Connect to database
    dbConnect();
});
