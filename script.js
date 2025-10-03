// DODGE.IO - SCRIPT.JS
const cnv = document.getElementById("game");
const ctx = cnv.getContext('2d');

// game units
const GAME_WIDTH = 800, GAME_HEIGHT = 650;
cnv.width = GAME_WIDTH;
cnv.height = GAME_HEIGHT;

let gameState = "loading";
let innerGameState = "loading";

let bgTopText, bgBottomText, bgTopX, bgBottomX, bgTopMax, bgBottomMax;
function resetBgVars() {
    const hyp = Math.hypot(GAME_WIDTH, GAME_HEIGHT);
    
    if (innerGameState === "mainMenu") {
        [bgTopText, bgBottomText] = ["MAIN", "MENU"];
        [bgTopX, bgBottomX] = [-500, GAME_WIDTH+500];
        [bgTopMax, bgBottomMax] = [hyp*7/10, hyp*3/10];
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
        [bgTopText, bgBottomText] = ["SETTINGS", ""];
        [bgTopX, bgBottomX] = [-1000, 2];
        [bgTopMax, bgBottomMax] = [hyp*5/10, 1];
    }
}

// Keyboard
let lastPressing = "mouse";
let keyboardMovementOn = false, wPressed = false, aPressed = false, sPressed = false, dPressed = false, shiftPressed = 1;
document.addEventListener("keydown", recordKeyDown);
document.addEventListener("keyup", recordKeyUp);

// Mouse
let mouseDown = false, mouseMovementOn = false, previousMM = false, allClicks = [];
document.addEventListener("mousedown", () => {mouseDown = true});
document.addEventListener("mouseup", () => {mouseDown = false});
document.addEventListener("touchstart", () => {mouseDown = true; recordLeftClick();});
document.addEventListener("touchend", () => {mouseDown = false});
document.addEventListener("touchcancel", () => {mouseDown = false});

document.addEventListener("click", () => {
    recordLeftClick();
    allClicks.push(createClick("left"));
});
document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    recordRightClick(event);
    allClicks.push(createClick("right"));
});
document.addEventListener("auxclick", (event) => {
    if (event.button === 1) {
        event.preventDefault();
        recordMiddleClick(event);
        allClicks.push(createClick("middle"));
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

let mouseX, mouseY, cursorX, cursorY;
let track = false;
let allCursors = [];
let lastCursorTrail = 0;
let trailDensity = 0;
window.addEventListener('mousemove', (event) => {
    const screenX = event.clientX;
    const screenY = event.clientY;
    
    // cursor trails
    cursorX = screenX;
    cursorY = screenY;

    // offset mouse
    const rect = cnv.getBoundingClientRect();
    mouseX = screenX - rect.left;
    mouseY = screenY - rect.top;
    if (track) console.log(`x: ${mouseX.toFixed()} || y: ${mouseY.toFixed()}`);
});

// Player & Enemies
let player = {
    x: GAME_WIDTH/2,
    y: GAME_HEIGHT/2,
    r: 15,
    speed: 5,
    baseSpeed: 5,
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
    accel: 1,
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
    baseSpeed: 5,
    speed: 0,
    accel: 0,
    limit: 10.5,
    accelRate: Date.now(),
    reset: function () {
        player.baseSpeed = 5;
        this.speed = 0;
        this.accel = 0;
        this.accelRate = Date.now();
    },
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
let musicVolume = 0, sfxVolume = 0;

let alarm9 = document.getElementById("alarm9");
let music = {
    var: alarm9,
    name: "Alarm 9",
    artist: "Blue Cxve",
    color: "rgb(163, 0, 163)",
    subColor: "rgb(173, 0, 173)",
    timestamps: [],
    promise: "alarm9.play()",
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
    now = Date.now();
    detectHover();
    
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    
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

    // CURSOR STUFF
    let cursorEl = document.getElementById("cursor");
    let overlayEl = document.getElementById("cursor-overlay");
  
    let playerColor = player.color.slice(4, player.color.length-1);
    let playerSubColor = player.subColor.slice(4, player.subColor.length-1);

    allCursors.forEach(c => { if (c.av <= 0 || trailDensity <= 0) c.div.remove(); })
    allClicks.forEach(c => {
        if (c.av <= 0) {
            c.div.remove();
            if (c?.divMid) c?.divMid.remove();
        }
    })
    
    allCursors = allCursors.filter(c => c.av > 0 && trailDensity > 0); // removes trails with low av's
    allClicks = allClicks.filter(c => c.av > 0); // removes clicks with low av's
  
    // Makes default cursor invisible
    if (settings.customCursor) {
        document.documentElement.classList.add("no-cursor");
        cursorEl.style.display = "block";
        overlayEl.style.display = "block";
    }
    else {
        document.documentElement.classList.remove("no-cursor");
        allCursors = [];
        cursorEl.style.display = "none";
        overlayEl.style.display = "none";
    }
    
  
    // Cursor & Cursor Trail
    if (settings?.customCursor && cursorX !== undefined && cursorY !== undefined) {
        if (trailDensity > 0) {
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
      
        allCursors.forEach(cursor => {
            cursor.div.style.backgroundColor = cursor.color;
            cursor.div.style.top = `${cursor.y-cursor.r}px`;
            cursor.div.style.left = `${cursor.x-cursor.r}px`;
            cursor.div.style.width = `${cursor.r*2}px`;
            cursor.div.style.height = `${cursor.r*2}px`;
            
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
            cursorEl.style.backgroundColor = player.subColor;
            cursorEl.style.borderColor = player.color;
        } else {
            cursorEl.style.backgroundColor = player.color;
            cursorEl.style.borderColor = player.subColor;
        }

        // clicking brightens the cursor with an overlay
        if (mouseDown) {
            let bg = overlayEl.style.backgroundColor;
            bg = "rgba(255, 255, 255, 0.5)";
            if (player.dodger === "jötunn") bg = "rgba(255, 255, 255, 0.3)";
            if (player.dodger === "crescendo") bg = "rgba(255, 255, 255, 0.3)";
            overlayEl.style.borderColor = bg;
        }
        else {
            overlayEl.style.backgroundColor = "rgba(255, 255, 255, 0)";
            overlayEl.style.borderColor = "rgba(255, 255, 255, 0)";
        }
        
        // update cursor position
        cursorEl.style.top = `${cursorY-8.5}px`;
        cursorEl.style.left = `${cursorX-8.5}px`;
        overlayEl.style.top = `${cursorY-8.5}px`;
        overlayEl.style.left = `${cursorX-8.5}px`;
    }
      
    // Click Animation
    allClicks.forEach(click => {
        click.div.style.top = `${click.y-click.r*1.05}px`;
        click.div.style.left = `${click.x-click.r*1.05}px`;
        click.div.style.width = `${click.r*2}px`;
        click.div.style.height = `${click.r*2}px`;
        click.div.style.border = "2px solid";
        
        click.div.style.backgroundColor = "rgba(0, 0, 0, 0)";
        if (click.button === "left" || click.button === "middle") click.div.style.borderColor = click.colorLeft;
        if (click.button === "right") click.div.style.borderColor = click.colorRight;
        
        if (click.button === "middle") {
            click.divMid.style.backgroundColor = "rgba(0, 0, 0, 0)";
            let newR = click.r-3;
            if (newR > 0) {
                click.divMid.style.top = `${click.y-newR*1.05}px`;
                click.divMid.style.left = `${click.x-newR*1.05}px`;
                click.divMid.style.width = `${newR*2}px`;
                click.divMid.style.height = `${newR*2}px`;
                click.divMid.style.border = `2px solid ${click.colorRight}`;
            }
        }

        click.r += click.addR;
        click.av -= click.subAv;
    })

    requestAnimationFrame(draw);
}

draw();
