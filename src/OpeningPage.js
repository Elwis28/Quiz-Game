// src/OpeningPage.js
import React, { useState, useEffect } from 'react';
import './App.css';

function OpeningPage({ onNewGame, onLoadGame, teams, onAddTeam, onDeleteTeam }) {
    const [newTeamName, setNewTeamName] = useState("");
    const [savedGames, setSavedGames] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [assignedColors, setAssignedColors] = useState(new Set());

    const RESTRICTED_COLORS = ["#000000", "#00FF00", "#FFFFFF", "#FF0000"]; // black, green, white, red

    useEffect(() => {
        const savedFiles = Object.keys(localStorage).filter((key) => key.startsWith('save_'));
        setSavedGames(savedFiles);
    }, []);

    const generateUniqueColor = () => {
        let color;
        do {
            color = `#${Math.random().toString(16).substr(-6)}`;
        } while (RESTRICTED_COLORS.includes(color) || assignedColors.has(color));
        return color;
    };

    const handleAddTeam = () => {
        const trimmedName = newTeamName.trim();

        if (!trimmedName) {
            setErrorMessage("Team name cannot be empty.");
            return;
        }

        if (teams.some((team) => team.name.toLowerCase() === trimmedName.toLowerCase())) {
            setErrorMessage("Team name already exists. Choose a unique name.");
            return;
        }

        if (teams.length >= 10) {
            setErrorMessage("Maximum team limit reached.");
            return;
        }

        const newTeam = { name: trimmedName, color: generateUniqueColor(), points: 0 };
        onAddTeam(newTeam);
        setAssignedColors((prev) => new Set(prev).add(newTeam.color));
        setNewTeamName("");
        setErrorMessage("");
    };

    const handleDeleteTeamClick = (teamName) => {
        const teamToDelete = teams.find((team) => team.name === teamName);
        if (teamToDelete) {
            onDeleteTeam(teamName);
            setAssignedColors((prev) => {
                const updatedColors = new Set(prev);
                updatedColors.delete(teamToDelete.color);
                return updatedColors;
            });
        }
    };

    const handleDeleteSave = (fileName) => {
        localStorage.removeItem(fileName);
        setSavedGames(savedGames.filter((file) => file !== fileName));
    };

    return (
        <div className="opening-page">
            <div className="menu">
                <button
                    onClick={onNewGame}
                    className="menu-button"
                    disabled={teams.length < 2}
                >
                    New Game
                </button>

                <h3>Load Game</h3>
                <ul className="save-list">
                    {savedGames.length > 0 ? (
                        savedGames.map((file) => (
                            <li key={file} className="save-item">
                                <button onClick={() => onLoadGame(file)} className="save-button">
                                    {file}
                                </button>
                                <button
                                    onClick={() => handleDeleteSave(file)}
                                    className="delete-button"
                                    title="Delete Save"
                                >
                                    ✕
                                </button>
                            </li>
                        ))
                    ) : (
                        <li>No saved games available</li>
                    )}
                </ul>

                <div className="team-setup">
                    <h3>Add Teams</h3>
                    <input
                        type="text"
                        placeholder="Team Name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                    />
                    <button
                        onClick={handleAddTeam}
                        disabled={teams.length >= 10}
                    >
                        Add Team
                    </button>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <ul className="team-list">
                        {teams.map((team) => (
                            <li key={team.name} style={{ color: team.color }} className="team-item">
                                {team.name} (Points: {team.points})
                                <button
                                    onClick={() => handleDeleteTeamClick(team.name)}
                                    className="team-delete-button"
                                    title="Delete Team"
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default OpeningPage;