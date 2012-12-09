function AlienGunship(pos_x, pos_y, id) {
    Ship.call(this, pos_x, pos_y, id);
    this.ship = new Ship(pos_x, pos_y, id);
    this.ship.accelspeed = 0.04;
    this.ship.MAX_SPEED = 10;
    this.ship.health = 100;
    this.ship.turningspeed = 1.5;
    this.ship.shieldradius = 60;
    this.ship.radius = this.shieldradius;
    this.ship.mass = this.size * 10;
    this.ship.thrustdistance = 25;
    this.ship.travelspeed = 1;
    this.ship.thrustTail = [];
    this.ship.c_thrust = false;
    this.ship.gravity_modifier = 0.05;
    this.weapon = new Laser();
    this.weaponrange = this.weapon.range;
    this.thrustColor = 'rgba(255, 32, 0, 0.1)';
    this.imageUrl = 'img/alien_gunship_dark.png';
    this.image = new Image();
    this.image.src = this.imageUrl;

}

AlienGunShip.prototype = new Ship();

AlienGunShip.prototype.constructor = AlienGunShip;

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
