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
  <div class="${styles.barContainer}">
    <span id="expBar" class="${styles.expBar}"></span>
  </div>
</div>
`

const initializeUI = () => {
  const container = document.getElementById("container");
  const ui = document.createElement("div");
  ui.classList.add(styles.UI);
  ui.innerHTML = UIScreen();
  container.appendChild(ui);

  const killCountUI = ui.querySelector("#killCount");
  const minionCountUI = ui.querySelector("#minionCount");
  const healthBarUI = ui.querySelector("#healthBar");
  const expBarUI = ui.querySelector("#expBar");
  const formationUI = ui.querySelector("#formation");
  const aggressionUI = ui.querySelector("#aggression");

  return {
    killCountUI,
    minionCountUI,
    healthBarUI,
    expBarUI,
    formationUI,
    aggressionUI,
  };
}

export const UI = ({
  killCount,
  minionCount,
  playerHealth,
  playerExpPercent,
  minionFormation,
  minionAggression
}) => {
  const {
    killCountUI,
    minionCountUI,
    healthBarUI,
    expBarUI,
    formationUI,
    aggressionUI,
  } = initializeUI();


  // subscribe to events
  killCount.subscribe((kills) => {
    killCountUI.innerHTML = kills.total;
  });
  minionCount.subscribe((minions) => {
    minionCountUI.innerHTML = minions;
  });
  playerExpPercent.subscribe((percent) => {
    expBarUI.textContent = `${percent}%`;
    expBarUI.style.setProperty("--exp-percent", `${percent}%`)
  });
  playerHealth.subscribe(({ current, max }) => {
    healthBarUI.querySelector(`.${styles.healthBar}`).style.setProperty("--hp-percent", `${current / max * 100}%`);
    healthBarUI.querySelector(`.${styles.text}`).textContent = `${Math.round(current)} / ${Math.round(max)}`;
  });
  minionFormation.subscribe(value => {
    formationUI.innerHTML = value;
  })
  minionAggression.subscribe(aggression => {
    aggressionUI.innerHTML = aggression ? "chase enemies" : "hold the line";
  })
}
