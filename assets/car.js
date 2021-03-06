'use strict';

import { ColliderObject } from './collider-object.js';
import { Coin } from './coin.js';
import { removeItemByValue } from './utils.js';

export class Car extends ColliderObject {
  constructor(x, y, context, objects, player) {
    super(x, y, 30, 50, context, objects, player.color, 0);
    this.player = player;
    this.acceleration = 1.08;
    this.breakPower = 0.05;
    this.speed = 0;
    this.initialSpeed = 0.5;
    this.maxSpeed = 12;
    this.maxBackSpeed = 2;
    this.speedDecay = 0.96;
    this.rotationStep = 8;
    this.steeringLeft = false;
    this.steeringRight = false;
  }

  isMoving() {
    return !(this.speed > -this.initialSpeed && this.speed < this.initialSpeed);
  }

  isReturning() {
    return !(this.speed > -this.initialSpeed);
  }

  steerLeft() {
    this.steeringLeft = true;

    if (this.isMoving()) {
      this.rotation -= this.rotationStep * (this.speed / this.maxSpeed);
    }
  }

  stopSteerLeft() {
    this.steeringLeft = false;
  }

  steerRight() {
    this.steeringRight = true;

    if (this.isMoving()) {
      this.rotation += this.rotationStep * (this.speed / this.maxSpeed);
    }
  }

  stopSteerRight() {
    this.steeringRight = false;
  }

  accelerate() {
    if (this.speed < this.maxSpeed) {
      if (this.speed < 0) {
        this.speed += this.breakPower;
      } else if (this.speed === 0) {
        this.speed = this.initialSpeed;
      } else {
        this.speed *= this.acceleration;
      }
    }
  }

  decelerate() {
    if (this.speed > 0) {
      this.speed -= this.breakPower;
    } else if (this.speed === 0) {
      this.speed = -this.initialSpeed;
    } else {
      if (Math.abs(this.speed) < this.maxBackSpeed) {
        this.speed *= this.acceleration;
      }
    }
  }

  control(pressedKeys, leftKey, rightKey, accelerateKey, decelerateKey) {
    if (pressedKeys[leftKey]) {
      this.steerLeft();
    } else {
      this.stopSteerLeft();
    }

    if (pressedKeys[rightKey]) {
      this.steerRight();
    } else {
      this.stopSteerRight();
    }

    if (pressedKeys[accelerateKey]) {
      this.accelerate();
    }

    if (pressedKeys[decelerateKey]) {
      this.decelerate();
    }
  }

  update() {
    const collidingObjectsWithoutSelfAndCars =
      this.objects.filter(x => !(x instanceof Car) && (x instanceof ColliderObject));

    if (this.isCollidingManyWithSelf(collidingObjectsWithoutSelfAndCars)) {
      this.speed = -this.speed;
    } else {
      if (!this.isMoving()) {
        this.speed = 0;
      } else {
        this.speed *= this.speedDecay;
      }
    }

    const coinsObjects = this.objects.filter(x => x instanceof Coin);
    const collidingCoins = this.collidingManyWithSelf(coinsObjects);

    for (let i = 0; i < collidingCoins.length; i++) {
      // TODO: hide instead of removing instantly. Then add a scheduler to remove hidden
      removeItemByValue(this.objects, collidingCoins[i]);
      this.player.incrementScore();
    }

    const axis = this._getAxis();
    this.x += axis.x;
    this.y += axis.y;

    super.update();
  }

  _getAxis() {
    return {
      x: Math.sin(this.rotation * (Math.PI / 180)) * this.speed,
      y: Math.cos(this.rotation * (Math.PI / 180)) * this.speed * -1,
    };
  }

  _draw(x, y) {
    this._drawWheels(x, y);
    this.context.fillStyle = this.color;
    this.context.fillRect(x, y, this.width, this.height);
    this.context.fillStyle = '#ffc41d';
    this._drawLights(x, y);
    this._drawWindows(x, y);
  }

  _drawWheels(x, y) {
    this.context.fillStyle = '#000';
    if (this.steeringRight) {
      this.context.rotate(40 * (Math.PI / 180));
      this.context.fillRect(x - 7, y + 20, 2, 8);
      this.context.fillRect(x + 17, y + 2, 2, 8);
      this.context.rotate(-40 * (Math.PI / 180));
    } else if (this.steeringLeft) {
      this.context.rotate(-60 * (Math.PI / 180));
      this.context.fillRect(x + 17, y + 2, 2, 8);
      this.context.fillRect(x + 34, y + 26, 2, 8);
      this.context.rotate(60 * (Math.PI / 180));
    } else {
      this.context.fillRect(x - 2, y + 10, 2, 8);
      this.context.fillRect(x + this.width, y + 10, 2, 8);
    }
    this.context.fillRect(x - 2, y + 35, 2, 8);
    this.context.fillRect(x + this.width, y + 35, 2, 8);
  }

  _drawLights(x, y) {
    this.context.rotate(-20 * (Math.PI / 180));
    this.context.fillRect(x + 10, y + 1, 8, 4);
    this.context.rotate(40 * (Math.PI / 180));
    this.context.fillRect(x + 12, y + 1, 8, 4);
    this.context.rotate(-20 * (Math.PI / 180));
    if (this.isReturning()) {
      this.context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    } else {
      this.context.fillStyle = 'rgba(255, 255, 255, 0.6)';
    }
    this.context.fillRect(x + 3, y + 45, 6, 3);
    this.context.fillRect(x + 20, y + 45, 6, 3);
  }

  _drawWindows(x, y) {
    this.context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.context.fillRect(x + 2, y + 15, this.width - 4, 8);
    this.context.fillRect(x + 2, y + 35, this.width - 4, 6);
    this.context.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.context.fillRect(x + 2, y + 23, this.width - 4, 12);
  }
}
