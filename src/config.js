const API_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000' // Local backend for development
    : 'https://shrouded-river-15106-69fad24cfbc6.herokuapp.com'; // Production backend

export default API_URL;
