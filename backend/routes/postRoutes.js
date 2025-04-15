const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Rotas públicas
router.get('/', postController.getPosts);
router.get('/:id', postController.getPost);

// Rotas protegidas
router.use(auth);

// Criar um novo post
router.post('/', upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 },
  { name: 'attachments', maxCount: 3 }
]), postController.createPost);

// Buscar posts do feed
router.get('/feed', postController.getFeedPosts);

// Curtir/descurtir um post
router.post('/:id/like', postController.toggleLike);

// Adicionar comentário
router.post('/:id/comments', postController.addComment);

// Deletar um post
router.delete('/:id', postController.deletePost);

// Atualizar um post
router.put('/:id', postController.updatePost);

module.exports = router; 