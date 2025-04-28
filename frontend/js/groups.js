// Configurações
const API_URL = 'https://ads-unilago.onrender.com/api';
const token = localStorage.getItem('token');

// Elementos do DOM
const myGroupsList = document.getElementById('my-groups-list');
const popularGroupsList = document.getElementById('popular-groups-list');
const suggestedGroups = document.getElementById('suggested-groups');
const groupSearch = document.getElementById('group-search');
const createGroupBtn = document.querySelector('.create-group-btn');
const createGroupModal = document.getElementById('create-group-modal');
const createGroupForm = document.getElementById('create-group-form');

// Função auxiliar para mostrar mensagens
function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

// Carregar meus grupos
async function loadMyGroups() {
    try {
        const response = await fetch(`${API_URL}/groups/my`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar meus grupos');
        }
        
        const groups = await response.json();
        myGroupsList.innerHTML = '';
        
        if (groups.length === 0) {
            myGroupsList.innerHTML = '<p class="no-groups">Você ainda não participa de nenhum grupo</p>';
            return;
        }
        
        groups.forEach(group => {
            const groupElement = createGroupElement(group, true);
            myGroupsList.appendChild(groupElement);
        });
    } catch (error) {
        console.error('Erro ao carregar meus grupos:', error);
        showMessage('Erro ao carregar meus grupos');
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
        
        if (!response.ok) {
            throw new Error('Erro ao carregar grupos populares');
        }
        
        const groups = await response.json();
        popularGroupsList.innerHTML = '';
        
        if (groups.length === 0) {
            popularGroupsList.innerHTML = '<p class="no-groups">Nenhum grupo popular encontrado</p>';
            return;
        }
        
        groups.forEach(group => {
            const groupElement = createGroupElement(group);
            popularGroupsList.appendChild(groupElement);
        });
    } catch (error) {
        console.error('Erro ao carregar grupos populares:', error);
        showMessage('Erro ao carregar grupos populares');
    }
}

// Carregar sugestões de grupos
async function loadSuggestedGroups() {
    try {
        const response = await fetch(`${API_URL}/groups/suggestions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar sugestões');
        }
        
        const suggestions = await response.json();
        suggestedGroups.innerHTML = '';
        
        if (suggestions.length === 0) {
            suggestedGroups.innerHTML = '<p class="no-suggestions">Nenhuma sugestão encontrada</p>';
            return;
        }
        
        suggestions.forEach(group => {
            const groupElement = createGroupElement(group, false, true);
            suggestedGroups.appendChild(groupElement);
        });
    } catch (error) {
        console.error('Erro ao carregar sugestões:', error);
        showMessage('Erro ao carregar sugestões');
    }
}

// Criar elemento de grupo
function createGroupElement(group, isMember = false, isSuggestion = false) {
    const groupElement = document.createElement('div');
    groupElement.className = 'group-item';
    
    const emblemUrl = group.courseEmblem || '/assets/default-group.png';
    const groupName = group.name;
    const memberCount = group.memberCount || 0;
    
    groupElement.innerHTML = `
        <img src="${emblemUrl}" alt="Emblema" class="group-emblem" onerror="this.src='/assets/default-group.png'">
        <div class="group-info">
            <span class="group-name">${groupName}</span>
            <span class="member-count">${memberCount} membros</span>
        </div>
        ${isSuggestion ? `
            <button class="join-group-btn" data-group-id="${group._id}">
                <i class="fas fa-user-plus"></i>
                <span>Entrar</span>
            </button>
        ` : ''}
    `;
    
    if (isSuggestion) {
        const joinGroupBtn = groupElement.querySelector('.join-group-btn');
        joinGroupBtn.addEventListener('click', () => joinGroup(group._id));
    }
    
    return groupElement;
}

// Entrar em um grupo
async function joinGroup(groupId) {
    try {
        const response = await fetch(`${API_URL}/groups/${groupId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao entrar no grupo');
        }
        
        showMessage('Você entrou no grupo com sucesso!', 'success');
        loadSuggestedGroups();
        loadMyGroups();
    } catch (error) {
        console.error('Erro ao entrar no grupo:', error);
        showMessage('Erro ao entrar no grupo');
    }
}

// Criar novo grupo
async function createGroup(groupData) {
    try {
        const response = await fetch(`${API_URL}/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(groupData)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao criar grupo');
        }
        
        showMessage('Grupo criado com sucesso!', 'success');
        createGroupModal.style.display = 'none';
        createGroupForm.reset();
        loadMyGroups();
    } catch (error) {
        console.error('Erro ao criar grupo:', error);
        showMessage('Erro ao criar grupo');
    }
}

// Pesquisar grupos
function searchGroups(query) {
    const allGroups = document.querySelectorAll('#my-groups-list .group-item, #popular-groups-list .group-item');
    
    allGroups.forEach(group => {
        const name = group.querySelector('.group-name').textContent.toLowerCase();
        if (name.includes(query.toLowerCase())) {
            group.style.display = 'flex';
        } else {
            group.style.display = 'none';
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    loadMyGroups();
    loadPopularGroups();
    loadSuggestedGroups();
});

// Abrir modal de criação de grupo
createGroupBtn.addEventListener('click', () => {
    createGroupModal.style.display = 'block';
});

// Fechar modal ao clicar no botão cancelar
document.querySelector('.cancel-btn').addEventListener('click', () => {
    createGroupModal.style.display = 'none';
    createGroupForm.reset();
});

// Fechar modal ao clicar fora dele
window.addEventListener('click', (e) => {
    if (e.target === createGroupModal) {
        createGroupModal.style.display = 'none';
        createGroupForm.reset();
    }
});

// Enviar formulário de criação de grupo
createGroupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const groupData = {
        name: document.getElementById('group-name').value,
        description: document.getElementById('group-description').value,
        isPrivate: document.getElementById('group-privacy').value === 'private'
    };
    
    createGroup(groupData);
});

// Pesquisar grupos
groupSearch.addEventListener('input', (e) => {
    searchGroups(e.target.value);
}); 