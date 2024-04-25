import { Container, Graphics, Ticker } from "pixi.js";
import { Subject } from "rxjs";
import { HitSplats } from "./HitSplats";
import { appService } from "../../app";

export const Health = ({ maxHP, sprite, hideHealthBar = false, type }) => {
  let hp = maxHP;
  const onDeath = new Subject();
  const onHealthChange = new Subject();
  let healthBar = null;

  if (!hideHealthBar) {
    healthBar = HealthBar({ maxHP, hp, sprite })
  }

  const { spawnHitSplat } = HitSplats(sprite, type);

  const kill = () => {
    takeDamage(hp);
  }

  const takeDamage = (amount, isCrit) => {
    if (amount < 0) {
      console.error("cannot deal negative damage.")
      return;
    } 

    spawnHitSplat(amount, isCrit);
    if (amount === 0) return;

    hp = Math.max(0, hp - amount);
    healthBar?.updateHealth(hp, maxHP);
    onHealthChange.next({ type: 'damage', amount });
    if (hp <= 0) {
      onDeath.next();
      onDeath.complete();
      onHealthChange.complete();
      healthBar.clearHealthBar();
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

  return {
    takeDamage,
    heal,
    getHP,
    kill,
    subscribeToDeath,
    subscribeToHealthChange,
    setMaxHP,
    spawnHitSplat,
  }
}

const HealthBar = ({ maxHP, hp, sprite }) => {
  const { UIContainer, app } = appService;
  const { width, height, x, y } = sprite;

  const hpContainer = new Container();
  const healthBarHeight = 5;
  const heightOffset = 10;
  const xOffset = -width / 2;
  const yOffset = (-height / 2) - heightOffset;

  // TODO: look into creating a reference object and cloning it with .clone()
  const bg = new Graphics();
  bg.beginFill(0xff5555);
  bg.drawRect(xOffset, yOffset, width, healthBarHeight);
  bg.endFill();

  const healthBar = new Graphics();
  const updateHealth = (newHP, maxHP) => {
    if (newHP === maxHP) {
      hpContainer.alpha = 0;
    } else {
      hpContainer.alpha = 0.8;
    }
    healthBar.clear();
    healthBar.beginFill(0x55ff55);
    healthBar.drawRect(xOffset, yOffset, width * (newHP / maxHP), healthBarHeight);
    healthBar.endFill();
  }

  updateHealth(hp, maxHP);
  hpContainer.addChild(bg);
  hpContainer.addChild(healthBar);
  UIContainer.addChild(hpContainer);

  const followSprite = () => {
    if (hpContainer.alpha === 0) return;
    hpContainer.position.set(sprite.x, sprite.y);
  }

  app.ticker.add(followSprite);

  const clearHealthBar = () => {
    app.ticker.remove(followSprite);
    hpContainer.destroy();
  }

  return {
    updateHealth,
    clearHealthBar,
  }
}
