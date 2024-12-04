// src/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import API_URL from './config';
import axios from "axios";

function LoginPage({ isGameStarted, teams, onLogin, loggedInTeams }) {
    const [selectedTeam, setSelectedTeam] = useState(""); // Selected team for login
    const navigate = useNavigate();

    // src/LoginPage.js
    const handleLogin = async () => {
        if (selectedTeam && !loggedInTeams.includes(selectedTeam)) {
            try {
                const { data } = await axios.post(`${API_URL}/api/login`, { teamName: selectedTeam });
                sessionStorage.setItem('teamToken', data.token); // Store token securely
                onLogin(selectedTeam);
                navigate(`/handsup/${selectedTeam}`);
            } catch (error) {
                console.error('Login failed:', error.response?.data?.message || error.message);
            }
        }
    };

    // Render when the game is not started
    if (!isGameStarted) {
        return (
            <div className="login-page">
                <h2>No active game</h2>
                <button
                    onClick={() => navigate("/")} // Redirect back to the opening page
                    className="login-button"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Render the login form
    return (
        <div className="login-page">
            <h2>Team Login</h2>
            {teams.length === 0 ? (
                <p>No teams available for login. Please contact the quiz master.</p>
            ) : loggedInTeams.length === teams.length ? (
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
                    <button
                        onClick={handleLogin}
                        className="login-button"
                        disabled={!selectedTeam} // Disable login button if no team is selected
                    >
                        Login
                    </button>
                </>
            )}
        </div>
    );
}

export default LoginPage;


