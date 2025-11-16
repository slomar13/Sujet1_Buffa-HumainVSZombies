class Player extends Boid {
  constructor(x, y) {
    super(x, y);
    
    // Statistiques du joueur
    this.maxHealth = 100;
    this.health = this.maxHealth;
    
    // Vitesse modérée pour un humain
    this.maxSpeed = 4;    
    // Force de steering moyennement réactive
    this.maxForce = 0.3; 
    // Rayon du joueur
    this.r = 20;            
    
    // Système de tir automatique
    this.lastShootTime = 0;
    // Nombre de frames entre chaque tir (30 = 0.5s à 60fps)
    this.shootCooldown = 30; 
  }

  // Image statique partagée
  static image = null;

  // BEHAVIORS - Combine arrive, avoid et boundaries
  applyBehaviors(mousePos, obstacles) {
    // COMPORTEMENT ARRIVE : Le joueur suit le curseur de la souris
    // C'est le comportement principal qui permet au joueur de se déplacer
    let arriveForce = this.arrive(mousePos);
    arriveForce.mult(1.5); // Amplification x1.5 pour une bonne réactivité
    this.applyForce(arriveForce);
    
    // COMPORTEMENT AVOID : Éviter les obstacles
    // Force élevée pour une évitement prioritaire
    let avoidForce = this.avoid(obstacles);
    avoidForce.mult(3); // Poids très élevé pour le joueur
    this.applyForce(avoidForce);
    
    // COMPORTEMENT BOUNDARIES : Rester dans les limites du canvas
    // Distance de détection = 50 pixels des bords
    // Force multipliée par 2 pour un effet de "mur" plus fort
    let boundariesForce = this.boundaries(0, 0, width, height, 50);
    boundariesForce.mult(2);
    this.applyForce(boundariesForce);
  }

  // SHOOT - Tire automatiquement vers l'ennemi le plus proche (cooldown)
  shoot(enemies, projectiles) {
    // Vérification du cooldown : peut-on tirer ?
    // frameCount = nombre total de frames écoulées depuis le début
    if (frameCount - this.lastShootTime >= this.shootCooldown) {
      
      // Utilisation de getVehiculeLePlusProche() héritée de Boid
      // Trouve automatiquement la cible optimale
      let target = this.getVehiculeLePlusProche(enemies);
      
      if (target) {
        // Création d'un projectile qui utilisera PURSUE pour suivre la cible
        // Le projectile part de la position actuelle du joueur
        let projectile = new Projectile(this.pos.x, this.pos.y, target);
        projectiles.push(projectile);
        
        // Mise à jour du temps du dernier tir
        this.lastShootTime = frameCount;
      }
    }
  }

  // DAMAGE - Réduit la vie du joueur
  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
  }

  // HEAL - Augmente la vie du joueur
  heal(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) this.health = this.maxHealth;
  }

  // SHOW - Dessine le joueur et la barre de vie
  show() {
    push();
    translate(this.pos.x, this.pos.y);
    
    
    // ====== AFFICHAGE DE L'IMAGE ======
    if (Player.image) {
      imageMode(CENTER);
      // Taille de l'image basée sur le rayon du joueur
      let imgSize = this.r * 2.5;
      image(Player.image, 0, 0, imgSize, imgSize);
    } 
    
    pop();
    
    // ====== BARRE DE VIE  ======
    push();
    translate(this.pos.x, this.pos.y);
    
    noStroke();
    let barWidth = this.r * 2;
    let barHeight = 4;
    let healthPercent = this.health / this.maxHealth;
    
    // Fond de la barre (rouge)
    fill(255, 0, 0);
    rect(-barWidth/2, this.r + 8, barWidth, barHeight);
    
    // Partie verte (vie restante)
    fill(0, 255, 0);
    rect(-barWidth/2, this.r + 8, barWidth * healthPercent, barHeight);
    
    // Contour de la barre
    noFill();
    stroke(255);
    strokeWeight(1);
    rect(-barWidth/2, this.r + 8, barWidth, barHeight);
    
    pop();
  }
}