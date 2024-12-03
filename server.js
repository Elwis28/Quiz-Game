const express = require('express');
const cors = require('cors');
const { Server } = require('ws');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

let teamTokens = {}; // In-memory storage for simplicity

let gameState = {
    isGameStarted: false,
    teams: [],
    loggedInTeams: [],
};

// WebSocket server for real-time updates
const wss = new Server({ noServer: true });

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'init', loggedInTeams: gameState.loggedInTeams }));
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(data));
        }
    });
}

const server = app.listen(5000, () => console.log('Server running on port 5000'));
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Start a new game
app.post('/start-game', (req, res) => {
    const { teams } = req.body;
    if (!teams || teams.length < 2) {
        return res.status(400).json({ message: 'At least two teams are required to start the game.' });
    }

    gameState = {
        isGameStarted: true,
        teams,
        loggedInTeams: [],
    };
    broadcast({ type: 'update', loggedInTeams: gameState.loggedInTeams });
    res.json(gameState);
});

// Fetch the current game state
app.get('/game-state', (req, res) => {
    res.json({
        isGameStarted: gameState.isGameStarted,
        teams: gameState.teams,
        loggedInTeams: gameState.loggedInTeams,
    });
});

// Login a team
app.post('/login', (req, res) => {
    const { teamName } = req.body;

    if (!gameState.isGameStarted) {
        return res.status(400).json({ message: 'The game has not started yet.' });
    }

    if (gameState.loggedInTeams.includes(teamName)) {
        return res.status(400).json({ message: 'This team is already logged in.' });
    }

    if (!gameState.teams.some((team) => team.name === teamName)) {
        return res.status(400).json({ message: 'Invalid team name.' });
    }

    const token = crypto.randomBytes(16).toString('hex');
    teamTokens[teamName] = token;

    gameState.loggedInTeams.push(teamName);
    broadcast({ type: 'update', loggedInTeams: gameState.loggedInTeams });
    res.json({ token });
});

// Kick a specific team
app.post('/kick-team', (req, res) => {
    const { teamName } = req.body;

    if (!gameState.loggedInTeams.includes(teamName)) {
        return res.status(400).json({ message: 'Team is not logged in.' });
    }

    gameState.loggedInTeams = gameState.loggedInTeams.filter((name) => name !== teamName);
    delete teamTokens[teamName];
    broadcast({ type: 'update', loggedInTeams: gameState.loggedInTeams, kickedTeam: teamName });
    res.json({ message: `${teamName} has been kicked out.` });
});

// Kick all teams
app.post('/kick-all-teams', (req, res) => {
    gameState.loggedInTeams = [];
    teamTokens = {};
    broadcast({ type: 'update', loggedInTeams: [] });
    res.json({ message: 'All teams have been kicked out.' });
});

// Verify access to HandsUp page
app.post('/verify-handsup', (req, res) => {
    const { teamName, token } = req.body;

    if (teamTokens[teamName] === token) {
        return res.json({ accessGranted: true });
    }

    res.status(403).json({ message: 'Access forbidden' });
});

// Reset the game state
app.post('/reset-game', (req, res) => {
    gameState = {
        isGameStarted: false,
        teams: [],
        loggedInTeams: [],
    };
    broadcast({ type: 'update', loggedInTeams: gameState.loggedInTeams });
    res.json(gameState);
});

