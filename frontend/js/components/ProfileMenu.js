class ProfileMenu {
    constructor() {
        this.menu = document.querySelector('.profile-menu');
        this.profileBtn = document.querySelector('.profile-btn');
        this.overlay = document.createElement('div');
        this.overlay.className = 'profile-menu-overlay';
        
        this.initialize();
    }

    initialize() {
        // Adicionar overlay ao body
        document.body.appendChild(this.overlay);

        // Event listeners
        this.profileBtn.addEventListener('click', () => this.toggleMenu());
        this.overlay.addEventListener('click', () => this.closeMenu());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeMenu();
        });

        // Carregar dados do usuário
        this.loadUserData();
    }

    toggleMenu() {
        this.menu.classList.toggle('active');
        this.overlay.style.display = this.menu.classList.contains('active') ? 'block' : 'none';
        document.body.style.overflow = this.menu.classList.contains('active') ? 'hidden' : '';
    }

    closeMenu() {
        this.menu.classList.remove('active');
        this.overlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    async loadUserData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch(`${window.getApiUrl()}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar dados do usuário');
            }

            const userData = await response.json();
            this.updateUserInfo(userData);
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            this.showError('Erro ao carregar dados do usuário');
        }
    }

    updateUserInfo(userData) {
        const avatar = document.getElementById('profile-menu-avatar');
        const name = document.getElementById('profile-menu-name');
        const email = document.getElementById('profile-menu-email');

        if (avatar) avatar.src = userData.avatar || 'default-avatar.png';
        if (name) name.textContent = userData.name;
        if (email) email.textContent = userData.email;
    }

    showError(message) {
        // Implementar notificação de erro
        console.error(message);
    }
}

// Inicializar o menu de perfil quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.profileMenu = new ProfileMenu();
}); 