import {Ball, Paddle, Message, cleanup, createElem} from "./classes.js"



let init
let ball 
let player
let cpu
let message

let lastTime
let startTime
let intermission

let cancelID

function gameLoop(time) {
    if (init) {
        ball = new Ball()
        player = new Paddle(false,
            document.getElementById("player-paddle"),
            document.getElementById("player-score"),
            ball
            )
        cpu = new Paddle(true,
            document.getElementById("cpu-paddle"),
            document.getElementById("cpu-score"),
            ball
            )
        message = new Message()

        lastTime = 0
        startTime
        intermission = false
        init = false
    }


    if (lastTime == 0) {
        startTime = time
        lastTime = time
    }
    else if (!intermission && lastTime - startTime >= 2000) {//short pause, updates objects, then checks if goal is scored
        message.reset()
        const delta = time - lastTime
        ball.update(delta, [player, cpu])
        cpu.update(delta)
        
        if (ball.checkGoal()) {
            ball.score()
            if (ball.rect.right >= window.innerWidth) {
                player.awardGoal(player.score + 1 + player.bonus)
                message.goal('Player')            
            } else {
                cpu.awardGoal(cpu.score + 1 + cpu.bonus)
                message.goal('CPU') 
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


    cancelID = window.requestAnimationFrame(gameLoop)
    //check for win
    if (player.score >= 5 || cpu.score >= 5) {
        if (player.score >= 5) {
            message.winner('Player')
        } else {
            message.winner('CPU')
        }

        if (lastTime != 0 && !intermission) {
            ball.reset()
            lastTime = 0
            intermission = true
        }
        else if (lastTime - startTime >= 5000) {
            cpu.newgame()
            player.newgame()
            cleanup("ball")
            cleanup("message")
            cleanup("drop")
            cleanup("streak")
            window.cancelAnimationFrame(cancelID)
            start = createElem("button", "a")
            start.setAttribute('href', '#')
            start.setAttribute('id', 'button')
            start.innerText = "PLAY!"
            start.addEventListener("click", newGame)
        }
    }
    
 

}




function newGame() {
    cleanup("button")
    init = true

    //async animation method, runs gameloop
    window.requestAnimationFrame(gameLoop)

}

let start = document.getElementById('button')

start.addEventListener("click", newGame)

//listener for player movement
document.addEventListener("mousemove", e => {
    if (player) {
        player.position = (e.y / window.innerHeight) * 100
        player.rect = player.setRect()
    }

})
