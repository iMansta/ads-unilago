// Configurações
const API_URL = 'https://ads-unilago.onrender.com/api';
const token = localStorage.getItem('token');

// Elementos do DOM
const onlineFriendsList = document.getElementById('online-friends-list');
const allFriendsList = document.getElementById('all-friends-list');
const suggestedFriends = document.getElementById('suggested-friends');
const friendSearch = document.getElementById('friend-search');

// Função auxiliar para mostrar mensagens
function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

// Carregar amigos online
async function loadOnlineFriends() {
    try {
        const response = await fetch(`${API_URL}/friends/online`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar amigos online');
        }
        
        const friends = await response.json();
        onlineFriendsList.innerHTML = '';
        
        if (friends.length === 0) {
            onlineFriendsList.innerHTML = '<p class="no-friends">Nenhum amigo online</p>';
            return;
        }
        
        friends.forEach(friend => {
            const friendElement = createFriendElement(friend, true);
            onlineFriendsList.appendChild(friendElement);
        });
    } catch (error) {
        console.error('Erro ao carregar amigos online:', error);
        showMessage('Erro ao carregar amigos online');
    }
}

// Carregar todos os amigos
async function loadAllFriends() {
    try {
        const response = await fetch(`${API_URL}/friends`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar amigos');
        }
        
        const friends = await response.json();
        allFriendsList.innerHTML = '';
        
        if (friends.length === 0) {
            allFriendsList.innerHTML = '<p class="no-friends">Nenhum amigo encontrado</p>';
            return;
        }
        
        friends.forEach(friend => {
            const friendElement = createFriendElement(friend);
            allFriendsList.appendChild(friendElement);
        });
    } catch (error) {
        console.error('Erro ao carregar amigos:', error);
        showMessage('Erro ao carregar amigos');
    }
}

// Carregar sugestões de amigos
async function loadSuggestedFriends() {
    try {
        const response = await fetch(`${API_URL}/friends/suggestions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar sugestões');
        }
        
        const suggestions = await response.json();
        suggestedFriends.innerHTML = '';
        
        if (suggestions.length === 0) {
            suggestedFriends.innerHTML = '<p class="no-suggestions">Nenhuma sugestão encontrada</p>';
            return;
        }
        
        suggestions.forEach(friend => {
            const friendElement = createFriendElement(friend, false, true);
            suggestedFriends.appendChild(friendElement);
        });
    } catch (error) {
        console.error('Erro ao carregar sugestões:', error);
        showMessage('Erro ao carregar sugestões');
    }
}

// Criar elemento de amigo
function createFriendElement(friend, isOnline = false, isSuggestion = false) {
    const friendElement = document.createElement('div');
    friendElement.className = 'friend-item';
    
    const avatarUrl = friend.avatar || '/assets/default-avatar.svg';
    const friendName = friend.name || 'Usuário Desconhecido';
    
    friendElement.innerHTML = `
        <img src="${avatarUrl}" alt="Avatar" class="user-avatar" onerror="this.src='/assets/default-avatar.svg'">
        <span class="friend-name">${friendName}</span>
        ${isOnline ? '<span class="online-status"></span>' : ''}
        ${isSuggestion ? `
            <button class="add-friend-btn" data-user-id="${friend._id}">
                <i class="fas fa-user-plus"></i>
                <span>Adicionar</span>
            </button>
        ` : ''}
    `;
    
    if (isSuggestion) {
        const addFriendBtn = friendElement.querySelector('.add-friend-btn');
        addFriendBtn.addEventListener('click', () => addFriend(friend._id));
    }
    
    return friendElement;
}

// Adicionar amigo
async function addFriend(userId) {
    try {
        const response = await fetch(`${API_URL}/friends/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao adicionar amigo');
        }
        
        showMessage('Amigo adicionado com sucesso!', 'success');
        loadSuggestedFriends();
        loadAllFriends();
    } catch (error) {
        console.error('Erro ao adicionar amigo:', error);
        showMessage('Erro ao adicionar amigo');
    }
}

// Pesquisar amigos
function searchFriends(query) {
    const allFriends = document.querySelectorAll('#all-friends-list .friend-item');
    
    allFriends.forEach(friend => {
        const name = friend.querySelector('.friend-name').textContent.toLowerCase();
        if (name.includes(query.toLowerCase())) {
            friend.style.display = 'flex';
        } else {
            friend.style.display = 'none';
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    loadOnlineFriends();
    loadAllFriends();
    loadSuggestedFriends();
});

friendSearch.addEventListener('input', (e) => {
    searchFriends(e.target.value);
}); 