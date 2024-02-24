// TODO: implement CSS modules for views
const GameOver = ({ killCount, armySize }) => `
  <img src="/assets/bones.png" alt="pile of bones" />
  <h1 class="red">GET FUCKED, NERD.</h1>
  <h2>You did okay, though...</h2>
  <p>You killed ${killCount} guards.</p>
  <p>You summoned ${armySize} skeletons.</p>

  <button onclick="window.location.reload()">Play Again?</button>
`
export const GameOverScreen = (props) => {
  const overlay = document.querySelector('#overlay');
  overlay.classList.add("show");
  overlay.innerHTML = GameOver(props);
}
