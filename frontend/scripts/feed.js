// Feed functionality
class Feed {
    constructor() {
        this.posts = [];
        this.currentPage = 1;
        this.loading = false;
        this.hasMore = true;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadPosts();
        this.setupInfiniteScroll();
    }
    
    setupEventListeners() {
        // Create post form submission
        const createPostForm = document.getElementById('create-post-form');
        if (createPostForm) {
            createPostForm.addEventListener('submit', (e) => this.handlePostCreation(e));
        }
        
        // File upload buttons
        const imageUpload = document.getElementById('image-upload');
        const videoUpload = document.getElementById('video-upload');
        const fileUpload = document.getElementById('file-upload');
        
        if (imageUpload) imageUpload.addEventListener('change', (e) => this.handleFileUpload(e, 'image'));
        if (videoUpload) videoUpload.addEventListener('change', (e) => this.handleFileUpload(e, 'video'));
        if (fileUpload) fileUpload.addEventListener('change', (e) => this.handleFileUpload(e, 'file'));
    }
    
    setupInfiniteScroll() {
        window.addEventListener('scroll', () => {
            if (this.loading || !this.hasMore) return;
            
            const {scrollTop, scrollHeight, clientHeight} = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 5) {
                this.loadPosts();
            }
        });
    }
    
    async loadPosts() {
        if (this.loading) return;
        
        this.loading = true;
        this.showLoading();
        
        try {
            const response = await fetch(`/api/posts?page=${this.currentPage}`);
            const data = await response.json();
            
            if (data.posts.length === 0) {
                this.hasMore = false;
            } else {
                this.posts = [...this.posts, ...data.posts];
                this.currentPage++;
                this.renderPosts(data.posts);
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showError('Failed to load posts. Please try again later.');
        } finally {
            this.loading = false;
            this.hideLoading();
        }
    }
    
    async handlePostCreation(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const newPost = await response.json();
                this.posts.unshift(newPost);
                this.renderPosts([newPost], true);
                form.reset();
            } else {
                throw new Error('Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            this.showError('Failed to create post. Please try again.');
        }
    }
    
    async handleFileUpload(e, type) {
        const file = e.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const {url} = await response.json();
                this.addFilePreview(url, type);
            } else {
                throw new Error('Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            this.showError('Failed to upload file. Please try again.');
        }
    }
    
    renderPosts(posts, prepend = false) {
        const postsContainer = document.getElementById('posts-feed');
        if (!postsContainer) return;
        
        const postsHTML = posts.map(post => this.createPostHTML(post)).join('');
        
        if (prepend) {
            postsContainer.insertAdjacentHTML('afterbegin', postsHTML);
        } else {
            postsContainer.insertAdjacentHTML('beforeend', postsHTML);
        }
    }
    
    createPostHTML(post) {
        return `
            <article class="post" data-post-id="${post.id}">
                <header class="post-header">
                    <img src="${post.author.avatar}" alt="${post.author.name}" class="post-avatar">
                    <div class="post-info">
                        <h3>${post.author.name}</h3>
                        <span class="post-time">${this.formatTime(post.createdAt)}</span>
                    </div>
                </header>
                <div class="post-content">
                    <p>${post.content}</p>
                    ${this.renderPostMedia(post)}
                </div>
                <div class="post-actions">
                    <button class="like-btn" onclick="feed.handleLike('${post.id}')">
                        <i class="fas fa-heart"></i> ${post.likes}
                    </button>
                    <button class="comment-btn" onclick="feed.toggleComments('${post.id}')">
                        <i class="fas fa-comment"></i> ${post.comments.length}
                    </button>
                    <button class="share-btn" onclick="feed.sharePost('${post.id}')">
                        <i class="fas fa-share"></i>
                    </button>
                </div>
                <div class="comments-section" id="comments-${post.id}" style="display: none;">
                    ${this.renderComments(post.comments)}
                    <form class="comment-form" onsubmit="feed.handleComment(event, '${post.id}')">
                        <input type="text" placeholder="Write a comment..." required>
                        <button type="submit">Post</button>
                    </form>
                </div>
            </article>
        `;
    }
    
    renderPostMedia(post) {
        if (!post.media) return '';
        
        switch (post.media.type) {
            case 'image':
                return `<img src="${post.media.url}" alt="Post image" class="post-image">`;
            case 'video':
                return `
                    <video controls class="post-video">
                        <source src="${post.media.url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
            case 'file':
                return `
                    <a href="${post.media.url}" class="post-file" target="_blank">
                        <i class="fas fa-file"></i> ${post.media.name}
                    </a>
                `;
            default:
                return '';
        }
    }
    
    renderComments(comments) {
        return comments.map(comment => `
            <div class="comment">
                <img src="${comment.author.avatar}" alt="${comment.author.name}" class="comment-avatar">
                <div class="comment-content">
                    <h4>${comment.author.name}</h4>
                    <p>${comment.content}</p>
                    <span class="comment-time">${this.formatTime(comment.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
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
    
    showLoading() {
        const loadingEl = document.createElement('div');
        loadingEl.className = 'loading';
        loadingEl.innerHTML = '<div class="spinner"></div>';
        document.getElementById('posts-feed').appendChild(loadingEl);
    }
    
    hideLoading() {
        const loadingEl = document.querySelector('.loading');
        if (loadingEl) loadingEl.remove();
    }
    
    showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        document.getElementById('posts-feed').appendChild(errorEl);
        
        setTimeout(() => errorEl.remove(), 5000);
    }
}

// Initialize feed
const feed = new Feed(); 