<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiGet } from '@/helpers/axiosApi'
import LoadingEcole from '@/components/admin/LoadingEcole.vue'
import { stripSensitive } from '@/composables/useClientList'
const router = useRouter()
const loading = ref(true)
const error = ref('')
const client = ref({})
function fmt(v) { if (v === null || v === undefined || v === '') return '—'; if (Array.isArray(v)) return v.length ? v.map((x) => (x && typeof x === 'object' ? (x.name || x.title || x.id) : x)).join(', ') : '—'; if (typeof v === 'object') return v.name || v.title || v.email || String(v.id ?? '—'); return String(v) }
function rolesLabel() { const r = client.value?.roles; if (Array.isArray(r)) return r.length ? r.map((x) => (typeof x === 'object' ? x.name : x)).filter(Boolean).join(', ') : '—'; return '—' }
async function load() {
  loading.value = true; error.value = ''
  try {
    const r = await apiGet('client/getClient')
    const d = r.data?.data ?? r.data ?? {}
    client.value = stripSensitive(d)
  } catch (e) {
    if (e?.response?.status === 401) { localStorage.removeItem('access_token'); localStorage.removeItem('role'); router.push('/client/login'); return }
    error.value = e?.response?.data?.message || 'Impossible de charger le profil.'
  } finally { loading.value = false }
}
onMounted(load)
</script>
<template>
  <div class="container">
    <h1 class="pro-page-title">Mon profil</h1>
    <p class="pro-page-sub">Informations non sensibles du compte Client.</p>
    <LoadingEcole :visible="loading" message="Chargement" />
    <div v-if="error && !loading" class="pro-card pf-err"><p>{{ error }}</p><button class="pro-btn pro-btn-primary pro-btn-sm" @click="load">Réessayer</button></div>
    <div v-if="!loading && !error" class="pro-card pf-card">
      <div class="pf-ava">{{ String(client.name || client.email || 'C').slice(0, 1).toUpperCase() }}</div>
      <h2>{{ client.name || 'Client' }}</h2>
      <p class="pf-mail">{{ client.email || '' }}</p>
      <p v-if="client.numero" class="pf-mail">{{ client.numero }}</p>
      <p v-if="rolesLabel() !== '—'" class="pf-mail">Rôle : {{ rolesLabel() }}</p>
      <dl class="pf-list">
        <div class="pf-row"><dt>Identifiant</dt><dd>{{ client.id ?? '—' }}</dd></div>
        <div class="pf-row"><dt>Nom</dt><dd>{{ client.name || '—' }}</dd></div>
        <div class="pf-row"><dt>E-mail</dt><dd>{{ client.email || '—' }}</dd></div>
        <div class="pf-row"><dt>Téléphone</dt><dd>{{ client.numero || '—' }}</dd></div>
        <div class="pf-row"><dt>Rôles</dt><dd>{{ rolesLabel() }}</dd></div>
      </dl>
    </div>
  </div>
</template>
<style scoped>
.container{max-width:800px;margin:0 auto;padding:0 20px 40px}
.pro-page-title{font-size:1.55rem;font-weight:900;color:#0f172a}
.pro-page-sub{font-size:.82rem;color:#94a3b8;margin:4px 0 18px}
.pf-err{padding:22px;display:flex;justify-content:space-between;align-items:center;gap:12px}
.pf-card{padding:28px;text-align:center}
.pf-ava{width:64px;height:64px;border-radius:50%;background:#6d28d9;color:#fff;font-size:1.6rem;font-weight:900;display:flex;align-items:center;justify-content:center;margin:0 auto 12px}
.pf-card h2{font-size:1.25rem;font-weight:900;color:#0f172a}
.pf-mail{color:#94a3b8;font-size:.85rem;margin-bottom:18px}
.pf-list{text-align:left;display:flex;flex-direction:column}
.pf-row{display:flex;justify-content:space-between;gap:12px;padding:10px 4px;border-top:1px solid #f1f5f9;font-size:.85rem}
.pf-row dt{font-weight:700;color:#475569}.pf-row dd{color:#0f172a;word-break:break-word;text-align:right}

/* ══ Responsive ══ */
@media (max-width: 480px) {
  .container{padding:0 14px 32px}
  .pf-card{padding:20px 16px}
  .pf-row{flex-direction:column;gap:2px}
  .pf-row dd{text-align:left}
  .pf-err{flex-direction:column;align-items:stretch}
}
</style>
