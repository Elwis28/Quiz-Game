// src/QuizData.js

const quizData = [
    {
        title: "History",
        questions: [
            {
                id: 1,
                type: 'text',
                content: 'Who was the first president of the United States?',
                points: 10
            },
            {
                id: 2,
                type: 'image',
                content: 'https://example.com/history-image.jpg',
                points: 15
            }
        ]
    },
    {
        title: "Science",
        questions: [
            {
                id: 3,
                type: 'text',
                content: 'What is the chemical symbol for water?',
                points: 10
            },
            {
                id: 4,
                type: 'audio',
                content: 'https://example.com/science-audio.mp3',
                points: 20
            }
        ]
    }
];

export default quizData;




