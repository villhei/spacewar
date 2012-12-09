function Game() {
}
;

Game.initialize = function() {

    this.gamearea_x = 4200;
    this.gamearea_y = 2500;
    this.ships = []
    this.ships[0] = new TerranShip(this.gamearea_x / 2, this.gamearea_y / 2, 1);
    this.ships[1] = new AlienGunship(450, 450, 2);
    this.painter = new GameGraphicsPainter();
    this.fps = 60;
    this.frameskip = 1000 / this.fps;
    this.asteroids = this.generateInitialAsteroids(20);
    this.isrunning = true;
    this.window_min = Math.min(this.win_width, this.win_height);
};

var Key = {
    _pressed: {},
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SPACE: 32,
    R: 82,
    F: 70,
    D: 68,
    G: 71,
    Q: 81,
    LALT: 18,
    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },
    isUp: function(keyCode) {
        return !this._pressed[keyCode];
    },
    onKeyDown: function(event) {
        this._pressed[event.keyCode] = true;
    },
    onKeyUp: function(event) {
        delete this._pressed[event.keyCode];
    }
};

Game.drawGameElements = function() {

    this.painter.draw();
};

Game.generateInitialAsteroids = function(amount) {
    var asteroidarray = [];
    for (var i = 0; i < amount; ++i) {
        var asteroid = new Asteroid(Math.random() * this.gamearea_x, Math.random() * this.gamearea_y, 6 + 4 * i);
        if (i == 0) {
            asteroidarray.push(asteroid);
            continue;
        }
        while (asteroid.detectAsteroidCollision(asteroidarray)) {
            asteroid.pos_x = Math.random() * this.gamearea_x;
            asteroid.pos_y = Math.random() * this.gamearea_y;
        }
        asteroidarray.push(new Asteroid(Math.random() * this.gamearea_x, Math.random() * this.gamearea_y, 6 + 4 * i));
    }
    return asteroidarray;
}

Game.detectAsteroidCollisions = function() {
    for (var i = 0; i < this.asteroids.length; ++i) {
        this.asteroids[i].detectAsteroidCollision(this.asteroids);
    }
}

Game.updateAsteroids = function() {
    for (var i = 0; i < this.asteroids.length; ++i) {
        for (var j = 0; j < this.asteroids.length; ++j) {
            if (i == j) {
                continue;
            }
            this.asteroids[i].applyGravityPull(this.asteroids[j]);
        }
        this.asteroids[i].update();
    }
};

Game.updateGameState = function() {
    Game.updateShips();
    Game.detectShipCollisions();
    Game.detectFiringHits();
    Game.detectAsteroidCollisions();
    Game.updateAsteroids();

}

Game.detectShipCollisions = function() {
    for (var i = 0; i < Game.ships.length; ++i) {
        if (Game.ships[i].isAlive()) {
            Game.ships[i].detectAsteroidCollision(this.asteroids);
        }
    }
    // Game.ships[i].detectShipCollisions(this.ships);
};

Game.detectFiringHits = function() {

    for (var i = 0; i < Game.ships.length; ++i) {
        if (Game.ships[i].isAlive()) {
            Game.detectAsteroidHits(Game.ships[i]);
        }
    }
    Game.detectShipHits();
};

Game.detectShipHits = function() {
    for (var i = 0; i < Game.ships.length; ++i) {
        for (var j = 0; j < Game.ships.length; ++j) {
            if (i !== j) {
                if (Game.ships[i].isAlive() && Game.ships[j].isAlive()) {
                    var hit = Game.ships[i].detectHit(Game.ships[j]);
                    Game.ships[j].takeDamage(hit);
                }
            }
        }
    }
};


Game.detectAsteroidHits = function(ship) {
    for (var i in Game.asteroids) {
        if (ship.distanceTo(Game.asteroids[i]) <= ship.weaponrange) {
            var damageToAsteroid = 0;
            damageToAsteroid = ship.detectHit(Game.asteroids[i]);
            if (damageToAsteroid > 0) {
                Game.asteroids[i].takingFire(damageToAsteroid);
                if (this.asteroids[i].health <= 0)
                {
                    Game.asteroids[i].explodeToPieces();
                    Game.asteroids.splice(i, 1);
                }
            }
        }
    }
}


Game.updateShips = function() {
    for (var i = 0; i < Game.ships.length; ++i) {
        if (Game.ships[i].isAlive()) {
            Game.ships[i].update();
            Game.ships[i].applyGravityPull(Game.asteroids);
            Game.ships[i].move();

        }
    }
};

function startGame() {

    Game.run = (function() {
        var loops = 0, skipTicks = 1000 / 60;
        var maxFrameSkip = 10;
        var nextGameTick = (new Date).getTime();

        return function() {
            loops = 0;



            Game.updateGameState();
            nextGameTick += skipTicks;
            loops++;

            Game.drawGameElements();
        };
    })();

    window.addEventListener('keyup', function(event) {
        Key.onKeyUp(event);
        //    event.preventDefault();
    }, false);
    window.addEventListener('keydown', function(event) {
        Key.onKeyDown(event);
        //      event.preventDefault();
    }, false);

    Game.initialize();

    (function() {
        var onEachFrame;
        if (window.webkitRequestAnimationFrame) {
            onEachFrame = function(cb) {
                var _cb = function() {
                    cb();
                    webkitRequestAnimationFrame(_cb);
                }
                _cb();
            };
        } else if (window.mozRequestAnimationFrame) {
            onEachFrame = function(cb) {
                var _cb = function() {
                    cb();
                    mozRequestAnimationFrame(_cb);
                }
                _cb();
            };
        } else {
            onEachFrame = function(cb) {
                setInterval(cb, 1000 / 60);
            }
        }

        window.onEachFrame = onEachFrame;
    })();

    window.onEachFrame(Game.run);
//setInterval(function() {
//    Game.run();
//}, 1000/Game.fps);

}
