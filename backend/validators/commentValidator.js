const { check } = require('express-validator');

exports.createCommentValidation = [
    check('content')
        .trim()
        .notEmpty()
        .withMessage('O conteúdo do comentário é obrigatório')
        .isLength({ max: 1000 })
        .withMessage('O comentário não pode ter mais de 1000 caracteres'),
    
    check('postId')
        .notEmpty()
        .withMessage('O ID do post é obrigatório')
        .isMongoId()
        .withMessage('ID do post inválido')
];

exports.updateCommentValidation = [
    check('content')
        .trim()
        .notEmpty()
        .withMessage('O conteúdo do comentário é obrigatório')
        .isLength({ max: 1000 })
        .withMessage('O comentário não pode ter mais de 1000 caracteres')
]; 