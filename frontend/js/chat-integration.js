// Função para carregar o chat popup em todas as páginas
function loadChatPopup() {
    // Verificar se o usuário está logado
    const token = localStorage.getItem('token');
    if (!token) return;

    // Criar elementos necessários
    const chatPopupContainer = document.createElement('div');
    chatPopupContainer.id = 'chat-popup-container';

    // Carregar o componente do chat popup
    fetch('/components/chat-popup.html')
        .then(response => response.text())
        .then(html => {
            chatPopupContainer.innerHTML = html;
            document.body.appendChild(chatPopupContainer);

            // Carregar estilos
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/styles/chat-popup.css';
            document.head.appendChild(link);

            // Carregar scripts necessários
            const socketScript = document.createElement('script');
            socketScript.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
            socketScript.onload = () => {
                const chatScript = document.createElement('script');
                chatScript.src = '/js/components/ChatPopup.js';
                document.body.appendChild(chatScript);
            };
            document.body.appendChild(socketScript);
        })
        .catch(error => {
            console.error('Erro ao carregar o chat popup:', error);
        });
}

// Função para adicionar o botão de chat na barra de navegação
function addChatButton() {
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    const chatButton = document.createElement('a');
    chatButton.href = '#';
    chatButton.className = 'nav-item';
    chatButton.innerHTML = `
        <i class="fas fa-comments"></i>
        <span>Chat</span>
    `;

    chatButton.addEventListener('click', (e) => {
        e.preventDefault();
        const chatPopup = document.getElementById('chat-popup');
        if (chatPopup) {
            chatPopup.style.display = 'flex';
            if (chatPopup.classList.contains('minimized')) {
                chatPopup.classList.remove('minimized');
            }
        }
    });

    nav.appendChild(chatButton);
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    loadChatPopup();
    addChatButton();
}); 