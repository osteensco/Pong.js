const INITIAL_VEL = .05
const CPUSPEED = .0065




//helper functions
function randomNumberBetween(min, max) {
    return Math.random() * (max - min) + min
}

export function createElem(cnames, type="div") {
    let elem = document.createElement(type)
    elem.classList.add(cnames)
    document.body.appendChild(elem)

    return elem
}

export function cleanup(cname) {
    document.querySelectorAll(`.${cname}`).forEach(i => {i.remove()})
}



//classes
export class Ball {
    constructor(clone=false) {
        this.Elem = createElem("ball")
        this.dropReady = false
        this.drops = []
        this.inertia = .001
        this.hitpower = this.inertia
        this.fasthits = 0
        this.sprintball = false
        this.animation = false
        this.stuck = false
        this.clones = []
        this.clone(clone)
        this.rect = this.setRect()
        this.reset()
    }

    get x() {
        return parseFloat(getComputedStyle(this.Elem).getPropertyValue("--x"))
    }

    set x(value) {
        this.Elem.style.setProperty("--x", value)
    }

    get y() {
        return parseFloat(getComputedStyle(this.Elem).getPropertyValue("--y"))
    }

    set y(value) {
        this.Elem.style.setProperty("--y", value)
    }

    setRect() {
        return this.Elem.getBoundingClientRect()
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
        cleanup("drop")
        this.clones = []
    }

    update(delta, paddles) {
        if (this.clones.length) {
            this.clones[0].update(delta, paddles)
        }
        this.x += this.direction.x * this.velocity * delta
        this.y += this.direction.y * this.velocity * delta
        if (
            Math.abs(this.direction.y) <= .2 ||
            Math.abs(this.direction.y) >= .9
            ) {
            this.direction.y = Math.sin(randomNumberBetween(0, 2 * Math.PI))
        }
        this.rect = this.setRect()
        for (let i = 0; i < this.drops.length; i++) {
            this.drops[i].update(delta, paddles)
        }

        if (this.dropReady) {
            this.spawnDrop()
        }
        
        if (this.dirCooldown < 50) {
            this.dirCooldown++
        }

        if (this.rect.bottom >= window.innerHeight || this.rect.top <= 0) {
            this.direction.y *= -1
        }


        let paddlerects = []
        for (let i = 0; i < paddles.length; i++) {
            paddlerects[i] = paddles[i].rect
        } 
        if (
            paddlerects.some(r => this.checkCollision(r))
            ) {
                if (this.animation) {
                    this.Elem.classList.remove("hit2")
                    this.Elem.classList.add("hit1")
                } else {
                    this.Elem.classList.remove("hit1")
                    this.Elem.classList.add("hit2")
                }
                this.animation = !this.animation
                let target = paddlerects.find(r => this.checkCollision(r))
                let lasthit
                for (let i = 0; i < paddles.length; i++) {
                    if (paddles[i].rect == target) {
                        target = paddles[i]
                    } else {
                        lasthit = paddles[i]
                    }
                }
                
                if (this.dirCooldown >= 50) {
                    this.dropReady = true
                    this.dirCooldown = 0
                }
                if (this.sprintball) {
                    lasthit.paddleElem.style.backgroundColor = "orange"
                    lasthit.paddleElem.style.boxShadow = "0px 0px 15px 5px orange"
                }
                if (target.fastball) {
                    this.hitpower = .05
                    this.fasthits++
                } else {
                    this.hitpower = this.inertia
                    if (this.fasthits > 0) {
                        this.velocity -= .05
                        this.fasthits -= 1
                    }
                }
                if (this.stuck) {
                    this.x += this.direction.x * this.velocity * delta
                    this.y += this.direction.y * this.velocity * delta
                } else {
                    this.direction.x *= -1
                    target.debuff()
                }
                if (this.velocity < INITIAL_VEL) {
                    this.velocity = INITIAL_VEL
                }
                this.velocity += this.hitpower
                this.stuck = true
            } else {
                this.stuck = false
            }
    }

    checkGoal() {
        
        return (
            this.rect.right >= window.innerWidth || 
            this.rect.left <= 0 ||
            this.clonesGoal()
        )

    }

    clonesGoal() {
        if (this.clones.length) {
            return this.clones[0].checkGoal()
        } else {
            return false
        }
    }

    score() {
        if (this.clonesGoal()) {
            this.x = this.clones[0].x
            this.y = this.clones[0].y
            this.direction = this.clones[0].direction
            this.velocity = this.clones[0].velocity
            this.rect = this.clones[0].rect
            // this.clones[0].Elem.remove()
        }
        cleanup("clone")
    }

    clone(clone) {
        if (clone) {
            this.Elem.classList.add("clone")
        }
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
            this.drops.push(new Drop(this))
            this.dropReady = false
        }
    }
    
   


}






export class Paddle {
    constructor(boolean, paddleElem, scoreElem, ball) {
        this.paddleElem = paddleElem
        this.scoreElem = scoreElem
        this.cpu = boolean
        this.ball = ball
        this.score = 0
        this.bonus = 0
        this.fastball = false
        this.animation = false
        this.streaks = []
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
        if (this.cpu) {
            let closestBall = this.checkDistance(this.ball)
            this.position += CPUSPEED * delta * (closestBall.y - this.position)
        }
        
        this.rect = this.setRect()
    }

    checkDistance(ball) {
        if (ball.clones.length) {
            let clone = this.checkDistance(ball.clones[0])
            if (  
                Math.abs(this.rect.right - ball.rect.left) >
                Math.abs(this.rect.right - clone.rect.left)
            ) {
                ball = clone
            }
        }
        return ball
    }

    reset() {
        this.position = 50
        this.bonus = 0
        this.streaks = []
        this.debuff()
    }

    newgame() {
        this.reset()
        this.scoreElem.textContent = 0
    }

    scoreAnimation() {
        let amount = 100
        let i = 0
        let direction
        if (this.cpu) {
            direction = 'to right'
        } else {
            direction = 'to left'
        }
        while(i < amount) {
            this.streaks.push(new Streak(direction, this.ball))
            i++
        }
    }

    awardGoal(value) {
        this.scoreElem.textContent = value
        this.score = value
        this.scoreAnimation()
    }

    debuff() {
        this.paddleElem.style.height = "15vh"
        if (this.ball.sprintball) {
            this.ball.velocity = this.ball.resetVel
            this.ball.sprintball = false
        }
        this.fastball = false
        this.paddleElem.style.backgroundColor = "orange"
        this.paddleElem.style.boxShadow = "0px 0px 15px 5px orange"
    }
    
}




//drop mechanics
function grow (target, color) {
    target.paddleElem.style.height = "25vh"
    target.paddleElem.style.backgroundColor = color
    target.paddleElem.style.boxShadow = `0px 0px 15px 5px ${color}`
    target.bonus = 1
}

function sprintball (target, color) {
    target.paddleElem.style.backgroundColor = color
    target.paddleElem.style.boxShadow = `0px 0px 15px 5px ${color}`
    target.ball.resetVel = target.ball.velocity
    target.ball.sprintball = true
    target.ball.velocity += .05
    target.ball.direction.y *= -1*Math.random()
    target.bonus = 1
}

function fastball (target, color) {
    target.paddleElem.style.backgroundColor = color
    target.paddleElem.style.boxShadow = `0px 0px 15px 5px ${color}`
    target.fastball = true
    target.bonus = 1
}

function cloneball (target, color) {
    target.paddleElem.style.backgroundColor = color
    target.paddleElem.style.boxShadow = `0px 0px 15px 5px ${color}`
    let i = 0
    let ball = target.ball
    while (i < 1) {
        if (ball.clones.length) {
            ball = ball.clones[0]
        } else {
            ball.clones.push(new Ball(true))
            i++
        }
    }
}



let mechanics = [
    [grow, 'yellow'],
    [fastball, 'red'],
    [sprintball, 'green'],
    [cloneball, 'blueviolet']
]




export class Drop {
    constructor(ball) {
        this.Elem = createElem("drop")
        this.ball = ball
        this.home = ball.drops
        this.x = ball.x
        this.y = ball.y
        this.direction = {
            x: -ball.direction.x,
            y: -ball.direction.y * randomNumberBetween(-1, 1)
        }
        this.rotation = 0
        this.Elem.style.opacity = "1"
        this.velocity = INITIAL_VEL*1.5
        this.mechanic = mechanics[Math.floor(Math.random() * mechanics.length)]
        this.applyEffect = this.mechanic[0]
        this.color = this.mechanic[1]
        this.Elem.style.backgroundColor = this.color
        this.Elem.style.boxShadow = `0px 0px 15px 5px ${this.color}`
        this.rect = this.setRect()
    }

    get x() {
        return parseFloat(getComputedStyle(this.Elem).getPropertyValue("--x"))
    }

    set x(value) {
        this.Elem.style.setProperty("--x", value)
    }

    get y() {
        return parseFloat(getComputedStyle(this.Elem).getPropertyValue("--y"))
    }

    set y(value) {
        this.Elem.style.setProperty("--y", value)
    }


    reset() {
        this.Elem.style.opacity = "0"
    }

    setRect() {
        return this.Elem.getBoundingClientRect()
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
        this.Elem.style.transform = `rotate(${this.rotation}deg)`
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
            if (target.animation) {
                target.paddleElem.classList.remove("pulse1")
                target.paddleElem.classList.add("pulse2")
            } else {
                target.paddleElem.classList.remove("pulse2")
                target.paddleElem.classList.add("pulse1")
            }
            target.animation = !target.animation
            this.applyEffect(target, this.color)
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
        this.Elem.style.opacity = "0"
        this.home.shift(this)
        this.Elem.remove()
    }


}



export class Streak {
    constructor(direction, ball) {
        this.Elem = createElem("streak", "i")
        this.lowerBound = (ball.rect.top - ball.rect.height)
        this.upperBound = (ball.rect.bottom + ball.rect.height)
        this.size = Math.random() * 5
        this.posX = Math.floor(Math.random() * window.innerWidth)
        this.posY = randomNumberBetween(this.lowerBound, this.upperBound)
        this.duration = Math.random() * 5

        this.Elem.style.background = `linear-gradient(${direction}, transparent, rgb(227, 252, 5))`
        this.Elem.style.height = `${.2 + this.size}px`
        this.Elem.style.left = `-${this.posX}px`
        this.Elem.style.top = `${this.posY}px`
        this.Elem.style.animationDuration = `${.1 + this.duration}s`
        if (direction == 'to left') {
            this.Elem.style.animationDirection = 'reverse'
        }
    }


}



export class Message {
    constructor() {
        this.Elem = createElem("message")
        this.reset()    
    }

    reset() {
        this.Elem.textContent = undefined
        cleanup("streak")
        
    }

    goal(str) {
        this.Elem.textContent = `${str} scored!`
    }

    winner(str) {
        this.Elem.textContent = `${str} is the winnner!`
    }

}