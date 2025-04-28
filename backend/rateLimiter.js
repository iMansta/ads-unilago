const rateLimit = require('express-rate-limit');

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

module.exports = {
    authLimiter,
    apiLimiter
}; 