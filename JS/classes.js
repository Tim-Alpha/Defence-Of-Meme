class PlacementTile {
    constructor({ position = { x: 0, y: 0 } }) {
        this.position = position
        this.size = 64
        this.color = 'rgba(255, 255, 255, 0.15)'
        this.occupied = false
    }

    draw() {
        c.fillStyle = this.color
        c.fillRect(this.position.x, this.position.y, this.size, this.size)
    }

    update(mouse) {
        this.draw()

        if (
            mouse.x > this.position.x &&
            mouse.x < this.position.x + this.size &&
            mouse.y > this.position.y &&
            mouse.y < this.position.y + this.size
        ) {
            this.color = 'white'
        } else this.color = 'rgba(255, 255, 255, 0.15)'
    }
}

class Enemy {
    constructor({ position = { x: 0, y: 0 } }) {
        this.position = position
        this.width = 100
        this.height = 100
        this.waypointIndex = 0
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        }
        this.radius = 50
        this.health = 100
        this.velocity = {
            x: 0,
            y: 0
        }
        this.image = new Image()
        this.image.src = 'IMG/pepe-run.gif'
    }

    draw() {
        // Ensure the image is loaded before drawing
        if (this.image.complete) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        }

        // Draw health bar
        c.fillStyle = 'red'
        c.fillRect(this.position.x, this.position.y - 15, this.width, 10)

        c.fillStyle = 'green'
        c.fillRect(
            this.position.x,
            this.position.y - 15,
            (this.width * this.health) / 100,
            10
        )
    }

    update() {
        this.draw()

        const waypoint = waypoints[this.waypointIndex]
        const yDistance = waypoint.y - this.center.y
        const xDistance = waypoint.x - this.center.x
        const angle = Math.atan2(yDistance, xDistance)

        const speed = 2

        this.velocity.x = Math.cos(angle) * speed
        this.velocity.y = Math.sin(angle) * speed

        this.position.x += this.velocity.x 
        this.position.y += this.velocity.y 

        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        }

        if (
            Math.abs(Math.round(this.center.x) - Math.round(waypoint.x)) < Math.abs(this.velocity.x ) &&
            Math.abs(Math.round(this.center.y) - Math.round(waypoint.y)) < Math.abs(this.velocity.y ) &&
            this.waypointIndex < waypoints.length - 1
        ) {
            this.waypointIndex++
        }
    }
}

class Projectile {
    constructor({ position = { x: 0, y: 0 }, enemy }) {
        this.position = position
        this.velocity = {
            x: 0,
            y: 0
        }
        this.enemy = enemy
        this.radius = 5
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'red'
        c.fill()
    }

    update() {
        this.draw()

        const angle = Math.atan2(
            this.enemy.center.y - this.position.y,
            this.enemy.center.x - this.position.x
        )

        const power = 15
        this.velocity.x = Math.cos(angle) * power
        this.velocity.y = Math.sin(angle) * power

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Building {
    constructor({ position = { x: 0, y: 0 } }) {
        this.position = position
        this.width = 64
        this.height = 64
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        }
        this.projectiles = []
        this.radius = 250
        this.target
        this.frames = 0
        this.image = new Image()
        this.image.src = 'IMG/cat.png'
    }

    draw() {
        // Ensure the image is loaded before drawing
        if (this.image.complete) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        }

        // Draw the attack radius
        c.beginPath()
        c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'rgba(240, 248, 255, 0)'
        c.fill()
    }

    update() {
        this.draw()
        if (this.frames % 100 === 0 && this.target) {
            this.projectiles.push(
                new Projectile({
                    position: {
                        x: this.center.x,
                        y: this.center.y - 14
                    },
                    enemy: this.target
                })
            )
        }
        this.frames++
    }
}
