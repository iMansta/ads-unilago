const config = {
    apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://atletica-ads-unilago.onrender.com/api'
};

// Log para debug
console.log('API URL:', config.apiUrl); 