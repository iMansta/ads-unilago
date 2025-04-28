const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
        minlength: [2, 'O nome deve ter pelo menos 2 caracteres'],
        maxlength: [50, 'O nome não pode ter mais de 50 caracteres'],
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido'],
    },
    password: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
        select: false
    },
    registration: {
        type: String,
        required: [true, 'Matrícula é obrigatória'],
        unique: true,
        trim: true
    },
    course: {
        type: String,
        required: [true, 'Curso é obrigatório'],
        trim: true
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'away'],
        default: 'offline'
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    socketId: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        maxlength: [500, 'A bio não pode ter mais de 500 caracteres'],
    },
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    friendRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    groups: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
        },
    ],
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware para atualizar o timestamp
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Middleware para hash da senha
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para gerar token JWT
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        { 
            id: this._id,
            name: this.name,
            email: this.email,
            registration: this.registration,
            course: this.course
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    return token;
};

// Método para obter dados públicos do usuário
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.__v;
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
