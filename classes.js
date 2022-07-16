const INITIAL_VEL = .02
const CPUSPEED = .02




//helper functions
function randomNumberBetween(min, max) {
    return Math.random() * (max - min) + min
}



//classes
export class Ball {
    constructor(ballElem, ) {
        this.ballElem = ballElem
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
    }

    update(delta, paddles) {
        this.x += this.direction.x * this.velocity * delta
        this.y += this.direction.y * this.velocity * delta
        this.rect = this.setRect()

        if (this.rect.bottom >= window.innerHeight || this.rect.top <= 0) {
            this.direction.y *= -1
        }

        if (paddles.some(r => this.checkCollision(r))) {
            this.direction.x *= -1
            this.velocity += .001
        }
    }

    checkGoal() {
        return this.rect.right >= window.innerWidth || this.rect.left <= 0
    }

    checkCollision(paddle) {
        return (
            paddle.left <= this.rect.right &&
            paddle.right >= this.rect.left &&
            paddle.top <= this.rect.bottom &&
            paddle.bottom >= this.rect.top
        )
    }



}

export class Paddle {
    constructor(paddleElem, scoreElem) {
        this.paddleElem = paddleElem
        this.scoreElem = scoreElem
        this.score = 0
        this.bonus = 0
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

    update(delta, bally) {
        this.position += CPUSPEED * delta * (bally - this.position)
        this.rect = this.setRect()
    }

    reset() {
        this.position = 50
        this.bonus = 0
    }

    awardGoal(value) {
        this.scoreElem.textContent = value
        this.score += value
    }

}


export class Drop {
    constructor(ball) {
        
    }
}