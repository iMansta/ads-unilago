document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const API_URL = 'http://localhost:3000/api';

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const course = document.getElementById('course').value;
        const semester = document.getElementById('semester').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validações
        if (password !== confirmPassword) {
            showError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            showError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    course,
                    semester: parseInt(semester)
                })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Conta criada com sucesso! Redirecionando...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showError(data.message);
            }
        } catch (error) {
            showError('Erro ao conectar com o servidor');
        }
    });

    function showError(message) {
        showMessage(message, 'error');
    }

    function showSuccess(message) {
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