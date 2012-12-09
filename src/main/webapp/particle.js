/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function Particle(x, y) {
    this.x = x + Math.random() * 10 - 5;
    this.y = y + Math.random() * 10 - 5;
    this.vel_x = Math.random() * 2 - 1;
    this.vel_y = Math.random() * 2 - 1;
    this.lifetime = 45//;
    var r = Math.random() * 255 >> 0;
    var g = Math.random() * 255 >> 0;
    var b = Math.random() * 255 >> 0;
    this.color = "rgba(" + r + "," + g + "," + b + ", 0.5)";
    // this.color = "rgba(0,156,255,0.5)"
    // this.color = "rgba(255,0,0   ,0.5)"
    this.radius = 8;
}

Particle.prototype.initGradient = function(ctx) {
    var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.6, this.color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    return gradient;
}

Particle.prototype.getPosition = function() {
    return new Vector(this.x, this.y);
}


Particle.prototype.isAlive = function() {
    return this.lifetime > 0;
}

Particle.prototype.move = function() {
    this.x += this.vel_x;
    this.y += this.vel_y;
    this.lifetime--;
}

Particle.prototype.draw = function(ctx, image) {
	var delta_x = this.x-15/2;
	var delta_y = this.y-15/2;
	ctx.drawImage(image, delta_x, delta_y, 15, 15);
}

//Particle.prototype.draw = function(ctx) {
//    ctx.fillStyle = this.initGradient(ctx, this.x, this.y);
//    ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
//    ctx.fill();
//}
