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
        origin: ['https://atletica-ads-unilago-frontend.onrender.com', 'http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

// Middleware para JSON
app.use(express.json());

// Middleware para servir arquivos estáticos
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/frontend/assets', express.static(path.join(__dirname, '../frontend/assets')));

// Middleware para atualizar lastActive
app.use(updateLastActive);

// Rota de teste
app.get('/api/test', (req, res) => {
    res.json({ message: 'API está funcionando!' });
});

// Rotas da API
app.use('/api', routes);

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erro interno do servidor' });
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

module.exports = app;
