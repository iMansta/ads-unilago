// Configurações
const API_URL = config.apiUrl;
const token = localStorage.getItem('token');

// Elementos do DOM
const postInput = document.querySelector('.create-post textarea');
const submitPostBtn = document.querySelector('.submit-post');
const postsContainer = document.getElementById('posts-container');
const onlineMembersList = document.getElementById('online-members-list');

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
    const authorName = author.name || 'Usuário Desconhecido';
    const postTime = post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Data desconhecida';
    const content = post.content || '';
    
    postElement.innerHTML = `
        <div class="post-header">
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

// Carregar membros online
async function loadOnlineMembers() {
    try {
        const response = await fetch(`${API_URL}/users/online`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar membros online');
        }
        
        const members = await response.json();
        
        if (!onlineMembersList) {
            console.error('Elemento onlineMembersList não encontrado');
            return;
        }
        
        onlineMembersList.innerHTML = '';
        
        if (!Array.isArray(members) || members.length === 0) {
            onlineMembersList.innerHTML = '<p class="no-members">Nenhum membro online</p>';
            return;
        }
        
        members.forEach(member => {
            if (member) {
                const memberElement = document.createElement('div');
                memberElement.className = 'member-item';
                memberElement.innerHTML = `
                    <img src="${member.avatar || 'https://ads-unilago.onrender.com/assets/default-avatar.svg'}" 
                         alt="Avatar" 
                         class="member-avatar"
                         onerror="this.src='https://ads-unilago.onrender.com/assets/default-avatar.svg'">
                    <div class="member-info">
                        <span class="member-name">${member.name || 'Usuário Desconhecido'}</span>
                        <span class="member-status">Online</span>
                    </div>
                `;
                onlineMembersList.appendChild(memberElement);
            }
        });
    } catch (error) {
        console.error('Erro ao carregar membros online:', error);
        if (onlineMembersList) {
            onlineMembersList.innerHTML = '<p class="error-message">Erro ao carregar membros online</p>';
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
    loadOnlineMembers();
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