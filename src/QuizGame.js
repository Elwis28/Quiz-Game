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
    const [timeLeft, setTimeLeft] = useState(60);
    const [currentPicker, setCurrentPicker] = useState(null);
    const [isGameComplete, setIsGameComplete] = useState(false);
    const [loggedInTeams, setLoggedInTeams] = useState(initialLoggedInTeams || []);
    const [buttonPressList, setButtonPressList] = useState([]);
    const [currentPickerIndex, setCurrentPickerIndex] = useState(0); // Default to the first team
    const [isCollapsed, setIsCollapsed] = useState(false);


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
                        const {
                            answeredQuestions: savedAnswers,
                            teamData: savedTeams,
                            currentPickerIndex: savedPickerIndex,
                        } = JSON.parse(savedGame);

                        setAnsweredQuestions(savedAnswers || {});
                        restoredTeams = savedTeams && savedTeams.length > 0 ? savedTeams : teams;
                        setTeamData(restoredTeams);

                        // Restore picker index and picker team
                        const pickerIndex = savedPickerIndex !== undefined ? savedPickerIndex : 0;
                        setCurrentPickerIndex(pickerIndex);
                        if (restoredTeams.length > 0) {
                            setCurrentPicker(restoredTeams[pickerIndex]); // Set picker to saved index
                        }

                        console.log('Restored from localStorage:', {
                            savedAnswers,
                            restoredTeams,
                            pickerIndex,
                        });
                        return; // Exit restoration logic after successful localStorage restoration
                    } catch (error) {
                        console.error('Failed to parse saved game state:', error);
                    }
                }
            }

            // Fallback to backend or default state
            try {
                const { data } = await axios.get(`${API_URL}/api/game-state`);
                setAnsweredQuestions(data.answeredQuestions || {});
                restoredTeams = data.teamData && data.teamData.length > 0 ? data.teamData : teams;
                setTeamData(restoredTeams);

                // Set picker index to default (0)
                setCurrentPickerIndex(0);
                if (restoredTeams.length > 0) {
                    setCurrentPicker(restoredTeams[0]); // First team picks by default
                }

                console.log('Restored from backend:', { answeredQuestions: data.answeredQuestions, teamData: data.teamData });
            } catch (error) {
                console.error('Error fetching game state from backend:', error);
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
            setCurrentPicker(restoredTeams[currentPickerIndex]);
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
            currentPickerIndex, // Include picker index
        };

        if (
            Object.keys(answeredQuestions).length === 0 &&
            teamData.length === 0 &&
            currentPickerIndex === 0
        ) {
            console.warn('Skipping save of empty state.');
            return;
        }

        try {
            localStorage.setItem(saveFileName, JSON.stringify(saveState));
            console.log('Saved game state:', saveState);
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    }, [answeredQuestions, teamData, currentPickerIndex, saveFileName]);

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
        if (teamData.length === 0) return; // No teams to pick

        const nextIndex = (currentPickerIndex + 1) % teamData.length;
        setCurrentPickerIndex(nextIndex); // Move to the next team
        setCurrentPicker(teamData[nextIndex]); // Update the picker

        // Save to localStorage
        try {
            localStorage.setItem(saveFileName, JSON.stringify({
                answeredQuestions,
                teamData,
                currentPickerIndex: nextIndex, // Save picker index
            }));
        } catch (error) {
            console.error('Failed to save picker state:', error);
        }
    };

    const toggleSidebar = () => {
        setIsCollapsed((prev) => !prev);
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

    const updateTeamPoints = (teamName, adjustment) => {
        setTeamData((prevTeamData) =>
            prevTeamData.map((team) =>
                team.name === teamName
                    ? { ...team, points: Math.max(team.points + adjustment, 0) }
                    : team
            )
        );
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

            <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
                <button className="toggle-button" onClick={toggleSidebar}>
                    {isCollapsed ? ">" : "<"}
                </button>
                {!isCollapsed && (
                    <>
                        <div className="sidebar-section leaderboard-section">
                            <h3>Leaderboard</h3>
                            <ul>
                                {sortedTeams.map((team, index) => (
                                    <li key={team.name}>
                                        <span>{index + 1}. {team.name}</span>
                                        <span>{team.points} points</span>
                                        <button
                                            className="adjust-button"
                                            onClick={() => updateTeamPoints(team.name, 1)}
                                        >
                                            +
                                        </button>
                                        <button
                                            className="adjust-button"
                                            onClick={() => updateTeamPoints(team.name, -1)}
                                        >
                                            -
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}

                {/* Team List Section */}
                <div className="sidebar-section team-list-section">
                    <h3>Team List</h3>
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
                            <button onClick={() => handleKickTeam(team.name)}>✕</button>
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
            </div>


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
                    <div className="modal-content">
                    {/* Top Section */}
                        <div className="modal-top">
                            <div className="modal-timer">
                                {timeLeft > 0 ? `Time Left: ${timeLeft}s` : "Time's up!"}
                            </div>
                            {modalContent.type === "text" && (
                                <h3 style={{ fontSize: "4.5em" }}>{modalContent.content}</h3>
                            )}
                            {modalContent.type === "image" && (
                                <img
                                    src={modalContent.content}
                                    alt="Quiz Visual"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "50vh",
                                        margin: "0 auto",
                                        display: "block",
                                    }}
                                />
                            )}
                            {modalContent.type === "video" && (
                                <video
                                    src={modalContent.content}
                                    controls
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "300px",
                                        margin: "0 auto",
                                        display: "block",
                                    }}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            )}
                            {modalContent.type === "audio" && (
                                <audio src={modalContent.content}
                                       controls>
                                    Your browser does not support the audio tag.
                                </audio>
                            )}
                        </div>

                        {/* Button Press List */}
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

                        {/* Team Buttons */}
                        <div className="team-buttons">
                            {teamData.map((team) => (
                                <button
                                    key={team.name}
                                    onClick={() => handleTeamWin(team)}
                                    style={{
                                        backgroundColor: team.color,
                                        padding: "10px",
                                        margin: "5px",
                                        border: "none",
                                        borderRadius: "5px",
                                        color: "white",
                                        cursor: "pointer",
                                    }}
                                >
                                    {team.name}
                                </button>
                            ))}
                            <button
                                onClick={handleNoWinner}
                                style={{
                                    backgroundColor: "black",
                                    padding: "10px",
                                    margin: "5px",
                                    border: "none",
                                    borderRadius: "5px",
                                    color: "white",
                                    cursor: "pointer",
                                }}
                            >
                                None
                            </button>
                        </div>
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