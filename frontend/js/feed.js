// Configuração da API
const API_URL = 'https://ads-unilago.onrender.com/api';
const AVATAR_URL = 'https://ads-unilago.onrender.com/assets';
const DEFAULT_AVATAR = `${AVATAR_URL}/default-avatar.svg`;
const DEFAULT_GROUP = `${AVATAR_URL}/default-avatar.svg`;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    loadUserProfile();
    loadPosts();
    loadOnlineFriends();
    loadPopularGroups();
    setupPostForm();
});

// Load user profile data
async function loadUserProfile() {
    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load profile');
        
        const user = await response.json();
        document.querySelector('.user-name').textContent = user.name;
        document.querySelector('.user-avatar').src = user.avatar || DEFAULT_AVATAR;
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load user profile');
    }
}

// Setup post creation form
function setupPostForm() {
    const postForm = document.querySelector('.create-post');
    const postInput = postForm.querySelector('textarea');
    const submitBtn = postForm.querySelector('.submit-post');
    
    if (!postForm || !postInput || !submitBtn) {
        console.error('Post form elements not found');
        return;
    }
    
    // Handle file upload buttons
    const fileButtons = postForm.querySelectorAll('.action-btn');
    fileButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = btn.dataset.accept || '*/*';
            input.click();
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Handle file upload
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    try {
                        const response = await fetch(`${API_URL}/upload`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: formData
                        });
                        
                        if (!response.ok) throw new Error('Upload failed');
                        
                        const data = await response.json();
                        postInput.value += `\n[${btn.dataset.type}: ${data.url}]\n`;
                    } catch (error) {
                        console.error('Upload error:', error);
                        showError('Failed to upload file');
                    }
                }
            };
        });
    });
    
    // Handle post submission
    submitBtn.addEventListener('click', async () => {
        const content = postInput.value.trim();
        if (!content) {
            showError('Post content cannot be empty');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create post');
            }
            
            postInput.value = '';
            loadPosts(); // Reload posts
            showError('Post created successfully!', 'success');
        } catch (error) {
            console.error('Post creation error:', error);
            showError(error.message || 'Failed to create post');
        }
    });
}

// Load posts
async function loadPosts() {
    const postsContainer = document.querySelector('.posts-feed');
    postsContainer.innerHTML = '<div class="loading">Loading posts...</div>';
    
    try {
        const response = await fetch(`${API_URL}/posts`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load posts');
        
        const posts = await response.json();
        
        if (posts.length === 0) {
            postsContainer.innerHTML = '<div class="error-message">No posts yet. Be the first to post!</div>';
            return;
        }
        
        postsContainer.innerHTML = '';
        posts.forEach(post => {
            postsContainer.appendChild(createPostElement(post));
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = '<div class="error-message">Failed to load posts</div>';
    }
}

// Create post element
function createPostElement(post) {
    if (!post || !post.author) {
        console.error('Post ou autor inválido:', post);
        return '';
    }

    const authorAvatar = post.author.avatar || DEFAULT_AVATAR;
    const authorName = post.author.name || 'Usuário desconhecido';
    const postContent = post.content || '';
    const postImage = post.image ? `<img src="${post.image}" alt="Imagem do post" class="post-image">` : '';
    const postVideo = post.video ? `<video src="${post.video}" controls class="post-video"></video>` : '';
    const postAttachment = post.attachment ? `<a href="${post.attachment}" class="post-attachment" target="_blank">Anexo</a>` : '';

    return `
        <div class="post">
            <div class="post-header">
                <img src="${authorAvatar}" alt="${authorName}" class="user-avatar">
                <div class="post-info">
                    <h3 class="user-name">${authorName}</h3>
                    <span class="post-time">${formatDate(post.createdAt)}</span>
                </div>
            </div>
            <div class="post-content">
                <p>${postContent}</p>
                ${postImage}
                ${postVideo}
                ${postAttachment}
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
                </button>
            </div>
        </div>
    `;
}

// Load comments for a post
async function loadComments(postId) {
    const commentsList = document.querySelector(`#comments-${postId} .comments-list`);
    
    try {
        const response = await fetch(`/api/posts/${postId}/comments`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load comments');
        
        const comments = await response.json();
        commentsList.innerHTML = '';
        
        comments.forEach(comment => {
            commentsList.appendChild(createCommentElement(comment));
        });
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = '<div class="error-message">Failed to load comments</div>';
    }
}

// Create comment element
function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    commentDiv.innerHTML = `
        <img src="${comment.author.avatar || DEFAULT_AVATAR}" alt="${comment.author.name}" class="user-avatar">
        <div class="comment-content">
            <h4>${comment.author.name}</h4>
            <p>${comment.content}</p>
            <span class="comment-time">${formatDate(comment.createdAt)}</span>
        </div>
    `;
    return commentDiv;
}

// Toggle comments section
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
}

// Add comment to a post
async function addComment(event, postId) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('input');
    const content = input.value.trim();
    
    if (!content) return;
    
    try {
        const response = await fetch(`/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content })
        });
        
        if (!response.ok) throw new Error('Failed to add comment');
        
        input.value = '';
        loadComments(postId);
        
        // Update comment count
        const commentBtn = document.querySelector(`[data-post-id="${postId}"].comment-btn span`);
        commentBtn.textContent = parseInt(commentBtn.textContent) + 1;
    } catch (error) {
        console.error('Error adding comment:', error);
        showError('Failed to add comment');
    }
}

// Toggle like on a post
async function toggleLike(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to toggle like');
        
        const { liked, likesCount } = await response.json();
        
        // Update like button and count
        const likeBtn = document.querySelector(`[data-post-id="${postId}"].like-btn`);
        const likeCount = likeBtn.querySelector('span');
        likeCount.textContent = likesCount;
        
        if (liked) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        showError('Failed to update like');
    }
}

// Load online friends
async function loadOnlineFriends() {
    try {
        console.log('Carregando amigos online...');
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('Token não encontrado no localStorage');
            return;
        }
        console.log('Token encontrado:', token);

        const response = await fetch(`${API_URL}/friends/online`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log('Resposta da API de amigos online:', response);

        if (!response.ok) {
            throw new Error(`Erro ao carregar amigos online: ${response.status}`);
        }

        const friends = await response.json();
        console.log('Amigos online recebidos:', friends);

        const friendsList = document.getElementById('online-friends-list');
        if (!friendsList) {
            console.error('Elemento online-friends-list não encontrado');
            return;
        }

        friendsList.innerHTML = friends.map(friend => `
            <div class="friend-item">
                <img src="${friend.avatar || DEFAULT_AVATAR}" alt="${friend.name || 'Amigo'}" class="friend-avatar">
                <span class="friend-name">${friend.name || 'Amigo'}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar amigos online:', error);
    }
}

// Load popular groups
async function loadPopularGroups() {
    try {
        console.log('Carregando grupos populares...');
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('Token não encontrado no localStorage');
            return;
        }
        console.log('Token encontrado:', token);

        const response = await fetch(`${API_URL}/groups/popular`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log('Resposta da API de grupos populares:', response);

        if (!response.ok) {
            throw new Error(`Erro ao carregar grupos populares: ${response.status}`);
        }

        const groups = await response.json();
        console.log('Grupos populares recebidos:', groups);

        const groupsList = document.getElementById('popular-groups-list');
        if (!groupsList) {
            console.error('Elemento popular-groups-list não encontrado');
            return;
        }

        groupsList.innerHTML = groups.map(group => `
            <div class="group-item">
                <img src="${group.courseEmblem || DEFAULT_AVATAR}" alt="${group.name || 'Grupo'}" class="group-avatar">
                <div class="group-info">
                    <h4 class="group-name">${group.name || 'Grupo'}</h4>
                    <p class="group-members">${group.memberCount || 0} membros</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar grupos populares:', error);
    }
}

// Format date to relative time
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

// Show error or success message
function showError(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Handle post creation
async function handlePostCreation(e) {
    e.preventDefault();
    
    const postInput = document.querySelector('.post-input');
    const postText = postInput.value.trim();
    
    if (!postText) {
        showError('O post não pode estar vazio');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ text: postText })
        });
        
        if (!response.ok) throw new Error('Failed to create post');
        
        const newPost = await response.json();
        loadPosts(); // Recarregar posts
        postInput.value = ''; // Limpar input
    } catch (error) {
        console.error('Error creating post:', error);
        showError('Failed to create post');
    }
} 