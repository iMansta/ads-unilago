const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'O conteúdo do post é obrigatório'],
        trim: true,
        maxlength: [5000, 'O post não pode ter mais de 5000 caracteres']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    images: [{
        type: String
    }],
    videos: [{
        type: String
    }],
    attachments: [{
        type: String
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    visibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Índices para melhorar a performance das consultas
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ visibility: 1 });

// Atualizar o campo updatedAt antes de salvar
postSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Método para formatar o post antes de enviar como resposta
postSchema.methods.toJSON = function() {
  const post = this.toObject();
  post.id = post._id;
  delete post._id;
  delete post.__v;
  return post;
};

module.exports = mongoose.model('Post', postSchema); 