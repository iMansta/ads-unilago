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
  const registerForm = document.getElementById('register-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const courseInput = document.getElementById('course');
  const registrationInput = document.getElementById('registration');
  const errorMessage = document.getElementById('error-message');
  const loginLink = document.getElementById('login-link');
  
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
    
    registerForm.appendChild(successMessage);
    
    setTimeout(() => {
      successMessage.remove();
    }, 3000);
  };
  
  // Função para validar o formulário
  const validateForm = () => {
    let isValid = true;
    
    // Validar nome
    if (!nameInput.value) {
      showError('Por favor, informe seu nome');
      isValid = false;
    }
    
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
    } else if (passwordInput.value.length < 6) {
      showError('A senha deve ter pelo menos 6 caracteres');
      isValid = false;
    }
    
    // Validar confirmação de senha
    if (!confirmPasswordInput.value) {
      showError('Por favor, confirme sua senha');
      isValid = false;
    } else if (passwordInput.value !== confirmPasswordInput.value) {
      showError('As senhas não coincidem');
      isValid = false;
    }
    
    // Validar curso
    if (!courseInput.value) {
      showError('Por favor, informe seu curso');
      isValid = false;
    }
    
    // Validar matrícula
    if (!registrationInput.value) {
      showError('Por favor, informe sua matrícula');
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
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Ocultar mensagem de erro
    hideError();
    
    // Validar formulário
    if (!validateForm()) {
      return;
    }
    
    try {
      // Desabilitar botão de submit
      const submitButton = registerForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Registrando...';
      
      // Criar objeto com dados do usuário
      const userData = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        course: courseInput.value,
        registration: registrationInput.value
      };
      
      // Registrar usuário
      const response = await window.api.auth.register(userData);
      
      // Exibir mensagem de sucesso
      showSuccess('Registro realizado com sucesso!');
      
      // Redirecionar para o feed
      setTimeout(() => {
        window.location.href = '/feed.html';
      }, 1000);
    } catch (error) {
      // Exibir mensagem de erro
      showError(error.message || 'Erro ao registrar. Tente novamente.');
      
      // Habilitar botão de submit
      const submitButton = registerForm.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      submitButton.textContent = 'Registrar';
    }
  });
  
  // Evento de clique no link de login
  loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/login.html';
  });
  
  // Evento de input para ocultar mensagem de erro
  nameInput.addEventListener('input', hideError);
  emailInput.addEventListener('input', hideError);
  passwordInput.addEventListener('input', hideError);
  confirmPasswordInput.addEventListener('input', hideError);
  courseInput.addEventListener('input', hideError);
  registrationInput.addEventListener('input', hideError);
}); 