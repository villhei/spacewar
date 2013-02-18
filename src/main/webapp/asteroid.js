function Asteroid(pos_x, pos_y, radius) {
    this.pos_x = pos_x;
    this.pos_y = pos_y;
    this.vel_x = (1*Math.random()-0.5+0.1)*2;
    this.vel_y = (1*Math.random()-0.5+0.1)*2;
    this.radius = radius;  
    this.growing = false;
    this.restitution = 0.005;
    this.massrandom = Math.random();
    this.mass = 10*this.radius;
    this.tint = Math.floor(60*this.massrandom);
    this.tint_b = 140 + this.tint;
    this.color = 'rgba(34, 77,';
    this.MAX_HEALTH = this.mass/30;
    this.health = this.MAX_HEALTH;
    this.MAX_SPEED = 0.6;
    this.angle = 0;
    this.rotatespeed = 1;
    this.imageUrl = 'img/asteroid_1.png';
    this.image = new Image();
    this.image.src = this.imageUrl;
    this.imagex = 120; // Hard-coded values
    this.imagey = 120; // Hard-coded values
};


Asteroid.prototype.getImage = function() {
    return this.image;
};

Asteroid.prototype.takingFire = function(damage) {
    this.underFire = true;
    this.health -= damage;
};

Asteroid.prototype.particleDrawDone = function() {
    this.underFire = false;
}

Asteroid.prototype.getParticleArray = function() {
    return this.particles;
}

Asteroid.prototype.move = function() {
    this.applySpeedLimit();
    this.pos_x -= this.vel_x;
    this.pos_y -= this.vel_y;
    this.rotate();
    
    //    if(this.pos_x > Game.gamearea_x) {
    //        this.pos_x = 0 -this.radius*2;
    //    }
    //    else if(this.pos_x < 0) {
    //        this.pos_x = Game.gamearea_x+this.radius;
    //    }
    //    if(this.pos_y-this.radius*2>= Game.gamearea_y) {
    //        this.pos_y = 0;
    //    }
    //    else if(this.pos_y < 0) {
    //        this.pos_y = Game.gamearea_y-this.radius*2;
    //    }
}

Asteroid.prototype.rotate = function() {
    if(this.angle >= 360) {
        this.angle = 0;
    }
    else if(this.angle <= 0){
        this.angle = 360;
    }
    this.angle += this.rotatespeed;
}

Asteroid.prototype.applySpeedLimit = function() {
    if(this.vel_x > this.maxvel) {
        this.vel_x = this.maxvel;
    }
    if(this.vel_x < -this.maxvel) {
        this.vel_x = -this.maxvel;
    }
    if(this.vel_y > this.maxvel) {
        this.vel_y = this.maxlvel;
    }
    if(this.vel_y < -this.maxvel) {
        this.vel_y = this.maxvel;
    }
}

Asteroid.prototype.update = function() {

if(this.health < this.MAX_HEALTH){
    this.health++;
}
this.move();
}

Asteroid.prototype.getPosition = function() {
return new Vector(this.pos_x, this.pos_y);
}

Asteroid.prototype.getRawPosition = function() {
return new Vector(this.pos_x, this.pos_y);
}

Asteroid.prototype.applyGravityPull = function(neighbourgh) {
var pull_distance = this.distanceToAsteroid(neighbourgh);
var angle = this.angleTo(neighbourgh);
this.vel_x += Math.cos(angle*Math.PI/180)*(neighbourgh.mass*this.mass/1000)/pull_distance*pull_distance/10000*(1/Game.fps);
this.vel_y += Math.sin(angle*Math.PI/180)*(neighbourgh.mass*this.mass/1000)/pull_distance*pull_distance/10000*(1/Game.fps);

}

Asteroid.prototype.explodeToPieces = function() {
var new_size = this.radius/4;
var new_mass = this.mass/4;
if(new_size <= 8) {
    return;
}
Game.asteroids.push(new Asteroid(this.pos_x-new_size*1.2, this.pos_y-new_size*1.2, new_size));
Game.asteroids.push(new Asteroid(this.pos_x-new_size*1.2, this.pos_y+new_size*1.2, new_size));
Game.asteroids.push(new Asteroid(this.pos_x+new_size*1.2, this.pos_y+new_size*1.2, new_size));
Game.asteroids.push(new Asteroid(this.pos_x+new_size*1.2, this.pos_y-new_size*1.2, new_size));
}

Asteroid.prototype.detectAsteroidCollision = function(asteroids) {
var col = false;
for(var i = 0 ; i < asteroids.length ; ++i) {
    if(this.pos_x == asteroids[i].pos_x && this.pos_y == asteroids[i].pos_y) {
        continue;
    }
    var distance = this.radius+asteroids[i].radius;
    distance *= distance;
    if(this.compareDistance(asteroids[i]) <= distance){
        this.applyAsteroidCollisionRules(asteroids[i]);
        col = true;     
    }
}
return col;
}

Asteroid.prototype.applyAsteroidCollisionRules = function(asteroid) {
    
var dx = this.pos_x-asteroid.pos_x;
var dy = this.pos_y-asteroid.pos_y;
var dl = Math.sqrt(dx*dx+dy*dy);
var mtd_x = dx*(((this.radius + asteroid.radius)-dl)/dl);
var mtd_y = dy*(((this.radius + asteroid.radius)-dl)/dl);
var im1 = 1 / this.mass;
var im2 = 1 / asteroid.mass;
this.pos_x += mtd_x*(im1 / (im1 + im2));
this.pos_y += mtd_y*(im1 / (im1 + im2));
asteroid.pos_x -= mtd_x*(im2 / (im1 + im2));
asteroid.pos_y -= mtd_y*(im2 / (im1 + im2));
var i_vel_x = this.vel_x - asteroid.vel_x;
var i_vel_y = this.vel_y - asteroid.vel_y;
var vn = i_vel_x*(mtd_x/dl) + i_vel_y*(mtd_y/dl);
if(vn > 0.0) return;
var i = (-(1.0 + this.restitution) * vn) / (im1 + im2);
var imp_x = mtd_x * i;
var imp_y = mtd_y * i;
this.vel_x += imp_x*im1*10;
this.vel_y += imp_y*im1*10; 
asteroid.vel_x -= imp_x*im2*10;
asteroid.vel_y -= imp_y*im2*10;
}


Asteroid.prototype.compareDistance = function(asteroid) {
return asteroid.getPosition().subtract(this.getPosition()).squaredLength();	
}

Asteroid.prototype.distanceToAsteroid = function(asteroid) {
return this.distanceToCoordinate(asteroid.getPosition());
}

Asteroid.prototype.distanceToCoordinate = function(coordinate) {
var dx = coordinate.x - (this.pos_x);
var dy = coordinate.y - (this.pos_y);
return Math.sqrt(dx*dx + dy*dy);
}

Asteroid.prototype.distanceToShip = function(ship) {
return this.distanceToCoordinate(ship.getPosition());
}

Asteroid.prototype.angleTo = function(asteroid) {
var dx = this.pos_x - asteroid.pos_x;
var dy = this.pos_y - asteroid.pos_y;
var	angle = Math.atan2(dy, dx)*(180/Math.PI);
return angle;
}

Asteroid.prototype.angleToShip = function(ship) {
var dx = this.pos_x - ship.pos_x;
var dy = this.pos_y - ship.pos_x;
var	angle = Math.atan2(dy, dx)*(180/Math.PI);
return angle;
}
