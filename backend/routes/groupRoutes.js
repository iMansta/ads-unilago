const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Group = require('../models/group');

// Rotas protegidas por autenticação
router.use(auth);

// Obter todos os grupos
router.get('/', (req, res) => {
    try {
        // Simulação de dados de grupos
        const groups = [
            {
                _id: '1',
                name: 'Turma ADS 1º Semestre',
                description: 'Grupo para compartilhamento de materiais da turma',
                members: ['1', '2', '3', '4'],
                createdBy: '1',
                isPrivate: true,
                courseEmblem: 'ADS',
                semester: 1,
                createdAt: new Date(),
            },
            {
                _id: '2',
                name: 'Grupo de Programação',
                description: 'Grupo para discussão sobre programação',
                members: ['1', '2'],
                createdBy: '1',
                isPrivate: false,
                courseEmblem: 'ADS',
                semester: null,
                createdAt: new Date(),
            },
        ];

        res.json(groups);
    } catch (error) {
        console.error('Erro ao buscar grupos:', error);
        res.status(500).json({ message: 'Erro ao buscar grupos' });
    }
});

// Obter um grupo específico
router.get('/:id', (req, res) => {
    try {
        // Simulação de dados de um grupo
        const group = {
            _id: req.params.id,
            name: 'Turma ADS 1º Semestre',
            description: 'Grupo para compartilhamento de materiais da turma',
            members: ['1', '2', '3', '4'],
            createdBy: '1',
            isPrivate: true,
            courseEmblem: 'ADS',
            semester: 1,
            createdAt: new Date(),
        };

        res.json(group);
    } catch (error) {
        console.error('Erro ao buscar grupo:', error);
        res.status(500).json({ message: 'Erro ao buscar grupo' });
    }
});

// Criar um novo grupo
router.post('/', (req, res) => {
    try {
        const { name, description, isPrivate, courseEmblem, semester } = req.body;

        // Simulação de criação de grupo
        const newGroup = {
            _id: Date.now().toString(),
            name,
            description,
            members: [req.user.id],
            createdBy: req.user.id,
            isPrivate: isPrivate || false,
            courseEmblem,
            semester: semester || null,
            createdAt: new Date(),
        };

        res.status(201).json(newGroup);
    } catch (error) {
        console.error('Erro ao criar grupo:', error);
        res.status(500).json({ message: 'Erro ao criar grupo' });
    }
});

// Atualizar um grupo
router.put('/:id', (req, res) => {
    try {
        const { name, description, isPrivate, courseEmblem, semester } = req.body;

        // Simulação de atualização de grupo
        const updatedGroup = {
            _id: req.params.id,
            name,
            description,
            members: ['1', '2', '3', '4'],
            createdBy: '1',
            isPrivate: isPrivate || false,
            courseEmblem,
            semester: semester || null,
            createdAt: new Date(),
        };

        res.json(updatedGroup);
    } catch (error) {
        console.error('Erro ao atualizar grupo:', error);
        res.status(500).json({ message: 'Erro ao atualizar grupo' });
    }
});

// Deletar um grupo
router.delete('/:id', (req, res) => {
    try {
        res.json({ message: 'Grupo deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar grupo:', error);
        res.status(500).json({ message: 'Erro ao deletar grupo' });
    }
});

// Adicionar membro ao grupo
router.post('/:id/members', (req, res) => {
    try {
        const { userId } = req.body;

        // Simulação de adição de membro
        const updatedGroup = {
            _id: req.params.id,
            name: 'Turma ADS 1º Semestre',
            description: 'Grupo para compartilhamento de materiais da turma',
            members: ['1', '2', '3', '4', userId],
            createdBy: '1',
            isPrivate: true,
            courseEmblem: 'ADS',
            semester: 1,
            createdAt: new Date(),
        };

        res.json(updatedGroup);
    } catch (error) {
        console.error('Erro ao adicionar membro:', error);
        res.status(500).json({ message: 'Erro ao adicionar membro' });
    }
});

// Remover membro do grupo
router.delete('/:id/members/:userId', (req, res) => {
    try {
        // Simulação de remoção de membro
        const updatedGroup = {
            _id: req.params.id,
            name: 'Turma ADS 1º Semestre',
            description: 'Grupo para compartilhamento de materiais da turma',
            members: ['1', '2', '3', '4'],
            createdBy: '1',
            isPrivate: true,
            courseEmblem: 'ADS',
            semester: 1,
            createdAt: new Date(),
        };

        res.json(updatedGroup);
    } catch (error) {
        console.error('Erro ao remover membro:', error);
        res.status(500).json({ message: 'Erro ao remover membro' });
    }
});

// @route   GET /api/groups/popular
// @desc    Obter grupos populares
// @access  Public
router.get('/popular', async (req, res) => {
    try {
        // Obter grupos com mais membros
        const groups = await Group.find()
            .sort({ members: -1 })
            .limit(5)
            .select('name description members courseEmblem');

        res.json(groups);
    } catch (error) {
        console.error('Erro ao buscar grupos populares:', error);
        res.status(500).json({ message: 'Erro ao buscar grupos populares' });
    }
});

module.exports = router;
