const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'O nome é obrigatório'],
        trim: true,
        minlength: [2, 'O nome deve ter pelo menos 2 caracteres'],
        maxlength: [50, 'O nome não pode ter mais de 50 caracteres'],
    },
    email: {
        type: String,
        required: [true, 'O email é obrigatório'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido'],
    },
    password: {
        type: String,
        required: [true, 'A senha é obrigatória'],
        minlength: [6, 'A senha deve ter pelo menos 6 caracteres'],
    },
    course: {
        type: String,
        required: true,
    },
    registration: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
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
    lastActive: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Atualizar o campo updatedAt antes de salvar
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);
