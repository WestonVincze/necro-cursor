// TODO: implement CSS modules for views
const GameOver = ({ killCount, armySize, stats }) => `
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
export const GameOverScreen = ({ killCount, armySize }) => {
  const stats = saveData({ killCount, armySize });
  const overlay = document.querySelector('#overlay');
  overlay.classList.add("show");
  overlay.innerHTML = GameOver({ killCount, armySize, stats });
}

const saveData = ({ killCount, armySize }) => {
  const oldStats = localStorage.getItem("PlayerStats");
  const stats = oldStats ? JSON.parse(oldStats) : [];

  stats.push({ killCount, armySize });
  stats.sort((a, b) => b.killCount - a.killCount)

  console.log(stats);
  if (stats.length >= 5) {
    stats.pop();
  }

  localStorage.setItem("PlayerStats", JSON.stringify(stats));

  return stats;
}
