const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');
const commentRoutes = require('./commentRoutes');
const groupRoutes = require('./groupRoutes');
const eventRoutes = require('./eventRoutes');
const friendRoutes = require('./friendRoutes');

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de usuário
router.use('/users', userRoutes);

// Rotas de posts
router.use('/posts', postRoutes);

// Rotas de comentários
router.use('/comments', commentRoutes);

// Rotas de grupos
router.use('/groups', groupRoutes);

// Rotas de eventos
router.use('/events', eventRoutes);

// Rotas de amigos
router.use('/friends', friendRoutes);

module.exports = router;
