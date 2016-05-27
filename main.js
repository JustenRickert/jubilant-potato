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
var click_x = canvas.width/2;
var click_y = canvas.height/2;

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

/* 
 * GAME
 * */

/* 
 * Note
 * functions loaded befor this file:
 * Circle.js, (todo) Battle.js
 */

var cList = new CircleList();

var game_time = 0;

function start() {
  context.clearRect(0,0, canvas.width, canvas.height);

  cList.collision(); //does collision shit for everybody moving
                     //contains heavy FOR loops be careful
  cList.death_check();

  for(var id in cList.enemy) {
    cList.enemy[id].circle.draw();
    cList.enemy[id].run();
  }
  for(var id in cList.companion) {
    cList.companion[id].circle.draw();
    cList.companion[id].run();
  }
  cList.hero.run();
  cList.hero.circle.draw();

  game_time += 1;
  requestAnimationFrame(start);
} start();

function CircleList() {
  this.hero = new Hero();
  this.enemy = {};
  this.companion = {};
  this.list = {} //this is all enemies, companions and
  
  //must set i=1 so radius will not be 0
  for(var i=0;i<5;i++){
    this.enemy[i] = new Enemy(i,8,'red', 430, 240);
    this.enemy[i].circle.position.x = 4*canvas.width/5 + i;
    this.enemy[i].circle.position.y = 4*canvas.height/5 + i;
    this.list[i] = this.enemy[i];
  }
  for(var j=i;j<3+i;j++){
    this.companion[j] = new Enemy(j,16,'blue', 480, 750);
    this.companion[j].enemy = false;
    this.companion[j].circle.position.x = canvas.width/5 + j;
    this.companion[j].circle.position.y = canvas.height/5 + j;
    this.list[j] = this.companion[j];
  }
  
  this.collision = function() {
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
        //dont look at the own index!
        if(i !== j) {
          if(this.enemy[i].circle.collision(this.enemy[j].circle)) { //returns true upon collision
          }
        }
      }
    }
    for(var i in this.enemy) {
      for(var j in this.companion) {
        //same indexes are okay
        if(this.enemy[i].circle.collision(this.companion[j].circle)) {
          this.enemy[i].if_can_attack_attack(this.companion[j]);
          this.companion[j].if_can_attack_attack(this.enemy[i]);
        }
      }
    }
    
    for(var i in this.companion) {
      for(var j in this.companion) {
        if(i != j) {
          if(this.companion[i].circle.collision(this.companion[j].circle)) {
          }
        }
      }
    }

    //check hero collision
    for(var i in this.companion) {
      if(this.companion[i].circle.collision(cList.hero.circle)) {
        //nothing
      }
    }
    
    //check hero collision
    for(var j in this.enemy) {
      if(this.enemy[j].circle.collision(cList.hero.circle)){
        this.enemy[j].if_can_attack_attack(cList.hero);
      }
    }
    
    // for(var i in this.companion) {
    // }
  };

  this.death_check = function() {
  };
  //Right now if a collision happens they both detect it and apply
  //effects.  It's not as efficient as it could be.
}


