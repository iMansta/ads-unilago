document.addEventListener('DOMContentLoaded', async () => {
    const registerForm = document.getElementById('registerForm');
    // Usar a URL da API diretamente para evitar problemas de cache
    const API_URL = 'https://ads-unilago.onrender.com/api';

    console.log('Inicializando página de registro...');
    console.log('API URL configurada:', API_URL);

    // Testar a conexão com a API
    console.log('Testando conexão com a API...');
    try {
        const response = await fetch(`${API_URL}/test`);
        const data = await response.json();
        console.log('Resposta da API:', data);
        console.log('Conexão com a API estabelecida com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        showError('Não foi possível conectar com o servidor. Por favor, tente novamente mais tarde.');
        return;
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Formulário de registro submetido');

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const course = document.getElementById('course').value;
        const semester = document.getElementById('semester').value;

        // Validação básica
        if (!name || !email || !password || !course || !semester) {
            showError('Por favor, preencha todos os campos');
            return;
        }

        try {
            console.log('Enviando dados para registro...');
            console.log('URL da API:', `${API_URL}/register`);
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, course, semester })
            });

            console.log('Status da resposta:', response.status);
            const data = await response.json();
            console.log('Dados da resposta:', data);

            if (response.ok) {
                console.log('Registro realizado com sucesso!');
                showSuccess('Registro realizado com sucesso! Redirecionando...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                console.error('Erro no registro:', data.message);
                showError(data.message || 'Erro ao registrar usuário');
            }
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            showError('Erro ao conectar com o servidor. Por favor, tente novamente mais tarde.');
        }
    });

    function showError(message) {
        console.error('Erro:', message);
        showMessage(message, 'error');
    }

    function showSuccess(message) {
        console.log('Sucesso:', message);
        showMessage(message, 'success');
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

        registerForm.insertBefore(messageDiv, registerForm.querySelector('.form-footer'));

        // Remove message after 3 seconds if it's an error
        if (type === 'error') {
            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
    }
}); 