const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

// Configuração do Redis para rate limiting
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect();

// Limite para autenticação (mais restritivo)
const authLimiter = rateLimit({
    store: new RedisStore({
        client: redisClient,
        prefix: 'auth:'
    }),
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas por IP
    message: {
        success: false,
        message: 'Muitas tentativas de login. Por favor, tente novamente mais tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Limite para API (menos restritivo)
const apiLimiter = rateLimit({
    store: new RedisStore({
        client: redisClient,
        prefix: 'api:'
    }),
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 100, // 100 requisições por IP
    message: {
        success: false,
        message: 'Muitas requisições. Por favor, tente novamente mais tarde.'
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