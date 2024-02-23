import { Container, Graphics } from "pixi.js";
import { Subject } from "rxjs";
import { appService } from "../app";

export const Health = ({ maxHP, sprite }) => {
  let hp = maxHP;
  const onDeath = new Subject();
  let healthBar = HealthBar({ maxHP, hp, sprite })
  appService.getApp().ticker.add(() => healthBar?.updatePosition());

  const takeDamage = (damage) => {
    hp -= damage;
    healthBar?.updateHealth(hp);
    if (hp <= 0) {
      hp = 0;
      onDeath.next();
      onDeath.complete();
    }
  }

  const heal = (amount) => {
    hp = Math.min(hp + amount, maxHP);
  }

  const getHP = () => hp;

  const subscribeToDeath = (fn) => {
    return onDeath.subscribe(fn);
  }

  // TODO: improve garbage collection
  onDeath.subscribe(() => healthBar.container.destroy());
  onDeath.subscribe(() => healthBar = null)

  return {
    takeDamage,
    heal,
    getHP,
    subscribeToDeath,
    healthBar,
  }
}

const HealthBar = ({ maxHP, hp, sprite }) => {
  const container = new Container();
  container.opacity = 0.5
  const width = sprite._width;
  const height = 5;

  const updatePosition = () => {
    container.position.x = sprite.x - (sprite._width / 2);
    container.position.y = sprite.y - (sprite._height / 2) - 5;
  }

  const bg = new Graphics();
  bg.beginFill(0xff0000);
  bg.drawRect(0, 0, width, height);
  bg.endFill();
  container.addChild(bg);

  const healthBar = new Graphics();
  healthBar.beginFill(0x00ff00);
  healthBar.drawRect(0, 0, width * (hp / maxHP), height);
  healthBar.endFill();
  container.addChild(healthBar);

  const updateHealth = (newHP) => {
    healthBar.clear();
    healthBar.beginFill(0x00ff00);
    healthBar.drawRect(0, 0, width * (newHP / maxHP), height);
    healthBar.endFill();
  }

  return {
    container,
    updateHealth,
    updatePosition
  }
}
