const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const commentController = require('../controllers/commentController');

// @route   POST /api/comments
// @desc    Criar um novo comentário
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('content', 'O conteúdo do comentário é obrigatório')
                .not()
                .isEmpty()
                .trim()
                .isLength({ max: 1000 })
                .withMessage('O comentário não pode ter mais de 1000 caracteres'),
            check('postId', 'O ID do post é obrigatório')
                .not()
                .isEmpty()
                .isMongoId()
                .withMessage('ID do post inválido')
        ]
    ],
    commentController.createComment
);

// @route   GET /api/comments/post/:postId
// @desc    Obter comentários de um post
// @access  Public
router.get(
    '/post/:postId',
    [
        check('postId', 'ID do post inválido')
            .isMongoId()
    ],
    commentController.getPostComments
);

// @route   PUT /api/comments/:commentId
// @desc    Atualizar um comentário
// @access  Private
router.put(
    '/:commentId',
    [
        auth,
        [
            check('content', 'O conteúdo do comentário é obrigatório')
                .not()
                .isEmpty()
                .trim()
                .isLength({ max: 1000 })
                .withMessage('O comentário não pode ter mais de 1000 caracteres'),
            check('commentId', 'ID do comentário inválido')
                .isMongoId()
        ]
    ],
    commentController.updateComment
);

// @route   DELETE /api/comments/:commentId
// @desc    Deletar um comentário
// @access  Private
router.delete(
    '/:commentId',
    [
        auth,
        check('commentId', 'ID do comentário inválido')
            .isMongoId()
    ],
    commentController.deleteComment
);

// @route   POST /api/comments/:commentId/like
// @desc    Curtir/descurtir um comentário
// @access  Private
router.post(
    '/:commentId/like',
    [
        auth,
        check('commentId', 'ID do comentário inválido')
            .isMongoId()
    ],
    commentController.toggleLike
);

module.exports = router; 