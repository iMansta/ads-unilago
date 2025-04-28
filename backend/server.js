const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes');
const updateLastActive = require('./middleware/updateLastActive');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');
require('dotenv').config();
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configuração do CORS - Deve ser o primeiro middleware
app.use(
    cors({
        origin: 'https://atletica-ads-unilago-frontend.onrender.com',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
        credentials: true,
    })
);

// Middleware para JSON
app.use(express.json());

// Middleware para rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Middleware para servir arquivos estáticos
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/frontend/assets', express.static(path.join(__dirname, '../frontend/assets')));

// Middleware para log de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware para atualizar lastActive
app.use(updateLastActive);

// Configuração do Socket.IO
const io = socketIo(server, {
    cors: {
        origin: 'https://atletica-ads-unilago-frontend.onrender.com',
        methods: ['GET', 'POST'],
        credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling']
});

// Eventos do Socket.IO
io.on('connection', (socket) => {
    console.log('Novo cliente conectado:', socket.id);

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });

    socket.on('error', (error) => {
        console.error('Erro no Socket.IO:', error);
    });
});

// Rotas
app.use('/api', routes);

// Rota de health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Rota de teste
app.get('/api/test', (req, res) => {
    console.log('Test route accessed');
    console.log('Request headers:', req.headers);
    
    res.json({
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        cors: {
            origin: req.headers.origin || 'No origin',
            method: req.method,
            headers: req.headers
        }
    });
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: 'https://ads-unilago.onrender.com/assets/default-avatar.svg' },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = app;
