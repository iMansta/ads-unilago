const config = {
    // URL de produção
    apiUrl: 'https://ads-unilago.onrender.com/api'
};

// Log para debug
console.log('API URL:', config.apiUrl);

// Função para testar a conexão com a API
async function testApiConnection() {
    try {
        console.log('Testando conexão com a API...');
        const response = await fetch(`${config.apiUrl}/test`);
        const data = await response.json();
        console.log('Resposta da API:', data);
        return true;
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        return false;
    }
}

// Testar a conexão quando a página carregar
document.addEventListener('DOMContentLoaded', testApiConnection); 