const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        createProxyMiddleware('/api', {
            target: process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://quiz-game-v2-9046345b6d4d.herokuapp.com',
            changeOrigin: true,
        })
    );

    // Fix allowedHosts error by adding middleware to allow all origins
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });
};
