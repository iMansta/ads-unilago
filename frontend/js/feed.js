// Configurações
const API_URL = 'https://ads-unilago.onrender.com/api';
const token = localStorage.getItem('token');

// Elementos do DOM
const postInput = document.querySelector('.create-post textarea');
const submitPostBtn = document.querySelector('.submit-post');
const postsContainer = document.getElementById('posts-container');
const onlineFriendsList = document.getElementById('online-friends-list');
const popularGroupsList = document.getElementById('popular-groups-list');

// Função auxiliar para mostrar mensagens
function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

// Carregar posts
async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/posts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar posts');
        }
        
        const posts = await response.json();
        postsContainer.innerHTML = '';
        
        if (!Array.isArray(posts) || posts.length === 0) {
            postsContainer.innerHTML = '<p class="no-posts">Nenhum post encontrado</p>';
            return;
        }
        
        posts.forEach(post => {
            if (post) { // Verifica se o post existe
                const postElement = createPostElement(post);
                postsContainer.appendChild(postElement);
            }
        });
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        showMessage('Erro ao carregar posts');
    }
}

// Criar elemento de post
function createPostElement(post) {
    if (!post) return null;

    const postElement = document.createElement('div');
    postElement.className = 'post';
    
    // Usar valores padrão caso as propriedades não existam
    const author = post.author || {};
    const avatarUrl = author.avatar || '/assets/default-avatar.svg';
    const authorName = author.name || 'Usuário Desconhecido';
    const postTime = post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Data desconhecida';
    const content = post.content || '';
    
    postElement.innerHTML = `
        <div class="post-header">
            <img src="${avatarUrl}" alt="Avatar" class="user-avatar" onerror="this.src='/assets/default-avatar.svg'">
            <div class="post-info">
                <span class="user-name">${authorName}</span>
                <span class="post-time">${postTime}</span>
            </div>
        </div>
        <div class="post-content">
            <p>${content}</p>
            ${post.image ? `<img src="${post.image}" alt="Imagem do post" class="post-image" onerror="this.style.display='none'">` : ''}
        </div>
        <div class="post-actions">
            <button class="action-btn">
                <i class="fas fa-heart"></i>
                <span>Curtir</span>
            </button>
            <button class="action-btn">
                <i class="fas fa-comment"></i>
                <span>Comentar</span>
            </button>
            <button class="action-btn">
                <i class="fas fa-share"></i>
                <span>Compartilhar</span>
            </button>
        </div>
    `;
    
    return postElement;
}

// Carregar amigos online
async function loadOnlineFriends() {
    try {
        const response = await fetch(`${API_URL}/friends/online`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar amigos online');
        }
        
        const friends = await response.json();
        
        if (!onlineFriendsList) {
            console.error('Elemento onlineFriendsList não encontrado');
            return;
        }
        
        onlineFriendsList.innerHTML = '';
        
        if (!Array.isArray(friends) || friends.length === 0) {
            onlineFriendsList.innerHTML = '<p class="no-friends">Nenhum amigo online</p>';
            return;
        }
        
        friends.forEach(friend => {
            if (friend) {
                const friendElement = document.createElement('div');
                friendElement.className = 'friend-item';
                friendElement.innerHTML = `
                    <img src="${friend.avatar || '/assets/default-avatar.svg'}" alt="Avatar" class="user-avatar" onerror="this.src='/assets/default-avatar.svg'">
                    <span class="friend-name">${friend.name || 'Usuário Desconhecido'}</span>
                    <span class="online-status"></span>
                `;
                onlineFriendsList.appendChild(friendElement);
            }
        });
    } catch (error) {
        console.error('Erro ao carregar amigos online:', error);
        if (onlineFriendsList) {
            onlineFriendsList.innerHTML = '<p class="error-message">Erro ao carregar amigos online</p>';
        }
    }
}

// Carregar grupos populares
async function loadPopularGroups() {
    try {
        console.log('Iniciando carregamento de grupos populares...');
        console.log('Token:', token ? 'Presente' : 'Ausente');
        
        const response = await fetch(`${API_URL}/groups/popular`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Detalhes do erro:', errorData);
            throw new Error(`Erro ao carregar grupos populares: ${response.status}`);
        }
        
        const groups = await response.json();
        console.log('Grupos recebidos:', groups);
        
        if (!popularGroupsList) {
            console.error('Elemento popularGroupsList não encontrado');
            return;
        }
        
        popularGroupsList.innerHTML = '';
        
        if (!Array.isArray(groups) || groups.length === 0) {
            popularGroupsList.innerHTML = '<p class="no-groups">Nenhum grupo popular</p>';
            return;
        }
        
        groups.forEach(group => {
            if (group) {
                const groupElement = document.createElement('div');
                groupElement.className = 'group-item';
                groupElement.innerHTML = `
                    <img src="${group.courseEmblem || '/assets/default-group.svg'}" alt="Emblema" class="group-emblem" onerror="this.src='/assets/default-group.svg'">
                    <div class="group-info">
                        <span class="group-name">${group.name || 'Grupo sem nome'}</span>
                        <span class="member-count">${group.memberCount || 0} membros</span>
                    </div>
                `;
                popularGroupsList.appendChild(groupElement);
            }
        });
    } catch (error) {
        console.error('Erro ao carregar grupos populares:', error);
        if (popularGroupsList) {
            popularGroupsList.innerHTML = '<p class="error-message">Erro ao carregar grupos populares</p>';
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    loadPosts();
    loadOnlineFriends();
    loadPopularGroups();
});

// Evento de envio de post
if (submitPostBtn && postInput) {
    submitPostBtn.addEventListener('click', async () => {
        const content = postInput.value.trim();
        if (!content) {
            showMessage('Digite algo para publicar');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            
            if (!response.ok) {
                throw new Error('Erro ao publicar post');
            }
            
            postInput.value = '';
            showMessage('Post publicado com sucesso!', 'success');
            loadPosts();
        } catch (error) {
            console.error('Erro ao publicar post:', error);
            showMessage('Erro ao publicar post');
        }
    });
} 