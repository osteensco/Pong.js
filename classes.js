const INITIAL_VEL = .035
const CPUSPEED = .1




//helper functions
function randomNumberBetween(min, max) {
    return Math.random() * (max - min) + min
}



//classes
export class Ball {
    constructor(ballElem) {
        this.ballElem = ballElem
        this.dropReady = false
        this.drops = []
        this.inertia = .001
        this.hitpower = this.inertia
        this.fasthits = 0
        this.sprintball = false
        this.rect = this.setRect()
        this.reset()
    }

    get x() {
        return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--x"))
    }

    set x(value) {
        this.ballElem.style.setProperty("--x", value)
    }

    get y() {
        return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--y"))
    }

    set y(value) {
        this.ballElem.style.setProperty("--y", value)
    }

    setRect() {
        return this.ballElem.getBoundingClientRect()
    }

    reset() {
        this.x = 50
        this.y = 50
        this.direction = { x: 0 }
        while (
            Math.abs(this.direction.x) <= .2 || 
            Math.abs(this.direction.x) >= .9
                ) {
            const heading = randomNumberBetween(0, 2 * Math.PI)
            this.direction = {x: Math.cos(heading), y: Math.sin(heading) }
        }
        this.velocity = INITIAL_VEL
        this.resetVel = this.velocity
        this.dirCooldown = 0
        for (let i = 0; i < this.drops.length; i++) {
            this.drops[i].reset()
        }
        this.drops = []
    }

    update(delta, paddles) {
        this.x += this.direction.x * this.velocity * delta
        this.y += this.direction.y * this.velocity * delta
        this.rect = this.setRect()

        for (let i = 0; i < this.drops.length; i++) {
            this.drops[i].update(delta, paddles)
        }

        if (this.dropReady) {
            this.spawnDrop()
        }
        
        if (this.dirCooldown < 50) {
            this.dirCooldown += 1
        }

        if (this.rect.bottom >= window.innerHeight || this.rect.top <= 0) {
            this.direction.y *= -1
        }


        let paddlerects = []
        for (let i = 0; i < paddles.length; i++) {
            paddlerects[i] = paddles[i].rect
        } 
        if (
            this.dirCooldown >= 50 &&
            paddlerects.some(r => this.checkCollision(r))
            ) {
            let target = paddlerects.find(r => this.checkCollision(r))
            for (let i = 0; i < paddles.length; i++) {
                if (paddles[i].rect == target) {
                    target = paddles[i]
                } 
            }
            this.dropReady = true
            this.dirCooldown = 0
            this.direction.x *= -1
            if (target.fastball) {
                this.hitpower = .05
                this.fasthits += 1
            } else {
                this.hitpower = this.inertia
                if (this.fasthits > 0) {
                    this.velocity -= .05
                    this.fasthits -= 1
                }
            }
            this.velocity += this.hitpower
            target.debuff()
        }
    }

    checkGoal() {
        return this.rect.right >= window.innerWidth || this.rect.left <= 0
    }

    checkCollision(paddle) {
        return (
            this.rect.right >= paddle.left &&
            this.rect.left <= paddle.right &&
            this.rect.bottom >= paddle.top &&
            this.rect.top <= paddle.bottom
        )
    }

    spawnDrop() {
        if (
            (this.direction.x > 0 && this.x > 50) ||
            (this.direction.x < 0 && this.x < 50)
            ) {
            this.drops.push(new Drop(document.getElementById("drop"), this))
            this.dropReady = false
        }
    }
    

}






export class Paddle {
    constructor(paddleElem, scoreElem, ball) {
        this.paddleElem = paddleElem
        this.scoreElem = scoreElem
        this.ball = ball
        this.score = 0
        this.bonus = 0
        this.fastball = false
        this.rect = this.setRect()
        this.reset()
    }

    get position() {
        return parseFloat(
            getComputedStyle(this.paddleElem).getPropertyValue("--position")
        )
    }

    set position(value) {
        this.paddleElem.style.setProperty("--position", value)
    }

    setRect() {
        return this.paddleElem.getBoundingClientRect()
    }

    update(delta) {
        this.position += CPUSPEED * delta * (this.ball.y - this.position)
        this.rect = this.setRect()
    }

    reset() {
        this.position = 50
        this.bonus = 0
        this.debuff()
    }

    awardGoal(value) {
        this.scoreElem.textContent = value
        this.score = value
    }

    debuff() {
        this.paddleElem.style.height = "15vh"
        if (this.ball.sprintball) {
            this.ball.velocity = this.ball.resetVel
            this.ball.sprintball = false
        }
        this.fastball = false

    }
    
}




//drop mechanics
function grow (target) {
    target.paddleElem.style.height = "25vh"
    target.bonus = 1
}

function sprintball (target) {
    target.ball.resetVel = target.ball.velocity
    target.ball.sprintball = true
    target.ball.velocity += .1
    target.bonus = 1
}

function fastball (target) {
    target.fastball = true
    target.bonus = 1
}


//function shadowclone 
//-spawns additional paddels that move forward until off screen
//child object of paddle
//update function moves to opposite side if position is greater than or less than 50
//once >window or <0 it despawns


let mechanics = [
    grow,
    fastball,
    sprintball
]


export class Drop {
    constructor(dropElem, ball) {
        this.dropElem = dropElem
        this.ball = ball
        this.home = ball.drops
        this.x = ball.x
        this.y = ball.y
        this.direction = {x: -ball.direction.x, y: -ball.direction.y}
        this.rotation = 0
        this.dropElem.style.opacity = "1"
        this.velocity = ball.velocity*1.5
        this.applyEffect = mechanics[Math.floor(Math.random() * mechanics.length)]
        this.rect = this.setRect()
    }

    get x() {
        return parseFloat(getComputedStyle(this.dropElem).getPropertyValue("--x"))
    }

    set x(value) {
        this.dropElem.style.setProperty("--x", value)
    }

    get y() {
        return parseFloat(getComputedStyle(this.dropElem).getPropertyValue("--y"))
    }

    set y(value) {
        this.dropElem.style.setProperty("--y", value)
    }


    reset() {
        this.dropElem.style.opacity = "0"
    }

    setRect() {
        return this.dropElem.getBoundingClientRect()
    }

    rotate() {
        if (this.rotation <= 359) {
            this.rotation += 5
        } else {
            this.rotation = 0
        }
    }

    update(delta, paddles) {
        this.x += this.direction.x * this.velocity * delta
        this.y += this.direction.y * this.velocity * delta
        this.rotate()
        this.dropElem.style.transform = `rotate(${this.rotation}deg)`
        this.rect = this.setRect()

        if (this.rect.bottom >= window.innerHeight || this.rect.top <= 0) {
            this.direction.y *= -1
        }

        if (this.rect.right >= window.innerWidth || this.rect.left <= 0) {
            this.kill()
        }

        let paddlerects = []
        for (let i = 0; i < paddles.length; i++) {
            paddlerects[i] = paddles[i].rect
        }
        if (paddlerects.some(r => this.checkCollision(r))) {
            let target = paddlerects.find(r => this.checkCollision(r))
            for (let i = 0; i < paddles.length; i++) {
                if (paddles[i].rect == target) {
                    target = paddles[i]
                } 
            }
            this.applyEffect(target)
            this.kill()
        }
    }

    checkCollision(paddle) {
        return (
            paddle.left <= this.rect.right &&
            paddle.right >= this.rect.left &&
            paddle.top <= this.rect.bottom &&
            paddle.bottom >= this.rect.top
        )
    }

    kill() {
        this.dropElem.style.opacity = "0"
        this.home.shift(this)
    }


}