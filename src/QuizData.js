const quizData = [
    {
        title: "IT",
        questions: [
            { id: 1, type: 'text', content: 'Mi a számítógépek alapértelmezett kettős számrendszerének neve?', points: 1 }, // Bináris
            { id: 2, type: 'image', content: 'media/images/java.png', points: 2 }, //Java
            { id: 3, type: 'text', content: 'Mit rövidit az SQL?', points: 3 }, //Structured Query Language
            { id: 4, type: 'text', content: 'Mi a neve az első teljesen programozható számítógépnek?', points: 4 }, //Eniac
            { id: 5, type: 'text', content: 'Mi a Turing-teszt célja?', points: 5 }, //A vizsgálat annak eldöntésére szolgál, hogy egy számítógép intelligens-e
            { id: 6, type: 'text', content: 'Melyik programozási nyelv használt először osztályokat?', points: 6 } // Simula
        ]
    },
    {
        title: "Történelem",
        questions: [
            { id: 7, type: 'text', content: 'Melyik városban gyilkolták meg Julius Caesart?', points: 1 }, // Róma
            { id: 8, type: 'text', content: 'Melyik ország indította az első műholdat az űrbe?', points: 2 }, // Szovjetunió
            { id: 9, type: 'text', content: 'Mi volt a neve az első sikeres föld körüli hajózás vezetőjének?', points: 3 }, // Magellán
            { id: 10, type: 'text', content: 'Melyik országban találták fel az iránytűt?', points: 4 }, // Kína
            { id: 11, type: 'image', content: 'media/images/Nixon.jpg', points: 5 }, // Nixon
            { id: 12, type: 'text', content: 'Ki volt a „Vaskancellár” becenévvel illetett német politikus?', points: 6 } // Otto von Bismarck
        ]
    },
    {
        title: "Filmek/sorozatok",
        questions: [
            { id: 13, type: 'text', content: 'Mi a neve a Stranger Things városának, ahol az események játszódnak?', points: 1 }, // Hawkins
            { id: 14, type: 'text', content: 'Hány gyűrűt kovácsoltak összesen a Gyűrűk Ura történetében?', points: 2 }, // 20
            { id: 15, type: 'text', content: 'Mi a neve a Quentin Tarantino által rendezett első filmnek?', points: 3 }, // Kutyaszorítóban
            { id: 16, type: 'audio', content: 'media/audio/Omar Little Whistle.mp3', points: 4 }, // Drót(Wire) - Omar Whistle
            { id: 17, type: 'text', content: 'Mi a neve a 2001: Űrodüsszeia című film mesterséges intelligenciájának?', points: 5 }, // HAL 9000
            { id: 18, type: 'text', content: 'Melyik anime film nyerte el elöször az Oscar-díjat a legjobb animációs film kategóriában?', points: 6 } // Spirited away - Chihiro szellemországban
        ]
    },
    {
        title: "Antavo",
        questions: [
            { id: 19, type: 'text', content: 'A challenges module-t hogy hívták eredetileg?', points: 1 }, // Activities
            { id: 20, type: 'text', content: 'Hány Expiration type van a Tiers module-ban és mi a nevük?', points: 2 }, // 3 (Point based, spend based, invitation only)
            { id: 21, type: 'text', content: 'Mi a modul neve amivel pontot lehet adni ha valaki megnéz egy videót?', points: 3 }, // Content consumption
            { id: 22, type: 'text', content: 'Mikor lett az Antavo az év irodája?', points: 4 }, // 2018
            { id: 23, type: 'text', content: 'Mi volt az eszköz neve amivel be akartunk törni a loyalty hardver piacra?', points: 5 }, // Kiosk
            { id: 24, type: 'image', content: 'media/images/auth0-icon.svg', points: 6 } // Auth0
        ]
    },
    {
        title: "Geek",
        questions: [
            { id: 25, type: 'text', content: 'Ki az end boss az eredeti Super Marioban?', points: 1 }, // Bowser
            { id: 26, type: 'text', content: 'Melyik híres anime főszereplője Monkey D. Luffy?', points: 2 }, // One Piece
            { id: 27, type: 'text', content: 'Mi a neve az hajónak az eredeti Mass Effect játékokban?', points: 3 }, // Normandy
            { id: 28, type: 'text', content: 'Mi a neve a varázslatnak amivel reptetni lehet a tárgyakat a Harry Potter világában?', points: 4 }, // Wingardium Leviosa
            { id: 29, type: 'text', content: 'Mi a neve a Fallout videojátékok posztapokaliptikus menedékeinek?', points: 5 }, // Vault
            { id: 30, type: 'text', content: 'Mi a neve a világ első e-sport eseményén, 1972-ben játszott játéknak?', points: 6 } // Spacewar!
        ]
    },
    {
        title: "Random",
        questions: [
            { id: 31, type: 'text', content: 'Hány percböl áll egy nap?', points: 1 }, // 1440
            { id: 32, type: 'text', content: 'Melyik szám a prímszám? (199, 201, 207)', points: 2 }, // 199
            { id: 33, type: 'text', content: 'Egy dobozban van 10 piros és 10 kék golyó. Hány golyót kell kivenni biztosan, hogy legalább két azonos színű golyó legyen nálad?', points: 3 }, // 3 a harmadik golyó biztosan azonos színű lesz valamelyikkel
            { id: 34, type: 'text', content: 'Két apa és két fia összesen három almát oszt el egymás között, és mindegyikük kap egyet. Hogyan lehetséges ez?', points: 4 }, // Nagyapa, apa, fiú (három generáció).
            { id: 35, type: 'text', content: 'Egy szobában négy sarok van. Minden sarokban egy macska ül, és minden macska előtt három macska ül. Hány macska van a szobában?', points: 5 }, // Négy (mindegyik macska látja a többit).
            { id: 36, type: 'text', content: 'Melyik állat ugrik magasabbra egy háznál?', points: 6 } // Mindegyik mert a ház nem ugrik
        ]
    },
    {
        title: "Földrajz",
        questions: [
            { id: 37, type: 'text', content: 'Mi a neve a világ legkisebb kontinensének?', points: 1 }, // Ausztrália
            { id: 38, type: 'text', content: 'Melyik város a világ legnagyobb lakosságú fővárosa?', points: 2 }, // Tokió
            { id: 39, type: 'text', content: 'Melyik az az ország, amely egyszerre tartozik Ázsiához és Európához is?', points: 3 }, // Törökország
            { id: 40, type: 'text', content: 'Melyik ország területén található Machu Picchu?', points: 4 }, // Peru
            { id: 41, type: 'text', content: 'Melyik ország fővárosa Kuala Lumpur?', points: 5 }, // Malajzia
            { id: 42, type: 'image', content: 'media/images/Flag_of_Syria.svg.png', points: 6 } // Szíria
        ]
    }
];

export default quizData;