const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ads-unilago';
console.log('Connecting to MongoDB...');
console.log('URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Log URI without credentials

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 45000, // Increase socket timeout
});

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: 'default-avatar.png' },
    course: { type: String, required: true },
    semester: { type: Number, required: true },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createMasterUser() {
    try {
        // Wait for connection to be established
        if (mongoose.connection.readyState !== 1) {
            console.log('Waiting for MongoDB connection...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        // Check if master user already exists
        console.log('Checking if master user exists...');
        const existingUser = await User.findOne({ email: 'higor.ferreira@unilago.com.br' });
        if (existingUser) {
            console.log('Master user already exists');
            process.exit(0);
        }

        // Create master user
        console.log('Creating master user...');
        const hashedPassword = await bcrypt.hash('Mansta01@', 10);
        const masterUser = new User({
            name: 'Higor Ferreira',
            email: 'higor.ferreira@unilago.com.br',
            password: hashedPassword,
            course: 'Análise e Desenvolvimento de Sistemas',
            semester: 1
        });

        await masterUser.save();
        console.log('Master user created successfully');
    } catch (error) {
        console.error('Error creating master user:', error);
        process.exit(1);
    } finally {
        mongoose.connection.close();
    }
}

createMasterUser(); 