import fs from 'fs';
import path from 'path';

/**
 * Parse CSV content into JSON format
 * @param {string} csvContent - Raw CSV content
 * @returns {Array} Array of objects representing CSV rows
 */
export const parseCSV = (csvContent) => {
    const lines = csvContent.trim().split('\n');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(header => header.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(value => value.trim());
        const row = {};
        
        headers.forEach((header, index) => {
            let value = values[index] || '';
            
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            
            // Try to convert to appropriate data type
            if (value === 'true' || value === 'false') {
                row[header] = value === 'true';
            } else if (!isNaN(value) && value !== '') {
                row[header] = parseFloat(value);
            } else {
                row[header] = value;
            }
        });
        
        data.push(row);
    }
    
    return data;
};

/**
 * Parse text file content into structured format
 * @param {string} textContent - Raw text content
 * @returns {Object} Structured representation of text content
 */
export const parseTextFile = (textContent) => {
    const lines = textContent.split('\n').filter(line => line.trim() !== '');
    const result = {
        totalLines: lines.length,
        content: [],
        metadata: {
            hasComments: false,
            hasKeyValuePairs: false,
            hasTimestamps: false
        }
    };
    
    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        const lineData = {
            lineNumber: index + 1,
            content: trimmedLine,
            type: 'text'
        };
        
        // Detect comments
        if (trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
            lineData.type = 'comment';
            result.metadata.hasComments = true;
        }
        // Detect key-value pairs
        else if (trimmedLine.includes('=') && !trimmedLine.includes(' = ')) {
            lineData.type = 'config';
            const [key, ...valueParts] = trimmedLine.split('=');
            lineData.key = key.trim();
            lineData.value = valueParts.join('=').trim();
            result.metadata.hasKeyValuePairs = true;
        }
        // Detect timestamps (basic pattern)
        else if (/\d{4}-\d{2}-\d{2}/.test(trimmedLine)) {
            lineData.type = 'log';
            result.metadata.hasTimestamps = true;
        }
        
        result.content.push(lineData);
    });
    
    return result;
};

/**
 * Get file information
 * @param {string} filePath - Path to the file
 * @returns {Object} File information
 */
export const getFileInfo = (filePath) => {
    try {
        const stats = fs.statSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        
        return {
            name: path.basename(filePath),
            path: filePath,
            extension: ext,
            size: stats.size,
            sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
            created: stats.birthtime,
            modified: stats.mtime,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory()
        };
    } catch (error) {
        throw new Error(`Failed to get file info: ${error.message}`);
    }
};

/**
 * Read and parse a single file based on its extension
 * @param {string} filePath - Path to the file
 * @returns {Object} Parsed file data with metadata
 */
export const readAndParseFile = async (filePath) => {
    try {
        const fileInfo = getFileInfo(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        
        let parsedData;
        let parseError = null;
        
        switch (fileInfo.extension) {
            case '.json':
                try {
                    parsedData = JSON.parse(content);
                } catch (error) {
                    parseError = `JSON parse error: ${error.message}`;
                    parsedData = { rawContent: content };
                }
                break;
                
            case '.csv':
                try {
                    parsedData = parseCSV(content);
                } catch (error) {
                    parseError = `CSV parse error: ${error.message}`;
                    parsedData = { rawContent: content };
                }
                break;
                
            case '.txt':
            case '.log':
            case '.md':
                try {
                    parsedData = parseTextFile(content);
                } catch (error) {
                    parseError = `Text parse error: ${error.message}`;
                    parsedData = { rawContent: content };
                }
                break;
                
            default:
                parsedData = {
                    rawContent: content,
                    note: 'Unsupported file format, returning raw content'
                };
        }
        
        return {
            fileInfo,
            data: parsedData,
            parseError,
            success: !parseError
        };
        
    } catch (error) {
        return {
            fileInfo: { name: path.basename(filePath), path: filePath },
            data: null,
            parseError: `File read error: ${error.message}`,
            success: false
        };
    }
};

/**
 * Read all files from a directory
 * @param {string} directoryPath - Path to the directory
 * @param {Array} allowedExtensions - Array of allowed file extensions (optional)
 * @returns {Object} Object containing all parsed files and summary
 */
export const readAllFilesFromDirectory = async (directoryPath) => {
    try {
        if (!fs.existsSync(directoryPath)) {
            throw new Error(`Directory does not exist: ${directoryPath}`);
        }
        
        const files = fs.readdirSync(directoryPath);
        const results = {
            directory: directoryPath,
            totalFiles: 0,
            successfullyParsed: 0,
            errors: 0,
            files: [],
            summary: {
                byExtension: {},
                totalSize: 0,
                lastModified: null
            }
        };
        
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath);
            
            // Skip directories
            if (stats.isDirectory()) continue;
            
            results.totalFiles++;
            const fileResult = await readAndParseFile(filePath);
            
            if (fileResult.success) {
                results.successfullyParsed++;
            } else {
                results.errors++;
            }
            
            // Update summary
            const ext = fileResult.fileInfo.extension || 'unknown';
            results.summary.byExtension[ext] = (results.summary.byExtension[ext] || 0) + 1;
            results.summary.totalSize += fileResult.fileInfo.size || 0;
            
            if (!results.summary.lastModified || 
                (fileResult.fileInfo.modified && fileResult.fileInfo.modified > results.summary.lastModified)) {
                results.summary.lastModified = fileResult.fileInfo.modified;
            }
            
            results.files.push(fileResult);
        }
        
        results.summary.totalSizeInMB = (results.summary.totalSize / (1024 * 1024)).toFixed(2);
        
        return results;
        
    } catch (error) {
        return {
            directory: directoryPath,
            error: error.message,
            success: false
        };
    }
};

/**
 * Validate file format and size
 * @param {string} filePath - Path to the file
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateFile = (filePath, options = {}) => {
    const {
        maxSizeInMB = 10,
        allowedExtensions = ['.json', '.csv', '.txt', '.log', '.md']
    } = options;
    
    try {
        const fileInfo = getFileInfo(filePath);
        const errors = [];
        
        // Check file extension
        if (!allowedExtensions.includes(fileInfo.extension)) {
            errors.push(`Unsupported file extension: ${fileInfo.extension}`);
        }
        
        // Check file size
        if (parseFloat(fileInfo.sizeInMB) > maxSizeInMB) {
            errors.push(`File size (${fileInfo.sizeInMB}MB) exceeds limit (${maxSizeInMB}MB)`);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            fileInfo
        };
        
    } catch (error) {
        return {
            valid: false,
            errors: [error.message],
            fileInfo: null
        };
    }
};
