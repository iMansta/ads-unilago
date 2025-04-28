const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Criar nova conversa
router.post('/conversations', auth, async (req, res) => {
    try {
        const { participants } = req.body;
        
        if (!participants || !Array.isArray(participants) || participants.length !== 2) {
            return res.status(400).json({ error: 'São necessários exatamente dois participantes' });
        }

        // Verificar se já existe uma conversa entre os participantes
        const existingConversation = await Conversation.findOne({
            participants: { $all: participants }
        });

        if (existingConversation) {
            return res.status(200).json(existingConversation);
        }

        const conversation = new Conversation({
            participants,
            unreadCount: new Map([
                [participants[0], 0],
                [participants[1], 0]
            ])
        });

        await conversation.save();
        res.status(201).json(conversation);
    } catch (error) {
        console.error('Erro ao criar conversa:', error);
        res.status(500).json({ error: 'Erro ao criar conversa' });
    }
});

// Listar conversas do usuário
router.get('/conversations', auth, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
        .populate('participants', 'name avatar')
        .sort({ lastMessageAt: -1 });

        res.json(conversations);
    } catch (error) {
        console.error('Erro ao listar conversas:', error);
        res.status(500).json({ error: 'Erro ao listar conversas' });
    }
});

// Enviar mensagem
router.post('/messages', auth, async (req, res) => {
    try {
        const { conversationId, content } = req.body;

        if (!conversationId || !content) {
            return res.status(400).json({ error: 'ID da conversa e conteúdo são obrigatórios' });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversa não encontrada' });
        }

        if (!conversation.participants.includes(req.user._id)) {
            return res.status(403).json({ error: 'Você não faz parte desta conversa' });
        }

        const message = new Message({
            conversation: conversationId,
            sender: req.user._id,
            content,
            readBy: [req.user._id]
        });

        await message.save();

        // Atualizar última mensagem da conversa
        conversation.lastMessage = content;
        conversation.lastMessageAt = Date.now();
        
        // Incrementar contador de mensagens não lidas para o outro participante
        const otherParticipant = conversation.participants.find(
            p => p.toString() !== req.user._id.toString()
        );
        conversation.unreadCount.set(
            otherParticipant.toString(),
            (conversation.unreadCount.get(otherParticipant.toString()) || 0) + 1
        );

        await conversation.save();

        // Emitir evento de nova mensagem via Socket.IO
        req.app.get('io').to(conversationId).emit('newMessage', message);

        res.status(201).json(message);
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
});

// Buscar mensagens de uma conversa
router.get('/messages/:conversationId', auth, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversa não encontrada' });
        }

        if (!conversation.participants.includes(req.user._id)) {
            return res.status(403).json({ error: 'Você não faz parte desta conversa' });
        }

        const messages = await Message.find({ conversation: conversationId })
            .populate('sender', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Marcar mensagens como lidas
        await Message.updateMany(
            {
                conversation: conversationId,
                sender: { $ne: req.user._id },
                readBy: { $ne: req.user._id }
            },
            { $push: { readBy: req.user._id } }
        );

        // Resetar contador de mensagens não lidas
        conversation.unreadCount.set(req.user._id.toString(), 0);
        await conversation.save();

        res.json({
            messages: messages.reverse(),
            totalPages: Math.ceil(await Message.countDocuments({ conversation: conversationId }) / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
});

module.exports = router; 