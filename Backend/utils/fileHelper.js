import fs from 'fs';
import path from 'path';

// Delete a file if it exists
export const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`File deleted: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
    }
};

// Delete multiple files
export const deleteFiles = (filePaths) => {
    filePaths.forEach(filePath => {
        if (filePath) {
            deleteFile(filePath);
        }
    });
};

// Get file URL for client access
export const getFileUrl = (filePath, req) => {
    if (!filePath) return null;

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const relativePath = filePath.replace(/\\/g, '/'); // Convert Windows paths to URL format
    return `${baseUrl}/${relativePath}`;
};

// Validate file type
export const isValidFileType = (filename, allowedTypes) => {
    const ext = path.extname(filename).toLowerCase();
    return allowedTypes.includes(ext);
};

// Get file size in MB
export const getFileSizeInMB = (filePath) => {
    try {
        const stats = fs.statSync(filePath);
        return stats.size / (1024 * 1024);
    } catch (error) {
        console.error(`Error getting file size for ${filePath}:`, error);
        return 0;
    }
};