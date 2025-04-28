const rateLimit = require('express-rate-limit');

// Limiter específico para rotas de autenticação
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // limite de 5 tentativas
    message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter geral para outras rotas da API
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 60, // limite de 60 requisições por minuto
    message: 'Muitas requisições. Tente novamente em 1 minuto.',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter }; 