const express = require('express');
const cors = require('cors');
const { Server } = require('ws');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());

// WebSocket server
const wss = new Server({ noServer: true });
app.set('wss', wss);

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'init', loggedInTeams: [] }));

    ws.on('message', (message) => {
        console.log('Message received:', message);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

// Serve static files from build folder
app.use(express.static(path.join(__dirname, 'build')));

// Use the modularized API routes
app.use('/api', apiRoutes);

// Catch-all route for React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use(cors({
    origin: ['http://localhost:3000', 'https://quiz-game-v2-9046345b6d4d.herokuapp.com'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle WebSocket upgrades
server.on('upgrade', (request, socket, head) => {
    console.log('WebSocket upgrade requested'); // Debug log
    wss.handleUpgrade(request, socket, head, (ws) => {
        console.log('WebSocket upgrade handled'); // Debug log
        wss.emit('connection', ws, request);
    });
});