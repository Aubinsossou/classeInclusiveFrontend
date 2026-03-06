<script setup>
import { ref } from 'vue'
import { apiGet,apiPost,apiPut,apiDelete } from '@/helpers/axiosApi'


//Script d'apparition et de disparition du formulaire d'ajout
const showForm_ajout = ref(false)
const toggleForm_ajout = () => {
  showForm_ajout.value = !showForm_ajout.value
}

//Script d'apparition et de disparition du formulaire d'update
const showForm_update = ref(false)
const toggleForm_update = () => {
  showForm_update.value = !showForm_update.value
}

//Script d'apparition pour la confirmation de suppression
const showForm_delete = ref(false)
const toggleForm_delete = () => {
  showForm_delete.value = !showForm_delete.value
}
</script>

<template>
  <section>
    <div class="div_haute">
      <div class="container">
        <div class="div_haute_container">
          <div class="div_haute_enseignant">
            <h1>Élève</h1>
            <p>10 élève(s) enregistré(s)</p>
          </div>
          <div class="div_haute_bouton">
            <button @click="toggleForm_ajout">+Inscrire un élève</button>
          </div>
        </div>
      </div>
    </div>

    <div class="div_basse">
      <div class="container">
        <div class="div_basse_container">
          <div class="div_basse_container_banner">
            <input
              type="search"
              placeholder="Rechercher par nom, email,matière..."
              class="search-bar"
            />
            <select name="All_classes" id="classes_select">
              <option value="">Toutes les classes</option>
              <option value="CI">CI</option>
              <option value="CP">CP</option>
              <option value="CE1">CE1</option>
            </select>
            <select name="All_handicap" id="handicap_select">
              <option value="">Tous les profils</option>
              <option value="Standard">Standard</option>
              <option value="Déficience visuel">Déficience visuel</option>
              <option value="Déficience auditif">Déficience auditif</option>
              <option value="Déficience moteur">Déficience moteur</option>
            </select>
          </div>
          <div class="wrap">
            <table class="basse_container_table">
              <thead>
                <tr>
                  <th>ÉLÈVE</th>
                  <th>CLASSE</th>
                  <th>PROFIL</th>
                  <th>DATE DE NAISSANCE</th>
                  <th>NUMÉRO DES PARENTS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="td_name_cell">
                    <div class="td_avatar">H</div>
                    <div class="name_sub">
                      <div class="td_name">HEVOU Victorius</div>
                    </div>
                  </td>
                  <td class="td_classe"><span class="classe_green_badge">CM2</span></td>
                  <td class="td_profil"><span class="classe_blue_badge">Standard</span></td>
                  <td class="td_date_ajout">2025-09-05</td>
                  <td class="td_num_parent">0195035500</td>
                  <td class="td_actions">
                    <a @click="toggleForm_update()" class="td_actions_update">
                      <svg
                        height="100%"
                        width="100%"
                        version="1.1"
                        id="Capa_1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 53.255 53.255"
                        xml:space="preserve"
                        fill="#000000"
                      >
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          <path
                            style="fill: #d75a4a"
                            d="M39.598,2.343c3.124-3.124,8.19-3.124,11.314,0s3.124,8.19,0,11.314L39.598,2.343z"
                          ></path>
                          <polygon
                            style="fill: #ed8a19"
                            points="42.426,17.899 16.512,43.814 15.982,48.587 44.548,20.02 44.548,20.02 "
                          ></polygon>
                          <polygon
                            style="fill: #ed8a19"
                            points="10.325,42.93 15.098,42.4 41.012,16.485 36.77,12.243 10.855,38.157 "
                          ></polygon>
                          <polygon
                            style="fill: #ed8a19"
                            points="35.356,10.829 33.234,8.707 33.234,8.707 4.668,37.273 9.441,36.743 "
                          ></polygon>
                          <polygon
                            style="fill: #c7cac7"
                            points="48.79,15.778 48.79,15.778 50.912,13.657 39.598,2.343 37.476,4.465 37.477,4.465 "
                          ></polygon>
                          <polygon
                            style="fill: #c7cac7"
                            points="36.062,5.879 36.062,5.879 34.648,7.293 34.648,7.293 45.962,18.606 45.962,18.606 47.376,17.192 47.376,17.192 "
                          ></polygon>
                          <path
                            style="fill: #fbce9d"
                            d="M14.424,44.488l-5.122,0.569c-0.036,0.004-0.073,0.006-0.109,0.006c0,0-0.001,0-0.001,0H9.192H9.192 c-0.001,0-0.001,0-0.001,0c-0.036,0-0.073-0.002-0.109-0.006c-0.039-0.004-0.071-0.026-0.108-0.035 c-0.072-0.017-0.141-0.035-0.207-0.067c-0.05-0.024-0.093-0.053-0.138-0.084c-0.057-0.04-0.109-0.083-0.157-0.134 c-0.038-0.04-0.069-0.081-0.1-0.127c-0.038-0.057-0.069-0.116-0.095-0.181c-0.022-0.054-0.038-0.107-0.05-0.165 c-0.007-0.032-0.024-0.059-0.028-0.092c-0.004-0.038,0.01-0.073,0.01-0.11c0-0.038-0.014-0.072-0.01-0.11l0.569-5.122l-5.122,0.569 c-0.037,0.004-0.075,0.006-0.111,0.006c-0.079,0-0.152-0.024-0.227-0.042L0.442,51.399l2.106-2.106c0.391-0.391,1.023-0.391,1.414,0 s0.391,1.023,0,1.414l-2.106,2.106l12.03-2.864c-0.026-0.109-0.043-0.222-0.03-0.339L14.424,44.488z"
                          ></path>
                          <path
                            style="fill: #38454f"
                            d="M3.962,49.293c-0.391-0.391-1.023-0.391-1.414,0l-2.106,2.106L0,53.255l1.856-0.442l2.106-2.106 C4.352,50.316,4.352,49.684,3.962,49.293z"
                          ></path>
                          <polygon
                            style="fill: #f2ecbf"
                            points="48.79,15.778 37.477,4.465 37.476,4.465 36.062,5.879 36.062,5.879 47.376,17.192 47.376,17.192 48.79,15.778 "
                          ></polygon>
                          <path
                            style="fill: #ebba16"
                            d="M41.012,16.485L15.098,42.4l-4.773,0.53l0.53-4.773L36.77,12.243l-1.414-1.414L9.441,36.743 l-4.773,0.53l-1.133,1.133l-0.228,0.957c0.075,0.018,0.147,0.042,0.227,0.042c0.036,0,0.074-0.002,0.111-0.006l5.122-0.569 l-0.569,5.122c-0.004,0.038,0.01,0.073,0.01,0.11c0,0.038-0.014,0.072-0.01,0.11c0.004,0.033,0.021,0.06,0.028,0.092 c0.012,0.057,0.029,0.112,0.05,0.165c0.026,0.064,0.057,0.124,0.095,0.181c0.03,0.045,0.063,0.088,0.1,0.127 c0.047,0.05,0.1,0.094,0.157,0.134c0.044,0.031,0.089,0.061,0.138,0.084c0.065,0.031,0.135,0.05,0.207,0.067 c0.038,0.009,0.069,0.03,0.108,0.035c0.036,0.004,0.072,0.006,0.109,0.006h0.001h0h0.001h0.001c0,0,0.001,0,0.001,0h0 c0.035,0,0.072-0.002,0.109-0.006l5.122-0.569l-0.569,5.122c-0.013,0.118,0.004,0.23,0.03,0.339l0.963-0.229l1.133-1.132l0.53-4.773 l25.914-25.915L41.012,16.485z"
                          ></path>
                          <polygon
                            style="fill: #f2ecbf"
                            points="45.962,18.606 34.648,7.293 34.648,7.293 33.234,8.707 33.234,8.707 35.356,10.829 36.77,12.243 41.012,16.485 42.426,17.899 44.548,20.02 44.548,20.02 45.962,18.606 "
                          ></polygon>
                        </g>
                      </svg>
                    </a>
                    <a @click="toggleForm_delete()" class="td_actions_delete">
                      <svg
                        viewBox="0 0 1024 1024"
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        preserveAspectRatio="xMidYMid meet"
                        fill="#000000"
                      >
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          <path d="M724.3 198H296.1l54.1-146.6h320z" fill="#FAFCFB"></path>
                          <path
                            d="M724.3 216.5H296.1c-6.1 0-11.7-3-15.2-7.9-3.5-5-4.3-11.3-2.2-17L332.8 45c2.7-7.3 9.6-12.1 17.4-12.1h320c7.7 0 14.7 4.8 17.4 12.1l54.1 146.6c2.1 5.7 1.3 12-2.2 17-3.5 4.9-9.2 7.9-15.2 7.9z m-401.6-37h375.1L657.3 69.9H363.1l-40.4 109.6z"
                            fill="#0F0F0F"
                          ></path>
                          <path
                            d="M664.3 981.6H339.7c-54.2 0-98.5-43.3-99.6-97.5L223.7 235h572.9l-32.8 651.4c-2.3 53.2-46.1 95.2-99.5 95.2z"
                            fill="#9DC6AF"
                          ></path>
                          <path
                            d="M664.3 995H339.7c-29.7 0-57.8-11.4-79-32.2-21.2-20.8-33.3-48.6-34-78.3L210 221.6h600.7L777.2 887c-2.6 60.5-52.2 108-112.9 108zM237.4 248.3l16 635.5c0.5 22.7 9.7 44 25.9 59.8 16.2 15.9 37.7 24.6 60.4 24.6h324.6c46.3 0 84.2-36.2 86.2-82.5l32.1-637.4H237.4z"
                            fill="#191919"
                          ></path>
                          <path
                            d="M827.1 239.5H193.3c-22.2 0-40.4-18.2-40.4-40.4v-2.2c0-22.2 18.2-40.4 40.4-40.4h633.8c22.2 0 40.4 18.2 40.4 40.4v2.2c0 22.2-18.2 40.4-40.4 40.4z"
                            fill="#d38731"
                          ></path>
                          <path
                            d="M826 252.9H194.4c-30.3 0-54.9-24.6-54.9-54.9 0-30.3 24.6-54.9 54.9-54.9H826c30.3 0 54.9 24.6 54.9 54.9s-24.7 54.9-54.9 54.9z m-631.6-83.1c-15.5 0-28.2 12.6-28.2 28.2s12.6 28.2 28.2 28.2H826c15.5 0 28.2-12.6 28.2-28.2 0-15.5-12.6-28.2-28.2-28.2H194.4z"
                            fill="#111111"
                          ></path>
                          <path d="M354.6 430.3v369.6" fill="#FAFCFB"></path>
                          <path
                            d="M354.6 813.3c-7.4 0-13.4-6-13.4-13.4V430.3c0-7.4 6-13.4 13.4-13.4s13.4 6 13.4 13.4v369.6c-0.1 7.4-6 13.4-13.4 13.4z"
                            fill="#0F0F0F"
                          ></path>
                          <path d="M458.3 430.3v369.6" fill="#FAFCFB"></path>
                          <path
                            d="M458.3 813.3c-7.4 0-13.4-6-13.4-13.4V430.3c0-7.4 6-13.4 13.4-13.4s13.4 6 13.4 13.4v369.6c0 7.4-6 13.4-13.4 13.4z"
                            fill="#0F0F0F"
                          ></path>
                          <path d="M562.1 430.3v369.6" fill="#FAFCFB"></path>
                          <path
                            d="M562.1 813.3c-7.4 0-13.4-6-13.4-13.4V430.3c0-7.4 6-13.4 13.4-13.4s13.4 6 13.4 13.4v369.6c-0.1 7.4-6.1 13.4-13.4 13.4z"
                            fill="#0F0F0F"
                          ></path>
                          <path d="M665.8 430.3v369.6" fill="#FAFCFB"></path>
                          <path
                            d="M665.8 813.3c-7.4 0-13.4-6-13.4-13.4V430.3c0-7.4 6-13.4 13.4-13.4s13.4 6 13.4 13.4v369.6c0 7.4-6 13.4-13.4 13.4z"
                            fill="#0F0F0F"
                          ></path>
                        </g>
                      </svg>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FORMULAIRE D'AJOUT -->
  <div v-if="showForm_ajout" @click.self="toggleForm_ajout()" class="modal-overlay">
    <div class="form_container">
      <div class="form_banner">
        <h2>Inscrire un élève</h2>
        <button @click="toggleForm_ajout()" class="form_reduct_button">x</button>
      </div>
      <div class="form_ajout">
        <form action="Ajouter" method="post">
          <div class="form_grid">
            <div class="form_grid_input">
              <label for="Nom">Nom</label>
              <input type="text" placeholder="Nom " />
            </div>
            <div class="form_grid_input">
              <label for="Prénom">Prénom</label>
              <input type="text" placeholder="Prénom" />
            </div>
            <div class="form_grid_input">
              <label for="Date">Date de naissance</label>
              <input type="date" placeholder="Date de naissance" />
            </div>
            <div class="form_grid_input">
              <label for="Student_classe">Classe</label>
              <select name="student_classe" id="student_classe_id">
                <option value="">Choisir...</option>
                <option value="CI">CI</option>
                <option value="CP">CP</option>
                <option value="CE1">CE1</option>
              </select>
            </div>
            <div class="form_grid_input">
              <label for="Student_profil">Profil d'accessibilité</label>
              <select name="student_profil" id="student_profil_id">
                <option value="Standard">Standard</option>
                <option value="Déficience visuel">Déficience visuel</option>
                <option value="Déficience auditif">Déficience auditif</option>
                <option value="Déficience moteur">Déficience moteur</option>
              </select>
            </div>
            <div class="form_grid_input">
              <label for="Numéro des parents">Numéro des parents</label>
              <input type="number" placeholder="01 95 95 95 95" />
            </div>
          </div>
        </form>
      </div>
      <div class="form_button">
        <button @click="toggleForm_ajout()" class="button_annuler">Annuler</button>
        <button class="button_ajouter">+Ajouter</button>
      </div>
    </div>
  </div>

  <!-- FORMULAIRE DE MISE À JOUR -->
  <div v-if="showForm_update" @click.self="toggleForm_update()" class="modal-delete-overlay">
    <div class="form_container">
      <div class="form_banner">
        <h2>Ajouter un enseignant</h2>
        <button @click="toggleForm_update()" class="form_reduct_button">x</button>
      </div>
      <div class="form_ajout">
        <form action="Ajouter" method="post">
          <div class="form_grid">
            <div class="form_grid_input">
              <label for="Nom">Nom</label>
              <input type="text" placeholder="Nom " />
            </div>
            <div class="form_grid_input">
              <label for="Prénom">Prénom</label>
              <input type="text" placeholder="Prénom" />
            </div>
            <div class="form_grid_input">
              <label for="Date">Date de naissance</label>
              <input type="date" placeholder="Date de naissance" />
            </div>
            <div class="form_grid_input">
              <label for="Student_classe">Classe</label>
              <select name="student_classe" id="student_classe_id">
                <option value="">Choisir...</option>
                <option value="CI">CI</option>
                <option value="CP">CP</option>
                <option value="CE1">CE1</option>
              </select>
            </div>
            <div class="form_grid_input">
              <label for="Student_profil">Profil d'accessibilité</label>
              <select name="student_profil" id="student_profil_id">
                <option value="Standard">Standard</option>
                <option value="Déficience visuel">Déficience visuel</option>
                <option value="Déficience auditif">Déficience auditif</option>
                <option value="Déficience moteur">Déficience moteur</option>
              </select>
            </div>
            <div class="form_grid_input">
              <label for="Numéro des parents">Numéro des parents</label>
              <input type="number" placeholder="01 95 95 95 95" />
            </div>
          </div>
        </form>
      </div>
      <div class="form_button">
        <button @click="toggleForm_update()" class="button_annuler">Annuler</button>
        <button class="button_ajouter">+Ajouter</button>
      </div>
    </div>
  </div>

  <!-- Confirmation de suppression d'enseignant -->
   <div v-if="showForm_delete" @click.self="toggleForm_delete()" class="modal-third-overlay">
    <div class="classes_container">
      <div class="classes_banner">
        <h2>Supprimer cet enseignant</h2>
        <button @click="toggleForm_delete()" class="classes_reduct_button">x</button>
      </div>
      <div class="delete_body">
        <div class="delete_body_svg">
          <svg
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            fill="#000000"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M724.3 198H296.1l54.1-146.6h320z" fill="#FAFCFB"></path>
              <path
                d="M724.3 216.5H296.1c-6.1 0-11.7-3-15.2-7.9-3.5-5-4.3-11.3-2.2-17L332.8 45c2.7-7.3 9.6-12.1 17.4-12.1h320c7.7 0 14.7 4.8 17.4 12.1l54.1 146.6c2.1 5.7 1.3 12-2.2 17-3.5 4.9-9.2 7.9-15.2 7.9z m-401.6-37h375.1L657.3 69.9H363.1l-40.4 109.6z"
                fill="#0F0F0F"
              ></path>
              <path
                d="M664.3 981.6H339.7c-54.2 0-98.5-43.3-99.6-97.5L223.7 235h572.9l-32.8 651.4c-2.3 53.2-46.1 95.2-99.5 95.2z"
                fill="#9DC6AF"
              ></path>
              <path
                d="M664.3 995H339.7c-29.7 0-57.8-11.4-79-32.2-21.2-20.8-33.3-48.6-34-78.3L210 221.6h600.7L777.2 887c-2.6 60.5-52.2 108-112.9 108zM237.4 248.3l16 635.5c0.5 22.7 9.7 44 25.9 59.8 16.2 15.9 37.7 24.6 60.4 24.6h324.6c46.3 0 84.2-36.2 86.2-82.5l32.1-637.4H237.4z"
                fill="#191919"
              ></path>
              <path
                d="M827.1 239.5H193.3c-22.2 0-40.4-18.2-40.4-40.4v-2.2c0-22.2 18.2-40.4 40.4-40.4h633.8c22.2 0 40.4 18.2 40.4 40.4v2.2c0 22.2-18.2 40.4-40.4 40.4z"
                fill="#d38731"
              ></path>
              <path
                d="M826 252.9H194.4c-30.3 0-54.9-24.6-54.9-54.9 0-30.3 24.6-54.9 54.9-54.9H826c30.3 0 54.9 24.6 54.9 54.9s-24.7 54.9-54.9 54.9z m-631.6-83.1c-15.5 0-28.2 12.6-28.2 28.2s12.6 28.2 28.2 28.2H826c15.5 0 28.2-12.6 28.2-28.2 0-15.5-12.6-28.2-28.2-28.2H194.4z"
                fill="#111111"
              ></path>
              <path d="M354.6 430.3v369.6" fill="#FAFCFB"></path>
              <path
                d="M354.6 813.3c-7.4 0-13.4-6-13.4-13.4V430.3c0-7.4 6-13.4 13.4-13.4s13.4 6 13.4 13.4v369.6c-0.1 7.4-6 13.4-13.4 13.4z"
                fill="#0F0F0F"
              ></path>
              <path d="M458.3 430.3v369.6" fill="#FAFCFB"></path>
              <path
                d="M458.3 813.3c-7.4 0-13.4-6-13.4-13.4V430.3c0-7.4 6-13.4 13.4-13.4s13.4 6 13.4 13.4v369.6c0 7.4-6 13.4-13.4 13.4z"
                fill="#0F0F0F"
              ></path>
              <path d="M562.1 430.3v369.6" fill="#FAFCFB"></path>
              <path
                d="M562.1 813.3c-7.4 0-13.4-6-13.4-13.4V430.3c0-7.4 6-13.4 13.4-13.4s13.4 6 13.4 13.4v369.6c-0.1 7.4-6.1 13.4-13.4 13.4z"
                fill="#0F0F0F"
              ></path>
              <path d="M665.8 430.3v369.6" fill="#FAFCFB"></path>
              <path
                d="M665.8 813.3c-7.4 0-13.4-6-13.4-13.4V430.3c0-7.4 6-13.4 13.4-13.4s13.4 6 13.4 13.4v369.6c0 7.4-6 13.4-13.4 13.4z"
                fill="#0F0F0F"
              ></path>
            </g>
          </svg>
        </div>
        <p>Voulez vous vraiment supprimer cet enseignant ?</p>
        <p>Cette action est irréversible.</p>
      </div>
      <div class="classes_footer">
        <button>Supprimer</button>
      </div>
    </div>
   </div>
</template>

<style scoped>
* {
  padding: 0;
  margin: 0;
  font-family: 'Nunito', sans-serif;
  box-sizing: border-box;
}

h2 {
  font-size: 1.35rem;
  font-weight: 900;
}

button {
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

button:hover {
  background: #4bbfedde;
  transition: 0.3s ease-out;
  transform: translateY(-4px);
}

select{
  padding-left: 10px;
  margin-bottom: 20px;
  font-family: 'Nunito', sans-serif;
  background-color: white;
  color: #1a2b5e;
  border-radius: 30px;
  border: 2px solid #d4e2ff;
  padding: 12px 18px;
  outline: none;
}
select:focus{
  transition: 0.2s;
  border-color: #4bbfed;
}

section {
  padding: 15px;
}

.container {
  width: 1200px;
  margin: 0 auto;
}

.div_haute_container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.div_haute_enseignant h1 {
  font-family: 'Baloo 2', sans-serif;
}

.div_haute_enseignant p {
  font-family: 'Nunito', sans-serif;
  color: #6278a8;
}

.div_basse_container_banner{
  display: flex;
  justify-content: space-between;
}

.search-bar {
  width: 45%;
  padding-left: 15px;
  margin-bottom: 20px;
  font-family: 'Nunito', sans-serif;
  background-color: white;
  color: #1a2b5e;
  border-radius: 30px;
  border: 2px solid #d4e2ff;
  padding: 12px 18px;
  outline: none;
}

.search-bar::placeholder {
  color: #7d879b;
}

.search-bar:focus {
  transition: 0.2s;
  border-color: #4bbfed;
}

.wrap {
  border-radius: 32px;
  overflow: hidden;
  border: 2px solid #d4e2ff;
  box-shadow:
    0 4px 20px #4bbfed1f,
    0 1px 4px #1a2b5e0f;
}

table {
  border-collapse: collapse;
  width: 100%;
}

thead {
  border-spacing: 0;
  background-color: #eff5ff;
}

th {
  padding: 14px 16px;
  text-align: left;
  color: #6278a8;
  font-family: 'Nunito', sans-serif;
  font-size: 0.8rem;
  font-weight: 800;
}

tr {
  border: 1px solid #d4e2ff;
}

td {
  padding: 14px 15px;
}

.td_name_cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.td_avatar {
  height: 36px;
  width: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #4bbfed, #9b7bff);
  font-family: 'Baloo 2', cursive;
  font-weight: 900;
  color: white;
}

.td_name {
  font-size: 0.9rem;
  font-weight: 800;
  color: #1a2b5e;
}

.td_sub {
  font-size: 0.78rem;
  color: #a0b0d0;
}

.classe_green_badge {
  background-color: #b0f5e4;
  color: #0a7a54;
  padding: 3px 10px;
  font-size: 0.78rem;
  font-weight: 800;
  border-radius: 8px;
}

.classe_blue_badge {
  color: #1A88B8;
  background-color: #c6edfc;
  padding: 3px 10px;
  font-size: 0.78rem;
  font-weight: 800;
  border-radius: 8px;
}

.td_date_ajout {
  font-size: 0.9rem;
  color: #1a2b5e;
}

.td_num_parent{
  font-size: 0.9rem;
  color: #1a2b5e;
}

.td_actions {
  display: flex;
  gap: 8px;
}

.td_actions a {
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  border-radius: 14px;
  border: 1.5px solid #d4e2ff;
  background-color: white;
  cursor: pointer;
}
.td_actions_update:hover {
  transition: 0.3s;
  background-color: #c6edfc;
  border-color: #1a88b8;
}

.td_actions_delete:hover {
  transition: 0.3s;
  background-color: #fcc6c6;
  border-color: #b81a1a;
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

.form_grid_input input,select{
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

.classes_cell{
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid #d4e2ff;
  border-radius: 20px;
  padding: 10px;
}

.classes_cell:hover{
  transition: 0.3s;
  border-color: #1a88b8;
  background-color: #c6edfc;
}

.classes_cell:focus{
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