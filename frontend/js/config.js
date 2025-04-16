const config = {
    // URL de produção
    apiUrl: 'https://ads-unilago.onrender.com/api',
    // URL de desenvolvimento
    devApiUrl: 'http://localhost:3000/api',
    // Ambiente atual
    environment: window.location.hostname === 'localhost' ? 'development' : 'production'
};

// Log para debug
console.log('Configuração:', {
    apiUrl: config.apiUrl,
    environment: config.environment,
    hostname: window.location.hostname
});

// Função para testar a conexão com a API
async function testApiConnection() {
    try {
        console.log('Testando conexão com a API...');
        const response = await fetch(`${config.apiUrl}/test`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('Status da resposta:', response.status);
        console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('Resposta da API:', data);
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        console.error('Detalhes do erro:', {
            message: error.message,
            stack: error.stack
        });
        return false;
    }
}

// Testar a conexão quando a página carregar
document.addEventListener('DOMContentLoaded', testApiConnection); 