import path from 'path';
import fs from 'fs';

/**
 * Middleware to validate file access requests
 */
export const validateFileAccess = (req, res, next) => {
    try {
        const { filename } = req.params;
        
        if (!filename) {
            return res.status(400).json({
                success: false,
                message: 'Filename parameter is required',
                timestamp: new Date().toISOString()
            });
        }
        
        // Check for suspicious patterns
        const suspiciousPatterns = [
            '..',
            '/',
            '\\',
            ':',
            '*',
            '?',
            '"',
            '<',
            '>',
            '|'
        ];
        
        const hasSuspiciousPattern = suspiciousPatterns.some(pattern => 
            filename.includes(pattern)
        );
        
        if (hasSuspiciousPattern) {
            return res.status(400).json({
                success: false,
                message: 'Invalid filename. Filename contains forbidden characters.',
                timestamp: new Date().toISOString()
            });
        }
        
        // Validate file extension
        const allowedExtensions = ['.json', '.csv', '.txt', '.log', '.md'];
        const fileExtension = path.extname(filename).toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({
                success: false,
                message: `Unsupported file extension: ${fileExtension}. Allowed extensions: ${allowedExtensions.join(', ')}`,
                timestamp: new Date().toISOString()
            });
        }
        
        next();
        
    } catch (error) {
        console.error('File validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during file validation',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Middleware to validate directory access requests
 */
export const validateDirectoryAccess = (req, res, next) => {
    try {
        const { directoryPath } = req.body;
        
        if (!directoryPath) {
            return res.status(400).json({
                success: false,
                message: 'Directory path is required in request body',
                timestamp: new Date().toISOString()
            });
        }
        
        // Check if path is absolute
        if (!path.isAbsolute(directoryPath)) {
            return res.status(400).json({
                success: false,
                message: 'Directory path must be absolute',
                timestamp: new Date().toISOString()
            });
        }
        
        // Check for directory traversal attempts
        if (directoryPath.includes('..')) {
            return res.status(400).json({
                success: false,
                message: 'Directory traversal is not allowed',
                timestamp: new Date().toISOString()
            });
        }
        
        // Check if directory exists
        if (!fs.existsSync(directoryPath)) {
            return res.status(404).json({
                success: false,
                message: 'Directory does not exist',
                timestamp: new Date().toISOString()
            });
        }
        
        // Check if it's actually a directory
        const stats = fs.statSync(directoryPath);
        if (!stats.isDirectory()) {
            return res.status(400).json({
                success: false,
                message: 'Path is not a directory',
                timestamp: new Date().toISOString()
            });
        }
        
        next();
        
    } catch (error) {
        console.error('Directory validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during directory validation',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Middleware to handle rate limiting for file operations
 */
export const rateLimitFileOperations = (req, res, next) => {
    // Simple in-memory rate limiting (in production, use Redis or similar)
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 30; // Max 30 requests per minute
    
    if (!global.rateLimitStore) {
        global.rateLimitStore = new Map();
    }
    
    const clientData = global.rateLimitStore.get(clientIP) || { count: 0, resetTime: now + windowMs };
    
    if (now > clientData.resetTime) {
        clientData.count = 1;
        clientData.resetTime = now + windowMs;
    } else {
        clientData.count++;
    }
    
    global.rateLimitStore.set(clientIP, clientData);
    
    if (clientData.count > maxRequests) {
        return res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
            timestamp: new Date().toISOString()
        });
    }
    
    // Add rate limit headers
    res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - clientData.count),
        'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString()
    });
    
    next();
};

/**
 * Middleware to log file operations
 */
export const logFileOperations = (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;
    
    res.send = function(data) {
        const duration = Date.now() - startTime;
        const logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            duration: `${duration}ms`,
            statusCode: res.statusCode,
            success: res.statusCode < 400
        };
        
        console.log('File Operation Log:', JSON.stringify(logData));
        originalSend.call(this, data);
    };
    
    next();
};

/**
 * Error handler specifically for file operations
 */
export const fileOperationErrorHandler = (error, req, res, next) => {
    console.error('File Operation Error:', {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    
    // Handle specific error types
    if (error.code === 'ENOENT') {
        return res.status(404).json({
            success: false,
            message: 'File or directory not found',
            timestamp: new Date().toISOString()
        });
    }
    
    if (error.code === 'EACCES') {
        return res.status(403).json({
            success: false,
            message: 'Permission denied',
            timestamp: new Date().toISOString()
        });
    }
    
    if (error.code === 'EMFILE' || error.code === 'ENFILE') {
        return res.status(503).json({
            success: false,
            message: 'Too many open files. Please try again later.',
            timestamp: new Date().toISOString()
        });
    }
    
    // Default error response
    res.status(500).json({
        success: false,
        message: 'Internal server error during file operation',
        error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString()
    });
};
