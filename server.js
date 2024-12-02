const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const crypto = require('crypto');
let teamTokens = {}; // In-memory storage for simplicity

let gameState = {
    isGameStarted: false,
    teams: [],
    loggedInTeams: [],
};

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

    // Generate a unique token for this team
    const token = crypto.randomBytes(16).toString('hex');
    teamTokens[teamName] = token;

    gameState.loggedInTeams.push(teamName);
    res.json({ message: 'Login successful', loggedInTeams: gameState.loggedInTeams, token });
});

// Verify access to HandsUp page
app.post('/verify-handsup', (req, res) => {
    const { teamName, token } = req.body;

    if (teamTokens[teamName] === token) {
        return res.json({ accessGranted: true });
    }

    res.status(403).json({ message: 'Access forbidden' });
});

// Reset game state
app.post('/reset-game', (req, res) => {
    gameState = {
        isGameStarted: false,
        teams: [],
        loggedInTeams: [],
    };
    res.json(gameState);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
