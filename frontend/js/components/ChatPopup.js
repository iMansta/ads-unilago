class ChatPopup {
    constructor() {
        this.API_URL = 'https://ads-unilago.onrender.com/api';
        this.token = localStorage.getItem('token');
        this.currentConversation = null;
        this.socket = null;

        // Elementos do DOM
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
        this.newConversationModal = document.getElementById('new-conversation-modal');
        this.userSearch = document.getElementById('user-search');
        this.userList = document.querySelector('.user-list');
        this.modalCloseBtn = document.getElementById('modal-close');

        // Inicializar eventos
        this.initializeEvents();
        this.initializeSocket();
        this.loadConversations();
    }

    initializeEvents() {
        // Minimizar/Maximizar popup
        this.minimizeBtn.addEventListener('click', () => {
            this.popup.classList.toggle('minimized');
        });

        // Fechar popup
        this.closeBtn.addEventListener('click', () => {
            this.popup.style.display = 'none';
        });

        // Voltar para lista de conversas
        this.chatBackBtn.addEventListener('click', () => {
            this.showConversationList();
        });

        // Enviar mensagem
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Pesquisar usuários
        this.userSearch.addEventListener('input', this.searchUsers.bind(this));

        // Fechar modal
        this.modalCloseBtn.addEventListener('click', () => {
            this.newConversationModal.style.display = 'none';
        });
    }

    initializeSocket() {
        this.socket = io(this.API_URL, {
            auth: {
                token: this.token
            }
        });

        this.socket.on('connect', () => {
            console.log('Conectado ao servidor de chat');
        });

        this.socket.on('newMessage', (message) => {
            if (this.currentConversation && message.conversationId === this.currentConversation.id) {
                this.appendMessage(message);
            } else {
                this.updateConversationList();
            }
        });
    }

    async loadConversations() {
        try {
            const response = await fetch(`${this.API_URL}/conversations`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar conversas');
            }

            const conversations = await response.json();
            this.renderConversations(conversations);
        } catch (error) {
            console.error('Erro ao carregar conversas:', error);
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
        this.chatAvatar.src = conversation.participant.avatar;
        this.chatName.textContent = conversation.participant.name;
        this.chatStatus.textContent = 'Online';

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
            this.newConversationModal.style.display = 'none';
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
}

// Inicializar o chat popup quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.chatPopup = new ChatPopup();
}); 