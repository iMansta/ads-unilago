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

document.addEventListener('DOMContentLoaded', () => {
  // Verificar se o usuário está logado
  const checkAuth = async () => {
    const isAuthenticated = await window.api.auth.verifyToken();
    if (!isAuthenticated) {
      window.location.href = '/login.html';
    }
  };
  
  checkAuth();
  
  // Elementos da página
  const userProfile = document.getElementById('user-profile');
  const createPostForm = document.getElementById('create-post-form');
  const postContent = document.getElementById('post-content');
  const postImage = document.getElementById('post-image');
  const postsContainer = document.getElementById('posts-container');
  const onlineFriendsContainer = document.getElementById('online-friends');
  const popularGroupsContainer = document.getElementById('popular-groups');
  const themeToggle = document.getElementById('theme-toggle');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');
  
  // Obter usuário atual
  const currentUser = window.api.auth.getCurrentUser();
  
  // Renderizar perfil do usuário
  const renderUserProfile = () => {
    if (currentUser) {
      const userAvatar = userProfile.querySelector('.user-avatar img');
      const userName = userProfile.querySelector('.user-info h3');
      const userCourse = userProfile.querySelector('.user-info p');
      
      userAvatar.src = currentUser.avatar || 'assets/default-avatar.png';
      userAvatar.alt = currentUser.name;
      userName.textContent = currentUser.name;
      userCourse.textContent = currentUser.course;
    }
  };
  
  // Renderizar posts
  const renderPosts = async () => {
    try {
      // Mostrar indicador de carregamento
      postsContainer.innerHTML = '<div class="loading">Carregando posts...</div>';
      
      // Obter posts
      const response = await window.api.posts.getAll();
      
      if (response.success && response.posts.length > 0) {
        // Limpar container de posts
        postsContainer.innerHTML = '';
        
        // Renderizar cada post
        response.posts.forEach(post => {
          const postElement = createPostElement(post);
          postsContainer.appendChild(postElement);
        });
      } else {
        // Mostrar mensagem de nenhum post
        postsContainer.innerHTML = '<div class="no-posts">Nenhum post encontrado. Seja o primeiro a postar!</div>';
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      postsContainer.innerHTML = '<div class="error">Erro ao carregar posts. Tente novamente mais tarde.</div>';
    }
  };
  
  // Criar elemento de post
  const createPostElement = (post) => {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.dataset.id = post._id;
    
    // Formatar data
    const postDate = new Date(post.createdAt);
    const formattedDate = postDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Criar HTML do post
    postElement.innerHTML = `
      <div class="post-header">
        <div class="post-user">
          <img src="${post.user.avatar || 'assets/default-avatar.png'}" alt="${post.user.name}" class="post-avatar">
          <div class="post-user-info">
            <h4>${post.user.name}</h4>
            <span class="post-date">${formattedDate}</span>
          </div>
        </div>
        ${post.user._id === currentUser.id ? '<button class="post-delete">×</button>' : ''}
      </div>
      <div class="post-content">
        <p>${post.text}</p>
        ${post.image ? `<img src="${post.image}" alt="Imagem do post" class="post-image">` : ''}
      </div>
      <div class="post-actions">
        <button class="post-like ${post.likes.includes(currentUser.id) ? 'liked' : ''}">
          <i class="fas fa-heart"></i>
          <span>${post.likes.length}</span>
        </button>
        <button class="post-comment">
          <i class="fas fa-comment"></i>
          <span>${post.comments.length}</span>
        </button>
      </div>
      <div class="post-comments">
        <div class="comments-list">
          ${post.comments.map(comment => `
            <div class="comment">
              <img src="${comment.user.avatar || 'assets/default-avatar.png'}" alt="${comment.user.name}" class="comment-avatar">
              <div class="comment-content">
                <h5>${comment.user.name}</h5>
                <p>${comment.text}</p>
                <span class="comment-date">${new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <form class="comment-form">
          <input type="text" placeholder="Escreva um comentário..." class="comment-input">
          <button type="submit" class="comment-submit">Enviar</button>
        </form>
      </div>
    `;
    
    // Adicionar eventos
    const likeButton = postElement.querySelector('.post-like');
    const commentButton = postElement.querySelector('.post-comment');
    const commentForm = postElement.querySelector('.comment-form');
    const commentInput = postElement.querySelector('.comment-input');
    const deleteButton = postElement.querySelector('.post-delete');
    
    // Evento de curtir
    likeButton.addEventListener('click', async () => {
      try {
        const response = await window.api.posts.like(post._id);
        
        if (response.success) {
          // Atualizar contador de curtidas
          const likeCount = likeButton.querySelector('span');
          likeCount.textContent = response.post.likes.length;
          
          // Atualizar classe do botão
          likeButton.classList.toggle('liked');
        }
      } catch (error) {
        console.error('Erro ao curtir post:', error);
      }
    });
    
    // Evento de comentar
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const commentText = commentInput.value.trim();
      
      if (commentText) {
        try {
          const response = await window.api.posts.comment(post._id, commentText);
          
          if (response.success) {
            // Limpar input
            commentInput.value = '';
            
            // Atualizar contador de comentários
            const commentCount = commentButton.querySelector('span');
            commentCount.textContent = response.post.comments.length;
            
            // Adicionar novo comentário à lista
            const commentsList = postElement.querySelector('.comments-list');
            const newComment = document.createElement('div');
            newComment.className = 'comment';
            newComment.innerHTML = `
              <img src="${currentUser.avatar || 'assets/default-avatar.png'}" alt="${currentUser.name}" class="comment-avatar">
              <div class="comment-content">
                <h5>${currentUser.name}</h5>
                <p>${commentText}</p>
                <span class="comment-date">Agora</span>
              </div>
            `;
            
            commentsList.appendChild(newComment);
          }
        } catch (error) {
          console.error('Erro ao comentar em post:', error);
        }
      }
    });
    
    // Evento de excluir post
    if (deleteButton) {
      deleteButton.addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja excluir este post?')) {
          try {
            const response = await window.api.posts.delete(post._id);
            
            if (response.success) {
              // Remover post do DOM
              postElement.remove();
            }
          } catch (error) {
            console.error('Erro ao excluir post:', error);
          }
        }
      });
    }
    
    return postElement;
  };
  
  // Renderizar amigos online
  const renderOnlineFriends = async () => {
    try {
      // Mostrar indicador de carregamento
      onlineFriendsContainer.innerHTML = '<div class="loading">Carregando amigos...</div>';
      
      // Obter amigos online
      const response = await window.api.users.getOnlineFriends();
      
      if (response.success && response.friends.length > 0) {
        // Limpar container de amigos
        onlineFriendsContainer.innerHTML = '';
        
        // Renderizar cada amigo
        response.friends.forEach(friend => {
          const friendElement = document.createElement('div');
          friendElement.className = 'online-friend';
          friendElement.innerHTML = `
            <img src="${friend.avatar || 'assets/default-avatar.png'}" alt="${friend.name}" class="friend-avatar">
            <span class="friend-name">${friend.name}</span>
          `;
          
          onlineFriendsContainer.appendChild(friendElement);
        });
      } else {
        // Mostrar mensagem de nenhum amigo online
        onlineFriendsContainer.innerHTML = '<div class="no-friends">Nenhum amigo online</div>';
      }
    } catch (error) {
      console.error('Erro ao carregar amigos online:', error);
      onlineFriendsContainer.innerHTML = '<div class="error">Erro ao carregar amigos online</div>';
    }
  };
  
  // Renderizar grupos populares
  const renderPopularGroups = async () => {
    try {
      // Mostrar indicador de carregamento
      popularGroupsContainer.innerHTML = '<div class="loading">Carregando grupos...</div>';
      
      // Obter grupos populares
      const response = await window.api.groups.getPopular();
      
      if (response.success && response.groups.length > 0) {
        // Limpar container de grupos
        popularGroupsContainer.innerHTML = '';
        
        // Renderizar cada grupo
        response.groups.forEach(group => {
          const groupElement = document.createElement('div');
          groupElement.className = 'popular-group';
          groupElement.innerHTML = `
            <img src="${group.image || 'assets/default-group.png'}" alt="${group.name}" class="group-image">
            <div class="group-info">
              <h4>${group.name}</h4>
              <span>${group.members.length} membros</span>
            </div>
          `;
          
          popularGroupsContainer.appendChild(groupElement);
        });
      } else {
        // Mostrar mensagem de nenhum grupo popular
        popularGroupsContainer.innerHTML = '<div class="no-groups">Nenhum grupo popular</div>';
      }
    } catch (error) {
      console.error('Erro ao carregar grupos populares:', error);
      popularGroupsContainer.innerHTML = '<div class="error">Erro ao carregar grupos populares</div>';
    }
  };
  
  // Evento de criar post
  createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const content = postContent.value.trim();
    const imageFile = postImage.files[0];
    
    if (content || imageFile) {
      try {
        // Desabilitar botão de submit
        const submitButton = createPostForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Publicando...';
        
        // Criar objeto com dados do post
        const postData = {
          text: content
        };
        
        // Adicionar imagem se houver
        if (imageFile) {
          const formData = new FormData();
          formData.append('image', imageFile);
          
          // Upload da imagem
          const imageResponse = await window.api.posts.uploadImage(formData);
          
          if (imageResponse.success) {
            postData.image = imageResponse.imageUrl;
          }
        }
        
        // Criar post
        const response = await window.api.posts.create(postData);
        
        if (response.success) {
          // Limpar formulário
          postContent.value = '';
          postImage.value = '';
          
          // Adicionar novo post ao início da lista
          const newPost = createPostElement(response.post);
          postsContainer.insertBefore(newPost, postsContainer.firstChild);
        }
      } catch (error) {
        console.error('Erro ao criar post:', error);
      } finally {
        // Habilitar botão de submit
        const submitButton = createPostForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Publicar';
      }
    }
  });
  
  // Evento de alternar tema
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Salvar preferência no localStorage
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Atualizar ícone
    const themeIcon = themeToggle.querySelector('i');
    if (isDarkMode) {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    } else {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
  });
  
  // Evento de alternar menu mobile
  mobileMenuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
  
  // Fechar menu ao clicar fora
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== mobileMenuToggle) {
      sidebar.classList.remove('active');
    }
  });
  
  // Inicializar tema
  const initTheme = () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      
      // Atualizar ícone
      const themeIcon = themeToggle.querySelector('i');
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    }
  };
  
  // Inicializar página
  const initPage = () => {
    renderUserProfile();
    renderPosts();
    renderOnlineFriends();
    renderPopularGroups();
    initTheme();
  };
  
  initPage();
}); 