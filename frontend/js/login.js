document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('loginForm');
    const API_URL = config.apiUrl;

    // Testar a conexão com a API
    const isConnected = await testApiConnection();
    if (!isConnected) {
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
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            console.log('Resposta do servidor:', response.status);
            const data = await response.json();
            console.log('Dados da resposta:', data);

            if (response.ok) {
                // Salvar token e dados do usuário
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirecionar para o feed
                window.location.href = 'feed.html';
            } else {
                showError(data.message || 'Erro ao fazer login');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            showError('Erro ao conectar com o servidor');
        }
    });

    function showError(message) {
        // Remove any existing error message
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create and show new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'var(--error-color)';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.marginTop = '10px';
        errorDiv.textContent = message;

        loginForm.insertBefore(errorDiv, loginForm.querySelector('.form-footer'));

        // Remove error message after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
}); 