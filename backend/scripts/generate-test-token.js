const jwt = require('jsonwebtoken');
require('dotenv').config();

function generateTestToken() {
    try {
        const payload = {
            user: {
                id: '1', // ID do usuário de teste
                name: 'Usuário Teste',
                email: 'teste@unilago.com',
            },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '1d',
        });

        console.log('Token JWT gerado com sucesso!');
        console.log('Token:', token);
        console.log('\nUse este token no header Authorization:');
        console.log('Authorization: Bearer ' + token);
    } catch (error) {
        console.error('Erro ao gerar token:', error);
    }
}

generateTestToken();
