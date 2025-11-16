class Enemy extends Boid {
  constructor(x, y) {
    super(x, y);

    // vitesse max plus lente que le player
    this.maxSpeed = 2;
    // force max plus faible (moins réactif)
    this.maxForce = 0.15;
    // rayon un peu plus petit que le joueur
    this.r = 15;

    // dégâts infligés au contact
    this.damage = 5;
    // dernière frame où il a touché le joueur
    this.lastDamageTime = 0;
    // 60 frames entre deux attaques
    this.damageCooldown = 60;

    // rayon pour détecter les autres zombies
    this.perceptionRadius = 50;
    // poids de la séparation
    this.separationWeight = 1.5;
    // poids de l’alignement
    this.alignWeight = 0.3;
    // poids de la cohésion
    this.cohesionWeight = 0.2;
  }

  // image partagée par tous les Enemy
  static image = null;

  // COMPORTEMENTS PRINCIPAUX DE L'ENNEMI
  // combine : seek + flocking + avoid + boundaries
  applyBehaviors(player, enemies, obstacles) {
    // 1 - SEEK vers le joueur (poursuite principale)
    let seekForce = this.seek(player.pos);
    seekForce.mult(1.2); // un peu plus agressif
    this.applyForce(seekForce);

    // 2 - SEPARATION : évite de se coller aux autres zombies
    let separationForce = this.separation(enemies, this.perceptionRadius);
    separationForce.mult(this.separationWeight);
    this.applyForce(separationForce);

    // 3 - ALIGN : garder la même direction que la horde
    let alignForce = this.align(enemies, this.perceptionRadius);
    alignForce.mult(this.alignWeight);
    this.applyForce(alignForce);

    // 4 - COHESION : rester groupé
    let cohesionForce = this.cohesion(enemies, this.perceptionRadius * 2);
    cohesionForce.mult(this.cohesionWeight);
    this.applyForce(cohesionForce);

    // 5 - AVOID : éviter les obstacles
    let avoidForce = this.avoid(obstacles);
    avoidForce.mult(2.5); // on donne une forte priorité à l’évitement
    this.applyForce(avoidForce);

    // 6 - BOUNDARIES : rester dans le canvas
    let boundariesForce = this.boundaries(0, 0, width, height, 30);
    boundariesForce.mult(1.5);
    this.applyForce(boundariesForce);
  }

  // COLLISION AVEC LE JOUEUR
  // simple : distance centres < somme des rayons
  checkCollision(player) {
    // distance euclidienne entre le zombie et le joueur
    let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);

    // si collision
    if (d < this.r + player.r) {
      // on applique les dégâts seulement si le cooldown est écoulé
      if (frameCount - this.lastDamageTime >= this.damageCooldown) {
        player.takeDamage(this.damage);
        this.lastDamageTime = frameCount;
      }
    }
  }

  // AFFICHAGE DU ZOMBIE
  show() {
    push();
    translate(this.pos.x, this.pos.y);

    // si l'image est chargée, on l'utilise
    if (Enemy.image) {
      imageMode(CENTER);
      // taille basée sur le rayon
      let imgSize = this.r * 2.5;
      image(Enemy.image, 0, 0, imgSize, imgSize);
    }

    pop();
  }
}
