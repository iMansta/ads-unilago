const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { updateUserValidation } = require('../validators/userValidator');
const auth = require('../middleware/auth');

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
            avatar: 'https://ads-unilago.onrender.com/assets/default-avatar.png',
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

module.exports = router;
