function Star(size, pos_x, pos_y) {
    this.size = size;
    this.pos_x = pos_x;
    this.pos_y = pos_y;
    this.pulse = 0;
    this.velocityModifier;
    this.backgroundAsteroidImage = new Image();
    this.bgAsteroidUrl = 'img/bgasteroid.png';
    this.backgroundAsteroidImage.src = this.bgAsteroidUrl;

    this.counter = 0;
    if (Math.random() > 0.5) {
        this.pulse_growing = true;
    }
    else {
        this.pulse_growing = false;
    }
    this.max_pulse = this.size * 0.6;
}

Star.prototype.resize = function(d_s) {
    if (this.size + d_s > 0) {
        this.size += d_s;
    }
}


Star.prototype.setColor = function(color) {
    this.color = color;
}

Star.prototype.pulseCycle = function() {
    if (this.pulse_growing) {
        this.size += 0.005;
        this.pulse += 0.005;
        if (this.pulse > this.max_pulse) {
            this.pulse_growing = false;
        }
    }
    else {
        this.size -= 0.005;
        this.pulse -= 0.005;
        if (this.pulse <= this.max_pulse - this.max_pulse * 2) {
            this.pulse_growing = true;
        }
    }
}

Star.prototype.move = function(velocity) {

    this.counter += 1 * this.speed;
    if (this.counter == 360 || this.counter == -360)
    {
        this.counter == 0;
    }
    this.pos_x += velocity.x*this.velocityModifier.x;
    this.pos_y += velocity.y*this.velocityModifier.x;

}

Star.prototype.drawStar = function() {
    var canvas = document.getElementById("c");
    var ctx = canvas.getContext("2d");
    ctx.beginPath();

    var x = this.pos_x + this.size / 2;
    var y = this.pos_y + this.size / 2;
    var ix = this.backgroundAsteroidImage.width;
    var iy = this.backgroundAsteroidImage.height;

    ctx.drawImage(this.backgroundAsteroidImage, x, y, ix, iy);
};
