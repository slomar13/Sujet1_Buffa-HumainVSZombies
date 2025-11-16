class Boid {
  static debug = false;

  constructor(x, y) {
    // position du véhicule
    this.pos = createVector(x, y);
    // vitesse du véhicule
    this.vel = p5.Vector.random2D();
    this.vel.setMag(random(2, 4));
    // accélération du véhicule
    this.acc = createVector();

    // force maximale appliquée au véhicule
    this.maxForce = 0.2;
    // vitesse maximale du véhicule
    this.maxSpeed = 5;
    //rayon du véhicule
    this.r = 16;
  }

  //méthode seek
  seek(target, arrival = false, d = 0) {
    // on calcule la direction vers la cible
    // C'est l'ETAPE 1 (action : se diriger vers une cible)
    let force = p5.Vector.sub(target, this.pos);
    let desiredSpeed = this.maxSpeed;

    // ====== COMPORTEMENT ARRIVE (arrivée avec ralentissement) ======
    if (arrival) {
      // Rayon de la zone de freinage (100)
      let rayonZoneDeFreinage = 100;

      // 1 - dessiner le cercle de rayon 100 autour de la target
      if (Boid.debug) {
        push();
        stroke(255, 255, 255);
        noFill();
        circle(target.x, target.y, rayonZoneDeFreinage * 2);
        pop();
      }

      // 2 - calcul de la distance entre la position actuelle et la cible
      let distance = p5.Vector.dist(this.pos, target);

      // 3 - si distance < rayon du cercle, alors on modifie desiredSPeed
      // qui devient inversement proportionnelle à la distance.
      // si d = rayon alors desiredSpeed = maxSpeed
      // si d = 0 alors desiredSpeed = 0
      if (distance < rayonZoneDeFreinage) {
        desiredSpeed = map(distance, d, rayonZoneDeFreinage, 0, this.maxSpeed);
      }
    }

    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  // Le deuxieme argument true active le comportement d'arrivée
  // Le troisieme argument d est la distance derrière la cible
  // pour le comportement "snake"
  arrive(target, d = 0) {
    return this.seek(target, true, d);
  }

  // inverse de seek
  flee(target) {
    return this.seek(target).mult(-1);
  }

  //Poursuite d'un point devant la target !
  //cette methode renvoie la force à appliquer au véhicule
  pursue(target, rayonDetection) {
    // 0 - Sécurité : si pas de cible, aucune force
    if (!target || !target.pos || !target.vel) {
      return createVector(0, 0);
    }

    // 1 - on dessine le cercle de détection
    // on ne l'affiche que si le debug est activé
    if (Boid.debug) {
      push();
      noFill();
      stroke("white");
      circle(this.pos.x, this.pos.y, rayonDetection);
      pop();
    }

    // 2 - On ne poursuit que si la cible est dans le rayon de détection
    let d = p5.Vector.dist(this.pos, target.pos);
    if (d > rayonDetection) {
      // En dehors du rayon donc aucune force de poursuite
      return createVector(0, 0);
    }

    // 3 - Calcul de la position future de la cible
    // on fait une copie de la vitesse de la target
    let prediction = target.vel.copy();

    // on multiplie par 10 → position estimée dans ~10 frames
    prediction.mult(10);

    // on place ce vecteur au bout de la position de la target
    prediction.add(target.pos); // prediction = positionFuture

    // 4 - Dessin du vecteur de prédiction (option debug)
    if (Boid.debug && this.drawVector) {
      let v = p5.Vector.sub(prediction, target.pos);
      this.drawVector(target.pos, v);
    }

    // 5 - Dessin d'un point vert à la position future (option debug)
    if (Boid.debug) {
      push();
      fill("green");
      noStroke();
      circle(prediction.x, prediction.y, 16);
      pop();
    }

    // 6 -appel à seek avec ce point comme cible
    let force = this.seek(prediction);

    // On renvoie la force à appliquer au véhicule
    return force;
  }


  // UTIL - Retourne le véhicule le plus proche d'un tableau de véhicules
  getVehiculeLePlusProche(vehicules) {
    let plusPetiteDistance = Infinity;
    let vehiculeLePlusProche = null;
    
    vehicules.forEach(v => {
      if (v != this) {
        // Calcul de la distance euclidienne entre les deux positions
        const distance = this.pos.dist(v.pos);
        if (distance < plusPetiteDistance) {
          plusPetiteDistance = distance;
          vehiculeLePlusProche = v;
        }
      }
    });
    
    return vehiculeLePlusProche;
  }

  // AVOID - Évite les obstacles devant le boid
  avoid(obstacles) {
    // Largeur de la zone d'évitement devant le boid
    let largeurZoneEvitement = this.r * 2;
    
    // ====== CALCUL DES VECTEURS AHEAD (anticipation) ======
    // ahead1 : regarde 30 frames devant
    let ahead = this.vel.copy();
    ahead.mult(30);
    let pointAuBoutDeAhead = p5.Vector.add(this.pos, ahead);
    
    // ahead2 : regarde 15 frames devant (plus court)
    let ahead2 = this.vel.copy();
    ahead2.mult(15);
    let pointAuBoutDeAhead2 = p5.Vector.add(this.pos, ahead2);
    
    // ====== MODE DEBUG : Visualisation ======
    if (Boid.debug) {
      // Vecteur ahead long (jaune)
      push();
      stroke(255, 255, 0);
      strokeWeight(2);
      line(this.pos.x, this.pos.y, pointAuBoutDeAhead.x, pointAuBoutDeAhead.y);
      fill(255, 0, 0);
      noStroke();
      circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, 10);
      pop();
      
      // Vecteur ahead court (violet)
      push();
      stroke(255, 0, 255);
      strokeWeight(2);
      line(this.pos.x, this.pos.y, pointAuBoutDeAhead2.x, pointAuBoutDeAhead2.y);
      fill(0, 255, 255);
      noStroke();
      circle(pointAuBoutDeAhead2.x, pointAuBoutDeAhead2.y, 10);
      pop();
      
      // Zone d'évitement
      push();
      stroke(255, 255, 255, 50);
      strokeWeight(largeurZoneEvitement * 2);
      line(this.pos.x, this.pos.y, pointAuBoutDeAhead.x, pointAuBoutDeAhead.y);
      pop();
    }
    
    // ====== RECHERCHE DE L'OBSTACLE LE PLUS PROCHE ======
    let obstacleLePlusProche = null;
    let distanceMin = Infinity;
    
    for (let obstacle of obstacles) {
      let d = this.pos.dist(obstacle.pos);
      if (d < distanceMin) {
        distanceMin = d;
        obstacleLePlusProche = obstacle;
      }
    }
    
    // Si aucun obstacle, pas de force d'évitement
    if (!obstacleLePlusProche) {
      return createVector(0, 0);
    }
    
    // ====== CALCUL DES DISTANCES ======
    let distance1 = obstacleLePlusProche.pos.dist(pointAuBoutDeAhead);
    let distance2 = obstacleLePlusProche.pos.dist(pointAuBoutDeAhead2);
    let distance3 = obstacleLePlusProche.pos.dist(this.pos);
    
    // Trouver le point le plus proche de l'obstacle
    let pointLePlusProche = pointAuBoutDeAhead;
    let distanceFinale = distance1;
    
    if (distance2 < distanceFinale) {
      distanceFinale = distance2;
      pointLePlusProche = pointAuBoutDeAhead2;
    }
    
    if (distance3 < distanceFinale) {
      distanceFinale = distance3;
      pointLePlusProche = this.pos;
    }
    
    // ====== CALCUL DE LA FORCE D'ÉVITEMENT ======
    // Si on est dans la zone de danger
    if (distanceFinale < obstacleLePlusProche.r + largeurZoneEvitement) {
      // Vecteur qui part du centre de l'obstacle vers le point le plus proche
      let force = p5.Vector.sub(pointLePlusProche, obstacleLePlusProche.pos);
      
      // Debug : afficher la force
      if (Boid.debug) {
        push();
        stroke(255, 255, 0);
        strokeWeight(3);
        line(obstacleLePlusProche.pos.x, obstacleLePlusProche.pos.y, 
             obstacleLePlusProche.pos.x + force.x, obstacleLePlusProche.pos.y + force.y);
        pop();
      }
      
      // Normaliser et appliquer la force maximale
      force.setMag(this.maxForce);
      return force;
    }
    
    // Aucun danger, pas de force
    return createVector(0, 0);
  }

  // SEPARATION - Évite les voisins trop proches (pour les ennemies)
  separation(boids, perceptionRadius = 50) {
    let steering = createVector();
    let total = 0;

    for (let other of boids) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (other != this && d < perceptionRadius) {
        // Vecteur pointant de l'autre boid vers ce boid (s'éloigner)
        let diff = p5.Vector.sub(this.pos, other.pos);
        // Plus le boid est proche, plus la force est forte (division par d²)
        diff.div(d * d);
        steering.add(diff);
        total++;
      }
    }
    
    if (total > 0) {
      // Moyenne des forces de répulsion
      steering.div(total);
      // Normalisation et application de la vitesse max
      steering.setMag(this.maxSpeed);
      // Calcul de la force de steering
      steering.sub(this.vel);
      steering.limit(this.maxForce);
    }
    
    return steering;
  }

  // ALIGN - Aligne la direction avec les voisins (pour les ennemies)
  align(boids, perceptionRadius = 50) {
    let steering = createVector();
    let total = 0;
    
    for (let other of boids) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.vel);
        total++;
      }
    }
    
    if (total > 0) {
      // Moyenne des vitesses des voisins
      steering.div(total);
      // Normalisation et application de la vitesse max
      steering.setMag(this.maxSpeed);
      // Calcul de la force de steering
      steering.sub(this.vel);
      steering.limit(this.maxForce);
    }
    
    return steering;
  }

  // COHESION - Se dirige vers le centre des voisins (paour les ennemies)
  cohesion(boids, perceptionRadius = 100) {
    let steering = createVector();
    let total = 0;

    for (let other of boids) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.pos);
        total++;
      }
    }
    
    if (total > 0) {
      // Calcul du centre de masse (moyenne des positions)
      steering.div(total);
      // Utiliser SEEK pour se diriger vers ce point
      steering.sub(this.pos);
      steering.setMag(this.maxSpeed);
      steering.sub(this.vel);
      steering.limit(this.maxForce);
    }
    
    return steering;
  }

  // BOUNDARIES - Reste dans les limites définies (bx, by, bw, bh)
  boundaries(bx, by, bw, bh, d) {
    let vitesseDesiree = null;
    
    // Définition des limites avec marge d
    const xBordGauche = bx + d;
    const xBordDroite = bx + bw - d;
    const yBordHaut = by + d;
    const yBordBas = by + bh - d;
    
    // Vérification proximité bords horizontaux
    if (this.pos.x < xBordGauche) {
      // Trop à gauche : force vers la droite
      vitesseDesiree = createVector(this.maxSpeed, this.vel.y);
    } else if (this.pos.x > xBordDroite) {
      // Trop à droite : force vers la gauche
      vitesseDesiree = createVector(-this.maxSpeed, this.vel.y);
    }
    
    // Vérification proximité bords verticaux
    if (this.pos.y < yBordHaut) {
      // Trop en haut : force vers le bas
      vitesseDesiree = createVector(this.vel.x, this.maxSpeed);
    } else if (this.pos.y > yBordBas) {
      // Trop en bas : force vers le haut
      vitesseDesiree = createVector(this.vel.x, -this.maxSpeed);
    }
    
    // Si on est près d'un bord, calculer la force de steering
    if (vitesseDesiree !== null) {
      vitesseDesiree.setMag(this.maxSpeed);
      let force = p5.Vector.sub(vitesseDesiree, this.vel);
      force.limit(this.maxForce);
      return force;
    }
    
    // Si on est loin des bords, pas de force
    return createVector(0, 0);
  }

  // APPLICATION DE FORCE - Ajoute une force à l'accélération
  applyForce(force) {
    this.acc.add(force);
  }

  // UPDATE - Intègre la physique (position, vitesse, reset acc)
  update() {
    // Mise à jour de la position en fonction de la vitesse
    this.pos.add(this.vel);
    
    // Mise à jour de la vitesse en fonction de l'accélération
    this.vel.add(this.acc);
    
    // Limitation de la vitesse à maxSpeed
    this.vel.limit(this.maxSpeed);
    
    // Reset de l'accélération (elle sera recalculée à la prochaine frame)
    this.acc.mult(0);
  }

  // SHOW - Dessine l'objet (à surcharger)
  show() {
    fill(255);
    noStroke();
    circle(this.pos.x, this.pos.y, this.r * 2);
  }
}
