import { units } from "../../data/units";
import styles from "./index.module.css";

const StatEditorScreen = ({ name, stats }) => `
<div class="${styles.statEditor}"
  <form id="stat_editor_form">
    <div class="${styles.inputGroup}">
      <label for="unit_selector">Choose a unit to modify</label>
      <select id="unit_selector">
        <option value="naked" ${name === "naked" ? "selected" : ""}>Player</option>
        <option value="skeleton">Skeleton</option>
        <option value="guard">Guard</option>
        <option value="paladin">Paladin</option>
      </select>
    </div>
    <div class="${styles.inputGroup}">
      <label for="maxHP">Max HP:</label>
      <input type="text" id="maxHP" value="${stats.maxHP}" placeholder="max hp"></input>
    </div>
    <div class="${styles.inputGroup}">
      <label for="armor">Armor:</label>
      <input type="text" id="armor" value=${stats.armor} placeholder=""></input>
    </div>
    <div class="${styles.inputGroup}">
      <label for="hp_regen">HP Regeneration:</label>
      <input type="text" id="hp_regen" value=${stats.HPregeneration || 0} placeholder=""></input>
    </div>
    <div class="${styles.inputGroup}">
      <label for="maxHP">Max HP:</label>
      <input type="text" id="" value=${stats.moveSpeed || 0} placeholder=""></input>
    </div>
    <div class="${styles.inputGroup}">
      <label for="maxHP">Max HP:</label>
      <input type="text" id="" value=${stats.maxSpeed || 0} placeholder=""></input>
    </div>
    <div class="${styles.inputGroup}">
      <label for="maxHP">Max HP:</label>
      <input type="text" id="" value=${stats.attackRange || 0} placeholder=""></input>
    </div>
    <button type="submit">Save</button>
  </form>
</div>
`;

export const StatEditor = (container) => {
  // const overlay = document.querySelector('#overlay');
  // overlay.classList.add("show");
  container.innerHTML = StatEditorScreen({ ...units.naked });
  console.log(units.skeleton)

  const unitSelector = document.getElementById('unit_selector')
  unitSelector.addEventListener("change", (e) => {
    console.log(units[e.target.value].stats)
    if (units[e.target.value]) {
      container.innerHTML = StatEditorScreen({ ...units[e.target.value] });
    }
  });

  const form = document.getElementById('stat_editor_form');
  form.addEventListener('submit', () => {
    unitStats.maxHP = parseInt(document.getElementById('maxHP').value);
    unitStats.armor = parseInt(document.getElementById('armor').value);
  });
}
