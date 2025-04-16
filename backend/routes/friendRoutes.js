const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/friends/online
// @desc    Obter amigos online
// @access  Private
router.get('/online', auth, async (req, res) => {
    try {
        // Obter o usuário atual
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Obter amigos do usuário
        const friends = await User.find({ _id: { $in: user.friends } })
            .select('name avatar lastActive')
            .sort({ lastActive: -1 });

        // Filtrar apenas amigos online (última atividade nos últimos 5 minutos)
        const onlineFriends = friends.filter(friend => {
            const lastActive = new Date(friend.lastActive);
            const now = new Date();
            const diffMinutes = Math.floor((now - lastActive) / 1000 / 60);
            return diffMinutes < 5;
        });

        res.json(onlineFriends);
    } catch (error) {
        console.error('Erro ao buscar amigos online:', error);
        res.status(500).json({ message: 'Erro ao buscar amigos online' });
    }
});

module.exports = router;
