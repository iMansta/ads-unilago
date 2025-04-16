// Configurações
const API_URL = 'https://ads-unilago.onrender.com/api';
const token = localStorage.getItem('token');

// Elementos do DOM
const postInput = document.querySelector('.create-post textarea');
const submitPostBtn = document.querySelector('.submit-post');
const postsContainer = document.getElementById('posts-container');
const onlineFriendsList = document.getElementById('online-friends-list');
const popularGroupsList = document.getElementById('popular-groups-list');

// Funções auxiliares
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
        const posts = await response.json();
        
        postsContainer.innerHTML = '';
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        showMessage('Erro ao carregar posts');
    }
}

// Criar elemento de post
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = `
        <div class="post-header">
            <img src="${post.author.avatar || '/assets/default-avatar.png'}" alt="Avatar" class="user-avatar">
            <div class="post-info">
                <span class="user-name">${post.author.name}</span>
                <span class="post-time">${new Date(post.createdAt).toLocaleString()}</span>
            </div>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
            ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
        </div>
        <div class="post-actions">
            <button class="action-btn like-btn" data-post-id="${post._id}">
                <i class="fas fa-heart"></i>
                <span>${post.likes || 0}</span>
            </button>
            <button class="action-btn comment-btn" data-post-id="${post._id}">
                <i class="fas fa-comment"></i>
                <span>${post.comments?.length || 0}</span>
            </button>
            <button class="action-btn share-btn" data-post-id="${post._id}">
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
        const friends = await response.json();
        
        onlineFriendsList.innerHTML = '';
        friends.forEach(friend => {
            const friendElement = document.createElement('div');
            friendElement.className = 'friend-item';
            friendElement.innerHTML = `
                <img src="${friend.avatar || '/assets/default-avatar.png'}" alt="Avatar" class="user-avatar">
                <span class="friend-name">${friend.name}</span>
                <span class="online-status"></span>
            `;
            onlineFriendsList.appendChild(friendElement);
        });
    } catch (error) {
        console.error('Erro ao carregar amigos online:', error);
    }
}

// Carregar grupos populares
async function loadPopularGroups() {
    try {
        const response = await fetch(`${API_URL}/groups/popular`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const groups = await response.json();
        
        popularGroupsList.innerHTML = '';
        groups.forEach(group => {
            const groupElement = document.createElement('div');
            groupElement.className = 'group-item';
            groupElement.innerHTML = `
                <img src="${group.courseEmblem || '/assets/default-group.png'}" alt="Emblema" class="group-emblem">
                <div class="group-info">
                    <span class="group-name">${group.name}</span>
                    <span class="member-count">${group.memberCount} membros</span>
                </div>
            `;
            popularGroupsList.appendChild(groupElement);
        });
    } catch (error) {
        console.error('Erro ao carregar grupos populares:', error);
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

submitPostBtn.addEventListener('click', async () => {
    if (!postInput) {
        console.error('Elemento postInput não encontrado');
        return;
    }

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

        if (response.ok) {
            postInput.value = '';
            loadPosts();
            showMessage('Post publicado com sucesso!', 'success');
        } else {
            throw new Error('Erro ao publicar post');
        }
    } catch (error) {
        console.error('Erro ao publicar post:', error);
        showMessage('Erro ao publicar post');
    }
}); 