// Configuração da API
const API_URL = 'https://ads-unilago.onrender.com/api';
const token = localStorage.getItem('token');

// Elementos do DOM
const createEventBtn = document.getElementById('createEventBtn');
const createEventModal = document.getElementById('createEventModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelEventBtn = document.getElementById('cancelEventBtn');
const createEventForm = document.getElementById('createEventForm');
const upcomingEventsList = document.getElementById('upcomingEventsList');
const pastEventsList = document.getElementById('pastEventsList');
const recommendedEvents = document.getElementById('recommendedEvents');
const eventSearch = document.getElementById('event-search');
const eventGroupSelect = document.getElementById('event-group');

// Função para mostrar mensagens
function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

// Função para carregar eventos
async function loadEvents() {
    try {
        const response = await fetch(`${API_URL}/events`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar eventos');
        }

        const events = await response.json();
        const now = new Date();

        // Separar eventos em próximos e passados
        const upcomingEvents = events.filter(event => new Date(event.date) > now);
        const pastEvents = events.filter(event => new Date(event.date) <= now);

        // Renderizar eventos próximos
        upcomingEventsList.innerHTML = upcomingEvents.map(event => createEventCard(event)).join('');
        
        // Renderizar eventos passados
        pastEventsList.innerHTML = pastEvents.map(event => createEventCard(event)).join('');

        // Carregar eventos recomendados
        loadRecommendedEvents();
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao carregar eventos');
    }
}

// Função para criar card de evento
function createEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
        <div class="event-card">
            <div class="event-header">
                <h3>${event.name}</h3>
                <span class="event-date">${formattedDate}</span>
            </div>
            <p class="event-description">${event.description}</p>
            <div class="event-details">
                <span class="event-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${event.location}
                </span>
                ${event.group ? `
                    <span class="event-group">
                        <i class="fas fa-users"></i>
                        ${event.group.name}
                    </span>
                ` : ''}
            </div>
            <div class="event-actions">
                <button class="join-btn" data-event-id="${event._id}">
                    <i class="fas fa-check"></i>
                    Participar
                </button>
            </div>
        </div>
    `;
}

// Função para carregar eventos recomendados
async function loadRecommendedEvents() {
    try {
        const response = await fetch(`${API_URL}/events/recommended`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar eventos recomendados');
        }

        const recommended = await response.json();
        recommendedEvents.innerHTML = recommended.map(event => createEventCard(event)).join('');
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao carregar eventos recomendados');
    }
}

// Função para carregar grupos no select
async function loadGroups() {
    try {
        const response = await fetch(`${API_URL}/groups`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar grupos');
        }

        const groups = await response.json();
        eventGroupSelect.innerHTML = `
            <option value="">Selecione um grupo</option>
            ${groups.map(group => `
                <option value="${group._id}">${group.name}</option>
            `).join('')}
        `;
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao carregar grupos');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    loadEvents();
    loadGroups();

    // Abrir modal de criação de evento
    createEventBtn.addEventListener('click', () => {
        createEventModal.style.display = 'block';
    });

    // Fechar modal
    document.querySelector('.cancel-btn').addEventListener('click', () => {
        createEventModal.style.display = 'none';
    });

    // Enviar formulário de criação de evento
    createEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const eventData = {
            name: document.getElementById('event-name').value,
            description: document.getElementById('event-description').value,
            date: document.getElementById('event-date').value,
            location: document.getElementById('event-location').value,
            group: document.getElementById('event-group').value || undefined
        };
        createEvent(eventData);
    });

    // Pesquisar eventos
    eventSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const eventCards = document.querySelectorAll('.event-card');
        
        eventCards.forEach(card => {
            const eventName = card.querySelector('h3').textContent.toLowerCase();
            const eventDescription = card.querySelector('p').textContent.toLowerCase();
            
            if (eventName.includes(searchTerm) || eventDescription.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Fechar modal ao clicar fora
window.addEventListener('click', (event) => {
    if (event.target === createEventModal) {
        createEventModal.style.display = 'none';
    }
});

// Envio do formulário de criação de evento
async function createEvent(eventData) {
    try {
        const response = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            throw new Error('Erro ao criar evento');
        }

        showMessage('Evento criado com sucesso!', 'success');
        createEventModal.style.display = 'none';
        createEventForm.reset();
        loadEvents();
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao criar evento');
    }
}

// Event delegation para botões de participar
document.addEventListener('click', async (e) => {
    if (e.target.closest('.join-btn')) {
        const eventId = e.target.closest('.join-btn').dataset.eventId;
        
        try {
            const response = await fetch(`${API_URL}/events/${eventId}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao participar do evento');
            }

            showMessage('Participação confirmada!', 'success');
            loadEvents();
        } catch (error) {
            console.error('Erro:', error);
            showMessage('Erro ao participar do evento');
        }
    }
}); 