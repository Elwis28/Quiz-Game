import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_URL from './config';
import axios from 'axios';
import './App.css';

function HandsUp({ isGameStarted }) {
    const { teamName } = useParams();
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [isQuestionActive, setIsQuestionActive] = useState(false);

    const WS_URL =
        process.env.NODE_ENV === 'development'
            ? 'ws://localhost:5000'
            : `wss://${window.location.host}`;

    useEffect(() => {
        // Verify the team's access to the HandsUp page
        const verifyAccess = async () => {
            const token = sessionStorage.getItem('teamToken');

            try {
                const { data } = await axios.post(`${API_URL}/api/verify-handsup`, {
                    teamName,
                    token,
                });
                if (data.accessGranted) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } catch (error) {
                console.error('Access verification failed:', error.message);
                setIsAuthorized(false);
            }
        };

        verifyAccess();

        const socket = new WebSocket(WS_URL);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'update' && data.loggedInTeams) {

                // If this team was kicked, redirect to login
                if (data.kickedTeam && data.kickedTeam === teamName) {
                    sessionStorage.removeItem('teamToken');
                    navigate('/login');
                }

                // If all teams were kicked, redirect all to login
                if (data.type === 'update' && data.loggedInTeams.length === 0) {
                    sessionStorage.removeItem('teamToken');
                    navigate('/login');
                }
            }

            // Handle WebSocket errors
            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            if (data.type === 'update' && data.gameState) {

            // Update the question active state
            if (data.type === 'update' && data.gameState) {
                setIsQuestionActive(data.gameState.isQuestionActive || false);
            }
          }
        };

        socket.onclose = () => console.log('WebSocket disconnected');

        return () => {
            socket.close();
        };
    }, [teamName, navigate]);

    if (!isGameStarted) {
        return (
            <div className="handsup-container">
                <h2>No active game for {teamName}</h2>
            </div>
        );
    }

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    if (!isAuthorized) {
        return (
            <div className="handsup-container">
                <h2>Access Forbidden</h2>
                <button onClick={() => navigate('/login')} className="login-button">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="handsup-container">
            <h1>Hands Up: {teamName}</h1>
            <p>Prepare to answer the questions!</p>
            <button
                className="big-green-button"
                disabled={!isQuestionActive}
                style={{
                    backgroundColor: isQuestionActive ? '#4caf50' : '#f44336',
                    cursor: isQuestionActive ? 'pointer' : 'not-allowed',
                }}
                onClick={() => console.log(`${teamName} pressed the button`)}
            >
                Big Green Button
            </button>
        </div>
    );
}

export default HandsUp;