const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes');
const updateLastActive = require('./middleware/updateLastActive');
require('dotenv').config();
const path = require('path');

const app = express();

// Configuração do CORS
app.use(
    cors({
        origin: '*', // Permitir todas as origens
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

// Middleware para JSON
app.use(express.json());

// Middleware para servir arquivos estáticos
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/frontend/assets', express.static(path.join(__dirname, '../frontend/assets')));

// Middleware para log de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Middleware para atualizar lastActive
app.use(updateLastActive);

// Rota de teste
app.get('/api/test', (req, res) => {
    console.log('Teste da API recebido');
    res.json({ 
        message: 'API está funcionando!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }
    });
});

// Rotas da API
app.use('/api', routes);

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro na API:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Configuração do Mongoose
mongoose.set('strictQuery', false);

// Conexão com o MongoDB
console.log('Tentando conectar ao MongoDB...');
console.log('URI:', process.env.MONGODB_URI);

mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Conectado ao MongoDB com sucesso!');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log('Ambiente:', process.env.NODE_ENV || 'development');
            console.log('CORS configurado para:', '*');
        });
    })
    .catch(err => {
        console.error('Erro ao conectar ao MongoDB:', err);
        console.error('Detalhes do erro:', {
            name: err.name,
            message: err.message,
            code: err.code,
            codeName: err.codeName,
        });
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
