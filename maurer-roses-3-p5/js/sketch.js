let params = { n: 6, d: 71, speed: 1 };
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

function preload() {
    for (let filename of soundFiles) {
        let sound = loadSound('sound/' + filename, () => {
            console.log(filename + ' loaded');
        }, (err) => {
            console.error('Error loading', filename, err);
        });

        if (filename.startsWith('tic_')) {
            ticSounds.push(sound);
        } else if (filename.startsWith('glitch_')) {
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

    const pane = new Tweakpane.Pane();
    pane.addInput(params, 'n', { min: 1, max: 20, step: 1 }).on('change', updateCurves);
    pane.addInput(params, 'd', { min: 1, max: 360, step: 1 }).on('change', updateCurves);
    pane.addInput(params, 'speed', { min: 0.1, max: 2, step: 0.1 });

    updateCurves();

    // Lecture du son d'ambiance
    if (ambience && !ambience.isPlaying()) {
        ambience.setVolume(0.08); // Volume faible
        ambience.loop(); // Lecture en boucle
    }

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
    background(255);
    rotationAngle += 0.8;
    translate(width / 2, height / 2);
    rotate(radians(rotationAngle));

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

    // Points d'intersection
    fill(0);
    noStroke();
    for (let pt of intersections) ellipse(pt.pt.x, pt.pt.y, 8);

    // Tête de lecture
    let idx = playheadIndex % roseBase.length;
    let playPt = roseBase[floor(idx)];
    fill(0);
    ellipse(playPt.x, playPt.y, 12);

    // Détection des intersections
    for (let inter of intersections) {
        if (inter.index === floor(idx)) {
            playNote(inter);
            break;
        }
    }

    // Feedbacks visuels
    for (let i = feedbacks.length - 1; i >= 0; i--) {
        let fb = feedbacks[i];
        let t = (millis() - fb.start) / fb.duration;
        if (t > 1) {
            feedbacks.splice(i, 1);
            continue;
        }
        let alpha = map(1 - t, 0, 1, 0, 255);
        let radius = map(t, 0, 1, 10, 40);
        noFill();
        stroke(0, 255, 0, alpha);
        strokeWeight(2);
        ellipse(fb.x, fb.y, radius);
    }

    playheadIndex = (playheadIndex + params.speed) % roseBase.length;
}

function playNote(inter) {
    if (inter.lastPlayed && millis() - inter.lastPlayed < 100) return;
    inter.lastPlayed = millis();

    // Son tic
    if (ticSounds.length > 0) {
        let s = random(ticSounds);
        s.play();
    }

    intersectionCounter++;

    // Tous les 20 coups : son glitch
    if (intersectionCounter % 2 === 0 && glitchSounds.length > 0) {
        let g = random(glitchSounds);
        g.play();
    }

    // Feedback visuel
    feedbacks.push({
        x: inter.pt.x,
        y: inter.pt.y,
        start: millis(),
        duration: 300
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    roseRadius = min(width, height) * 0.4;
    updateCurves();
}
