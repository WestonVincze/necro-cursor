import { HighscoreData } from "../../api/HighscoreData";

// TODO: implement CSS modules for views
const GameOverScreen = ({ killCount, armySize, stats }) => `
  <img src="/assets/bones.png" alt="pile of bones" />
  <h1 class="red">GET FUCKED, NERD.</h1>
  <h2>You did okay, though...</h2>
  <p>You killed ${killCount} guards.</p>
  <p>You summoned ${armySize} skeletons.</p>

  <hr />

  <h2>Your Best 5 Runs</h2>
  ${stats.map(s => `<p>Killed: ${s.killCount}, Summoned: ${s.armySize}</p>`).join("\n")}

  <button onclick="window.location.reload()">Play Again?</button>
`
export const GameOver = ({ killCount, armySize }) => {
  const { saveHighscore } = HighscoreData();
  const stats = saveHighscore({ killCount, armySize });
  const overlay = document.querySelector('#overlay');
  overlay.classList.add("show");
  overlay.innerHTML = GameOverScreen({ killCount, armySize, stats });
}
