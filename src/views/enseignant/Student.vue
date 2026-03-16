<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiGet } from '@/helpers/axiosApi'
import    LoadingView  from '@/components/admin/Loading.vue'
import codeToggle from '@/components/admin/codeToggle.vue'

const getEnseignantAuth = ref(null)
const handicaps = ref([])
const loading = ref(true)

const apiGetEnseignantConnect = async () => {
  loading.value = true
  const response = await apiGet('/enseignant/getEnseignant')
  getEnseignantAuth.value = response.data
  console.log('[getEnseignant]', getEnseignantAuth.value)
  loading.value = false
}

const apiGetHandicaps = async () => {
  const response = await apiGet('ecole/handicap/index')
  handicaps.value = response.data.data ?? []
  console.log('[handicaps]', handicaps.value)
}

onMounted(async () => {
  await apiGetEnseignantConnect()
  await apiGetHandicaps()
  loading.value = false
})

// ── Données dérivées ───────────────────────────────────────────────────────
const userAuth = computed(() => getEnseignantAuth.value?.data ?? null)
const eleves = computed(() => userAuth.value?.classe?.eleves ?? [])

// ── Filtres ────────────────────────────────────────────────────────────────
const search = ref('')
const filterHandicap = ref('')

const filteredEleves = computed(() =>
  eleves.value.filter((e) => {
    const fullName = `${e.prenom ?? ''} ${e.name ?? ''}`.toLowerCase()
    const matchSearch =
      !search.value ||
      fullName.includes(search.value.toLowerCase()) ||
      String(e.code).includes(search.value)
    const matchHandicap = !filterHandicap.value || e.handicap?.name === filterHandicap.value
    return matchSearch && matchHandicap
  }),
)

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR')
}

// is_connect peut être string "true"/"false" ou boolean
function isOnline(eleve) {
  return eleve.is_connect === true || eleve.is_connect === 'true'
}

// ── Mapping handicap → style ───────────────────────────────────────────────
const HANDICAP_MAP = {
  Visuel: { grad: 'linear-gradient(135deg,#6D28D9,#D97706)', badge: 'pro-badge-violet' },
  Auditif: { grad: 'linear-gradient(135deg,#059669,#2563EB)', badge: 'pro-badge-green' },
  Moteur: { grad: 'linear-gradient(135deg,#D97706,#DC2626)', badge: 'pro-badge-amber' },
}
const DEFAULT_MAP = { grad: 'linear-gradient(135deg,#2563EB,#6D28D9)', badge: 'pro-badge-blue' }

function handicapGrad(name) {
  return (HANDICAP_MAP[name] ?? DEFAULT_MAP).grad
}
function handicapBadge(name) {
  return (HANDICAP_MAP[name] ?? DEFAULT_MAP).badge
}
</script>

<template>
  <div class="students-root container">

   <LoadingView :visible="loading" :fullscreen="true" message="Chargement des élèves" offset-top="100px" />
    <div class="pro-page-header">
      <div>
        <h1 class="pro-page-title">Mes élèves</h1>
        <p class="pro-page-sub">
          {{ eleves.length }} élève(s) · classe {{ userAuth?.classe?.name ?? '…' }}
        </p>
      </div>
    </div>

    <!-- FILTRES -->
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
      <div class="search-wrap">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="search" class="search-input" placeholder="Rechercher par nom ou code…" />
      </div>
      <select v-model="filterHandicap" class="pro-select">
        <option value="">Tous les profils</option>
        <option v-for="h in handicaps" :key="h.id" :value="h.name">{{ h.name }}</option>
      </select>
    </div>

    <!-- TABLEAU -->
    <div class="pro-table-wrap">
      <table class="pro-table" aria-label="Liste des élèves">
        <thead>
          <tr>
            <th>Élève</th>
            <th>Code</th>
            <th>Profil</th>
            <th>Date de naissance</th>
            <th>Tél. parent</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="eleve in filteredEleves" :key="eleve.id">
            <!-- Nom + avatar -->
            <td>
              <div style="display: flex; align-items: center; gap: 10px">
                <div class="pro-avatar" :style="{ background: handicapGrad(eleve.handicap?.name) }">
                  <svg
                    v-if="eleve.handicap?.name === 'Visuel'"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg
                    v-else-if="eleve.handicap?.name === 'Auditif'"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 0 1-7 0" />
                    <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 0 1 0 4" />
                  </svg>
                  <svg
                    v-else-if="eleve.handicap?.name === 'Moteur'"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v5l3 3" />
                    <path d="M9 12H6" />
                    <path d="M9 17l-2 4" />
                    <path d="M15 17l2 4" />
                  </svg>
                  <svg
                    v-else
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div class="td-name">{{ eleve.prenom +' ' + eleve.name }}</div>
                  <div class="td-muted">ID #{{ eleve.id }}</div>
                </div>
              </div>
            </td>

            <!-- Code -->
            <td>
              <span class="code-pill">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <codeToggle :code="eleve?.code"  />
              </span>
            </td>

            <!-- Profil handicap -->
            <td>
              <span class="pro-badge" :class="handicapBadge(eleve.handicap?.name)">
                {{ eleve.handicap?.name ?? 'Standard' }}
              </span>
            </td>

            <!-- Date naissance -->
            <td class="td-muted">{{ formatDate(eleve.dateOfNaissance) }}</td>

            <!-- Téléphone parent -->
            <td class="td-muted">
              <div style="display: flex; align-items: center; gap: 6px">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.17h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"
                  />
                </svg>
                {{ eleve.numeroParent }}
              </div>
            </td>

            <!-- Statut connexion -->
            <td>
              <div
                class="pro-status"
                :class="isOnline(eleve) ? 'pro-status-online' : 'pro-status-inactive'"
              >
                <span class="pro-status-dot"></span>
                {{ isOnline(eleve) ? 'En ligne' : 'Hors ligne' }}
              </div>
            </td>
          </tr>

          <!-- Empty -->
          <tr v-if="filteredEleves.length === 0">
            <td
              colspan="6"
              style="text-align: center; padding: 40px; color: var(--pro-muted); font-style: italic"
            >
              Aucun élève trouvé.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state global -->
    <div v-if="eleves.length === 0 && !loading" class="pro-empty pro-card" style="padding: 48px">
      <svg
        class="pro-empty-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <p>Aucun élève dans votre classe pour le moment.</p>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.students-root {
  --pro-blue: #2563eb;
  --pro-blue-soft: rgba(37, 99, 235, 0.09);
  --pro-green: #059669;
  --pro-green-soft: rgba(5, 150, 105, 0.09);
  --pro-violet: #6d28d9;
  --pro-violet-soft: rgba(109, 40, 217, 0.09);
  --pro-amber: #d97706;
  --pro-amber-soft: rgba(217, 119, 6, 0.09);
  --pro-ink: #0f172a;
  --pro-muted: #94a3b8;
  --pro-border: rgba(15, 23, 42, 0.08);
  --pro-card: #ffffff;
  --pro-r-lg: 16px;
  --pro-r-md: 12px;
  --pro-shadow-md: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.05);
  --pro-font: 'Plus Jakarta Sans', system-ui, sans-serif;

  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: var(--pro-font);
}

/* Header */
.pro-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.pro-page-title {
  font-size: 1.55rem;
  font-weight: 900;
  color: var(--pro-ink);
  letter-spacing: -0.025em;
  margin: 0;
}
.pro-page-sub {
  font-size: 0.82rem;
  color: var(--pro-muted);
  margin-top: 4px;
  margin-bottom: 0;
  font-weight: 500;
}

/* Search */
.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  border: 1.5px solid var(--pro-border);
  border-radius: var(--pro-r-md);
  background: var(--pro-card);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  color: var(--pro-muted);
}
.search-wrap:focus-within {
  border-color: var(--pro-blue);
}
.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--pro-font);
  font-size: 0.83rem;
  color: var(--pro-ink);
  width: 220px;
}

/* Select */
.pro-select {
  padding: 9px 32px 9px 13px;
  border: 1.5px solid var(--pro-border);
  border-radius: var(--pro-r-md);
  font-family: var(--pro-font);
  font-size: 0.83rem;
  color: var(--pro-ink);
  background: var(--pro-card);
  cursor: pointer;
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}
.pro-select:focus {
  border-color: var(--pro-blue);
}

/* Avatar */
.pro-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Badge */
.pro-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  padding: 3px 9px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}
.pro-badge-blue {
  background: var(--pro-blue-soft);
  color: var(--pro-blue);
}
.pro-badge-green {
  background: var(--pro-green-soft);
  color: var(--pro-green);
}
.pro-badge-violet {
  background: var(--pro-violet-soft);
  color: var(--pro-violet);
}
.pro-badge-amber {
  background: var(--pro-amber-soft);
  color: var(--pro-amber);
}

/* Code pill */
.code-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  padding: 3px 9px;
  font-size: 0.78rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.05em;
}

/* Status */
.pro-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  font-weight: 600;
}
.pro-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.pro-status-online {
  color: var(--pro-green);
}
.pro-status-online .pro-status-dot {
  background: var(--pro-green);
  animation: pro-pulse 2s ease infinite;
}
.pro-status-inactive {
  color: var(--pro-muted);
}
.pro-status-inactive .pro-status-dot {
  background: var(--pro-muted);
}
@keyframes pro-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(5, 150, 105, 0);
  }
}

/* Table */
.pro-table-wrap {
  background: var(--pro-card);
  border-radius: var(--pro-r-lg);
  border: 1px solid var(--pro-border);
  box-shadow: var(--pro-shadow-md);
  overflow: hidden;
}
.pro-table {
  width: 100%;
  border-collapse: collapse;
}
.pro-table th {
  padding: 11px 16px;
  text-align: left;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--pro-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: #f8fafc;
  border-bottom: 1px solid var(--pro-border);
  white-space: nowrap;
}
.pro-table td {
  padding: 13px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.85rem;
  color: var(--pro-ink);
  vertical-align: middle;
}
.pro-table tr:last-child td {
  border-bottom: none;
}
.pro-table tr:hover td {
  background: #fafcff;
}
.td-name {
  font-weight: 700;
  text-transform: uppercase;
}
.td-muted {
  color: var(--pro-muted);
  font-size: 0.78rem;
}

/* Empty */
.pro-card {
  background: var(--pro-card);
  border-radius: var(--pro-r-lg);
  border: 1px solid var(--pro-border);
  box-shadow: var(--pro-shadow-md);
}
.pro-empty {
  text-align: center;
  padding: 48px 24px;
  color: var(--pro-muted);
}
.pro-empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 14px;
  opacity: 0.25;
  display: block;
}
</style>
