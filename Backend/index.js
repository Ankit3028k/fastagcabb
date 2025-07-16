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
import qrRoutes from "./Routes/qrRoutes.js";
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
    origin: true, // Allow all origins for React Native
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'X-Requested-With',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods'
    ],
    credentials: false, // Set to false when allowing all origins
    maxAge: 86400,
    optionsSuccessStatus: 200 // For legacy browser support
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Additional CORS headers for React Native
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Health check route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running successfully!",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    });
});

// API Routes - Add them one by one to test
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/qr', qrRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Server accessible at: http://localhost:${PORT}`);
    console.log(`🌐 Server accessible at: http://127.0.0.1:${PORT}`);
  
    // console.log(`📱 React Native app should use: http://192.168.1.25:${PORT}`);
    dbConnect();
});
