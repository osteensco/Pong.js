const INITIAL_VEL = .025

export class Ball {
    constructor(ballElem) {
        this.ballElem = ballElem
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

    rect() {
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

    update(delta) {
        this.x += this.direction.x * this.velocity * delta
        this.y += this.direction.y * this.velocity * delta
        const rect = this.rect()

        if (rect.bottom >= window.innerHeight || rect.top <= 0) {
            this.direction.y *= -1
            console.log('y axis check')
        }

        if (rect.right >= window.innerWidth || rect.left <= 0) {
            this.direction.x *= -1
            console.log('x axis check')
        }
    }
}


function randomNumberBetween(min, max) {
    return Math.random() * (max - min) + min
}


export class Paddle {
    constructor(paddleElem) {
        this.paddleElem = paddleElem
    }

    get position() {
        return parseFloat(
            getComputedStyle(this.paddleElem),getPropertyValue("--position")
        )
    }

}