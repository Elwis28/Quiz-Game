const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        createProxyMiddleware('/api', {
            target: 'http://localhost:5000', // Your backend server
            changeOrigin: true,
        })
    );

    // Fix allowedHosts error by adding middleware to allow all origins
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });
};