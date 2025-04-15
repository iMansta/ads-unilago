// Common functionality shared across pages
class Common {
    constructor() {
        this.init();
    }

    init() {
        this.setupThemeToggle();
        this.setupMobileMenu();
        this.setupNotifications();
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

        // Initialize theme
        function initTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
                this.updateThemeIcon(savedTheme);
            } else if (prefersDarkScheme.matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
                this.updateThemeIcon('dark');
            }
        }

        // Update theme icon
        function updateThemeIcon(theme) {
            const icon = themeToggle.querySelector('i');
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        // Toggle theme
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme);
        });
    }

    setupMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileMenuToggle && sidebar) {
            mobileMenuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !mobileMenuToggle.contains(e.target) && 
                sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    }

    setupNotifications() {
        const notificationToggle = document.getElementById('notification-toggle');
        const notificationPanel = document.getElementById('notification-panel');
        const notificationList = document.getElementById('notification-list');
        
        if (notificationToggle && notificationPanel) {
            notificationToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationPanel.classList.toggle('active');
            });

            // Close notification panel when clicking outside
            document.addEventListener('click', (e) => {
                if (!notificationPanel.contains(e.target) && 
                    !notificationToggle.contains(e.target)) {
                    notificationPanel.classList.remove('active');
                }
            });
        }
    }

    async loadNotifications() {
        if (!notificationList) return;

        try {
            const response = await fetch('/api/notifications');
            const notifications = await response.json();
            
            notificationList.innerHTML = notifications.map(notification => `
                <div class="notification ${notification.unread ? 'unread' : ''}">
                    <img src="${notification.avatar}" alt="Avatar" class="notification-avatar">
                    <div class="notification-content">
                        <p>${notification.message}</p>
                        <span class="notification-time">${this.formatTimestamp(notification.timestamp)}</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            this.showToast('Erro ao carregar notificações', 'error');
        }
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Agora mesmo';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
        } else {
            return date.toLocaleDateString();
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Trigger reflow
        toast.offsetHeight;
        
        // Show toast
        toast.classList.add('show');
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize common functionality
const common = new Common(); 