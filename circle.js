/* There are heroes, companions and enemies.  Each has an object
 * circle which holds positions, colors and radius and things
 */

var hero = new Hero();

/* 
 * HERO
 */

// TODO: Idea, health pack pick up.

function Hero() { //circle is the circle object
  this.circle = new Circle();
  this.circle.color = "black";
  this.circle.radius = 16;
  this.dead = false;

  this.health = 10.0;
  this.circle.position.x = 50;
  this.circle.position.y = 30;
  this.circle.position.acc = .35;
  this.circle.position.vel_max = 5;

  this.damage = 5;
  this.last_attack_time = 0;
  this.attack_speed = 240;
  this.attack = function(their)  {
    their.health -= this.damage;
    this.last_attack_time = GAME_TIME;
  }
}

Hero.prototype.isAlive = function() {
  return !this.dead;
};

Hero.prototype.health_status = function() {
  context.fillStyle = 'white';
  context.font="15px Verdana";
  context.fillText(Math.ceil(this.health), this.circle.position.x-5, this.circle.position.y+3);
};

Hero.prototype.check_death = function() {
  if(this.health <= 0) {
    this.dead = true;
    this.circle.color = "#D3D3D3";
  }
};

/* time_frames is frame length of cooldown */
Hero.prototype.can_attack = function() {
  return GAME_TIME - this.last_attack_time > this.attack_speed;
};

Hero.prototype.if_can_attack_attack = function(them) {
  if(this.can_attack()) {
    this.attack(them);
  }
};

//Hero.prototype.strategy_movement

Hero.prototype.strategy_movement = function() {
  this.accelerate_to_point();
}

var p_x = 400,
    p_y = 310,
    radius = 65,
    point_circular_around_run_timer = 0;

Hero.prototype.run = function() {
  //this.point_circular_around(p_x,p_y,radius,point_circular_around_run_timer);
  //point_circular_around_run_timer += 1;
  this.accelerate_to_point();
  this.move_to_point();
}

Hero.prototype.move_to_point = function() {
  var position = this.circle.position;

  //distance-to-radius-less-than-circle-radius
  var delta_x = position.x - click_x,
      delta_y = position.y - click_y,
      dist = Math.sqrt(delta_x*delta_x + delta_y*delta_y);
  if(dist < this.circle.radius) {
    this.circle.position.vel /= 1.5;
  }

  this.circle.position.x -= position.vel_x*position.vel;
  this.circle.position.y -= position.vel_y*position.vel;
};

Hero.prototype.point_circular_around = function(p_x,p_y,radius,time) {
  click_x = p_x + radius*Math.sin(2*time/30),
  click_y = p_y + radius*Math.cos(2*time/30);
};

Hero.prototype.move_to_point = function() {
  var position = this.circle.position;

  //distance-to-radius-less-than-circle-radius
  var delta_x = position.x - click_x,
      delta_y = position.y - click_y,
      dist = Math.sqrt(delta_x*delta_x + delta_y*delta_y);
  if(dist < this.circle.radius) {
    this.circle.position.vel /= 1.5;
  }

  this.circle.position.x -= position.vel_x*position.vel;
  this.circle.position.y -= position.vel_y*position.vel;
};

/* click_x defined on main */
Hero.prototype.accelerate_to_point = function() {
  var position = this.circle.position;
  var delta_x = this.circle.position.x - click_x,
      delta_y = this.circle.position.y - click_y,
      dist = Math.sqrt(delta_x*delta_x + delta_y*delta_y);

  /* new acceleration vector */
  if(dist != 0) {
    position.acc_x = delta_x / dist;
    position.acc_y = delta_y / dist;
  }

  if(dist <= this.circle.radius/4) {
    var acc = 0;
  } else {
    var acc = this.circle.position.acc;
  }

  /* unit vectors times magnitudes, then find the magnitude of that */
  var vel_x = position.vel_x*position.vel || 0,
      vel_y = position.vel_y*position.vel || 0,
      acc_x = position.acc_x*position.acc,
      acc_y = position.acc_y*position.acc,
      vec_mag = Math.sqrt((vel_x+acc_x)*(vel_x+acc_x) + (vel_y+acc_y)*(vel_y+acc_y));

  /* accelerate if can accelerate */
  if(position.vel < this.circle.position.vel_max) {
    this.circle.position.vel += this.circle.position.acc;
  } else {
    this.circle.position.vel = this.circle.position.vel_max
  }
  //turn
  this.circle.position.vel_x = (vel_x+acc_x)/vec_mag;
  this.circle.position.vel_y = (vel_y+acc_y)/vec_mag;
};

/* 
 * ENEMY
 */

function Enemy(id, radius, color, level) {
  this.exp = 0.1*level + 1;
  this.id = id; 
  this.circle = new Circle();
  this.circle.id = id;
  this.circle.radius = radius;
  this.circle.color = color;
  this.circle.position.vel_max = 3;
  this.circle.position.acc = Math.sqrt(level/50) * 1.5 + 0.3; //max acc is then 1.8

  this.health =  level/5 + 1;
  
  this.dead = false;

  this.damage = .6*level/50 + 1;
  this.attack_speed = 600 - 450 * level/50;
  this.last_attack_time = 0;

  this.attack = function(their)  {
    their.health -= this.damage;
    this.last_attack_time = GAME_TIME;
  }
}

Enemy.prototype.rewardPoints = function() {
  game.exp += this.exp;
};

Enemy.prototype.isAlive = function() {
  return !this.dead;
};

/* time_frames is frame length of cooldown */
Enemy.prototype.can_attack = function() {
  return GAME_TIME - this.last_attack_time > this.attack_speed && this.isAlive();
};

Enemy.prototype.if_can_attack_attack = function(them) {
  if(this.can_attack()) {
    this.attack(them);
  }
};

Enemy.prototype.run = function() {
  if(this.isAlive()) {
    this.accelerate_to_hero();
  } else {
    this.slow_to_stop();
  }
  this.move_by_velocity();
};

Enemy.prototype.slow_to_stop = function() {
  this.circle.position.vel /= 1.01;
};

Enemy.prototype.move_by_velocity = function() {
  this.circle.position.x += this.circle.position.vel_x*this.circle.position.vel;
  this.circle.position.y += this.circle.position.vel_y*this.circle.position.vel;
};

Enemy.prototype.accelerate_to_hero = function() {
  //unit vector to hero position
  var vec = this.circle.delta_x_y_dist(battle.cList.hero.circle); //[012]

  //accel vectors
  this.circle.position.acc_x = -vec[0];
  this.circle.position.acc_y = -vec[1];

  //max speed? accelerate : false
  if(this.circle.position.vel + this.circle.position.acc < this.circle.position.vel_max) {
    this.circle.position.vel += this.circle.position.acc;
  }

  var vel_x = this.circle.position.vel_x*this.circle.position.vel,
      vel_y = this.circle.position.vel_y*this.circle.position.vel,
      acc_x = this.circle.position.acc_x*this.circle.position.acc/sqrt(sqrt(vec[2])),
      acc_y = this.circle.position.acc_y*this.circle.position.acc/sqrt(sqrt(vec[2])),
      vec_mag = Math.sqrt((vel_x+acc_x)*(vel_x+acc_x) + (vel_y+acc_y)*(vel_y+acc_y));

  //turn 
  this.circle.position.vel_x = (vel_x+acc_x)/vec_mag;
  this.circle.position.vel_y = (vel_y+acc_y)/vec_mag;
};

function Circle() {
  this.radius = 0;
  this.color = '';
  this.position = {
    x: 0,
    y: 0,
    //used for various things
    dot_x: 0,
    dot_y: 0,
    //vel is magnitude, others are unit lengths
    vel: 0,
    vel_x: 0,
    vel_y: 0,
    vel_max: 15,
    //acc is magnitude, others are unit lengths
    acc: 1,
    acc_max: 1,
    acc_x: 0,
    acc_y: 0
  }
}

Circle.prototype.move_by_velocity_fraction = function(frac) {
  this.position.x += this.position.vel_x*this.position.vel / frac;
  this.position.y += this.position.vel_y*this.position.vel / frac;
};

Circle.prototype.move_to = function(x,y) {
  this.position.x = x;
  this.position.y = y;
}

/**
 * these are the physics employed in the collision of the game.
 * Typically, enemies move in a constant acceleration vector towards
 * a specified point.
 */
Circle.prototype.collision = function(otherCircle) {

  /* unit vector and difference */
  var vec_x = this.position.x - otherCircle.position.x,
      vec_y = this.position.y - otherCircle.position.y,
      dist = sqrt(vec_x*vec_x + vec_y*vec_y);

  if(dist < this.radius + otherCircle.radius) {
    /* these are momentum changes, they might be wrong, but it looks
    okay, so it's a good "estimate" :) */
    var frac_of_radius_1 = this.radius / (this.radius + otherCircle.radius),
        frac_of_radius_2 = otherCircle.radius / (this.radius + otherCircle.radius);
    var vel = this.position.vel + otherCircle.position.vel;

    /* added the 0.5 to make velocity loss higher, more desirable.
    Cut radius in half upon collision */
    this.position.vel = frac_of_radius_2 * vel;
    otherCircle.position.vel = frac_of_radius_1 * vel;

    /* change direction to be opposite of this, might want to move
    this function somewhere else? */
    otherCircle.position.vel_x = -vec_x/dist;
    otherCircle.position.vel_y = -vec_y/dist;
    this.position.vel_x = vec_x/dist;
    this.position.vel_y = vec_y/dist;

    return true //useful for using inside an if statement.
  }
  return false
};

/**
 * brings up the Math module.  Easier to call that way.
 */
var sqrt = Math.sqrt;

/** 
 * returns delta_x, delta_y, and dist
 */
Circle.prototype.delta_x_y_dist = function(otherCircle) { //enemy, hero, or companion
  var delta_x = this.position.x - otherCircle.position.x,
      delta_y = this.position.y - otherCircle.position.y,
      dist = sqrt(delta_x*delta_x + delta_y*delta_y);
  return [delta_x/dist, //0
          delta_y/dist, //1
          dist]; //2
};

Circle.prototype.strategy_movement = function() {
};

Circle.prototype.draw = function() {
  context.beginPath();
  context.arc(this.position.x,this.position.y, this.radius, 0, 2*Math.PI);
  context.closePath();
  context.fillStyle = this.color;
  context.fill();
};

Circle.prototype.accelerate_to_hero = function() {

  /* get unit vector to hero */
  var delta_ = this.delta_x_y_dist(hero);

  this.position.acc_x = -delta_[0]/delta_[3]; //delta_ = [vec_x,vec_y,dist]
  this.position.acc_y = -delta_[1]/delta_[2];

  /* vectors with magnitude */
  var vel_x = this.position.vel_x*this.position.vel,
      vel_y = this.position.vel_y*this.position.vel,
      acc_x = this.position.acc_x*this.position.acc,
      acc_y = this.position.acc_y*this.position.acc,
      vec_mag = Math.sqrt((vel_x+acc_x)*(vel_x+acc_x) + (vel_y+acc_y)*(vel_y+acc_y));

  this.position.vel_x = (vel_x+acc_x)/vec_mag;
  this.position.vel_y = (vel_y+acc_y)/vec_mag;

  /* add vectors */
  if(this.position.vel < this.position.vel_max) {
    this.position.vel += this.position.acc/delta_[2];
  }
}