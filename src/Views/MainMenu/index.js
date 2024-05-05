import { HighscoreData } from "/api/HighscoreData";
import styles from "./index.module.css";
import { StatEditor } from "../StatEditor";

const MainMenuScreen = () => `
  <div class=${styles.menu}>
    <h1>NECRO</h1>

    <div id="content" class="${styles.content}">
      <img class="${styles.hero}" src="/assets/necro.png" alt="necromancer image" />
    </div>

    <div class="${styles.buttons}">
      <button id="start_game_btn">Start Game</button>
      <button id="how_to_play_btn">How to Play</button>
      <button id="highscores_btn">Highscores</button>
      <button id="stat_editor_btn">Edit Stats</button>
    </div>
  </div>
`

// TODO: create separate (and more detailed) "how to play" view
const printControls = (container) => {
  container.innerHTML = `
    <h2>Controls</h2>

    <h3>Skeletons</h3>
    <p>Use your cursor to command the skeletons.</p>

    <h3>Movement</h3>
    <p>WASD to move the necromancer.</p>

    <h3>Summoning Skeletons</h3>
    <p>Hold spacebar to create a summoning circle that transforms bones into new skeletons.</p>
  `
}

export const MainMenu = ({ onStartGame, gameVersion }) => {
  const { printHighscores } = HighscoreData();
  const overlay = document.querySelector('#overlay');
  overlay.classList.add("show");
  overlay.innerHTML = MainMenuScreen();

  const handleStartGame = () => {
    onStartGame?.();
    overlay.classList.remove('show');
  }

  const content = document.querySelector('#content');

  const howToPlayButton = document.querySelector('#how_to_play_btn');
  howToPlayButton.addEventListener('click', () => showContent("how_to_play"))

  const highscoresButton = document.querySelector('#highscores_btn');
  highscoresButton.addEventListener('click', () => showContent("highscores"))

  const editStatsButton = document.querySelector('#stat_editor_btn');
  editStatsButton.addEventListener('click', () => showContent("stat_editor"));

  const startButton = document.querySelector('#start_game_btn');
  startButton.addEventListener('click', handleStartGame);

  const showContent = (page) => {
    highscoresButton.classList.remove('hidden');
    howToPlayButton.classList.remove('hidden');
    editStatsButton.classList.remove('hidden');
    switch (page) {
      case "highscores":
        content.innerHTML = printHighscores(5, gameVersion);
        highscoresButton.classList.add('hidden');
        break;
      case "how_to_play":
        printControls(content);
        howToPlayButton.classList.add('hidden');
        break;
      case "stat_editor":
        StatEditor(content);
        editStatsButton.classList.add('hidden');
        break;
      default:
        console.error("Something went wrong with toggleContent...")
        break;
    }
  }
}
