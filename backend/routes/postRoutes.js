const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Obter todos os posts
router.get('/', async (req, res) => {
    try {
        console.log('Recebida requisição para /posts');
        const posts = await Post.find()
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 });
        console.log('Posts encontrados:', posts.length);
        res.json(posts);
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        res.status(500).json({ message: 'Erro ao buscar posts' });
    }
});

// Obter um post específico
router.get('/:id', async (req, res) => {
    try {
        console.log('Recebida requisição para /posts/' + req.params.id);
        const post = await Post.findById(req.params.id)
            .populate('author', 'name avatar');
        if (!post) {
            return res.status(404).json({ message: 'Post não encontrado' });
        }
        res.json(post);
    } catch (error) {
        console.error('Erro ao buscar post:', error);
        res.status(500).json({ message: 'Erro ao buscar post' });
    }
});

// Rotas protegidas
router.use(auth);

// Criar um novo post
router.post(
    '/',
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'videos', maxCount: 2 },
        { name: 'attachments', maxCount: 3 },
    ]),
    postController.createPost
);

// Curtir/descurtir um post
router.post('/:id/like', postController.toggleLike);

// Adicionar comentário
router.post('/:id/comments', postController.addComment);

// Deletar um post
router.delete('/:id', postController.deletePost);

// Atualizar um post
router.put('/:id', postController.updatePost);

module.exports = router;
