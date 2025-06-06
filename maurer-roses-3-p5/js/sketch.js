let params = { n: 6, d: 71, speed: 0.4 };
let roseBase = [];
let maurerPoints = [];
let intersections = [];
let playheadIndex = 0;
let roseRadius;
let feedbacks = [];
let synth;
let soundFiles = ['glitch_2.wav', 'glitch_1.wav', 'glitch_3.wav', 'hat_1.wav', 'hat_2.wav', 'tic_1.wav', 'tic_2.wav', 'tic_3.wav', 'tic_4.wav', 'tic_5.wav'];
let ticSounds = [];
let glitchSounds = [];
let ambience;
let rotationAngle = 0;
let intersectionCounter = 0;
let ambiencePanner;
let dragging = false;
let lastTouchX = 0;
let lastTouchY = 0;
let lastN = params.n;
let lastD = params.d;
let locked = false;
// let primaryColor = [0, 0, 0];
// let secondaryColor = [255, 255, 255];
let primaryColor = [255, 255, 255];
let secondaryColor = [0, 0, 0];
let glitchPulse = 0;
let glitchDuration = 200;
let glitchSizes = [];
let axisHighlightUntil = 0;


function preload() {
    for (let filename of soundFiles) {
        let sound = loadSound('sound/' + filename, () => {
            console.log(filename + ' loaded');
        }, (err) => {
            console.error('Error loading', filename, err);
        });

        if (filename.startsWith('tic_')) {
            sound.setVolume(3.0);
            ticSounds.push(sound);
        } else if (filename.startsWith('glitch_')) {
            sound.setVolume(1);
            glitchSounds.push(sound);
        }
    }

    // Ambiance de fond
    ambience = loadSound('sound/ambience.wav', () => {
        console.log('Ambience loaded');
    }, (err) => {
        console.error('Error loading ambience', err);
    });
}

function setup() {
    pixelDensity(2);
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    roseRadius = min(width, height) * 0.4;
    synth = new p5.MonoSynth();

    updateCurves();

    if (ambience && !ambience.isPlaying()) {
        ambience.setVolume(0.2);
        ambience.loop();
    }

}

function keyPressed() {
    if (keyCode === SHIFT) {
        locked = !locked;
        console.log("Locked:", locked);
    }
}



function updateParamsFromMouse() {
    if (locked) return;
    let centerX = width / 2;
    let centerY = height / 2;

    let relativeX = constrain(mouseX - centerX, -centerX, centerX);
    let relativeY = constrain(mouseY - centerY, -centerY, centerY);

    params.n = floor(map(relativeX, -centerX, centerX, 1, 20));
    params.d = floor(map(relativeY, -centerY, centerY, 1, 360));
}

function drawAxes() {
    push();

    let highlight = millis() < axisHighlightUntil;
    let roseCol = color(255, 80, 180);
    stroke(highlight ? color(0, 180, 255) : roseCol);
    strokeWeight(1.5);

    line(-width / 2, 0, width / 2, 0);
    line(0, -height / 2, 0, height / 2);

    fill(primaryColor);
    noStroke();
    ellipse(0, 0, 6);

    fill(primaryColor);
    textSize(12);
    textAlign(RIGHT, TOP);
    text("d", -10, -height / 2 + 10);
    textAlign(LEFT, BOTTOM);
    text("n", width / 2 - 10, -10);

    pop();
}


function updateCurves() {
    const n = params.n;
    const d = params.d;
    roseBase = [];
    maurerPoints = [];
    intersections = [];

    for (let theta = 0; theta < 360; theta++) {
        let k = theta * n;
        let r = roseRadius * sin(k);
        let x = r * cos(theta);
        let y = r * sin(theta);
        roseBase.push(createVector(x, y));
    }

    for (let i = 0; i < 360; i++) {
        let k = i * d;
        let r = roseRadius * sin(n * k);
        let x = r * cos(k);
        let y = r * sin(k);
        maurerPoints.push(createVector(x, y));
    }

    for (let i = 0; i < roseBase.length; i++) {
        let rbPt = roseBase[i];
        for (let mp of maurerPoints) {
            if (rbPt.dist(mp) < 1.5) {
                intersections.push({ pt: rbPt.copy(), index: i });
                break;
            }
        }
    }
}

function drawBackgroundBlob() {
    // Tâche flottante animée
    push();
    translate(width / 2, height / 2);
    let t = millis() * 0.0003;
    let baseRadius = roseRadius * 1.2 + 40 * sin(t * 2);
    let blobPoints = 18;
    noStroke();
    for (let i = 5; i > 0; i--) {
        let alpha = 30 * i;
        fill(120, 180, 255, alpha);
        beginShape();
        for (let a = 0; a < TWO_PI; a += TWO_PI / blobPoints) {
            let r = baseRadius + 30 * sin(a * 3 + t * 2 + i);
            let x = r * cos(a + t * 0.7 + i * 0.1);
            let y = r * sin(a + t * 0.7 + i * 0.1);
            vertex(x, y);
        }
        endShape(CLOSE);
    }
    pop();
}

function draw() {
    // --- FOND ANIMÉ ---
    background(secondaryColor);
    drawBackgroundBlob();

    updateParamsFromMouse();

    if (params.n !== lastN || params.d !== lastD) {
        updateCurves();
        lastN = params.n;
        lastD = params.d;
    }

    // MODULATION SON AMBIANCE
    if (ambience && ambience.isLoaded()) {
        let intersectionCount = intersections.length;

        // Spatialisation stéréo animée et accentuée
        let panCenter = map(intersectionCount, 0, 120, -0.7, 0.7, true);
        let panAmp = map(intersectionCount, 0, 120, 0.7, 1.0, true);
        let panSpeed = map(intersectionCount, 0, 120, 0.001, 0.03, true);
        let panOsc = sin(millis() * panSpeed) * panAmp;
        let pan = constrain(panCenter + panOsc, -1, 1);
        ambience.pan(pan);

        // Pitch (rate)
        let rate = map(intersectionCount, 0, 120, 0.7, 1.5, true);
        ambience.rate(rate);

        // Volume constant (plus de glitch ici)
        let baseVol = 0.18;
        ambience.setVolume(baseVol);


        if (!ambience.filter) {
            ambience.filter = new p5.LowPass();
            ambience.disconnect();
            ambience.connect(ambience.filter);
        }
        let freq = map(intersectionCount, 0, 120, 18000, 300, true);
        ambience.filter.freq(freq);
        ambience.filter.res(map(intersectionCount, 0, 120, 2, 8, true));
    }

    // Affichage des axes
    push();
    translate(width / 2, height / 2);
    drawAxes();
    pop();

    push();
    translate(width / 2, height / 2);
    rotate(rotationAngle);
    rotationAngle += 0.02;

    // --- GLOW ROSE DE BASE ---
    for (let g = 8; g > 0; g--) {
        stroke(120, 180, 255, 10 + 10 * g);
        strokeWeight(16 - g * 2);
        noFill();
        beginShape();
        for (let v of roseBase) vertex(v.x, v.y);
        endShape(CLOSE);
    }

    // Rose de base
    noFill();
    stroke(200);
    strokeWeight(2);
    beginShape();
    for (let v of roseBase) vertex(v.x, v.y);
    endShape(CLOSE);

    // --- GLOW MAURER CURVE ---
    for (let g = 6; g > 0; g--) {
        stroke(255, 80, 180, 10 + 10 * g);
        strokeWeight(10 - g);
        noFill();
        beginShape();
        for (let v of maurerPoints) vertex(v.x, v.y);
        endShape();
    }

    // Maurer curve
    stroke(255);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let v of maurerPoints) vertex(v.x, v.y);
    endShape();

    for (let i = feedbacks.length - 1; i >= 0; i--) {
        let fb = feedbacks[i];
        let t = (millis() - fb.start) / fb.duration;
        if (t > 1) {
            feedbacks.splice(i, 1);
            continue;
        }

        let alpha = map(1 - t, 0, 1, 0, 255);
        let baseRadius, maxRadius, sw, colStroke, colFill;

        if (fb.type === 'glitch') {
            baseRadius = 80;
            maxRadius = 220;
            sw = 24;
            colStroke = color(255, 80, 180, alpha);
            colFill = color(255, 80, 180, alpha * 0.18);
            for (let g = 6; g > 0; g--) {
                stroke(color(255, 80, 180, alpha * 0.07 * g));
                strokeWeight(sw + g * 14);
                noFill();
                ellipse(fb.x + fb.offset.x, fb.y + fb.offset.y, map(t, 0, 1, baseRadius, maxRadius) + g * 14);
            }
        } else {
            // Tick : bleu vif
            baseRadius = 40;
            maxRadius = 120;
            sw = 8;
            colStroke = color(0, 180, 255, alpha);
            colFill = color(0, 180, 255, alpha * 0.35);
        }

        let radius = map(t, 0, 1, baseRadius, maxRadius);

        strokeWeight(sw);
        stroke(colStroke);
        fill(colFill);
        ellipse(fb.x + fb.offset.x, fb.y + fb.offset.y, radius);
    }

    noStroke();
    let glitchActive = (millis() - glitchPulse < glitchDuration);

    for (let i = 0; i < intersections.length; i++) {
        let pt = intersections[i].pt;
        let size = glitchActive ? glitchSizes[i] : 8;
        fill(glitchActive ? [0, 0, 0] : primaryColor);
        ellipse(pt.x, pt.y, size);
    }

    let idx = playheadIndex % roseBase.length;
    let playPt = roseBase[floor(idx)];
    fill(primaryColor);
    ellipse(playPt.x, playPt.y, 12);

    for (let inter of intersections) {
        if (inter.index === floor(idx)) {
            playNote(inter);
            break;
        }
    }

    pop();

    playheadIndex = (playheadIndex + params.speed) % roseBase.length;

    // UI
    push();
    fill(primaryColor);
    noStroke();
    textSize(14);
    textAlign(LEFT, TOP);
    text(`n = ${params.n}\nd = ${params.d}`, 10, 10);
    pop();
}

function playNote(inter) {
    if (inter.lastPlayed && millis() - inter.lastPlayed < 100) return;
    inter.lastPlayed = millis();

    let isGlitch = false;
    let intersectionCount = intersections.length;

    // Son tic
    if (ticSounds.length > 0) {
        let s = random(ticSounds);
        s.rate(1);
        s.setVolume(3.0);
        s.play();
        axisHighlightUntil = millis() + 150;

        if (intersectionCount > 50) {
            for (let i = 0; i < map(intersectionCount, 20, 60, 2, 6, true); i++) {
                let s2 = random(ticSounds);
                s2.rate(random(0.7, 1.4));
                s2.setVolume(random(1.5, 3.5));
                s2.play();
            }
        }
    }

    intersectionCounter++;


    if (intersectionCounter % 12 === 0 && glitchSounds.length > 0) {
        let g = random(glitchSounds);
        g.rate(1);
        g.setVolume(1);
        g.play();
        isGlitch = true;
        glitchPulse = millis();
        glitchSizes = intersections.map(() => random(5, 28));

        if (intersectionCount > 20) {
            for (let i = 0; i < map(intersectionCount, 20, 60, 2, 5, true); i++) {
                let g2 = random(glitchSounds);
                g2.rate(random(0.7, 1.3));
                g2.setVolume(random(0.7, 1.5));
                g2.play();
            }
        }
    }

    let offset = createVector(0, 0);
    if (isGlitch) {
        let dir = floor(random(4));
        let shift = 10;
        switch (dir) {
            case 0: offset = createVector(shift, 0); break;
            case 1: offset = createVector(-shift, 0); break;
            case 2: offset = createVector(0, shift); break;
            case 3: offset = createVector(0, -shift); break;
        }
    }

    feedbacks.push({
        x: inter.pt.x,
        y: inter.pt.y,
        offset: offset,
        start: millis(),
        duration: isGlitch ? 600 : 300,
        type: isGlitch ? 'glitch' : 'normal'
    });

    if (isGlitch) {
        console.log("Adding glitch feedback");
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    roseRadius = min(width, height) * 0.4;
    updateCurves();
}