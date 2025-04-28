const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/friends/online
// @desc    Obter amigos online
// @access  Private
router.get('/online', auth, async (req, res) => {
    try {
        console.log('Recebida requisição para /friends/online');
        console.log('Token do usuário:', req.user);

        // Obter o usuário atual
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('Usuário não encontrado:', req.user.id);
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        console.log('Usuário encontrado:', user._id);

        // Obter amigos do usuário
        const friends = await User.find({ _id: { $in: user.friends } })
            .select('name avatar lastActive')
            .sort({ lastActive: -1 });
        console.log('Amigos encontrados:', friends.length);

        // Filtrar apenas amigos online (última atividade nos últimos 5 minutos)
        const onlineFriends = friends.filter(friend => {
            const lastActive = new Date(friend.lastActive);
            const now = new Date();
            const diffMinutes = Math.floor((now - lastActive) / 1000 / 60);
            return diffMinutes < 5;
        });
        console.log('Amigos online:', onlineFriends.length);

        res.json(onlineFriends);
    } catch (error) {
        console.error('Erro ao buscar amigos online:', error);
        res.status(500).json({ message: 'Erro ao buscar amigos online' });
    }
});

module.exports = router;
