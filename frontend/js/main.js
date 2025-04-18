// Inicializa o chat popup
document.addEventListener('DOMContentLoaded', () => {
    // Carrega o Socket.IO
    const socketIoScript = document.createElement('script');
    socketIoScript.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
    socketIoScript.onload = () => {
        // Carrega o componente do chat popup
        fetch('/components/chat-popup.html')
            .then(response => response.text())
            .then(html => {
                // Insere o HTML do chat popup no final do body
                document.body.insertAdjacentHTML('beforeend', html);
                
                // Aguarda o DOM ser atualizado
                setTimeout(() => {
                    // Inicializa o chat popup
                    const chatPopup = new ChatPopup();
                    
                    // Adiciona o botão de chat na barra superior
                    const topBarActions = document.querySelector('.top-bar-actions');
                    if (topBarActions) {
                        const chatButton = document.createElement('button');
                        chatButton.className = 'action-btn';
                        chatButton.innerHTML = '<i class="fas fa-comments"></i>';
                        chatButton.onclick = () => chatPopup.show();
                        topBarActions.insertBefore(chatButton, topBarActions.firstChild);
                    }
                }, 100);
            })
            .catch(error => console.error('Erro ao carregar o chat popup:', error));
    };
    document.head.appendChild(socketIoScript);
}); 