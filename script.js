console.log("accretionDisk3");

// DODGE.IO - SCRIPT.JS
const cnv = document.getElementById("game");
const ctx = cnv.getContext('2d');

// Game Units
let gameState = "loading", innerGameState = "loading", previousGameState = "loading";
cnv.width = 800, cnv.height = 650;
let GAME_WIDTH = 800, GAME_HEIGHT = 650;

// Screen Orientations
function isMobile() {
  const uaCheck = /Mobi|Android/i.test(navigator.userAgent);
  const sizeCheck = window.matchMedia("(max-width: 768px)").matches;
  return uaCheck || sizeCheck;
}

function resize() {
    if (isMobile()) {
        cnv.style.width = `350px`;
        // center the canvas on the screen for phones
        // cnv.style.position = "absolute";
        // cnv.style.left = `${(window.innerWidth - 400)/2}px`;
        // cnv.style.top = `${(window.innerHeight - 325)/2}px`;
    } else cnv.style.width = `${window.innerWidth * (GAME_WIDTH/1397)}px`;
}
window.addEventListener("resize", resize);
screen?.orientation.addEventListener("change", resize);
resize();

// Keyboard Events
let lastPressing = "mouse";
let keyboardMovementOn = false;
let wPressed = false;
let aPressed = false;
let sPressed = false;
let dPressed = false;
let shiftPressed = 1;
document.addEventListener("keydown", recordKeyDown);
document.addEventListener("keyup", recordKeyUp);

// Mouse Events
let mouseDown = false;
let allClicks = [];
let mouseMovementOn = false;
let previousMM = false;
document.addEventListener("mousedown", () => { if (!isMobile()) mouseDown = true; });
document.addEventListener("mouseup", () => { if (!isMobile()) mouseDown = false; });
document.addEventListener("click", () => {
    if (!isMobile()) { recordLeftClick(); allClicks.push(createClick("left")); }
});
document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (!isMobile()) { recordRightClick(event); allClicks.push(createClick("right")); }
});
document.addEventListener("auxclick", (event) => {
    if (event.button === 1) {
        event.preventDefault();
        if (!isMobile()) {  recordMiddleClick(event); allClicks.push(createClick("middle")); }
    }
});

// Touchscreen Events
document.addEventListener("touchend", () => { if (isMobile()) mouseDown = false; });
document.addEventListener("touchcancel", () => { if (isMobile()) mouseDown = false; });

// Input Tracking
let mouseOver = {
    play: false, settings: false, selector: false, restart: false, evades: false, jsab: false,
    
    evader: false, j_sab: false, jötunn: false, jolt: false, crescendo: false, quasar: false,
    
    easy: false, medium: false, hard: false, limbo: false, andromeda: false, euphoria: false,
    
    enemyOutBtn: false, disableMMBtn: false, musicSlider: false, sfxSlider: false,
    aZ_RangeBtn: false, aZ_AvSlider: false, customCursorBtn: false, cursorTrailSlider: false,
};

let mouseX, mouseY, cursorX, cursorY;
let track = false;
let allCursors = [];
let lastCursorTrail = 0;
let trailDensity = 0;

function updateCursor(eventObject) {
    // update cursor
    [cursorX, cursorY] = [eventObject.clientX, eventObject.clientY];

    // update mouse
    const rect = cnv.getBoundingClientRect();
  
    const scaleX = cnv.width / rect.width;
    const scaleY = cnv.height / rect.height;
  
    mouseX = (cursorX - rect.left) * scaleX;
    mouseY = (cursorY - rect.top) * scaleY;
}
function addCursorTrail() {
    if (cursorX !== undefined && cursorY !== undefined && settings.customCursor && trailDensity > 0) {
        // Trail Density
        const pNow = performance.now();
        if (pNow - lastCursorTrail > 16) { // ~60fps cap
            allCursors.push(createCursor());
            if (allCursors.length > 100) { // drop oldest
                allCursors[0].div.remove();
                allCursors.shift();
            }
            lastCursorTrail = pNow;
        }
    }
}
// cursor update event listeners
document.addEventListener('mousemove', (event) => {
    updateCursor(event);
    addCursorTrail();
    if (track) console.log(`x: ${mouseX.toFixed()} || y: ${mouseY.toFixed()}`);
});
document.addEventListener("touchmove", (event) => {
    updateCursor(event.touches[0]);
    mouseDown = true;
    addCursorTrail();
});
document.addEventListener("touchstart", (event) => {
    updateCursor(event.touches[0]);
    if (isMobile()) {recordLeftClick(); allClicks.push(createClick("left")); }
    if (track) console.log(`x: ${mouseX.toFixed()} || y: ${mouseY.toFixed()}`);
});

// Player & Enemies
let player = {
    x: GAME_WIDTH/2, y: GAME_HEIGHT/2, r: 15,
    speed: 5, baseSpeed: 5, slowed: 1,
    dodger: "evader", color: "rgb(255, 255, 255)", subColor: "rgb(230, 230, 230)",
    facingAngle: 0, invincible: false,
};

let settings = {
    enemyOutlines: true, disableMM: false,
    musicSliderX: 640, sfxSliderX: 627,
    aZ_Range: true, aZ_Av: 650,
    customCursor: true, cursorTrail: 715,
};

let dash = {
    usable: true, activated: false,
    deccelerating: false, accel: 1,
    lastEnded: 0,
};

let absoluteZero = {
    usable: true, av: 0.5,
    passive: "Absolute Zero",
    slowStart: 273.15, slowEnd: 75,
    lastEnded: 0,
};

let shockwave = {
    usable: true, active: "Shockwave", used: "Shockwave", activated: false,
    radius: 25, path: new Path2D(),
    lastEnded: 0, cd: 7000, effect: 0.75,
    reset: function () {
        this.lastEnded = 0;
        this.activated = false;
        this.radius = 25;
    }
};

let amplify = {
    baseSpeed: 5, speed: 0, accel: 0, limit: 10.5, accelRate: Date.now(),
    reset: function () {
        player.baseSpeed = 5;
        this.speed = 0;
        this.accel = 0;
        this.accelRate = Date.now();
    },
};

let eventHorizon = {
  usable: true, activated: false,
  av: 0, angle: 0, accretionDisk: [],
  lastUsed: 0, lastEnded: 0,
}

let allEnemies = [], allDangers = [];

// Time, Highscore, and Difficulty
let now = Date.now();
let clickEventSave = 0;

let loadingGame = Date.now(), loadingTextChange = Date.now();
let LI = 0; // loading index
let endLoading = false;

let startTime = Date.now(), currentTime = ((now-startTime) / 1000).toFixed(2), timeLeft;

let enemySpawnPeriod = 3000, lastSpawn = Date.now();

let highscoreColor = "rgb(87, 87, 87)";
let highscore = { easy: 0, medium: 0, hard: 0, limbo: 0, andromeda: 0, euphoria: 0, };
let difficulty = { level: "easy", color: "rgb(0, 225, 255)", };

// Music
let musicVolume = 0, sfxVolume = 0;

let alarm9 = document.getElementById("alarm9");
let music = {
    var: alarm9, name: "Alarm 9", artist: "Blue Cxve",
    color: "rgb(163, 0, 163)", subColor: "rgb(173, 0, 173)",
    timestamps: [], promise: "alarm9.play()",
}
let aNewStart = document.getElementById("a-new-start");
let interstellar = document.getElementById("interstellar");
let astralProjection = document.getElementById("astral-projection");
let divine = document.getElementById("divine");
let sharpPop = document.getElementById("sharp-pop");

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
                
        userData = {player: {x: GAME_WIDTH/2, y: GAME_HEIGHT/2, r: 15, speed: 5, baseSpeed: 5, slowed: 1, dodger: p.dodger,
                                color: p.color, subColor: p.subColor, facingAngle: 0, invincible: p.invincible},
                    highscore: {easy: hs.easy, medium: hs.medium, hard: hs.hard,
                                limbo: hs.limbo, andromeda: hs.andromeda, euphoria: hs.euphoria},
                    settings: {enemyOutlines: s.enemyOutlines, disableMM: s.disableMM, musicSliderX: s.musicSliderX, sfxSliderX: s.sfxSliderX,
                              aZ_Range: s.aZ_Range, aZ_Av: s.aZ_Av, customCursor: s.customCursor, cursorTrail: s.cursorTrail}};
        // updates the current data to the locally saved data
        player = userData.player;
        if (player.dodger === "j-sab") { player.color = "rgb(255, 0, 0)"; player.subColor = "rgb(230, 0, 0)"; }
        if (player.dodger === "quasar") { player.color = "rgb(255, 165, 0)"; player.subColor = "rgb(230, 153, 11)"; }
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
        // Dash and Blackhole causes bugs when the player leaves mid-usage
        userData = { player: player, highscore: highscore, settings: settings, };
        localStorage.setItem('localUserData', JSON.stringify(userData));
    }
})

// cool background stuff
let bgTopText, bgBottomText, bgTopX, bgBottomX, bgTopMax, bgBottomMax;
function resetBgVars() {
    const hyp = Math.hypot(GAME_WIDTH, GAME_HEIGHT);
    if (innerGameState === "mainMenu") {
        [bgTopText, bgBottomText] = ["DODGE.IO", "HIT PLAY"];
        [bgTopX, bgBottomX] = [-1000, GAME_WIDTH+1000];
        [bgTopMax, bgBottomMax] = [hyp*5/10, hyp*5/10];
    }
    if (innerGameState === "selectDifficulty") {
        [bgTopText, bgBottomText] = ["LEVEL", "SELECTION"];
        [bgTopX, bgBottomX] = [-625, GAME_WIDTH+1125];
        [bgTopMax, bgBottomMax] = [hyp*5/10, hyp*4.75/10];
    }
    if (innerGameState === "selectDodger") {
        [bgTopText, bgBottomText] = ["DODGER", "SELECTION"];
        [bgTopX, bgBottomX] = [-750, GAME_WIDTH+1125];
        [bgTopMax, bgBottomMax] = [hyp*5/10, hyp*4.75/10];
    }
    if (innerGameState === "settings") {
        [bgTopText, bgBottomText] = ["GAME", "SETTINGS"];
        [bgTopX, bgBottomX] = [-500, GAME_WIDTH+1000];
        [bgTopMax, bgBottomMax] = [hyp*5/10, hyp*5/10];
    }
}

// Drawing the game
function draw() {
    now = Date.now();
    detectHover();
  
    ctx.fillStyle = "rgb(185, 185, 185)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

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
        resetBgVars();
    }

    // Actual Game
    if (gameState === "startScreen") {
        loopAudio();
        drawText();
      
        drawStartScreen();
        if (innerGameState === "selectDifficulty") drawDifficultySelection();
        if (innerGameState === "selectDodger") drawDodgerSelection();
      
        abilities();
        drawPlayer();
        drawSettings();
        
        keyboardControls();
        mouseMovement();
    }
    else if (gameState === "endlessMode") {
        loopAudio();
        drawText();
        abilities();
        drawPlayer();
        drawEnemies();
        
        keyboardControls();
        mouseMovement();
            
        spawnEnemyPeriodically();
        moveEnemies();
        collisions();
    }
    else if (gameState === "endlessOver") {
        drawText();
        drawGameOver();
        abilities();
        drawPlayer();
        drawEnemies();
    }
    else if (gameState === "musicMode") {
        drawEndLevel();
        spawnAndDrawDanger();
        drawText();

        abilities();
        drawPlayer();
        
        keyboardControls();
        mouseMovement();

        musicCollisions();
    }

    // CURSOR STUFF
    let cursorEl = document.getElementById("cursor");
    let overlayEl = document.getElementById("cursor-overlay");
  
    let playerColor = player.color.slice(4, player.color.length-1);
    let playerSubColor = player.subColor.slice(4, player.subColor.length-1);

    // filters trails and clicks divs
    allCursors.forEach(trail => { if (trail.av <= 0 || trailDensity <= 0) trail.div.remove(); })
    allClicks.forEach(click => {
        if (click.av <= 0) {
            click.div.remove();
            if (click?.divMid) click?.divMid.remove(); // need to acocunt for middle click
        }
    })

    // filters trails and clicks from array
    allCursors = allCursors.filter(c => c.av > 0 && trailDensity > 0); // removes trails with low av's
    allClicks = allClicks.filter(c => c.av > 0); // removes clicks with low av's
  
    // Makes default cursor invisible
    if (settings.customCursor && !isMobile()) {
        document.documentElement.classList.add("no-cursor");
        cursorEl.style.display = "block";
        overlayEl.style.display = "block";
    } else {
        document.documentElement.classList.remove("no-cursor");
        cursorEl.style.display = "none";
        overlayEl.style.display = "none";
    }
    
  
    // Cursor & Cursor Trail
    if (cursorX !== undefined && cursorY !== undefined) {
        // Draws Trail
        allCursors.forEach(trail => {
            // draws trails dimensions and color
            trail.div.style.width = `${trail.r*2}px`;
            trail.div.style.height = `${trail.r*2}px`;
            trail.div.style.backgroundColor = trail.color;

            // places trail
            trail.div.style.transform = "translate(-50%, -50%)";
            trail.div.style.top = `${trail.y}px`;
            trail.div.style.left = `${trail.x}px`;

            // changes trails radius and alpha value to animate it
            trail.r -= trail.subR;
            trail.av -= trail.subAv;
        })
    
        // Draws Cursor
        cursorEl.style.width = `${window.innerWidth * (12/1397)}px`;
        cursorEl.style.height = `${window.innerWidth * (12/1397)}px`;
        cursorEl.style.borderWidth = `${window.innerWidth * (3/1397)}px`;
        
        overlayEl.style.width = `${window.innerWidth * (12/1397)}px`;
        overlayEl.style.height = `${window.innerWidth * (12/1397)}px`;
        overlayEl.style.borderWidth = `${window.innerWidth * (3/1397)}px`;
        
        // Handles hoverings
        let hovering = false;
        
        // covers hovering over canvas buttons
        Object.keys(mouseOver).forEach(hover => {
          if (mouseOver[hover]) hovering = true;
        })
        
        // covers hovering over hyperlinks
        let hyperlinks = document.getElementsByTagName('a');
        for (let i = 0; i < hyperlinks.length; i++) {
          if (hyperlinks[i].matches(":hover")) hovering = true;
        }
        
        // hovering inverts cursor colors
        if (hovering) {
            cursorEl.style.backgroundColor = player.subColor;
            cursorEl.style.borderColor = player.color;
        } else {
            cursorEl.style.backgroundColor = player.color;
            cursorEl.style.borderColor = player.subColor;
        }

        // clicking brightens the cursor with an overlay
        if (mouseDown) {
            let av = 0.25; // alpha value
            if (player.dodger === "jötunn") av = 0.05;
            if (player.dodger === "crescendo") av = 0.1;
            if (player.dodger === "j-sab") av = 0.1;

            if (hovering) av *= 1.2;
            overlayEl.style.backgroundColor = `rgba(255, 255, 255, ${av})`;
            overlayEl.style.borderColor = `rgba(255, 255, 255, ${av})`;
        }
        else {
            overlayEl.style.backgroundColor = "rgba(255, 255, 255, 0)";
            overlayEl.style.borderColor = "rgba(255, 255, 255, 0)";
        }
        
        // update cursor position
        cursorEl.style.transform = "translate(-50%, -50%)";
        cursorEl.style.top = `${cursorY}px`;
        cursorEl.style.left = `${cursorX}px`;

        // update overlay position
        overlayEl.style.transform = "translate(-50%, -50%)";
        overlayEl.style.top = cursorEl.style.top;
        overlayEl.style.left = cursorEl.style.left;
    }
      
    // Click Animation
    allClicks.forEach(click => {
        // draws clicks dimensions and color
        click.div.style.width = `${click.r*2}px`;
        click.div.style.height = `${click.r*2}px`;
        click.div.style.border = "2px solid";
        
        click.div.style.backgroundColor = "rgba(0, 0, 0, 0)";
        if (click.button === "left" || click.button === "middle") click.div.style.borderColor = click.colorLeft;
        if (click.button === "right") click.div.style.borderColor = click.colorRight;

        // places click
        click.div.style.transform = "translate(-50%, -50%)";
        click.div.style.top = `${click.y}px`;
        click.div.style.left = `${click.x}px`;
        
        // determines middle clicks dimensions, color, and placement
        if (click.button === "middle") {
            click.divMid.style.backgroundColor = "rgba(0, 0, 0, 0)";
            let newR = click.r-3;
            if (newR > 0) {
                click.divMid.style.width = `${newR*2}px`;
                click.divMid.style.height = `${newR*2}px`;
                click.divMid.style.border = `2px solid ${click.colorRight}`;

                click.divMid.style.transform = "translate(-50%, -50%)";
                click.divMid.style.top = `${click.y}px`;
                click.divMid.style.left = `${click.x}px`;
            }
        }

        // changes clicks radius and alpha value to animate it
        click.r += click.addR;
        click.av -= click.subAv;
    })

    requestAnimationFrame(draw);
}

draw();
