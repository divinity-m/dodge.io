console.log("Date.now()")// DODGE.IO - SCRIPT.JS
const cnv = document.getElementById("canvas");
const ctx = cnv.getContext('2d');

let gameState = "loading";
let innerGameState = "loading";
// Keyboard
let lastPressing = "kb";
document.addEventListener("keydown", recordKeyDown)
document.addEventListener("keyup", recordKeyUp)
let keyboardMovementOn = false;
let wPressed = false;
let aPressed = false;
let sPressed = false;
let dPressed = false;
let shiftPressed = 1;

// Mouse
let mouseDown;
let mouseMovementOn = false;
let previousMM = false;
document.addEventListener("mousedown", () => {mouseDown = true});
document.addEventListener("mouseup", () => {mouseDown = false});
document.addEventListener("touchstart", () => {mouseDown = true; recordLeftClick();});
document.addEventListener("touchend", () => {mouseDown = false});
document.addEventListener("touchcancel", () => {mouseDown = false});

document.addEventListener("click", recordLeftClick);
document.addEventListener("contextmenu", recordRightClick);
document.addEventListener("auxclick", (event) => {
    if (event.button === 1) {
        recordMiddleClick();
    }
});
let mouseOver = {
    play: false,
    settings: false,
    selector: false,
    restart: false,

    evader: false,
    j_sab: false,
    jötunn: false,
    jolt: false,
    crescendo: false,

    easy: false,
    medium: false,
    hard: false,
    limbo: false,
    andromeda: false,
    euphoria: false,

    enemyOutBtn: false,
    disableMMBtn: false,
    musicSlider: false,
    sfxSlider: false,
    aZ_RangeBtn: false,
    disableCursorBtn: false,
};

let mouseX;
let mouseY;
let track = false;
window.addEventListener('mousemove', (event) => {
    const rect = cnv.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    if (track) console.log(`x: ${mouseX.toFixed()} || y: ${mouseY.toFixed()}`);
});

// Player & Enemies
let player = {
    x: cnv.width/2,
    y: cnv.height/2,
    r: 15,
    speed: 2.5,
    baseSpeed: 2.5,
    slowed: 1,
    dodger: "evader",
    color: "rgb(255, 255, 255)",
    subColor: "rgb(230, 230, 230)",
    facingAngle: 0,
    invincible: false,
};

let dash = {
    usable: true,
    activated: false,
    deccelerating: false,
    speed: 0.5,
    lastEnded: 0,
};

let absoluteZero = {
    usable: true,
    passive: "Absolute Zero",
    slowStart: 273.15,
    slowEnd: 75,
    lastEnded: 0,
}

let shockwave = {
    usable: true,
    active: "Shockwave",
    used: "Shockwave",
    activated: false,
    radius: 25,
    path: new Path2D(),
    lastEnded: 0,
    cd: 7000,
    effect: 0.75,
};

let amplify = {
    baseSpeed: 2.5,
    speed: 0,
    accel: 0,
    limit: 10,
    accelRate: 0,
    reset: function () {
        this.speed = 0;
        this.accel = 0;
        this.accelRate = Date.now();
    },
}

let settings = {
    enemyOutlines: true,
    disableMM: false,
    musicSliderX: 240,
    sfxSliderX: 240,
    aZ_Range: true,
    disableCursor: false,
};

let allEnemies = [];
let allDangers = [];
let allCursors = [];

// Time, Highscore, and Difficulty
let now = Date.now();

let loadingGame = Date.now();
let loadingTextChange = Date.now();
let LI = 0; // loading index
let endLoading = false;

let startTime = Date.now();
let currentTime = ((now-startTime) / 1000).toFixed(2);
let timeLeft;

let enemySpawnPeriod = 3000;
let lastSpawn = Date.now();

let highscoreColor = "rgb(87, 87, 87)";
let highscore = {
    easy: 0,
    medium: 0,
    hard: 0,
    limbo: 0,
    andromeda: 0,
    euphoria: 0,
};
let difficulty = {
    level: "easy",
    color: "rgb(0, 225, 255)",
};

// Music
let musicVolume = 50;
let sfxVolume = 50;

let alarm9 = document.createElement("audio");
alarm9.src = "Audio/Alarm 9 - Blue Cxve.mp3";
alarm9.preload = "metadata";

let music = {
    var: alarm9,
    name: "Alarm 9",
    artist: "Blue Cxve",
    color: "rgb(163, 0, 163)",
    subColor: "rgb(173, 0, 173)",
    timestamps: [],
    promise: "alarm9.play()",
}

let aNewStart = document.createElement("audio");
aNewStart.src = "Audio/A New Start - Thygan Buch.mp3";
aNewStart.preload = "metadata";

let interstellar = document.createElement("audio");
interstellar.src = "Audio/interstellar - pandora., chillwithme, & cødy.mp3";
interstellar.preload = "metadata";

let astralProjection = document.createElement("audio");
astralProjection.src = "Audio/Astral Projection - Hallmore.mp3";
astralProjection.preload = "metadata";

let divine = document.createElement("audio");
divine.src = "Audio/Divine - SOTAREKO.mp3";
divine.preload = "metadata";

let sharpPop = document.createElement("audio");
sharpPop.src = "Audio/sharp-pop.mp3";
sharpPop.preload = "metadata";

// User Data
let lastSave = 0; // tracks how often data is saved (during gameplay)
const localData = localStorage.getItem('localUserData'); // load savedData (if it exists)
let userData;
let resetLocalData = false;

if (localData) {
    // retrieves the users local data and watches for corrupted data
    try {
        userData = JSON.parse(localData);       
    } catch (exception) {
        console.warn('Local user data was invalid, resetting.', exception);
        localStorage.removeItem('localUserData');
        resetLocalData = true;
    }

    if (!resetLocalData) {
        // checks to see if the userData is missing any elements and replaces it with default data
        ["player", "highscore", "settings"].forEach(data => {
            if (!(data in userData)) userData[data] = eval(data);
        });
        
        let p = {dodger: "evader", color: "rgb(255, 255, 255)", subColor: "rgb(230, 230, 230)", invincible: false};
        ["dodger", "color", "subColor", "invincible"].forEach(attribute => {
            if (userData?.player?.[attribute]) p[attribute] = userData.player[attribute];
        })
        let hs = {easy: 0, medium: 0, hard: 0, limbo: 0, andromeda: 0, euphoria: 0};
        ["easy", "medium", "hard", "limbo", "andromeda", "euphoria"].forEach(score => {
            if (userData?.highscore?.[score]) hs[score] = userData.highscore[score];
        })
        let s = {enemyOutlines: true, disableMM: false, musicSliderX: 240, sfxSliderX: 240, aZ_Range: true, disableCursor: false,};
        ["enemyOutlines", "disableMM", "musicSliderX", "sfxSliderX", "aZ_Range"].forEach(setting => {
            if (userData?.settings?.[setting]) s[setting] = userData.settings[setting];
        })
                
        userData = {player: {x: cnv.width/2, y: cnv.height/2, r: 15, speed: 2.5, baseSpeed: 2.5, slowed: 1, dodger: p.dodger,
                                color: p.color, subColor: p.subColor, facingAngle: 0, invincible: p.invincible},
                    highscore: {easy: hs.easy, medium: hs.medium, hard: hs.hard,
                                limbo: hs.limbo, andromeda: hs.andromeda, euphoria: hs.euphoria},
                    settings: {enemyOutlines: s.enemyOutlines, disableMM: s.disableMM, musicSliderX: s.musicSliderX,
                               sfxSliderX: s.sfxSliderX, aZ_Range: s.aZ_Range, disableCursor: s.disableCursor}};
        // updates the current data to the locally saved data
        player = userData.player;
        highscore = userData.highscore;
        settings = userData.settings;
    }
}

if (resetLocalData || !localData){
    // creates a new userData for new users
    userData = { player: player, highscore: highscore, settings: settings, };
    
    // saves the new user data to local storage
    localStorage.setItem('localUserData', JSON.stringify(userData));
}

// Crash data to track when the user leaves/crashes
const localCrashData = localStorage.getItem('localCrashData');
let crashData;
let resetCrashData = false;

if (localCrashData) {
    try { crashData = JSON.parse(localCrashData); }
    catch (exception) {
        console.warn('Crash data was invalid, resetting.', exception);
        localStorage.removeItem('localCrashData');
        resetCrashData = true;
    }
}
if (!localCrashData || resetCrashData) {
    crashData = { leaveOnLoading: 0, leaveOnMenu: 0, leaveOnPlay: 0, leaveUnknown: 0, lastLeftOn: "", };
    localStorage.setItem('localCrashData', JSON.stringify(crashData));
}

// saves the game if the website is closed
window.addEventListener('beforeunload', () => {
    if (gameState !== "loading") { // only save user data if they're not on the loading screen
        userData = { player: player, highscore: highscore, settings: settings, };
        localStorage.setItem('localUserData', JSON.stringify(userData));
    }
    if (gameState === "loading") crashData.leaveOnLoading++;
    else if (gameState === "startScreen") crashData.leaveOnMenu++;
    else if (gameState === "endlessMode" || gameState === "endlessOver") crashData.leaveOnPlay++;
    else crashData.leaveUnknown++;
    crashData.lastLeftOn = gameState;
    localStorage.setItem('localCrashData', JSON.stringify(crashData));
})


// Drawing the game
requestAnimationFrame(draw)
function draw() {
    now = Date.now()
    ctx.fillStyle = "rgb(185, 185, 185)";
    ctx.fillRect(0, 0, cnv.width, cnv.height);

    // Loading Screen
    if (now - loadingGame <= 5000 && !endLoading) { // Takes 5 seconds to load the game safely
        options = ["Loading.", "Loading..", "Loading..."];
        if (now - loadingTextChange >= 1000) { // change the text every second
            loadingTextChange = Date.now();
            LI++;
            if (LI > 2) LI = 0;
        }
        
        ctx.fillStyle = "rgb(87, 87, 87)";
        ctx.font = "40px 'Verdana'";
        ctx.textAlign = "center";
        ctx.fillText(options[LI], cnv.width/2, cnv.height/2);

        ctx.font = "30px 'Verdana'";
        ctx.fillText(`${now - loadingGame}/5000`, cnv.width/2, cnv.height/2 + 50);

        if (now - loadingGame >= 1000) {
            ctx.font = "20px 'Verdana'";
            ctx.textAlign = "left";
            ctx.fillText("click anywhere on the screen to skip", 20, cnv.height - 20);
        }
        
        music = {var: aNewStart, name: "A New Start", artist: "Thygan Buch"};
        music.var.currentTime = 0;
    }
    else if (now - loadingGame > 5000 && !endLoading) {
        ctx.fillStyle = "rgb(87, 87, 87)";
        ctx.font = "40px Verdana";
        ctx.textAlign = "center";
        ctx.fillText("Dodge.io", cnv.width/2, cnv.height/2);

        ctx.font = "20px Verdana";
        ctx.textAlign = "left";
        ctx.fillText("click anywhere on the screen to start", 20, cnv.height - 20);
    }
    else if (endLoading && gameState === "loading") {
        music.promise = music.var.play();
        gameState = "startScreen";
        innerGameState = "mainMenu";
    }

    // Actual Game
    if (gameState === "startScreen") {
        loopAudio();
        abilities();
        drawText();
        drawStartScreen();
        
        if (innerGameState === "selectDifficulty") drawDifficultySelection();
        if (innerGameState === "selectDodger") drawDodgerSelection();
        drawPlayer();
        drawSettings();
        
        keyboardControls();
        mouseMovement();
    }
    else if (gameState === "endlessMode") {
        loopAudio();
        drawText();
        drawPlayer();
        drawEnemies();
        
        keyboardControls();
        mouseMovement();
            
        spawnEnemyPeriodically();
        moveEnemies();
        abilities();
        collisions();
    }
    else if (gameState === "endlessOver") {
        drawText();
        drawGameOver();
        drawPlayer();
        drawEnemies();
    }
    else if (gameState === "musicMode") {
        spawnAndDrawDanger();
        drawText();
        drawEndLevel();
        drawPlayer();
        
        keyboardControls();
        mouseMovement();

        abilities();
        musicCollisions();
    }
    requestAnimationFrame(draw)
}
draw()
