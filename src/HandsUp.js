// src/HandsUp.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function HandsUp({ isGameStarted }) {
    const { teamName } = useParams();
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        const verifyAccess = async () => {
            const token = sessionStorage.getItem('teamToken');

            try {
                const { data } = await axios.post('http://localhost:5000/verify-handsup', {
                    teamName,
                    token,
                });
                if (data.accessGranted) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } catch (error) {
                console.error('Access verification failed:', error.response?.data?.message || error.message);
                setIsAuthorized(false);
            }
        };

        verifyAccess();

        const socket = new WebSocket('ws://localhost:5000');

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

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
        return <div>Loading...</div>; // Show a loading state while verifying access
    }

    if (!isAuthorized) {
        return (
            <div className="handsup-container">
                <h2>Access Forbidden</h2>
                <button onClick={() => navigate('/')} className="login-button">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="handsup-container">
            <h1>Hands Up: {teamName}</h1>
            <p>Prepare to answer the questions!</p>
        </div>
    );
}

export default HandsUp;