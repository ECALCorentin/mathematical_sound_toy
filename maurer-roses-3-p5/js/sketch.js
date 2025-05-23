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
let primaryColor = [0, 0, 0];
let secondaryColor = [255, 255, 255];
let glitchPulse = 0;
let glitchDuration = 200;
let glitchSizes = [];


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

    // Lecture du son d'ambiance
    if (ambience && !ambience.isPlaying()) {
        ambience.setVolume(0.08); // Volume faible
        ambience.loop(); // Lecture en boucle
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
    stroke(150);
    strokeWeight(1.5);

    line(-width / 2, 0, width / 2, 0);

    line(0, -height / 2, 0, height / 2);

    fill(primaryColor);
    noStroke();
    ellipse(0, 0, 6);


    fill(primaryColor);
    textSize(12);
    textAlign(RIGHT, TOP);
    text("d", -10, -height / 2 + 10); // Axe Y
    textAlign(LEFT, BOTTOM);
    text("n", width / 2 - 10, -10);  // Axe X
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

function draw() {
    background(secondaryColor);

    updateParamsFromMouse();

    if (params.n !== lastN || params.d !== lastD) {
        updateCurves();
        lastN = params.n;
        lastD = params.d;
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

    // Rose de base
    noFill();
    stroke(200);
    beginShape();
    for (let v of roseBase) vertex(v.x, v.y);
    endShape(CLOSE);

    // Maurer curve
    stroke(0);
    noFill();
    beginShape();
    for (let v of maurerPoints) vertex(v.x, v.y);
    endShape();

    // === FEEDBACKS EN PREMIER (avant les points noirs) ===
    for (let i = feedbacks.length - 1; i >= 0; i--) {
        let fb = feedbacks[i];
        let t = (millis() - fb.start) / fb.duration;
        if (t > 1) {
            feedbacks.splice(i, 1);
            continue;
        }

        let alpha = map(1 - t, 0, 1, 0, 255);
        let radius = map(t, 0, 1, fb.type === 'glitch' ? 20 : 10, fb.type === 'glitch' ? 60 : 40);

        strokeWeight(fb.type === 'glitch' ? 4 : 2);
        stroke(fb.type === 'glitch' ? color(255, 0, 0, alpha) : color(0, 255, 0, alpha));
        fill(fb.type === 'glitch' ? color(255, 0, 0, alpha * 0.3) : color(0, 255, 0, alpha * 0.2));
        ellipse(fb.x + fb.offset.x, fb.y + fb.offset.y, radius);
    }

    // === POINTS D'INTERSECTION PAR-DESSUS ===
    noStroke();
    let glitchActive = (millis() - glitchPulse < glitchDuration);

    for (let i = 0; i < intersections.length; i++) {
        let pt = intersections[i].pt;
        let size = glitchActive ? glitchSizes[i] : 8;
        fill(glitchActive ? [0, 0, 0] : primaryColor);
        ellipse(pt.x, pt.y, size);
    }

    // Tête de lecture
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

    // Son tic
    if (ticSounds.length > 0) {
        let s = random(ticSounds);
        s.play();
    }

    intersectionCounter++;

    // Tous les 12 coups : son glitch
    if (intersectionCounter % 12 === 0 && glitchSounds.length > 0) {
        let g = random(glitchSounds);
        g.play();
        isGlitch = true;
        glitchPulse = millis();
        glitchSizes = intersections.map(() => random(12, 28)) // Déclenche le grossissement global
    }


    // Feedback visuel
    let offset = createVector(0, 0);
    if (isGlitch) {
        // Déplacement aléatoire
        let dir = floor(random(4));
        let shift = 10;
        switch (dir) {
            case 0: offset = createVector(shift, 0); break;      // droite
            case 1: offset = createVector(-shift, 0); break;     // gauche
            case 2: offset = createVector(0, shift); break;      // bas
            case 3: offset = createVector(0, -shift); break;     // haut
        }
    }

    feedbacks.push({
        x: inter.pt.x,
        y: inter.pt.y,
        offset: offset,
        start: millis(),
        duration: 300,
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
