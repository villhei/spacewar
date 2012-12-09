function TerranShip(pos_x, pos_y, id) {
    this.pos_x = pos_x;
    this.pos_y = pos_y;
    this.accelspeed = 0.04;
    this.angle = 0.0;
    this.size = 30;
    this.shieldradius = 42;
    this.radius = this.shieldradius;
    this.mass = this.size * 10;
    this.MAX_SPEED = 10;
    this.turningspeed = 2;
    this.travelangle = this.angle;
    this.travelspeed = 1;
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
    this.gravity_modifier = 0.05;
    this.imageUrl = 'img/testship.png';
    this.image = new Image();
    this.image.src = this.imageUrl;
    this.imagex = 115; // Hard-coded values
    this.imagey = 91; // Hard-coded values
}

TerranShip.prototype.getImage = function() {
    return this.image;
};

TerranShip.prototype.applyGravityPull = function(asteroids) {

    for (var i = 0; i < asteroids.length; ++i) {
        var mass = asteroids[i].mass;
        var pull_distance = this.distanceTo(asteroids[i]);
        var angle = this.angleTo(asteroids[i], pull_distance);
        this.vel_x -= Math.cos(angle * Math.PI / 180) * (mass / pull_distance) / Game.fps * this.gravity_modifier;
        this.vel_y -= Math.sin(angle * Math.PI / 180) * (mass / pull_distance) / Game.fps * this.gravity_modifier;
    }
};

TerranShip.prototype.detectHit = function(object) {
    var hit = this.weapon.hitObject(object);
    hit += this.weapon2.hitObject(object);
    return hit;
};

TerranShip.prototype.getThrustColor = function() {
    if (this.id == 1) {
        return 'rgba(86, 137, 227, 0.1)';
    }
    else {
        return 'rgba(255, 32, 0, 0.1)';
    }
};

TerranShip.prototype.takeDamage = function(amount) {
    this.health -= amount;
};

TerranShip.prototype.isAlive = function() {
    return this.health > 0;
};

TerranShip.prototype.distanceTo = function(that) {
    var dx = (that.pos_x) - (this.pos_x);
    var dy = (that.pos_y) - (this.pos_y);
    var distance = Math.sqrt(dx * dx + dy * dy);

    return distance;
};

TerranShip.prototype.squaredDistanceTo = function(that) {
    return this.getPosition().squaredLength(that.getPosition());
};

TerranShip.prototype.detectAsteroidCollision = function(asteroids) {
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

TerranShip.prototype.drawWeapon = function(ctx, ship, zoom, MIN) {
    this.weapon.drawWeaponFire(ctx, ship, zoom, MIN);
    this.weapon2.drawWeaponFire(ctx, ship, zoom, MIN);
};


TerranShip.prototype.angleTo = function(asteroid) {
    var dx = this.pos_x - asteroid.pos_x;
    var dy = this.pos_y - asteroid.pos_y;
    var angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return angle;
};
TerranShip.prototype.getHead = function() {
    var x = Math.cos(this.angle * Math.PI / 180) * this.size;
    var y = Math.sin(this.angle * Math.PI / 180) * this.size;

    return new Vector(x + this.pos_x, y + this.pos_y);
};

TerranShip.prototype.getRightCannon = function() {
    var x = Math.cos((this.angle + 40) * (Math.PI / 180)) * 0.4 * this.size;
    var y = Math.sin((this.angle + 40) * (Math.PI / 180)) * 0.4 * this.size;
    return new Vector(this.pos_x + x, this.pos_y + y);
}
;
TerranShip.prototype.getPosition = function() {
    return new Vector(this.pos_x, this.pos_y);
};

TerranShip.prototype.getLeftCannon = function() {
    var x = Math.cos((this.angle - 40) * (Math.PI / 180)) * 0.4 * this.size;
    var y = Math.sin((this.angle - 40) * (Math.PI / 180)) * 0.4 * this.size;
    return new Vector(this.pos_x + x, this.pos_y + y);
};

TerranShip.prototype.accelerate = function() {
    this.vel_x += Math.cos(this.angle * (Math.PI / 180)) * this.accelspeed;
    this.vel_y += Math.sin(this.angle * (Math.PI / 180)) * this.accelspeed;
    this.queueThrust();
};

TerranShip.prototype.queueThrust = function() {
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

TerranShip.prototype.dequeueThrust = function() {
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

TerranShip.prototype.applySpeedLimit = function() {
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

TerranShip.prototype.move = function() {
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


TerranShip.prototype.turnRight = function() {
    this.angle += this.turningspeed;
    if (this.angle == 360)
    {
        this.angle = 0;
    }
}

TerranShip.prototype.turnLeft = function() {
    this.angle -= this.turningspeed;
    if (this.angle < 0)
    {
        this.angle = 360 - Math.abs(this.turningspeed);
    }
}

TerranShip.prototype.fire = function() {
    this.firing = true;
    this.weapon.firing = true;
    this.weapon2.firing = true;
    this.weapon.fire(this.getLeftCannon(), this.angle);
    this.weapon2.fire(this.getRightCannon(), this.angle);
};

TerranShip.prototype.update = function() {
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
        if (this.weapon.firing) {
            this.weapon.update();
        }
        else {
            this.firing = false;
        }
    }
    this.weapon.update(this.getPosition(), this.angle);
    this.weapon2.update(this.getPosition(), this.angle);
};


TerranShip.prototype.getPolygonArray = function() {
    var polyCords = []
    var index = 0;
    var shipPart = this.getHead();
    polyCords[index] = []
    polyCords[index][0] = shipPart.x;
    polyCords[index][1] = shipPart.y;
    index++;
    shipPart = this.getLeftEnd();
    polyCords[index] = []
    polyCords[index][0] = shipPart.x;
    polyCords[index][1] = shipPart.y;
    index++;
    shipPart = this.getRightEnd();
    polyCords[index] = []
    polyCords[index][0] = shipPart.x;
    return polyCords;

};

TerranShip.prototype.isPointInTerranShip = function(pointX, pointY) {
    var polyCoords = this.getPolygonArray();
    var i, j, c = 0;
    for (i = 0, j = polyCoords.length - 1; i < polyCoords.length; j = i++) {
        if (((polyCoords[i][1] > pointY) != (polyCoords[j][1] > pointY))
                &&
                (pointX < (polyCoords[j][0] - polyCoords[i][0])
                        * (pointY - polyCoords[i][1]) / (polyCoords[j][1]
                        - polyCoords[i][1]) + polyCoords[i][0])) {
            c = !c;
        }
    }
    return c;
}

TerranShip.prototype.distanceTo = function(asteroid) {
    var dx = (asteroid.pos_x) - (this.pos_x);
    var dy = (asteroid.pos_y) - (this.pos_y);
    return Math.sqrt(dx * dx + dy * dy);
}

TerranShip.prototype.getTargetCoordinates = function() {
    var tgt_coords = this.getPosition();
    tgt_coords.x = tgt_coords.x + Math.cos(this.angle * Math.PI / 180) * this.weapon.range;
    tgt_coords.y = tgt_coords.y + Math.sin(this.angle * Math.PI / 180) * this.weapon.range;
    return tgt_coords;
}
