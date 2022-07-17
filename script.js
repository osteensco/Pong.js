import {Ball, Paddle} from "./classes.js"

const ball = new Ball(document.getElementById("ball"))
const player = new Paddle(
    document.getElementById("player-paddle"),
    document.getElementById("player-score"),
    ball
    )
const cpu = new Paddle(
    document.getElementById("cpu-paddle"),
    document.getElementById("cpu-score"),
    ball
    )



let lastTime = 0
let startTime




function gameLoop(time) {
    if (lastTime == 0) {
        startTime = time
        lastTime = time
    }
    else if (lastTime - startTime >= 2000) {
        const delta = time - lastTime
        ball.update(delta, [player, cpu])
        cpu.update(delta)
        
        if (ball.checkGoal()) {
            if (ball.rect.right >= window.innerWidth) {
                player.awardGoal(player.score + 1 + player.bonus)               
            } else {
                cpu.awardGoal(cpu.score + 1 + cpu.bonus)
            }
            ball.reset()
            cpu.reset()
            player.reset()
            lastTime = 0
        } else {
            lastTime = time
        }
    }
    else {
        lastTime = time
    }


    
    window.requestAnimationFrame(gameLoop)
}



document.addEventListener("mousemove", e => {
    player.position = (e.y / window.innerHeight) * 100
    player.rect = player.setRect()
})

window.requestAnimationFrame(gameLoop)

