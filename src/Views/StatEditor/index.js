import { units } from "../../data/units";
import styles from "./index.module.css";

const StatEditorScreen = () => `
<div class="${styles.statEditor}">
  <form id="stat_editor_form">
    <h2>Unit Stat Editor</h2>
    <select id="unit_selector">
      <option value="">Select a Unit</option>
      <option value="naked">Player</option>
      <option value="skeleton">Skeleton</option>
      <option value="guard">Guard</option>
      <option value="paladin">Paladin</option>
      <option value="doppelsoldner">Doppelsoldner</option>
    </select>
    <div class="${styles.statInputsContainer}">
      <div id="unit_img"></div>
      <div id="stats_inputs" class="${styles.statInputs}"></div>
    </div>
    <div class="${styles.buttons}">
      <button id="submit" type="submit" class="hidden">Save</button>
      <button id="stat_loader">Load Stats</button>
    </div>
  </form>
</div>
`;

export const StatEditor = (container) => {
  let selectedUnit = null;
  let modifiedStats = {};
  container.innerHTML = StatEditorScreen();
  const statInputs = document.getElementById('stats_inputs');
  const imgContainer = document.getElementById('unit_img');

  const addStatInput = (stat, value) => {
    const inputGroup = document.createElement("div");
    inputGroup.classList.add(styles.inputGroup);

    const label = document.createElement("label");
    label.setAttribute('for', stat);
    label.textContent = stat;

    const input = document.createElement("input");
    input.setAttribute('type', 'text');
    input.setAttribute('id', stat);
    input.setAttribute('value', value);

    input.addEventListener('change', (e) => {
      const newValue = parseFloat(e.target.value);
      if (selectedUnit[stat] === newValue) return;

      modifiedStats[stat] = newValue;
    });

    inputGroup.appendChild(label);
    inputGroup.appendChild(input);

    statInputs.append(inputGroup);
  }

  const createStatEditor = () => {
    imgContainer.innerHTML = "";
    statInputs.innerHTML = "";
    if (!selectedUnit) return;

    const { name, url, stats } = selectedUnit;
    const img = document.createElement('img');
    img.setAttribute('src', url);
    img.setAttribute('alt', `${name} image`);
    imgContainer.appendChild(img);
    for (const [stat, value] of Object.entries(stats)) {
      addStatInput(stat, value);
    }
  }

  const unitSelector = document.getElementById('unit_selector')

  unitSelector.addEventListener("change", (e) => {
    if (units[e.target.value]) {
      document.getElementById('submit').classList.remove('hidden');
      selectedUnit = units[e.target.value];
    } else {
      selectedUnit = null;
      document.getElementById('submit').classList.add('hidden');
    }

    createStatEditor();
  });

  const form = document.getElementById('stat_editor_form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (Object.keys(modifiedStats).length > 0) {
      Object.keys(modifiedStats).map(stat => {
        selectedUnit.stats[stat] = modifiedStats[stat];
      })

      localStorage.setItem(selectedUnit.name, JSON.stringify(modifiedStats));
      imgContainer.innerHTML = "";
      statInputs.innerHTML = `Saved stats for ${selectedUnit.name}!`;
      unitSelector.value = "";
      selectedUnit = null;
      document.getElementById('submit').classList.add('hidden');
    } 
  });

  const statLoader = document.getElementById('stat_loader');

  statLoader.addEventListener('click', () => {
    Object.keys(units).forEach(unit => {
      const savedStats = JSON.parse(localStorage.getItem(unit));

      if (savedStats) {
        for (const [stat, value] of Object.entries(savedStats)) {
          console.log(`loaded stats for ${unit}`)
          units[unit].stats[stat] = value;
        }

        createStatEditor();
      }
    })
  })
}
