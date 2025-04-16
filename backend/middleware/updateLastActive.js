const User = require('../models/User');

// Middleware para atualizar o campo lastActive do usuário
const updateLastActive = async (req, res, next) => {
    try {
        if (req.user && req.user.id) {
            await User.findByIdAndUpdate(req.user.id, { lastActive: Date.now() });
        }
        next();
    } catch (error) {
        console.error('Erro ao atualizar lastActive:', error);
        next();
    }
};

module.exports = updateLastActive;
