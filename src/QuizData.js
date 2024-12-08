const quizData = [
    {
        title: "IT",
        questions: [
            { id: 1, type: 'image', content: 'media/images/java.png', points: 1 }, // Könnyű
            { id: 2, type: 'image', content: 'https://example.com/byte-image.png', points: 2 }, // Egy kép egy bináris számról, válasz: "Byte"
            { id: 3, type: 'text', content: 'Mi az SQL teljes jelentése?', points: 3 }, // Structured Query Language
            { id: 4, type: 'image', content: 'https://example.com/java-logo.png', points: 4 }, // Kávéscsésze a Java logójából
            { id: 5, type: 'video', content: 'https://example.com/python-intro.mp4', points: 5 }, // Python programozás videó, válasz: "Python"
            { id: 6, type: 'text', content: 'Melyik programozási nyelv használt először osztályokat?', points: 6 } // Smalltalk
        ]
    },
    {
        title: "Történelem",
        questions: [
            { id: 7, type: 'text', content: 'Melyik városban gyilkolták meg Julius Caesart?', points: 1 }, // Róma
            { id: 8, type: 'image', content: 'https://example.com/julius-caesar.jpg', points: 2 }, // Kép Caesar szobráról
            { id: 9, type: 'text', content: 'Melyik évben esett le a berlini fal?', points: 3 }, // 1989
            { id: 10, type: 'image', content: 'https://example.com/berlin-wall.jpg', points: 4 }, // Kép a berlini fal leomlásáról
            { id: 11, type: 'video', content: 'https://example.com/moon-landing.mp4', points: 5 }, // Holdraszállás videó, válasz: "1969"
            { id: 12, type: 'text', content: 'Hogyan nevezték az első világháborúban használt harci gázt?', points: 6 } // Mustár
        ]
    },
    {
        title: "Filmek/sorozatok",
        questions: [
            { id: 13, type: 'text', content: 'Melyik országban játszódik a Harry Potter történet?', points: 1 }, // Anglia
            { id: 14, type: 'image', content: 'https://example.com/hogwarts.jpg', points: 2 }, // Roxfort képe
            { id: 15, type: 'text', content: 'Hány évad készült a Breaking Bad sorozatból?', points: 3 }, // 5
            { id: 16, type: 'video', content: 'https://example.com/delorean-scene.mp4', points: 4 }, // Delorean autó jelenet, válasz: "Vissza a jövőbe"
            { id: 17, type: 'text', content: 'Melyik színész játssza James Bondot a "Casino Royale" filmben?', points: 5 }, // Daniel Craig
            { id: 18, type: 'image', content: 'https://example.com/westeros-map.jpg', points: 6 } // Westeros térképe
        ]
    },
    {
        title: "Antavo kérdések",
        questions: [
            { id: 19, type: 'text', content: 'Mi az Antavo székhelyének országa?', points: 1 }, // Magyarország
            { id: 20, type: 'image', content: 'https://example.com/antavo-logo.png', points: 2 }, // Antavo logó
            { id: 21, type: 'text', content: 'Melyik évben alapították az Antavót?', points: 3 }, // 2011
            { id: 22, type: 'image', content: 'https://example.com/antavo-dashboard.jpg', points: 4 }, // Antavo platform képernyőkép
            { id: 23, type: 'text', content: 'Milyen funkciók érhetők el az Antavo platformján?', points: 5 }, // Loyalty management
            { id: 24, type: 'text', content: 'Hány éves az Antavo 2024-ben, ha 2011-ben alapították?', points: 6 } // 13
        ]
    },
    {
        title: "Geek",
        questions: [
            { id: 25, type: 'text', content: 'Mi az eredeti nyelve a "The Lord of the Rings"-nek?', points: 1 }, // Angol
            { id: 26, type: 'image', content: 'https://example.com/hyrule-map.jpg', points: 2 }, // Hyrule térkép a Zeldából
            { id: 27, type: 'text', content: 'Melyik sorozatban szerepel "Spock"?', points: 3 }, // Star Trek
            { id: 28, type: 'image', content: 'https://example.com/ironman-armor.jpg', points: 4 }, // Iron Man páncél
            { id: 29, type: 'text', content: 'Melyik sci-fi filmben található az "Alien" idegen?', points: 5 }, // Alien
            { id: 30, type: 'video', content: 'https://example.com/lego-scene.mp4', points: 6 } // Lego jelenet
        ]
    },
    {
        title: "Random",
        questions: [
            { id: 31, type: 'text', content: 'Hány órából áll egy nap?', points: 1 }, // 24
            { id: 32, type: 'image', content: 'https://example.com/rainbow.jpg', points: 2 }, // Szivárvány képe
            { id: 33, type: 'text', content: 'Melyik állat a világ legnagyobb emlőse?', points: 3 }, // Bálna
            { id: 34, type: 'image', content: 'https://example.com/prime-number.jpg', points: 4 }, // Prímszámokat tartalmazó kép
            { id: 35, type: 'text', content: 'Mi az idő mértékegysége?', points: 5 }, // Másodperc
            { id: 36, type: 'video', content: 'https://example.com/riddle-video.mp4', points: 6 } // Fejtörő videó
        ]
    }
];

export default quizData;






