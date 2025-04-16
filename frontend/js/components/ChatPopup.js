class ChatPopup {
    constructor() {
        this.popup = document.getElementById('chat-popup');
        this.header = document.getElementById('chat-popup-header');
        this.minimizeBtn = document.getElementById('chat-popup-minimize');
        this.closeBtn = document.getElementById('chat-popup-close');
        this.list = document.getElementById('chat-popup-list');
        this.window = document.getElementById('chat-popup-window');
        this.backBtn = document.getElementById('chat-popup-back');
        this.messagesContainer = document.getElementById('chat-popup-messages');
        this.messageInput = document.getElementById('chat-popup-message-input');
        this.sendBtn = document.getElementById('chat-popup-send');
        this.newChatModal = document.getElementById('chat-popup-new-chat-modal');
        this.userSearch = document.getElementById('chat-popup-user-search');
        this.userList = document.getElementById('chat-popup-user-list');
        this.closeModalBtn = document.getElementById('chat-popup-close-modal');

        this.currentConversation = null;
        this.conversations = [];
        this.isMinimized = false;

        this.setupEventListeners();
        this.loadConversations();
    }

    setupEventListeners() {
        // Minimizar/Maximizar
        this.minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        this.header.addEventListener('click', () => {
            if (this.isMinimized) {
                this.toggleMinimize();
            }
        });

        // Fechar
        this.closeBtn.addEventListener('click', () => this.close());

        // Voltar para lista de conversas
        this.backBtn.addEventListener('click', () => this.showConversationList());

        // Enviar mensagem
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Nova conversa
        this.userSearch.addEventListener('input', (e) => this.searchUsers(e.target.value));
        this.closeModalBtn.addEventListener('click', () => this.closeNewChatModal());
    }

    async loadConversations() {
        try {
            const response = await fetch(`${API_URL}/chat/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar conversas');
            }

            this.conversations = await response.json();
            this.renderConversations();
        } catch (error) {
            console.error('Erro ao carregar conversas:', error);
            showMessage('Erro ao carregar conversas', 'error');
        }
    }

    renderConversations() {
        if (this.conversations.length === 0) {
            this.list.innerHTML = '<p class="no-conversations">Nenhuma conversa encontrada</p>';
            return;
        }

        this.list.innerHTML = this.conversations.map(conversation => {
            const otherParticipant = conversation.participants.find(
                p => p._id !== currentUser._id
            );
            const unreadCount = conversation.unreadCount.get(currentUser._id) || 0;

            return `
                <div class="chat-popup-conversation" data-id="${conversation._id}">
                    <img src="${otherParticipant.avatar || '/assets/default-avatar.svg'}" 
                         alt="${otherParticipant.name}" 
                         class="chat-popup-avatar">
                    <div class="chat-popup-info">
                        <h4 class="chat-popup-name">${otherParticipant.name}</h4>
                        <p class="chat-popup-message">${conversation.lastMessage}</p>
                    </div>
                    <div class="chat-popup-meta">
                        <span class="chat-popup-time">${new Date(conversation.lastMessageAt).toLocaleTimeString()}</span>
                        ${unreadCount > 0 ? `
                            <span class="chat-popup-badge">${unreadCount}</span>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Adicionar event listeners
        this.list.querySelectorAll('.chat-popup-conversation').forEach(item => {
            item.addEventListener('click', () => {
                const conversationId = item.dataset.id;
                this.openConversation(conversationId);
            });
        });
    }

    async openConversation(conversationId) {
        try {
            const response = await fetch(`${API_URL}/chat/messages/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar mensagens');
            }

            const data = await response.json();
            this.currentConversation = {
                id: conversationId,
                ...data.conversation
            };

            this.renderMessages(data.messages);
            this.showChatWindow();
        } catch (error) {
            console.error('Erro ao abrir conversa:', error);
            showMessage('Erro ao abrir conversa', 'error');
        }
    }

    renderMessages(messages) {
        this.messagesContainer.innerHTML = messages.map(message => `
            <div class="chat-popup-message-item ${message.sender._id === currentUser._id ? 'sent' : 'received'}">
                <img src="${message.sender.avatar || '/assets/default-avatar.svg'}" 
                     alt="${message.sender.name}" 
                     class="chat-popup-message-avatar">
                <div class="chat-popup-message-content">
                    <div class="chat-popup-message-text">${message.content}</div>
                    <div class="chat-popup-message-meta">
                        <span class="message-time">
                            ${new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                        ${message.sender._id === currentUser._id ? `
                            <span class="message-status ${message.readBy.length > 1 ? 'read' : 'sent'}">
                                <i class="fas fa-check"></i>
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        this.scrollToBottom();
    }

    async sendMessage() {
        const content = this.messageInput.value.trim();
        if (!content || !this.currentConversation) return;

        try {
            const response = await fetch(`${API_URL}/chat/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversationId: this.currentConversation.id,
                    content
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar mensagem');
            }

            const message = await response.json();
            this.addMessage(message);
            this.messageInput.value = '';
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            showMessage('Erro ao enviar mensagem', 'error');
        }
    }

    addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-popup-message-item ${message.sender._id === currentUser._id ? 'sent' : 'received'}`;
        messageElement.innerHTML = `
            <img src="${message.sender.avatar || '/assets/default-avatar.svg'}" 
                 alt="${message.sender.name}" 
                 class="chat-popup-message-avatar">
            <div class="chat-popup-message-content">
                <div class="chat-popup-message-text">${message.content}</div>
                <div class="chat-popup-message-meta">
                    <span class="message-time">
                        ${new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                    ${message.sender._id === currentUser._id ? `
                        <span class="message-status sent">
                            <i class="fas fa-check"></i>
                        </span>
                    ` : ''}
                </div>
            </div>
        `;

        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    async searchUsers(query) {
        if (!query) {
            this.userList.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar usuários');
            }

            const users = await response.json();
            this.renderUserList(users);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            showMessage('Erro ao buscar usuários', 'error');
        }
    }

    renderUserList(users) {
        this.userList.innerHTML = users.map(user => `
            <div class="user-item" data-id="${user._id}">
                <img src="${user.avatar || '/assets/default-avatar.svg'}" 
                     alt="${user.name}" 
                     class="user-avatar">
                <div class="user-item-info">
                    <h4>${user.name}</h4>
                    <p>${user.email}</p>
                </div>
            </div>
        `).join('');

        // Adicionar event listeners
        this.userList.querySelectorAll('.user-item').forEach(item => {
            item.addEventListener('click', () => {
                const userId = item.dataset.id;
                this.startNewConversation(userId);
            });
        });
    }

    async startNewConversation(userId) {
        try {
            const response = await fetch(`${API_URL}/chat/conversations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participants: [currentUser._id, userId]
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao iniciar conversa');
            }

            const conversation = await response.json();
            this.closeNewChatModal();
            this.openConversation(conversation._id);
        } catch (error) {
            console.error('Erro ao iniciar conversa:', error);
            showMessage('Erro ao iniciar conversa', 'error');
        }
    }

    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.popup.classList.toggle('minimized');
    }

    showChatWindow() {
        this.list.style.display = 'none';
        this.window.classList.add('active');
    }

    showConversationList() {
        this.window.classList.remove('active');
        this.list.style.display = 'block';
    }

    close() {
        this.popup.style.display = 'none';
    }

    open() {
        this.popup.style.display = 'flex';
        this.loadConversations();
    }

    openNewChatModal() {
        this.newChatModal.classList.add('active');
    }

    closeNewChatModal() {
        this.newChatModal.classList.remove('active');
        this.userSearch.value = '';
        this.userList.innerHTML = '';
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
} 