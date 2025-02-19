const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables

// Get the MongoDB URI from environment variables
const dbURI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB URI:', process.env.MONGO_URI);

        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);  // Exit process with failure
    }
};


// Connection event listeners
mongoose.connection.on('connected', () => console.log('🔗 Mongoose connected to DB'));
mongoose.connection.on('error', (err) => console.log(`⚠️ Mongoose connection error: ${err}`));
mongoose.connection.on('disconnected', () => console.log('⚡ Mongoose disconnected'));

// Export the connection function for use in server.js
module.exports = connectDB;
