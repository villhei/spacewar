function Ship(pos_x, pos_y, id) {
    this.angle = 0.0;
    this.position = new Vector(pos_x, pos_y);
    this.velocity = new Vector(0, 0);
    this.size = 50;
    this.angle = 0;
    this.id = id;
    this.modulo = 2;
    this.turnindex = 1;
    this.accelspeed = 0.04;
    this.MAX_SPEED = 10;
    this.health = 100;
    this.turningspeed = 1.5;
    this.shieldradius = 60;
    this.radius = this.shieldradius;
    this.mass = this.size * 10;
    this.thrustdistance = 25;
    this.travelspeed = 1;
    this.thrustTail = [];
    this.c_thrust = false;
    this.gravity_modifier = 0.05;
}
;

Ship.prototype.distanceTo = function(that) {
    return this.position.distanceTo(that.getPosition());
};


Ship.prototype.squaredDistanceTo = function(that) {
    return this.getPosition().squaredLength(that.getPosition());
};

Ship.prototype.detectAsteroidCollision = function(asteroids) {
    for (var i = 0; i < asteroids.length; ++i) {
        var dist = asteroids[i].radius + this.shieldradius;
        if (dist > this.distanceTo(asteroids[i])) {
            //  console.log("ship collision")
            this.pos_x -= -this.vel_x * 3;
            this.pos_y -= -this.vel_y * 3;
            this.vel_x = -this.vel_x * 0.5;
            this.vel_y = -this.vel_y * 0.5;
        }

    }
};

Ship.prototype.isAlive = function() {
    return this.health > 0;
};

Ship.prototype.getImage = function() {
    return this.image;
};

Ship.prototype.drawWeapon = function(ctx, ship, zoom, MIN) {
    this.weapon.drawWeaponFire(ctx, ship, zoom, MIN);
};
Ship.prototype.takeDamage = function(amount) {
    this.ship.health -= amount;
};

Ship.prototype.applyGravityPull = function(asteroids) {

    for (var i = 0; i < asteroids.length; ++i) {
        var mass = asteroids[i].mass;
        var pull_distance = this.distanceTo(asteroids[i]);
        var angle = this.angleTo(asteroids[i], pull_distance);
        this.ship.velocity.x -= Math.cos(angle * Math.PI / 180) * (mass / pull_distance) / Game.fps * this.gravity_modifier;
        this.ship.velocity.y -= Math.sin(angle * Math.PI / 180) * (mass / pull_distance) / Game.fps * this.gravity_modifier;
    }
};

Ship.prototype.getThrustColor = function() {
    return this.thrustColor;
};

Ship.prototype.detectHit = function(object) {
    if (!this.firing) {
        return 0;
    }
    var hit = 0;
    var laserOriginArray = this.getLaserOrigins();
    for (var i = 0; i < laserOriginArray.length; ++i) {
        if (this.weapon.hitObject(object, laserOriginArray[i], this.getTargetCoordinates())) {
            hit += this.weapon.damage;
        }
    }
    return hit;
};

Ship.prototype.angleTo = function(asteroid) {
    var dx = this.pos_x - asteroid.pos_x;
    var dy = this.pos_y - asteroid.pos_y;
    var angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return angle;
};


Ship.prototype.getPosition = function() {
    return this.position;
};

Ship.prototype.accelerate = function() {
    this.vel_x += Math.cos(this.angle * (Math.PI / 180)) * this.accelspeed;
    this.vel_y += Math.sin(this.angle * (Math.PI / 180)) * this.accelspeed;
    this.queueThrust();
};

Ship.prototype.queueThrust = function() {
    var i = 0;
    // Empty queue if not continous thrust or no queue before
    if (this.thrustTail.length == 0 || this.c_thrust == false) {
        var queue = [];
        this.thrustTail.push(queue);
    }
    i = this.thrustTail.length - 1;

    var tgt_coords = this.getPosition();
    tgt_coords.x = (tgt_coords.x - Math.cos((this.angle) * Math.PI / 180) * this.thrustdistance);
    tgt_coords.y = (tgt_coords.y - Math.sin((this.angle) * Math.PI / 180) * this.thrustdistance);

    this.thrustTail[i].push(tgt_coords);
};

Ship.prototype.dequeueThrust = function() {
    if (this.thrustTail.length > 0) {
        // Shift out empty queues
        if (this.thrustTail[0].length == 0) {
            this.thrustTail.shift();
        }
        for (var i = 0; i < this.thrustTail.length; ++i) {
            // For bigger tails, clean up a little faster
            if (this.thrustTail[i].length > 30) {
                this.thrustTail[i].shift();
            }
            this.thrustTail[i].shift();
        }
    }
    if ((Key.isDown(Key.UP) && this.id == 1) || (Key.isDown(Key.R) && this.id == 2)) {
        this.c_thrust = true;
    }
    else {
        this.c_thrust = false;
    }
};

Ship.prototype.applySpeedLimit = function() {
    if (this.velocity.x >= this.MAX_SPEED) {
        this.velocity.x = this.MAX_SPEED;
    }
    else if (this.velocity.x <= -this.MAX_SPEED) {
        this.velocity.x = -this.MAX_SPEED;
    }
    if (this.velocity.y >= this.MAX_SPEED) {
        this.velocity.y = this.MAX_SPEED;
    }
    else if (this.velocity.y <= -this.MAX_SPEED) {
        this.velocity.x = -this.MAX_SPEED;
    }
};

Ship.prototype.move = function() {
    if (this.turnindex % this.modulo == 0) {
        this.dequeueThrust();
        this.turnindex = 1;
    } else {
        this.turnindex++;
    }
    this.applySpeedLimit();
    this.position = this.position.add(this.velocity);

    if (this.position.x > Game.gamearea_x) {
        this.position.x = 1;
    }
    if (this.position.y > Game.gamearea_y) {
        this.position.y = 1;
    }
    if (this.position.x < 0) {
        this.position.x = Game.gamearea_x - 1;
    }
    if (this.position.y < 0) {
        this.position.y = Game.gamearea_y - 1;
    }
};

Ship.prototype.turnRight = function() {
    this.angle += this.turningspeed;
    if (this.angle == 360)
    {
        this.angle = 0;
    }
};