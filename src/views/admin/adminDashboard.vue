<script setup>
import { ref, onMounted } from 'vue'
import { apiGet, apiPost } from '@/helpers/axiosApi'
import LoadingEcole from '@/components/admin/LoadingEcole.vue'
const loading = ref(null)

const userAuth = ref()
const listeClasse = ref()
const eleves = ref([])
const listeEnseignants = ref()
const matieres = ref([])
const handicaps = ref()

/* Date actuel  */

function dateActuelle() {
  const date = new Date()

  const jour = date.getDate().toString().padStart(2, '0')
  const mois = (date.getMonth() + 1).toString().padStart(2, '0')
  const annee = date.getFullYear()

  return `${jour}/${mois}/${annee}`
}
/* Liste handicape */

const apiGetHandicaps = async () => {
  const response = await apiGet('ecole/handicap/index')
  handicaps.value = response.data ?? [] // .data.data
  console.log('handicaps.value:', handicaps.value)
}

/* User connecter */
const apiGetUser = async () => {
  const response = await apiGet('ecole/getEcole')
  userAuth.value = response.data
  console.log(' userAuth.value: ', userAuth.value)
}
/* Api liste des classes */

const apiGEtListeClasse = async (ecole_id) => {
  const response = await apiGet('ecole/classe/index/' + ecole_id)
  console.log('ecole_id: ', ecole_id)
  listeClasse.value = response.data
  console.log(' listeClasse: ', listeClasse.value)
}

const apiGetEleves = async () => {
  const response = await apiGet('ecole/eleve/index')
  eleves.value = response.data.data ?? [] // .data.data
  console.log('eleves.value:', eleves.value)
}

const apiGetListeEnseignant = async (id) => {
  const response = await apiGet('/ecole/enseignant/index/' + id)
  listeEnseignants.value = response.data
  console.log(listeEnseignants.value)
}

const apiGetMatieres = async (ecole_id) => {
  const response = await apiGet('ecole/matiere/index/' + ecole_id)
  matieres.value = response.data
  console.log('matieres.value:', matieres.value)
}

onMounted(async () => {
  loading.value = true
  await apiGetUser()
  await apiGetListeEnseignant(userAuth.value?.data?.id)
  await apiGetEleves(userAuth.value?.data?.id)
  await apiGEtListeClasse(userAuth.value?.data.id)
  await apiGetMatieres(userAuth.value?.data?.id)
  await apiGetHandicaps()
  loading.value = false

})
</script>

<template>
  <LoadingEcole :visible="loading" :fullscreen="true" offset-top="100px" message="Chargement" />
<div v-if="loading == false">

  <section class="tableau-bord" >
    <div class="container">
      <div class="tableau-bord-content">
        <div class="tableau-bord-content-left">
          <div>
            <p>{{ userAuth?.data?.name }}</p>
            <h1 style="font-weight: 900; font-family: 'Baloo 2', cursive; font-size: 2rem">
              Tableau de bord
            </h1>
            <p>{{ dateActuelle() }}</p>
          </div>
           <div class="tableau-bord-content-right" style="height: 200px; width: 350px">
              <img src="@/assets/images/logo_classe_inclusive.png" alt="" style="width: 100%" />
            </div>
        </div>
      </div>
    </div>
  </section>

  <section class="stat-card">
    <div class="container">
      <div class="stat-card-content">
        <div class="stat-card-content-card stat-card-content-card-1">
          <div class="d-flex flex-column gap-3">
            <div class="stat-card-content-card-1-icon">
              <span style="width: 60px; height: 40px; display: inline-block"
                ><svg
                  width="100%"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  fill="none"
                >
                  <!-- Fond arrondi -->
                  <rect x="4" y="4" width="40" height="40" rx="10" fill="#E5E7EB" />

                  <!-- Personne principale -->
                  <circle cx="20" cy="20" r="4" stroke="#2563EB" stroke-width="2" fill="none" />
                  <path
                    d="M12 32c0-4 3.5-6 8-6s8 2 8 6"
                    stroke="#2563EB"
                    stroke-width="2"
                    stroke-linecap="round"
                    fill="none"
                  />

                  <!-- Personne secondaire -->
                  <circle cx="30" cy="22" r="3" stroke="#2563EB" stroke-width="2" fill="none" />
                  <path
                    d="M24 32c0-3 3-5 6-5s6 2 6 5"
                    stroke="#2563EB"
                    stroke-width="2"
                    stroke-linecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </div>
            <div class="stat-card-content-card-1-body">
              <span class="fs-1" style="font-weight: 900; font-size: 1.9rem">{{
                listeEnseignants?.data.length
              }}</span
              ><br />
              <span class="stat-card-content-card-1-body-text">ENSEIGNANTS</span>
            </div>
            <div class="stat-card-content-card-1-footer">Créer cette année</div>
          </div>
          <div class="position-relative">
            <span class="top-0 sc-trend">+2 ce mois</span>
            <div class="position-absolute bottom-0 end-0">
              <a href="/ecole/enseignant"
                >Gérer
                <span>
                  <svg
                    style="width: 20px; height: 15px; display: inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgb(89, 159, 250)"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg> </span
              ></a>
            </div>
          </div>
        </div>
        <div class="stat-card-content-card stat-card-content-card-2">
          <div class="d-flex flex-column gap-3">
            <div class="stat-card-content-card-2-icon">
              <span style="width: 60px; height: 40px; display: inline-block"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  viewBox="0 0 48 48"
                  fill="none"
                >
                  <!-- Fond arrondi -->
                  <rect x="4" y="4" width="40" height="40" rx="10" fill="#D1FAE5" />

                  <!-- Toit -->
                  <path
                    d="M16 23L24 16L32 23"
                    stroke="#059669"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                  />

                  <!-- Corps de la maison -->
                  <path
                    d="M18 22V32H30V22"
                    stroke="#059669"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                  />

                  <!-- Porte -->
                  <rect
                    x="22"
                    y="26"
                    width="4"
                    height="6"
                    stroke="#059669"
                    stroke-width="2"
                    fill="none"
                  />
                </svg>
              </span>
            </div>
            <div class="stat-card-content-card-2-body">
              <span class="fs-1" style="font-weight: 900; font-size: 1.9rem">{{
                listeClasse?.data?.length
              }}</span
              ><br />
              <span class="stat-card-content-card-1-body-text">CLASSES</span>
            </div>
            <div class="stat-card-content-card-1-footer">Créer cette année</div>
          </div>
          <div class="position-relative">
            <span class="top-0 sc-trend">+2 ce mois</span>
            <div class="position-absolute bottom-0 end-0">
              <a href="/ecole/classe" style="color: #059669"
                >Gérer
                <span>
                  <svg
                    style="width: 20px; height: 15px; display: inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#059669"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg> </span
              ></a>
            </div>
          </div>
        </div>
        <div class="stat-card-content-card stat-card-content-card-3">
          <div class="d-flex flex-column gap-3">
            <div class="stat-card-content-card-3-icon">
              <span style="width: 60px; height: 40px; display: inline-block"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  viewBox="0 0 48 48"
                  fill="none"
                >
                  <!-- Fond arrondi (plus transparent) -->
                  <rect
                    x="4"
                    y="4"
                    width="40"
                    height="40"
                    rx="10"
                    fill="#7C3AED"
                    fill-opacity="0.15"
                  />

                  <!-- Tête -->
                  <circle cx="24" cy="20" r="4" stroke="#7C3AED" stroke-width="2.5" fill="none" />

                  <!-- Épaules -->
                  <path
                    d="M16 32c0-4 3.5-6 8-6s8 2 8 6"
                    stroke="#7C3AED"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </div>
            <div class="stat-card-content-card-3-body">
              <span class="fs-1" style="font-weight: 900; font-size: 1.9rem">{{
                matieres?.data?.length
              }}</span
              ><br />
              <span class="stat-card-content-card-1-body-text">Matieres</span>
            </div>
            <div class="stat-card-content-card-1-footer">Créer cette année</div>
          </div>
          <div class="position-relative">
            <span
              class="top-0 sc-trend"
              style="color: #7c3aed; background-color: rgba(124, 58, 237, 0.09)"
              >+2 ce mois</span
            >
            <div class="position-absolute bottom-0 end-0">
              <a href="/ecole/matiere" style="color: #7c3aed"
                >Gérer
                <span>
                  <svg
                    style="width: 20px; height: 15px; display: inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7C3AED"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg> </span
              ></a>
            </div>
          </div>
        </div>
        <div class="stat-card-content-card stat-card-content-card-4">
          <div class="d-flex flex-column gap-3">
            <div class="stat-card-content-card-1-icon">
              <span style="width: 60px; height: 40px; display: inline-block"
                ><svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                  <!-- Background -->
                  <rect width="60" height="60" rx="16" fill="#F3EDE7" />

                  <!-- Book -->
                  <rect
                    x="20"
                    y="15"
                    width="20"
                    height="26"
                    rx="3"
                    stroke="#F97316"
                    stroke-width="3"
                    fill="none"
                  />

                  <line x1="23" y1="35" x2="37" y2="35" stroke="#F97316" stroke-width="3" />
                </svg>
              </span>
            </div>
            <div class="stat-card-content-card-4-body">
              <span class="fs-1" style="font-weight: 900; font-size: 1.9rem">{{
                eleves?.length
              }}</span
              ><br />
              <span class="stat-card-content-card-1-body-text">Eleves</span>
            </div>
            <div class="stat-card-content-card-1-footer">Créer cette année</div>
          </div>
          <div class="position-relative">
            <span
              class="top-0 sc-trend"
              style="color: #d97706; background-color: rgba(124, 58, 237, 0.09)"
              >+2 ce mois</span
            >
            <div class="position-absolute bottom-0 end-0">
              <a href="/ecole/eleve" style="color: #d97706"
                >Gérer
                <span>
                  <svg
                    style="width: 20px; height: 15px; display: inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#D97706"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg> </span
              ></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="panels-grid">
    <div class="container">
      <div class="panels-grid-content">
        <div class="panels-card panels-grid-content-enseignant">
          <div class="en-tete-card">
            <div class="en-tete-card-icon">
              <span style="width: 40px; height: 20px; display: inline-block; margin-right: 5px"
                ><svg
                  width="100%"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  fill="none"
                >
                  <!-- Fond arrondi -->
                  <rect x="4" y="4" width="40" height="40" rx="10" fill="#E5E7EB" />

                  <!-- Personne principale -->
                  <circle cx="20" cy="20" r="4" stroke="#2563EB" stroke-width="2" fill="none" />
                  <path
                    d="M12 32c0-4 3.5-6 8-6s8 2 8 6"
                    stroke="#2563EB"
                    stroke-width="2"
                    stroke-linecap="round"
                    fill="none"
                  />
                  <!-- Personne secondaire -->
                  <circle cx="30" cy="22" r="3" stroke="#2563EB" stroke-width="2" fill="none" />
                  <path
                    d="M24 32c0-3 3-5 6-5s6 2 6 5"
                    stroke="#2563EB"
                    stroke-width="2"
                    stroke-linecap="round"
                    fill="none"
                  /></svg
              ></span>
              <span class="en-tete-card-title">Enseignant récents</span>
            </div>
            <div><a href="/ecole/enseignant" class="en-tete-card-lien">Gérer</a></div>
          </div>

          <div
            class="card-body"
            v-for="enseignant in listeEnseignants?.data"
            v-if="listeEnseignants?.data?.length > 0"
          >
            <div class="card-body-left">
              <div class="td_avatar">{{ enseignant?.name?.charAt(0) }}</div>
              <div class="name_sub">
                <div class="td_name" style="font-family: 'Plus Jakarta Sans', 'Nunito', sans-serif; text-transform: uppercase;">
                  {{ enseignant?.name + ' ' + enseignant?.prenom }}
                </div>
                <div class="td_sub">{{ enseignant?.numero ?? 'Pas de numero repectorier' }}</div>
              </div>
            </div>
            <span style="font-size: 0.8rem; font-family: monospace; color: #94a3b8">{{
              enseignant?.date_creation
            }}</span>
          </div>
          <div v-else>Aucun enseignant pour l'instant</div>
        </div>

        <div class="panels-card panels-grid-content-eleve">
          <div class="en-tete-card">
            <div class="en-tete-card-icon">
              <span style="width: 40px; height: 20px; display: inline-block; margin-right: 5px"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  viewBox="0 0 48 48"
                  fill="none"
                >
                  <!-- Fond arrondi (plus transparent) -->
                  <rect
                    x="4"
                    y="4"
                    width="40"
                    height="40"
                    rx="10"
                    fill="#7C3AED"
                    fill-opacity="0.15"
                  />

                  <!-- Tête -->
                  <circle cx="24" cy="20" r="4" stroke="#7C3AED" stroke-width="2.5" fill="none" />

                  <!-- Épaules -->
                  <path
                    d="M16 32c0-4 3.5-6 8-6s8 2 8 6"
                    stroke="#7C3AED"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    fill="none"
                  />
                </svg>
              </span>
              <span class="en-tete-card-title">Profils des Eleves</span>
            </div>
          </div>
          <div class="card-body-eleve" style="display: flex; justify-content: space-between">
            <div class="card-body-left">
              <div class="point-1"></div>
              <div class="name_sub">
                <div class="td_name">Standards</div>
              </div>
            </div>
            <span style="font-size: 1rem; font-family: monospace; font-weight: 900">7</span>
          </div>
          <span><progress value="5" max="15" style="width: 100%"></progress></span>
          <div class="card-body-eleve" style="display: flex; justify-content: space-between">
            <div class="card-body-left">
              <div class="point-2"></div>
              <div class="name_sub">
                <div class="td_name">Standards</div>
              </div>
            </div>
            <span style="font-size: 1rem; font-family: monospace; font-weight: 900">7</span>
          </div>
          <span
            ><progress
              value="5"
              max="15"
              style="width: 100%; background-color: red; height: 7px"
            ></progress
          ></span>
        </div>

        <div class="panels-card panels-grid-content-classe">
          <div class="en-tete-card">
            <div class="en-tete-card-icon">
              <span style="width: 40px; height: 20px; display: inline-block; margin-right: 5px"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  viewBox="0 0 48 48"
                  fill="none"
                >
                  <!-- Fond arrondi -->
                  <rect x="4" y="4" width="40" height="40" rx="10" fill="#D1FAE5" />
                  <!-- Toit -->
                  <path
                    d="M16 23L24 16L32 23"
                    stroke="#059669"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                  />
                  <!-- Corps de la maison -->
                  <path
                    d="M18 22V32H30V22"
                    stroke="#059669"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                  />
                  <!-- Porte -->
                  <rect
                    x="22"
                    y="26"
                    width="4"
                    height="6"
                    stroke="#059669"
                    stroke-width="2"
                    fill="none"
                  /></svg
              ></span>
              <span class="en-tete-card-title">Vue des Classes</span>
            </div>
            <div><a href="/ecole/classe" class="en-tete-card-lien">Voir tous</a></div>
          </div>
          <div
            class="card-body"
            v-if="listeClasse?.data.length > 0"
            v-for="classe in listeClasse.data"
          >
            <div class="card-body-left">
              <div class="td_avatar">{{ classe?.name?.charAt(0) + classe.name?.charAt(1) }}</div>
              <div class="name_sub">
                <div class="td_name" style="text-transform: uppercase;">{{ classe?.name }}</div>
              </div>
            </div>
            <div style="display: flex; flex-direction: column">
              <div style="text-align: center; font-weight: 900; font-size: 1rem; color: #0f172a">
                {{ classe?.eleves?.length }}
              </div>
              <span style="font-size: 0.8rem; font-family: monospace; color: #94a3b8">Elèves</span>
            </div>
          </div>
          <div v-else>
            <i style="text-align: center; padding: 50px">Veillez ajouter une classe</i>
          </div>
        </div>
        <div class="panels-card panels-grid-content-action">
          <div class="en-tete-card">
            <div class="en-tete-card-icon">
              <span style="width: 40px; height: 20px; display: inline-block; margin-right: 5px"
                ><svg width="100%" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                  <!-- Background -->
                  <rect width="60" height="60" rx="16" fill="#F3EDE7" />

                  <!-- Lightning -->
                  <path
                    d="M33 14L23 32H31L29 44L41 26H33L33 14Z"
                    stroke="#F97316"
                    stroke-width="3"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    fill="none"
                  /></svg
              ></span>
              <span class="en-tete-card-title">Action rapide</span>
            </div>
          </div>
          <div
            class="card-body-action"
            style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px"
          >
            <div>
              <a href="/ecole/enseignant" class="card-body-action card-body-action-1">
                <div>
                  <div class="card-body-action-icon">
                    <svg
                      data-v-863a7725=""
                      width="100%"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                      role="img"
                    >
                      <!-- Dashboard --><!-- User plus -->
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                  </div>
                </div>
                <div>Ajouter un enseignant</div>
              </a>
            </div>
            <div>
              <a href="/ecole/classe" class="card-body-action card-body-action-2">
                <div>
                  <div class="card-body-action-icon card-body-action-icon-2">
                    <svg
                      data-v-863a7725=""
                      width="100%"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                      role="img"
                    >
                      <!-- Dashboard --><!-- User plus -->
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                  </div>
                </div>
                <div>Ajouter une classe</div>
              </a>
            </div>
            <div>
              <a href="/ecole/matiere" class="card-body-action card-body-action-3">
                <div>
                  <div class="card-body-action-icon card-body-action-icon-3">
                    <svg
                      data-v-863a7725=""
                      width="100%"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                      role="img"
                    >
                      <!-- Dashboard --><!-- User plus -->
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                  </div>
                </div>
                <div>Ajouter une matière</div>
              </a>
            </div>
            <div>
              <a href="/ecole/eleve" class="card-body-action card-body-action-4">
                <div>
                  <div class="card-body-action-icon card-body-action-icon-4">
                    <svg
                      data-v-863a7725=""
                      width="100%"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                      role="img"
                    >
                      <!-- Dashboard --><!-- User plus -->
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                  </div>
                </div>
                <div>Ajouter un élève</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<style scoped>
/*Section tableau de bord */

* {
  font-family: 'Plus Jakarta Sans', 'Nunito', sans-serif;
}
.tableau-bord-content {
  margin: 30px 0;
}

.tableau-bord-content-left {
  display: flex;
  padding: 32px 40px;
  justify-content: space-between;
  background: linear-gradient(140deg, #1a2b5e, #2e4080);
  color: white;
  border-radius: 38px;
  align-items: center;
}

/* Section stat card */

.stat-card-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 50px;
  margin: 30px 0;
}
.stat-card-content-card {
  position: relative;
  display: flex;
  justify-content: space-between;
  border-left: 5px solid rgb(89, 89, 250);
  border-radius: 1rem;
  padding: 20px;
  border-bottom: 5px solid #d4e2ff;
  transition: ease-in-out 0.1s;
  background-color: white;
}
.stat-card-content-card-1:hover {
  border-left: 10px solid rgb(89, 89, 250);
  border-bottom: 5px solid #d4e2ff;
}
.stat-card-content-card-1:hover::after {
  content: '';
  position: absolute;
  right: -20px;
  top: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.07);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(10px);
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  opacity: 0.6;
  pointer-events: none;
}

.stat-card-content-card-1-body-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
.stat-card-content-card-1-footer {
  color: #94a3b8;
  font-size: 0.79rem;
  font-weight: 500;
}
.sc-trend {
  font-size: 0.8rem;
  font-weight: 500;
  color: #059669;
  background: rgba(5, 150, 105, 0.09);
  border-radius: 6px;
  padding: 5px 10px;
}

.stat-card-content-card-2 {
  border-left: 5px solid #059669;
}
.stat-card-content-card-2:hover {
  border-left: 10px solid #059669;
  border-bottom: 5px solid #d4e2ff;
}
.stat-card-content-card-2:hover::after {
  content: '';
  position: absolute;
  right: -20px;
  top: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #4ce2b3;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(10px);
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  opacity: 0.1;
  pointer-events: none;
}
.stat-card-content-card-3 {
  border-left: 5px solid #7c3aed;
}
.stat-card-content-card-3:hover {
  border-left: 10px solid #7c3aed;
  border-bottom: 5px solid #d4e2ff;
}
.stat-card-content-card-3:hover::after {
  content: '';
  position: absolute;
  right: -20px;
  top: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #7c3aed;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(10px);
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  opacity: 0.1;
  pointer-events: none;
}
.stat-card-content-card-4:hover::after {
  content: '';
  position: absolute;
  right: -20px;
  top: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #d97706;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(10px);
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  opacity: 0.1;
  pointer-events: none;
}
.stat-card-content-card-4 {
  border-left: 5px solid #d97706;
}
.stat-card-content-card-4:hover {
  border-left: 10px solid #d97706;
  border-bottom: 5px solid #d4e2ff;
}
.stat-card-content-card-4:hover::before {
  content: '';
  position: absolute;
  left: 0px;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: #d97706;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(10px);
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  pointer-events: none;
}
/* Panels grid */

.panels-grid-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 50px;
}
.panels-card {
  background-color: #fff;
  border-radius: 1.8rem;
  min-height: 170px;
  padding: 20px 20px;
}
.en-tete-card {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  align-items: center;
}
.en-tete-card-title {
  font-size: 1.2rem;
  font-family: 'Baloo 2', cursive;
  color: #1a2b5e;
  font-weight: 900;
}
.en-tete-card-lien {
  color: #4bbfed;
  font-size: 0.9rem;
  font-weight: 800;
}
.en-tete-card-lien:hover {
  text-decoration: underline;
}
.card-body {
  display: flex;
  justify-content: space-between;
  margin: 15px 0;
  padding: 10px;
}
.card-body:hover {
  background-color: #f0f0f0;
  border-radius: 10px;
}
.card-body-left {
  display: flex;
  gap: 15px;
  align-items: center;
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
.point-1 {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4bbfed, #9b7bff);
}

.point-2 {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background: green;
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

/*Card action rapide */

.card-body-action {
  display: flex;
  gap: 10px;
  align-items: center;
  border-radius: 12px;
  background: #fafcff;
  font-family: 'Plus Jakarta Sans', 'Nunito', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  text-align: left;
}
.card-body-action-1 {
  padding: 11px 13px;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1.5px solid rgba(15, 23, 42, 0.08);
}
.card-body-action-1:hover {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.06);
  transform: translateY(-5px);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 4px 16px rgba(0, 0, 0, 0.05);
}
.card-body-action-1:hover .card-body-action-icon {
  transform: rotate(20deg);
}
.card-body-action-2 {
  padding: 11px 13px;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1.5px solid rgba(15, 23, 42, 0.08);
}
.card-body-action-2:hover {
  border-color: #059669;
  background: rgba(5, 150, 105, 0.06);
  transform: translateY(-5px);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 4px 16px rgba(0, 0, 0, 0.05);
}
.card-body-action-2:hover .card-body-action-icon {
  transform: rotate(20deg);
}
.card-body-action-icon {
  width: 37px;
  height: 37px;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s;
  background: #2563eb;
  padding: 10px;
  transition: transform 0.3s ease;
}
.card-body-action-icon-2 {
  transition: transform 0.2s;
  background: #059669;
  padding: 10px;
  transition: transform 0.3s ease;
}

.card-body-action-3 {
  padding: 11px 13px;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1.5px solid rgba(15, 23, 42, 0.08);
}
.card-body-action-3:hover {
  border-color: #6d28d9;
  background: rgba(109, 40, 217, 0.06);
  transform: translateY(-5px);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 4px 16px rgba(0, 0, 0, 0.05);
}
.card-body-action-3:hover .card-body-action-icon {
  transform: rotate(20deg);
}
.card-body-action-icon-3 {
  transition: transform 0.2s;
  background: #6d28d9;
  padding: 10px;
  transition: transform 0.3s ease;
}

.card-body-action-4 {
  padding: 11px 13px;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1.5px solid rgba(15, 23, 42, 0.08);
}
.card-body-action-4:hover {
  border-color: #d97706;
  background: rgba(217, 119, 6, 0.06);
  transform: translateY(-5px);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 4px 16px rgba(0, 0, 0, 0.05);
}
.card-body-action-4:hover .card-body-action-icon {
  transform: rotate(20deg);
}
.card-body-action-icon-4 {
  transition: transform 0.2s;
  background: #d97706;
  padding: 10px;
  transition: transform 0.3s ease;
}
</style>
