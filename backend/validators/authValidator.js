const { check } = require('express-validator');

exports.registerValidation = [
    check('name')
        .trim()
        .notEmpty()
        .withMessage('O nome é obrigatório')
        .isLength({ min: 2, max: 50 })
        .withMessage('O nome deve ter entre 2 e 50 caracteres'),
    
    check('email')
        .trim()
        .notEmpty()
        .withMessage('O email é obrigatório')
        .isEmail()
        .withMessage('Email inválido'),
    
    check('password')
        .trim()
        .notEmpty()
        .withMessage('A senha é obrigatória')
        .isLength({ min: 6 })
        .withMessage('A senha deve ter pelo menos 6 caracteres')
];

exports.loginValidation = [
    check('email')
        .trim()
        .notEmpty()
        .withMessage('O email é obrigatório')
        .isEmail()
        .withMessage('Email inválido'),
    
    check('password')
        .trim()
        .notEmpty()
        .withMessage('A senha é obrigatória')
]; 