let player;
let enemies = [];
let projectiles = [];
let foods = [];
let obstacles = [];

// État du jeu ('playing' | 'gameOver')
let gameState = 'playing';
// Score du joueur
let score = 0;
// Timestamp du début de partie
let startTime;

// --- Paramètres ajustables via sliders ---
// Multiplicateur de vitesse des zombies
let enemySpeedMultiplier = 1;
// Multiplicateur de cadence de tir
let fireRateMultiplier = 1;
// Frames entre chaque spawn
let spawnRateFrames = 90;

// --- Images ---
let player_img;
let zombie_img;
let citrouille_img;

// PRELOAD - Charge les ressources avant setup
function preload() {
  player_img = loadImage('assets/player.png');
  Player.image = player_img;

  zombie_img = loadImage('assets/zombie.png');
  Enemy.image = zombie_img;

  citrouille_img = loadImage('assets/citrouille.png');
  Obstacle.image = citrouille_img;
}


function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('gameContainer');

  initGame();
  setupSliders();
}

// initGame - (ré)initialise le jeu
function initGame() {
  // Création du joueur au centre du canvas
  player = new Player(width / 2, height / 2);
  
  // Réinitialisation des tableaux
  enemies = [];
  projectiles = [];
  foods = [];
  obstacles = [];
  
  // Reset du score et de l'état
  score = 0;
  gameState = 'playing';
  startTime = millis(); // Timestamp actuel en millisecondes
  
  // Spawn initial de 5 objets de nourriture
  for (let i = 0; i < 5; i++) {
    spawnFood();
  }
  
  
  // Masquer l'écran de game over
  document.getElementById('gameOver').style.display = 'none';
}

// setupSliders - Attache les listeners aux sliders HTML
function setupSliders() {
  // ====== SLIDER VITESSE DES ZOMBIES ======
  let enemySpeedSlider = document.getElementById('enemySpeed');
  enemySpeedSlider.oninput = function() {
    enemySpeedMultiplier = parseFloat(this.value);
    document.getElementById('enemySpeedValue').textContent = this.value;
  };
  
  // ====== SLIDER CADENCE DE TIR ======
  let fireRateSlider = document.getElementById('fireRate');
  fireRateSlider.oninput = function() {
    // Modifie directement le cooldown du joueur
    player.shootCooldown = parseInt(this.value);
    document.getElementById('fireRateValue').textContent = this.value;
  };
  
  // ====== SLIDER SPAWN RATE DES ZOMBIES ======
  let spawnRateSlider = document.getElementById('spawnRate');
  spawnRateSlider.oninput = function() {
    spawnRateFrames = parseInt(this.value);
    document.getElementById('spawnRateValue').textContent = this.value;
  };
}

// spawnFood - Crée une nourriture à position aléatoire
function spawnFood() {
  let margin = 50;
  let x = random(margin, width - margin);
  let y = random(margin, height - margin);
  foods.push(new Food(x, y));
}


// spawnEnemy - Génère un zombie en dehors du canvas
function spawnEnemy() {
  let x, y;
  let side = floor(random(4)); // Choix aléatoire d'un côté (0-3)
  
  switch(side) {
    case 0: // HAUT
      x = random(width);
      y = -20; // Légèrement au-dessus du canvas
      break;
    case 1: // DROITE
      x = width + 20; // Légèrement à droite du canvas
      y = random(height);
      break;
    case 2: // BAS
      x = random(width);
      y = height + 20; // Légèrement en dessous du canvas
      break;
    case 3: // GAUCHE
      x = -20; // Légèrement à gauche du canvas
      y = random(height);
      break;
  }
  
  // Création du zombie avec vitesse ajustée selon le slider
  let enemy = new Enemy(x, y);
  enemy.maxSpeed = 2 * enemySpeedMultiplier;
  enemies.push(enemy);
}

// draw - Boucle principale (mise à jour & rendu)
function draw() {
  background(40, 50, 60);
  
  // MODE : playing
  if (gameState === 'playing') {
    
    // Spawn progressif des zombies (selon spawnRateFrames)
    if (frameCount % spawnRateFrames === 0) {
      spawnEnemy();
    }
    
    // ====== AUGMENTATION PROGRESSIVE DE LA DIFFICULTÉ ======
    // Toutes les 10 secondes (600 frames), on accélère le spawn
    if (frameCount % 600 === 0 && spawnRateFrames > 30) {
      spawnRateFrames -= 5; // Spawn plus rapide
    }
    
    // Obstacles (statique)
    for (let obstacle of obstacles) {
      obstacle.show();
    }
    
    // Position de la souris
    let mousePos = createVector(mouseX, mouseY);
    
    // Joueur: comportements, update, shoot, show
    player.applyBehaviors(mousePos, obstacles);
    player.update();                        // Mise à jour physique
    player.shoot(enemies, projectiles);     // Système de tir automatique
    player.show();                          // Affichage
    
    // Ennemis (zombies)
    for (let i = enemies.length - 1; i >= 0; i--) {
      // Application des comportements : SEEK + FLOCKING + AVOID + BOUNDARIES
      enemies[i].applyBehaviors(player, enemies, obstacles);
      enemies[i].update();                  // Mise à jour physique
      enemies[i].checkCollision(player);    // Vérification collision avec joueur
      enemies[i].show();                    // Affichage
    }
    
    // Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      // Application du comportement : SEEK (cible)
      projectiles[i].applyBehaviors();
      projectiles[i].update();              // Mise à jour physique
      
      // Vérification collision avec zombies
      if (projectiles[i].checkCollision(enemies)) {
        // Collision détectée : suppression du projectile et gain de points
        projectiles.splice(i, 1);
        score += 10;
      } 
      // Vérification durée de vie
      else if (projectiles[i].isDead()) {
        // Projectile trop vieux : suppression
        projectiles.splice(i, 1);
      } 
      else {
        // Projectile toujours actif : affichage
        projectiles[i].show();
      }
    }
    
    // Nourriture
    for (let i = foods.length - 1; i >= 0; i--) {
      // Vérification si le joueur collecte la nourriture
      if (foods[i].checkCollection(player)) {
        // Collecté : suppression et réapparition ailleurs
        foods.splice(i, 1);
        spawnFood();
        score += 5; // Bonus de points
      } else {
        // Pas collecté : affichage
        foods[i].show();
      }
    }
    
    // Mise à jour du HUD
    updateHUD();
    
    // Vérification game over
    if (player.health <= 0) {
      gameState = 'gameOver';
      showGameOver();
    }
  }
  
  // ========================================================================
  // MODE : GAME OVER
  // ========================================================================
  // Rien à faire ici, l'overlay HTML gère l'affichage
}

// keyPressed - Gestion des touches (debug / ajouter obstacle)
function keyPressed() {
  if (key === 'd') {
    Boid.debug = !Boid.debug;
  } else if (key === 'o' || key === 'O') {
    const obstacle = new Obstacle(mouseX, mouseY, random(20, 60));
    obstacles.push(obstacle);
  }
}

// updateHUD - Met à jour les éléments HTML du HUD
function updateHUD() {
  document.getElementById('health').textContent = Math.ceil(player.health);
  document.getElementById('score').textContent = score;
  document.getElementById('enemies').textContent = enemies.length;
  let elapsedTime = floor((millis() - startTime) / 1000);
  document.getElementById('time').textContent = elapsedTime;
}

// showGameOver - Affiche l'écran de game over
function showGameOver() {
  let elapsedTime = floor((millis() - startTime) / 1000);
  document.getElementById('finalScore').textContent = score;
  document.getElementById('finalTime').textContent = elapsedTime;
  document.getElementById('gameOver').style.display = 'block';
}

// restartGame - Relance une nouvelle partie
function restartGame() {
  initGame();
}

// Rendre la fonction accessible depuis le HTML
window.restartGame = restartGame;