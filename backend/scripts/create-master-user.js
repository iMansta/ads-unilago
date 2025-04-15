const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ads-unilago';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
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
        // Check if master user already exists
        const existingUser = await User.findOne({ email: 'higor.ferreira@unilago.com.br' });
        if (existingUser) {
            console.log('Master user already exists');
            process.exit(0);
        }

        // Create master user
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