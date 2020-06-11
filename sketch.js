const BOID_SIZE = 15.0;
const MAX_SPEED = 5;
const MAX_FORCE = 0.05;

let boids;
let longerLength;

function setup() {
    frameRate(30);

    createCanvas(windowWidth, windowHeight);
    longerLength = width > height ? width : height;

    separationCheck = createCheckbox("Separation");
    separationCheck.addClass("separation");
    alignmentCheck = createCheckbox("Alignment");
    alignmentCheck.addClass("alignment");
    cohesionCheck = createCheckbox("Cohesion");
    cohesionCheck.addClass("cohesion");
    followCheck = createCheckbox("Follow");
    followCheck.addClass("follow");

    boids = [];
    for(let i = 0; i < 69; i++) {
        boids.push(new Boid(random(5, 95), random(5, 95)));
    }
}

function draw() {
    background(135, 206, 235);
    for(let i = 0; i < boids.length; i++)
        boids[i].render();
    if(followCheck.checked()) {
        push();
        noStroke();
        fill(212, 175, 55);
        translate(mouseX, mouseY);
        circle(0, 0, BOID_SIZE);
        pop();
    }
    push();
    fill(235, 200);
    rect(0, 0, 120, 100);
    pop();  
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    longerLength = width > height ? width : height;
}

class Boid {
    constructor(x, y) {
        this.acceleration = createVector(0, 0);
        this.velocity = p5.Vector.random2D();
        this.position = createVector(x, y);
    }

    render() {
        push();
        fill(0, 175);
        // Map the position vector so there's a constant coordinate system even if window resizes
        let xCanvas = map(this.position.x, 0, 100, 0, width);
        let yCanvas = map(this.position.y, 0, 100, 0, height);
        translate(xCanvas, yCanvas);
        if(followCheck.checked()) {
            let temp = createVector(mouseX - xCanvas, mouseY - yCanvas);
            rotate(temp.heading());
        } else {
            rotate(this.velocity.heading());
        }
        triangle(-BOID_SIZE, BOID_SIZE/3, -BOID_SIZE, -BOID_SIZE/3, 0, 0);
        pop();
    }
}