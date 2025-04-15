const { check } = require('express-validator');

exports.updateUserValidation = [
    check('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('O nome é obrigatório')
        .isLength({ min: 2, max: 50 })
        .withMessage('O nome deve ter entre 2 e 50 caracteres'),
    
    check('email')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('O email é obrigatório')
        .isEmail()
        .withMessage('Email inválido'),
    
    check('password')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('A senha é obrigatória')
        .isLength({ min: 6 })
        .withMessage('A senha deve ter pelo menos 6 caracteres'),
    
    check('avatar')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('O avatar é obrigatório')
        .isURL()
        .withMessage('URL do avatar inválida')
]; 