const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { updateUserValidation } = require('../validators/userValidator');
const auth = require('../middleware/auth');
const UserService = require('../services/userService');

// Rotas protegidas por autenticação
router.use(auth);

// Obter perfil do usuário atual
router.get('/profile', (req, res) => {
    try {
        // Simulação de dados do perfil
        const userProfile = {
            _id: '1',
            name: 'Usuário Teste',
            email: 'usuario@teste.com',
            avatar: 'https://ads-unilago.onrender.com/assets/default-avatar.svg',
            course: 'Análise e Desenvolvimento de Sistemas',
            courseEmblem: 'ADS',
            semester: 5,
            createdAt: new Date(),
        };

        res.json(userProfile);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ message: 'Erro ao buscar perfil' });
    }
});

// Obter todos os usuários
router.get('/', userController.getUsers);

// Obter um usuário específico
router.get('/:id', userController.getUser);

// Atualizar um usuário
router.put('/:id', updateUserValidation, userController.updateUser);

// Deletar um usuário
router.delete('/:id', userController.deleteUser);

// Atualizar status do usuário
router.put('/status', async (req, res) => {
    try {
        const { status } = req.body;
        const user = await UserService.updateUserStatus(req.user.id, status);
        res.json(user);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Obter usuários online
router.get('/online', async (req, res) => {
    try {
        const users = await UserService.getOnlineUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Obter dados públicos do usuário
router.get('/:id/public', async (req, res) => {
    try {
        const user = await UserService.getPublicUserData(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Verificar se usuário está online
router.get('/:id/online', async (req, res) => {
    try {
        const isOnline = await UserService.isUserOnline(req.params.id);
        res.json({ isOnline });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
