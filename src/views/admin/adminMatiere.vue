<script setup>
  import { ref,onMounted } from 'vue';

  const showModalAjout = ref(false)
  const showModalupdate = ref(false)

  const toggleForm_ajout = ()=> {
    showModalAjout.value = !showModalAjout.value
  }
    const toggleForm_update = ()=> {
    showModalupdate.value = !showModalupdate.value
  }

</script>

<template>
  <div class="container">
    <div
      data-v-57ff2339=""
      data-v-7a7a37b1=""
      class=""
      style="display: flex; flex-direction: column; gap: 24px"
    >
      <!-- Header -->
      <div data-v-57ff2339="" class="pro-page-header">
        <div data-v-57ff2339="">
          <h1 data-v-57ff2339="" class="pro-page-title">Matières</h1>
          <p data-v-57ff2339="" class="pro-page-sub">6 matière(s) au programme</p>
        </div>
        <button data-v-57ff2339="" class="pro-btn pro-btn-primary button_special" @click="toggleForm_ajout()" >
          <svg
            data-v-57ff2339=""
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            role="img"
          >
            <!-- Dashboard --><!-- Plus -->
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Ajouter une matière
        </button>
      </div>
      <!-- Grille de cartes -->
      <div data-v-57ff2339="" class="subjects-grid" role="list" aria-label="Liste des matières">
        <div
          data-v-57ff2339=""
          class="subject-card"
          role="listitem"
          aria-label="Mathématiques, 1 enseignant(s)"
          style="--sc: #4bbfed"
        >
          <!-- Fond décoratif -->
          <div data-v-57ff2339="" class="sc-bg-circle" aria-hidden="true"></div>
          <!-- Actions flottantes -->
          <div data-v-57ff2339="" class="sc-actions">
            <button
              data-v-57ff2339=""
              class="pro-icon-btn"
              aria-label="Modifier Mathématiques"
              title="Modifier"
              @click.prevent="toggleForm_update"
            >
              <svg
                data-v-57ff2339=""
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                role="img"
              >
                <!-- Dashboard --><!-- Edit / Pencil -->
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg></button
            ><button
              data-v-57ff2339=""
              class="pro-icon-btn pro-icon-btn-danger"
              aria-label="Supprimer Mathématiques"
              title="Supprimer"
            >
              <svg
                data-v-57ff2339=""
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                role="img"
              >
                <!-- Dashboard --><!-- Trash -->
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                <path d="M10 11v6M14 11v6"></path>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
              </svg>
            </button>
          </div>
          <!-- Icône -->
          <div data-v-57ff2339="" class="sc-icon-wrap">
            <svg
              data-v-57ff2339=""
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              role="img"
            >
              <!-- Dashboard --><!-- Book -->
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <!-- Nom -->
          <h3 data-v-57ff2339="" class="sc-name">Mathématiques</h3>
          <!-- Footer : enseignants uniquement -->
          <div data-v-57ff2339="" class="sc-footer">
            <div data-v-57ff2339="" class="sc-footer-icon">
              <svg
                data-v-57ff2339=""
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                role="img"
              >
                <!-- Dashboard --><!-- Teachers / Users -->
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span data-v-57ff2339="" class="sc-footer-txt">1 enseignant</span>
          </div>
        </div>
     
     
        <!-- Carte "Ajouter" -->
        <button
          data-v-57ff2339=""
          class="subject-card sc-add"
          aria-label="Ajouter une matière"
          @click.prevent="toggleForm_ajout"
        >
          <div data-v-57ff2339="" class="sc-add-icon">
            <svg
              data-v-57ff2339=""
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              role="img"
            >
              <!-- Dashboard --><!-- Plus -->
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span data-v-57ff2339="" class="sc-add-label">Nouvelle matière</span>
        </button>
      </div>
      <!-- Modal --><!--teleport start--><!--teleport end--><!--teleport start--><!--teleport end-->
    </div>
  </div>

  <!-- FORMULAIRE D'AJOUT -->
  <div  class="modal-overlay" v-show="showModalAjout">
    <div class="form_container">
      <div class="form_banner">
        <h2>Ajouter un enseignant</h2>
        <button  @click.prevent="toggleForm_ajout()" class="form_reduct_button">x</button>
      </div>
      <div class="form_ajout">
        <form action="Ajouter" method="post">
          <div class="form_grid">
            <div class="form_grid_input">
              <label for="Nom">Nom de la matière</label>
              <input type="text" placeholder="Nom" />
            </div>
            
          </div>
        </form>
      </div>
      <div class="form_button">
        <button @click.prevent="toggleForm_ajout()" class="button_annuler button_special" >Annuler</button>
        <button class="button_ajouter button_special">+Ajouter</button>
      </div>
    </div>
  </div>

  <!-- FORMULAIRE DE MISE À JOUR -->
  <div  class="modal-delete-overlay" v-if="showModalupdate">
    <div class="form_container">
      <div class="form_banner">
        <h2>Modifier une matieère</h2>
        <button @click.prevent="toggleForm_update()" class="form_reduct_button">x</button>
      </div>
      <div class="form_ajout">
        <form action="Ajouter" method="post">
          <div class="form_grid">
            <div class="form_grid_input">
              <label for="Nom">Nom de la matière</label>
              <input type="text" placeholder="Nom" />
            </div>
          </div>
        </form>
      </div>
      <div class="form_button">
        <button @click="toggleForm_update()" class="button_annuler button_special">Annuler</button>
        <button class="button_ajouter button_special">Enregistrer</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Grille ─────────────────────────────────────── */
.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
}

/* ── Carte matière ──────────────────────────────── */
.subject-card {
  position: relative;
  overflow: hidden;
  background: white;
  border-radius: 18px;
  border: 1px solid var(--pro-border);
  box-shadow: var(--pro-shadow-md);
  padding: 22px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: default;
  transition:
    transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.2s ease;
}
.subject-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.06);
}

/* Cercle déco en fond */
.sc-bg-circle {
  position: absolute;
  top: -28px;
  right: -28px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--sc) 10%, transparent);
  transition: transform 0.3s ease;
  pointer-events: none;
}
.subject-card:hover .sc-bg-circle {
  transform: scale(1.3);
}

/* Actions flottantes (visibles au hover) */
.sc-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transform: translateY(-4px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  z-index: 2;
}
.subject-card:hover .sc-actions {
  opacity: 1;
  transform: translateY(0);
}

/* Icône principale */
.sc-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 13px;
  background: color-mix(in srgb, var(--sc) 12%, white);
  border: 1.5px solid color-mix(in srgb, var(--sc) 22%, transparent);
  color: var(--sc);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.subject-card:hover .sc-icon-wrap {
  transform: scale(1.1) rotate(-4deg);
}

/* Nom */
.sc-name {
  font-size: 1.05rem;
  font-weight: 900;
  color: var(--pro-ink);
  letter-spacing: -0.015em;
  line-height: 1.25;
  padding-right: 32px; /* espace pour les actions */
}

/* Footer enseignants */
.sc-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--pro-border);
}
.sc-footer-icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--sc) 10%, white);
  color: var(--sc);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sc-footer-txt {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--pro-muted);
}

/* Carte "Ajouter" */
.sc-add {
  border: 2px dashed var(--pro-border);
  background: #fafcff;
  box-shadow: none;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  cursor: pointer;
  font-family: var(--pro-font);
  transition: all 0.2s ease;
}
.sc-add:hover {
  border-color: var(--pro-blue);
  background: var(--pro-blue-soft);
  transform: translateY(-3px);
  box-shadow: var(--pro-shadow-md);
}
.sc-add-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--pro-border);
  color: var(--pro-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}
.sc-add:hover .sc-add-icon {
  background: var(--pro-blue);
  color: white;
}
.sc-add-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--pro-muted);
}
.sc-add:hover .sc-add-label {
  color: var(--pro-blue);
}

/* ── Formulaire couleur ─────────────────────────── */
.color-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1.5px solid var(--pro-border);
  cursor: pointer;
  padding: 2px;
  background: none;
  flex-shrink: 0;
}
.color-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.color-chip {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition:
    transform 0.15s,
    border-color 0.15s;
}
.color-chip:hover {
  transform: scale(1.2);
}
.color-chip-active {
  border-color: var(--pro-ink) !important;
  transform: scale(1.15);
  box-shadow: 0 0 0 2px white inset;
}

/* Aperçu live dans la modale */
.color-preview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: color-mix(in srgb, var(--sc) 8%, white);
  border: 1.5px solid color-mix(in srgb, var(--sc) 20%, transparent);
  border-radius: 12px;
  padding: 12px 16px;
  margin-top: 6px;
}
.cpc-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--sc) 15%, white);
  color: var(--sc);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cpc-name {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--pro-ink);
}

/* Responsive */
@media (max-width: 480px) {
  .subjects-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.form_container {
  width: 550px;
  margin: 0 auto;
  border-radius: 40px;
  color: #1a2b5e;
  font-family: 'Nunito', sans-serif;
  padding: 10px;
  background-color: #fff;
}

.form_banner {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}

.form_reduct_button {
  all: unset;
  height: 36px;
  width: 36px;
  background-color: #e2eaff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.form_reduct_button:hover {
  transform: none;
  color: #ff5c5c;
  background-color: #ffe2e2;
}

.form_ajout {
  padding: 10px 0;
}

.form_grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 10px;
}

.form_grid_input {
  font-size: 0.88rem;
  font-weight: 800;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form_grid_input input {
  padding: 12px 16px;
  background-color: #fafcff;
  border: 2px solid #d4e2ff;
  border-radius: 18px;
}

.form_grid_input input::placeholder {
  color: #6278a8;
}

.form_grid_input input:focus {
  outline: none;
  transition: 0.2s;
  border-color: #4bbfed;
}

.form_button {
  display: flex;
  justify-content: end;
  gap: 12px;
  padding: 14px 10px;
  border-top: 1.5px solid #e2eaff;
}

.button_annuler {
  background-color: #fff;
  color: #1a2b5e;
  border: 2px solid #d4e2ff;
  box-shadow: none;
  
}

.button_annuler:hover {
  border-color: #4bbfed;
  background-color: #bfe8f8;
  box-shadow: none;
}

.button_special {
  font-family: 'Baloo 2', sans-serif;
  color: white;
  background-color: #4bbfed;
  border-radius: 18px;
  border-style: none;
  font-size: 18px;
  font-weight: bold;
  padding: 14px 30px;
  box-shadow: 0 6px 20px #4bbfed59;
  transition: 0.3s ease-out;
  cursor: pointer;
}

.button_special:hover {
  background: #4bbfedde;
  transition: 0.3s ease-out;
  transform: translateY(-4px);
}


.classes_reduct_button {
  all: unset;
  height: 36px;
  width: 36px;
  background-color: #e2eaff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.classes_reduct_button:hover {
  transform: none;
  background-color: #ffe2e2;
  color: #ff5c5c;
}

/* modal css */
.modal-overlay {
  position: fixed;
  z-index: 1000;
  background-color: #1a2b5e8c;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
}

.modal-second-overlay{
  position: fixed;
  z-index: 1000;
  background-color: #1a2b5e8c;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
}

.classes_container{
  width: 430px;
  margin: 0 auto;
  border-radius: 40px;
  color: #1a2b5e;
  font-family: 'Nunito', sans-serif;
  padding: 20px;
  background-color: #fff;
}

.classes_banner{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
}

.classes_ajout{
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin-bottom: 10px;
  width: 100%;
}

.classes_ajout select{
  border: 2px solid #d4e2ff;
  border-radius: 20px;
  padding: 10px;
  color: #1a2b5e;
  font-size: 20px;
  font-weight: 800;
}

.classes_ajout select:hover{
  transition: 0.3s;
  border-color: #1a88b8;
  background-color: #c6edfc;
}

.classes_ajout select:focus{
  transition: 0.3s;
  background-color: #b0f5e4;
  border-color: #0a7a54;
}

.classes_avatar{
  height: 36px;
  width: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  background: linear-gradient(135deg, #22d4a0, #4bbfed);
  font-family: 'Baloo 2', cursive;
  font-weight: 900;
  color: white;
}

.classes_name{
  color: #1a2b5e;
  font-size: 0.9rem;
  font-weight: 800;
}

.classes_footer{
  padding: 16px 12px 10px 12px;
  border-top: 1px solid #e2eaff;
  display: flex;
  justify-content: center;
}

.classes_footer button{
  width: 100%;
}

.modal-third-overlay{
  position: fixed;
  z-index: 1000;
  background-color: #1a2b5e8c;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
}

.delete_body{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
}
.delete_body_svg{
  height: 100px;
  width: 100px;
}

.modal-delete-overlay{
  position: fixed;
  z-index: 1000;
  background-color: #1a2b5e8c;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
}
</style>
