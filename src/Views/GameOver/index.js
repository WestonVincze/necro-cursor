import styles from "./index.module.css"
import { HighscoreData } from "/api/HighscoreData";

const GameOverScreen = ({
  killCount,
  minionCount,
  largestArmy,
  damageTaken,
  reanimations,
  deanimations,
  bonesDespawned,
  highscores,
}) => `
  <div class="${styles.gameOver}">
    <img src="/assets/bones.png" alt="pile of bones" />
    <h1 class="red">YOU DIED.</h1>
    <h2>You did okay, though...</h2>
    <p>You killed ${killCount.total} enemies!<p>
    <p>${killCount.peasants} peasants.</p>
    ${killCount.guards ? `<p>${killCount.guards} guards.</p>` : ''}
    ${killCount.paladins ? `<p>${killCount.paladins} paladins.</p>` : ''}
    ${killCount.archers ? `<p>${killCount.archers} archers.</p>` : ''}
    ${killCount.doppelsoldners ? `<p>${killCount.doppelsoldners} doppelsoldners.</p>` : ''}
    <br />
    <p>${reanimations} skeletons were reanimated.</p>
    <p>${deanimations} skeletons were deanimated.</p>
    <p>You died with ${minionCount} skeletons.</p>
    <p>You managed to control ${largestArmy} skeletons at once!</p>
    <br />
    <p>${bonesDespawned} bone piles went to waste... ${bonesDespawned > 0 ? 'how sad.' : 'NICE!'}</p>
    <p>You took a whopping ${damageTaken} damage!</p>
    <hr />
    ${highscores}
    <button onclick="window.location.reload()">Play Again?</button>
  </div>
`
export const GameOver = (runStats) => {
  const { saveHighscore, printHighscores } = HighscoreData();
  saveHighscore(runStats);
  const highscores = printHighscores(5, runStats.gameVersion);

  const overlay = document.querySelector('#overlay');
  overlay.classList.add("show");
  overlay.innerHTML = GameOverScreen({ ...runStats, highscores });
}
