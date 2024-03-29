import { HighscoreData } from "/api/HighscoreData";
import styles from "./index.module.css";

// TODO: create separate (and more detailed) "how to play" view
const Controls = () => `
  <h2>Controls</h2>

  <h3>Skeletons</h3>
  <p>Use your cursor to command the skeletons.</p>

  <h3>Movement</h3>
  <p>WASD to move the necromancer.</p>

  <h3>Summoning Skeletons</h3>
  <p>Hold spacebar to create a summoning circle that transforms bones into new skeletons.</p>
`

const MainMenuScreen = () => `
<h1>NECRO CURSOR</h1>
<img class="${styles.hero}" src="/assets/necro.png" alt="necromancer image" />

<div id="content" class="${styles.content}"></div>

<button id="start_button">Start Game</button>
<button id="toggle_content">View Highscores</button>
`

export const MainMenu = ({ onStartGame, gameVersion }) => {
  const { printHighscores } = HighscoreData();
  const overlay = document.querySelector('#overlay');
  overlay.classList.add("show");
  overlay.innerHTML = MainMenuScreen();

  const handleStartGame = () => {
    onStartGame?.();
    overlay.classList.remove('show');
  }

  const startButton = document.querySelector('#start_button');
  startButton.addEventListener('click', handleStartGame);

  const content = document.querySelector('#content');
  content.innerHTML = Controls();

  const toggleContentButton = document.querySelector('#toggle_content');

  const toggleContent = () => {
    switch (toggleContentButton.innerHTML) {
      case "View Highscores":
        content.innerHTML = printHighscores(5, gameVersion);
        toggleContentButton.innerHTML = "View Controls";
        break;
      case "View Controls":
        content.innerHTML = Controls();
        toggleContentButton.innerHTML = "View Highscores";
        break;
      default:
        console.error("Something went wrong with toggleContent...")
        break;
    }
  }

  toggleContentButton.addEventListener('click', toggleContent);
}
