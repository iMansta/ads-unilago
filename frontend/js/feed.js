// Configurações
let token = localStorage.getItem('token');

// Elementos do DOM
const postsContainer = document.getElementById('posts-container');
const createPostForm = document.getElementById('create-post-form');
const postContent = document.getElementById('post-content');
const onlineMembersList = document.getElementById('online-members-list');

// Funções auxiliares
function showMessage(message, type = 'error') {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// Carregar posts
async function loadPosts() {
    try {
        const response = await fetch(`${window.getApiUrl()}/posts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar posts');
        }
        
        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        showMessage(error.message);
    }
}

// Renderizar posts
function renderPosts(posts) {
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Criar elemento de post
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.dataset.postId = post.id;
    
    postElement.innerHTML = `
        <div class="post-header">
            <div class="post-info">
                <img src="${post.author.avatar}" alt="${post.author.name}" class="user-avatar">
                <div class="post-info-text">
                    <span class="user-name">${post.author.name}</span>
                    <span class="post-time">${new Date(post.createdAt).toLocaleString()}</span>
                </div>
            </div>
            <button class="action-btn" onclick="togglePostOptions(this)">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
            ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
        </div>
        <div class="post-stats">
            <span>${post.likes} curtidas</span>
            <span>${post.comments} comentários</span>
        </div>
        <div class="post-actions">
            <button onclick="toggleLike(this)" class="${post.isLiked ? 'active' : ''}">
                <i class="fas fa-thumbs-up"></i>
                <span>Curtir</span>
            </button>
            <button onclick="toggleComments(this)">
                <i class="fas fa-comment"></i>
                <span>Comentar</span>
            </button>
            <button onclick="sharePost(this)">
                <i class="fas fa-share"></i>
                <span>Compartilhar</span>
            </button>
        </div>
        <div class="comments-section" style="display: none;">
            <div class="comments-list"></div>
            <div class="comment-input">
                <img src="${localStorage.getItem('userAvatar')}" alt="Your avatar" class="comment-avatar">
                <input type="text" placeholder="Escreva um comentário..." onkeypress="handleCommentKeyPress(event, this)">
            </div>
        </div>
    `;
    
    return postElement;
}

// Toggle like
async function toggleLike(button) {
    const postElement = button.closest('.post');
    const postId = postElement.dataset.postId;
    
    try {
        const response = await fetch(`${window.getApiUrl()}/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao curtir post');
        }
        
        const result = await response.json();
        button.classList.toggle('active');
        
        // Atualizar contador de likes
        const statsElement = postElement.querySelector('.post-stats');
        const likesCount = statsElement.querySelector('span');
        likesCount.textContent = `${result.likes} curtidas`;
    } catch (error) {
        showMessage(error.message);
    }
}

// Toggle comentários
function toggleComments(button) {
    const postElement = button.closest('.post');
    const commentsSection = postElement.querySelector('.comments-section');
    const commentsList = postElement.querySelector('.comments-list');
    
    if (commentsSection.style.display === 'none') {
        loadComments(postElement.dataset.postId, commentsList);
    }
    
    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
}

// Carregar comentários
async function loadComments(postId, commentsList) {
    try {
        const response = await fetch(`${window.getApiUrl()}/posts/${postId}/comments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar comentários');
        }
        
        const comments = await response.json();
        renderComments(comments, commentsList);
    } catch (error) {
        showMessage(error.message);
    }
}

// Renderizar comentários
function renderComments(comments, commentsList) {
    commentsList.innerHTML = '';
    
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        commentElement.innerHTML = `
            <img src="${comment.author.avatar}" alt="${comment.author.name}" class="comment-avatar">
            <div class="comment-content">
                <span class="comment-author">${comment.author.name}</span>
                <p>${comment.content}</p>
            </div>
        `;
        
        commentsList.appendChild(commentElement);
    });
}

// Adicionar comentário
async function addComment(postId, content) {
    try {
        const response = await fetch(`${window.getApiUrl()}/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });
        
        if (!response.ok) {
            throw new Error('Erro ao adicionar comentário');
        }
        
        const comment = await response.json();
        const postElement = document.querySelector(`.post[data-post-id="${postId}"]`);
        const commentsList = postElement.querySelector('.comments-list');
        
        // Adicionar novo comentário à lista
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        commentElement.innerHTML = `
            <img src="${comment.author.avatar}" alt="${comment.author.name}" class="comment-avatar">
            <div class="comment-content">
                <span class="comment-author">${comment.author.name}</span>
                <p>${comment.content}</p>
            </div>
        `;
        
        commentsList.appendChild(commentElement);
        
        // Atualizar contador de comentários
        const statsElement = postElement.querySelector('.post-stats');
        const commentsCount = statsElement.querySelectorAll('span')[1];
        commentsCount.textContent = `${parseInt(commentsCount.textContent) + 1} comentários`;
        
        // Limpar input
        const commentInput = postElement.querySelector('.comment-input input');
        commentInput.value = '';
    } catch (error) {
        showMessage(error.message);
    }
}

// Handle comment key press
function handleCommentKeyPress(event, input) {
    if (event.key === 'Enter' && input.value.trim()) {
        const postElement = input.closest('.post');
        const postId = postElement.dataset.postId;
        addComment(postId, input.value.trim());
    }
}

// Compartilhar post
function sharePost(button) {
    const postElement = button.closest('.post');
    const postId = postElement.dataset.postId;
    
    // Implementar lógica de compartilhamento
    showMessage('Funcionalidade de compartilhamento em desenvolvimento', 'success');
}

// Toggle opções do post
function togglePostOptions(button) {
    // Implementar menu de opções do post
    showMessage('Menu de opções em desenvolvimento', 'success');
}

// Carregar membros online
async function loadOnlineMembers() {
    try {
        const response = await fetch(`${window.getApiUrl()}/users/online`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar membros online');
        }
        
        const members = await response.json();
        renderOnlineMembers(members);
    } catch (error) {
        showMessage(error.message);
    }
}

// Renderizar membros online
function renderOnlineMembers(members) {
    onlineMembersList.innerHTML = '';
    
    members.forEach(member => {
        const memberElement = document.createElement('div');
        memberElement.className = 'member-item';
        
        memberElement.innerHTML = `
            <img src="${member.avatar}" alt="${member.name}" class="member-avatar">
            <div class="member-info">
                <span class="member-name">${member.name}</span>
                <span class="member-status">Online</span>
            </div>
        `;
        
        onlineMembersList.appendChild(memberElement);
    });
}

// Verificar se os elementos existem
if (postsContainer) {
    // Carregar posts quando a página carregar
    document.addEventListener('DOMContentLoaded', () => {
        loadPosts();
        if (onlineMembersList) {
            loadOnlineMembers();
        }
    });
}

if (createPostForm) {
    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!postContent.value.trim()) return;

        try {
            const response = await fetch(`${window.getApiUrl()}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: postContent.value.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao criar post');
            }

            const post = await response.json();
            const postElement = createPostElement(post);
            postsContainer.insertBefore(postElement, postsContainer.firstChild);
            postContent.value = '';
        } catch (error) {
            showMessage(error.message);
        }
    });
} 