const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

// Configuração do Redis para rate limiting
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect();

// Rate limiter para rotas de autenticação
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas
    message: {
        error: 'Muitas tentativas de login. Por favor, tente novamente em 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiter para outras rotas da API
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 100, // 100 requisições por minuto
    message: {
        error: 'Muitas requisições. Por favor, tente novamente em 1 minuto.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Configuração do rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requisições por IP
    message: {
        error: 'Muitas requisições deste IP. Por favor, tente novamente mais tarde.'
    },
    standardHeaders: true, // Retorna informações de limite no header
    legacyHeaders: false, // Desabilita headers legados
});

module.exports = {
    authLimiter,
    apiLimiter,
    limiter
}; 