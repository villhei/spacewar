function Vector(x, y){
    this.x = x;
    this.y = y;
}

Vector.prototype.dot = function(other){
    return this.x*other.x + this.y*other.y;
}

Vector.prototype.multiply = function(value){
    return new Vector(this.x*value, this.y*value);
}

Vector.prototype.length = function(){
    return Math.sqrt(this.x*this.x+this.y*this.y);
}

Vector.prototype.squaredLength = function(){
	return (this.x*this.x+this.y*this.y);
}

Vector.prototype.normalize = function(){
    return new Vector(this.x/this.length(), this.y/this.length());
}

Vector.prototype.subtract = function(vector){
    return new Vector(this.x-vector.x, this.y-vector.y);
}

Vector.prototype.add = function(vector) {
    return new Vector(this.x+vector.x, this.y+vector.y);
}

Vector.prototype.divide = function(value) {
	return new Vector(this.x/value, this.y/value)
}

Vector.prototype.deltax = function(vector) {
	return this.x-vector.x;
}

Vector.prototype.deltay = function(vector) {
	return this.y-vector.y;
}
