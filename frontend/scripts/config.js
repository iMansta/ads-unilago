const config = {
    apiUrl: process.env.NODE_ENV === 'production'
        ? 'https://atletica-ads-unilago.onrender.com/api'
        : 'http://localhost:3000/api'
};

export default config; 