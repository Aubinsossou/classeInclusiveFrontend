<!-- ═══════════════════════════════════════════════════════════
     BlindTopbar.vue — boutons grands pour enfants
═══════════════════════════════════════════════════════════ -->
<template>
  <header class="blind-topbar">

    <!-- GAUCHE : Logo + badge mode -->
    <div class="bt-left">
      <div class="bt-logo" aria-hidden="true">
        <svg viewBox="0 0 36 36" fill="none" width="28" height="28">
          <rect width="36" height="36" rx="10" fill="url(#btg)"/>
          <path d="M18 7L28 13V23L18 29L8 23V13L18 7Z" stroke="white" stroke-width="1.5" fill="none" opacity=".6"/>
          <circle cx="18" cy="18" r="5" fill="white" opacity=".9"/>
          <defs>
            <linearGradient id="btg" x1="0" y1="0" x2="36" y2="36">
              <stop offset="0%" stop-color="#4F46E5"/>
              <stop offset="100%" stop-color="#7C3AED"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span class="bt-brand">EduInclusif</span>
      <span :class="['bt-mode-badge', supervisorMode ? 'bt-mode-badge--sv' : 'bt-mode-badge--vocal']">
        {{ supervisorMode ? '👁 Surveillant' : '🎙 Vocal' }}
      </span>
    </div>

    <!-- CENTRE : Points + classe -->
    <div class="bt-center">
      <div class="bt-pts">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" class="bt-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span class="bt-pts-val">{{ points.totalPoints }}</span>
        <span class="bt-sep">·</span>
        <span class="bt-pts-level">{{ auth.user?.classe?.name || 'Ma classe' }}</span>
      </div>
    </div>

    <!-- DROITE : User | Surveillant | Thème | Déconnexion -->
    <div class="bt-right">

      <div class="bt-user" aria-label="Élève connecté">
        <div class="bt-avatar" aria-hidden="true">{{ initials }}</div>
        <span class="bt-username">{{ auth.user?.name }}</span>
      </div>

      <!-- Toggle mode surveillant -->
      <button
        :class="['bt-btn', 'bt-btn--supervisor', { active: supervisorMode }]"
        @click="$emit('toggle-supervisor')"
        type="button"
        :aria-pressed="supervisorMode"
        :aria-label="supervisorMode ? 'Désactiver mode surveillant' : 'Activer mode surveillant'"
      >
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="bt-btn-label">{{ supervisorMode ? 'Vocal' : 'Surveillant' }}</span>
      </button>

      <!-- Déconnexion — toujours en dernier -->
      <button class="bt-btn bt-btn--logout" @click="$emit('logout')" type="button" aria-label="Se déconnecter">
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="bt-btn-label">Quitter</span>
      </button>
    </div>

  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore }   from '@/stores/auth'
import { usePointsStore } from '@/stores/points'

defineProps({ supervisorMode: { type: Boolean, default: false } })
defineEmits(['toggle-supervisor', 'logout'])

const auth   = useAuthStore()
const points = usePointsStore()

const initials = computed(() =>
  (auth.user?.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
)
</script>

<style scoped>

.blind-topbar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 70px;
  background: #FDFBF8;
  border-bottom: 1px solid rgba(120,100,80,0.12);
  flex-shrink: 0;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.bt-left  { display:flex;align-items:center;gap:10px;flex-shrink:0; }
.bt-logo  { display:flex;align-items:center;flex-shrink:0; }
.bt-brand { font-family:'Georgia', 'Times New Roman', serif;font-size:.95rem;font-weight:bold;color:#2C2416; }

.bt-mode-badge {
  font-size:.72rem;font-weight:bold;letter-spacing:.04em;
  padding:4px 10px;border-radius:20px;white-space:nowrap;
}
.bt-mode-badge--vocal { background:rgba(79,70,229,.12);border:1px solid rgba(79,70,229,.28);color:#5C4FE0; }
.bt-mode-badge--sv    { background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.28);color:#F59E0B; }

.bt-center { flex:1;display:flex;justify-content:center; }
.bt-pts {
  display:flex;align-items:center;gap:7px;
  padding:6px 16px;
  background:#F0EDE7;border:1px solid rgba(120,100,80,0.12);border-radius:999px;
}
.bt-star      { color:#F59E0B;flex-shrink:0; }
.bt-pts-val   { font-size:.95rem;font-weight:bold;color:#2C2416; }
.bt-sep       { color:#9C8E80; }
.bt-pts-level { font-size:.82rem;font-weight:bold; }
.bt-pts-bar-wrap { width:52px; }
.bt-pts-bar  { height:4px;background:rgba(120,100,80,0.2);border-radius:999px;overflow:hidden; }
.bt-pts-fill { height:100%;border-radius:999px;transition:width .6s; }

.bt-right { display:flex;align-items:center;gap:10px;flex-shrink:0; }

.bt-user {
  display:flex;align-items:center;gap:8px;
  padding:5px 12px 5px 5px;
  background:#F0EDE7;border:1px solid rgba(120,100,80,0.12);border-radius:999px;
}
.bt-avatar {
  width:34px;height:34px;border-radius:50%;
  background:linear-gradient(135deg,#5C4FE0,#7C3AED);
  display:flex;align-items:center;justify-content:center;
  font-weight:bold;font-size:.78rem;color:#FFF;flex-shrink:0;
}
.bt-username { font-size:.84rem;font-weight:bold;color:#2C2416; }

/* ── Boutons grands adaptés aux enfants ── */
.bt-btn {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 20px;
  height: 48px;
  border-radius: 14px;
  font-size: .92rem;
  font-weight: bold;
  font-family: 'Verdana', 'Geneva', sans-serif;
  cursor: pointer;
  transition: all .15s;
  flex-shrink: 0;
  white-space: nowrap;
}
.bt-btn-label { font-size: .92rem; font-weight: bold; }

.bt-btn--supervisor {
  background: #F0EDE7;
  border: 2px solid rgba(120,100,80,0.12);
  color: #6B5E4E;
}
.bt-btn--supervisor:hover {
  border-color: rgba(245,158,11,.45);
  color: #F59E0B;
  transform: translateY(-1px);
}
.bt-btn--supervisor.active {
  background: rgba(245,158,11,.12);
  border-color: rgba(245,158,11,.45);
  color: #F59E0B;
  box-shadow: 0 4px 12px rgba(245,158,11,.2);
}


.bt-btn--logout {
  background: rgba(239,68,68,.08);
  border: 2px solid rgba(239,68,68,.25);
  color: #EF4444;
}
.bt-btn--logout:hover {
  background: rgba(239,68,68,.18);
  border-color: rgba(239,68,68,.55);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(239,68,68,.25);
}

@media(max-width:760px) {
  .bt-pts-bar-wrap { display:none; }
  .bt-username { display:none; }
  .bt-brand { display:none; }
  .bt-btn-label { display:none; }
  .bt-btn { padding: 11px 14px; }
}
</style>