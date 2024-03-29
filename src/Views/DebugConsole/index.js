import styles from "./index.module.css";

const DebugConsoleScreen = () => `
  <div class="${styles.debugContainer} ${styles.hide}">
    FPS: <span id="FPS"></span>
    <div class="${styles.buttonContainer}"></div>
  </div>
`;

// TODO: what should be responsible for padding this data to DebugConsole?
export const DebugConsole = () => {
  const container = document.querySelector('#debugContainer');
  container.innerHTML = DebugConsoleScreen();
  const debugContainer = container.querySelector(`.${styles.debugContainer}`);
  const buttonContainer = debugContainer.querySelector(`.${styles.buttonContainer}`);
  let showConsole = false;

  const createButton = (id, text, action) => {
    const button = document.createElement('button');
    button.id = id;
    button.textContent = text;
    button.addEventListener('click', action);
    buttonContainer.append(button);
  }

  const toggleConsole = () => {
    if (showConsole) {
      debugContainer.classList.add(styles.hide);
    } else {
      debugContainer.classList.remove(styles.hide);
    }
    showConsole = !showConsole;
  }

  return {
    createButton,
    toggleConsole,
  }
}
