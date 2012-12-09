function Laser(ship) {
    this.ammo = 10000;
    this.burst = 0;
    this.burst_len = 20;
    this.firing = false;
    this.damage = 1.5;
    this.ship = ship;
    this.range = 400;
    this.color0 = 'rgb(255,0,36)';
    this.color1 = 'rgb(128,0,128)';
    this.color2 = 'rgb(0,0,0)';
};

Laser.prototype.update = function() {
    if (this.firing && this.ammo > 0) {
        this.ammo--;
    }
    else {
        this.firing = false;
    }
};

Laser.prototype.drawWeaponFire = function(ctx, ship, zoomLevel, MIN_DRAW_POINT) {
    if(!this.firing) {
        return;
    }
    var position = ship.getPosition().subtract(MIN_DRAW_POINT).multiply(zoomLevel);
    var laserOrigins = ship.getLaserOrigins();
    var target = ship.getTargetCoordinates().subtract(MIN_DRAW_POINT).multiply(zoomLevel);
    ctx.beginPath();
    // j is a quick and dity hack to give good modulo numbers, not elegant, i know
    var j = 1;
    for (var i = 0; i < laserOrigins.length; ++i) {
        laserOrigins[i] = laserOrigins[i].subtract(MIN_DRAW_POINT).multiply(zoomLevel);
        ctx.moveTo(laserOrigins[i].x, laserOrigins[i].y);
        ctx.lineTo(target.x, target.y);
        ++j;
    }
    var drawColor = this.color0;
    if (new Date().getTime() % j === 0) {
        var drawColor = this.color1;
    }
    else if (new Date().getTime() % j === 0) {
        var drawColor = this.color2;
    }
    ctx.lineWidth = 1 * this.zoom;
    ctx.strokeStyle = drawColor;
    ctx.stroke();
    ctx.closePath();
};

Laser.prototype.hitObject = function(object, E, L) {
    var d = L.subtract(E);
    var f = E.subtract(object.getPosition());

    var a = d.dot(d);
    var b = 2 * f.dot(d);
    var c = f.dot(f) - object.radius * object.radius;
    var hit = false;

    var discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
        return false;
    }
    else {
        discriminant = Math.sqrt(discriminant);
        var t1 = (-b + discriminant) / (2 * a);
        var t2 = (-b - discriminant) / (2 * a);
        if (t1 >= 0 && t1 <= 1) {
            hit = true;
        }
        else {
            hit = false;
        }
        if (t2 >= 0 && t2 <= 1) {
            hit = true;
        }
        else {
            hit = false;
        }
        return hit;
    }
};
