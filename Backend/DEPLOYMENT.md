# Deployment Guide for Render

## Environment Variables Required

Set these environment variables in your Render dashboard:

### Required Variables
```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/electrician-app?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-production-key-here
JWT_EXPIRES_IN=7d
```

### Optional Variables
```
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/
CLIENT_URL=https://your-frontend-domain.com
```

## Build Command
```
npm install
```

## Start Command
```
npm start
```

## Root Directory
```
Backend
```

## Troubleshooting

### 1. 500 Error on Login
- Check if MONGO_URI is set correctly
- Verify JWT_SECRET is configured
- Check server logs for database connection errors

### 2. Route Not Found Errors
- Ensure the server is using the correct index.js file
- Verify all routes are properly imported and configured

### 3. Database Connection Issues
- Use MongoDB Atlas for production
- Whitelist Render's IP addresses in MongoDB Atlas
- Check connection string format

### 4. Environment Variables
- All environment variables must be set in Render dashboard
- Don't commit .env files to git for production

## Testing the Deployment

After deployment, test these endpoints:

1. Health check: `GET https://your-app.onrender.com/`
2. Login: `POST https://your-app.onrender.com/api/auth/login`
3. Register: `POST https://your-app.onrender.com/api/auth/register`

## Common Issues

1. **Cold starts**: Render free tier has cold starts, first request may be slow
2. **Database timeout**: Increase MongoDB connection timeout
3. **File uploads**: Ensure upload directory exists and has proper permissions
