import { interval } from "rxjs";
import { drawHitboxRect } from "../Colliders/isIntersecting";
import { followTarget } from "../Movement/followTarget";
import { appService } from "../app";
import { Swarm } from "../Swarm";
import { enemyData } from "../data/units";


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

  timer$.subscribe(() => {
    difficultyScale += 0.05;

    console.log(difficultyScale * 0.01)
    for (let i = 0; i < Math.floor(difficultyScale); i++) {
      const enemy = createEnemy(
        Math.random() > Math.min(0.7, (0.01 * difficultyScale)) ? enemyData.guard : enemyData.paladin,
        {
          x: Math.random() < 0.5 ? Math.random() * 100 : app.screen.width - Math.random() * 100,
          y: Math.random() < 0.5 ? Math.random() * 100 : app.screen.height - Math.random() * 100,
        },
      )

      enemy.health.subscribeToDeath(() => {
        killCount++;
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
