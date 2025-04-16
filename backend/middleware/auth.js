const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Obter token do header
    const authHeader = req.header('Authorization');

    // Verificar se não há token
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Acesso negado, token não fornecido',
        });
    }

    // Verificar se o token está no formato Bearer
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
            success: false,
            message: 'Formato de token inválido',
        });
    }

    const token = parts[1];

    try {
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Adicionar usuário à requisição
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            message: 'Token inválido',
        });
    }
};
