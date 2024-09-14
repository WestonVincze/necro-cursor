import { HighscoreData } from "/api/HighscoreData";
import styles from "./index.module.css";
import { StatEditor } from "../StatEditor";

const MainMenuScreen = () => `
  <div class=${styles.menu}>
    <h1>Necro Cursor (POC)</h1>

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
    <div class="${styles.row}">
      <div class="${styles.controls}">
        <h2>Controls</h2>
        <p><b>WASD</b> - move</p>
        <p><b>Spacebar</b> - summon skeleton</p>
        <p><b>QE</b> - change formation</p>
        <p><b>F</b> - toggle auto-chase</p>
        <p><b>ESC</b> - pause</p>
      </div>

      <div class="${styles.howToPlay}">
        <h2>How To Play</h2>
        <p>You are feeble and cannot attack! Move away from enemies to avoid their attacks</p>
        <p>Stand near bone piles and cast the summon spell to reanimate skeleton minions under your control</p>
        <p>Minions will follow your cursor, or chase the closest enemy if "auto chase" is toggled</p>
        <p>Gain experience by slaying enemies and choose powerful upgrades when you level up</p>
        <p>Enemies have a chance to drop items that your minions will quickly pick up and use</p>
        <p>When the game ends your highscore and all of your run's stats are saved and can be viewed later from the Highscore menu</p>
      </div>
    </div>
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
