class Obstacle {
  constructor(x, y, r = 70) {
    this.pos = createVector(x, y);
    this.r = r;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    if (Obstacle.image) {
      imageMode(CENTER);
      image(Obstacle.image, 0, 0, this.r * 2, this.r * 2);
    }

    pop();
  }
}
