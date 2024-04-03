import { Container, Graphics } from "pixi.js";
import { Subject } from "rxjs";
import { HitSplats } from "./HitSplats";

export const Health = ({ maxHP, container, hideHealthBar = false }) => {
  let hp = maxHP;
  const onDeath = new Subject();
  const onHealthChange = new Subject();
  let healthBar = null;

  if (!hideHealthBar && container) {
    healthBar = HealthBar({ maxHP, hp, container })
  }

  const { spawnHitSplat } = HitSplats(container);

  const takeDamage = (amount) => {
    hp -= amount;
    healthBar?.updateHealth(hp, maxHP);
    onHealthChange.next('damage', amount);
    spawnHitSplat(amount);
    if (hp <= 0) {
      hp = 0;
      onDeath.next();
      onDeath.complete();
      onHealthChange.complete();
    }
  }

  const heal = (amount) => {
    if (hp === maxHP) return;
    hp = Math.min(hp + amount, maxHP);
    healthBar?.updateHealth(hp, maxHP);
    onHealthChange.next('heal', amount);
  }

  const getHP = () => hp;
  const setMaxHP = (newMaxHP) => { 
    healthBar?.updateHealth(hp, newMaxHP);
    maxHP = newMaxHP;
  }

  const subscribeToDeath = (fn) => {
    return onDeath.subscribe(fn);
  }

  const subscribeToHealthChange = (fn) => {
    return onHealthChange.subscribe(fn);
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
    subscribeToHealthChange,
    healthBar,
    setMaxHP,
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

  const updateHealth = (newHP, maxHP) => {
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
