// =========================================
// ACADEMIC ESCAPE — game.js
// =========================================

// -----------------------------------------
// CONFIG (atur keseimbangan game di sini)
// -----------------------------------------
const CONFIG = {
    timeLimit: 5 * 60,       // detik
    quizQuestions: 2,        // jumlah soal Room 1
    codeQuestions: 2,        // jumlah soal Room 4
    mazeSize: 11,            // HARUS ganjil
    basePoints: 100,         // poin dasar per room
    maxSpeedBonus: 150,      // bonus maksimum jika selesai instan
    roomTargetTime: 60,      // detik; lewat ini bonus kecepatan = 0
    penalty: { quiz: 40, puzzle: 60, code: 40, final: 100 },
    finalBonus: 300,
    finalTimePoints: 2,      // poin per detik sisa waktu di Room 5
};


// -----------------------------------------
// QUESTION BANKS
// -----------------------------------------
const QUIZ_BANK = [
    { q: "What does `box-sizing: border-box` change in CSS?",
      a: "Width and height include padding and border",
      wrong: ["Width excludes padding but includes border", "Margin is included in the element's width", "Borders are removed from the layout"] },
    { q: "Which HTTP status code means the server understood the request but refuses to authorize it?",
      a: "403", wrong: ["401", "404", "500"] },
    { q: "What is the time complexity of binary search on a sorted array?",
      a: "O(log n)", wrong: ["O(n)", "O(n log n)", "O(1)"] },
    { q: "Which data structure is typically used to implement Breadth-First Search?",
      a: "Queue", wrong: ["Stack", "Heap", "Hash table"] },
    { q: "Which SQL clause filters rows AFTER aggregation (GROUP BY)?",
      a: "HAVING", wrong: ["WHERE", "ORDER BY", "LIMIT"] },
    { q: "In JavaScript, what does the `===` operator do?",
      a: "Compares value and type without coercion", wrong: ["Compares value only, with coercion", "Assigns a value and compares it", "Compares memory addresses only"] },
    { q: "Which of these is NOT a primitive type in JavaScript?",
      a: "Object", wrong: ["Symbol", "BigInt", "Boolean"] },
    { q: "What does DNS do?",
      a: "Translates domain names into IP addresses", wrong: ["Encrypts web traffic", "Assigns IP addresses to devices", "Stores website files"] },
    { q: "A scientific hypothesis must primarily be:",
      a: "Testable and falsifiable", wrong: ["Proven true beforehand", "Supported by majority opinion", "Impossible to disprove"] },
    { q: "In statistics, a p-value below 0.05 usually means:",
      a: "Evidence against the null hypothesis at the 5% level", wrong: ["The hypothesis is proven true", "There is a 5% chance the result is real", "The sample is too small"] },
    { q: "Which Git command creates a new branch AND switches to it?",
      a: "git checkout -b <name>", wrong: ["git branch <name>", "git switch <name>", "git merge <name>"] },
    { q: "What is the time complexity of reading an array element by its index?",
      a: "O(1)", wrong: ["O(log n)", "O(n)", "O(n²)"] },
];

const CODE_BANK = [
    { code: ['let a = "5";', 'let b = 3;', 'console.log(a + b);'],
      output: "53", wrong: ["8", "15", "NaN"] },
    { code: ['console.log("5" - 2);'],
      output: "3", wrong: ["52", "NaN", "7"] },
    { code: ['console.log(typeof null);'],
      output: "object", wrong: ["null", "undefined", "string"] },
    { code: ['let n = 0;', 'for (let i = 1; i <= 4; i++) {', '  n += i;', '}', 'console.log(n);'],
      output: "10", wrong: ["4", "6", "24"] },
    { code: ['const arr = [1, 2, 3];', 'arr.push(4);', 'console.log(arr.length);'],
      output: "4", wrong: ["3", "5", "undefined"] },
    { code: ['console.log(0.1 + 0.2 === 0.3);'],
      output: "false", wrong: ["true", "undefined", "Error"] },
    { code: ['const nums = [3, 1, 2];', 'console.log(nums.map(x => x * 2).join("-"));'],
      output: "6-2-4", wrong: ["2-4-6", "3-1-2", "6,2,4"] },
    { code: ['let x = 10;', 'function f() {', '  let x = 5;', '  return x;', '}', 'console.log(f() + x);'],
      output: "15", wrong: ["10", "5", "20"] },
];

// steps ditulis dalam URUTAN BENAR; tampilan diacak otomatis
const PUZZLE_BANK = [
    { title: "Arrange the Scientific Method",
      steps: [
        { title: "Question", description: "Identify what you want to explain." },
        { title: "Hypothesis", description: "Propose a testable explanation." },
        { title: "Experiment", description: "Collect data under controlled conditions." },
        { title: "Conclusion", description: "Decide whether the data supports the idea." },
      ] },
    { title: "Arrange the Software Lifecycle",
      steps: [
        { title: "Requirements", description: "Define what the system must do." },
        { title: "Design", description: "Plan the architecture and interfaces." },
        { title: "Implementation", description: "Write the code." },
        { title: "Testing", description: "Verify it works as specified." },
      ] },
    { title: "Arrange the Writing Process",
      steps: [
        { title: "Outline", description: "Structure the main ideas." },
        { title: "Draft", description: "Write the first full version." },
        { title: "Revise", description: "Improve clarity and argument." },
        { title: "Proofread", description: "Fix grammar and typos." },
      ] },
    { title: "Arrange the Git Workflow",
      steps: [
        { title: "Modify", description: "Edit files in the working directory." },
        { title: "Stage", description: "Select changes with git add." },
        { title: "Commit", description: "Record a snapshot with git commit." },
        { title: "Push", description: "Upload commits with git push." },
      ] },
    { title: "Arrange the Thesis Structure",
      steps: [
        { title: "Introduction", description: "State the problem and objectives." },
        { title: "Literature Review", description: "Summarize prior work." },
        { title: "Methodology", description: "Explain how the study was done." },
        { title: "Results", description: "Present and discuss the findings." },
      ] },
];


// -----------------------------------------
// ROOMS
// -----------------------------------------
const rooms = [
    { id: 1, name: "CLASSROOM",    type: "quiz"   },
    { id: 2, name: "LABORATORY",   type: "puzzle" },
    { id: 3, name: "LIBRARY",      type: "maze"   },
    { id: 4, name: "COMPUTER LAB", type: "code"   },
    { id: 5, name: "FINAL ESCAPE", type: "final"  },
];


// -----------------------------------------
// GAME STATE
// -----------------------------------------
const gameState = {
    currentRoom: 1,
    totalRooms: rooms.length,
    timeLimit: CONFIG.timeLimit,
    timeLeft: CONFIG.timeLimit,
    endTime: 0,
    timerInterval: null,
    timerClass: "",
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    roomsCleared: 0,
    keysFound: 0,
    gameStarted: false,
    gameFinished: false,
    escaped: false,
    secretCode: [],       // dibuat acak tiap game
    finalInput: [],
    finalLocked: false,
    roomStartTime: 0,
    runId: 0,             // mencegah setTimeout dari game lama
    quiz: null,
    codeChallenge: null,
};

let mazeMap = [];

const mazeState = {
    playerRow: 1,
    playerCol: 1,
    exitRow: 1,
    exitCol: 1,
    completed: false,
};


// -----------------------------------------
// DOM
// -----------------------------------------
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");
const gameOverScreen = document.getElementById("game-over-screen");

const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const tryAgainButton = document.getElementById("try-again-button");

const roomNumber = document.getElementById("room-number");
const roomName = document.getElementById("room-name");
const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");
const roomContainer = document.getElementById("room-container");


// -----------------------------------------
// UTILITIES
// -----------------------------------------
function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function pad2(n) {
    return String(n).padStart(2, "0");
}

// setTimeout yang otomatis batal jika game di-restart / pindah room / selesai
function later(fn, ms) {
    const run = gameState.runId;
    const room = gameState.currentRoom;

    setTimeout(function () {
        if (
            run !== gameState.runId ||
            room !== gameState.currentRoom ||
            !gameState.gameStarted
        ) {
            return;
        }
        fn();
    }, ms);
}

function penalize(amount) {
    gameState.wrongAnswers++;
    gameState.score = Math.max(0, gameState.score - amount);
    updateHUD();
}

function highlightCode(line) {
    const safe = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    return safe.replace(
        /("[^"]*")|\b(let|const|var|function|return|for|if|else)\b|\b(\d+(?:\.\d+)?)\b/g,
        function (match, str, keyword, number) {
            if (str) return `<span class="code-string">${str}</span>`;
            if (keyword) return `<span class="code-keyword">${keyword}</span>`;
            return `<span class="code-number">${number}</span>`;
        }
    );
}

// pertanyaan pilihan ganda: jawaban diacak, label ditentukan SETELAH diacak
function buildAnswers(correctText, wrongTexts) {
    const mixed = shuffle([
        { text: correctText, correct: true },
        ...wrongTexts.map(t => ({ text: t, correct: false })),
    ]);
    return mixed.map((a, i) => ({ ...a, label: "ABCD"[i] }));
}


// -----------------------------------------
// SCORING (makin cepat makin besar)
// -----------------------------------------
function awardRoomPoints() {
    const elapsed = (Date.now() - gameState.roomStartTime) / 1000;
    const ratio = Math.max(0, 1 - elapsed / CONFIG.roomTargetTime);
    const bonus = Math.round(CONFIG.maxSpeedBonus * ratio);
    const total = CONFIG.basePoints + bonus;

    gameState.score += total;
    gameState.roomsCleared++;

    return { total, bonus, elapsed };
}

// dipanggil setiap Room 1-4 selesai
function completeRoom() {
    const result = awardRoomPoints();
    const digit = gameState.secretCode[gameState.currentRoom - 1];

    gameState.keysFound++;
    updateHUD();

    later(function () {
        showKeyReveal(digit, result);
    }, 800);
}

function showKeyReveal(digit, result) {
    const roomId = gameState.currentRoom;
    const isLast = roomId === 4;

    roomContainer.innerHTML = `
        <div class="final-room">
            <div class="final-kicker">KEY FRAGMENT RECOVERED</div>
            <div class="final-card">
                <div class="final-lock">
                    <div class="final-lock-icon">🔑</div>
                </div>
                <h2 class="final-title">DIGIT ${roomId} OF 4</h2>
                <p class="final-description">
                    This is digit #${roomId} of the escape code.
                    Memorize it. It will not be shown again.
                </p>
                <div class="escape-code-display">
                    <span class="code-digit filled">${digit}</span>
                </div>
                <div class="escape-status correct">
                    +${result.total} POINTS (SPEED BONUS +${result.bonus})
                </div>
                <button type="button" class="continue-button" id="reveal-continue" style="margin-top:22px;">
                    ${isLast ? "GO TO FINAL ROOM" : "NEXT ROOM"}
                </button>
            </div>
        </div>
    `;

    const button = document.getElementById("reveal-continue");

    button.addEventListener("click", function () {
        if (!gameState.gameStarted || gameState.currentRoom !== roomId) return;
        gameState.currentRoom = roomId + 1;
        loadRoom(gameState.currentRoom);
    });

    button.focus();
}


// -----------------------------------------
// START / RESET
// -----------------------------------------
function generateSecretCode() {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
}

function startGame() {
    if (gameState.gameStarted) return;

    resetGameState();

    gameState.secretCode = generateSecretCode();
    gameState.gameStarted = true;
    gameState.endTime = Date.now() + CONFIG.timeLimit * 1000;

    startScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    ensureKeyTracker();
    loadRoom(1);
    startTimer();
}

function resetGameState() {
    stopTimer();

    gameState.runId++;
    gameState.currentRoom = 1;
    gameState.timeLeft = CONFIG.timeLimit;
    gameState.score = 0;
    gameState.correctAnswers = 0;
    gameState.wrongAnswers = 0;
    gameState.roomsCleared = 0;
    gameState.keysFound = 0;
    gameState.gameStarted = false;
    gameState.gameFinished = false;
    gameState.escaped = false;
    gameState.secretCode = [];
    gameState.finalInput = [];
    gameState.finalLocked = false;
    gameState.quiz = null;
    gameState.codeChallenge = null;

    mazeState.completed = false;

    timerElement.classList.remove("timer-warning", "timer-danger");
    gameState.timerClass = "";

    updateTimerDisplay();
}


// -----------------------------------------
// TIMER (berbasis jam sistem, tidak drift)
// -----------------------------------------
function startTimer() {
    stopTimer();
    gameState.timerInterval = setInterval(tick, 250);
}

function stopTimer() {
    if (gameState.timerInterval !== null) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function tick() {
    if (!gameState.gameStarted) return;

    gameState.timeLeft = Math.max(
        0,
        Math.ceil((gameState.endTime - Date.now()) / 1000)
    );

    updateTimerDisplay();
    updateTimerWarning();

    if (gameState.timeLeft <= 0) {
        timeUp();
    }
}

function timeUp() {
    if (gameState.gameFinished) return;

    stopTimer();

    gameState.gameStarted = false;
    gameState.gameFinished = true;
    gameState.escaped = false;

    gameScreen.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    timerElement.textContent = `${pad2(minutes)}:${pad2(seconds)}`;
}

function updateTimerWarning() {
    let next = "";

    if (gameState.timeLeft <= 30) next = "timer-danger";
    else if (gameState.timeLeft <= 60) next = "timer-warning";

    // hanya ubah saat berganti state supaya animasi tidak restart tiap tick
    if (next === gameState.timerClass) return;

    timerElement.classList.remove("timer-warning", "timer-danger");
    if (next) timerElement.classList.add(next);
    gameState.timerClass = next;
}


// -----------------------------------------
// HUD
// -----------------------------------------
function ensureKeyTracker() {
    if (document.getElementById("keys")) return;

    const status = document.querySelector(".game-status");
    if (!status) return;

    const tracker = document.createElement("div");
    tracker.className = "score";
    tracker.innerHTML = `<span>KEYS</span><strong id="keys">0/4</strong>`;
    status.insertBefore(tracker, status.firstChild);
}

function updateHUD() {
    const room = rooms[gameState.currentRoom - 1];
    if (!room) return;

    roomNumber.textContent = `ROOM ${pad2(gameState.currentRoom)}`;
    roomName.textContent = room.name;
    scoreElement.textContent = gameState.score;

    const keys = document.getElementById("keys");
    if (keys) keys.textContent = `${gameState.keysFound}/4`;

    updateTimerDisplay();

    progressText.textContent = `${gameState.currentRoom} / ${gameState.totalRooms}`;
    progressFill.style.width =
        `${(gameState.currentRoom / gameState.totalRooms) * 100}%`;
}


// -----------------------------------------
// ROOM LOADER
// -----------------------------------------
function loadRoom(roomId) {
    const room = rooms[roomId - 1];
    if (!room) return;

    gameState.roomStartTime = Date.now();
    updateHUD();

    switch (room.type) {
        case "quiz":   loadQuizRoom();   break;
        case "puzzle": loadPuzzleRoom(); break;
        case "maze":   loadMazeRoom();   break;
        case "code":   loadCodeRoom();   break;
        case "final":  loadFinalRoom();  break;
    }
}


// =========================================
// ROOM 1 — QUIZ
// =========================================
function loadQuizRoom() {
    const picked = shuffle(QUIZ_BANK)
        .slice(0, CONFIG.quizQuestions)
        .map(q => ({ ...q, answers: buildAnswers(q.a, q.wrong) }));

    gameState.quiz = { questions: picked, index: 0 };
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const quiz = gameState.quiz;
    const question = quiz.questions[quiz.index];

    roomContainer.innerHTML = `
        <div class="quiz-room">
            <div class="room-kicker">CLASSROOM CHALLENGE</div>

            <div class="question-card">
                <div class="question-number">Q${pad2(quiz.index + 1)}</div>
                <h2 class="question-title">${question.q}</h2>
                <p class="question-subtext">
                    Question ${quiz.index + 1} of ${quiz.questions.length}
                </p>

                <div class="answers-grid">
                    ${question.answers.map(answer => `
                        <button type="button" class="answer-button"
                                data-correct="${answer.correct}">
                            <span class="answer-letter">${answer.label}</span>
                            <span class="answer-text">${answer.text}</span>
                        </button>
                    `).join("")}
                </div>

                <div class="quiz-feedback">
                    Select an answer to unlock the room.
                </div>
            </div>

            <div class="room-footer">
                <div class="lock-status">
                    <span class="lock-icon">🔒</span>
                    <span>ROOM LOCKED</span>
                </div>
            </div>
        </div>
    `;

    const buttons = document.querySelectorAll(".answer-button");
    const feedback = document.querySelector(".quiz-feedback");
    const lockStatus = document.querySelector(".lock-status span:last-child");

    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            handleQuizAnswer(button, buttons, feedback, lockStatus);
        });
    });
}

function handleQuizAnswer(button, buttons, feedback, lockStatus) {
    if (button.disabled || !gameState.gameStarted) return;

    if (button.dataset.correct === "true") {
        buttons.forEach(b => (b.disabled = true));
        button.classList.add("correct");

        gameState.correctAnswers++;
        gameState.quiz.index++;

        feedback.classList.remove("wrong");
        feedback.classList.add("correct");

        if (gameState.quiz.index < gameState.quiz.questions.length) {
            feedback.textContent = "CORRECT! Next question...";
            later(renderQuizQuestion, 800);
        } else {
            feedback.textContent = "CORRECT! The classroom has been unlocked.";
            lockStatus.textContent = "ROOM UNLOCKED";
            completeRoom();
        }
    } else {
        button.classList.add("wrong");
        button.disabled = true;

        penalize(CONFIG.penalty.quiz);

        feedback.textContent = "INCORRECT. Try again.";
        feedback.classList.remove("correct");
        feedback.classList.add("wrong");
    }
}


// =========================================
// ROOM 2 — PUZZLE
// =========================================
function loadPuzzleRoom() {
    const set = pickRandom(PUZZLE_BANK);
    const items = set.steps.map((step, i) => ({ id: i + 1, ...step }));

    // tampilan acak, dijamin berbeda dari urutan benar
    let display;
    do {
        display = shuffle(items);
    } while (display.every((item, i) => item.id === i + 1));

    roomContainer.innerHTML = `
        <div class="lab-room">
            <div class="lab-kicker">LABORATORY CHALLENGE</div>

            <div class="puzzle-card">
                <div class="puzzle-header">
                    <div class="puzzle-number">PUZZLE_02</div>
                    <h2 class="puzzle-title">${set.title}</h2>
                </div>

                <p class="puzzle-description">
                    Put the steps into the correct logical order.
                </p>

                <div class="puzzle-instruction">
                    <span class="puzzle-instruction-icon">↕</span>
                    <span>Click the steps from first to last.</span>
                </div>

                <div class="puzzle-items">
                    ${display.map(item => `
                        <button type="button" class="puzzle-item" data-id="${item.id}">
                            <span class="puzzle-item-number">·</span>
                            <span>
                                <strong class="puzzle-item-title">${item.title}</strong>
                                <small class="puzzle-item-description">${item.description}</small>
                            </span>
                        </button>
                    `).join("")}
                </div>

                <div class="puzzle-action" style="gap:10px;">
                    <button type="button" class="submit-puzzle-button reset-puzzle-button">
                        RESET
                    </button>
                    <button type="button" class="submit-puzzle-button" id="submit-puzzle" disabled>
                        SUBMIT SEQUENCE
                    </button>
                </div>

                <div class="puzzle-feedback">Select the steps in order.</div>
            </div>

            <div class="lab-footer">
                <div class="lab-status">
                    <span class="lab-status-icon">🔒</span>
                    <span>LAB LOCKED</span>
                </div>
            </div>
        </div>
    `;

    setupPuzzleEvents(items.length);
}

function setupPuzzleEvents(count) {
    const items = Array.from(document.querySelectorAll(".puzzle-item"));
    const submit = document.getElementById("submit-puzzle");
    const reset = document.querySelector(".reset-puzzle-button");
    const feedback = document.querySelector(".puzzle-feedback");
    const status = document.querySelector(".lab-status span:last-child");

    let order = [];
    let locked = false;

    function resetSelection() {
        order = [];
        locked = false;

        items.forEach(function (item) {
            item.classList.remove("selected", "wrong");
            item.disabled = false;
            item.querySelector(".puzzle-item-number").textContent = "·";
        });

        submit.disabled = true;
        feedback.textContent = "Select the steps in order.";
        feedback.classList.remove("wrong");
    }

    items.forEach(function (item) {
        item.addEventListener("click", function () {
            if (locked || item.classList.contains("selected")) return;

            order.push(Number(item.dataset.id));
            item.classList.add("selected");
            item.querySelector(".puzzle-item-number").textContent = order.length;

            submit.disabled = order.length !== count;
        });
    });

    reset.addEventListener("click", function () {
        if (!locked) resetSelection();
    });

    submit.addEventListener("click", function () {
        if (locked || order.length !== count || !gameState.gameStarted) return;

        const correct = order.every((value, i) => value === i + 1);
        locked = true;

        if (correct) {
            items.forEach(function (item) {
                item.classList.remove("selected");
                item.classList.add("correct");
                item.disabled = true;
            });

            submit.disabled = true;
            reset.disabled = true;

            gameState.correctAnswers++;

            feedback.textContent = "CORRECT! Laboratory unlocked.";
            feedback.classList.remove("wrong");
            feedback.classList.add("correct");
            status.textContent = "LAB UNLOCKED";

            completeRoom();
        } else {
            penalize(CONFIG.penalty.puzzle);

            items.forEach(item => item.classList.add("wrong"));

            feedback.textContent = "INCORRECT SEQUENCE. Try again.";
            feedback.classList.remove("correct");
            feedback.classList.add("wrong");

            later(resetSelection, 700);
        }
    });
}


// =========================================
// ROOM 3 — MAZE (digenerate acak tiap game)
// =========================================
function generateMaze(size) {
    const grid = Array.from({ length: size }, () => Array(size).fill(1));
    const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    const stack = [[1, 1]];

    grid[1][1] = 0;

    while (stack.length) {
        const [r, c] = stack[stack.length - 1];

        const options = shuffle(dirs)
            .map(([dr, dc]) => [r + dr, c + dc, dr, dc])
            .filter(([nr, nc]) =>
                nr > 0 && nc > 0 && nr < size - 1 && nc < size - 1 &&
                grid[nr][nc] === 1
            );

        if (!options.length) {
            stack.pop();
            continue;
        }

        const [nr, nc, dr, dc] = options[0];
        grid[r + dr / 2][c + dc / 2] = 0;
        grid[nr][nc] = 0;
        stack.push([nr, nc]);
    }

    return grid;
}

function loadMazeRoom() {
    mazeMap = generateMaze(CONFIG.mazeSize);

    mazeState.playerRow = 1;
    mazeState.playerCol = 1;
    mazeState.exitRow = CONFIG.mazeSize - 2;
    mazeState.exitCol = CONFIG.mazeSize - 2;
    mazeState.completed = false;

    roomContainer.innerHTML = `
        <div class="maze-room">
            <div class="maze-kicker">LIBRARY CHALLENGE</div>

            <div class="maze-card">
                <div class="maze-header">
                    <div class="maze-title-group">
                        <div class="maze-number">MAZE_03</div>
                        <h2 class="maze-title">Find the Exit</h2>
                        <p class="maze-description">
                            Navigate through the library and reach the exit.
                        </p>
                    </div>
                </div>

                <div class="maze-objective">
                    <span class="maze-objective-icon">◎</span>
                    <span>Reach the exit without hitting walls.</span>
                </div>

                <div class="maze-board" id="maze-board" tabindex="0"></div>

                <div class="maze-legend">
                    <div class="legend-item"><span class="legend-marker player"></span>Player</div>
                    <div class="legend-item"><span class="legend-marker wall"></span>Wall</div>
                    <div class="legend-item"><span class="legend-marker exit"></span>Exit</div>
                </div>

                <div class="maze-controls">
                    <span>MOVE</span>
                    <span class="control-key">W</span>
                    <span class="control-key">A</span>
                    <span class="control-key">S</span>
                    <span class="control-key">D</span>
                    <span>OR ARROW KEYS</span>
                </div>

                <div class="maze-feedback">Find the exit.</div>
            </div>

            <div class="maze-footer">
                <div class="maze-status">
                    <span class="maze-status-icon">🔒</span>
                    <span>EXIT LOCKED</span>
                </div>
            </div>
        </div>
    `;

    renderMaze();
}

function renderMaze() {
    const board = document.getElementById("maze-board");
    if (!board) return;

    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${mazeMap[0].length}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${mazeMap.length}, 1fr)`;

    mazeMap.forEach(function (row, rowIndex) {
        row.forEach(function (cell, colIndex) {
            const el = document.createElement("div");
            el.classList.add("maze-cell", cell === 1 ? "wall" : "path");

            if (rowIndex === 1 && colIndex === 1) {
                el.classList.add("start");
            }

            if (rowIndex === mazeState.playerRow && colIndex === mazeState.playerCol) {
                const player = document.createElement("div");
                player.classList.add("maze-player");
                el.appendChild(player);
            }

            if (rowIndex === mazeState.exitRow && colIndex === mazeState.exitCol) {
                el.classList.add("exit");
                const exit = document.createElement("div");
                exit.classList.add("maze-exit-marker");
                el.appendChild(exit);
            }

            board.appendChild(el);
        });
    });
}

function moveMazePlayer(dRow, dCol) {
    if (
        !gameState.gameStarted ||
        gameState.currentRoom !== 3 ||
        mazeState.completed
    ) {
        return;
    }

    const newRow = mazeState.playerRow + dRow;
    const newCol = mazeState.playerCol + dCol;
    const feedback = document.querySelector(".maze-feedback");

    if (
        newRow < 0 || newRow >= mazeMap.length ||
        newCol < 0 || newCol >= mazeMap[0].length ||
        mazeMap[newRow][newCol] === 1
    ) {
        if (feedback) feedback.textContent = "Blocked by a wall.";
        return;
    }

    mazeState.playerRow = newRow;
    mazeState.playerCol = newCol;

    renderMaze();

    if (feedback) feedback.textContent = "Keep going. Find the exit.";

    if (newRow === mazeState.exitRow && newCol === mazeState.exitCol) {
        completeMaze();
    }
}

let mazeControlsInitialized = false;

function setupMazeControls() {
    if (mazeControlsInitialized) return;
    document.addEventListener("keydown", handleMazeKey);
    mazeControlsInitialized = true;
}

function handleMazeKey(event) {
    if (
        !gameState.gameStarted ||
        gameState.currentRoom !== 3 ||
        mazeState.completed
    ) {
        return;
    }

    const moves = {
        arrowup: [-1, 0], w: [-1, 0],
        arrowdown: [1, 0], s: [1, 0],
        arrowleft: [0, -1], a: [0, -1],
        arrowright: [0, 1], d: [0, 1],
    };

    const move = moves[event.key.toLowerCase()];
    if (!move) return;

    event.preventDefault();
    moveMazePlayer(move[0], move[1]);
}

function completeMaze() {
    if (mazeState.completed) return;
    mazeState.completed = true;

    gameState.correctAnswers++;

    const feedback = document.querySelector(".maze-feedback");
    const status = document.querySelector(".maze-status span:last-child");
    const card = document.querySelector(".maze-card");

    if (feedback) {
        feedback.textContent = "EXIT FOUND! Library unlocked.";
        feedback.classList.add("correct");
    }
    if (status) status.textContent = "EXIT UNLOCKED";
    if (card) card.classList.add("completed");

    completeRoom();
}


// =========================================
// ROOM 4 — CODE CHALLENGE
// =========================================
function loadCodeRoom() {
    const picked = shuffle(CODE_BANK)
        .slice(0, CONFIG.codeQuestions)
        .map(q => ({ ...q, answers: buildAnswers(q.output, q.wrong) }));

    gameState.codeChallenge = { questions: picked, index: 0 };
    renderCodeQuestion();
}

function renderCodeQuestion() {
    const challenge = gameState.codeChallenge;
    const question = challenge.questions[challenge.index];

    roomContainer.innerHTML = `
        <div class="code-room">
            <div class="code-kicker">COMPUTER LAB CHALLENGE</div>

            <div class="terminal-card">
                <div class="terminal-bar">
                    <div class="terminal-dots">
                        <span class="terminal-dot"></span>
                        <span class="terminal-dot"></span>
                        <span class="terminal-dot active"></span>
                    </div>
                    <div class="terminal-title">academic_terminal.js</div>
                    <div class="terminal-status">ONLINE</div>
                </div>

                <div class="terminal-body">
                    <div class="code-question">
                        <div class="code-question-number">CODE_0${challenge.index + 1}</div>
                        <h2 class="code-question-title">
                            What is the output of the following JavaScript code?
                        </h2>
                        <p class="code-question-description">
                            Question ${challenge.index + 1} of ${challenge.questions.length}
                        </p>
                    </div>

                    <div class="code-block">
                        ${question.code.map((line, i) => `
                            <div class="code-line">
                                <span class="code-line-number">${pad2(i + 1)}</span>
                                <span class="code-content">${highlightCode(line)}</span>
                            </div>
                        `).join("")}
                    </div>

                    <div class="code-output">
                        <div class="code-output-label">TERMINAL OUTPUT</div>
                        <div class="code-output-value">?</div>
                    </div>

                    <div class="code-answers">
                        ${question.answers.map(answer => `
                            <button type="button" class="code-answer"
                                    data-correct="${answer.correct}">
                                <span class="code-answer-key">${answer.label}</span>
                                <span>${answer.text}</span>
                            </button>
                        `).join("")}
                    </div>

                    <div class="code-feedback">Select the correct output.</div>
                </div>

                <div class="terminal-footer">
                    <div class="terminal-command">&gt; RUN PROGRAM</div>
                    <div class="terminal-lock">
                        <span>🔒</span>
                        <span>SYSTEM LOCKED</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    const buttons = document.querySelectorAll(".code-answer");

    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            handleCodeAnswer(button, buttons);
        });
    });
}

function handleCodeAnswer(button, buttons) {
    if (button.disabled || !gameState.gameStarted) return;

    const feedback = document.querySelector(".code-feedback");
    const lock = document.querySelector(".terminal-lock");
    const output = document.querySelector(".code-output-value");
    const challenge = gameState.codeChallenge;

    if (button.dataset.correct === "true") {
        buttons.forEach(b => (b.disabled = true));
        button.classList.add("correct");

        gameState.correctAnswers++;
        challenge.index++;

        if (output) output.textContent = button.querySelector("span:last-child").textContent;

        feedback.classList.remove("wrong");
        feedback.classList.add("correct");

        if (challenge.index < challenge.questions.length) {
            feedback.textContent = "CORRECT! Loading next program...";
            later(renderCodeQuestion, 900);
        } else {
            feedback.textContent = "CORRECT! Computer system unlocked.";
            lock.innerHTML = `<span>🔓</span><span>SYSTEM UNLOCKED</span>`;
            lock.classList.add("correct");
            completeRoom();
        }
    } else {
        button.classList.add("wrong");
        button.disabled = true;

        penalize(CONFIG.penalty.code);

        feedback.textContent = "INCORRECT OUTPUT. Try again.";
        feedback.classList.remove("correct");
        feedback.classList.add("wrong");
    }
}


// =========================================
// ROOM 5 — FINAL ESCAPE
// =========================================
function loadFinalRoom() {
    gameState.finalInput = [];
    gameState.finalLocked = false;

    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "enter"];

    roomContainer.innerHTML = `
        <div class="final-room">
            <div class="final-kicker">FINAL CHALLENGE</div>

            <div class="final-card">
                <div class="final-lock">
                    <div class="final-lock-icon">🔐</div>
                </div>

                <h2 class="final-title">ESCAPE TERMINAL</h2>

                <p class="final-description">
                    Enter the 4-digit escape code recovered from the previous rooms,
                    in the order you found them.
                </p>

                <div class="escape-code-display">
                    ${[0, 1, 2, 3].map(i => `<span class="code-digit" data-index="${i}">_</span>`).join("")}
                </div>

                <div class="escape-keypad">
                    ${keys.map(key => `
                        <button type="button"
                                class="keypad-button ${key === "clear" ? "clear" : key === "enter" ? "enter" : "number"}"
                                data-key="${key}">
                            ${key === "clear" ? "CLR" : key === "enter" ? "ENTER" : key}
                        </button>
                    `).join("")}
                </div>

                <div class="escape-status">Enter the escape code.</div>
                <div class="escape-hint">4 DIGITS REQUIRED</div>
            </div>

            <div class="final-footer">
                <div class="final-status">
                    <span class="final-status-icon">🔒</span>
                    <span>EXIT LOCKED</span>
                </div>
            </div>
        </div>
    `;

    document.querySelectorAll(".keypad-button").forEach(function (button) {
        button.addEventListener("click", function () {
            pressFinalKey(button.dataset.key);
        });
    });
}

function pressFinalKey(key) {
    if (
        !gameState.gameStarted ||
        gameState.gameFinished ||
        gameState.currentRoom !== 5 ||
        gameState.finalLocked
    ) {
        return;
    }

    const input = gameState.finalInput;

    if (/^[0-9]$/.test(key)) {
        if (input.length < 4) input.push(key);
        if (input.length === 1) resetFinalStatus();
    } else if (key === "clear") {
        gameState.finalInput = [];
        resetFinalStatus();
    } else if (key === "backspace") {
        input.pop();
    } else if (key === "enter") {
        checkFinalCode();
        return;
    }

    updateFinalCodeDisplay();
}

// satu listener global saja (tidak menumpuk saat restart)
document.addEventListener("keydown", function (event) {
    if (!gameState.gameStarted || gameState.currentRoom !== 5) return;

    let key = null;

    if (/^[0-9]$/.test(event.key)) key = event.key;
    else if (event.key === "Enter") key = "enter";
    else if (event.key === "Backspace") key = "backspace";

    if (key === null) return;

    event.preventDefault();
    pressFinalKey(key);
});

function updateFinalCodeDisplay() {
    document.querySelectorAll(".code-digit").forEach(function (digit, index) {
        const value = gameState.finalInput[index];

        if (value !== undefined) {
            digit.textContent = value;
            digit.classList.add("filled");
        } else {
            digit.textContent = "_";
            digit.classList.remove("filled");
        }
    });
}

function resetFinalStatus() {
    const status = document.querySelector(".escape-status");
    if (!status) return;

    status.textContent = "Enter the escape code.";
    status.classList.remove("wrong", "correct");
}

function checkFinalCode() {
    const status = document.querySelector(".escape-status");
    const digits = document.querySelectorAll(".code-digit");

    if (gameState.finalInput.length !== 4) {
        if (status) {
            status.textContent = "ENTER ALL 4 DIGITS.";
            status.classList.remove("correct");
            status.classList.add("wrong");
        }
        return;
    }

    const entered = gameState.finalInput.join("");
    const correct = gameState.secretCode.join("");

    if (entered === correct) {
        digits.forEach(d => {
            d.classList.remove("wrong");
            d.classList.add("correct");
        });

        if (status) {
            status.textContent = "ACCESS GRANTED. ESCAPE UNLOCKED.";
            status.classList.remove("wrong");
            status.classList.add("correct");
        }

        const card = document.querySelector(".final-card");
        const finalStatus = document.querySelector(".final-status span:last-child");
        if (card) card.classList.add("unlocked");
        if (finalStatus) finalStatus.textContent = "EXIT UNLOCKED";

        // bonus akhir: makin banyak sisa waktu, makin besar
        gameState.score +=
            CONFIG.finalBonus + gameState.timeLeft * CONFIG.finalTimePoints;

        gameState.gameFinished = true;
        gameState.escaped = true;
        gameState.gameStarted = false;

        stopTimer();
        updateHUD();

        const run = gameState.runId;
        setTimeout(function () {
            if (run === gameState.runId) showResultScreen();
        }, 1000);
    } else {
        gameState.finalLocked = true;

        digits.forEach(d => {
            d.classList.remove("correct");
            d.classList.add("wrong");
        });

        if (status) {
            status.textContent = "ACCESS DENIED. WRONG CODE.";
            status.classList.remove("correct");
            status.classList.add("wrong");
        }

        penalize(CONFIG.penalty.final);

        later(function () {
            gameState.finalInput = [];
            gameState.finalLocked = false;
            digits.forEach(d => d.classList.remove("wrong"));
            updateFinalCodeDisplay();
        }, 700);
    }
}


// =========================================
// RESULT SCREEN
// =========================================
function showResultScreen() {
    stopTimer();

    gameScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    const elapsed = gameState.timeLimit - gameState.timeLeft;
    const attempts = gameState.correctAnswers + gameState.wrongAnswers;

    const finalScore = document.getElementById("final-score");
    const finalTime = document.getElementById("final-time");
    const finalCorrect = document.getElementById("final-correct");

    if (finalScore) finalScore.textContent = gameState.score;

    if (finalTime) {
        finalTime.textContent =
            `${pad2(Math.floor(elapsed / 60))}:${pad2(elapsed % 60)}`;
    }

    // akurasi: jawaban benar / total percobaan
    if (finalCorrect) {
        finalCorrect.textContent = `${gameState.correctAnswers}/${attempts}`;
    }
}


// =========================================
// BUTTON EVENTS
// =========================================
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
tryAgainButton.addEventListener("click", startGame);

document.addEventListener("keydown", function (event) {
    if (
        event.key === "Enter" &&
        !gameState.gameStarted &&
        !gameState.gameFinished
    ) {
        startGame();
    }
});


// =========================================
// INITIALIZE
// =========================================
updateTimerDisplay();
setupMazeControls();