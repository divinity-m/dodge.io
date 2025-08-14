console.log("location");// DODGE.IO - MUSIC.JS
function restartMusicMode() {
    allDangers = [];
    player.lives = 3;
    player.hit = 0;
    musicVolume = Math.floor((settings.musicSliderX - 165) / 1.5);
    sfxVolume = Math.floor((settings.sfxSliderX - 152) / 1.5);
    sharpPop.volume = sfxVolume/100;
    music.var.volume = musicVolume/100;
    music.var.currentTime = 0;
    music.promise = music.var.play();
    music.timestamps = [...music.backUpTS];
    timeLeft = (music.var.duration - music.var.currentTime).toFixed(2);
    dash.lastEnded = 0;
    shockwave.lastEnded = 0;
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
        // Level Percentage
        let percentage = Math.floor(music.var.currentTime / music.var.duration * 100);
        if (music.name === "Alarm 9") highscore.limbo = percentage;
        if (music.name === "Astral Projection") highscore.andromeda = percentage;
        //if (music.name === "Divine") highscore.divine = percentage;

        // Rect Variables
        let exitX = 150;
        let exitY = (cnv.height/2 - 100);
        let inExitRect = player.x + player.r <= exitX + 200 && player.x - player.r >= exitX && player.y + player.r <= exitY + 200 && player.y - player.r >= exitY;
        let redoX = 450;
        let redoY = (cnv.height/2 - 100);
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
        
        ctx.textAlign = "center";
        ctx.font = "30px Verdana";
        // Exit Rect Conditional
        ctx.fillStyle = "rgb(235, 235, 235)";
        if (inExitRect) {
            ctx.fillText(`Exiting In`, 250, cnv.height/2 - 25);
            ctx.fillText(`${Math.ceil(3 - (now-startTime)/1000)}`, 250, cnv.height/2 + 25);
            if (now - startTime >= 3000) {
                music = {var: aNewStart, name: "A New Start", artist: "Thygan Buch"};
                music.var.currentTime = 0;
                music.promise = music.var.play();
                gameState = "startScreen";
                innerGameState = "mainMenu";
            }
        }
        else {
            ctx.fillText("Level", 250, cnv.height/2 - 25);
            if (timeLeft <= 0) ctx.fillText("Complete", 250, cnv.height/2 + 25);
            if (innerGameState === "musicModeFail") ctx.fillText("Failed", 250, cnv.height/2 + 25);
        }
        
        // Redo Rect conditional
        ctx.fillStyle = music.textColor;
        if (inRedoRect) {
            ctx.fillText(`Restarting In`, 550, cnv.height/2 - 25);
            ctx.fillText(`${Math.ceil(3 - (now-startTime)/1000)}`, 550, cnv.height/2 + 25);
            if (now - startTime >= 3000) restartMusicMode();
        }
        else {
            ctx.fillText("Restart", 550, cnv.height/2 - 25);
            ctx.fillText("Level", 550, cnv.height/2 + 25);
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
        x: Math.random() * cnv.width, y: Math.random() * cnv.height,
        w: (Math.random() * 20) + 80, h: (Math.random() * 20) + 50,
        spawnRate: 0.25, baseSpawnRate: 0.25, despawnRate: 2,
        colorValue: 185,
        get color() {
            return `rgb(${this.colorValue}, ${this.colorValue}, ${this.colorValue})`;
        },
    }
    if (beam.variant > 0.5) beam.variant = "vertical";
    else beam.variant = "horizontal";
    if (variant !== "none") beam.variant = variant;
    allDangers.unshift(beam);
    return beam;
}

function createCircle(variant="none") {
    let circle = {
        type: "circle",
        variant: Math.random(),
        x: Math.random() * cnv.width, y: Math.random() * cnv.height, r: (Math.random() * 40) + 80,
        spawnRate: 0.25, baseSpawnRate: 0.25, despawnRate: 2,
        colorValue: 185,
        get color() {
            return `rgb(${this.colorValue}, ${this.colorValue}, ${this.colorValue})`;
        },
    }
    circle.lineWidth = circle.r
    if (circle.variant > 0.5) circle.variant = "bomb";
    else circle.variant = "ring";
    if (variant !== "none") circle.variant = variant;
    allDangers.unshift(circle);
    return circle;
}

function createSpike(variant="none") {
    let spike = {
        type: "spike",
        variant: "none",
        x: Math.random() * cnv.width, y: Math.random() * cnv.height, r: (Math.random() * 10) + 10,
        rotate: 0, 
        spawnRate: 0.5, baseSpawnRate: 0.5, despawnRate: 2,
        colorValue: 185,
        get color() {
            return `rgb(${this.colorValue}, ${this.colorValue}, ${this.colorValue})`;
        },
        get speed() {
            return 2.5 + 2 * (music.var.currentTime/music.var.duration);
        },
        launched: false,
        get reachedWall() {
            if (this.x - this.r * 1.5 < 0 || this.x + this.r * 1.5 > cnv.width ||
                this.y - this.r * 1.5 < 0 || this.y + this.r * 1.5 > cnv.height && this.launched) {
                return true
            }
            else return false
        },
    }
    if (variant !== "none") spike.variant = variant;
    allDangers.unshift(spike);
    return spike;
}

function spawnAndDrawDanger() {
    // Danger Spawning
    if (music.timestamps.length > 0) {
        for (let i = music.timestamps.length-1; i >= 0; i--) {
            const timestamp = music.timestamps[i][0];
            const dangerType = music.timestamps[i][1];
            const modifiers = music.timestamps[i][2];
            if (music.var.currentTime >= timestamp) {
                if (dangerType === "beam" || dangerType === "horizontal" || dangerType === "vertical") {
                    createBeam();
                    if (modifiers?.size) { allDangers[0].w = modifiers.size; allDangers[0].h = modifiers.size; }
                    
                    if (dangerType === "vertical") allDangers[0].variant = "vertical";
                    else if (dangerType === "horizontal") allDangers[0].variant = "horizontal";
                    
                    // determines the beams x value based off the timestamp
                    let xMulti = Math.floor(timestamp*100/cnv.width);
                    allDangers[0].x = (timestamp*100)-(cnv.width*xMulti);
                    
                    // determines the beams y value based off the timestamp
                    let yMulti = Math.floor(timestamp*100/cnv.height);
                    allDangers[0].y = (timestamp*100)-(cnv.height*yMulti);
                } else if (dangerType === "circle" || dangerType === "bomb" || dangerType === "ring") {
                    createCircle();
                    if (modifiers?.size) allDangers[0].r = modifiers.size;
                    allDangers[0].lineWidth = allDangers[0].r;
                    
                    if (dangerType === "bomb") allDangers[0].variant = "bomb";
                    else if (dangerType === "ring") allDangers[0].variant = "ring";
        
                    // the circle's x and y will mimic the players
                    allDangers[0].x = player.x;
                    allDangers[0].y = player.y;
                } else if (dangerType === "spike") {
                    createSpike();
                    if (modifiers?.size) allDangers[0].r = modifiers.size;
                    const radiusSpace = allDangers[0].r * 1.501;
                    
                    const location = modifiers?.location;
                    // spikes spawn on the edge of the walls
                    if (!location) {
                        const rand = Math.random();
                        if (rand < 0.25) allDangers[0].x = radiusSpace;
                        else if (rand < 0.5) allDangers[0].x = cnv.width - radiusSpace;
                        else if (rand < 0.75) allDangers[0].y = radiusSpace;
                        else if (rand < 1) allDangers[0].y = cnv.height - radiusSpace;
                    } else {
                        locations = {tl: [radiusSpace, radiusSpace], tr: [cnv.width-radiusSpace, radiusSpace],
                                     bl: [radiusSpace, cnv.height-radiusSpace], br: [cnv.width-radiusSpace, cnv.height-radiusSpace],
                                     tm: [cnv.width/2, radiusSpace], lm: [radiusSpace, cnv.height/2],
                                     bm: [cnv.width/2, cnv.height-radiusSpace], rm: [cnv.width-radiusSpace, cnv.height/2]}
                        
                        if (locations?.[location]) {
                            allDangers[0].x = locations[location][0];
                            allDangers[0].y = locations[location][1];
                        }
                    }
                    if (modifiers?.speed) {
                        Object.defineProperty(allDangers[0], "speed", {
                            get() {
                                return modifiers.speed;
                            }
                        })
                    }
                }
                if (modifiers?.coords) { allDangers[0].x = modifiers.coords[0]; allDangers[0].y = modifiers.coords[1]; }
                if (modifiers?.spawnRate) allDangers[0].spawnRate = modifiers.spawnRate;
                if (modifiers?.despawnRate) allDangers[0].despawnRate = modifiers.despawnRate;
                
                music.timestamps.splice(i, 1);
            }
        }
    }
    // Danger Drawing
    allDangers.forEach(danger => {
        ctx.fillStyle = danger.color;
        ctx.strokeStyle = danger.color;
        // colorValue
        if (danger.colorValue >= 255 && danger.type !== "spike") danger.despawn = true;
        if (danger.colorValue < 255 &&
            (
            (!danger?.despawn && danger.type !== "spike") || (!danger?.reachedWall && danger.type === "spike")
            )
           ) danger.colorValue += danger.spawnRate;
        if (danger.colorValue > 185 && (danger?.despawn || danger?.reachedWall)) danger.colorValue -= danger.despawnRate;

        // shape
        if (danger.type === "beam") {
            if (danger.variant === "vertical") {
                ctx.fillRect(danger.x, 0, danger.w, cnv.height);
            }
            else if (danger.variant === "horizontal") {
                ctx.fillRect(0, danger.y, cnv.width, danger.h);
            }
        }
        else if (danger.type === "circle") {
            if (danger.variant === "bomb") {
                drawCircle(danger.x, danger.y, danger.r);
            }
            else if (danger.variant === "ring") {
                ctx.lineWidth = danger.lineWidth;
                drawCircle(danger.x, danger.y, danger.r, "stroke");
            }
        }
        else if (danger.type === "spike") {
            drawCircle(danger.x, danger.y, danger.r);
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
            
            danger.rotate += Math.PI/100;
            
            if (danger.colorValue >= 255 && !danger.launched) {
                const dx = player.x - danger.x;
                const dy = player.y - danger.y;
                const dist = Math.hypot(dx, dy);
                danger.movex = (dx/dist)*danger.speed;
                danger.movey = (dy/dist)*danger.speed;
                // top and bottom aim
                if ( (danger.y < danger.r*1.502 && player.y < danger.r*1.502) || 
                     (danger.y > cnv.height-danger.r*1.502 && player.y > cnv.height-danger.r*1.502) ) danger.movey = 0;
                // left and right aim
                else if ( (danger.x < danger.r*1.502 && player.x < danger.r*1.502) ||
                     (danger.x > cnv.width-danger.r*1.502 && player.x > cnv.width-danger.r*1.502) ) danger.movex = 0;;
                danger.baseMovex = danger.movex;
                danger.baseMovey = danger.movey;
                danger.facingAngle = Math.atan2(dx, dy);
                danger.launched = true;
            }
            
            if (danger.colorValue >= 255 && !danger.reachedWall) {
                danger.x += danger.movex;
                danger.y += danger.movey;
            }
        }
    })
    // Danger Rearranging
    allDangers.sort((a, b) => a.colorValue - b.colorValue);
    // Danger Deleting
    function keepDanger(danger) {
        if (danger.colorValue <= 185 && (danger?.reachedWall || danger?.despawn)) return false;
        else return true;
    }
    allDangers = allDangers.filter(danger => keepDanger(danger));
}

function musicCollisions() {
    allDangers.forEach(danger => {
        if (timeLeft > 0 && innerGameState !== "musicModeFail" && danger.colorValue >= 255 &&
            now-player.hit >= 1500 && !dash.activated && now-dash.lastEnded >= 300) {
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

        if (player.dodger === "jötunn") {
            let distance = Math.hypot(player.x-danger.x, player.y-danger.y) - player.r;
            
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
            
            const slowStart = 175;
            const slowEnd = 75;
            
            const maxDist = Math.max(distance, slowEnd);
            const factor = Math.min(1, (maxDist - slowEnd) / (slowStart - slowEnd));
            const slowFactor = 0.8 + 0.2*factor;
            const colorFactor = 0.9 + 0.1*factor;
            danger.spawnRate = danger.baseSpawnRate * slowFactor;

            Object.defineProperty(danger, "color", {
                get() {
                    return `rgb(${this.colorValue*colorFactor}, ${this.colorValue*colorFactor}, ${this.colorValue})`;
                }
            })
            
            if (danger?.launched) {
                danger.movex = danger.baseMovex * slowFactor;
                danger.movey = danger.baseMovex * slowFactor;
            }
        }
    })
    if (player.lives === 0 && innerGameState !== "musicModeFail" && innerGameState !== "mainMenu") {
        pauseAudio(music.promise, music.var);
        innerGameState = "musicModeFail";
    }
    
    // Draws player lives
    ctx.textAlign = "center";
    ctx.font = "20px Impact";
    ctx.fillStyle = player.subColor;
    ctx.fillText(player.lives, player.x, player.y + 6.5);
}
