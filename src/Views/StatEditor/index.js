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
    </select>
    <div id="stats" class="${styles.statInputs}"></div>
    <button type="submit" id="submit" class="hidden">Save</button>
  </form>
</div>
`;

export const StatEditor = (container) => {
  let selectedUnit = null;
  let modifiedStats = {};
  container.innerHTML = StatEditorScreen();
  const statsContainer = document.getElementById('stats');

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
      const newValue = parseInt(e.target.value);
      if (selectedUnit[stat] === newValue) return;

      modifiedStats[stat] = newValue;
    });

    inputGroup.appendChild(label);
    inputGroup.appendChild(input);

    statsContainer.append(inputGroup);
  }

  const unitSelector = document.getElementById('unit_selector')

  unitSelector.addEventListener("change", (e) => {
    statsContainer.innerHTML = "";
    if (units[e.target.value]) {
      document.getElementById('submit').classList.remove('hidden');
      selectedUnit = units[e.target.value];
      const { stats } = selectedUnit;
      for (const [stat, value] of Object.entries(stats)) {
        addStatInput(stat, value);
      }
    } else {
      selectedUnit = null;
      document.getElementById('submit').classList.add('hidden');
    }
  });

  const form = document.getElementById('stat_editor_form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (Object.keys(modifiedStats).length > 0) {
      Object.keys(modifiedStats).map(stat => {
        selectedUnit.stats[stat] = modifiedStats[stat];
      })

      statsContainer.innerHTML = `Saved stats for ${selectedUnit.name}!`;
      unitSelector.value = "";
      selectedUnit = null;
      document.getElementById('submit').classList.add('hidden');
    } 
  });
}
