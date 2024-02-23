import { Sprite } from "pixi.js";
import { interval } from "rxjs";
import { drawHitboxRect } from "../Colliders/isIntersecting";
import { followTarget } from "../Movement/followTarget";
import { Health } from "../Health";

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
  const health = Health({ maxHP: 100, sprite });
  sprite.parent.addChild(health.healthBar.container);

  const enemy = {
    id: id++,
    sprite,
    // hitbox,
    health,
    maxAttackers: 10,
    attackers: 0,
  }

  enemies.push(enemy)

  health.subscribeToDeath(() => {
    removeEnemy(enemy.id);
  })

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

/*
export const damageEnemy = (id, damage) => {
  const enemy = getEnemyById(id);
  if (!enemy) return;

  enemy.health -= damage;

  if (enemy.health <= 0) removeEnemy(id);
}
*/

// continuously spawns enemies
export const Spawner = (app, container, rate = 5000, player) => {
  if (enemies.length > 0) return;
  const timer$ = interval(rate);

  timer$.subscribe(() => {
    const enemy = createEnemy(container, {
      x: Math.random() * app.screen.width,
      y: Math.random() * app.screen.height,
    })

    app.ticker.add((delta) => {
      enemy.health.takeDamage(enemy.attackers * 0.1);
      if (!getEnemyById(enemy.id)) return;

      const inRange = followTarget(enemy.sprite, enemies, player.sprite, delta, { followForce: 0.05, maxSpeed: 1.5 / Math.max(1, enemy.attackers), separation: 2, cohesion: 1 });
      // TODO: develop proper damaging system
      if (inRange) player.health.takeDamage(0.5);
    })
  })
}
