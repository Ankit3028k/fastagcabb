# Backend API Documentation

## 🛠️ Tech Stack
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose ODM**
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads
- **express-validator** for input validation

## 📁 Project Structure
```
Backend/
├── controllers/          # Business logic
│   ├── authController.js
│   └── userController.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   └── errorHandler.js
├── Models/              # Database models
│   └── user.js
├── Routes/              # API routes
│   ├── authroute.js
│   └── userRoutes.js
├── utils/               # Utility functions
│   ├── multerConfig.js
│   └── fileHelper.js
├── uploads/             # File uploads
│   ├── profiles/
│   └── documents/
├── Db/                  # Database connection
│   └── dbConnect.js
├── .env.example         # Environment variables template
├── index.js             # Main server file
└── package.json
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

### 3. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## 📚 API Endpoints

### 🔐 Authentication Routes (`/api/auth`)

#### 1. Register User
- **POST** `/api/auth/register`
- **Access:** Public
- **Content-Type:** `multipart/form-data`

**Required Fields:**
- `fullName` (string): Full name
- `phoneNumber` (string): 10-digit Indian phone number
- `password` (string): Minimum 6 characters
- `dateOfBirth` (date): Date of birth
- `age` (number): Age (18-100)
- `pinCode` (string): 6-digit pin code
- `state` (string): State name
- `city` (string): City name
- `address` (string): Full address
- `dealerCode` (string): Dealer code
- `profilePhoto` (file): Profile photo (required)

**Optional Fields:**
- `adharNumber` (string): 12-digit Adhar number
- `panCardNumber` (string): PAN card number
- `role` (string): 'Electrician' or 'Distributor'
- `adharCard` (file): Adhar card document
- `panCard` (file): PAN card document
- `bankDetails` (file): Bank details document

#### 2. Login User
- **POST** `/api/auth/login`
- **Access:** Public
- **Content-Type:** `application/json`

```json
{
  "phoneNumber": "9876543210",
  "password": "password123"
}
```

#### 3. Logout User
- **POST** `/api/auth/logout`
- **Access:** Private (requires JWT token)

### 👤 User Management Routes (`/api/users`)

#### 1. Get All Users
- **GET** `/api/users`
- **Access:** Private (Admin only)
- **Query Parameters:**
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 10)

#### 2. Get User by ID
- **GET** `/api/users/:id`
- **Access:** Private (Own profile or Admin)

#### 3. Update User
- **PUT** `/api/users/:id`
- **Access:** Private (Own profile or Admin)
- **Content-Type:** `application/json`

#### 4. Delete User
- **DELETE** `/api/users/:id`
- **Access:** Private (Own profile or Admin)

## 🔒 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📁 File Upload

### Supported File Types
- **Profile Photos:** JPEG, JPG, PNG, GIF
- **Documents:** JPEG, JPG, PNG, GIF, PDF, DOC, DOCX

### File Size Limits
- **Profile Photos:** 2MB maximum
- **Documents:** 5MB maximum

### File Access
Uploaded files are accessible via:
```
http://localhost:5000/uploads/profiles/filename.jpg
http://localhost:5000/uploads/documents/filename.pdf
```

## 🛡️ Security Features
- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- File type and size validation
- CORS protection

## 📝 User Roles
- **Electrician** (default): Basic user role
- **Distributor**: Business user role
- **admin**: Full system access

## ⚠️ Error Handling
All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // For validation errors
}
```

## 🧪 Testing
Use the test upload endpoint to verify file upload functionality:
- **POST** `/api/auth/test-upload`
- **Content-Type:** `multipart/form-data`