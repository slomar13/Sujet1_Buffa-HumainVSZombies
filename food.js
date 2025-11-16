class Food {
  constructor(x, y) {
    // Position
    this.pos = createVector(x, y);

    // Rayon visuel
    this.r = 15;
    // Points de vie rendus
    this.healAmount = 20;
    // Rayon de collecte
    this.collectRadius = 40;

    // Type (medkit | ration)
    this.type = random() > 0.5 ? 'medkit' : 'ration';
  }
  // CHECKCOLLECTION - Vérifie si le joueur collecte l'objet
  checkCollection(player) {
    // distance entre la nourriture et le joueur
    let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);

    // collecte si dans le rayon
    if (d < this.collectRadius) {
      player.heal(this.healAmount);
      return true;
    }

    return false;
  }

  // SHOW - Dessine la nourriture (medkit ou ration)
  show() {
    push();
    translate(this.pos.x, this.pos.y);
    
    if (this.type === 'medkit') {
      // TROUSSE DE SOIN (MEDKIT)
      
      // Boîtier blanc
      fill(255);
      stroke(200);
      strokeWeight(2);
      rect(-this.r, -this.r, this.r * 2, this.r * 2, 3);
      
      // Croix rouge (symbole médical)
      noStroke();
      fill(255, 0, 0);
      // Barre verticale
      rect(-3, -this.r + 3, 6, this.r * 2 - 6);
      // Barre horizontale
      rect(-this.r + 3, -3, this.r * 2 - 6, 6);
      
      // Reflet (effet de brillance)
      fill(255, 255, 255, 100);
      ellipse(-5, -5, 8, 8);
      
    } else {
      // RATION MILITAIRE
      
      // Boîte marron/kaki
      fill(139, 115, 85);
      stroke(100, 80, 60);
      strokeWeight(2);
      rect(-this.r, -this.r, this.r * 2, this.r * 2, 2);
      
      // Étiquette
      fill(220, 200, 150);
      noStroke();
      rect(-this.r + 3, -5, this.r * 2 - 6, 10);
      
      // Lignes de texte (simulation)
      stroke(100);
      strokeWeight(1);
      line(-this.r + 5, -2, this.r - 5, -2);
      line(-this.r + 5, 2, this.r - 8, 2);
      
      // Détails métalliques (coins)
      noFill();
      stroke(150);
      strokeWeight(2);
      // Coin supérieur gauche
      point(-this.r + 2, -this.r + 2);
      // Coin supérieur droit
      point(this.r - 2, -this.r + 2);
      // Coin inférieur gauche
      point(-this.r + 2, this.r - 2);
      // Coin inférieur droit
      point(this.r - 2, this.r - 2);
    }
    
    // ZONE DE COLLECTE (cercle indicateur)
    // Affiche un cercle semi-transparent qui pulse pour indiquer
    // la zone où le joueur peut collecter l'objet
    noFill();
    stroke(0, 255, 0, 80 + sin(frameCount * 0.1) * 40); // Effet de pulsation
    strokeWeight(2);
    circle(0, 0, this.collectRadius * 2);
    
    // EFFET DE BRILLANCE (indique que c'est collectible)
    // Petite étoile qui scintille
    push();
    rotate(frameCount * 0.05); // Rotation continue
    stroke(255, 255, 100, 150);
    strokeWeight(2);
    line(-this.r - 5, -this.r - 5, -this.r - 2, -this.r - 2);
    line(-this.r - 2, -this.r - 5, -this.r - 5, -this.r - 2);
    pop();
    
    pop();
  }
}