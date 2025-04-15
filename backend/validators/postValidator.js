const { check } = require('express-validator');

exports.createPostValidation = [
    check('content')
        .trim()
        .notEmpty()
        .withMessage('O conteúdo do post é obrigatório')
        .isLength({ max: 5000 })
        .withMessage('O post não pode ter mais de 5000 caracteres')
];

exports.updatePostValidation = [
    check('content')
        .trim()
        .notEmpty()
        .withMessage('O conteúdo do post é obrigatório')
        .isLength({ max: 5000 })
        .withMessage('O post não pode ter mais de 5000 caracteres')
]; 