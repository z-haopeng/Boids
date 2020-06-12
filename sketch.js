const MAX_SPEED = 1.2;
const MAX_FORCE = 0.08;

let BOID_SIZE;
let boids;
let longerLength;

function setup() {
    frameRate(30);

    createCanvas(windowWidth, windowHeight);
    longerLength = width > height ? width : height;
    BOID_SIZE = longerLength / 50;

    separationCheck = createCheckbox("Separation", true);
    separationCheck.addClass("separation");
    alignmentCheck = createCheckbox("Alignment", true);
    alignmentCheck.addClass("alignment");
    cohesionCheck = createCheckbox("Cohesion", true);
    cohesionCheck.addClass("cohesion");
    followCheck = createCheckbox("Follow");
    followCheck.addClass("follow");

    boids = [];
    for(let i = 0; i < 100; i++) {
        boids.push(new Boid(random(5, 95), random(5, 95)));
    }
}

function draw() {
    background(135, 206, 235);
    // Draw circle that follows the mouse
    if(followCheck.checked()) {
        push();
        noStroke();
        fill(212, 175, 55);
        translate(mouseX, mouseY);
        circle(0, 0, BOID_SIZE);
        pop();
    }
    for(let i = 0; i < boids.length; i++) {
        // Draw an area radius of 20.0 around Boid #0 and highlights it
        // Will usually appear as an ellipse due to stretching a square world to fit a rectangular window
        // if(i === 0) {
        //     push();
        //     noFill();
        //     translate(map(boids[i].position.x, 0, 100, 0, width), map(boids[i].position.y, 0, 100, 0, height));
        //     ellipse(0, 0, 0.4 * width, 0.4 * height);
        //     pop();
        //     boids[i].run(true);
        //     continue;
        // }
        boids[i].run(false);
    }
    // Draw rectangle that houses checkboxes
    push();
    fill(235, 200);
    rect(0, 0, 120, 100);
    pop();  
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    longerLength = width > height ? width : height;
    BOID_SIZE = longerLength * 15 / 800;
}

class Boid {
    constructor(x, y) {
        this.acceleration = createVector(0, 0);
        this.velocity = p5.Vector.random2D();
        this.position = createVector(x, y);
    }

    run(isHighlighted) {
        this.update();
        this.render(isHighlighted);
    }

    update() {
        // Define the max distance between Boids that can affect each other
        let neighborRadius = 20.0;
        // Sum of all of the forces acting on the Boid
        let force = createVector(0, 0);
        // Separation: average the vectors pointing away from all neighbors and apply force to Boid
        if(separationCheck.checked()) {
            let separateSum = createVector(0, 0);
            for(let i = 0; i < boids.length; i++) {
                let distance = p5.Vector.sub(this.position, boids[i].position).mag();
                if(boids[i] !== this && distance < neighborRadius) {
                    let temp = createVector(this.position.x - boids[i].position.x, this.position.y - boids[i].position.y).normalize();
                    separateSum.add(temp.mult(neighborRadius / distance / distance));
                }
            }
            force.add(separateSum.limit(MAX_FORCE));
        }
        // Alignment: average the velocities of all neighbors, then apply force in direction from this.velocity towards the average
        if(alignmentCheck.checked()) {
            let alignSum = createVector(0, 0);
            for(let i = 0; i < boids.length; i++) {
                if(boids[i] !== this && p5.Vector.sub(this.position, boids[i].position).mag() < neighborRadius) {
                    // Every vector is normalized so only direcction is captured
                    alignSum.add(boids[i].velocity.normalize());
                }
            }
            // Only apply a force if there are neighbors to align with
            if(alignSum.mag() !== 0)
                force.add(p5.Vector.sub(alignSum, this.velocity).limit(MAX_FORCE));
        }
        // Cohesion: average the positions of all neighbors, apply a force in direction from this.position towards the average
        if(cohesionCheck.checked()) {
            let coheseSum = createVector(0, 0);
            let count = 0;
            for(let i = 0; i < boids.length; i++) {
                if(boids[i] !== this && p5.Vector.sub(this.position, boids[i].position).mag() < neighborRadius) {
                    // No normalizing because we want exact coordinates
                    coheseSum.add(boids[i].position);
                    count++;
                }
            }
            if(coheseSum.mag() !== 0) {
                // Average position of all neighbors
                coheseSum = coheseSum.div(count);
                // Decrease cohesive force if the flock is following the mouse
                let multiplier = 1;
                if(followCheck.checked()) {multiplier *= 0.5}
                force.add(p5.Vector.sub(coheseSum, this.position).limit(MAX_FORCE * multiplier));
            }
        }
        // Follow: apply a force in the direction of the mouse's location
        if(followCheck.checked()) {
            let scaledMouseX = map(mouseX, 0, width, 0, 100);
            let scaledMouseY = map(mouseY, 0, height, 0, 100);
            force.add(createVector(scaledMouseX - this.position.x, scaledMouseY - this.position.y).limit(MAX_FORCE));
        }

        this.acceleration.add(force.limit(MAX_FORCE));
        this.acceleration = this.acceleration.limit(MAX_FORCE);
        this.velocity.add(this.acceleration);

        this.velocity = this.velocity.limit(MAX_SPEED);
        this.position.add(this.velocity);

        // Add 100 to prevent values from becoming negative, since JavaScript modulus doesn't limit to positive results
        this.position.x = (this.position.x+100) % 100;
        this.position.y = (this.position.y+100) % 100;
    }

    render(isHighlighted) {
        push();
        if(isHighlighted)
            fill(255, 0, 0, 175);
        else
            fill(0, 175);
        // Map the position vector so there's a constant coordinate system even if window resizes
        let xCanvas = map(this.position.x, 0, 100, 0, width);
        let yCanvas = map(this.position.y, 0, 100, 0, height);
        translate(xCanvas, yCanvas);
        rotate(this.velocity.heading());
        triangle(-BOID_SIZE/2, BOID_SIZE/3, -BOID_SIZE/2, -BOID_SIZE/3, BOID_SIZE/2, 0);
        pop();
    }
}