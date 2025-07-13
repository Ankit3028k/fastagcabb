# Dynamic File Reader API

A powerful Node.js/Express.js backend that dynamically reads files from directories and serves their data through RESTful API endpoints. Supports multiple file formats including JSON, CSV, and text files.

## 🚀 Features

- **Dynamic File Reading**: Automatically detects and reads all files from specified directories
- **Multi-Format Support**: Handles JSON, CSV, TXT, LOG, and MD files
- **Intelligent Parsing**: Automatically parses data based on file format
- **Error Handling**: Comprehensive error handling and validation
- **Security**: Built-in security measures against directory traversal attacks
- **Rate Limiting**: Prevents API abuse with configurable rate limits
- **Structured Output**: Returns clean, structured data ready for frontend consumption

## 📁 Project Structure

```
Backend/
├── data/                    # Sample data files
│   ├── users.json          # User data (JSON format)
│   ├── products.csv        # Product catalog (CSV format)
│   ├── orders.json         # Order information (JSON format)
│   ├── config.txt          # Configuration file (Text format)
│   └── logs.txt            # Application logs (Text format)
├── Routes/
│   └── dataRoutes.js       # API routes for file operations
├── utils/
│   └── fileReader.js       # File reading and parsing utilities
├── middleware/
│   └── fileValidation.js   # Security and validation middleware
└── test-api.js             # Test script for file reading functionality
```

## 🔧 Installation & Setup

1. **Install Dependencies**:
   ```bash
   cd Backend
   npm install
   ```

2. **Environment Configuration**:
   Ensure your `.env` file contains:
   ```env
   PORT=5000
   NODE_ENV=development
   ```

3. **Start the Server**:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 📡 API Endpoints

### 1. Get All Files Data
**GET** `/api/data`

Returns all files from the data directory with parsed content.

**Response Example**:
```json
{
  "success": true,
  "message": "Files read successfully",
  "data": {
    "directory": "/path/to/data",
    "totalFiles": 5,
    "successfullyParsed": 5,
    "errors": 0,
    "files": [
      {
        "fileInfo": {
          "name": "users.json",
          "extension": ".json",
          "size": 1024,
          "sizeInMB": "0.00",
          "modified": "2024-01-15T10:30:00Z"
        },
        "data": [...], // Parsed file content
        "success": true
      }
    ],
    "summary": {
      "byExtension": { ".json": 2, ".csv": 1, ".txt": 2 },
      "totalSize": 6860,
      "totalSizeInMB": "0.01"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Get Specific File
**GET** `/api/data/file/:filename`

Returns data from a specific file.

**Example**: `GET /api/data/file/users.json`

### 3. Get Directory Information
**GET** `/api/data/directory-info`

Returns summary information about the data directory without file contents.

### 4. Read Custom Directory
**POST** `/api/data/custom-directory`

Reads files from a custom directory path.

**Request Body**:
```json
{
  "directoryPath": "/absolute/path/to/directory"
}
```

## 🔒 Security Features

- **File Validation**: Only allows specific file extensions (.json, .csv, .txt, .log, .md)
- **Path Validation**: Prevents directory traversal attacks
- **Rate Limiting**: 30 requests per minute per IP
- **Input Sanitization**: Validates all input parameters
- **Error Handling**: Secure error messages without sensitive information

## 📊 Supported File Formats

### JSON Files
- Automatically parsed into JavaScript objects/arrays
- Maintains original data structure
- Handles nested objects and arrays

### CSV Files
- Parsed into array of objects
- First row treated as headers
- Automatic data type detection (numbers, booleans, strings)

### Text Files (.txt, .log, .md)
- Structured parsing with metadata
- Detects comments, key-value pairs, and timestamps
- Line-by-line analysis with type classification

## 🧪 Testing

Run the test script to verify functionality:

```bash
node test-api.js
```

This will test all file reading capabilities and display detailed results.

## 🚨 Error Handling

The API provides comprehensive error handling:

- **404**: File or directory not found
- **400**: Invalid file format or malformed request
- **403**: Permission denied
- **429**: Rate limit exceeded
- **500**: Internal server error

All errors return structured JSON responses with helpful messages.

## 📈 Performance Considerations

- Files are read synchronously for consistency
- Built-in file size limits (configurable)
- Memory-efficient parsing for large files
- Caching headers for static content

## 🔧 Configuration

Customize behavior through environment variables:

```env
MAX_FILE_SIZE=10485760    # 10MB file size limit
RATE_LIMIT_REQUESTS=30    # Requests per minute
RATE_LIMIT_WINDOW=60000   # Rate limit window in ms
```

## 📝 Logging

All file operations are logged with:
- Timestamp
- Request details
- Response time
- Success/failure status
- Error details (if any)

## 🔄 Integration with Existing Backend

The file reader API integrates seamlessly with your existing backend:

1. Import the routes in your main server file:
   ```javascript
   import dataRoutes from "./Routes/dataRoutes.js";
   app.use('/api/data', dataRoutes);
   ```

2. The API follows the same patterns as your existing routes
3. Uses the same error handling middleware
4. Compatible with your existing CORS and security settings

## 📱 React Native Frontend Integration

### API Service Setup

Create a service file to handle API calls:

```javascript
// services/fileDataService.js
const API_BASE_URL = 'http://localhost:5000/api/data';

class FileDataService {
  async getAllFiles() {
    try {
      const response = await fetch(`${API_BASE_URL}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch files');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching all files:', error);
      throw error;
    }
  }

  async getSpecificFile(filename) {
    try {
      const response = await fetch(`${API_BASE_URL}/file/${filename}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch file');
      }

      return data.data;
    } catch (error) {
      console.error(`Error fetching file ${filename}:`, error);
      throw error;
    }
  }

  async getDirectoryInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/directory-info`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch directory info');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching directory info:', error);
      throw error;
    }
  }

  async readCustomDirectory(directoryPath) {
    try {
      const response = await fetch(`${API_BASE_URL}/custom-directory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ directoryPath }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to read custom directory');
      }

      return data.data;
    } catch (error) {
      console.error('Error reading custom directory:', error);
      throw error;
    }
  }
}

export default new FileDataService();
```
