class ChatPopup {
    constructor() {
        // Verificar autenticação
        this.token = localStorage.getItem('token');
        if (!this.token) {
            console.warn('Usuário não autenticado. Chat popup não será inicializado.');
            return;
        }

        // Decodificar token para obter informações do usuário
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            this.userId = payload.id;
            this.userName = payload.name;
            this.userEmail = payload.email;
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            return;
        }

        // Verificar se o elemento popup existe
        this.popupElement = document.getElementById('chat-popup');
        if (!this.popupElement) {
            console.warn('Elemento chat-popup não encontrado no DOM. Aguardando carregamento...');
            // Tentar inicializar novamente após um curto período
            setTimeout(() => this.initialize(), 1000);
            return;
        }

        this.initialize();
    }

    initialize() {
        try {
            // Configurações
            this.API_URL = window.getApiUrl();
            this.SOCKET_URL = window.getSocketUrl();
            this.currentConversation = null;
            this.socket = null;
            this.reconnectAttempts = 0;
            this.maxReconnectAttempts = 5;

            // Elementos do DOM
            this.initializeElements();
            
            // Inicializar eventos e conexão
            this.initializeEvents();
            this.initializeSocket();
            this.loadConversations();
            this.updateUserStatus('online');
        } catch (error) {
            console.error('Erro ao inicializar ChatPopup:', error);
            this.showMessage('Erro ao inicializar o chat. Por favor, recarregue a página.', 'error');
        }
    }

    initializeElements() {
        try {
            this.popup = document.getElementById('chat-popup');
            this.minimizeBtn = document.getElementById('chat-popup-minimize');
            this.closeBtn = document.getElementById('chat-popup-close');
            this.conversationList = document.getElementById('chat-popup-list');
            this.chatWindow = document.getElementById('chat-popup-window');
            this.chatBackBtn = document.getElementById('chat-back');
            this.chatAvatar = document.getElementById('chat-avatar');
            this.chatName = document.getElementById('chat-name');
            this.chatStatus = document.getElementById('chat-status');
            this.chatMessages = document.querySelector('.chat-messages');
            this.messageInput = document.getElementById('chat-message-input');
            this.sendBtn = document.getElementById('chat-send');
            this.newConversationBtn = document.getElementById('new-conversation-btn');
            this.newConversationModal = document.getElementById('new-conversation-modal');
            this.userSearch = document.getElementById('user-search');
            this.userList = document.querySelector('.user-list');
            this.modalCloseBtn = document.getElementById('modal-close');

            // Verificar se todos os elementos foram encontrados
            this.validateElements();
        } catch (error) {
            console.error('Erro ao inicializar elementos do DOM:', error);
            throw new Error('Elementos do DOM não encontrados');
        }
    }

    validateElements() {
        const requiredElements = [
            'popup', 'minimizeBtn', 'closeBtn', 'conversationList',
            'chatWindow', 'chatBackBtn', 'chatAvatar', 'chatName',
            'chatStatus', 'chatMessages', 'messageInput', 'sendBtn',
            'newConversationBtn', 'newConversationModal', 'userSearch',
            'userList', 'modalCloseBtn'
        ];

        const missingElements = requiredElements.filter(element => !this[element]);
        if (missingElements.length > 0) {
            throw new Error(`Elementos não encontrados: ${missingElements.join(', ')}`);
        }
    }

    initializeEvents() {
        // Minimizar/Maximizar popup
        this.minimizeBtn.addEventListener('click', () => {
            this.popup.classList.toggle('minimized');
            this.savePopupState();
        });

        // Fechar popup
        this.closeBtn.addEventListener('click', () => {
            this.popup.style.display = 'none';
            this.savePopupState();
        });

        // Voltar para lista de conversas
        this.chatBackBtn.addEventListener('click', () => {
            this.showConversationList();
        });

        // Enviar mensagem
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Abrir modal de nova conversa
        this.newConversationBtn.addEventListener('click', () => {
            this.newConversationModal.style.display = 'block';
            this.userSearch.focus();
        });

        // Pesquisar usuários
        this.userSearch.addEventListener('input', this.debounce(this.searchUsers.bind(this), 300));

        // Fechar modal
        this.modalCloseBtn.addEventListener('click', () => {
            this.closeNewConversationModal();
        });

        // Fechar modal ao clicar fora
        this.newConversationModal.addEventListener('click', (e) => {
            if (e.target === this.newConversationModal) {
                this.closeNewConversationModal();
            }
        });

        // Restaurar estado do popup
        this.restorePopupState();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    savePopupState() {
        const state = {
            minimized: this.popup.classList.contains('minimized'),
            visible: this.popup.style.display !== 'none'
        };
        localStorage.setItem('chatPopupState', JSON.stringify(state));
    }

    restorePopupState() {
        const savedState = localStorage.getItem('chatPopupState');
        if (savedState) {
            const state = JSON.parse(savedState);
            if (state.minimized) {
                this.popup.classList.add('minimized');
            }
            if (!state.visible) {
                this.popup.style.display = 'none';
            }
        }
    }

    initializeSocket() {
        try {
            this.socket = io(this.SOCKET_URL, {
                ...window.config.socketConfig,
                auth: {
                    token: this.token
                },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000
            });

            this.socket.on('connect', () => {
                console.log('Conectado ao servidor de chat');
                this.updateConnectionStatus(true);
                this.reconnectAttempts = 0;
            });

            this.socket.on('disconnect', () => {
                console.log('Desconectado do servidor de chat');
                this.updateConnectionStatus(false);
                this.attemptReconnect();
            });

            this.socket.on('error', (error) => {
                console.error('Erro de conexão com o servidor de chat:', error);
                this.showMessage('Erro de conexão com o servidor de chat', 'error');
            });

            this.socket.on('message', (message) => {
                this.appendMessage(message);
            });

            this.socket.on('typing', (data) => {
                if (data.userId !== this.userId) {
                    this.showTypingIndicator(data.userId);
                }
            });

            this.socket.on('stopTyping', (data) => {
                if (data.userId !== this.userId) {
                    this.hideTypingIndicator(data.userId);
                }
            });
        } catch (error) {
            console.error('Erro ao inicializar Socket.IO:', error);
            this.showMessage('Erro ao conectar com o servidor de chat', 'error');
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                this.initializeSocket();
            }, 1000 * this.reconnectAttempts);
        } else {
            console.error('Número máximo de tentativas de reconexão atingido');
        }
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('chat-status');
        if (statusElement) {
            statusElement.textContent = connected ? 'Online' : 'Offline';
            statusElement.style.color = connected ? '#4CAF50' : '#f44336';
        }
    }

    showTypingIndicator(userId) {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.id = `typing-${userId}`;
        typingIndicator.textContent = 'Digitando...';
        this.chatMessages.appendChild(typingIndicator);
        this.scrollToBottom();
    }

    hideTypingIndicator(userId) {
        const indicator = document.getElementById(`typing-${userId}`);
        if (indicator) {
            indicator.remove();
        }
    }

    async loadConversations() {
        try {
            const response = await fetch(`${this.API_URL}/conversations`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao carregar conversas: ${response.status} ${response.statusText}`);
            }

            const conversations = await response.json();
            this.renderConversations(conversations);
        } catch (error) {
            console.error('Erro ao carregar conversas:', error);
            this.showMessage('Erro ao carregar conversas', 'error');
        }
    }

    renderConversations(conversations) {
        this.conversationList.innerHTML = '';
        
        conversations.forEach(conversation => {
            const conversationElement = document.createElement('div');
            conversationElement.className = 'conversation-item';
            conversationElement.dataset.conversationId = conversation.id;
            
            conversationElement.innerHTML = `
                <img src="${conversation.participant.avatar}" alt="Avatar" class="conversation-avatar">
                <div class="conversation-info">
                    <div class="conversation-name">${conversation.participant.name}</div>
                    <div class="conversation-last-message">${conversation.lastMessage || ''}</div>
                </div>
                ${conversation.unreadCount > 0 ? 
                    `<div class="unread-badge">${conversation.unreadCount}</div>` : ''}
                <div class="conversation-time">${this.formatTime(conversation.updatedAt)}</div>
            `;

            conversationElement.addEventListener('click', () => {
                this.openConversation(conversation);
            });

            this.conversationList.appendChild(conversationElement);
        });
    }

    async openConversation(conversation) {
        this.currentConversation = conversation;
        this.showChatWindow();
        
        // Atualizar informações do chat
        const participant = conversation.participants.find(p => p.id !== this.userId);
        if (participant) {
            this.chatAvatar.src = participant.avatar;
            this.chatName.textContent = participant.name;
            this.chatStatus.textContent = participant.status === 'online' ? 'Online' : 'Offline';
        }

        try {
            const response = await fetch(`${this.API_URL}/conversations/${conversation.id}/messages`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar mensagens');
            }

            const messages = await response.json();
            this.renderMessages(messages);
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        }
    }

    renderMessages(messages) {
        this.chatMessages.innerHTML = '';
        
        messages.forEach(message => {
            this.appendMessage(message);
        });

        this.scrollToBottom();
    }

    appendMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.senderId === this.currentConversation.participant.id ? 'received' : 'sent'}`;
        
        messageElement.innerHTML = `
            <div class="message-content">${message.content}</div>
            <div class="message-time">${this.formatTime(message.createdAt)}</div>
        `;

        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    async sendMessage() {
        const content = this.messageInput.value.trim();
        if (!content || !this.currentConversation) return;

        try {
            const response = await fetch(`${this.API_URL}/conversations/${this.currentConversation.id}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar mensagem');
            }

            const message = await response.json();
            this.appendMessage(message);
            this.messageInput.value = '';
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        }
    }

    async searchUsers() {
        const query = this.userSearch.value.trim();
        if (query.length < 2) return;

        try {
            const response = await fetch(`${this.API_URL}/users/search?q=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao pesquisar usuários');
            }

            const users = await response.json();
            this.renderUserSearchResults(users);
        } catch (error) {
            console.error('Erro ao pesquisar usuários:', error);
        }
    }

    renderUserSearchResults(users) {
        this.userList.innerHTML = '';
        
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            
            userElement.innerHTML = `
                <img src="${user.avatar}" alt="Avatar" class="user-avatar">
                <div class="user-name">${user.name}</div>
            `;

            userElement.addEventListener('click', () => {
                this.startNewConversation(user);
            });

            this.userList.appendChild(userElement);
        });
    }

    async startNewConversation(user) {
        try {
            const response = await fetch(`${this.API_URL}/conversations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ participantId: user.id })
            });

            if (!response.ok) {
                throw new Error('Erro ao iniciar conversa');
            }

            const conversation = await response.json();
            this.closeNewConversationModal();
            this.openConversation(conversation);
        } catch (error) {
            console.error('Erro ao iniciar conversa:', error);
        }
    }

    showChatWindow() {
        this.conversationList.style.display = 'none';
        this.chatWindow.style.display = 'flex';
    }

    showConversationList() {
        this.chatWindow.style.display = 'none';
        this.conversationList.style.display = 'block';
        this.currentConversation = null;
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    closeNewConversationModal() {
        this.newConversationModal.style.display = 'none';
        this.userSearch.value = '';
        this.userList.innerHTML = '';
    }

    async updateUserStatus(status) {
        try {
            const response = await fetch(`${this.API_URL}/users/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error(`Erro ao atualizar status: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    }

    showMessage(message, type = 'error') {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type}`;
        messageElement.textContent = message;
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }
}

// Inicializar o chat popup quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.chatPopup = new ChatPopup();
}); 