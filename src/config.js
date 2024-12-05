const API_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000' // Local backend for development
    : 'https://quiz-game-v2-9046345b6d4d.herokuapp.com'; // Production backend

export default API_URL;
