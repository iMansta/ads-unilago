const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { validationResult } = require('express-validator');
const fs = require('fs');
const { uploadToS3, deleteFromS3 } = require('../utils/s3');

// @desc    Criar um novo post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;
    const userId = req.user.id;

    // Criar o post
    const post = new Post({
      content,
      user: userId,
      images: req.files?.images || [],
      videos: req.files?.videos || [],
      attachments: req.files?.attachments || []
    });

    await post.save();

    // Popular o post com informações do usuário
    await post.populate('user', 'name avatar');

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar post' });
  }
};

// @desc    Obter todos os posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name avatar'
        }
      });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar posts' });
  }
};

// @desc    Obter um post específico
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name avatar'
        }
      });

    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar post' });
  }
};

// @desc    Atualizar um post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    // Verificar se o usuário é o dono do post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // Atualizar o post
    post.content = content;
    if (req.files?.images) post.images = req.files.images;
    if (req.files?.videos) post.videos = req.files.videos;
    if (req.files?.attachments) post.attachments = req.files.attachments;

    await post.save();

    // Popular o post atualizado
    await post.populate('user', 'name avatar');

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar post' });
  }
};

// @desc    Deletar um post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    // Verificar se o usuário é o dono do post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // Deletar todos os comentários do post
    await Comment.deleteMany({ post: req.params.id });

    // Deletar o post
    await post.remove();

    res.json({ message: 'Post removido' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao deletar post' });
  }
};

// @desc    Curtir/Descurtir um post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    // Verificar se o usuário já curtiu o post
    const likeIndex = post.likes.indexOf(req.user.id);

    if (likeIndex === -1) {
      // Adicionar curtida
      post.likes.push(req.user.id);
    } else {
      // Remover curtida
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao curtir/descurtir post' });
  }
};

// @desc    Adicionar comentário em um post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    const comment = new Comment({
      content: req.body.content,
      user: req.user.id,
      post: req.params.id
    });

    await comment.save();

    // Adicionar o comentário ao post
    post.comments.push(comment._id);
    await post.save();

    // Popular o comentário com informações do usuário
    await comment.populate('user', 'name avatar');

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao adicionar comentário' });
  }
}; 