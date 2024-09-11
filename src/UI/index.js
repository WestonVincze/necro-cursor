import styles from "./index.module.css";

const UIScreen = () => `
<div class="${styles.topBar}">
  <span>Kills:<span id="killCount">0</span></span>
  <span>Aggression (F): <span id="aggression"></span></span>
  <span>Formation (Q, E): <span id="formation"></span></span>
  <span>Minions:<span id="minionCount">0</span></span>
</div>
<div class="${styles.bottomBar}">
  <div id="healthBar" class="${styles.barContainer}">
    <span class="${styles.healthBar}"></span>
    <span class="${styles.text}"></span>
  </div>
  <div id="expBar" class="${styles.barContainer}">
    <span class="${styles.expBar}"></span>
    <span class="${styles.text}"></span>
  </div>
</div>
`

const initializeUI = () => {
  const container = document.getElementById("container");
  const ui = document.createElement("div");
  ui.classList.add(styles.UI);
  ui.innerHTML = UIScreen();
  container.appendChild(ui);

  return ui;
}

export const UI = ({
  killCount,
  minionCount,
  playerHealth,
  playerExpPercent,
  minionFormation,
  minionAggression
}) => {
  const ui = initializeUI();

  const killCountUI = ui.querySelector("#killCount");
  const minionCountUI = ui.querySelector("#minionCount");
  const healthBarUI = ui.querySelector(`#healthBar .${styles.healthBar}`);
  const healthTextUI = ui.querySelector(`#healthBar .${styles.text}`);
  const expBarUI = ui.querySelector(`#expBar .${styles.expBar}`);
  const expTextUI = ui.querySelector(`#expBar .${styles.text}`);
  const formationUI = ui.querySelector("#formation");
  const aggressionUI = ui.querySelector("#aggression");

  // subscribe to events
  killCount.subscribe((kills) => {
    killCountUI.innerHTML = kills.total;
  });
  minionCount.subscribe((minions) => {
    minionCountUI.innerHTML = minions;
  });
  playerExpPercent.subscribe(({ current, nextLevel }) => {
    expBarUI.style.setProperty("--exp-percent", `${current / nextLevel * 100}%`)
    expTextUI.textContent = `${current} / ${nextLevel}`;
  });
  playerHealth.subscribe(({ current, max }) => {
    healthBarUI.style.setProperty("--hp-percent", `${current / max * 100}%`);
    healthTextUI.textContent = `${Math.round(current)} / ${max}`;
  });
  minionFormation.subscribe(value => {
    formationUI.innerHTML = value;
  })
  minionAggression.subscribe(aggression => {
    aggressionUI.innerHTML = aggression ? "auto chase" : "follow cursor";
  })
}
