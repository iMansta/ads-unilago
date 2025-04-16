const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { validationResult } = require('express-validator');

// @desc    Obter todos os comentários
// @route   GET /api/comments
// @access  Public
exports.getAllComments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const comments = await Comment.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name avatar')
            .populate('post', 'title');

        const total = await Comment.countDocuments();

        res.json({
            comments,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalComments: total,
        });
    } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        res.status(500).json({ message: 'Erro ao buscar comentários' });
    }
};

// @desc    Criar um novo comentário
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { content, postId } = req.body;
        const userId = req.user.id;

        // Verificar se o post existe
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post não encontrado' });
        }

        // Criar o comentário
        const comment = new Comment({
            content,
            author: userId,
            post: postId,
        });

        await comment.save();

        // Popular os detalhes do autor
        await comment.populate('author', 'name avatar');

        res.status(201).json(comment);
    } catch (error) {
        console.error('Erro ao criar comentário:', error);
        res.status(500).json({ message: 'Erro ao criar comentário' });
    }
};

// @desc    Obter comentários de um post
// @route   GET /api/comments/post/:postId
// @access  Private
exports.getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const comments = await Comment.find({ post: postId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name avatar');

        const total = await Comment.countDocuments({ post: postId });

        res.json({
            comments,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalComments: total,
        });
    } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        res.status(500).json({ message: 'Erro ao buscar comentários' });
    }
};

// @desc    Atualizar um comentário
// @route   PUT /api/comments/:commentId
// @access  Private
exports.updateComment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comentário não encontrado' });
        }

        // Verificar se o usuário é o autor do comentário
        if (comment.author.toString() !== userId) {
            return res.status(401).json({ message: 'Não autorizado' });
        }

        comment.content = content;
        await comment.save();

        // Popular os detalhes do autor
        await comment.populate('author', 'name avatar');

        res.json(comment);
    } catch (error) {
        console.error('Erro ao atualizar comentário:', error);
        res.status(500).json({ message: 'Erro ao atualizar comentário' });
    }
};

// @desc    Deletar um comentário
// @route   DELETE /api/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comentário não encontrado' });
        }

        // Verificar se o usuário é o autor do comentário
        if (comment.author.toString() !== userId) {
            return res.status(401).json({ message: 'Não autorizado' });
        }

        await comment.remove();
        res.json({ message: 'Comentário removido com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar comentário:', error);
        res.status(500).json({ message: 'Erro ao deletar comentário' });
    }
};

// @desc    Curtir/Descurtir um comentário
// @route   POST /api/comments/:commentId/like
// @access  Private
exports.toggleLike = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comentário não encontrado' });
        }

        const likeIndex = comment.likes.indexOf(userId);
        if (likeIndex === -1) {
            // Adicionar like
            comment.likes.push(userId);
        } else {
            // Remover like
            comment.likes.splice(likeIndex, 1);
        }

        await comment.save();
        res.json(comment);
    } catch (error) {
        console.error('Erro ao curtir/descurtir comentário:', error);
        res.status(500).json({ message: 'Erro ao curtir/descurtir comentário' });
    }
};
