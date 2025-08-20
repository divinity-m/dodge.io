// DODGE.IO - SCRIPT.JS
console.log("canvas Y offset")
const cnv = document.getElementById("game");
const ctx = cnv.getContext('2d');

// game units
const GAME_WIDTH = 800;
const GAME_HEIGHT = 650;
const offsetX = (cnv.width - GAME_WIDTH) / 2;
const offsetY = (cnv.height - GAME_HEIGHT) / 2 + 100;

function resizeCursorCanvas() {
  cnv.width = window.innerWidth;
  cnv.height = window.innerHeight;
}
window.addEventListener("resize", resizeCursorCanvas);
resizeCursorCanvas();

let gameState = "loading";
let innerGameState = "loading";

// Keyboard
let lastPressing = "mouse";
document.addEventListener("keydown", recordKeyDown)
document.addEventListener("keyup", recordKeyUp)
let keyboardMovementOn = false;
let wPressed = false;
let aPressed = false;
let sPressed = false;
let dPressed = false;
let shiftPressed = 1;

// Mouse
let mouseDown = false;
let allClicks = [];
let mouseMovementOn = false;
let previousMM = false;
document.addEventListener("mousedown", () => {mouseDown = true});
document.addEventListener("mouseup", () => {mouseDown = false});
document.addEventListener("touchstart", () => {mouseDown = true; recordLeftClick();});
document.addEventListener("touchend", () => {mouseDown = false});
document.addEventListener("touchcancel", () => {mouseDown = false});

document.addEventListener("click", () => {
    allClicks.push(createClick("left"));
    recordLeftClick();
});
document.addEventListener("contextmenu", (event) => {
    allClicks.push(createClick("right"));
    event.preventDefault();
    recordRightClick(event);
});
document.addEventListener("auxclick", (event) => {
    if (event.button === 1) {
        allClicks.push(createClick("middle"));
        event.preventDefault();
        recordMiddleClick(event);
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
    aZ_AvSlider: false,
    customCursorBtn: false,
    cursorTrailSlider: false,
};

let mouseX;
let mouseY;
let track = false;
let cursorX;
let cursorY;
let allCursors = [];
let lastCursorTrail = 0;
let trailDensity = 0;
window.addEventListener('mousemove', (event) => {
    const rect = cnv.getBoundingClientRect();
    const screenX = event.clientX;
    const screenY = event.clientY;
    if (track) console.log(`x: ${mouseX.toFixed()} || y: ${mouseY.toFixed()}`);

    // cursor trails
    cursorX = screenX;
    cursorY = screenY;

    // offset mouse
    mouseX = screenX - offsetX;
    mouseY = screenY - offsetY;
});

// Player & Enemies
let player = {
    x: GAME_WIDTH/2,
    y: GAME_HEIGHT/2,
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

let settings = {
    enemyOutlines: true,
    disableMM: false,
    musicSliderX: 640,
    sfxSliderX: 627,
    aZ_Range: true,
    aZ_Av: 650,
    customCursor: true,
    cursorTrail: 715,
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
    av: 0.5,
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
    reset: function () {
        this.lastEnded = 0;
        this.activated = false;
        this.radius = 25;
    }
};

let amplify = {
    baseSpeed: 2.5,
    speed: 0,
    accel: 0,
    limit: 8,
    accelRate: Date.now(),
    reset: function () {
        player.baseSpeed = 2.5;
        this.speed = 0;
        this.accel = 0;
        this.accelRate = Date.now();
    },
}

let allEnemies = [];
let allDangers = [];

// Time, Highscore, and Difficulty
let now = Date.now();
let clickEventSave = 0;

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
let musicVolume = 0;
let sfxVolume = 0;

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
            if (userData?.player?.[attribute] !== undefined) p[attribute] = userData.player[attribute];
        })
        let hs = {easy: 0, medium: 0, hard: 0, limbo: 0, andromeda: 0, euphoria: 0};
        ["easy", "medium", "hard", "limbo", "andromeda", "euphoria"].forEach(score => {
            if (userData?.highscore?.[score] !== undefined) hs[score] = userData.highscore[score];
        })
        let s = {enemyOutlines: true, disableMM: false, musicSliderX: 640, sfxSliderX: 627, aZ_Range: true, aZ_Av: 650, customCursor: true, cursorTrail: 715};
        ["enemyOutlines", "disableMM", "musicSliderX", "sfxSliderX", "aZ_Range", "aZ_Av", "customCursor", "cursorTrail"].forEach(setting => {
            if (userData?.settings?.[setting] !== undefined) s[setting] = userData.settings[setting];
        })
                
        userData = {player: {x: GAME_WIDTH/2, y: GAME_HEIGHT/2, r: 15, speed: 2.5, baseSpeed: 2.5, slowed: 1, dodger: p.dodger,
                                color: p.color, subColor: p.subColor, facingAngle: 0, invincible: p.invincible},
                    highscore: {easy: hs.easy, medium: hs.medium, hard: hs.hard,
                                limbo: hs.limbo, andromeda: hs.andromeda, euphoria: hs.euphoria},
                    settings: {enemyOutlines: s.enemyOutlines, disableMM: s.disableMM, musicSliderX: s.musicSliderX, sfxSliderX: s.sfxSliderX,
                              aZ_Range: s.aZ_Range, aZ_Av: s.aZ_Av, customCursor: s.customCursor, cursorTrail: s.cursorTrail}};
        // updates the current data to the locally saved data
        player = userData.player;
        highscore = userData.highscore;
        settings = userData.settings;
        musicVolume = Math.max(Math.min((settings.musicSliderX - 565) / (715 - 565), 1), 0);
        sfxVolume = Math.max(Math.min((settings.sfxSliderX - 552) / (702 - 552), 1), 0);
        absoluteZero.av = Math.max(Math.min((settings.aZ_Av - 555) / (705 - 555), 1), 0)
        trailDensity = Math.max(Math.min((settings.cursorTrail - 550) / (700 - 550), 1), 0);
        music.var.volume = musicVolume;
        sharpPop.volume = sfxVolume;
    }
}

if (resetLocalData || !localData){
    // creates a new userData for new users
    userData = { player: player, highscore: highscore, settings: settings, };
    
    // saves the new user data to local storage
    localStorage.setItem('localUserData', JSON.stringify(userData));
}

// saves the game if the website is closed
window.addEventListener('beforeunload', () => {
    if (gameState !== "loading") { // only save user data if they're not on the loading screen
        userData = { player: player, highscore: highscore, settings: settings, };
        localStorage.setItem('localUserData', JSON.stringify(userData));
    }
})

// Drawing the game
function draw() {
    now = Date.now()
    ctx.clearRect(0, 0, cnv.width, cnv.height); // resets the canvas so previous drawings dont stay

    ctx.save();
    ctx.translate(offsetX, offsetY); // translate to the offset
  
    ctx.fillStyle = "rgb(185, 185, 185)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    detectHover(); // checks if the mouse is hovering over a button

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
        ctx.fillText(options[LI], GAME_WIDTH/2, GAME_HEIGHT/2);

        ctx.font = "30px 'Verdana'";
        ctx.fillText(`${now - loadingGame}/5000`, GAME_WIDTH/2, GAME_HEIGHT/2 + 50);

        if (now - loadingGame >= 1000) {
            ctx.font = "20px 'Verdana'";
            ctx.textAlign = "left";
            ctx.fillText("click anywhere to skip", 20, GAME_HEIGHT - 20);
        }
        
        music = {var: aNewStart, name: "A New Start", artist: "Thygan Buch"};
        music.var.currentTime = 0;
    }
    else if (now - loadingGame > 5000 && !endLoading) {
        ctx.fillStyle = "rgb(87, 87, 87)";
        ctx.font = "40px Verdana";
        ctx.textAlign = "center";
        ctx.fillText("Dodge.io", GAME_WIDTH/2, GAME_HEIGHT/2);

        ctx.font = "20px Verdana";
        ctx.textAlign = "left";
        ctx.fillText("click anywhere to start", 20, GAME_HEIGHT - 20);
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
        abilities();
    }
    else if (gameState === "musicMode") {
        drawEndLevel();
        spawnAndDrawDanger();
        drawText();
        drawPlayer();
        
        keyboardControls();
        mouseMovement();

        abilities();
        musicCollisions();
    }
  
    ctx.restore(); // reverse the offset

  
    // CURSOR STUFF
    function drawCursorCircle(x, y, r, type) {
        ctx.beginPath();
        ctx.arc(x, y, r, Math.PI * 2, 0);
        if (type === "fill") ctx.fill();
        if (type === "stroke") ctx.stroke();
    }
  
    let playerColor = player.color.slice(4, player.color.length-1);
    let playerSubColor = player.subColor.slice(4, player.subColor.length-1);

    allCursors = allCursors.filter(c => c.av > 0 && trailDensity > 0); // removes trails with low av's
    allClicks = allClicks.filter(c => c.av > 0); // removes clicks with low av's
  
    // Makes default cursor invisible
    if (settings.customCursor) document.documentElement.classList.add("no-cursor");
    else { document.documentElement.classList.remove("no-cursor"); allCursors = []; }
  
    // Cursor & Cursor Trail
    if (settings?.customCursor && cursorX !== undefined && cursorY !== undefined) {
        if (trailDensity > 0) {
            const pNow = performance.now();
            if (pNow - lastCursorTrail > 16) { // ~60fps cap
                allCursors.push(createCursor());
                if (allCursors.length > 40) allCursors.shift(); // drop oldest
                lastCursorTrail = pNow;
            }
        }
      
        allCursors.forEach(cursor => {
            ctx.fillStyle = cursor.color;
            drawCursorCircle(cursor.x, cursor.y, cursor.r, "fill");
            
            cursor.r -= cursor.subR;
            cursor.av -= cursor.subAv;
        })

        let hovering = false;
        // Canvas Buttons
        Object.keys(mouseOver).forEach(hover => {
          if (mouseOver[hover]) hovering = true;
        })
        // Document Hyperlinks
        let hyperlinks = document.getElementsByTagName('a');
        for (let i = 0; i < hyperlinks.length; i++) {
          if (hyperlinks[i].matches(":hover")) hovering = true;
        }
        // hoving inverts cursor colors, clicking reduces alpha value
        if (hovering) {
            if (mouseDown) ctx.fillStyle = `rgba(${playerSubColor}, 0.75)`;
            else ctx.fillStyle = player.subColor;
            ctx.strokeStyle = player.color;
        } else {
            if (mouseDown) ctx.fillStyle = `rgba(${playerColor}, 0.75)`;
            else ctx.fillStyle = player.color;
            ctx.strokeStyle = player.subColor;
        }
        ctx.lineWidth = 3;
        if (lastPressing === "mouse") {
          drawCursorCircle(cursorX, cursorY, 7.5, "fill");
          drawCursorCircle(cursorX, cursorY, 7.5, "stroke");
        }
    }
  
    // Click Animation
    allClicks.forEach(click => {
        if (click.button === "left" || click.button === "middle") ctx.strokeStyle = click.colorLeft;
        if (click.button === "right") ctx.strokeStyle = click.colorRight;
      
        ctx.lineWidth = 2.5;
        drawCursorCircle(click.x, click.y, click.r, "stroke");
        if (click.button === "middle") {
            ctx.strokeStyle = click.colorRight;
            if (click.r-2.5 > 0) drawCursorCircle(click.x, click.y, click.r-2.5, "stroke");
        }

        click.r += click.addR;
        click.av -= click.subAv;
    })

    requestAnimationFrame(draw);
}

draw();
