import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not defined');
        }

        // Configure mongoose connection options
        const options = {
            // Connection timeout (30 seconds)
            serverSelectionTimeoutMS: 30000,
            // Socket timeout (45 seconds)
            socketTimeoutMS: 45000,
            // Connection timeout (30 seconds)
            connectTimeoutMS: 30000,
            // Connection pool settings
            maxPoolSize: 10,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
            // Heartbeat frequency
            heartbeatFrequencyMS: 10000,
        };

        await mongoose.connect(process.env.MONGO_URI, options);
        console.log('✅ Connected to MongoDB successfully');
        console.log('📊 Database:', mongoose.connection.name);

        // Handle connection events
        mongoose.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('🔧 Please check your MONGO_URI environment variable');

        // Don't exit the process, let the app continue but log the error
        setTimeout(() => {
            console.log('🔄 Retrying database connection in 5 seconds...');
            dbConnect();
        }, 5000);
    }
}

export default dbConnect;