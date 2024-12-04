// src/QuizGame.js
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import './App.css';
import axios from "axios";

function QuizGame({
                      quizData = [],
                      teams = [],
                      saveFileName,
                      saveGameProgress,
                      onExit,
                      loggedInTeams: initialLoggedInTeams = [],
                  }) {
    const [modalContent, setModalContent] = useState(null);
    const [answeredQuestions, setAnsweredQuestions] = useState({});
    const [teamData, setTeamData] = useState([]);
    const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);
    const [isTeamListVisible, setIsTeamListVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [currentPicker, setCurrentPicker] = useState(null);
    const [isGameComplete, setIsGameComplete] = useState(false);
    const [loggedInTeams, setLoggedInTeams] = useState(initialLoggedInTeams || []);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const savedGame = localStorage.getItem(saveFileName);
        if (savedGame) {
            const { answeredQuestions: savedAnswers, teams: savedTeams } = JSON.parse(savedGame);
            setAnsweredQuestions(savedAnswers || {});
            setTeamData(savedTeams || teams);
            setCurrentPicker(
                savedTeams
                    ? savedTeams[Math.floor(Math.random() * savedTeams.length)]
                    : teams[0]
            );
        } else {
            setTeamData(teams);
            setCurrentPicker(teams[Math.floor(Math.random() * teams.length)]);
        }
    }, [saveFileName, teams]);

    useEffect(() => {
        if (!modalContent || timeLeft <= 0) return;

        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [modalContent, timeLeft]);

    useEffect(() => {
        const totalQuestions = quizData.flatMap((theme) => theme.questions).length;
        if (Object.keys(answeredQuestions).length === totalQuestions) {
            setIsGameComplete(true);
        }
    }, [answeredQuestions, quizData]);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:5000');

        socket.onopen = () => console.log('WebSocket connected');

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Update loggedInTeams list only
            if (data.type === 'update') {
                setLoggedInTeams(data.loggedInTeams);
            }
        };

        socket.onerror = (error) => console.error('WebSocket error:', error);

        socket.onclose = () => console.log('WebSocket disconnected');

        return () => {
            socket.close();
        };
    }, []);

    const openQuestion = (question) => {
        if (answeredQuestions[question.id]) return;

        setModalContent(question);
        setTimeLeft(60);

        // Activate the question for all teams
        axios.post(`${API_URL}/toggle-question`, { isQuestionActive: true });
    };

    const closeModal = () => {
        setModalContent(null);
        setTimeLeft(60);

        // Deactivate the question for all teams
        axios.post(`${API_URL}/toggle-question`, { isQuestionActive: false });
    };

    const handleTeamWin = (team) => {
        if (!modalContent) return;

        updateGameState({
            questionId: modalContent.id,
            teamColor: team.color,
            points: modalContent.points,
        });

        rotatePicker();
        closeModal();
    };

    const handleNoWinner = () => {
        if (!modalContent) return;

        updateGameState({
            questionId: modalContent.id,
            teamColor: '#000000',
            points: 0,
        });

        rotatePicker();
        closeModal();
    };

    const updateGameState = ({ questionId, teamColor, points }) => {
        const updatedAnswers = { ...answeredQuestions, [questionId]: teamColor };
        setAnsweredQuestions(updatedAnswers);

        if (points > 0) {
            const updatedTeams = teamData.map((team) =>
                team.color === teamColor ? { ...team, points: team.points + points } : team
            );
            setTeamData(updatedTeams);
        }

        saveGameProgress(teamData, updatedAnswers);
    };

    const rotatePicker = () => {
        const remainingQuestions = quizData
            .flatMap((theme) => theme.questions)
            .filter((q) => !answeredQuestions[q.id]);

        if (remainingQuestions.length === 0) {
            setCurrentPicker(null);
            return;
        }

        const currentIndex = teamData.findIndex((team) => team.name === currentPicker.name);
        const nextIndex = (currentIndex + 1) % teamData.length;
        setCurrentPicker(teamData[nextIndex]);
    };

    const toggleLeaderboardVisibility = () => {
        setIsLeaderboardVisible((prev) => !prev);
    };

    const toggleTeamListVisibility = () => {
        setIsTeamListVisible((prev) => !prev);
    };

    const handleKickTeam = async (teamName) => {
        try {
            await fetch(`${API_URL}/kick-team`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamName }),
            });
        } catch (error) {
            console.error('Failed to kick team:', error);
        }
    };

    const handleKickAllTeams = async () => {
        try {
            await fetch(`${API_URL}/kick-all-teams`, { method: 'POST' });
        } catch (error) {
            console.error('Failed to kick all teams:', error);
        }
    };

    const sortedTeams = [...teamData].sort((a, b) => b.points - a.points);

    return (
        <div className="quizgame-container">
            <button className="exit-button" onClick={onExit} title="Exit to Opening Page">
                Exit
            </button>

            {currentPicker && !isGameComplete && (
                <div className="current-picker">
                    <h2>
                        Current Picker: <span style={{ color: currentPicker.color }}>{currentPicker.name}</span>
                    </h2>
                </div>
            )}

            <button onClick={toggleLeaderboardVisibility} className="leaderboard-button">
                {isLeaderboardVisible ? 'Hide Leaderboard' : 'Show Leaderboard'}
            </button>

            {isLeaderboardVisible && (
                <div className="leaderboard">
                    <h3>Leaderboard</h3>
                    <ul>
                        {sortedTeams.map((team, index) => (
                            <li key={team.name}>
                                {index + 1}. {team.name}: {team.points} points
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button onClick={toggleTeamListVisibility} className="leaderboard-button">
                {isTeamListVisible ? 'Hide Team List' : 'Show Team List'}
            </button>

            {isTeamListVisible && (
                <div className="team-list-dropdown">
                    <ul>
                        {teams.map((team) => (
                            <li
                                key={team.name}
                                style={{
                                    color: Array.isArray(loggedInTeams) && loggedInTeams.includes(team.name)
                                        ? 'green'
                                        : 'red',
                                }}
                            >
                                {team.name}
                                <button
                                    onClick={() => handleKickTeam(team.name)}
                                    style={{
                                        marginLeft: '10px',
                                        color: 'white',
                                        backgroundColor: 'red',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={handleKickAllTeams}
                        style={{
                            marginTop: '10px',
                            backgroundColor: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            padding: '10px',
                        }}
                    >
                        Kick All Teams
                    </button>
                </div>
            )}

            <div className="question-grid">
                {quizData.map((theme, themeIndex) => (
                    <div key={themeIndex} className="theme-row">
                        <h2 className="theme-title">{theme.title}</h2>
                        <div className="questions-row">
                            {theme.questions.map((question) => (
                                <div
                                    key={question.id}
                                    className={`quiz-box ${answeredQuestions[question.id] ? 'locked' : ''}`}
                                    style={{ backgroundColor: answeredQuestions[question.id] || '#4caf50' }}
                                    onClick={() => openQuestion(question)}
                                >
                                    <span>{question.id}.</span>
                                    <span className="question-points">{question.points} points</span>
                                    {answeredQuestions[question.id] && (
                                        <span className="locked-label">Locked</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {modalContent && (
                <Modal onClose={closeModal}>
                    <div>
                        <div className="modal-timer">
                            {timeLeft > 0 ? `Time Left: ${timeLeft}s` : "Time's up!"}
                        </div>
                        <h3>{modalContent.content}</h3>
                        <p>Points: {modalContent.points}</p>
                    </div>
                    <div className="team-buttons">
                        {teamData.map((team) => (
                            <button
                                key={team.name}
                                onClick={() => handleTeamWin(team)}
                                style={{
                                    backgroundColor: team.color,
                                    padding: '10px',
                                    margin: '5px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    color: 'white',
                                    cursor: 'pointer',
                                }}
                                disabled={timeLeft === 0}
                            >
                                {team.name}
                            </button>
                        ))}
                        <button
                            onClick={handleNoWinner}
                            style={{
                                backgroundColor: 'black',
                                padding: '10px',
                                margin: '5px',
                                border: 'none',
                                borderRadius: '5px',
                                color: 'white',
                                cursor: 'pointer',
                            }}
                            disabled={timeLeft === 0}
                        >
                            None
                        </button>
                    </div>
                </Modal>
            )}

            {isGameComplete && (
                <Modal onClose={() => setIsGameComplete(false)}>
                    <div>
                        <h1>WINNER</h1>
                        <h2 style={{ color: sortedTeams[0].color }}>{sortedTeams[0].name}</h2>
                        <ul>
                            {sortedTeams.map((team, index) => (
                                <li key={team.name}>
                                    {index + 1}. {team.name} - {team.points} points
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                backgroundColor: '#4caf50',
                                padding: '10px',
                                marginTop: '20px',
                                border: 'none',
                                borderRadius: '5px',
                                color: 'white',
                                cursor: 'pointer',
                            }}
                        >
                            Restart Game
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default QuizGame;