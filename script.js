import {Ball, Paddle, Message} from "./classes.js"



///////////TO DO/////////////////////

        //remove html divs and use the following instead:
            //*creates a div at end of body
            //let p = document.createElement("p");
            //document.body.appendChild(p);


        //add additional drop mechanics listed out

        //add simple visual effects for ball hit, goal score, drop pickup, etc

        //add menus







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
const message = new Message()




let lastTime = 0
let startTime
let intermission = false



function gameLoop(time) {
    if (lastTime == 0) {
        startTime = time
        lastTime = time
    }
    else if (lastTime - startTime >= 2000) {//short pause, updates objects, then checks if goal is scored
        message.reset()
        const delta = time - lastTime
        ball.update(delta, [player, cpu])
        cpu.update(delta)
        
        if (ball.checkGoal()) {
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
        else if (lastTime - startTime >= 2000) {
            cpu.score = 0
            player.score = 0
            cpu.newgame()
            player.newgame()
            lastTime = 0
            intermission = false
        }
    }
    


    window.requestAnimationFrame(gameLoop)
}


//listener for player movement
document.addEventListener("mousemove", e => {
    player.position = (e.y / window.innerHeight) * 100
    player.rect = player.setRect()
})


//async animation method, runs gameloop
window.requestAnimationFrame(gameLoop)

