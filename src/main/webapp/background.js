function Background() {
    this.starArray = new Object();
    this.fillamount = 0.80;
    this.HEIGHT = window.innerHeight;
    this.WIDTH = window.innerWidth;
    this.canvasbg = document.getElementById("bg");
    this.ctx = this.canvasbg.getContext("2d");
    this.canvasbg.style.zIndex = "-1";
    this.bgImageUrl = 'img/planetred.png';

    this.backgroundImage = new Image();
    this.backgroundImage.src = this.bgImageUrl;

    this.canvasbg.style.background = "url('img/planetred.png')";
    this.ctx.canvas.height = this.HEIGHT;
    this.ctx.canvas.width = this.WIDTH;

}
;

Background.prototype.drawBackground = function() {

    this.ctx.canvas.height = document.body.clientHeight;
    this.ctx.canvas.width = document.body.clientWidth;
    var bgwidth = this.backgroundImage.width * 0.5;
    var bgheight = this.backgroundImage.height * 0.5;
    this.ctx.drawImage(this.backgroundImage, 0, 0, 800, 800);
    console.log("this.background: ", this.backgroundImage);
};


Background.prototype.drawAndMoveStars = function(direction) {
    for (i = 0; i < this.starArray.length; ++i) {
        var star = this.starArray[i];
        star.move(direction);
        // star.pulseCycle();
        star.drawStar();
    }
}

Background.prototype.generateStars = function(fillAmount) {

    var starArray = [];
    var max_size = Math.min(Game.gamearea_x, Game.gamearea_y) / 800;
    for (pos_x = 0; pos_x <= Game.gamearea_x; ++pos_x) {
        if (Math.random() <= fillAmount) {
            var newStar = new Star(max_size, pos_x, pos_y);
            var mod = 0;
            if (Math.random() >= 0.5) {
                mod = 1;
            }
            else {
                mod = -1;
            }
            newStar.velocityModifier = new Vector(mod, mod);
            var pos_y = Math.random() * Game.gamearea_y;

            newStar.setColor("rgba(255, 255, 255, 0.8)")
            starArray.push(newStar);
        }
    }
    return starArray;
}

Background.prototype.initBackground = function() {

    this.starArray = this.generateStars(this.fillamount);
}
