import { Sprite } from "pixi.js";
import { drawHitboxRect } from "../Colliders/isIntersecting";
import { interval } from "rxjs";
import { calculateFollowForce } from "../Minions/followCursor";
import { normalizeForce } from "../helpers";

export let enemies = [];
let id = 0;

export const createEnemy = (container, position = { x: 0, y: 0 }) => {
  const sprite = Sprite.from("assets/guard.png");
  sprite.anchor.set(0.5);
  sprite.width = 50;
  sprite.height = 110;
  sprite.position.set(position.x, position.y);
  sprite.vx = 0;
  sprite.vy = 0;
  container.addChild(sprite);
  // const hitbox = drawHitboxRect(sprite, 50);

  const enemy = {
    id: id++,
    sprite,
    // hitbox,
    health: 100,
    maxAttackers: 10,
    attackers: 0,
  }

  enemies.push(enemy)

  return enemy;
}

export const getEnemyById = (id) => {
  return enemies.filter(e => e.id == id)[0];
}

export const removeEnemy = (id) => {
  let enemy = getEnemyById(id);
  enemy.sprite.destroy();
  // enemy.hitbox.destroy();
  enemies = [...enemies.filter(e => e.id !== id)];
}

export const addAttacker = (id) => {
  const enemy = getEnemyById(id);
  if (enemy.attackers + 1 > enemy.maxAttackers) return false;
  enemy.attackers++;
  return true;
}

export const damageEnemy = (id, damage) => {
  const enemy = getEnemyById(id);
  if (!enemy) return;

  enemy.health -= damage;

  if (enemy.health <= 0) removeEnemy(id);
}

// continuously spawns enemies
export const Spawner = (app, container, rate = 5000, player) => {
  const timer$ = interval(rate);

  timer$.subscribe(() => {
    const enemy = createEnemy(container, {
      x: Math.random() * app.screen.width,
      y: Math.random() * app.screen.height,
    })

    app.ticker.add((delta) => {
      damageEnemy(enemy.id, enemy.attackers * 0.1);

      if (!getEnemyById(enemy.id)) return;

      const followForce = calculateFollowForce({ targetX: player.x, targetY: player.y }, enemy.sprite, 0.1)

      const force = normalizeForce(followForce);

      enemy.sprite.vx += force.x * delta * 0.05;
      enemy.sprite.vy += force.y * delta * 0.05;

      enemy.sprite.vx *= 0.95;
      enemy.sprite.vy *= 0.95;

      enemy.sprite.x += enemy.sprite.vx;
      enemy.sprite.y += enemy.sprite.vy;
    })
  })
}
