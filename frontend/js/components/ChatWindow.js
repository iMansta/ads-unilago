class ChatWindow {
    constructor() {
        this.currentConversation = null;
        this.messages = [];
        this.page = 1;
        this.hasMore = true;
        this.container = document.getElementById('chat-window');
        this.messagesContainer = document.getElementById('messages-container');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-message');
        this.loading = false;

        // Configurar Socket.IO
        this.socket = io(API_URL, {
            auth: {
                token: localStorage.getItem('token')
            }
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Enviar mensagem
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Carregar mais mensagens ao rolar
        this.messagesContainer.addEventListener('scroll', () => {
            if (this.messagesContainer.scrollTop === 0 && this.hasMore && !this.loading) {
                this.loadMoreMessages();
            }
        });

        // Eventos do Socket.IO
        this.socket.on('newMessage', (message) => {
            if (message.conversation === this.currentConversation?._id) {
                this.addMessage(message);
                this.scrollToBottom();
            }
        });
    }

    async openConversation(conversationId) {
        this.currentConversation = conversationId;
        this.messages = [];
        this.page = 1;
        this.hasMore = true;
        
        // Entrar na sala do Socket.IO
        this.socket.emit('joinConversation', conversationId);
        
        // Carregar mensagens
        await this.loadMessages();
        
        // Mostrar janela de chat
        this.container.classList.add('active');
    }

    async loadMessages() {
        if (this.loading || !this.hasMore) return;
        
        this.loading = true;
        try {
            const response = await fetch(
                `${API_URL}/chat/messages/${this.currentConversation}?page=${this.page}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao carregar mensagens');
            }

            const data = await response.json();
            this.messages = [...data.messages, ...this.messages];
            this.hasMore = data.currentPage < data.totalPages;
            this.page++;

            this.renderMessages();
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
            showMessage('Erro ao carregar mensagens', 'error');
        } finally {
            this.loading = false;
        }
    }

    async loadMoreMessages() {
        await this.loadMessages();
    }

    async sendMessage() {
        const content = this.messageInput.value.trim();
        if (!content) return;

        try {
            const response = await fetch(`${API_URL}/chat/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversationId: this.currentConversation,
                    content
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar mensagem');
            }

            this.messageInput.value = '';
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            showMessage('Erro ao enviar mensagem', 'error');
        }
    }

    addMessage(message) {
        this.messages.push(message);
        this.renderMessages();
    }

    renderMessages() {
        this.messagesContainer.innerHTML = this.messages.map(message => `
            <div class="message ${message.sender._id === currentUser._id ? 'sent' : 'received'}">
                <img src="${message.sender.avatar || '/assets/default-avatar.svg'}" 
                     alt="${message.sender.name}" 
                     class="message-avatar">
                <div class="message-content">
                    <div class="message-text">${message.content}</div>
                    <div class="message-meta">
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

        if (this.messages.length > 0) {
            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
} 