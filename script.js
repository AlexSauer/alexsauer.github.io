const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//let particlesArray;
let particlesSet;
let newparticlesize;
let DISTORTMOUSE = 3;
let PARTICLESPEED = 3;
let COLOR = '#dddddd'; //'#ffffff';
let SIZE = 8;
let MAXSIZE = 18;
let LIVELENGTH = 1000;
let CELLDIVPROP = 0.0025;
let OVERPOP = false;
let UNDERPOPLIMIT = 12;
let UNDERPOPMULT = 8;

let NUMBEROFPARTICLES = Math.min(5, (canvas.height * canvas.width) / 40000);
let MAXNUMBEROFPARTICLES = Math.min(125, (canvas.height * canvas.width) / 10000);

// Mouse position
let mouse = {
    x: null,
    y: null,
    radius: (canvas.height/ 120) * (canvas.width / 120)
}

window.addEventListener('mousemove',
    function(event){
        mouse.x = event.x;
        mouse.y = event.y;
    }
);

function randomBinary(p = 0.5) {
    return 2 * (Math.ceil(Math.random() - (1-p))) - 1;
}

class Particle {
    constructor(x, y, directionX, directionY, size, COLOR, length){
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.COLOR = COLOR;
        this.lifelength = length;
        this.timer = 0;

        if (size <= MAXSIZE){
            this.size = size;
        } else {
            this.size = MAXSIZE;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = COLOR;
        ctx.fill();
    }    

    increasesize() {
        if (this.size <= MAXSIZE -1){
            this.size += 1;
        }
    }



    update() {
        // Check if particle still within canvas, else change direction
        if(this.x > canvas.width || this.x < 0) {
            this.directionX = - this.directionX;
        }
        if (this.y > canvas.height || this.y < 0){
            this.directionY = - this.directionY;
        }

        
        // chechk for coluision detecion - mouse
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        // Change direction if the mouse is close
        if (distance < mouse.radius + this.size){
            if(mouse.x < this.x && this.x < canvas.width  - this.size * DISTORTMOUSE){
                this.x += DISTORTMOUSE;
                this.directionY = - this.directionY;
            }
            if(mouse.x > this.x && this.x > this.size * DISTORTMOUSE){
                this.x -= DISTORTMOUSE;
                this.directionY = -this.directionY;
            }
            if(mouse.y < this.y && this.y < canvas.height  - this.size * DISTORTMOUSE){
                this.y += DISTORTMOUSE;
                this.directionX = - this.directionX;
            }
            if(mouse.y > this.y && this.y > this.size * DISTORTMOUSE){
                this.y -= DISTORTMOUSE;
                this.directionX = - this.directionX;
            }
            // this.directionX = - this.directionX;
            // this.directionY = - this.directionY;
        }
        // Introduce random movement changes
        this.directionX *= (- randomBinary(0.01));
        this.directionY *= (- randomBinary(0.01));

        // Update position
        this.x += this.directionX ;
        this.y += this.directionY;

        // Update the timer how long the particle already lives
        this.timer += 1;

        this.draw();
    }
}


function init() {
    //particlesArray = [];
    particlesSet = new Set();
    for (let i = 0; i < NUMBEROFPARTICLES; i++){
        let size = (Math.random() * SIZE) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * PARTICLESPEED) - PARTICLESPEED/2;
        let directionY = (Math.random() * PARTICLESPEED) - PARTICLESPEED/2;
        let length = LIVELENGTH * Math.random();

        //particlesArray.push(new Particle(x, y, directionX, directionY, size, COLOR));      
        particlesSet.add(new Particle(x, y, directionX, directionY, size, COLOR, length));      
    }
}

function animate() {

    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    // Check for overpopulation
    if (particlesSet.size > MAXNUMBEROFPARTICLES){
        OVERPOP = true;
    } else {
        OVERPOP = false;
    }

    for (let particle of particlesSet){
        // Cell division if random event happens
        if (!OVERPOP &&     // Only create new cells if there is no overpopulation
            (Math.random() < CELLDIVPROP ||
            (particlesSet.size < UNDERPOPLIMIT && Math.random < UNDERPOPMULT * CELLDIVPROP))) // If there are very few cells, than increase the propulation of cell division
            {
            // Create new cell
            if(particlesSet.size < UNDERPOPLIMIT){
                newparticlesize = Math.ceil(particle.size * 1.8);
            } else {
                newparticlesize = particle.size;
            }
            particlesSet.add(new Particle(particle.x, particle.y,
                randomBinary() * particle.directionX, randomBinary()  * particle.directionY, newparticlesize, 
                particle.COLOR, particle.length));
        } else {
            // If there is no cell division, update the particle and shrink it if 
            // the timer is longer than the lifelength
            particle.update();
            if(particle.timer > particle.lifelength){
                if(particle.timer % 20 == 0){
                    particle.size -= 1;
                }
            }
            // If the size is 1, then delete it
            if(particle.size <= 1){
                particlesSet.delete(particle);
            }
        }

        if (OVERPOP){
            particle.lifelength = 100 // particle.lifelength * 0.25;
        }
    }
    // console.log("Animate finished!")
}

console.log("start");
init();
animate();