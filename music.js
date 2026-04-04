// DODGE.IO - MUSIC.JS
function restartMusicMode() {
    allDangers = [];
    player.lives = 3;
    player.hit = 0;
    music.var.currentTime = 0;
    music.promise = music.var.play();
    music.timestamps = [...music.backUpTS];
    timeLeft = (music.var.duration - music.var.currentTime).toFixed(2);
    dash.lastEnded = 0;
    shockwave.reset();
    amplify.reset();
    eventHorizon.reset();
    innerGameState = 'inMusicMode';
    gameState = "musicMode";
}

function pauseAudio(promise, audio) { // Pause music without causing errors
    if (promise !== undefined) {
        promise.then(_ => {
            audio.pause();
        })
        .catch(error => {
            console.warn(error);
        });
    }
}

function loopAudio() {
    if (music.var.currentTime === music.var.duration) {
        music.var.currentTime = 0;
        music.promise = music.var.play();
    }
}

function drawEndLevel() {
    if (timeLeft <= 0 || innerGameState === "musicModeFail") {
        // Rect Variables
        let exitX = 150;
        let exitY = (GAME_HEIGHT/2 - 100);
        let inExitRect = player.x + player.r <= exitX + 200 && player.x - player.r >= exitX && player.y + player.r <= exitY + 200 && player.y - player.r >= exitY;
        let redoX = 450;
        let redoY = (GAME_HEIGHT/2 - 100);
        let inRedoRect = player.x + player.r <= redoX + 200 && player.x - player.r >= redoX && player.y + player.r <= redoY + 200 && player.y - player.r >= redoY;
        
        // Exit Rect
        if (timeLeft <= 0) ctx.fillStyle = "rgb(0, 235, 0)";
        if (innerGameState === "musicModeFail") ctx.fillStyle = "rgb(235, 0, 0)";
        ctx.fillRect(exitX, exitY, 200, 200);
        
        // Redo Rect
        ctx.fillStyle = music.color;
        ctx.fillRect(redoX, redoY, 200, 200);
        
        // Loading Rect (now-starttime = time left in milliseconds, 200 = width, 3000 = max time in milliseconds)
        let sideLength = (now-startTime)*200/3000;
        if (inExitRect) {
            if (timeLeft <= 0) ctx.fillStyle = "rgb(0, 245, 0)";
            if (innerGameState === "musicModeFail") ctx.fillStyle = "rgb(245, 0, 0)";
            ctx.fillRect(exitX + (100-sideLength/2), exitY + (100-sideLength/2), sideLength, sideLength);
        } else if (inRedoRect) {
            ctx.fillStyle = music.subColor;
            ctx.fillRect(redoX + (100-sideLength/2), redoY + (100-sideLength/2), sideLength, sideLength);
        }
        // Exit Rect Stroke
        if (timeLeft <= 0) ctx.strokeStyle = "rgb(0, 245, 0)";
        if (innerGameState === "musicModeFail") ctx.strokeStyle = "rgb(245, 0, 0)";
        ctx.lineWidth = 4;
        ctx.strokeRect(exitX, exitY, 200, 200);
        // Redo Rect Stroke
        ctx.strokeStyle = music.subColor;
        ctx.strokeRect(redoX, redoY, 200, 200);
        
        // Conditionals
        ctx.textAlign = "center";
        ctx.font = "30px Verdana";
        // Exit Rect Conditional
        ctx.fillStyle = "rgb(235, 235, 235)";
        if (inExitRect) {
            ctx.fillText(`Exiting In`, 250, GAME_HEIGHT/2 - 25);
            ctx.fillText(`${Math.ceil(3 - (now-startTime)/1000)}`, 250, GAME_HEIGHT/2 + 25);
            if (now - startTime >= 3000) {
                dash.lastEnded = 0;
                shockwave.reset();
                amplify.reset();
                eventHorizon.reset();
                music.var = aNewStart;
                music.name = "A New Start";
                music.artist = "Thygan Buch";
                music.var.currentTime = 0;
                music.promise = music.var.play();
                gameState = "startScreen";
                innerGameState = "mainMenu";
                resetBgVars();
            }
        }
        else {
            ctx.fillText("Level", 250, GAME_HEIGHT/2 - 25);
            if (timeLeft <= 0) ctx.fillText("Complete", 250, GAME_HEIGHT/2 + 25);
            if (innerGameState === "musicModeFail") ctx.fillText("Failed", 250, GAME_HEIGHT/2 + 25);
        }
        
        // Redo Rect conditional
        ctx.fillStyle = music.textColor;
        if (inRedoRect) {
            ctx.fillText(`Restarting In`, 550, GAME_HEIGHT/2 - 25);
            ctx.fillText(`${Math.ceil(3 - (now-startTime)/1000)}`, 550, GAME_HEIGHT/2 + 25);
            if (now - startTime >= 3000) restartMusicMode();
        }
        else {
            ctx.fillText("Restart", 550, GAME_HEIGHT/2 - 25);
            ctx.fillText("Level", 550, GAME_HEIGHT/2 + 25);
        }
        // Reset StartTime
        if (!inExitRect && !inRedoRect) startTime = Date.now();
    }
    if (timeLeft > 0 && innerGameState !== "musicModeFail") startTime = Date.now();
}

function createBeam(variant="none") {
    let beam = {
        type: "beam",
        variant: Math.random(),
        x: Math.random() * GAME_WIDTH, y: Math.random() * GAME_HEIGHT,
        w: (Math.random() * 20) + 80, h: (Math.random() * 20) + 50,
        spawnRate: 0.25, baseSpawnRate: 0.25, despawnRate: 2, baseDespawnRate: 2,
        colorValue: 185,
        get color() {
            return `rgba(${this.colorValue}, ${this.colorValue}, ${this.colorValue}, 0.95)`;
        },
        reset: 0,
        get swcv () { // for jolt
            return 0.8 - 0.8 * Math.min(1, (now - this.reset)/5000);
        },
        vulnerable: "None",
        distance: 0,
        get azcv () { // for jötunn
            const clampDist = Math.min(Math.max(absoluteZero.slowEnd, this.distance), absoluteZero.slowStart);
            let cv = (clampDist - absoluteZero.slowEnd) / (absoluteZero.slowStart - absoluteZero.slowEnd);
            if (player.dodger !== "jötunn" || absoluteZero.passive === "Glaciation") cv = 1;
            return 0.3 - 0.3 * cv;
        },
    }
    if (beam.variant > 0.5) beam.variant = "vertical";
    else beam.variant = "horizontal";
    if (variant === "vertical" || variant === "horizontal") beam.variant = variant;
    return beam;
}

function createCircle(variant="none") {
    let circle = {
        type: "circle",
        variant: Math.random(),
        x: Math.random() * GAME_WIDTH, y: Math.random() * GAME_HEIGHT, r: (Math.random() * 40) + 80,
        spawnRate: 0.25, baseSpawnRate: 0.25, despawnRate: 2, baseDespawnRate: 2,
        colorValue: 185,
        get color() {
            return `rgba(${this.colorValue}, ${this.colorValue}, ${this.colorValue}, 0.95)`;
        },
        reset: 0,
        get swcv () { // for jolt
            return 0.8 - 0.8 * Math.min(1, (now - this.reset)/5000);
        },
        vulnerable: "None",
        distance: 0,
        get azcv () { // for jötunn
            const clampDist = Math.min(Math.max(absoluteZero.slowEnd, this.distance), absoluteZero.slowStart);
            let cv = (clampDist - absoluteZero.slowEnd) / (absoluteZero.slowStart - absoluteZero.slowEnd);
            if (player.dodger !== "jötunn" || absoluteZero.passive === "Glaciation") cv = 1;
            return 0.3 - 0.3 * cv;
        },
    }
    circle.lineWidth = circle.r;
    if (circle.variant > 0.5) circle.variant = "bomb";
    else circle.variant = "ring";
    if (variant === "bomb" || variant === "ring") circle.variant = variant;
    return circle;
}

function createSpike() {
    let spike = {
        type: "spike",
        variant: "none",
        x: 0, y: 0, r: 20,
        rotate: 0, 
        baseSpeed: 2.5 + 2 * (music.var.currentTime/music.var.duration),
        spawnRate: 0.5, baseSpawnRate: 0.5, despawnRate: 2, baseDespawnRate: 2,
        colorValue: 185,
        get color() {
            return `rgba(${this.colorValue}, ${this.colorValue}, ${this.colorValue}, 0.95)`;
        },
        launched: false,
        get reachedWall() {
            if ((this.x - this.r * 1.5001 < 0 || this.x + this.r * 1.5001 > GAME_WIDTH ||
                this.y - this.r * 1.5001 < 0 || this.y + this.r * 1.5001 > GAME_HEIGHT) && this.launched) {
                return true;
            }
            else return false;
        },
        reset: 0,
        get swcv () { // for jolt
            return 0.8 - 0.8 * Math.min(1, (now - this.reset)/5000);
        },
        vulnerable: "None",
        distance: 0,
        get azcv () { // for jötunn
            const clampDist = Math.min(Math.max(absoluteZero.slowEnd, this.distance), absoluteZero.slowStart);
            let cv = (clampDist - absoluteZero.slowEnd) / (absoluteZero.slowStart - absoluteZero.slowEnd);
            if (player.dodger !== "jötunn") cv = 1;
            return 0.3 - 0.3 * cv;
        },
    }
    spike.speed = spike.baseSpeed;
    const radiusSpace = spike.r * 1.501;
    spike.x = Math.random()*(GAME_WIDTH-(radiusSpace*2)) + radiusSpace;
    spike.y = Math.random()*(GAME_HEIGHT-(radiusSpace*2)) + radiusSpace;
    return spike;
}

function createText() {
    let text = {
        type: "text",
        variant: "none",
        x: 0, y: 0,
        text: "placeholder", textAlign: "left", font: "50px Verdana",
        spawnRate: 0.5, baseSpawnRate: 0.5, despawnRate: 2, baseDespawnRate: 2,
        colorValue: 185,
        get color() {
            return `rgba(${this.colorValue}, ${this.colorValue}, ${this.colorValue}, 0.95)`;
        },
    }
    return text;
}

function spawnAndDrawDanger() {
    // Danger Spawning
    if (music.timestamps.length > 0) {
        for (let i = music.timestamps.length-1; i >= 0; i--) {
            const timestamp = music.timestamps[i][0];
            const dangerType = music.timestamps[i][1];
            const modifiers = music.timestamps[i][2];
            let danger;
            if (music.var.currentTime >= timestamp) {
                if (dangerType === "beam" || dangerType === "horizontal" || dangerType === "vertical") {
                    allDangers.push(createBeam(dangerType));
                    danger = allDangers[allDangers.length-1];
                    if (modifiers?.size) { danger.w = modifiers.size; danger.h = modifiers.size; }
                    
                    // determines the beams x value based off the timestamp
                    let xMulti = Math.floor(timestamp*100/GAME_WIDTH);
                    danger.x = (timestamp*100)-(GAME_WIDTH*xMulti);
                    
                    // determines the beams y value based off the timestamp
                    let yMulti = Math.floor(timestamp*100/GAME_HEIGHT);
                    danger.y = (timestamp*100)-(GAME_HEIGHT*yMulti);
                } else if (dangerType === "circle" || dangerType === "bomb" || dangerType === "ring") {
                    allDangers.push(createCircle(dangerType));
                    danger = allDangers[allDangers.length-1];
                    if (modifiers?.size) danger.r = modifiers.size;
                    danger.lineWidth = danger.r;
                    if (modifiers?.lineWidth) danger.lineWidth = modifiers.lineWidth;
        
                    // the circle's x and y will mimic the players
                    danger.x = player.x;
                    danger.y = player.y;
                } else if (dangerType === "spike") {
                    allDangers.push(createSpike());
                    danger = allDangers[allDangers.length-1];
                    if (modifiers?.size) danger.r = modifiers.size;
                    const radiusSpace = danger.r * 1.501;
                    
                    const location = modifiers?.location;
                    // spikes spawn on the edge of the walls
                    if (!location) {
                        const rand = Math.random();
                        if (rand < 0.25) danger.x = radiusSpace;
                        else if (rand < 0.5) danger.x = GAME_WIDTH - radiusSpace;
                        else if (rand < 0.75) danger.y = radiusSpace;
                        else if (rand < 1) danger.y = GAME_HEIGHT - radiusSpace;
                    } else {
                        danger.location = location;
                        locations = {tl: [radiusSpace, radiusSpace], tr: [GAME_WIDTH-radiusSpace, radiusSpace],
                                     bl: [radiusSpace, GAME_HEIGHT-radiusSpace], br: [GAME_WIDTH-radiusSpace, GAME_HEIGHT-radiusSpace],
                                     tm: [GAME_WIDTH/2, radiusSpace], lm: [radiusSpace, GAME_HEIGHT/2],
                                     bm: [GAME_WIDTH/2, GAME_HEIGHT-radiusSpace], rm: [GAME_WIDTH-radiusSpace, GAME_HEIGHT/2]}
                        
                        if (locations?.[location]) {
                            danger.x = locations[location][0];
                            danger.y = locations[location][1];
                        }
                    }
                    if (modifiers?.speed) danger.baseSpeed = modifiers.speed;
                    danger.speed = danger.baseSpeed;
                } else if (dangerType === "text") {
                    allDangers.push(createText());
                    danger = allDangers[allDangers.length-1];
                    if (modifiers?.text) danger.text = modifiers.text;
                    if (modifiers?.textAlign) danger.textAlign = modifiers.textAlign;
                    if (modifiers?.font) danger.font = modifiers.font;
                }

                // modified spawn location
                if (modifiers?.coords) {
                    if (modifiers.coords[0] === "player") {
                        if (danger.type !== "beam") { danger.x = player.x; danger.y = player.y; }
                        else { danger.x = player.x - danger.w/2; danger.y = player.y - danger.h/2; }
                    }
                    else { danger.x = modifiers.coords[0]; danger.y = modifiers.coords[1]; }
                }

                // modified spawn rate
                if (modifiers?.spawnRate) danger.spawnRate = modifiers.spawnRate;
                if (modifiers?.despawnRate) danger.despawnRate = modifiers.despawnRate;
                else if (modifiers?.despawnRate === 0) danger.despawnRate = 0;
                danger.spawnRate *= 2;
                danger.baseSpawnRate *= 2;
                danger.despawnRate *= 2;

                // Beam X and Y's
                if (danger.variant === "vertical") { danger.y = 0; danger.h = GAME_HEIGHT; }
                if (danger.variant === "horizontal") { danger.x = 0; danger.w = GAME_WIDTH; }
                
                // Collision Points
                if (player.dodger === "jolt" && !modifiers?.invincible) {
                    danger.reset = 1;
                    if (danger.type === "circle" || danger.type === "spike") {
                        danger.baseUnit = danger.r;
                        Object.defineProperty(danger, "collisionPoints", {
                            get() {
                                let radius;
                                if (this.variant === "bomb") radius = this.r;
                                if (this.variant === "ring") radius = this.r + this.lineWidth/2;
                                if (this.type === "spike") radius = this.r * 1.5;
                            
                                let piOver3X = radius*Math.cos(Math.PI/3);
                                let piOver3Y = radius*Math.sin(Math.PI/3);
                                let piOver6X = radius*Math.cos(Math.PI/6);
                                let piOver6Y = radius*Math.sin(Math.PI/6);
                                points =  [[this.x, this.y],
                                    [this.x+radius, this.y], [this.x+piOver6X, this.y+piOver6Y], [this.x+piOver3X, this.y+piOver3Y],
                                    [this.x, this.y+radius], [this.x-piOver3X, this.y+piOver3Y], [this.x-piOver6X, this.y+piOver6Y],
                                    [this.x-radius, this.y], [this.x-piOver6X, this.y-piOver6Y], [this.x-piOver3X, this.y-piOver3Y],
                                    [this.x, this.y-radius], [this.x+piOver3X, this.y-piOver3Y], [this.x+piOver6X, this.y-piOver6Y]];
                                if (this.variant === "ring") {
                                    radius = this.r-this.lineWidth/2
                                    piOver3X = radius*Math.cos(Math.PI/3);
                                    piOver3Y = radius*Math.sin(Math.PI/3);
                                    piOver6X = radius*Math.cos(Math.PI/6);
                                    piOver6Y = radius*Math.sin(Math.PI/6);
                                    points.push(
                                        [this.x+radius, this.y], [this.x+piOver6X, this.y+piOver6Y], [this.x+piOver3X, this.y+piOver3Y],
                                        [this.x, this.y+radius], [this.x-piOver3X, this.y+piOver3Y], [this.x-piOver6X, this.y+piOver6Y],
                                        [this.x-radius, this.y], [this.x-piOver6X, this.y-piOver6Y], [this.x-piOver3X, this.y-piOver3Y],
                                        [this.x, this.y-radius], [this.x+piOver3X, this.y-piOver3Y], [this.x+piOver6X, this.y-piOver6Y]);
                                    
                                }

                                return points;
                            }
                        })
                    }
                    else if (danger.type === "beam") {
                        if (danger.variant === "vertical") { danger.baseUnit = danger.w; danger.baseX = danger.x; }
                        if (danger.variant === "horizontal") { danger.baseUnit = danger.h; danger.baseY = danger.y; }
                        Object.defineProperty(danger, "collisionPoints", {
                            get() {
                                return [[this.x+this.w/2, this.y+this.h/2],
                                    [this.x, this.y+this.h*0/4], [this.x+this.w/4, this.y+this.h*0/4], [this.x+this.w/2, this.y+this.h*0/4], [this.x+this.w*3/4, this.y+this.h*0/4], [this.x+this.w, this.y+this.h*0/4],
                                    [this.x, this.y+this.h*1/4], [this.x+this.w/4, this.y+this.h*1/4], [this.x+this.w/2, this.y+this.h*1/4], [this.x+this.w*3/4, this.y+this.h*1/4], [this.x+this.w, this.y+this.h*1/4],
                                    [this.x, this.y+this.h*2/4], [this.x+this.w/4, this.y+this.h*2/4], [this.x+this.w/2, this.y+this.h*2/4], [this.x+this.w*3/4, this.y+this.h*2/4], [this.x+this.w, this.y+this.h*2/4],
                                    [this.x, this.y+this.h*3/4], [this.x+this.w/4, this.y+this.h*3/4], [this.x+this.w/2, this.y+this.h*3/4], [this.x+this.w*3/4, this.y+this.h*3/4], [this.x+this.w, this.y+this.h*3/4],
                                    [this.x, this.y+this.h*4/4], [this.x+this.w/4, this.y+this.h*4/4], [this.x+this.w/2, this.y+this.h*4/4], [this.x+this.w*3/4, this.y+this.h*4/4], [this.x+this.w, this.y+this.h*4/4]]
                            }
                        })
                    }
                }
                
                music.timestamps.splice(i, 1);
            }
        }
    }
    // Danger Rearranging | dangers with the highest color values are put at the start of the array
    allDangers.sort((a, b) => a.colorValue - b.colorValue);
    
    // Danger Drawing
    allDangers.forEach(danger => {
        ctx.fillStyle = danger.color;
        ctx.strokeStyle = danger.color;
        
        let joltEffectColor = `rgba(${danger.colorValue}, ${danger.colorValue}, 0, ${danger.swcv})`;
        let jötunnEffectColor = `rgba(80, ${198+danger.colorValue/10}, ${229+danger.colorValue/10}, ${danger.azcv})`;
        
        function joltOrJötunnFillStyle() {
            if (player.dodger === "jolt") return joltEffectColor;
            else if (player.dodger === "jötunn") return jötunnEffectColor;
            else return "rgba(255, 255, 255, 0)";
        }
        
        // colorValue
        if (danger.colorValue >= 255 && danger.type !== "spike") danger.despawn = true;
        
        if (danger.colorValue < 255 && ( (!danger?.despawn && danger.type !== "spike") ||
             (!danger?.reachedWall && danger.type === "spike") ) ) danger.colorValue += danger.spawnRate;
        
        if (danger.colorValue > 185 && (danger?.despawn || danger?.reachedWall)) danger.colorValue -= danger.despawnRate;
        
        // shape
        if (danger.type === "beam") {
            ctx.fillRect(danger.x, danger.y, danger.w, danger.h);
            ctx.fillStyle = joltOrJötunnFillStyle();
            ctx.strokeStyle = joltOrJötunnFillStyle();
            ctx.fillRect(danger.x, danger.y, danger.w, danger.h);
        }
        else if (danger.type === "circle") {
            if (danger.variant === "bomb") {
                drawCircle(danger.x, danger.y, danger.r);
                ctx.fillStyle = joltOrJötunnFillStyle();
                ctx.strokeStyle = joltOrJötunnFillStyle();
                drawCircle(danger.x, danger.y, danger.r);
            }
            if (danger.variant === "ring") {
                ctx.lineWidth = danger.lineWidth;
                drawCircle(danger.x, danger.y, danger.r, "stroke");
                ctx.strokeStyle = joltOrJötunnFillStyle();
                drawCircle(danger.x, danger.y, danger.r, "stroke");
            }
        }
        else if (danger.type === "spike") {
            let w = 1.75;
            let h = 1.5;
            function draw4Spikes() {
                // Top Spike
                ctx.beginPath();
                ctx.moveTo(-danger.r/w, -danger.r/w);
                ctx.lineTo(0, -danger.r*h);
                ctx.lineTo(danger.r/w, -danger.r/w);
                ctx.fill();
                // Bottom Spike
                ctx.beginPath();
                ctx.moveTo(-danger.r/w, danger.r/w);
                ctx.lineTo(0, danger.r*h);
                ctx.lineTo(danger.r/w, danger.r/w);
                ctx.fill();
                // Left Spike
                ctx.beginPath();
                ctx.moveTo(-danger.r/w, -danger.r/w);
                ctx.lineTo(-danger.r*h, 0);
                ctx.lineTo(-danger.r/w, danger.r/w);
                ctx.fill();
                // Right Spike
                ctx.beginPath();
                ctx.moveTo(danger.r/w, -danger.r/w);
                ctx.lineTo(danger.r*h, 0);
                ctx.lineTo(danger.r/w, danger.r/w);
                ctx.fill();
            }
            function drawSpike() {
                drawCircle(danger.x, danger.y, danger.r);
                ctx.save();
                ctx.translate(danger.x, danger.y);
                ctx.rotate(danger.rotate);
                draw4Spikes();
                ctx.restore();
                ctx.save();
                ctx.translate(danger.x, danger.y);
                ctx.rotate((Math.PI/3)+danger.rotate);
                draw4Spikes();
                ctx.restore();
                ctx.save();
                ctx.translate(danger.x, danger.y);
                ctx.rotate((Math.PI/6)+danger.rotate);
                draw4Spikes();
                ctx.restore();
            }
            drawSpike();
            ctx.fillStyle = joltOrJötunnFillStyle();
            ctx.strokeStyle = joltOrJötunnFillStyle();
            drawSpike();
            danger.rotate += Math.PI/100;
            
            if (danger.colorValue >= 255 && !danger.launched) {
                const dx = player.x - danger.x;
                const dy = player.y - danger.y;
                const dist = Math.hypot(dx, dy);
                danger.facingAngle = Math.atan2(dy, dx);
                danger.baseMoveX = Math.cos(danger.facingAngle);
                danger.baseMoveY = Math.sin(danger.facingAngle);
                // top and bottom aim
                if ( (danger.y < danger.r*1.502 && player.y < danger.r*1.501) || 
                     (danger.y > GAME_HEIGHT-danger.r*1.502 && player.y > GAME_HEIGHT-danger.r*1.501) ) danger.baseMoveY = 0;
                // left and right aim
                else if ( (danger.x < danger.r*1.502 && player.x < danger.r*1.501) ||
                     (danger.x > GAME_WIDTH-danger.r*1.502 && player.x > GAME_WIDTH-danger.r*1.501) ) danger.baseMoveX = 0;
                danger.launched = true;
                danger.movex = danger.baseMoveX;
                danger.movey = danger.baseMoveY;
            }
            
            if (danger.colorValue >= 255 && !danger.reachedWall) {
                danger.x += danger.movex * danger.speed;
                danger.y += danger.movey * danger.speed;
            }

            if (danger.reachedWall) {
                if (danger.x - danger.r*1.5 < 0) danger.x = danger.r*1.5;
                if (danger.x + danger.r*1.5 > GAME_WIDTH) danger.x = GAME_WIDTH - danger.r*1.5;
                if (danger.y - danger.r*1.5 < 0) danger.y = danger.r*1.5;
                if (danger.y + danger.r*1.5 > GAME_HEIGHT) danger.y = GAME_HEIGHT - danger.r*1.5;
            }
        }
        else if (danger.type === "text") {
            ctx.textAlign = danger.textAlign;
            ctx.font = danger.font;
            ctx.fillText(danger.text, danger.x, danger.y);
        }
    })
    // Danger Deleting
    function keepDanger(danger) {
        if (danger.colorValue <= 185 && (danger?.reachedWall || danger?.despawn)) return false;
        else return true;
    }
    allDangers = allDangers.filter(danger => keepDanger(danger));
}

function musicCollisions() {
    allDangers.forEach(danger => {
        if (timeLeft > 0 && innerGameState !== "musicModeFail" && danger.colorValue >= 254 && !player.invincible) {
            let distance = Math.hypot(player.x-danger.x, player.y-danger.y);
            if (danger.type === "beam") {
                if ((danger.variant === "vertical" && player.x+player.r >= danger.x && player.x-player.r <= danger.x+danger.w) ||
                   (danger.variant === "horizontal" && player.y+player.r >= danger.y && player.y-player.r <= danger.y+danger.h)) {
                    player.lives--;
                    player.hit = Date.now();
                    sharpPop.currentTime = 0;
                    sharpPop.play();
                }
            }
            if (danger.type === "circle") {
                if ((danger.variant === "bomb" && distance <= danger.r+player.r) ||
                   (danger.variant === "ring" && distance <= danger.r+danger.lineWidth/2+player.r &&
                    distance >= danger.r-danger.lineWidth/2-player.r)) {
                    player.lives--;
                    player.hit = Date.now();
                    sharpPop.currentTime = 0;
                    sharpPop.play();
                }
            }
            if (danger.type === "spike") {
                if (distance <= danger.r*1.5+player.r) {
                    player.lives--;
                    player.hit = Date.now();
                    sharpPop.currentTime = 0;
                    sharpPop.play();
                }
            }
        }

        if (player.lives === 0 && innerGameState !== "musicModeFail" && innerGameState !== "mainMenu") {
            pauseAudio(music.promise, music.var);
            innerGameState = "musicModeFail";
        }
        
        if ((player.dodger === "jötunn" || player.dodger === "quasar") && danger.type !== "text") {
            let distance = Math.hypot(player.x-danger.x, player.y-danger.y) - player.r;
            
            // Determines the distance from the edge of the player to the edge of the enemy
            if (danger.variant === "vertical") distance = Math.abs(player.x - (danger.x + danger.w/2)) - danger.w/2 + player.r;
            if (danger.variant === "horizontal") distance = Math.abs(player.y - (danger.y + danger.h/2)) - danger.h/2 + player.r;
            if (danger.variant === "bomb") distance -= danger.r;
            if (danger.variant === "ring") {
                innerDist = -(distance - danger.r + danger.lineWidth/2); // if the player is inside the ring
                distance -= danger.r + danger.lineWidth/2;
                if (innerDist > 0) distance = innerDist;
                }
            if (danger.type === "spike") distance -= danger.r*1.5;
            if (distance < 0) distance = 0;

            if (player.dodger === "jötunn") {
                // limits the lowest possible distance by taking the higher value
                const maxDist = Math.max(distance, absoluteZero.slowEnd);
                
                // limits the highest posible distance by taking the lower value
                const factor = Math.min(1, (maxDist - absoluteZero.slowEnd) / (absoluteZero.slowStart - absoluteZero.slowEnd));
                
                // xFactor = min + max*(factor between 0 and 1)
                const spawnFactor = 0.8 + 0.2*factor;
                const slowFactor = 0.3 + 0.7*factor;
                
                if (absoluteZero.passive === "Absolute Zero" || absoluteZero.passive === "Stagnation") {
                    danger.spawnRate = danger.baseSpawnRate * spawnFactor;
                } else danger.spawnRate = danger.baseSpawnRate;
                if (danger.type === "spike") {
                    if (absoluteZero.passive === "Absolute Zero" || absoluteZero.passive === "Glaciation") danger.speed = danger.baseSpeed * slowFactor;
                    else danger.speed = danger.baseSpeed;
                }
            }
            if (player.dodger === "quasar" && eventHorizon.activated) {
                let relativity = 1 + distance/300;
                function eventHorizonEffect(danger, rate, baseRate) {
                    let max = danger[baseRate] * relativity;

                    // To max
                    if (danger[rate] < max && now - eventHorizon.lastUsed < 4200) danger[rate] += max/50;
                    if (danger[rate] > max && now - eventHorizon.lastUsed < 4200) danger[rate] -= max/50;
                    
                    // To base rate
                    if (danger[rate] > danger[baseRate] && now - eventHorizon.lastUsed > 4200) danger[rate] -= max/50;
                    if (danger[rate] < danger[baseRate] - max/50 && now - eventHorizon.lastUsed > 4200) danger[rate] = danger[baseRate];
                }
                
                eventHorizonEffect(danger, "spawnRate", "baseSpawnRate");
                eventHorizonEffect(danger, "despawnRate", "baseDespawnRate");
                if (danger.type === "spike") eventHorizonEffect(danger, "speed", "baseSpeed");
            }
        }

        if (player.dodger === "jolt" && danger.type !== "text" && !danger?.invincible) {
            if (shockwave.activated && shockwave?.path && danger?.collisionPoints && !danger?.invincible) {
                danger.collisionPoints.forEach(point => {
                    ctx.save();
                    ctx.translate(shockwave.x, shockwave.y);
                    ctx.rotate(shockwave.facingAngle);
                    // checks each individual collision point to see if the danger was hit by the wave
                    if (ctx.isPointInPath(shockwave.path, point[0], point[1])
                        && (danger.vulnerable === shockwave.used || danger.vulnerable === "None")) {
                        // sets the size reset in motion
                        danger.reset = Date.now();
                    }
                    ctx.restore();
                })
            }
            if (danger?.reset) {
                if (now - danger.reset > 2500) {
                    ["r", "w", "h", "lineWidth", "speed"].forEach(unit => {
                        if (danger?.[unit]) {
                            if (danger.variant === "vertical") {
                                if (unit === "h") return;
                                // to determine the coordinate
                                // take the original size of the beam, subtract its new size, then divide that by 2
                                // add this value to the coordinate
                                danger.x = danger.baseX + (danger.baseUnit - danger.w)/2;
                            }
                            if (danger.variant === "horizontal") {
                                if (unit === "w") return;
                                danger.y = danger.baseY + (danger.baseUnit - danger.h)/2;
                            }
                            if (danger[unit] < danger.baseUnit-0.0001) danger[unit] += danger.baseUnit/100;
                            else { danger[unit] = danger.baseUnit; danger.vulnerable = "None"; }
                            if (danger?.speed && danger?.speed < danger?.baseSpeed-0.0001) danger.speed += danger.baseSpeed/100;
                            else if (danger?.speed) danger.speed = danger.baseSpeed;
                        }
                    })
                }
                else if (now - danger.reset <= 1000) {
                    ["r", "w", "h", "lineWidth", "speed"].forEach(unit => {
                        if (danger.variant === "vertical") {
                            if (unit === "h") return;
                            danger.x = danger.baseX + (danger.baseUnit - danger.w)/2;
                        }
                        if (danger.variant === "horizontal") {
                            if (unit === "w") return;
                            danger.y = danger.baseY + (danger.baseUnit - danger.h)/2;
                        }
                        if (danger?.[unit]) danger[unit] = danger.baseUnit*shockwave.effect;
                        if (danger?.speed) danger.speed = danger.baseSpeed*shockwave.effect;
                    })
                }
            }
        }
    })
}

function createLimbo() {
    music = {var: alarm9, name: "Alarm 9", artist: "Blue Cxve",
             color: "rgb(100, 0, 100)", subColor: "rgb(128, 0, 128)", textColor: "rgb(163, 0, 163)",
             timestamps: [[0.079], [2.79], [3.13], [3.49], [3.81], [4.17], [5.58], [6.28],
                          [6.99], [7.7], [8.4], [9.1], [9.8], [10.5], [11.9], [12.6]],};
                    
    music.timestamps.forEach(ts => ts[1] = "beam");
                    
    for (let loopNum = 1; loopNum < 11; loopNum++) { // loop amount: 11, wavelength: 11.5              
        let loopedPoints = music.timestamps.slice(1, 16).map(x => [x[0] + 11.5*loopNum, x[1]]);
        music.timestamps = music.timestamps.concat(loopedPoints);
    }
                    
    music.timestamps.forEach(ts => { ts[0] -= 0.025; }); // delay slightly for better visual to audio sync
}

function createAndromeda() {
    function solo8Beam(time) {
        // 8-beam - [0.225, 0.24, 0.23, 0.236, 0.217, 0.258, 0.228]
        return [
            [time, "horizontal"], [time+0.225, "horizontal"], [time+0.456, "vertical"], [time+0.695, "vertical"],
            [time+0.931, "horizontal"], [time+1.148, "horizontal"], [time+1.406, "vertical"], [time+1.634, "vertical"],
        ]
    }
    function doubleTriple(time, ending="none", addon="none") {
        // DT to TD [0.475] // TD to DT [0.493] // DT to 8B [0.49] // 8B to DT [0.222]
        // double-triple - [0.48, 0.465, 0.189, 0.256]
        // triple doubled - [0.189, 0.256, 0.508, 0.202, 0.226]
        
        let DT = [
            // double-triple
            [time, "horizontal"], [time+0.48, "horizontal"], [time+0.945, "vertical"], [time+1.134, "vertical"], [time+1.390, "vertical"],
            
            // triple doubled
            [time+1.865, "horizontal"], [time+2.054, "horizontal"], [time+2.310, "horizontal"],
            [time+2.818, "vertical"], [time+3.020, "vertical"], [time+3.246, "vertical"],
            
            // silent double-triple
            /*[time+3.739, "vertical"],*/ [time+4.219, "horizontal"], [time+4.684, "vertical"], [time+4.873, "horizontal"], [time+5.129, "vertical"],
            ];
        
        // 8-beam
        if (ending === "8-beam" || ending === "8-beam-cutout") DT.push([time+5.619, "horizontal"], [time+5.844, "horizontal"], [time+6.084, "vertical"], [time+6.314, "vertical"]);
        if (ending === "8-beam") DT.push([time+6.550, "horizontal"], [time+6.767, "horizontal"], [time+7.025, "vertical"], [time+7.253, "vertical"]);
        
        // quintuple
        if (ending === "quintuple") DT.push([time+5.608, "ring"], [time+6.078, "ring"], [time+6.545, "ring"], [time+7.015, "ring"], [time+7.248, "ring"]);
        
        // addon
        if (addon === "bombs") DT.push([time, "bomb"], [time+0.945, "bomb"], [time+1.865, "bomb"], [time+2.818, "bomb"], [time+3.739, "bomb"], [time+4.684, "bomb"]);
        if (addon === "bombs" && ending === "8-beam") DT.push([time+5.619, "bomb"], [time+6.550, "bomb"])
        return DT;
    }
    function drumBuildUp(time) {
        let DBU = [// 15-beat (16th cuts out) // 0.242 horiz, 0.356 vert
            [time, "bomb"], [time+0.479, "bomb"], [time+0.912, "bomb"], [time+1.411, "bomb"], [time+1.885, "bomb"], 
            [time+2.356, "bomb"], [time+2.819, "bomb"], [time+3.296, "bomb"], [time+3.761, "bomb"], [time+4.236, "bomb"], 
            [time+4.695, "bomb"], [time+5.165, "bomb"], [time+5.638, "bomb"], [time+6.106, "bomb"], [time+6.575, "bomb"], 
            
            // 16-beat, drum tempo increased // avg 0.235
            [time+7.509, "bomb"], [time+7.744, "bomb"], [time+7.979, "bomb"], [time+8.214, "bomb"],
            [time+8.449, "bomb"], [time+8.684, "bomb"], [time+8.919, "bomb"], [time+9.153, "bomb"],
            [time+9.386, "bomb"], [time+9.619, "bomb"], [time+9.857, "bomb"], [time+10.088, "bomb"],
            [time+10.317, "bomb"], [time+10.556, "bomb"], [time+10.798, "bomb"], [time+11.019, "bomb"],
            
            // accelerando // 0.225, 0.24, 0.23, 0.236, 0.217, 0.258, 0.228
            [time+11.265, "bomb"], [time+11.500, "bomb"], [time+11.732, "bomb"], [time+11.952, "bomb"],
            [time+12.195, "bomb"], [time+12.425, "bomb"], [time+12.738, "bomb"], [time+12.671, "bomb"],
            
            // quintuple ring // 0.47, 0.467, 0.47, 0.233
            [time+13.140, "ring"], [time+13.610, "ring"], [time+14.077, "ring"], [time+14.547, "ring"], [time+14.780, "ring"],
            ];
        
        // in-betweens
        for (let i = 0; i < DBU.length; i+=3) {
            if (i < 15) DBU.push([DBU[i][0]+0.242, "horizontal"], [DBU[i][0]+0.356, "vertical"]);
            else if (i < 39) DBU.push([DBU[i][0], "horizontal"], [DBU[i][0], "vertical"]);
        }
        return DBU;
    }
    function ending(time) {
        let finale =  [ // 6-beat
            [time, "ring"], [time+0.459, "ring"], [time+0.942, "ring"],
            [time+1.405, "ring"], [time+1.879, "ring"], [time+2.329, "ring"],
            [time, "horizontal"], [time+0.459, "horizontal"], [time+0.942, "horizontal"],
            [time+1.405, "horizontal"], [time+1.879, "horizontal"], [time+2.329, "horizontal"],
            
            [time+2.827, "bomb"],

            // 4-beam
            [time+2.827, "vertical"], [time+3.061, "horizontal"], [time+3.269, "vertical"], [time+3.495, "horizontal"],
            [time+2.827, "bomb"], [time+3.061, "bomb"], [time+3.269, "bomb"], [time+3.495, "bomb"],

            // 6-beat
            [time+3.755, "ring"], [time+4.214, "ring"], [time+4.691, "ring"],
            [time+5.140, "ring"], [time+5.631, "ring"],  [time+6.094, "ring"],
            [time+3.755, "vertical"], [time+4.214, "vertical"], [time+4.691, "vertical"],
            [time+5.140, "vertical"], [time+5.631, "vertical"], [time+6.094, "vertical"],

            // 5-beam
            [time+6.279, "vertical"], [time+6.578, "horizontal"], [time+6.796, "vertical"], [time+7.101, "horizontal"], [time+7.276, "vertical"],
            [time+6.279, "bomb"], [time+6.578, "bomb"], [time+6.796, "bomb"], [time+7.101, "bomb"], [time+7.276, "bomb"],

            // drum build up
            [time+7.509, "bomb"], [time+7.946, "bomb"], [time+8.429, "bomb"], [time+8.903, "bomb"],
            [time+9.377, "bomb"], [time+9.827, "bomb"], [time+10.312, "bomb"], [time+10.748, "bomb"],
            [time+11.267, "bomb"], [time+11.724, "bomb"], [time+12.188, "bomb"], [time+12.626, "bomb"],
            [time+13.127, "bomb"], [time+13.579, "bomb"], [time+14.074, "bomb"], 

            // final echo
            [time+14.538, "ring"],
        ]
        
        // layers
        for (let i = 43; i < 58; i++) { finale.push([finale[i][0], "vertical"], [finale[i][0], "horizontal"]); }
        return finale;
    }
    music = {var: astralProjection, name: "Astral Projection", artist: "Hallmore",
             color: "rgb(220, 220, 220)", subColor: "rgb(240, 240, 240)", textColor: "rgb(0, 0, 0)",
             timestamps: [],};
                    
    // structure
    music.timestamps = music.timestamps.concat(solo8Beam(0.075));
    music.timestamps = music.timestamps.concat(doubleTriple(1.931, "8-beam"), doubleTriple(9.433, "8-beam"));
    music.timestamps = music.timestamps.concat(doubleTriple(16.931, "8-beam"), doubleTriple(24.435, "8-beam-cutout"));
    music.timestamps = music.timestamps.concat(drumBuildUp(31.925));
    music.timestamps = music.timestamps.concat(doubleTriple(46.959, "8-beam", "bombs"), doubleTriple(54.459, "quintuple", "bombs"));
    music.timestamps = music.timestamps.concat(doubleTriple(61.935, "8-beam", "bombs"), doubleTriple(69.393, "none", "bombs"));
    music.timestamps = music.timestamps.concat([[76.461, "ring"]]);
    
        // 8 consecutive solo 8-beams
    for (let i = 0; i < 8; i++) { music.timestamps = music.timestamps.concat(solo8Beam(84.430+(1.882*i))); }
    
    music.timestamps = music.timestamps.concat(doubleTriple(99.437, "8-beam"), doubleTriple(106.925, "8-beam-cutout"));
    music.timestamps = music.timestamps.concat(drumBuildUp(114.417));
    music.timestamps = music.timestamps.concat(doubleTriple(129.431, "8-beam", "bombs"), doubleTriple(136.390, "quintuple", "bombs"));
    music.timestamps = music.timestamps.concat(doubleTriple(144.438, "8-beam", "bombs"), doubleTriple(151.909, "8-beam", "bombs"));
    music.timestamps = music.timestamps.concat(ending(159.426));
    
    music.timestamps.forEach(ts => { ts[0] -= 0.025; });
}

function createEuphoria() {
    const xMid = GAME_WIDTH/2;
    const yMid = GAME_HEIGHT/2;
    function lessThan(time = 33.590) {
        return [
            [time, "horizontal", {size: 150, coords: ["player"]}], [time+0.388, "vertical", {size: 150, coords: ["player"]}], [time+0.902, "horizontal", {size: 150, coords: ["player"]}],
                
            // 2.095, 2.47
            [time+2.00, "bomb", {size: 150}], [time+2.375, "bomb", {size: 180}],
            
            // 3.06, 3.538
            [time+1.900, "spike", {size: 22.5, location: "tl", spawnRate: 0.6}], [time+2.275, "spike", {size: 22.5, location: "tr", spawnRate: 0.6}]
        ];
    }
    function heyAh_heyHi(time = 66.920) {
        return [
            [time, "vertical", {coords: ["player"], spawnRate: 0.5, despawnRate: 3}], [time+0.18, "vertical", {coords: ["player"], spawnRate: 0.5, despawnRate: 3}],
            [time+1.083, "horizontal", {coords: ["player"], spawnRate: 0.5, despawnRate: 3}], [time+1.606, "horizontal", {coords: ["player"], spawnRate: 0.5, despawnRate: 3}]
        ];
    }
    function bg16Beat(time = 91.834, difficulty = "easy") {
        let bg = [[time, "spike"], [time+0.547, "spike"], [time+1.091, "spike"], [time+1.586, "spike"],
                  [time+2.133, "horizontal"], [time+2.637, "horizontal"], [time+3.178, "horizontal"],
                  [time+3.694, "bomb"], [time+3.942, "bomb"],
                  [time+4.222, "spike"], [time+4.74, "spike"], [time+5.265, "spike"], [time+5.775, "spike"],
                  [time+6.307, "horizontal", {despawnRate: 3}], [time+6.826, "horizontal", {despawnRate: 3}], [time+7.336, "horizontal", {despawnRate: 3}]];
        
        if (difficulty !== "easy") {
            bg.push([time+1.036, "ring"], [time+3.096, "ring"], [time+5.175, "ring"], [time+7.246, "ring"]);
            
            if (difficulty === "hard") {
                for (let i = 0; i < 16; i+=2) bg.push([bg[i][0]+0.231, "vertical"]);
            }
            
            bg.push([time, "bomb", {size: 150, despawnRate: 3}], [time+2.07, "bomb", {size: 150, despawnRate: 3}],
                    [time+4.167, "bomb", {size: 150, despawnRate: 3}], [time+6.253, "bomb", {size: 150, despawnRate: 3}]);
        }
        return bg;
    }
    function deepSynth(time = 150.313, extras = "none") {
        dS = [[time, "vertical", {size: xMid, coords: [xMid/2, 0], spawnRate: 0.3, despawnRate: 3}],
              [time+1.029, "horizontal", {size: yMid, coords: [0, yMid/2], spawnRate: 0.3, despawnRate: 3}],
              [time+2.359, "bomb", {spawnRate: 0.7, despawnRate: 4}], [time+3.118, "bomb", {spawnRate: 0.7, despawnRate: 4}]];
        
        let duration = 3.995 - 3.137;
        if (extras === "leftSpikeWall" || extras === "rightSpikeWall") {
            let interval = (duration / 14);
            let margin = (GAME_HEIGHT-(30*14)) / 15; // 650 = (r*2 * 14) + 15n
            let xValue;
            
            if (extras === "leftSpikeWall") xValue = 10 * 1.501;
            else if (extras === "rightSpikeWall") xValue = GAME_WIDTH - 10 * 1.501;
            for (let i = 0; i < 14; i++) {
                dS.push([time+3.137 + (interval*i), "spike", {size: 10, speed: 5, coords: [xValue, margin*(i+1) + 30*i + 15], spawnRate: 0.5}]);
            }
        }
        else if (extras === "encirclingSpikes") {
            let interval = (duration / 8);
            let intIndex = 0;
            ["bl", "lm", "tl", "tm", "tr", "rm", "br", "bm"].forEach(spawn => {
                dS.push([time+3.137 + (interval*intIndex), "spike", {size: 25, speed: 3.5, location: spawn, spawnRate: 0.5}]);
                intIndex++;
            })
            }
        return dS;
    }
    
    music = {var: divine, name: "Divine", artist: "SOTAREKO",
             color: "rgb(223, 255, 156)", subColor: "rgb(224, 255, 232)", textColor: "rgb(255, 165, 252)",
             timestamps: [
                 [16.730, "vertical", {size: 80, coords: [140, 0]}], [17.268, "vertical", {size: 80, coords: [360, 0]}], [17.835, "vertical", {size: 80, coords: [580, 0]}],
                 [18.400, "horizontal", {size: 80, coords: [0, 490/3]}], [18.900, "horizontal", {size: 80, coords: [0, 2*490/3 + 80]}],
                 [19.400, "vertical", {size: 200, coords: [50, 0]}], [19.670, "vertical", {size: 200, coords: [300, 0]}], [19.950, "vertical", {size: 200, coords: [550, 0]}],
                 [20.430, "horizontal", {size: 200, coords: [0, 250/3]}], [20.800, "horizontal", {size: 200, coords: [0, 2*250/3 + 200]}],
                 [23.550, "vertical", {size: 100, coords: [0, 0]}], [23.800, "horizontal", {size: 100, coords: [0, 0]}],
                 [24.075, "vertical", {size: 100, coords: [700, 0]}], [24.592, "horizontal", {size: 100, coords: [0, 550]}],
                 [25.100, "vertical", {size: 100, coords: [100, 0]}], [25.688, "horizontal", {size: 100, coords: [0, 100]}],
                 [26.175, "vertical", {size: 100, coords: [600, 0]}], [26.700, "horizontal", {size: 100, coords: [0, 450]}],
                 [27.220, "bomb", {size: 300, coords: [xMid, yMid], spawnRate: 0.3, despawnRate: 2.5}],
                 [29.246, "ring", {size: 400, coords: [xMid, yMid], spawnRate: 0.3, despawnRate: 2.2}], // shrink
                 [30.050, "ring", {size: 200, coords: [xMid, yMid], spawnRate: 0.4, despawnRate: 2.5}],
                 [30.800, "ring", {size: 75, coords: [xMid, yMid], spawnRate: 0.5, despawnRate: 3}],
                 [32.093, "bomb", {size: 100, coords: [xMid, yMid], spawnRate: 0.3, despawnRate: 3}], // growth
                 [32.630, "bomb", {size: 250, coords: [xMid, yMid], spawnRate: 0.3, despawnRate: 3}],
                 [32.930, "bomb", {size: 350, coords: [xMid, yMid], spawnRate: 0.3, despawnRate: 3}],
                 [32.631, "spike", {size: 20, speed: 3.5, location: "tl", spawnRate: 0.8, despawnRate: 3}],
                 [32.632, "spike", {size: 20, speed: 3.5, location: "tr", spawnRate: 0.5, despawnRate: 3}],
                 [32.931, "spike", {size: 20, speed: 3.5, location: "br", spawnRate: 0.4, despawnRate: 3}],
                 [73.081, "vertical", {size: GAME_WIDTH/2, coords: [0, 0], spawnRate: 1, despawnRate: 5}], // 4 walls
                 [73.610, "vertical", {size: GAME_WIDTH/2, coords: [xMid, 0], spawnRate: 1, despawnRate: 5}],
                 [74.125, "horizontal", {size: GAME_HEIGHT/2, coords: [0, yMid], spawnRate: 1, despawnRate: 5}],
                 [74.646, "horizontal", {size: GAME_HEIGHT/2, coords: [0, 0], spawnRate: 1, despawnRate: 5}],
                 [85.341, "vertical", {size: 200, coords: ["player"]}], [87.219, "vertical", {size: 200, coords: ["player"]}],
                 [87.400, "horizontal", {size: 200, coords: ["player"]}], [89.331, "horizontal", {size: 200, coords: ["player"]}],
                 [140.914, "bomb", {size: 500, coords: [GAME_WIDTH, GAME_HEIGHT], spawnRate: 1, despawnRate: 5}], // 2 corner semi circles
                 [141.458, "bomb", {size: 500, coords: [0, 0], spawnRate: 1, despawnRate: 5}],
                 [141.957, "spike", {size: 50, location: "bl", spawnRate: 0.3, despawnRate: 3}], // spike triangle
                 [142.482, "spike", {size: 50, location: "tm", spawnRate: 0.3, despawnRate: 3}],
                 [142.986, "spike", {size: 50, location: "br", spawnRate: 0.3, despawnRate: 3}],
                 [192.047, "text", {text: "Thank", coords: [265, 100], despawnRate: 0.2}], // thanks
                 [193.098, "text", {text: "You", coords: [440, 100], despawnRate: 0.3}],
                 [194.134, "text", {text: "For", coords: [260, 175], despawnRate: 0.2}],
                 [195.186, "text", {text: "Playing", coords: [360, 175], despawnRate: 0.3}],
                 [196.226, "text", {text: "This", coords: [285, 100], despawnRate: 0.2}],
                 [197.391, "text", {text: "Was", coords: [400, 100], despawnRate: 0.3}],
                 [198.577, "text", {text: "Dodge", coords: [280, 175], despawnRate: 0}],
                 [199.300, "text", {text: ".io", coords: [443, 175], despawnRate: 0}],
            ],
    };
    music.timestamps = music.timestamps.concat(lessThan(33.590));
    music.timestamps = music.timestamps.concat(lessThan(37.760));
    music.timestamps = music.timestamps.concat(lessThan(41.930));
    music.timestamps = music.timestamps.concat(lessThan(46.123));
    let spb = 60/115; // bpm = 115
    let startBeat = 50.102;
    let beats = 29; // beam sync to increase difficulty
    for (let i = startBeat; i < startBeat-0.01 + spb*beats; i+=spb) music.timestamps.push([i, "beam", {despawnRate: 3}]);
    music.timestamps = music.timestamps.concat(lessThan(50.814));
    music.timestamps = music.timestamps.concat(lessThan(54.460));
    music.timestamps = music.timestamps.concat(lessThan(58.620));
    // music.timestamps = music.timestamps.concat(lessThan(62.810)); excluded
    
    // ring spam
    startBeat = 66.797;
    beats = 12;
    music.timestamps.push([64.749, "ring", {size: 450, invincible: true, coords: [xMid, yMid], spawnRate: 0.325}]);
    for (let i = startBeat; i < startBeat-0.01 + spb*(beats-1); i+=spb) {
        music.timestamps.push([i-0.2, "ring", {size: 450, invincible: true, coords: [xMid, yMid], spawnRate: 1}]);
    }
    
    music.timestamps = music.timestamps.concat(heyAh_heyHi(66.920));
    music.timestamps = music.timestamps.concat(heyAh_heyHi(69.020));
    music.timestamps = music.timestamps.concat(heyAh_heyHi(71.120));
    
    // 73.081-74.646 4 half-walls
    // 4 corner circles
    startBeat = 75.250;
    beats = 16;
    let corner = 1;
    let coords = {1:[0, 0], 2:[GAME_WIDTH, 0], 3:[GAME_WIDTH, GAME_HEIGHT], 4:[0, GAME_HEIGHT]};
    for (let i = startBeat; i < startBeat-0.01 + spb*beats; i+=spb) {
        music.timestamps.push([i-0.2, "bomb", {size: 300, coords: coords[corner], spawnRate: 1}]);
        corner++;
        if (corner > 4) corner = 1;
    }
    
    music.timestamps = music.timestamps.concat(heyAh_heyHi(75.250));
    music.timestamps = music.timestamps.concat(heyAh_heyHi(77.350));
    music.timestamps = music.timestamps.concat(heyAh_heyHi(79.434));
    music.timestamps = music.timestamps.concat(heyAh_heyHi(81.521));
    music.timestamps = music.timestamps.concat(bg16Beat(91.834));
    music.timestamps = music.timestamps.concat(bg16Beat(100.233, "medium"));
    music.timestamps = music.timestamps.concat(bg16Beat(108.580, "hard"));
    music.timestamps = music.timestamps.concat(bg16Beat(116.926, "medium"));
    music.timestamps = music.timestamps.concat(lessThan(117.032));
    music.timestamps = music.timestamps.concat(lessThan(121.180));
    music.timestamps = music.timestamps.concat(lessThan(125.376));
    // music.timestamps = music.timestamps.concat(bg16Beat(125.276, "medium")); excluded
    // music.timestamps = music.timestamps.concat(lessThan(129.568)); excluded
    // music.timestamps = music.timestamps.concat(lessThan(133.700)); excluded
    
    // 4 Walls spam
    startBeat = 133.619;
    beats = 15;
    let side = 1;
    coords = {1:[0, 0, "vertical", xMid], 2:[0, 0, "horizontal", yMid],
              3:[xMid, 0, "vertical", xMid], 4:[0, yMid, "horizontal", yMid]};
    music.timestamps.push([131.571, "vertical", {size: GAME_WIDTH/2, coords: [0, 0], spawnRate: 0.325, despawnRate: 5,}]);
    for (let i = startBeat; i < startBeat-0.01 + spb*(beats-1); i+=spb) {
        side++;
        if (side > 4) side = 1;
        music.timestamps.push([i-0.2, coords[side][2], {size: coords[side][3], coords: coords[side], spawnRate: 1, despawnRate: 5,}]);
    }
    // 140.914-141.458 2 corner circles
    music.timestamps = music.timestamps.concat(lessThan(142.062));
    // music.timestamps = music.timestamps.concat(lessThan(146.222)); excluded
    
    // Bomb Encircling
    startBeat = 146.135;
    beats = 3;
    let w = 300;
    for (let i = startBeat; i < startBeat-0.01 + spb*beats; i+=spb) {
        music.timestamps.push([i, "bomb", {size: w, coords: [0, 0], spawnRate: 0.3, despawnRate: 0.7,}]);
        music.timestamps.push([i, "bomb", {size: w, coords: [GAME_WIDTH, 0], spawnRate: 0.3, despawnRate: 0.7,}]);
        music.timestamps.push([i, "bomb", {size: w, coords: [GAME_WIDTH, GAME_HEIGHT], spawnRate: 0.3, despawnRate: 0.7,}]);
        music.timestamps.push([i, "bomb", {size: w, coords: [0, GAME_HEIGHT], spawnRate: 0.3, despawnRate: 0.7,}]);
        w += 80;
    }
    
    music.timestamps = music.timestamps.concat(deepSynth(150.313));
    music.timestamps = music.timestamps.concat(deepSynth(154.472, "leftSpikeWall"));
    music.timestamps = music.timestamps.concat(deepSynth(158.662));
    music.timestamps = music.timestamps.concat(deepSynth(162.985, "rightSpikeWall"));
    music.timestamps = music.timestamps.concat(deepSynth(167.002));
    music.timestamps = music.timestamps.concat(deepSynth(171.190, "encirclingSpikes"));
    music.timestamps = music.timestamps.concat(deepSynth(175.353));
    music.timestamps = music.timestamps.concat(deepSynth(179.531));
    music.timestamps = music.timestamps.concat(deepSynth(183.669));
    music.timestamps = music.timestamps.concat(deepSynth(187.874));
    // music.timestamps = music.timestamps.concat(deepSynth(192.047)); excluded
    // music.timestamps = music.timestamps.concat(deepSynth(196.226)); excluded
    music.timestamps.forEach(ts => { ts[0] -= 0.025; });
    for (let i = 1; i < 16; i++) music.timestamps.unshift([i, "ring", {size: 40+(i-1)*25, invincible: true, coords: [xMid, yMid]}]);
}



