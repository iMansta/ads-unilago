class ChatList {
    constructor() {
        this.conversations = [];
        this.container = document.getElementById('chat-list');
        this.loadConversations();
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
            this.render();
        } catch (error) {
            console.error('Erro ao carregar conversas:', error);
            showMessage('Erro ao carregar conversas', 'error');
        }
    }

    render() {
        if (this.conversations.length === 0) {
            this.container.innerHTML = '<p class="no-conversations">Nenhuma conversa encontrada</p>';
            return;
        }

        this.container.innerHTML = this.conversations.map(conversation => {
            const otherParticipant = conversation.participants.find(
                p => p._id !== currentUser._id
            );
            const unreadCount = conversation.unreadCount.get(currentUser._id) || 0;

            return `
                <div class="conversation-item" data-id="${conversation._id}">
                    <img src="${otherParticipant.avatar || '/assets/default-avatar.svg'}" 
                         alt="${otherParticipant.name}" 
                         class="conversation-avatar">
                    <div class="conversation-info">
                        <h4 class="conversation-name">${otherParticipant.name}</h4>
                        <p class="conversation-last-message">${conversation.lastMessage}</p>
                    </div>
                    <div class="conversation-meta">
                        <span class="conversation-time">${new Date(conversation.lastMessageAt).toLocaleTimeString()}</span>
                        ${unreadCount > 0 ? `
                            <span class="unread-badge">${unreadCount}</span>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Adicionar event listeners
        this.container.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const conversationId = item.dataset.id;
                chatWindow.openConversation(conversationId);
            });
        });
    }

    updateConversation(conversation) {
        const index = this.conversations.findIndex(c => c._id === conversation._id);
        if (index !== -1) {
            this.conversations[index] = conversation;
        } else {
            this.conversations.unshift(conversation);
        }
        this.render();
    }
} 