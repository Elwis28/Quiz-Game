// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import OpeningPage from './OpeningPage';
import QuizGame from './QuizGame';
import LoginPage from './LoginPage';
import HandsUp from './HandsUp';
import quizData from './QuizData';
import axios from 'axios';

function App() {
    const [isGameStarted, setIsGameStarted] = useState(null); // Null indicates loading
    const [teams, setTeams] = useState([]);
    const [loggedInTeams, setLoggedInTeams] = useState([]);
    const [gameData, setGameData] = useState(quizData);
    const [saveFileName, setSaveFileName] = useState(null);

    const API_URL = 'http://localhost:5000'; // Backend server URL

    useEffect(() => {
        // Fetch game state from the backend
        const fetchGameState = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/game-state`);
                setIsGameStarted(data.isGameStarted);
                setTeams(data.teams);
                setLoggedInTeams(data.loggedInTeams);
            } catch (error) {
                console.error('Error fetching game state:', error);
                setIsGameStarted(false); // Fallback for resilience
            }
        };

        fetchGameState();
    }, []);

    const generateSaveFileName = () => {
        const now = new Date();
        return `save_${now.toISOString().replace(/[:-]/g, '').slice(0, 15)}`;
    };

    const handleNewGame = () => {
        if (teams.length < 2) {
            console.warn("At least two teams are required to start a new game.");
            return;
        }

        setIsGameStarted(true);
        setGameData(quizData); // Reset game data
        setSaveFileName(generateSaveFileName());
        localStorage.removeItem('quizProgress');
        setLoggedInTeams([]);

        // Sync with backend
        axios.post(`${API_URL}/start-game`, { teams })
            .catch((error) => console.error('Error starting game:', error));
    };

    const handleLoadGame = (fileName) => {
        const savedData = JSON.parse(localStorage.getItem(fileName));
        if (!savedData) {
            alert("No saved data found for this game.");
            return;
        }

        setGameData(savedData.gameData || quizData);
        setTeams(savedData.teams || []);
        setSaveFileName(fileName);
        setIsGameStarted(true);
        setLoggedInTeams([]);

        // Sync with backend
        axios.post(`${API_URL}/start-game`, { teams: savedData.teams || [] })
            .catch((error) => console.error('Error loading game:', error));
    };

    const handleAddTeam = (team) => {
        const updatedTeams = [...teams, team];
        setTeams(updatedTeams);

        // Persist teams
        localStorage.setItem('teams', JSON.stringify(updatedTeams));

        // Sync with backend
        axios.post(`${API_URL}/add-team`, { team })
            .catch((error) => console.error('Error adding team:', error));
    };

    const handleDeleteTeam = (teamName) => {
        const updatedTeams = teams.filter((team) => team.name !== teamName);
        setTeams(updatedTeams);

        // Persist updated teams
        localStorage.setItem('teams', JSON.stringify(updatedTeams));

        // Sync with backend
        axios.post(`${API_URL}/delete-team`, { teamName })
            .catch((error) => console.error('Error deleting team:', error));
    };

    const handleLogin = async (teamName) => {
        try {
            const { data } = await axios.post(`${API_URL}/login`, { teamName });
            setLoggedInTeams(data.loggedInTeams);
        } catch (error) {
            console.error('Error logging in team:', error.response?.data?.message || error.message);
        }
    };

    if (isGameStarted === null) {
        return <div>Loading...</div>; // Show loading state while fetching game state
    }

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route
                        path="/"
                        element={
                            !isGameStarted ? (
                                <OpeningPage
                                    onNewGame={handleNewGame}
                                    onLoadGame={handleLoadGame}
                                    onAddTeam={handleAddTeam}
                                    onDeleteTeam={handleDeleteTeam}
                                    teams={teams}
                                />
                            ) : (
                                <Navigate to="/quiz" />
                            )
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            isGameStarted ? (
                                <LoginPage
                                    isGameStarted={isGameStarted}
                                    teams={teams.filter((team) => !loggedInTeams.includes(team.name))}
                                    onLogin={handleLogin}
                                    loggedInTeams={loggedInTeams}
                                />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/handsup/:teamName"
                        element={<HandsUp isGameStarted={isGameStarted} />}
                    />
                    <Route
                        path="/quiz"
                        element={
                            isGameStarted ? (
                                <QuizGame
                                    quizData={gameData}
                                    teams={teams}
                                    loggedInTeams={loggedInTeams} // Pass loggedInTeams correctly
                                    saveFileName={saveFileName}
                                    saveGameProgress={(currentTeams, answeredQuestions) => {
                                        const saveData = { teams: currentTeams, answeredQuestions };
                                        const fileName = saveFileName || generateSaveFileName();
                                        localStorage.setItem(fileName, JSON.stringify(saveData));
                                    }}
                                    onExit={() => {
                                        setIsGameStarted(false);
                                        localStorage.removeItem('isGameStarted');
                                    }}
                                />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;