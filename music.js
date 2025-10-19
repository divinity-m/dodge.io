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
                resetBgVars();
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

                    if (danger[rate] < max && now - eventHorizon.lastUsed < 4200) danger[rate] += max/50;
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
