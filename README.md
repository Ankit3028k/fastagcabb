# FASTAGCAB - React Native App with Node.js Backend

A comprehensive React Native application for electrician services with SMS-based OTP authentication.

## 🚀 Features

- **User Registration & Authentication** with OTP verification
- **SMS Integration** for reliable OTP delivery
- **Multi-service Fallback System** (Infobip → Test OTP)
- **File Upload Support** for user documents
- **MongoDB Database** with user management
- **JWT Authentication** for secure sessions
- **Responsive UI** with React Native

## 📱 Tech Stack

### Frontend (React Native)
- React Native with Expo
- TypeScript
- React Navigation
- AsyncStorage for local data
- Custom SMS services with fallback

### Backend (Node.js)
- Express.js server
- MongoDB with Mongoose
- JWT authentication
- Infobip SMS API
- Multer for file uploads
- Redis for caching (optional)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Infobip account for SMS services (optional)
- Expo CLI for React Native development

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ankit3028k/fastagcabb.git
   cd fastagcabb/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Fill in your configuration values:
   ```env
   # Database
   MONGO_URI=your_mongodb_connection_string
   
   # JWT
   JWT_SECRET=your_jwt_secret_key

   # Infobip (SMS Service - Optional)
   INFOBIP_BASE_URL=your_infobip_base_url
   INFOBIP_API_KEY=your_infobip_api_key
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to the app directory**
   ```bash
   cd ../my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Update `EXPO_PUBLIC_API_URL` in your environment or app config
   - Point it to your backend server (e.g., `http://localhost:5000`)

4. **Start the development server**
   ```bash
   npx expo start
   ```

## 📧 SMS Service Configuration

### Infobip Setup (Optional)
1. Create an Infobip account at [infobip.com](https://infobip.com)
2. Get your API Key and Base URL
3. Configure SMS service in your Infobip dashboard

### Fallback Services
- **Test OTP**: Development fallback that logs OTP to console
- **Console Output**: OTP is displayed in server console for testing

## 🔐 Security Features

- Environment variables for sensitive data
- JWT token authentication
- Input validation and sanitization
- File upload restrictions
- Rate limiting for OTP requests
- Secure password hashing with bcrypt

## 📂 Project Structure

```
├── Backend/
│   ├── controllers/     # Route controllers
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # External service integrations
│   ├── middleware/     # Custom middleware
│   └── utils/          # Utility functions
├── my-app/
│   ├── app/           # App screens
│   ├── components/    # Reusable components
│   ├── contexts/      # React contexts
│   └── services/      # Frontend service integrations
```

## 🧪 Testing

### Backend Testing
```bash
cd Backend
npm run dev  # Start development server
```

### Test Credentials
- Phone: 8959305284
- Password: securePass123

## 🚀 Deployment

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy with build command: `npm install`
4. Start command: `npm start`

### Frontend Deployment
1. Build for production: `npx expo build`
2. Deploy to app stores or web hosting

## 📝 API Endpoints

- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/resend-otp` - Resend OTP

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the setup instructions

---

**Note**: Never commit `.env` files or expose API keys in your code. Always use environment variables for sensitive configuration.
