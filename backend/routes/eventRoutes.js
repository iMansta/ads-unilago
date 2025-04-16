const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Rotas protegidas por autenticação
router.use(auth);

// Obter todos os eventos
router.get('/', (req, res) => {
    try {
        // Simulação de dados de eventos
        const events = [
            {
                _id: '1',
                title: 'Campeonato de Futsal',
                description: 'Campeonato interno de futsal da ADS',
                date: new Date('2024-04-15T14:00:00'),
                location: 'Ginásio da Unilago',
                organizer: '1',
                participants: ['1', '2', '3', '4'],
                createdAt: new Date(),
            },
            {
                _id: '2',
                title: 'Workshop de Programação',
                description: 'Workshop sobre desenvolvimento web',
                date: new Date('2024-04-20T19:00:00'),
                location: 'Laboratório 3',
                organizer: '1',
                participants: ['1', '2'],
                createdAt: new Date(),
            },
        ];

        res.json(events);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        res.status(500).json({ message: 'Erro ao buscar eventos' });
    }
});

// Obter um evento específico
router.get('/:id', (req, res) => {
    try {
        // Simulação de dados de um evento
        const event = {
            _id: req.params.id,
            title: 'Campeonato de Futsal',
            description: 'Campeonato interno de futsal da ADS',
            date: new Date('2024-04-15T14:00:00'),
            location: 'Ginásio da Unilago',
            organizer: '1',
            participants: ['1', '2', '3', '4'],
            createdAt: new Date(),
        };

        res.json(event);
    } catch (error) {
        console.error('Erro ao buscar evento:', error);
        res.status(500).json({ message: 'Erro ao buscar evento' });
    }
});

// Criar um novo evento
router.post('/', (req, res) => {
    try {
        const { title, description, date, location } = req.body;

        // Simulação de criação de evento
        const newEvent = {
            _id: Date.now().toString(),
            title,
            description,
            date: new Date(date),
            location,
            organizer: req.user.id,
            participants: [req.user.id],
            createdAt: new Date(),
        };

        res.status(201).json(newEvent);
    } catch (error) {
        console.error('Erro ao criar evento:', error);
        res.status(500).json({ message: 'Erro ao criar evento' });
    }
});

// Atualizar um evento
router.put('/:id', (req, res) => {
    try {
        const { title, description, date, location } = req.body;

        // Simulação de atualização de evento
        const updatedEvent = {
            _id: req.params.id,
            title,
            description,
            date: new Date(date),
            location,
            organizer: '1',
            participants: ['1', '2', '3', '4'],
            createdAt: new Date(),
        };

        res.json(updatedEvent);
    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        res.status(500).json({ message: 'Erro ao atualizar evento' });
    }
});

// Deletar um evento
router.delete('/:id', (req, res) => {
    try {
        res.json({ message: 'Evento deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar evento:', error);
        res.status(500).json({ message: 'Erro ao deletar evento' });
    }
});

// Adicionar participante ao evento
router.post('/:id/participants', (req, res) => {
    try {
        const { userId } = req.body;

        // Simulação de adição de participante
        const updatedEvent = {
            _id: req.params.id,
            title: 'Campeonato de Futsal',
            description: 'Campeonato interno de futsal da ADS',
            date: new Date('2024-04-15T14:00:00'),
            location: 'Ginásio da Unilago',
            organizer: '1',
            participants: ['1', '2', '3', '4', userId],
            createdAt: new Date(),
        };

        res.json(updatedEvent);
    } catch (error) {
        console.error('Erro ao adicionar participante:', error);
        res.status(500).json({ message: 'Erro ao adicionar participante' });
    }
});

// Remover participante do evento
router.delete('/:id/participants/:userId', (req, res) => {
    try {
        // Simulação de remoção de participante
        const updatedEvent = {
            _id: req.params.id,
            title: 'Campeonato de Futsal',
            description: 'Campeonato interno de futsal da ADS',
            date: new Date('2024-04-15T14:00:00'),
            location: 'Ginásio da Unilago',
            organizer: '1',
            participants: ['1', '2', '3', '4'],
            createdAt: new Date(),
        };

        res.json(updatedEvent);
    } catch (error) {
        console.error('Erro ao remover participante:', error);
        res.status(500).json({ message: 'Erro ao remover participante' });
    }
});

module.exports = router;
