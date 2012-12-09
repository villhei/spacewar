function GameGraphicsPainter() {
    this.canvas = document.getElementById("c");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.style.zIndex = "1";
    this.bg = new Background();
    this.bg.fillamount = 0.025;
    this.ctx.canvas.height = document.body.clientHeight - 5;
    this.ctx.canvas.width = document.body.clientWidth;
//    this.bg.initBackground();
    this.zoom = 0.7;
    this.lastCameraPosition = new Vector(0, 0);
    this.backgroundVelocity = new Vector(0, 0);
    this.camera = new Vector(0, 0);
    this.MAX = new Vector(0, 0);
    this.MIN = new Vector(0, 0);
    this.HEIGHT = window.innerHeight;
    this.WIDTH = window.innerWidth;
    this.minzoom = Math.max(this.HEIGHT / Game.gamearea_y, this.WIDTH / Game.gamearea_x);
    console.log("minzoom: ", this.minzoom)
    this.maxzoom = 1.5;
    this.zoomtarget = 0.3;
    this.zoomstep = 0.0001;
    this.modulo = 5;
    this.index = 1;
    this.particles = [];
    this.MAX_PARTICLES = 20;
    this.bg.initBackground();
    this.particleImages = [];
    this.initParticles();

}

GameGraphicsPainter.prototype.initParticles = function() {

    var imageURLS = ["img/particle_red.png", "img/particle_blue.png", "img/particle_purple.png"]
    for (var i = 0; i < imageURLS.length; ++i) {
        var particleimage = new Image();
        particleimage.src = imageURLS[i];
        this.particleImages.push(particleimage);
    }

}


GameGraphicsPainter.prototype.draw = function() {
    this.clearScreen();
    this.updateDrawableLimits();
    this.updateCamera();
    this.updateZoom();
    this.bg.drawAndMoveStars(this.backgroundVelocity);


    this.drawShips();
    this.drawAsteroids(Game.asteroids);
//  this.drawMapDebugBoundaries();

}


GameGraphicsPainter.prototype.drawMapDebugBoundaries = function() {
    this.ctx.beginPath();
    this.ctx.moveTo(1, 1);
    this.ctx.lineTo(Game.gamearea_x * this.zoom, 1);
    this.ctx.lineTo(Game.gamearea_x * this.zoom, Game.gamearea_y * this.zoom);
    this.ctx.lineTo(0, Game.gamearea_y * this.zoom);
    this.ctx.lineTo(1, 1);
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'rgb(255,255,255)';
    this.ctx.stroke();
    this.ctx.closePath();
}

function roundNumber(num, dec) {
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
}

GameGraphicsPainter.prototype.clearScreen = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

GameGraphicsPainter.prototype.updateZoomTarget = function() {
    var delta = Game.ships[0].getPosition().subtract(Game.ships[1].getPosition());
    delta.x = Math.abs(delta.x);
    delta.y = Math.abs(delta.y);
    var target = roundNumber(1 / (Math.max(delta.y * 1.4 / this.HEIGHT, delta.x * 1.4 / this.WIDTH)), 3);

    this.zoomtarget = target;
    if (this.zoomtarget < this.minzoom) {
        this.zoomtarget = this.minzoom;
    }

}

GameGraphicsPainter.prototype.updateZoom = function() {

    this.updateZoomTarget();
    this.index++;

    if (this.zoom < this.zoomtarget) {
        this.addZoom();
    }
    else if (this.zoom > this.zoomtarget) {
        this.reduceZoom();
    }
    for (var i in Game.ships) {
        var position = Game.ships[i].getPosition();
        if (!this.xbounds(position.x, 0.7) || !this.ybounds(position.y, 0.7)) {
            //    console.log("forcing update")
            this.updateZoomTarget();
            if (this.zoomtarget > this.maxzoom) {
                this.zoom = this.maxzoom
            } else {
                this.zoom = this.zoomtarget;
            }
        }
    }
};


GameGraphicsPainter.prototype.reduceZoom = function() {
    this.zoom -= this.zoomstep;
    if (this.zoom <= this.minzoom) {
        this.zoom = this.minzoom;
    }
};

GameGraphicsPainter.prototype.addZoom = function() {
    this.zoom += this.zoomstep;
    if (this.zoom >= this.maxzoom) {
        this.zoom = this.maxzoom;
        //        console.log("target zoom ", this.zoomtarget)
        //        console.log("zoom", this.zoom);
    }
};

GameGraphicsPainter.prototype.drawShips = function() {
    for (var i in Game.ships) {
        if (Game.ships[i].isAlive()) {
            this.drawShipThrust(Game.ships[i]);
            this.drawShipImage(Game.ships[i]);
            this.drawShipShield(Game.ships[i]);
            this.drawFiring(Game.ships[i]);

        }
    }
};

GameGraphicsPainter.prototype.updateDrawableLimits = function() {

    var half_x = this.WIDTH * (1 / this.zoom) / 2;
    var half_y = this.HEIGHT * (1 / this.zoom) / 2;
    this.MIN.x = Math.floor(this.camera.x - half_x);
    this.MAX.x = Math.ceil(this.camera.x + half_x);
    this.MIN.y = Math.floor(this.camera.y - half_y);
    this.MAX.y = Math.ceil(this.camera.y + half_y);
    if (this.MIN.x <= 0) {
        this.MIN.x = 0;
        this.MAX.x = this.WIDTH * (1 / this.zoom);
    }

    else if (this.MAX.x >= Game.gamearea_x) {
        this.MAX.x = Game.gamearea_x;
        this.MIN.x = this.MAX.x - this.WIDTH * (1 / this.zoom);
    }
    if (this.MIN.y <= 0) {
        this.MIN.y = 0;
        this.MAX.y = this.HEIGHT * (1 / this.zoom);
    }
    else if (this.MAX.y >= Game.gamearea_y) {
        this.MAX.y = Game.gamearea_y;
        this.MIN.y = this.MAX.y - this.HEIGHT * (1 / this.zoom);
    }

};

GameGraphicsPainter.prototype.vectorWithinBounds = function(vector) {
    return this.xbounds(vector.x) && this.ybounds(vector.y)
};

GameGraphicsPainter.prototype.xbounds = function(x, modifier) {
    if (typeof modifier === 'undefined') {
        modifier = 1;
        if (x >= this.MIN.x && x <= this.MAX.x) {
            return true;
        }
        return false;
    }
    if (x >= this.MIN.x + (1 / modifier) * this.MIN.y && x <= this.MAX.x * modifier) {
        return true;
    }
};

GameGraphicsPainter.prototype.ybounds = function(y, modifier) {
    if (typeof modifier === 'undefined') {
        if (y >= this.MIN.y && y <= this.MAX.y) {
            return true;
        }
        return false;
    }
    if (y >= this.MIN.y + (1 / modifier) * this.MIN.y && y <= this.MAX.y * modifier) {
        return true;
    }
    return false;
};

GameGraphicsPainter.prototype.asteroidWithinBounds = function(asteroid) {
    var x = false, y = false;
    if (this.vectorWithinBounds(asteroid.getPosition())) {
        x = true;
        y = true;
    }
    else if (this.xbounds(asteroid.pos_x - asteroid.radius) || this.xbounds(asteroid.pos_x + asteroid.radius)) {
        x = true;
    }
    if (x && (this.ybounds(asteroid.pos_y - asteroid.radius) || this.ybounds(asteroid.pos_y + asteroid.radius))) {
        y = true;
    }
    return x && y;
};

GameGraphicsPainter.prototype.updateCamera = function() {

    if (Game.ships.length > 1) {
        this.camera = Game.ships[0].getPosition().add(Game.ships[1].getPosition()).divide(2);
        this.backgroundVelocity = this.lastCameraPosition.subtract(this.camera);
        this.lastCameraPosition = this.camera;
        return;
    }
    var half_x = Math.floor(this.WIDTH / 2);
    var half_y = Math.floor(this.HEIGHT / 2);

    this.camera = Game.ships[0].getPosition();
    if (this.camera.x >= Game.gamearea_x - half_x) {
        this.camera.x = Game.gamearea_x - half_x;
    }
    else if (this.camera.x <= half_x) {
        this.camera.x = half_x;
    }
    if (this.camera.y >= Game.gamearea_y - half_y) {
        this.camera.y = Game.gamearea_y - half_y;
    }
    else if (this.camera.y <= half_y) {
        this.camera.y = half_y;
    }

};

GameGraphicsPainter.prototype.drawShipShield = function(ship) {
    var shieldradius = ship.shieldradius * this.zoom;

    var position = ship.getPosition().subtract(this.MIN).multiply(this.zoom);
    this.ctx.beginPath();
    var gradient = this.ctx.createRadialGradient(position.x, position.y, 0, position.x, position.y, shieldradius);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.5, 'rgba(0,128,255,0.2)');
    gradient.addColorStop(0.9, 'rgba(0,128,255,0.4)');
    gradient.addColorStop(1, 'rgba(0,212,255,0.2)');

    this.ctx.arc(position.x, position.y, shieldradius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.closePath();
};


GameGraphicsPainter.prototype.drawShipThrust = function(ship) {

    var position = ship.getPosition().subtract(this.MIN).multiply(this.zoom);

    var color = ship.getThrustColor();
    for (var i = 0; i < ship.thrustTail.length; i++) {
        for (var j = 0; j < ship.thrustTail[i].length; j++) {

            var thrust = ship.thrustTail[i][j].subtract(this.MIN).multiply(this.zoom);
            var arc_size = 3 + j * 0.2 * this.zoom;
            if (arc_size >= 10 * this.zoom) {
                arc_size = 10 * this.zoom;
            }
            if (arc_size <= 1) {
                continue;
            }
            this.ctx.beginPath();
            this.ctx.arc(thrust.x, thrust.y, arc_size, 2 * Math.PI, false);
            this.ctx.closePath();
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }
    }
};

GameGraphicsPainter.prototype.drawFiring = function(ship) {
    this.drawWeaponFire(ship);
};

GameGraphicsPainter.prototype.drawWeaponFire = function(ship) {
    ship.drawWeapon(this.ctx, ship, this.zoom, this.MIN);
};

GameGraphicsPainter.prototype.drawAsteroids = function(asteroids) {

    for (var i = 0; i < asteroids.length; ++i) {
        if (!this.asteroidWithinBounds(asteroids[i])) {
            continue;

        }
        this.drawAsteroidImage(asteroids[i]);
        //   this.drawAsteroidDebugHitBox(asteroids[i]);
        this.drawParticles(asteroids[i]);
    }
};

GameGraphicsPainter.prototype.drawParticles = function(object) {

    if (this.particles.length < this.MAX_PARTICLES && object.underFire && this.vectorWithinBounds(object.getPosition())) {
        var objectpos = object.getPosition().subtract(this.MIN).multiply(this.zoom);
        this.particles.push(new Particle(objectpos.x, objectpos.y));
    }
    for (var i in this.particles) {
        //if (this.vectorWithinBounds(this.particles[i].getPosition())) {

        var random = Math.floor(Math.random() * this.particleImages.length);
        this.particles[i].draw(this.ctx, this.particleImages[random]);
        // }
        this.particles[i].move();
    }

    while (this.particles.length > 0 && !this.particles[0].isAlive()) {
        this.particles.shift();
    }
    object.particleDrawDone();
};

GameGraphicsPainter.prototype.drawAsteroidDebugHitBox = function(asteroid) {
    var zoomModifier = (1 / this.zoom);
    var pos_asteroid = asteroid.getPosition().subtract(this.MIN).multiply(this.zoom);
    var drawRadius = asteroid.radius * this.zoom;
    var tint_b = 140 + asteroid.tint;
    this.ctx.beginPath();
    this.ctx.arc(pos_asteroid.x, pos_asteroid.y, drawRadius, 0, 2 * Math.PI, false);
    this.ctx.closePath();
    // +0.3 is a lonely value here, this is a most definitely a bug.
    // used to be like (i-i+0.3) from outer function for-loop
    // this was left looking lonely in refactoring.
    // Not fixing now, moving on to imagePainter
    this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
    this.ctx.fill();
}

GameGraphicsPainter.prototype.drawAsteroidArcs = function(asteroid) {
    var zoomModifier = (1 / this.zoom);
    var pos_asteroid = asteroid.getPosition().subtract(this.MIN).multiply(this.zoom);
    var asteroid_color = asteroid.getColor();
    var drawRadius = asteroid.radius * this.zoom;

    //        this.ctx.beginPath();
    //        this.ctx.arc(pos_asteroid.x, pos_asteroid.y, drawRadius, 0, 2*Math.PI, false);
    //        this.ctx.closePath();
    //        this.ctx.fillStyle = 'rgb(0,0,0)';
    //        this.ctx.fill();

    for (var delta_size = 1; delta_size > 0.4; delta_size -= 0.02 * zoomModifier) {
        this.ctx.beginPath();
        var tint_b = 140 + asteroid.tint;
        this.ctx.arc(pos_asteroid.x, pos_asteroid.y, drawRadius * delta_size, 0, 2 * Math.PI, false);
        this.ctx.closePath();
        // +0.3 is a lonely value here, this is a most definitely a bug.
        // used to be like (i-i+0.3) from outer function for-loop
        // this was left looking lonely in refactoring.
        // Not fixing now, moving on to imagePainter
        this.ctx.fillStyle = asteroid_color + asteroid.getAlphaChannelTint() + ')';
        this.ctx.fill();
    }
}

GameGraphicsPainter.prototype.drawShipImage = function(ship) {
    var shipImage = ship.getImage();
    var pos_ship = ship.getPosition().subtract(this.MIN).multiply(this.zoom);
    var drawRadius = ship.size * this.zoom;
    var imagex = ship.size * 2 * this.zoom;
    var imagey = ship.size * 2 * this.zoom;
    this.ctx.translate(pos_ship.x, pos_ship.y);
    this.ctx.rotate(ship.angle * Math.PI / 180);
    this.ctx.drawImage(shipImage, -(imagex / 2), -(imagey / 2), imagex, imagey)
    this.ctx.rotate(-ship.angle * Math.PI / 180);
    this.ctx.translate(-pos_ship.x, -pos_ship.y);
}

GameGraphicsPainter.prototype.drawAsteroidImage = function(asteroid) {
    var asteroidImage = asteroid.getImage();
    var pos_asteroid = asteroid.getPosition().subtract(this.MIN).multiply(this.zoom);
    var drawRadius = asteroid.radius * this.zoom;
    var imagex = asteroid.radius * 2 * this.zoom;
    var imagey = asteroid.radius * 2 * this.zoom;
    this.ctx.translate(pos_asteroid.x, pos_asteroid.y);
    this.ctx.rotate(asteroid.angle * Math.PI / 180);
    this.ctx.drawImage(asteroidImage, -(imagex / 2), -(imagey / 2), imagex, imagey)
    this.ctx.rotate(-asteroid.angle * Math.PI / 180);
    this.ctx.translate(-pos_asteroid.x, -pos_asteroid.y);
}
