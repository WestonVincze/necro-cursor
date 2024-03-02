import { Container, Graphics } from "pixi.js";
import { Subject } from "rxjs";

export const Health = ({ maxHP, container }) => {
  let hp = maxHP;
  const onDeath = new Subject();
  // create onTakeDamage Subject to manage UI updates and other events?
  let healthBar = null;

  if (maxHP > 1 && container) {
    healthBar = HealthBar({ maxHP, hp, container })
  }

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
  /*
  onDeath.subscribe(() => healthBar.container.destroy());
  onDeath.subscribe(() => healthBar = null)
  */

  return {
    takeDamage,
    heal,
    getHP,
    subscribeToDeath,
    healthBar,
  }
}

const HealthBar = ({ maxHP, hp, container }) => {
  const hpContainer = new Container();
  const rect = container.getBounds();
  const height = 5;
  const xOffset = -rect.width / 2;
  const yOffset = (-rect.height / 2) - 10;

  // look into creating a reference object and cloning it with .clone()
  const bg = new Graphics();
  bg.beginFill(0xff5555);
  bg.drawRect(xOffset, yOffset, rect.width, height);
  bg.endFill();
  hpContainer.addChild(bg);

  const healthBar = new Graphics();
  healthBar.beginFill(0x55ff55);
  healthBar.drawRect(xOffset, yOffset, rect.width * (hp / maxHP), height);
  healthBar.endFill();
  hpContainer.addChild(healthBar);

  const updateHealth = (newHP) => {
    healthBar.clear();
    healthBar.beginFill(0x55ff55);
    healthBar.drawRect(xOffset, yOffset, rect.width * (newHP / maxHP), height);
    healthBar.endFill();
  }

  container.addChild(hpContainer)

  return {
    container,
    updateHealth
  }
}
