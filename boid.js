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
}
