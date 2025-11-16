class Projectile extends Boid {
  constructor(x, y, target) {
    super(x, y);
    // Vitesse max (projectile rapide)
    this.maxSpeed = 8;
    // Force de steering
    this.maxForce = 1;
    // Rayon du projectile
    this.r = 5;

    // Cible suivie
    this.target = target;

    // Durée de vie en frames
    this.lifetime = 360;
    // Age en frames
    this.age = 0;
  }
  // BEHAVIORS - Suit la cible avec pursue
  applyBehaviors() {
    // Vérification que la cible existe toujours (pas détruite)
    if (this.target && this.target.health !== undefined) {
      // COMPORTEMENT PURSUE : Guidage vers la cible
      // pursue() calcule la force nécessaire pour atteindre target.pos
      let pursueForce = this.pursue(this.target.pos);
      
      // Amplification importante pour un projectile rapide et réactif
      pursueForce.mult(2.5);
      this.applyForce(pursueForce);
    }
    // Si la cible n'existe plus, le projectile continue en ligne droite
    // (pas de force appliquée, donc conserve sa vitesse actuelle)
  }

  // CHECKCOLLISION - Vérifie et gère la collision avec les ennemis
  checkCollision(enemies) {
    // Parcours inverse pour pouvoir supprimer des éléments en toute sécurité
    for (let i = enemies.length - 1; i >= 0; i--) {
      // Calcul de la distance entre le projectile et l'ennemi
      let d = dist(this.pos.x, this.pos.y, enemies[i].pos.x, enemies[i].pos.y);
      
      // Collision si distance < somme des rayons
      if (d < this.r + enemies[i].r) {
        // Suppression de l'ennemi touché
        enemies.splice(i, 1);
        
        // Le projectile doit être détruit aussi
        return true;
      }
    }
    
    // Aucune collision détectée
    return false;
  }

  // UPDATE - Surcharge pour incrémenter l'âge
  update() {
    super.update(); // Appel de la mise à jour physique de Boid
    this.age++;     // Incrémentation de l'âge
  }

  // isDead - Indique si le projectile a dépassé sa durée de vie
  isDead() {
    return this.age >= this.lifetime;
  }

  // SHOW - Dessine le projectile, sa traînée et sa lueur
  show() {
    push();
    
    // ====== PROJECTILE PRINCIPAL ======
    fill(255, 255, 0);      // Jaune vif
    noStroke();
    circle(this.pos.x, this.pos.y, this.r * 2);
    
    // Dessine des cercles derrière le projectile pour simuler un effet de vitesse
    fill(255, 255, 0, 100); // Jaune transparent
    

    // Ajoute une aura lumineuse autour du projectile
    fill(255, 255, 100, 30);
    circle(this.pos.x, this.pos.y, this.r * 4);
    
    pop();
  }
}