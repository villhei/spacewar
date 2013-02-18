function Ship(pos_x, pos_y, id) {
    this.pos_x = pos_x;
    this.pos_y = pos_y;
    this.accelspeed = 0.1;
    this.angle = 0.0;
    this.size = 50;
    this.shieldradius = 50;
    this.radius = this.shieldradius;
    this.mass = this.size * 10;
    this.MAX_SPEED = 10;
    this.turningspeed = 3;
    this.vel_x = 0;
    this.vel_y = 0;
    this.health = 100;
    this.thrustTail = [];
    this.c_thrust = false;
    this.selectedweapon = 0;
    this.thrustdistance = 25;
    this.weapon = new Cannon();
    this.weapon2 = new Cannon();
    this.id = id;
    this.modulo = 2;
    this.turnindex = 1;
    this.weaponrange = this.weapon.range;
    this.gravity_modifier = 0.0;
    this.imageUrl = 'img/testship.png'; // placeholder
    this.image = new Image();
    this.image.src = this.imageUrl;
    this.thrustColor = 'rgba(0, 0, 0, 0.5)';
};

// All classes implementing this need to implement the following:
// detectHit (integer with damage values) in order to detect weaponhits
// drawWeapon for weaponDrawing (firing)
// fire - weapon firing


Ship.prototype.getImage = function() {
    return this.image;
};

Ship.prototype.applyGravityPull = function(asteroids) {

    for (var i = 0; i < asteroids.length; ++i) {
        var mass = asteroids[i].mass;
        var pull_distance = this.distanceTo(asteroids[i]);
        var angle = this.angleTo(asteroids[i], pull_distance);
        this.vel_x -= Math.cos(angle * Math.PI / 180) * (mass / pull_distance) / Game.fps * this.gravity_modifier;
        this.vel_y -= Math.sin(angle * Math.PI / 180) * (mass / pull_distance) / Game.fps * this.gravity_modifier;
    }
};

Ship.prototype.getThrustColor = function() {
        return this.thrustColor;
};

Ship.prototype.takeDamage = function(amount) {
    this.health -= amount;
};

Ship.prototype.isAlive = function() {
    return this.health > 0;
};

Ship.prototype.distanceTo = function(that) {
    var dx = (that.pos_x) - (this.pos_x);
    var dy = (that.pos_y) - (this.pos_y);
    var distance = Math.sqrt(dx * dx + dy * dy);

    return distance;
};

Ship.prototype.squaredDistanceTo = function(that) {
    return this.getPosition().squaredLength(that.getPosition());
};

Ship.prototype.detectAsteroidCollision = function(asteroids) {
    for (var i = 0; i < asteroids.length; ++i) {
        var dist = asteroids[i].radius + this.shieldradius;
        if (dist > this.distanceTo(asteroids[i])) {
            //  console.log("ship collision")
			var jumpBackDistanceX = 2;
			if(this.vel_x > 0) {
				jumpBackDistanceX = -jumpBackDistanceX;
			}
			var jumpBackDistanceY = 2;
			if(this.vel_y > 0) {
				jumpBackDistanceY = -jumpBackDistanceY;
			}
            this.pos_x += jumpBackDistanceX;
            this.pos_y += jumpBackDistanceY;
			this.vel_x = -this.vel_x*0.5+1;
			this.vel_y = -this.vel_y*0.5+1;
        }

    }

};

Ship.prototype.angleTo = function(asteroid) {
    var dx = this.pos_x - asteroid.pos_x;
    var dy = this.pos_y - asteroid.pos_y;
    var angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return angle;
};
Ship.prototype.getHead = function() {
    var x = Math.cos(this.angle * Math.PI / 180) * this.size;
    var y = Math.sin(this.angle * Math.PI / 180) * this.size;

    return new Vector(x + this.pos_x, y + this.pos_y);
};

;
Ship.prototype.getPosition = function() {
    return new Vector(this.pos_x, this.pos_y);
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
}

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
}

Ship.prototype.applySpeedLimit = function() {
    if (this.vel_x >= this.MAX_SPEED) {
        this.vel_x = this.MAX_SPEED;
    }
    else if (this.vel_x <= -this.MAX_SPEED) {
        this.vel_x = -this.MAX_SPEED;
    }
    if (this.vel_y >= this.MAX_SPEED) {
        this.vel_y = this.MAX_SPEED;
    }
    else if (this.vel_y <= -this.MAX_SPEED) {
        this.vel_y = -this.MAX_SPEED;
    }
}

Ship.prototype.move = function() {
    if (this.turnindex % this.modulo == 0) {
        this.dequeueThrust();
        this.turnindex = 1;
    } else {
        this.turnindex++;
    }
    this.applySpeedLimit();
    this.pos_x += this.vel_x;
    this.pos_y += this.vel_y;

    if (this.pos_x > Game.gamearea_x) {
        this.pos_x = 1;
    }
    if (this.pos_y > Game.gamearea_y) {
        this.pos_y = 1;
    }
    if (this.pos_x < 0) {
        this.pos_x = Game.gamearea_x - 1;
    }
    if (this.pos_y < 0) {
        this.pos_y = Game.gamearea_y - 1;
    }
}


Ship.prototype.turnRight = function() {
    this.angle += this.turningspeed;
    if (this.angle == 360)
    {
        this.angle = 0;
    }
}

Ship.prototype.turnLeft = function() {
    this.angle -= this.turningspeed;
    if (this.angle < 0)
    {
        this.angle = 360 - Math.abs(this.turningspeed);
    }
}

Ship.prototype.update = function() {
    if (this.id == 1) {

        if (Key.isDown(Key.UP))
            this.accelerate();
        if (Key.isDown(Key.LEFT))
            this.turnLeft();
        if (Key.isDown(Key.RIGHT))
            this.turnRight();
        if (Key.isDown(Key.SPACE)) {
            this.fire();
        }
        else {
            this.firing = false;
            this.weapon.firing = false;
        }
    }
    else {
        if (Key.isDown(Key.R))
            this.accelerate();
        if (Key.isDown(Key.D))
            this.turnLeft();
        if (Key.isDown(Key.G))
            this.turnRight();
        if (Key.isDown(Key.Q))
            this.fire();
        else {
            this.firing = false;
        }
    }
    this.weapon.update(this.getPosition(), this.angle);
    this.weapon2.update(this.getPosition(), this.angle);
};

Ship.prototype.distanceTo = function(asteroid) {
    var dx = (asteroid.pos_x) - (this.pos_x);
    var dy = (asteroid.pos_y) - (this.pos_y);
    return Math.sqrt(dx * dx + dy * dy);
}

Ship.prototype.getTargetCoordinates = function() {
    var tgt_coords = this.getPosition();
    tgt_coords.x = tgt_coords.x + Math.cos(this.angle * Math.PI / 180) * this.weapon.range;
    tgt_coords.y = tgt_coords.y + Math.sin(this.angle * Math.PI / 180) * this.weapon.range;
    return tgt_coords;
}
