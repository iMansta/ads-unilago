const winston = require('winston');
const { format } = winston;
const path = require('path');

// Configuração do logger de segurança
const securityLogger = winston.createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/security.log'),
            level: 'info'
        }),
        new winston.transports.Console({
            level: 'info'
        })
    ]
});

// Middleware para logging de segurança
const securityLogging = (req, res, next) => {
    const start = Date.now();

    // Log de requisições suspeitas
    const logSuspiciousRequest = (statusCode) => {
        const suspiciousPatterns = [
            { pattern: /<script>/i, type: 'XSS' },
            { pattern: /SELECT.*FROM/i, type: 'SQL Injection' },
            { pattern: /eval\(/i, type: 'Code Injection' },
            { pattern: /\.\.\//i, type: 'Path Traversal' }
        ];

        for (const pattern of suspiciousPatterns) {
            if (pattern.pattern.test(JSON.stringify(req.body)) || 
                pattern.pattern.test(req.url) || 
                pattern.pattern.test(JSON.stringify(req.headers))) {
                securityLogger.warn({
                    type: 'SUSPICIOUS_REQUEST',
                    pattern: pattern.type,
                    method: req.method,
                    url: req.url,
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    statusCode: statusCode,
                    timestamp: new Date().toISOString()
                });
                break;
            }
        }
    };

    // Log de erros de autenticação
    const logAuthError = (error) => {
        securityLogger.error({
            type: 'AUTH_ERROR',
            method: req.method,
            url: req.url,
            ip: req.ip,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    };

    // Log de requisições bem-sucedidas
    const logSuccess = () => {
        const duration = Date.now() - start;
        securityLogger.info({
            type: 'REQUEST_SUCCESS',
            method: req.method,
            url: req.url,
            ip: req.ip,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
        });
    };

    // Interceptar respostas
    const originalSend = res.send;
    res.send = function (body) {
        logSuspiciousRequest(res.statusCode);
        if (res.statusCode >= 400) {
            logAuthError(new Error(body));
        } else {
            logSuccess();
        }
        return originalSend.call(this, body);
    };

    next();
};

module.exports = securityLogging; 