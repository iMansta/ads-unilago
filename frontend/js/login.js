document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const API_URL = 'http://localhost:3000/api';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Salvar token e dados do usuário
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirecionar para o feed
                window.location.href = 'feed.html';
            } else {
                showError(data.message);
            }
        } catch (error) {
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