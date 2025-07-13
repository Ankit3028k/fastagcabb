import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    readAllFilesFromDirectory,
    readAndParseFile,
    validateFile,
    getFileInfo
} from '../utils/fileReader.js';
import {
    validateFileAccess,
    validateDirectoryAccess,
    rateLimitFileOperations,
    logFileOperations,
    fileOperationErrorHandler
} from '../middleware/fileValidation.js';

const router = express.Router();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Apply middleware to all routes
router.use(rateLimitFileOperations);
router.use(logFileOperations);

/**
 * GET /api/data
 * Read all files from the data directory and return structured data
 */
router.get('/', async (req, res) => {
    try {
        const dataDirectory = path.join(__dirname, '..', 'data');
        const result = await readAllFilesFromDirectory(dataDirectory);
        
        if (!result.success && result.error) {
            return res.status(404).json({
                success: false,
                message: 'Data directory not found or inaccessible',
                error: result.error,
                timestamp: new Date().toISOString()
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Files read successfully',
            data: result,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error reading data directory:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while reading files',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/data/file/:filename
 * Read a specific file from the data directory
 */
router.get('/file/:filename', validateFileAccess, async (req, res) => {
    try {
        const { filename } = req.params;
        const dataDirectory = path.join(__dirname, '..', 'data');
        const filePath = path.join(dataDirectory, filename);
        
        // Validate file path to prevent directory traversal
        if (!filePath.startsWith(dataDirectory)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file path',
                timestamp: new Date().toISOString()
            });
        }
        
        // Validate file
        const validation = validateFile(filePath);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: 'File validation failed',
                errors: validation.errors,
                timestamp: new Date().toISOString()
            });
        }
        
        const result = await readAndParseFile(filePath);
        
        if (!result.success) {
            return res.status(404).json({
                success: false,
                message: 'File not found or could not be read',
                error: result.parseError,
                timestamp: new Date().toISOString()
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'File read successfully',
            data: result,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error reading specific file:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while reading file',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/data/directory-info
 * Get information about the data directory
 */
router.get('/directory-info', async (req, res) => {
    try {
        const dataDirectory = path.join(__dirname, '..', 'data');
        const result = await readAllFilesFromDirectory(dataDirectory);
        
        if (!result.success && result.error) {
            return res.status(404).json({
                success: false,
                message: 'Data directory not found',
                error: result.error,
                timestamp: new Date().toISOString()
            });
        }
        
        // Return only summary information, not the actual file contents
        const summary = {
            directory: result.directory,
            totalFiles: result.totalFiles,
            successfullyParsed: result.successfullyParsed,
            errors: result.errors,
            summary: result.summary,
            fileList: result.files.map(file => ({
                name: file.fileInfo.name,
                extension: file.fileInfo.extension,
                size: file.fileInfo.sizeInMB + ' MB',
                modified: file.fileInfo.modified,
                success: file.success,
                hasError: !!file.parseError
            }))
        };
        
        res.status(200).json({
            success: true,
            message: 'Directory information retrieved successfully',
            data: summary,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error getting directory info:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while getting directory info',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/data/custom-directory
 * Read files from a custom directory path
 */
router.post('/custom-directory', validateDirectoryAccess, async (req, res) => {
    try {
        const { directoryPath } = req.body;
        
        if (!directoryPath) {
            return res.status(400).json({
                success: false,
                message: 'Directory path is required',
                timestamp: new Date().toISOString()
            });
        }
        
        // Basic security check - ensure path is absolute and doesn't contain suspicious patterns
        if (directoryPath.includes('..') || !path.isAbsolute(directoryPath)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid directory path. Please provide an absolute path without relative references.',
                timestamp: new Date().toISOString()
            });
        }
        
        const result = await readAllFilesFromDirectory(directoryPath);
        
        if (!result.success && result.error) {
            return res.status(404).json({
                success: false,
                message: 'Directory not found or inaccessible',
                error: result.error,
                timestamp: new Date().toISOString()
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Custom directory files read successfully',
            data: result,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error reading custom directory:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while reading custom directory',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Error handler for file operations
router.use(fileOperationErrorHandler);

export default router;
