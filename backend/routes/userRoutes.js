const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { updateUserValidation } = require('../validators/userValidator');
const auth = require('../middleware/auth');

// Rotas protegidas por autenticação
router.use(auth);

// Obter todos os usuários
router.get('/', userController.getUsers);

// Obter um usuário específico
router.get('/:id', userController.getUser);

// Atualizar um usuário
router.put('/:id', updateUserValidation, userController.updateUser);

// Deletar um usuário
router.delete('/:id', userController.deleteUser);

module.exports = router; 