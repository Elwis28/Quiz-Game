const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        createProxyMiddleware('/api', {
            target: process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://shrouded-river-15106-69fad24cfbc6.herokuapp.com',
            changeOrigin: true,
        })
    );

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });
};
