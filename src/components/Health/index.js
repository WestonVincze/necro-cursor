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
    if (amount < 0) {
      console.error("cannot deal negative damage.")
      return;
    } 

    spawnHitSplat(amount);

    if (amount === 0) return;

    hp = Math.max(0, hp - amount);
    healthBar?.updateHealth(hp, maxHP);
    onHealthChange.next({ type: 'damage', amount });
    if (hp <= 0) {
      onDeath.next();
      onDeath.complete();
      onHealthChange.complete();
    }
  }

  const heal = (amount) => {
    if (hp === maxHP) return;
    hp = Math.min(hp + amount, maxHP);
    healthBar?.updateHealth(hp, maxHP);
    onHealthChange.next({ type: 'heal', amount });
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
  const { width, height } = container.getBounds();
  const heightOffset = 5;
  const xOffset = -width / 2;
  const yOffset = (-height / 2) - 10;

  // TODO: look into creating a reference object and cloning it with .clone()
  const bg = new Graphics();
  bg.beginFill(0xff5555);
  bg.drawRect(xOffset, yOffset, width, heightOffset);
  bg.endFill();
  hpContainer.addChild(bg);

  const healthBar = new Graphics();

  const updateHealth = (newHP, maxHP) => {
    if (newHP === maxHP) {
      hpContainer.alpha = 0;
    } else {
      hpContainer.alpha = 0.8;
    }
    healthBar.clear();
    healthBar.beginFill(0x55ff55);
    healthBar.drawRect(xOffset, yOffset, width * (newHP / maxHP), heightOffset);
    healthBar.endFill();
  }

  updateHealth(hp, maxHP);
  hpContainer.addChild(healthBar);
  container.addChild(hpContainer)

  return {
    container,
    updateHealth
  }
}
