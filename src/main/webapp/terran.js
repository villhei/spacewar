function Terran(pos_x, pos_y, id) {
    Ship.call(this, pos_x, pos_y, id);
    this.accelspeed = 0.1;
    this.angle = 0.0;
    this.size = 50;
    this.shieldradius = 50;
    this.radius = this.shieldradius;
    this.mass = this.size * 10;
    this.MAX_SPEED = 10;
    this.turningspeed = 3;
    this.health = 100;
    this.thrustdistance = 25;
    this.weapon = new Cannon();
    this.weapon2 = new Cannon();
    this.modulo = 2;
    this.turnindex = 1;
    this.weaponrange = this.weapon.range;
    this.gravity_modifier = 0.0;
    this.imageUrl = 'img/testship.png';
    this.image = new Image();
    this.image.src = this.imageUrl;
    this.thrustColor = 'rgba(255, 32, 0, 0.1)';
}

Terran.prototype = new Ship();
Terran.prototype.constructor = Terran;


Terran.prototype.detectHit = function(object) {
    var hit = this.weapon.hitObject(object);
    hit += this.weapon2.hitObject(object);
    return hit;
};


Terran.prototype.drawWeapon = function(ctx, ship, zoom, MIN) {
    this.weapon.drawWeaponFire(ctx, ship, zoom, MIN);
    this.weapon2.drawWeaponFire(ctx, ship, zoom, MIN);
};


Terran.prototype.getRightCannon = function() {
    var x = Math.cos((this.angle + 40) * (Math.PI / 180)) * 0.4 * this.size;
    var y = Math.sin((this.angle + 40) * (Math.PI / 180)) * 0.4 * this.size;
    return new Vector(this.pos_x + x, this.pos_y + y);
}
;

Terran.prototype.getLeftCannon = function() {
    var x = Math.cos((this.angle - 40) * (Math.PI / 180)) * 0.4 * this.size;
    var y = Math.sin((this.angle - 40) * (Math.PI / 180)) * 0.4 * this.size;
    return new Vector(this.pos_x + x, this.pos_y + y);
};


Terran.prototype.fire = function() {
    this.firing = true;
    this.weapon.firing = true;
    this.weapon2.firing = true;
    this.weapon.fire(this, this.getLeftCannon(), this.angle);
    this.weapon2.fire(this, this.getRightCannon(), this.angle);
};