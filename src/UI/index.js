import { BehaviorSubject } from "rxjs";
import styles from "./index.module.css";

const UIScreen = () => `
<div class="${styles.topBar}">
  <span>Kills:<span id="killCount">0</span></span>
  <span>Aggression (F): <span id="aggression"></span></span>
  <span>Formation (Q, E): <span id="formation"></span></span>
  <span>Minions:<span id="minionCount">0</span></span>
</div>
<div class="${styles.bottomBar}">
  <div class="${styles.barContainer}">
    <span id="healthBar" class="${styles.healthBar}"></span>
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

  const killCount = ui.querySelector("#killCount");
  const minionCount = ui.querySelector("#minionCount");
  const healthBar = ui.querySelector("#healthBar");
  const expBar = ui.querySelector("#expBar");
  const formation = ui.querySelector("#formation");
  const aggression = ui.querySelector("#aggression");

  return {
    killCount,
    minionCount,
    healthBar,
    expBar,
    formation,
    aggression,
  };
}

export const UI = () => {
  const {
    killCount,
    minionCount,
    healthBar,
    expBar,
  } = initializeUI();

  // build behavior subjects
  const killCountSubject = new BehaviorSubject(0);
  const minionCountSubject = new BehaviorSubject(0);
  const healthBarSubject = new BehaviorSubject(100);
  const expBarSubject = new BehaviorSubject(0);
  const formationSubject = new BehaviorSubject("cluster");
  const aggressionSubject = new BehaviorSubject("attacking");


  // subscribe to events
  killCountSubject.subscribe((kills) => {
    killCount.innerHTML = kills;
  });
  minionCountSubject.subscribe((minions) => {
    minionCount.innerHTML = minions;
  });
  expBarSubject.subscribe((percent) => {
    expBar.style.setProperty("--exp-percent", `${percent}%`)
  });
  healthBarSubject.subscribe((percent) => {
    healthBar.style.setProperty("--hp-percent", `${percent}%`)
  });
  formationSubject.subscribe(value => {
    formation.innerHTML = value;
  })
  aggressionSubject.subscribe(value => {
    aggression.innerHTML = value;
  })

  // exportable emitting functions
  const setKillCountUI = (kills) => {
    killCountSubject.next(kills);
  }
  const setMinionCountUI = (minions) => {
    minionCountSubject.next(minions);
  }
  const setHealthBarUI = (hp) => {
    healthBarSubject.next(hp);
  }
  const setExpBarUI = (exp) => {
    expBarSubject.next(exp);
  }
  const setFormationUI = (formation) => {
    formationSubject.next(formation);
  }
  const setAggressionUI = (aggression) => {
    aggressionSubject.next(aggression ? "attacking" : "passive");
  }

  return {
    setKillCountUI,
    setMinionCountUI,
    setHealthBarUI,
    setExpBarUI,
    setFormationUI,
    setAggressionUI,
  }
}
