const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMSIsIm5hbWUiOiJVc3XDoXJpbyBUZXN0ZSIsImVtYWlsIjoidGVzdGVAdW5pbGFnby5jb20ifSwiaWF0IjoxNzQ0ODA5MDA2LCJleHAiOjE3NDQ4OTU0MDZ9.Y-yfv6puYpLRZkFAxYg3Wjh5Uv_BvCOsgn0TZ21Ll98';

async function testRoutes() {
    try {
        console.log('Testando rotas da API...\n');

        // Configuração do axios com o token
        const config = {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
        };

        // Teste de usuários
        console.log('1. Testando rotas de usuários:');
        try {
            const usersResponse = await axios.get(`${API_URL}/users`, config);
            console.log('GET /users:', usersResponse.data);
        } catch (error) {
            console.error('Erro ao testar /users:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Dados:', error.response.data);
            }
        }
        console.log('-----------------------------------\n');

        // Teste de posts
        console.log('2. Testando rotas de posts:');
        try {
            const postsResponse = await axios.get(`${API_URL}/posts`, config);
            console.log('GET /posts:', postsResponse.data);
        } catch (error) {
            console.error('Erro ao testar /posts:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Dados:', error.response.data);
            }
        }
        console.log('-----------------------------------\n');

        // Teste de grupos
        console.log('3. Testando rotas de grupos:');
        try {
            const groupsResponse = await axios.get(`${API_URL}/groups`, config);
            console.log('GET /groups:', groupsResponse.data);
        } catch (error) {
            console.error('Erro ao testar /groups:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Dados:', error.response.data);
            }
        }
        console.log('-----------------------------------\n');

        // Teste de eventos
        console.log('4. Testando rotas de eventos:');
        try {
            const eventsResponse = await axios.get(`${API_URL}/events`, config);
            console.log('GET /events:', eventsResponse.data);
        } catch (error) {
            console.error('Erro ao testar /events:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Dados:', error.response.data);
            }
        }
        console.log('-----------------------------------\n');

        // Teste de comentários
        console.log('5. Testando rotas de comentários:');
        try {
            const commentsResponse = await axios.get(`${API_URL}/comments`, config);
            console.log('GET /comments:', commentsResponse.data);
        } catch (error) {
            console.error('Erro ao testar /comments:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Dados:', error.response.data);
            }
        }
        console.log('-----------------------------------\n');

        console.log('Todos os testes concluídos!');
    } catch (error) {
        console.error('Erro ao testar rotas:', error.message);
        if (error.response) {
            console.error('Detalhes do erro:', error.response.data);
        }
    }
}

testRoutes();
