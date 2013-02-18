function Cannon(ship) {
    this.ammo = 10000;
    this.firing = false;
    this.damage = 6;
    this.ship = ship;
    this.range = 500;
    this.color = 'rgb(255,255,255)';
    this.firespeed = 1000 / 3;
    this.projectiles = [];
    this.projectileSize = 2;
    this.projectileVelocity = 10;
    this.lastFire = null;
    this.fireInterval = 1000 / 12.5;
}
;

Cannon.prototype.fire = function(ship, firePosition, angle) {
    if (this.firing === true) {
        var time = new Date().getTime();
        if (this.lastFire === null || this.lastFire + this.fireInterval - time < 0) {
            var vel_x = ship.vel_x + Math.cos(angle * Math.PI / 180) * this.projectileVelocity;
            var vel_y = ship.vel_y + Math.sin(angle * Math.PI / 180) * this.projectileVelocity;
            var projectile = new Projectile(firePosition, new Vector(vel_x, vel_y), this.range, this.projectileVelocity);
            this.projectiles.push(projectile);
            this.lastFire = time;
        }
    }
};

Cannon.prototype.update = function(firePosition, angle) {
    for (var i = 0; i < this.projectiles.length; ++i) {
        this.projectiles[i].move();
    }
    while (this.projectiles.length > 0 && this.projectiles[0].lifetime <= 0) {
        this.projectiles.shift();
    }
};

function Projectile(position, velocity, range, projectileVelocity) {
    this.position = position;
    this.velocity = velocity;
    this.lifetime = range;
    this.projectileVelocity = projectileVelocity;
    this.alive = true;
}
;

Projectile.prototype.move = function() {
    this.position = this.position.add(this.velocity);
    this.lifetime -= this.projectileVelocity;
};

Projectile.prototype.squaredDistance = function(object) {
    var objectPos = object.getPosition();
    var dx = this.position.deltax(objectPos);
    var dy = this.position.deltay(objectPos);
    return dx * dx + dy * dy;
};

Cannon.prototype.drawWeaponFire = function(ctx, ship, zoomLevel, MIN_DRAW_POINT) {


    for (var i = 0; i < this.projectiles.length; ++i) {
        if (this.projectiles[i] == null || !this.projectiles[i].alive) {
            continue;
        }
        var position = this.projectiles[i].position.subtract(MIN_DRAW_POINT).multiply(zoomLevel);
        ctx.beginPath();
        ctx.arc(position.x, position.y, this.projectileSize* zoomLevel, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

};



Cannon.prototype.hitObject = function(object) {
    var targetPosition = object.getPosition();
    var hitDistance = this.projectileSize + object.radius;
    hitDistance *= hitDistance;
    var hit = 0;
    for (var i = 0; i < this.projectiles.length; ++i) {
        if (this.projectiles[i].alive && this.projectiles[i].squaredDistance(object) <= hitDistance) {
            hit += this.damage;
            this.projectiles[i].alive = false;
        }
    }
    return hit;
};
