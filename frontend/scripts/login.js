document.addEventListener('DOMContentLoaded', () => {
  // Verificar se o usuário já está logado
  const checkAuth = async () => {
    const isAuthenticated = await window.api.auth.verifyToken();
    if (isAuthenticated) {
      window.location.href = '/feed.html';
    }
  };
  
  checkAuth();
  
  // Elementos do formulário
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('error-message');
  const registerLink = document.getElementById('register-link');
  
  // Função para exibir mensagem de erro
  const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  };
  
  // Função para ocultar mensagem de erro
  const hideError = () => {
    errorMessage.classList.add('hidden');
  };
  
  // Função para exibir mensagem de sucesso
  const showSuccess = (message) => {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = message;
    
    loginForm.appendChild(successMessage);
    
    setTimeout(() => {
      successMessage.remove();
    }, 3000);
  };
  
  // Função para validar o formulário
  const validateForm = () => {
    let isValid = true;
    
    // Validar email
    if (!emailInput.value) {
      showError('Por favor, informe seu email');
      isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
      showError('Por favor, informe um email válido');
      isValid = false;
    }
    
    // Validar senha
    if (!passwordInput.value) {
      showError('Por favor, informe sua senha');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Função para validar email
  const isValidEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  // Evento de submit do formulário
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Ocultar mensagem de erro
    hideError();
    
    // Validar formulário
    if (!validateForm()) {
      return;
    }
    
    try {
      // Desabilitar botão de submit
      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Entrando...';
      
      // Fazer login
      const response = await window.api.auth.login(emailInput.value, passwordInput.value);
      
      // Exibir mensagem de sucesso
      showSuccess('Login realizado com sucesso!');
      
      // Redirecionar para o feed
      setTimeout(() => {
        window.location.href = '/feed.html';
      }, 1000);
    } catch (error) {
      // Exibir mensagem de erro
      showError(error.message || 'Erro ao fazer login. Tente novamente.');
      
      // Habilitar botão de submit
      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      submitButton.textContent = 'Entrar';
    }
  });
  
  // Evento de clique no link de registro
  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/register.html';
  });
  
  // Evento de input para ocultar mensagem de erro
  emailInput.addEventListener('input', hideError);
  passwordInput.addEventListener('input', hideError);
}); 