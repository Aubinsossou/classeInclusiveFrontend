<script setup>
import { ref } from 'vue'
let disp_form = ref(null)
let visible = ref(false)
let visible_ajout = ref(false)

function affiche() {
  disp_form.value.style.display = 'flex'
}

function alterne() {
  visible = !visible
}
</script>

<template>
  <div class="container">
    <div class="top">
      <div class="top_left">
        <h1>Hi welcome to the classe bord</h1>
        <p>Année 2025-2026</p>
      </div>
      <div class="top_right">
        <button class="add_class" @click="visible_ajout = true">Ajouter une classe</button>
      </div>
    </div>
    <div class="middle">
      <div class="card_class">
        <div class="class_top">
          <div class="class_top_left">
            <p><span>CP</span></p>
          </div>
          <div class="class_top_right">
            <button class="card_edit" @click="visible = true">✏️</button>
            <button class="card_delete">🗑️</button>
          </div>
        </div>
        <h3>CP-A</h3>
        <div class="class_middle">
          <p>Mr Thomas EDEA</p>
          <p>Salle 5</p>
          <p>2025-2026</p>
        </div>
        <div class="class_low">
          <div class="class_low_left">
            <h4>22</h4>
            <p>élèves</p>
          </div>
          <div class="class_low_right">
            <div class="progress_bar">
              <div class="progression"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="card_class">
        <div class="class_top">
          <div class="class_top_left">
            <p><span>CP</span></p>
          </div>
          <div class="class_top_right">
            <button class="card_edit" @click="visible = true">✏️</button>
            <button class="card_delete">🗑️</button>
          </div>
        </div>
        <h3>CP-A</h3>
        <div class="class_middle">
          <p>Mr Thomas EDEA</p>
          <p>Salle 5</p>
          <p>2025-2026</p>
        </div>
        <div class="class_low">
          <div class="class_low_left">
            <h4>22</h4>
            <p>élèves</p>
          </div>
          <div class="class_low_right">
            <div class="progress_bar">
              <div class="progression"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="card_class">
        <div class="class_top">
          <div class="class_top_left">
            <p><span>CP</span></p>
          </div>
          <div class="class_top_right">
            <button class="card_edit" @click="visible = true">✏️</button>
            <button class="card_delete">🗑️</button>
          </div>
        </div>
        <h3>CP-A</h3>
        <div class="class_middle">
          <p>Mr Thomas EDEA</p>
          <p>Salle 5</p>
          <p>2025-2026</p>
        </div>
        <div class="class_low">
          <div class="class_low_left">
            <h4>22</h4>
            <p>élèves</p>
          </div>
          <div class="class_low_right">
            <div class="progress_bar">
              <div class="progression"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="card_class">
        <div class="class_top">
          <div class="class_top_left">
            <p><span>CP</span></p>
          </div>
          <div class="class_top_right">
            <button class="card_edit" @click="visible = true">✏️</button>
            <button class="card_delete">🗑️</button>
          </div>
        </div>
        <h3>CP-A</h3>
        <div class="class_middle">
          <p>Mr Thomas EDEA</p>
          <p>Salle 5</p>
          <p>2025-2026</p>
        </div>
        <div class="class_low">
          <div class="class_low_left">
            <h4>22</h4>
            <p>élèves</p>
          </div>
          <div class="class_low_right">
            <div class="progress_bar">
              <div class="progression"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="formulaire" class="overlay" ref="disp_form" v-show="visible">
    <div class="contenu">
      <button class="fermer" @click="visible = false">X</button>
      <div class="high_overlay">
        <h2>Modifier une classe</h2>
      </div>
      <div class="middle_overlay">
        <form action="" class="form_grid">
          <div class="field">
            <label for="class_name">Nom de la classe</label>
            <input type="text" id="class_name" />
          </div>
          <div class="field">
            <label for="class_level">Niveau</label>
            <select name="Niveau" id="class_level">
              Niveau
            </select>
          </div>
          <div class="field">
            <label for="the_class">Salle</label>
            <input type="text" id="the_class" />
          </div>
          <div class="field">
            <label for="year">Année scolaire</label>
            <input type="text" id="year" />
          </div>
          <div class="field">
            <label for="professor">Professeur principal</label>
            <input type="text" id="professor" />
            <p>Optionnel — peut être assigné plus tard</p>
          </div>
        </form>
      </div>
      <div class="trait"></div>
      <div class="low_overlay">
        <button>Créer</button>
        <button>Annuler</button>
      </div>
    </div>
  </div>

  <div id="formulaire" class="overlay" ref="disp_form" v-show="visible_ajout">
    <div class="contenu">
      <button class="fermer" @click="visible_ajout = false">X</button>
      <div class="high_overlay">
        <h2>Ajouter une classe</h2>
      </div>
      <div class="middle_overlay">
        <form action="" class="form_grid">
          <div class="field">
            <label for="class_name">Nom de la classe</label>
            <input type="text" id="class_name" />
          </div>
          <div class="field">
            <label for="class_level">Niveau</label>
            <select name="Niveau" id="class_level">
              Niveau
            </select>
          </div>
          <div class="field">
            <label for="the_class">Salle</label>
            <input type="text" id="the_class" />
          </div>
          <div class="field">
            <label for="year">Année scolaire</label>
            <input type="text" id="year" />
          </div>
          <div class="field">
            <label for="professor">Professeur principal</label>
            <input type="text" id="professor" />
            <p>Optionnel — peut être assigné plus tard</p>
          </div>
        </form>
      </div>
      <div class="trait"></div>
      <div class="low_overlay">
        <button>Créer</button>
        <button>Annuler</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

* {
  padding: 0;
  margin: 0;
  font-family: Nunito, sans-serif;
  color: #1a2b5e;
}

h1 {
}

span {
  background: linear-gradient(135deg, #22d4a0, #4bbfed);
  color: white;
  border-radius: 20px;
  padding: 6px 14px;
  font-weight: 900;
  font-size: 0.88rem;
}

.container {
  padding: 28px 32px;
  width: 1200px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 0 auto;
}

.middle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add_class {
  background: linear-gradient(140deg, #4bbfed 0%, #2ea8dc 100%);
  color: white;
  border-radius: 15px;
  border: none;
  font-size: 1.1rem;
  padding: 8px;
  box-shadow: 0 6px 20px rgba(75, 191, 237, 0.35);
  transition: 0.4s;
}

.add_class:hover {
  transform: translateY(-3px);
}

.card_class {
  width: 260px;
  display: flex;
  flex-direction: column;
  border: 3px solid #d4e2ff;
  box-shadow:
    0 4px 20px rgba(75, 191, 237, 0.12),
    0 1px 4px rgba(26, 43, 94, 0.06);
  border-radius: 15px;
  padding: 22px 22px 18px;
  margin-top: 8px;
  transition: 0.4s;
  gap: 10px;
  background-color: white;
}

.card_class:hover {
  transform: translateY(-3px);
  box-shadow:
    0 16px 48px rgba(75, 191, 237, 0.25),
    0 4px 14px rgba(26, 43, 94, 0.1);
  border-color: #4bbfed;
}

.card_edit {
  padding: 5px;
  border-radius: 11px;
  border: 1.5px solid #d4e2ff;
}

.card_edit:hover {
  border-color: #4bbfed;
  background-color: #c6edfc;
}

.card_delete {
  padding: 5px;
  border-radius: 11px;
  border: 1.5px solid #d4e2ff;
}

.card_delete:hover {
  border-color: #ff5c5c;
  background-color: #ffe2e2;
}

.class_top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.class_top_right {
  display: flex;
  gap: 5px;
}

.class_low {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress_bar {
  border: none;
  border-radius: 15px;
  height: 7px;
  width: 150px;
  overflow: hidden;
  background: #e2eaff;
}

.progression {
  width: 70%;
  background: linear-gradient(135deg, #22d4a0, #4bbfed);
  height: 100%;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #1a2b5e8c;
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay:target {
  display: flex;
}

.contenu {
  background: white;
  padding: 30px;
  border-radius: 18px;
  width: 500px;
  padding: 20px;
  text-align: center;
}

.fermer {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--cloud);
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 900;
  color: var(--slate);
  transition: all var(--t);
  float: right;
}

.form_grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;
  margin-bottom: 15px;
}

.field {
  display: flex;
  flex-direction: column;
  text-align: left;
}

input {
  border-radius: 12px;
  border: 2px solid #d4e2ff;
  width: 80%;
  height: 44px;
  padding: 0 15px;
  font-size: 1rem;
  transition: 0.3s ease;
  border-radius: 20px;
}

select {
  border-radius: 12px;
  border: 2px solid #d4e2ff;
  width: 95%;
  height: 44px;
  padding: 0 15px;
  font-size: 1rem;
  transition: 0.3s ease;
  border-radius: 20px;
}

input:focus,
select:focus {
  outline: none;
  border-color: #4bbfed;
  box-shadow: 0 0 0 3px rgba(75, 191, 237, 0.2);
}

.trait {
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, transparent, #ede5ff, transparent);
  border-radius: 20px;
  margin-bottom: 25px;
}
</style>
