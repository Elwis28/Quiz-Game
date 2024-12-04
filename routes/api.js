const express = require('express');
const crypto = require('crypto');

const router = express.Router();

let teamTokens = {};
let gameState = {
    isGameStarted: false,
    teams: [],
    loggedInTeams: [],
    isQuestionActive: false,
};

function broadcast(wss, data) {
    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(data));
        }
    });
}

// API endpoints
router.post('/toggle-question', (req, res) => {
    const { isQuestionActive } = req.body;
    gameState.isQuestionActive = isQuestionActive;
    broadcast(req.app.get('wss'), { type: 'update', gameState });
    res.json({ success: true, isQuestionActive });
});

router.post('/start-game', (req, res) => {
    const { teams } = req.body;
    if (!teams || teams.length < 2) {
        return res.status(400).json({ message: 'At least two teams are required to start the game.' });
    }
    gameState = {
        isGameStarted: true,
        teams,
        loggedInTeams: [],
    };
    broadcast(req.app.get('wss'), { type: 'update', loggedInTeams: gameState.loggedInTeams });
    res.json(gameState);
});

router.get('/game-state', (req, res) => {
    res.json({
        isGameStarted: gameState.isGameStarted,
        teams: gameState.teams,
        loggedInTeams: gameState.loggedInTeams,
    });
});

router.post('/login', (req, res) => {
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
    broadcast(req.app.get('wss'), { type: 'update', loggedInTeams: gameState.loggedInTeams });
    res.json({ token });
});

router.post('/kick-team', (req, res) => {
    const { teamName } = req.body;
    if (!gameState.loggedInTeams.includes(teamName)) {
        return res.status(400).json({ message: 'Team is not logged in.' });
    }
    gameState.loggedInTeams = gameState.loggedInTeams.filter((name) => name !== teamName);
    delete teamTokens[teamName];
    broadcast(req.app.get('wss'), { type: 'update', loggedInTeams: gameState.loggedInTeams, kickedTeam: teamName });
    res.json({ message: `${teamName} has been kicked out.` });
});

router.post('/kick-all-teams', (req, res) => {
    gameState.loggedInTeams = [];
    teamTokens = {};
    broadcast(req.app.get('wss'), { type: 'update', loggedInTeams: [] });
    res.json({ message: 'All teams have been kicked out.' });
});

router.post('/verify-handsup', (req, res) => {
    const { teamName, token } = req.body;
    if (teamTokens[teamName] === token) {
        return res.json({ accessGranted: true });
    }
    res.status(403).json({ message: 'Access forbidden' });
});

router.post('/reset-game', (req, res) => {
    gameState = {
        isGameStarted: false,
        teams: [],
        loggedInTeams: [],
    };
    broadcast(req.app.get('wss'), { type: 'update', loggedInTeams: gameState.loggedInTeams });
    res.json(gameState);
});

module.exports = router;