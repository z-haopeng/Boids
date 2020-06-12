const BOID_SIZE = 15.0;
const MAX_SPEED = 2;
const MAX_FORCE = 0.1;

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
    for(let i = 0; i < 64; i++) {
        boids.push(new Boid(random(5, 95), random(5, 95)));
    }
}

function draw() {
    background(135, 206, 235);
    for(let i = 0; i < boids.length; i++)
        boids[i].run();
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

    run() {
        this.update();
        this.render();
    }

    update() {
        let neighborRadius = 10.0;
        if(separationCheck.checked()) {
            for(let i = 0; i < boids.length; i++) {
                if(boids[i] !== this && p5.Vector.sub(this.position, boids[i].position).mag() < neighborRadius) {
                    this.acceleration.add(createVector(this.position.x - boids[i].position.x, this.position.y - boids[i].position.y).limit(0.5));
                }
            }
        }

        if(followCheck.checked()) {
            let scaledMouseX = map(mouseX, 0, width, 0, 100);
            let scaledMouseY = map(mouseY, 0, height, 0, 100);
            this.acceleration.add(createVector(scaledMouseX - this.position.x, scaledMouseY - this.position.y).limit(1));
        }

        this.acceleration = this.acceleration.limit(MAX_FORCE);
        this.velocity.add(this.acceleration);

        this.velocity = this.velocity.limit(MAX_SPEED);
        this.position.add(this.velocity);

        // Add 100 to prevent values from becoming negative, since JavaScript modulus doesn't limit to positive results
        this.position.x = (this.position.x+100) % 100;
        this.position.y = (this.position.y+100) % 100;
    }

    render() {
        push();
        fill(0, 175);
        // Map the position vector so there's a constant coordinate system even if window resizes
        let xCanvas = map(this.position.x, 0, 100, 0, width);
        let yCanvas = map(this.position.y, 0, 100, 0, height);
        translate(xCanvas, yCanvas);
        rotate(this.velocity.heading());
        triangle(0, BOID_SIZE/3, 0, -BOID_SIZE/3, BOID_SIZE, 0);
        pop();
    }
}