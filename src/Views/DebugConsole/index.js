import { appService } from "../../app";
import styles from "./index.module.css";

const DebugConsoleScreen = () => `
  <div class="${styles.debugConsole} ${styles.hide}">
    <div class="${styles.FPSContainer}">FPS: <span id="FPS">0</span></div>
    <div class="${styles.buttonContainer}"></div>
  </div>
`;

// TODO: what should be responsible for padding this data to DebugConsole?
export const DebugConsole = () => {
  const debugContainer = document.querySelector('#debugContainer');
  debugContainer.innerHTML = DebugConsoleScreen();
  const debugConsole = debugContainer.querySelector(`.${styles.debugConsole}`);
  const buttonContainer = debugConsole.querySelector(`.${styles.buttonContainer}`);
  let showConsole = false;

  const createButton = (id, text, action) => {
    const button = document.createElement('button');
    button.id = id;
    button.textContent = text;
    button.addEventListener('click', action);
    buttonContainer.append(button);
  }

  const toggleConsole = () => {
    const { app } = appService;
    const container = document.querySelector(':root');
    if (showConsole) {
      debugConsole.classList.add(styles.hide);
      container.style.setProperty('--debug-console-width', '0px');
    } else {
      debugConsole.classList.remove(styles.hide);
      container.style.setProperty('--debug-console-width', '200px');
    }
    app.resize();
    showConsole = !showConsole;
  }

  return {
    createButton,
    toggleConsole,
  }
}
