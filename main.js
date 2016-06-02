/* HELPERS
 * ****************** */

/* BUTTONS
 * ****************** */

startButton = function() {
  var button = document.getElementById("startButton");

  // start battle
  button.parentNode.removeChild(button);
};

/* CANVAS
 * these are things for the canvas, 
 */

var canvas = document.getElementById('canvas');
console.log(document);
var context = canvas.getContext('2d');

canvas.width = screen.width - 32;
canvas.height = screen.height - 32;

// click_x,click_y are new hero movement vectors defaulted to a
// location on canvas, they are the where you last clicked
var click_x = 30;
var click_y = 50;

// creates the point on the canvas wherever you click
canvas.onmousedown = function (e) {
  click_x = e.offsetX;
  click_y = e.offsetY;
};

//localize AnimationFrame, requestAnimationFrame is easy to call.
var requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

/**
 * GAME
 */

/* 
 * Note
 * functions loaded before this file:
 * Circle.js, (todo) Battle.js
 */

var GAME_TIME = 0;
var game = new Game();
var battle = new Battle();

function Game() {
  this.exp = 0;
}

Game.prototype.rewardPointsToHero = function() {
  battle.cList.hero.exp += this.exp;
  this.exp = 0;
};

function CircleList(level) {
  this.hero = new Hero();
  this.enemy = {};
  this.companion = {};
  this.list = {} //this is all enemies, companions and
  this.death_count = 0;

  this.generate_circles = function(number_enemies) { 
    //sets this.enemy
    //must set i=1 so radius will not be 0
    for(var i=1;i<number_enemies+1;i++){
      this.enemy[i] = new Enemy(i,8,'red', level);
      this.enemy[i].circle.position.x = 4*canvas.width/5 + i;
      this.enemy[i].circle.position.y = 4*canvas.height/5 + i;
      this.list[i] = this.enemy[i];
      this.number_enemies = number_enemies;
    }
    //sets this.companion and this.list
    // for(var j=i;j<0+i;j++){
    //   this.companion[j] = new Enemy(j,16,'blue', 480, 750);
    //   this.companion[j].enemy = false;
    //   this.companion[j].circle.position.x = canvas.width/5 + j;
    //   this.companion[j].circle.position.y = canvas.height/5 + j;
    //   this.list[j] = this.companion[j];
    // }
  }
}

/**
 * checks if each thing in list is dead.  If it is dead, then turn it
 * grey and disallow it to attack.
 */
CircleList.prototype.check_death = function() {
  /*
   * I think this is pretty straight forward.  Check if each is dead
   * and do some stuff
   */
  for(var id in this.companion) {
    if(this.companion[id].health < 0) {
      this.enemy[id].dead = true;
      this.companion[id].color = "grey";
    }
  }
  for(var id in this.enemy) {
    if(this.enemy[id].health < 0 && this.enemy[id].isAlive()) {
      this.death_count += 1;
      this.enemy[id].dead = true;
      this.enemy[id].circle.color = "grey";
      this.enemy[id].rewardPoints();
    }
  }

  this.hero.check_death();

  //TODO
  /* all evemiers are dead */
  if(this.dead_count >= this.number_enemies) {
    /* clear enemies */
    /* start next round */
  }
  /* the hero is dead */
  if(!this.hero.isAlive()) {
    /* reward experience to the player */
    /* return to main menu. */ 
  }
};

/**
 * useful function, main operation for the game, pretty much
 */
CircleList.prototype.collision = function() {
  /* 
   * let <-> denote 'checks collision with,' then we need that:
   * enemy <-> enemy, enemy <-> companion, companion <-> companion,
   * enemy <-> hero, and campanion <-> hero. 5 total.  Also note
   * that collision here contains the code which applies the physics
   * to the game.
   */

  //look at each index i
  for(var i in this.enemy) {
    for(var j in this.enemy) {
      if(i !== j) { //dont look at the own index!
        if(this.enemy[i].circle.collision(this.enemy[j].circle))
        { //returns true upon collision, and does following:
        }
      }
    }
  }
  // for(var i in this.enemy) {
  //   for(var j in this.companion) {
  //     /* same indexes are okay */
  //     if(this.enemy[i].circle.collision(this.companion[j].circle)) {
  //       this.enemy[i].if_can_attack_attack(this.companion[j]);
  //       this.companion[j].if_can_attack_attack(this.enemy[i]);
  //     }
  //   }
  // }
  
  // for(var i in this.companion) {
  //   for(var j in this.companion) {
  //     /* same indexes not okay */
  //     if(i != j) { 
  //       if(this.companion[i].circle.collision(this.companion[j].circle)) {
  //       }
  //     }
  //   }
  // }

  // //check hero collision
  // for(var i in this.companion) {
  //   if(this.companion[i].circle.collision(battle.cList.hero.circle)) {
  //   }
  // }
  
  //check hero collision
  for(var j in this.enemy) {
    if(this.enemy[j].circle.collision(battle.cList.hero.circle)){
      this.enemy[j].if_can_attack_attack(battle.cList.hero);
      battle.cList.hero.attack(this.enemy[j]);
    }
  }
};

/* Right now if a collision happens they both detect it and apply
effects.  It's not as efficient as it could be. */

function Battle() {
  this.cList = new CircleList(1);
  this.cList.generate_circles(50);
}

function start() {
  context.clearRect(0,0, canvas.width, canvas.height);

  battle.cList.collision(); /* does collision shit for everybody moving
                               contains heavy FOR loops be careful */

  /* checks heros, companions, and hero for death conditions */
  battle.cList.check_death(); 

  for(var id in battle.cList.enemy) {
    battle.cList.enemy[id].circle.draw();
    battle.cList.enemy[id].run();
  }
  for(var id in battle.cList.companion) {
    battle.cList.companion[id].circle.draw();
    battle.cList.companion[id].run();
  }
  battle.cList.hero.run();
  battle.cList.hero.circle.draw();
  battle.cList.hero.health_status();

  GAME_TIME += 1;
  
  requestAnimationFrame(start); /* NOTE REQUESTANIMATIONFRAME ASKS FOR
                                   THE FUNCTION NOT THE FUNCTION
                                   RETURN FUCK, STOP WASTING TIME
                                   REALIZING THAT DONT WRITE
                                   START() */
} start();