// Configuração da API
const API_URL = 'https://ads-unilago.onrender.com/api';
const DEFAULT_AVATAR = 'https://ads-unilago.onrender.com/assets/default-avatar.png';
const DEFAULT_GROUP = 'https://ads-unilago.onrender.com/assets/default-group.png';

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
    const postInput = postForm.querySelector('.post-input');
    const submitBtn = postForm.querySelector('.submit-post');
    
    // Handle file upload buttons
    const fileButtons = postForm.querySelectorAll('.post-action-btn');
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
                        const response = await fetch('/api/upload', {
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
        if (!content) return;
        
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content })
            });
            
            if (!response.ok) throw new Error('Failed to create post');
            
            postInput.value = '';
            loadPosts(); // Reload posts
        } catch (error) {
            console.error('Post creation error:', error);
            showError('Failed to create post');
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
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `
        <div class="post-header">
            <img src="${post.author.avatar || DEFAULT_AVATAR}" alt="${post.author.name}" class="user-avatar">
            <div class="user-info">
                <h3 class="user-name">${post.author.name}</h3>
                <span class="post-time">${formatDate(post.createdAt)}</span>
            </div>
        </div>
        <div class="post-content">${post.content}</div>
        ${post.image ? `<div class="post-image"><img src="${post.image}" alt="Post image"></div>` : ''}
        <div class="post-actions">
            <button class="post-action like-btn" data-post-id="${post._id}">
                <i class="fas fa-heart"></i>
                <span>${post.likes.length}</span>
            </button>
            <button class="post-action comment-btn" onclick="toggleComments('${post._id}')">
                <i class="fas fa-comment"></i>
                <span>${post.comments.length}</span>
            </button>
        </div>
        <div class="comments-section" id="comments-${post._id}" style="display: none;">
            <div class="comments-list"></div>
            <form class="comment-form" onsubmit="addComment(event, '${post._id}')">
                <input type="text" placeholder="Write a comment..." required>
                <button type="submit">Post</button>
            </form>
        </div>
    `;
    
    // Setup like button
    const likeBtn = postDiv.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => toggleLike(post._id));
    
    // Load comments
    loadComments(post._id);
    
    return postDiv;
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
    const friendsList = document.querySelector('.online-friends');
    friendsList.innerHTML = '<div class="loading">Loading friends...</div>';
    
    try {
        const response = await fetch(`${API_URL}/friends/online`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load friends');
        
        const friends = await response.json();
        
        if (friends.length === 0) {
            friendsList.innerHTML = '<div class="error-message">No friends online</div>';
            return;
        }
        
        friendsList.innerHTML = '';
        friends.forEach(friend => {
            const friendItem = document.createElement('li');
            friendItem.className = 'friend-item';
            friendItem.innerHTML = `
                <img src="${friend.avatar || DEFAULT_AVATAR}" alt="${friend.name}" class="user-avatar">
                <span>${friend.name}</span>
                <span class="online-indicator"></span>
            `;
            friendsList.appendChild(friendItem);
        });
    } catch (error) {
        console.error('Error loading friends:', error);
        friendsList.innerHTML = '<div class="error-message">Failed to load friends</div>';
    }
}

// Load popular groups
async function loadPopularGroups() {
    const groupsList = document.querySelector('.popular-groups');
    groupsList.innerHTML = '<div class="loading">Loading groups...</div>';
    
    try {
        const response = await fetch(`${API_URL}/groups/popular`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load groups');
        
        const groups = await response.json();
        
        if (groups.length === 0) {
            groupsList.innerHTML = '<div class="error-message">No groups available</div>';
            return;
        }
        
        groupsList.innerHTML = '';
        groups.forEach(group => {
            const groupItem = document.createElement('li');
            groupItem.className = 'group-item';
            groupItem.innerHTML = `
                <img src="${group.avatar || '/assets/default-group.png'}" alt="${group.name}" class="group-avatar">
                <span>${group.name}</span>
                <span class="member-count">${group.memberCount} members</span>
            `;
            groupsList.appendChild(groupItem);
        });
    } catch (error) {
        console.error('Error loading groups:', error);
        groupsList.innerHTML = '<div class="error-message">Failed to load groups</div>';
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

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
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