// src/QuizGame.js
import React, {useState, useEffect} from 'react';
import Modal from './Modal';
import './App.css';
import axios from "axios";
import API_URL from './config';

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
    const [buttonPressList, setButtonPressList] = useState([]);

    const WS_URL =
        process.env.NODE_ENV === 'development'
            ? 'ws://localhost:5000'
            : `wss://${window.location.host}`;

    useEffect(() => {
        const fetchAndRestoreGameState = async () => {
            let restoredTeams = teams;

            if (saveFileName) {
                const savedGame = localStorage.getItem(saveFileName);
                if (savedGame) {
                    try {
                        const { answeredQuestions: savedAnswers, teamData: savedTeams } = JSON.parse(savedGame);

                        setAnsweredQuestions(savedAnswers || {});
                        restoredTeams = savedTeams && savedTeams.length > 0 ? savedTeams : teams;
                        setTeamData(restoredTeams);

                        console.log('Restored from localStorage:', { savedAnswers, restoredTeams });
                        return; // Exit restoration logic after successfully restoring from localStorage
                    } catch (error) {
                        console.error('Failed to parse saved game state:', error);
                    }
                }
            }

            // Fallback to backend only if no state is restored from localStorage
            try {
                const { data } = await axios.get(`${API_URL}/api/game-state`);
                setAnsweredQuestions(data.answeredQuestions || {});
                restoredTeams = data.teamData && data.teamData.length > 0 ? data.teamData : teams;
                setTeamData(restoredTeams);

                console.log('Restored from backend:', { answeredQuestions: data.answeredQuestions, teamData: data.teamData });
            } catch (error) {
                console.error('Error fetching game state from backend:', error);
            }

            if (restoredTeams.length > 0) {
                setCurrentPicker(restoredTeams[Math.floor(Math.random() * restoredTeams.length)]);
            }
        };

        fetchAndRestoreGameState();
    }, [saveFileName, teams]);

    useEffect(() => {
        const savedGame = saveFileName && localStorage.getItem(saveFileName);
        let restoredTeams = teams;

        if (savedGame) {
            try {
                const { answeredQuestions: savedAnswers, teamData: savedTeams } = JSON.parse(savedGame);

                // Restore state from saved file or fallback to default props
                setAnsweredQuestions(savedAnswers || {});
                restoredTeams = savedTeams && savedTeams.length > 0 ? savedTeams : teams;
                setTeamData(restoredTeams);
            } catch (error) {
                console.error('Failed to parse saved game state:', error);
            }
        } else {
            // Fresh game: Use teams from props
            setTeamData(teams);
        }

        // Ensure current picker is set to a valid team
        if (restoredTeams.length > 0) {
            setCurrentPicker(restoredTeams[Math.floor(Math.random() * restoredTeams.length)]);
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
        const socket = new WebSocket(WS_URL);

        socket.onopen = () => console.log('WebSocket connected');

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'update') {
                if (data.answeredQuestions) {
                    console.log('Ignoring backend updates during local restoration');
                    return;
                }

                if (data.loggedInTeams) {
                    setLoggedInTeams(data.loggedInTeams);
                }
            }
        };

        socket.onerror = (error) => console.error('WebSocket error:', error);

        socket.onclose = () => console.log('WebSocket disconnected');

        return () => {
            socket.close();
        };
    }, []);

    useEffect(() => {
        const socket = new WebSocket(WS_URL);

        socket.onopen = () => console.log('WebSocket connected');

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'button-click') {
                setButtonPressList(data.buttonPresses); // Update button press list in real-time
            }

            if (data.type === 'reset-button-presses') {
                setButtonPressList([]); // Reset list when modal closes
            }
        };

        socket.onerror = (error) => console.error('WebSocket error:', error);

        socket.onclose = () => console.log('WebSocket disconnected');

        return () => socket.close();
    }, []);

    useEffect(() => {
        if (!saveFileName) {
            console.warn('Save file name is not defined. Skipping save.');
            return;
        }

        const saveState = {
            answeredQuestions,
            teamData,
        };

        if (Object.keys(answeredQuestions).length === 0 && teamData.length === 0) {
            console.warn('Skipping save of empty state.');
            return;
        }

        try {
            localStorage.setItem(saveFileName, JSON.stringify(saveState));
            console.log('Saved game state:', saveState);
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    }, [answeredQuestions, teamData, saveFileName]);

    useEffect(() => {
        console.log('Setting answeredQuestions:', answeredQuestions);
        console.log('Setting teamData:', teamData);
    }, [answeredQuestions, teamData]);

    const openQuestion = (question) => {
        if (answeredQuestions[question.id]) return;

        setModalContent(question);
        setTimeLeft(60);

        // Activate the question for all teams
        axios.post(`${API_URL}/api/toggle-question`, {isQuestionActive: true});
    };

    const closeModal = () => {
        setModalContent(null);
        setTimeLeft(60);

        // Deactivate the question for all teams
        axios.post(`${API_URL}/api/toggle-question`, {isQuestionActive: false});

        // Reset the button press list
        axios.post(`${API_URL}/api/reset-button-presses`);
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
        const updatedAnswers = { ...answeredQuestions, [questionId]: teamColor }; // Mark question as answered
        setAnsweredQuestions(updatedAnswers);

        if (points > 0) {
            const updatedTeams = teamData.map((team) =>
                team.color === teamColor ? { ...team, points: team.points + points } : team
            );
            setTeamData(updatedTeams); // Update team points
        }
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
            await fetch(`${API_URL}/api/kick-team`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({teamName}),
            });
        } catch (error) {
            console.error('Failed to kick team:', error);
        }
    };

    const handleKickAllTeams = async () => {
        try {
            await fetch(`${API_URL}/api/kick-all-teams`, {method: 'POST'});
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
                        Current Picker: <span style={{color: currentPicker.color}}>{currentPicker.name}</span>
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

            <button onClick={toggleTeamListVisibility} className="team-list-button">
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
                                    style={{backgroundColor: answeredQuestions[question.id] ? '#ccc' : '#4caf50'}}
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
                    {/* Display the list of button presses */}
                    <div className="button-press-list">
                        <h4>Teams Who raised hands:</h4>
                        <ul>
                            {buttonPressList.map((entry, index) => (
                                <li key={index}>
                                    {index + 1}. {entry.teamName}
                                </li>
                            ))}
                        </ul>
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
                        <h2 style={{color: sortedTeams[0].color}}>{sortedTeams[0].name}</h2>
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