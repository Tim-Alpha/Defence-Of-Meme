const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1280
canvas.height = 768
// canvas.height = window.innerHeight
// canvas.width = window.innerWidth

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)

const placementTilesData2D = []

for (let i = 0; i < placementTilesData.length; i += 20) {
    placementTilesData2D.push(placementTilesData.slice(i, i + 20))
}

const placementTiles = []

placementTilesData2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 14) {
            // add building placement tile here
            placementTiles.push(
                new PlacementTile({
                    position: {
                        x: x * 64,
                        y: y * 64
                    }
                })
            )
        }
    })
})

const image = new Image()

image.onload = () => {
    animate()
}
image.src = 'IMG/GameMap.png'

const enemies = []

function spawnEnemies(spawnCount) {
    for (let i = 1; i < spawnCount + 1; i++) {
        const xOffset = i * 150
        enemies.push(
            new Enemy({
                position: { x: waypoints[0].x - xOffset, y: waypoints[0].y }
            })
        )
    }
}

const buildings = []
let activeTile = undefined
let enemyCount = 3
let hearts = 10
let coins = 125
let shootingAudio = new Audio('AUDIO/gun_fire.mp3');
let gameOverAudio = new Audio('AUDIO/game_over.mp3');
let earnCoin = new Audio('AUDIO/coin_earn.mp3');
let deployTower = new Audio('AUDIO/deployTower.mp3');
let lovelyBgM = new Audio('AUDIO/lovelyBgM.mp3');
let defaultBgM = new Audio('AUDIO/lovelyBgM.mp3');

document.getElementById('coins').innerText = coins;
spawnEnemies(enemyCount)

function animate() {
    const animationId = requestAnimationFrame(animate)

    c.drawImage(image, 0, 0)

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i]
        enemy.update()

        if (enemy.position.x > canvas.width) {
            hearts --
            // console.log(hearts)
            enemies.splice(i, 1)
            document.getElementById("heart").innerText = hearts

            if(hearts == 0 ) {
                gameOverAudio.play();
                cancelAnimationFrame(animationId)
                document.getElementById("GameOver").style.display = 'flex'
            }
        }
    }

    // tracking total amount of enemies
    if (enemies.length === 0) {
        enemyCount += 2
        spawnEnemies(enemyCount)
    }

    placementTiles.forEach((tile) => {
        tile.update(mouse)
    })

    buildings.forEach((building) => {
        building.update()
        building.target = null
        const validEnemies = enemies.filter((enemy) => {
            const xDifference = enemy.center.x - building.center.x
            const yDifference = enemy.center.y - building.center.y
            const distance = Math.hypot(xDifference, yDifference)
            return distance < enemy.radius + building.radius
        })
        building.target = validEnemies[0]

        for (let i = building.projectiles.length - 1; i >= 0; i--) {
            const projectile = building.projectiles[i]

            projectile.update()

            const xDifference = projectile.enemy.center.x - projectile.position.x
            const yDifference = projectile.enemy.center.y - projectile.position.y
            const distance = Math.hypot(xDifference, yDifference)

            // this is when a projectile hits an enemy
            if (distance < projectile.enemy.radius + projectile.radius) {
                // enemy health and enemy removal
                projectile.enemy.health -= 15
                shootingAudio.play();
                if (projectile.enemy.health <= 0) {
                    const enemyIndex = enemies.findIndex((enemy) => {
                        return projectile.enemy === enemy
                    })

                    if (enemyIndex > -1) {
                        enemies.splice(enemyIndex, 1)
                        coins += 25
                        earnCoin.play()
                        document.getElementById("coins").innerText = coins
                    }
                }

                // console.log(projectile.enemy.health)
                building.projectiles.splice(i, 1)
            }
        }
    })
}

const mouse = {
    x: undefined,
    y: undefined
}

canvas.addEventListener('click', (event) => {

    if (activeTile && !activeTile.isOccupied && coins -50 >= 0) {
        coins -=50
        deployTower.play()
        document.getElementById("coins").innerText = coins
        buildings.push(
            new Building({
                position: {
                    x: activeTile.position.x,
                    y: activeTile.position.y
                }
            })
        )
        activeTile.isOccupied = true
    }
    else if(coins < 50 && (activeTile && !activeTile.isOccupied)) {
        alert("Sorry! "+coins+" coins left\nAtleast 50 coins needed")
    }
})

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX
    mouse.y = event.clientY

    activeTile = null
    for (let i = 0; i < placementTiles.length; i++) {
        const tile = placementTiles[i]
        if (
            mouse.x > tile.position.x &&
            mouse.x < tile.position.x + tile.size &&
            mouse.y > tile.position.y &&
            mouse.y < tile.position.y + tile.size
        ) {
            activeTile = tile
            break
        }
    }
})

document.addEventListener('DOMContentLoaded', function() {
    var retryButton = document.getElementById('retryButton');
    if (retryButton) {
        retryButton.addEventListener('click', function() {
            window.location.reload();
        });
    }
});
