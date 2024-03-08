import styles from "./index.module.css";

const LevelUpScreen = ({ level, options }) => `
<h2>You've Reached Level ${level}</h2>

<p>Choose a reward</p>

<div class="${styles.cards}">
  ${options.map(o => `
    <div class="${styles.card}">
      <h3>${o.name}</h3>
      <p>${o.description}</p>
      <button class="option_button">Choose</button>
    </div>
  `).join('')}
</div>
`
export const LevelUp = ({ level, options }) => {
  const overlay = document.querySelector("#overlay");
  overlay.classList.add("show");
  overlay.innerHTML = LevelUpScreen({ level, options });

  const buttons = overlay.getElementsByClassName("option_button");

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", () => {
      options[i].onSelect();
      overlay.innerHTML = "";
      overlay.classList.remove("show");
    });
  }
}
