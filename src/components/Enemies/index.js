import { interval } from "rxjs";
import { followTarget } from "/src/components/Movement/followTarget";
import { appService, gameState } from "/src/app";
import { Swarm } from "/src/components/Swarm";
import { enemyData } from "/src/data/units";
import { RadialSpell } from "/src/components/Spells";
import { distanceBetweenPoints } from "/src/components/Colliders/isIntersecting";
import { minions } from "/src/components/Minions";

const {
  getUnitById: getEnemyById,
  units: enemies,
  addUnit,
  addAttacker,
  removeAttacker
} = Swarm();

export { enemies, getEnemyById, addAttacker, removeAttacker }

const createEnemy = (type, position, player) => {
  const enemy = addUnit(type, position);

  enemy.health.subscribeToDeath(() => {
    gameState.incrementKillCount(enemy.name);
    player.addExperience(enemyData[type].exp);

    if (enemy.name === "paladin" && enemy.holyNova) {
      enemy.holyNova.cancelSpell();
    }
  })

  // TODO: refactor into proper damage system
}

const Enemies = (player) => {
  const { physicsUpdate } = appService;
  physicsUpdate.subscribe((delta) => {
    enemies.forEach(enemy => {
      if (enemy.name === "paladin") {
        if (Math.random() > 0.99 && !enemy?.holyNova) {
          enemy.holyNova = RadialSpell({
            position: enemy.sprite,
            growth: 0.1,
            maxRadius: 100,
            color: "FFFF55",
            onComplete: (radius) => {
              if (!enemy.sprite.destroyed) {
                if (distanceBetweenPoints(player.sprite, enemy.sprite) <= radius) {
                  player.health.takeDamage(10);
                }
                minions.map(minion => {
                  if (distanceBetweenPoints(minion.sprite, enemy.sprite) <= radius) {
                    minion.health.takeDamage(10);
                    enemy.attackers = Math.max(0, enemy.attackers - 1);
                  }
                })
              }
              enemy.holyNova = null;
            }
          })
        }

        const inRange = followTarget(enemy.sprite, enemies, player.sprite, delta, { followForce: 0.01, maxSpeed: 0.5, separation: 2, cohesion: 1 });

        if (inRange) player.health.takeDamage(1);

        if (enemy.holyNova?.getRadius() >= 100) enemy.holyNova.resolveSpell();

      } else {
        const inRange = followTarget(enemy.sprite, enemies, player.sprite, delta, { followForce: 5, maxSpeed: 2 / Math.max(1, enemy.attackers), separation: 2, cohesion: 1 });
        // TODO: develop proper damaging system
        if (inRange) player.health.takeDamage(0.5);
      }
    })
  })
}

export const ExplicitSpawner = (player) => {
  const { app } = appService;
  Enemies(player);

  // spawns enemies on demand only
  const spawnEnemy = (name) => {
    createEnemy(
      name,
      {
        x: Math.random() < 0.5 ? Math.random() * 100 : app.screen.width - Math.random() * 100,
        y: Math.random() < 0.5 ? Math.random() * 100 : app.screen.height - Math.random() * 100,
      },
      player
    )
  }

  return { spawnEnemy }
}

// continuously spawns enemies
export const TimedSpawner = (rate = 5000, player) => {
  const { app } = appService;
  const timer$ = interval(rate);

  Enemies(player);

  let difficultyScale = 1;

  timer$.subscribe(() => {
    if (!app.ticker.started) return
    difficultyScale += 0.1;
    console.log(difficultyScale * 0.05);

    for (let i = 0; i < Math.floor(difficultyScale); i++) {
      createEnemy(
        Math.random() > Math.min(0.5, (0.05 * difficultyScale)) ? "guard" : "paladin",
        {
          x: Math.random() < 0.5 ? Math.random() * 100 : app.screen.width - Math.random() * 100,
          y: Math.random() < 0.5 ? Math.random() * 100 : app.screen.height - Math.random() * 100,
        },
        player
      )
    }
  })
}
