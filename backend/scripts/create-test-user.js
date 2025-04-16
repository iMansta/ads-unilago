const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createTestUser() {
    try {
        console.log('Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conectado ao MongoDB com sucesso!');

        // Verificar se o usuário de teste já existe
        const existingUser = await User.findOne({ email: 'teste@unilago.com' });
        if (existingUser) {
            console.log('Usuário de teste já existe!');
            return;
        }

        // Criar usuário de teste
        const testUser = new User({
            name: 'Usuário Teste',
            email: 'teste@unilago.com',
            password: '123456',
            course: 'Análise e Desenvolvimento de Sistemas',
            registration: '2023001',
            avatar: 'https://ads-unilago.onrender.com/assets/default-avatar.png',
            bio: 'Usuário de teste para desenvolvimento',
        });

        await testUser.save();
        console.log('Usuário de teste criado com sucesso!');
    } catch (error) {
        console.error('Erro ao criar usuário de teste:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Desconectado do MongoDB');
    }
}

createTestUser();
