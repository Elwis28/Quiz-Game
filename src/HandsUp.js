import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import API_URL from './config';
import axios from 'axios';
import './App.css';

function HandsUp({isGameStarted}) {
    const {teamName} = useParams();
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [isQuestionActive, setIsQuestionActive] = useState(false);
    const [isButtonClicked, setIsButtonClicked] = useState(false);

    const WS_URL =
        process.env.NODE_ENV === 'development'
            ? 'ws://localhost:5000'
            : `wss://${window.location.host}`;

    useEffect(() => {
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
    }, [teamName]);

    useEffect(() => {
        const fetchQuestionState = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/game-state`);
                setIsQuestionActive(data.isQuestionActive || false);

                // Reset button click state if the question is inactive
                if (!data.isQuestionActive) {
                    setIsButtonClicked(false);
                    console.error('Question state: ', data.isQuestionActive);
                }
            } catch (error) {
                console.error('Error fetching game state:', error.message);
            }
        };

        fetchQuestionState();

        const socket = new WebSocket(WS_URL);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'update' && data.gameState) {
                setIsQuestionActive(data.gameState.isQuestionActive || false);

                if (!data.gameState.isQuestionActive) {
                    setIsButtonClicked(false);
                }
            }
        };

        return () => socket.close();
    }, []);

    const handleButtonClick = async () => {
        if (!isQuestionActive || isButtonClicked) return;

        if (!teamName) {
            console.error('Team name is missing!');
            return;
        }

        setIsButtonClicked(true);

        try {
            await axios.post(`${API_URL}/api/record-button-click`, {
                teamName,
            });
        } catch (error) {
            setIsButtonClicked(false); // Allow retry if an error occurs
            console.error('Error recording button click:', error.response?.data?.message || error.message);
            alert('Failed to record button click. Please try again.');
        }
    };

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
                <h1>{teamName}</h1>
                <p>Prepare to answer the questions!</p>
                <button
                    className="big-green-button"
                    disabled={!isQuestionActive || isButtonClicked}
                    style={{
                        backgroundColor: isButtonClicked ? '#999' : isQuestionActive ? '#4caf50' : '#999',
                        cursor: isButtonClicked || !isQuestionActive ? 'not-allowed' : 'pointer',
                    }}
                    onClick={handleButtonClick}
                >
                    Hands up!
                </button>
            </div>
        );
    }

    export default HandsUp;