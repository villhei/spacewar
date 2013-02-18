function AlienGunship(pos_x, pos_y, id) {
    Ship.call(this, pos_x, pos_y, id);
    this.accelspeed = 0.04;
    this.angle = 0.0;
    this.size = 50;
    this.shieldradius = 60;
    this.radius = this.shieldradius;
    this.mass = this.size * 10;
    this.MAX_SPEED = 10;
    this.health = 100;
    this.turningspeed = 1.5;
    this.c_thrust = false;
    this.selectedweapon = 0;
    this.thrustdistance = 25;
    this.weapon = new Laser();
    this.modulo = 2;
    this.turnindex = 1;
    this.weaponrange = this.weapon.range;
    this.gravity_modifier = 0.00;
    this.imageUrl = 'img/alien_gunship_dark.png';
    this.image = new Image();
    this.image.src = this.imageUrl;
    this.thrustColor = 'rgba(86, 137, 227, 0.1)';
}

AlienGunship.prototype = new Ship();
AlienGunship.prototype.constructor = AlienGunship;


AlienGunship.prototype.drawWeapon = function(ctx, ship, zoom, MIN) {
    this.weapon.drawWeaponFire(ctx, ship, zoom, MIN);
};


AlienGunship.prototype.detectHit = function(object) {
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

AlienGunship.prototype.getLaserOrigins = function() {

    var array = [];
    var x1 = Math.cos((this.angle + 68) * (Math.PI / 180)) * 0.60 * this.size;
    var y1 = Math.sin((this.angle + 68) * (Math.PI / 180)) * 0.60 * this.size;
    var x2 = Math.cos((this.angle + 62) * (Math.PI / 180)) * 0.80 * this.size;
    var y2 = Math.sin((this.angle + 62) * (Math.PI / 180)) * 0.80 * this.size;
    var x3 = Math.cos((this.angle + 54) * (Math.PI / 180)) * this.size;
    var y3 = Math.sin((this.angle + 54) * (Math.PI / 180)) * this.size;
    var x4 = Math.cos((this.angle + 51) * (Math.PI / 180)) * 1.1 * this.size;
    var y4 = Math.sin((this.angle + 51) * (Math.PI / 180)) * 1.1 * this.size;

    // Left Claw LASERS
//    var x5 = Math.cos((this.angle - 68) * (Math.PI / 180)) * 0.60 * this.size;
//    var y5 = Math.sin((this.angle - 68) * (Math.PI / 180)) * 0.60 * this.size;
//    var x6 = Math.cos((this.angle - 62) * (Math.PI / 180)) * 0.80 * this.size;
//    var y6 = Math.sin((this.angle - 62) * (Math.PI / 180)) * 0.80 * this.size;
//    var x7 = Math.cos((this.angle - 54) * (Math.PI / 180)) * this.size;
//    var y7 = Math.sin((this.angle - 54) * (Math.PI / 180)) * this.size;
//    var x8 = Math.cos((this.angle - 51) * (Math.PI / 180)) * 1.1 * this.size;
//    var y8 = Math.sin((this.angle - 51) * (Math.PI / 180)) * 1.1 * this.size;
    array.push(new Vector(this.pos_x + x1, this.pos_y + y1));
    array.push(new Vector(this.pos_x + x2, this.pos_y + y2));
    array.push(new Vector(this.pos_x + x3, this.pos_y + y3));
    array.push(new Vector(this.pos_x + x4, this.pos_y + y4));
    // Left Claw LASERS
//    array.push(new Vector(this.pos_x + x5, this.pos_y + y5));
//    array.push(new Vector(this.pos_x + x6, this.pos_y + y6));
//    array.push(new Vector(this.pos_x + x7, this.pos_y + y7));
//    array.push(new Vector(this.pos_x + x8, this.pos_y + y8));

    return array;
};

AlienGunship.prototype.angleTo = function(asteroid) {
    var dx = this.pos_x - asteroid.pos_x;
    var dy = this.pos_y - asteroid.pos_y;
    var angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return angle;
}

AlienGunship.prototype.getPosition = function() {
    return new Vector(this.pos_x, this.pos_y);
}

AlienGunship.prototype.accelerate = function() {
    this.vel_x += Math.cos(this.angle * (Math.PI / 180)) * this.accelspeed;
    this.vel_y += Math.sin(this.angle * (Math.PI / 180)) * this.accelspeed;
    this.queueThrust();
}

AlienGunship.prototype.queueThrust = function() {
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

AlienGunship.prototype.dequeueThrust = function() {
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

AlienGunship.prototype.applySpeedLimit = function() {
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

AlienGunship.prototype.move = function() {
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


AlienGunship.prototype.turnRight = function() {
    this.angle += this.turningspeed;
    if (this.angle == 360)
    {
        this.angle = 0;
    }
}

AlienGunship.prototype.turnLeft = function() {
    this.angle -= this.turningspeed;
    if (this.angle < 0)
    {
        this.angle = 360 - Math.abs(this.turningspeed);
    }
}

AlienGunship.prototype.fire = function() {
    this.firing = true;
    this.weapon.firing = true;
}

AlienGunship.prototype.update = function() {
    if (this.id == 1) {

        if (Key.isDown(Key.UP))
            this.accelerate();
        if (Key.isDown(Key.LEFT))
            this.turnLeft();
        if (Key.isDown(Key.RIGHT))
            this.turnRight();
        if (Key.isDown(Key.SPACE))
            this.fire();
        if (this.weapon.firing) {
            this.weapon.update();
        }
        else {
            this.firing = false;
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
        if (Key.isUp(Key.Q)) {
            this.firing = false;
            this.weapon.firing = false;
        }
        if (this.weapon.firing) {
            this.weapon.update();
        }
        else {
            this.firing = false;
        }
    }
}

AlienGunship.prototype.isPointInAlienGunship = function(pointX, pointY) {
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

AlienGunship.prototype.distanceTo = function(asteroid) {
    var dx = (asteroid.pos_x) - (this.pos_x);
    var dy = (asteroid.pos_y) - (this.pos_y);
    return Math.sqrt(dx * dx + dy * dy);
}

AlienGunship.prototype.getTargetCoordinates = function() {
    var tgt_coords = this.getPosition();
    tgt_coords.x = tgt_coords.x + Math.cos(this.angle * Math.PI / 180) * this.weapon.range;
    tgt_coords.y = tgt_coords.y + Math.sin(this.angle * Math.PI / 180) * this.weapon.range;
    return tgt_coords;
}
