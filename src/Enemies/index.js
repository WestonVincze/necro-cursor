import { interval } from "rxjs";
import { followTarget } from "../Movement/followTarget";
import { appService } from "../app";
import { Swarm } from "../Swarm";
import { enemyData } from "../data/units";
import { RadialSpell } from "../Spells";
import { distanceBetweenPoints } from "../Colliders/isIntersecting";
import { minions } from "../Minions";

const {
  units: enemies,
  createUnit: createEnemy,
  getUnitById: getEnemyById,
  addAttacker
} = Swarm();

export { enemies, getEnemyById, addAttacker }
export let killCount = 0;

// continuously spawns enemies
export const Spawner = (rate = 5000, player) => {
  const { app, gameTicks$ } = appService;
  const timer$ = interval(rate);

  let difficultyScale = 1;

  app.ticker.add((delta) => {
    enemies.forEach(enemy => {
      if (enemy.type === "paladin") {
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
        const inRange = followTarget(enemy.sprite, enemies, player.sprite, delta, { followForce: 0.05, maxSpeed: 0.6 / Math.max(1, enemy.attackers), separation: 2, cohesion: 1 });
        // TODO: develop proper damaging system
        if (inRange) player.health.takeDamage(0.5);
      }
    })
  })

  timer$.subscribe(() => {
    if (!app.ticker.started) return
    difficultyScale += 0.1;
    console.log(difficultyScale * 0.05);

    for (let i = 0; i < Math.floor(difficultyScale); i++) {
      const enemy = createEnemy(
        Math.random() > Math.min(0.5, (0.05 * difficultyScale)) ? enemyData.guard : enemyData.paladin,
        {
          x: Math.random() < 0.5 ? Math.random() * 100 : app.screen.width - Math.random() * 100,
          y: Math.random() < 0.5 ? Math.random() * 100 : app.screen.height - Math.random() * 100,
        },
      )

      enemy.health.subscribeToDeath(() => {
        killCount++;
        if (enemy.type === "paladin" && enemy.holyNova) {
          enemy.holyNova.cancelSpell();
        }
      })

      // TODO: refactor into proper damage system
      gameTicks$.subscribe(() => {
        enemy.health.takeDamage(enemy.attackers * 1);
      })
    }
  })
}
