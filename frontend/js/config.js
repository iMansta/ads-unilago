const config = {
    // URL de produção
    apiUrl: 'https://ads-unilago.onrender.com/api',
    // URL de desenvolvimento
    devApiUrl: 'http://localhost:3000/api',
    // Ambiente atual
    environment: window.location.hostname === 'localhost' ? 'development' : 'production',
    // Configurações do Socket.IO
    socketConfig: {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        transports: ['websocket', 'polling']
    },
    // Configurações de retry
    retryConfig: {
        maxRetries: 3,
        retryDelay: 1000,
        retryStatusCodes: [408, 500, 502, 503, 504]
    }
};

// Validação das configurações
function validateConfig() {
    if (!config.apiUrl || !config.devApiUrl) {
        throw new Error('URLs da API não configuradas');
    }
    if (!config.socketConfig) {
        throw new Error('Configurações do Socket.IO não definidas');
    }
    return true;
}

// Log para debug
console.log('Configuração:', {
    apiUrl: config.apiUrl,
    environment: config.environment,
    hostname: window.location.hostname,
    socketConfig: config.socketConfig,
    retryConfig: config.retryConfig
});

// Função para testar a conexão com a API
async function testApiConnection() {
    let retryCount = 0;
    
    while (retryCount < config.retryConfig.maxRetries) {
        try {
            console.log(`Testando conexão com a API (tentativa ${retryCount + 1})...`);
            const response = await fetch(`${config.apiUrl}/test`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            console.log('Status da resposta:', response.status);
            
            if (!response.ok) {
                if (config.retryConfig.retryStatusCodes.includes(response.status)) {
                    throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
                }
                throw new Error(`Erro não recuperável: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Resposta da API:', data);
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error(`Erro ao conectar com a API (tentativa ${retryCount + 1}):`, error);
            
            if (retryCount < config.retryConfig.maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, config.retryConfig.retryDelay));
                retryCount++;
                continue;
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Função para obter a URL da API baseada no ambiente
function getApiUrl() {
    if (!validateConfig()) {
        throw new Error('Configuração inválida');
    }
    return config.environment === 'development' ? config.devApiUrl : config.apiUrl;
}

// Função para obter a URL do Socket.IO
function getSocketUrl() {
    const apiUrl = getApiUrl();
    return apiUrl.replace('/api', '');
}

// Função para obter headers padrão
function getDefaultHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// Testar a conexão quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    try {
        validateConfig();
        const result = await testApiConnection();
        if (!result.success) {
            console.error('Falha na conexão com a API:', result.error);
            // Aqui você pode adicionar lógica para mostrar uma mensagem ao usuário
        }
    } catch (error) {
        console.error('Erro ao validar configuração:', error);
    }
});

// Exportar configurações e funções úteis
window.config = config;
window.getApiUrl = getApiUrl;
window.getSocketUrl = getSocketUrl;
window.getDefaultHeaders = getDefaultHeaders; 