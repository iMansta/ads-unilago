document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('loginForm');
    const API_URL = window.config.apiUrl;

    // Testar a conexão com a API
    try {
        const response = await fetch(`${API_URL}/test`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'include'
        });
        const data = await response.json();
        console.log('Resposta da API:', data);
        console.log('Conexão com a API estabelecida com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        showError('Não foi possível conectar com o servidor. Por favor, tente novamente mais tarde.');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            console.log('Tentando fazer login...');
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            console.log('Resposta do servidor:', response.status);
            const data = await response.json();
            console.log('Dados da resposta:', data);

            if (response.ok) {
                console.log('Login realizado com sucesso!');
                // Salvar o token no localStorage
                localStorage.setItem('token', data.token);
                // Redirecionar para a página principal
                window.location.href = 'feed.html';
            } else {
                console.error('Erro no login:', data.message);
                showError(data.message || 'Erro ao fazer login');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            showError('Erro ao conectar com o servidor. Por favor, tente novamente mais tarde.');
        }
    });

    function showError(message) {
        console.error('Erro:', message);
        showMessage(message, 'error');
    }

    function showMessage(message, type) {
        // Remove any existing message
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create and show new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.style.color = type === 'error' ? 'var(--error-color)' : 'var(--success-color)';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.marginTop = '10px';
        messageDiv.style.padding = '10px';
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.backgroundColor = type === 'error' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)';
        messageDiv.textContent = message;

        loginForm.insertBefore(messageDiv, loginForm.querySelector('.form-footer'));

        // Remove message after 3 seconds if it's an error
        if (type === 'error') {
            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
    }
}); 