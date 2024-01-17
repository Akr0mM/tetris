const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');

const holdCanvas = document.getElementById('hold');
const holdCtx = holdCanvas.getContext('2d');

const cw = 400;
const ch = 800;
const bs = 25;

nextCanvas.width = 100;
nextCanvas.height = 100;

holdCanvas.width = 100;
holdCanvas.height = 100;

canvas.width = cw;
canvas.height = ch;

let loop = 0;

const SPEED = 3

const FORMS = {
    'I': 0,
    'O': 1,
    'T': 2,
    'L': 3,
    'J': 4,
    'S': 5,
    'Z': 6,
    0: 'I',
    1: 'O',
    2: 'T',
    3: 'L',
    4: 'J',
    5: 'S',
    6: 'Z',
}

const COLORS = {
    'I': '#0ff',
    'O': '#ff0',
    'T': '#a0f',
    'L': '#ffa500',
    'J': '#00f',
    'S': '#0f0',
    'Z': '#f00',
}

const TETRIS = [
    // I
    [
        [
            [1],
            [1],
            [1],
            [1],
        ],
        [
            [1, 1, 1, 1]
        ]
    ],

    // O
    [
        [
            [1, 1],
            [1, 1],
        ]
    ],

    // T
    [
        [
            [0, 1, 0],
            [1, 1, 1],
        ],
        [
            [1, 0],
            [1, 1],
            [1, 0],
        ],
        [
            [1, 1, 1],
            [0, 1, 0],
        ],
        [
            [0, 1],
            [1, 1],
            [0, 1],
        ]
    ],

    // L
    [
        [
            [1, 0],
            [1, 0],
            [1, 1]
        ],
        [
            [1, 1, 1],
            [1, 0, 0],
        ],
        [
            [1, 1],
            [0, 1],
            [0, 1],
        ],
        [
            [0, 0, 1],
            [1, 1, 1],
        ]
    ],

    // J
    [
        [
            [0, 1],
            [0, 1],
            [1, 1]
        ],
        [
            [1, 0, 0],
            [1, 1, 1],
        ],
        [
            [1, 1],
            [1, 0],
            [1, 0],
        ],
        [
            [1, 1, 1],
            [0, 0, 1],
        ]
    ],

    // S
    [
        [
            [0, 1, 1],
            [1, 1, 0],
        ],
        [
            [1, 0],
            [1, 1],
            [0, 1],
        ]
    ],

    // Z
    [
        [
            [1, 1, 0],
            [0, 1, 1],
        ],
        [
            [0, 1],
            [1, 1],
            [1, 0],
        ]
    ]

]

let nextTetris;
let currentTetris;
let holdTetris;
let gameOver = false;
let score = 0;
const blockScore = 50;
const lineScore = 200;
newTetris();
newTetris();
let fixedTetris = [];

const game = window.setInterval(() => {
    // bg 
    rect(0, 0, cw, ch, '#121213')

    displayHoldTetris();
    displayNextTetris();

    if (gameOver) {
        window.clearInterval(game)
        alert('Game Over\nScore : ' + score)
    }

    if (loop == SPEED) {
        loop = 0;

        // gravity
        const yLength = TETRIS[FORMS[currentTetris.tetris]][currentTetris.rotation].length
        if (currentTetris.y == ch / bs - yLength || tetrisCollision()) {
            freezeCurrentTetris();
        } else {
            currentTetris.y += 1;
        }
    } else {
        loop++;
    }

    displayTetris(currentTetris);
    displayFixedTetris();
    checkGameOver();
    displayScore();
    displayHighScore();
}, 50);

window.addEventListener('keydown', (event) => {
    if (event.key == 'ArrowLeft' && currentTetris.x != 0) {
        currentTetris.x += -1;
    } else if (event.key == 'ArrowRight' && currentTetris.x != cw / bs - TETRIS[FORMS[currentTetris.tetris]][currentTetris.rotation][0].length) {
        currentTetris.x += 1;
    }

    if (event.key == 'ArrowUp') {
        if (currentTetris.rotation < TETRIS[FORMS[currentTetris.tetris]].length - 1) {
            currentTetris.rotation += 1;
        } else {
            currentTetris.rotation = 0;
            if (currentTetris.tetris == 'I') currentTetris.x += 1;
        }
    } else if (event.key == 'ArrowDown') {
        slowDropTetris();
    }

    if (event.key == ' ') {
        holdCurrentTetris();
    }

    fixPosition();
})

function displayHoldTetris() {
    holdCtx.fillStyle = '#121213';
    holdCtx.fillRect(0, 0, 100, 100);

    if (holdTetris) {
        const tetris = TETRIS[FORMS[holdTetris.tetris]][holdTetris.rotation];

        const xOffset = tetris[0].length <= 2 ? 1 : 0
        const yOffset = tetris.length <= 2 ? 1 : 0

        for (let y = 0; y < tetris.length; y++) {
            for (let x = 0; x < tetris[y].length; x++) {
                if (tetris[y][x]) {
                    holdCtx.fillStyle = COLORS[holdTetris.tetris];
                    holdCtx.fillRect((x + xOffset) * bs, (y + yOffset) * bs, bs, bs);
                }
            }
        }
    }
}

function displayNextTetris() {
    nextCtx.fillStyle = '#121213';
    nextCtx.fillRect(0, 0, 100, 100);

    const tetris = TETRIS[FORMS[nextTetris.tetris]][nextTetris.rotation];

    const xOffset = tetris[0].length <= 2 ? 1 : 0
    const yOffset = tetris.length <= 2 ? 1 : 0

    for (let y = 0; y < tetris.length; y++) {
        for (let x = 0; x < tetris[y].length; x++) {
            if (tetris[y][x]) {
                nextCtx.fillStyle = COLORS[nextTetris.tetris];
                nextCtx.fillRect((x + xOffset) * bs, (y + yOffset) * bs, bs, bs);
            }
        }
    }
}

function slowDropTetris() {
    tetrisCollision();
    currentTetris.y += 1;
}

function checkGameOver() {
    fixedTetris.forEach(tetris => {
        if (tetris.y <= 3) {
            gameOver = true;
            saveHighScore(score);
        }
    })
}

function holdCurrentTetris() {
    if (!holdTetris) {
        holdTetris = currentTetris;
        newTetris();
    } else {
        const current = currentTetris;
        const currentX = current.x
        currentTetris = holdTetris;
        currentTetris.x = currentX;
        holdTetris = current;
    }
}

function displayScore() {
    scoreElt = document.getElementById('score')
    scoreElt.textContent = score;
}

function displayHighScore() {
    highScoreElt = document.getElementById('highscore');
    highScoreElt.textContent = getHighScore();
}

function tetrisCollision() {
    fixedTetris.forEach(tetris => {
        const currentTetrisForm = TETRIS[FORMS[currentTetris.tetris]][currentTetris.rotation];
        for (let y = 0; y < currentTetrisForm.length; y++) {
            for (let x = 0; x < currentTetrisForm[y].length; x++) {
                if (currentTetrisForm[y][x] && currentTetris.x + x == tetris.x && currentTetris.y + y == tetris.y - 1) {
                    freezeCurrentTetris();
                }
            }
        }
    })
}

function saveHighScore(score) {
    localStorage.setItem("HighScore", score);
}

function getHighScore() {
    if (localStorage.getItem('HighScore')) {
        return localStorage.getItem('HighScore');
    } else {
        return 0;
    }
}

function checkLine() {
    for (let y = ch / bs; y >= 0; y--) {
        let block = 0;
        for (let i = 0; i < fixedTetris.length; i++) {
            if (fixedTetris[i].y == y) block++;

            if (block == cw / bs) {
                deleteLine(y);
                y++
            }
        }
    }
}

function deleteLine(y) {
    for (let i = 0; i < fixedTetris.length; i++) {
        if (fixedTetris[i].y == y) {
            fixedTetris.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < fixedTetris.length; i++) {
        if (fixedTetris[i].y < y) {
            fixedTetris[i].y += 1;
        }
    }

    score += lineScore;
}

function freezeCurrentTetris() {
    const tetris = TETRIS[FORMS[currentTetris.tetris]][currentTetris.rotation];
    for (let y = 0; y < tetris.length; y++) {
        for (let x = 0; x < tetris[y].length; x++) {
            if (tetris[y][x]) {
                fixedTetris.push({
                    x: currentTetris.x + x,
                    y: currentTetris.y + y,
                    color: COLORS[currentTetris.tetris]
                })
            }
        }
    }

    newTetris();
    checkLine();

    score += blockScore;
}

function displayFixedTetris() {
    fixedTetris.forEach(tetris => {
        rect(tetris.x * bs, tetris.y * bs, bs, bs, tetris.color);
    })
}

function fixPosition() {
    const xLength = TETRIS[FORMS[currentTetris.tetris]][currentTetris.rotation][0].length;
    const xMax = cw / bs - xLength;
    if (currentTetris.x > xMax) currentTetris.x = xMax;

    const yLength = TETRIS[FORMS[currentTetris.tetris]][currentTetris.rotation].length;
    const yMax = ch / bs - yLength;
    if (currentTetris.y > yMax) currentTetris.y = yMax;
}

function newTetris() {
    currentTetris = nextTetris;
    nextTetris = {
        tetris: FORMS[Math.floor(Math.random() * 7)],
        rotation: 0,
        x: Math.floor(cw / bs / 2) - 1,
        y: 0,
    }
}

function displayTetris(tetris) {
    display(FORMS[tetris.tetris], tetris.rotation, tetris.x, tetris.y);
}

function display(form, rotation, x, y) {
    const tetris = TETRIS[form][rotation];
    for (let row = 0; row < tetris.length; row++) {
        for (let file = 0; file < tetris[row].length; file++) {
            if (tetris[row][file]) {
                rect((x + file) * bs, (y + row) * bs, bs, bs, COLORS[FORMS[form]])
            }
        }
    }
}

function rect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}