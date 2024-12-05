// src/LoginPage.js
import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import API_URL from './config';
import axios from "axios";

function LoginPage({}) {
    const [isGameStarted, setIsGameStarted] = useState(null);
    const [teams, setTeams] = useState(null);
    const [loggedInTeams, setLoggedInTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState("");
    const navigate = useNavigate();

// Fetch game state on component mount
    useEffect(() => {
        const fetchGameState = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/game-state`);
                setIsGameStarted(data.isGameStarted || false);
                setTeams(data.teams || []);
                setLoggedInTeams(data.loggedInTeams || []);
            } catch (error) {
                console.error('Error fetching game state:', error.message);
            }
        };

        fetchGameState();
    }, []);

    const handleLogin = async () => {
        if (selectedTeam && !loggedInTeams.includes(selectedTeam)) {
            try {
                const { data } = await axios.post(`${API_URL}/api/login`, { teamName: selectedTeam });
                sessionStorage.setItem('teamToken', data.token);
                navigate(`/handsup/${selectedTeam}`);
            } catch (error) {
                console.error('Login failed:', error.response?.data?.message || error.message);
            }
        }
    };

    // Prevent rendering until game state is fetched
    if (isGameStarted === null || teams === null) {
        return <div className="login-page"><h2>Loading...</h2></div>;
    }

    // Render message if game not started or no teams available
    if (!isGameStarted || teams.length === 0) {
        return (
            <div className="login-page">
                <h2>No teams available for login. Please contact the quiz master.</h2>
            </div>
        );
    }

    return (
        <div className="login-page">
            <h2>Team Login</h2>
            {loggedInTeams.length === teams.length ? (
                <p>All teams have logged in. Please wait for the game to begin.</p>
            ) : (
                <>
                    <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="login-select"
                    >
                        <option value="" disabled>
                            Select your team
                        </option>
                        {teams
                            .filter((team) => !loggedInTeams.includes(team.name)) // Exclude already logged-in teams
                            .map((team) => (
                                <option key={team.name} value={team.name}>
                                    {team.name}
                                </option>
                            ))}
                    </select>
                    <button onClick={handleLogin} className="login-button" disabled={!selectedTeam}>
                        Login
                    </button>
                </>
            )}
        </div>
    );
}

export default LoginPage;


