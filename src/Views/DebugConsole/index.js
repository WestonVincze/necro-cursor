import styles from "./index.module.css";

const DebugConsoleScreen = () => `
  <div class=${styles.debugContainer}></div>
`;

const Button = (id, text) => `
  <button id="${id}">${text}</button>
`;

// TODO: what should be responsible for padding this data to DebugConsole?
export const DebugConsole = () => {
  const container = document.querySelector('#debugContainer');
  container.innerHTML = DebugConsoleScreen();
  let showConsole = false;

  const createButton = (id, text, action) => {
    const button = Button(id, text);
    button.addEventListener('click', action);
    container.append(button);
  }

  const toggleConsole = () => {
    if (showConsole) {
      container.classList.remove('show');
    } else {
      container.classList.add('show');
    }
  }

  return {
    createButton,
    toggleConsole,
  }
}
