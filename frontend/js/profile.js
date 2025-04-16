// Configurações
const API_URL = 'https://ads-unilago.onrender.com/api';
const token = localStorage.getItem('token');

// Elementos do DOM
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const postCount = document.getElementById('post-count');
const friendCount = document.getElementById('friend-count');
const groupCount = document.getElementById('group-count');
const userPosts = document.getElementById('user-posts');
const profileInfo = document.getElementById('profile-info');
const userGroups = document.getElementById('user-groups');

// Função auxiliar para mostrar mensagens
function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

// Carregar informações do perfil
async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar perfil');
        }
        
        const user = await response.json();
        
        // Atualizar informações básicas
        profileName.textContent = user.name;
        profileEmail.textContent = user.email;
        
        // Atualizar contadores
        postCount.textContent = user.postCount || 0;
        friendCount.textContent = user.friendCount || 0;
        groupCount.textContent = user.groupCount || 0;
        
        // Atualizar informações detalhadas
        profileInfo.innerHTML = `
            <div class="info-item">
                <i class="fas fa-graduation-cap"></i>
                <span>${user.course || 'Não informado'}</span>
            </div>
            <div class="info-item">
                <i class="fas fa-calendar"></i>
                <span>${user.semester || 'Não informado'}</span>
            </div>
            <div class="info-item">
                <i class="fas fa-envelope"></i>
                <span>${user.email}</span>
            </div>
        `;
        
        // Carregar posts do usuário
        loadUserPosts(user._id);
        
        // Carregar grupos do usuário
        loadUserGroups(user._id);
        
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        showMessage('Erro ao carregar perfil');
    }
}

// Carregar posts do usuário
async function loadUserPosts(userId) {
    try {
        const response = await fetch(`${API_URL}/posts/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar posts');
        }
        
        const posts = await response.json();
        userPosts.innerHTML = '';
        
        if (posts.length === 0) {
            userPosts.innerHTML = '<p class="no-posts">Nenhum post encontrado</p>';
            return;
        }
        
        posts.forEach(post => {
            const postElement = createPostElement(post);
            userPosts.appendChild(postElement);
        });
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        showMessage('Erro ao carregar posts');
    }
}

// Carregar grupos do usuário
async function loadUserGroups(userId) {
    try {
        const response = await fetch(`${API_URL}/groups/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar grupos');
        }
        
        const groups = await response.json();
        userGroups.innerHTML = '';
        
        if (groups.length === 0) {
            userGroups.innerHTML = '<p class="no-groups">Nenhum grupo encontrado</p>';
            return;
        }
        
        groups.forEach(group => {
            const groupElement = document.createElement('div');
            groupElement.className = 'group-item';
            groupElement.innerHTML = `
                <img src="${group.courseEmblem || '/assets/default-group.png'}" alt="Emblema" class="group-emblem" onerror="this.src='/assets/default-group.png'">
                <div class="group-info">
                    <span class="group-name">${group.name}</span>
                    <span class="member-count">${group.memberCount} membros</span>
                </div>
            `;
            userGroups.appendChild(groupElement);
        });
    } catch (error) {
        console.error('Erro ao carregar grupos:', error);
        showMessage('Erro ao carregar grupos');
    }
}

// Criar elemento de post
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    
    const avatarUrl = post.author?.avatar || '/assets/default-avatar.svg';
    const authorName = post.author?.name || 'Usuário Desconhecido';
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
            ${post.image ? `<img src="${post.image}" alt="Imagem do post" class="post-image">` : ''}
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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    loadProfile();
}); 