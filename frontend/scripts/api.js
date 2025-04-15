// Configuração da API
const API_URL = 'http://localhost:3000/api';

// Funções de autenticação
const auth = {
  // Login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Salvar token no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },
  
  // Registro
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Salvar token no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  },
  
  // Verificar token
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return false;
      }
      
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'x-auth-token': token
        }
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return false;
    }
  },
  
  // Obter usuário atual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Funções para posts
const posts = {
  // Obter todos os posts
  getAll: async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/posts`, {
        method: 'GET',
        headers: {
          'x-auth-token': token
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao obter posts:', error);
      throw error;
    }
  },
  
  // Criar um novo post
  create: async (postData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao criar post:', error);
      throw error;
    }
  },
  
  // Curtir um post
  like: async (postId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      throw error;
    }
  },
  
  // Comentar em um post
  comment: async (postId, comment) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: comment })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao comentar em post:', error);
      throw error;
    }
  }
};

// Funções para usuários
const users = {
  // Obter perfil de um usuário
  getProfile: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'x-auth-token': token
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      throw error;
    }
  },
  
  // Atualizar perfil
  updateProfile: async (userData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Atualizar usuário no localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },
  
  // Adicionar amigo
  addFriend: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/users/friends/${userId}`, {
        method: 'POST',
        headers: {
          'x-auth-token': token
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao adicionar amigo:', error);
      throw error;
    }
  }
};

// Exportar funções
window.api = {
  auth,
  posts,
  users
}; 