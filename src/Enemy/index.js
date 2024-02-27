import { Sprite } from "pixi.js";
import { interval } from "rxjs";
import { drawHitboxRect } from "../Colliders/isIntersecting";
import { followTarget } from "../Movement/followTarget";
import { Health } from "../Health";
import { appService } from "../app";

export let enemies = [];
export let bones = [];
export let killCount = 0;
let id = 0;

const spawnBones = ({ x, y }, id) => {
  const { spriteContainer } = appService;
  const sprite = Sprite.from("assets/bones.png");
  sprite.anchor.set(0.5);
  sprite.width = 50;
  sprite.height = 35;
  sprite.position.set(x, y);

  spriteContainer.addChild(sprite);

  bones.push({ id, sprite });
  setTimeout(() => { 
    if (bones.filter(b => b.id === id)[0]) {
      removeBones({ id, sprite })
    }
  }, 30000);

  return sprite;
}

export const removeBones = ({ id, sprite }) => {
  if (!sprite) return;
  try {
    sprite.destroy();
    bones = [...bones.filter(b => b.id !== id)];
  } catch (e) {
    console.error(e);
  }
}

export const createEnemy = (position = { x: 0, y: 0 }) => {
  const { spriteContainer, UIContainer } = appService;
  const sprite = Sprite.from("assets/guard.png");
  sprite.anchor.set(0.5);
  sprite.width = 50;
  sprite.height = 110;
  sprite.position.set(position.x, position.y);
  sprite.vx = 0;
  sprite.vy = 0;
  spriteContainer.addChild(sprite);
  // const hitbox = drawHitboxRect(sprite, 50);
  const health = Health({ maxHP: 100, sprite });
  UIContainer.addChild(health.healthBar.container);

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
    spawnBones(sprite, enemy.id);
    removeEnemy(enemy.id);
    killCount++;
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
export const Spawner = (rate = 5000, player) => {
  const { app, gameTicks$ } = appService;
  const timer$ = interval(rate);

  let difficultyScale = 1;

  timer$.subscribe(() => {
    difficultyScale += 0.05;

    for (let i = 0; i < Math.floor(difficultyScale); i++) {
      const enemy = createEnemy({
        x: Math.random() < 0.5 ? Math.random() * 100 : app.screen.width - Math.random() * 100,
        y: Math.random() < 0.5 ? Math.random() * 100 : app.screen.height - Math.random() * 100,
      })


      gameTicks$.subscribe(() => {
        enemy.health.takeDamage(enemy.attackers * 1);
      })

      app.ticker.add((delta) => {
        if (!getEnemyById(enemy.id)) return;

        const inRange = followTarget(enemy.sprite, enemies, player.sprite, delta, { followForce: 0.05, maxSpeed: 1.3 / Math.max(1, enemy.attackers), separation: 2, cohesion: 1 });
        // TODO: develop proper damaging system
        if (inRange) player.health.takeDamage(0.5);
      })
    }
  })
}
