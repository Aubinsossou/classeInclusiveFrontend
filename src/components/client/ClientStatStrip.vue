<script setup>
import { onMounted } from 'vue'
import { useClientStats, fmtNum, fmtPct, resolve } from '@/composables/useClientStats'

const props = defineProps({
  title: { type: String, default: '' },
  endpoint: { type: String, required: true },
  // [{ label, path, pctPath? }] — path lu dans data de la réponse
  metrics: { type: Array, default: () => [] },
})

const { stats, loading, error, load } = useClientStats(props.endpoint)

function valueOf(path) {
  return fmtNum(resolve(stats.value, path))
}
function pctOf(path) {
  return path ? fmtPct(resolve(stats.value, path)) : ''
}

onMounted(load)
</script>

<template>
  <div class="pro-card strip">
    <div class="strip-head">
      <h3 v-if="title" class="strip-title">{{ title }}</h3>
      <button v-if="error && !loading" class="pro-btn pro-btn-ghost pro-btn-sm" type="button" @click="load">
        Réessayer
      </button>
    </div>
    <p v-if="loading" class="strip-state">Chargement des statistiques…</p>
    <p v-else-if="error" class="strip-state strip-err" role="alert">{{ error }}</p>
    <div v-else class="strip-grid">
      <div v-for="m in metrics" :key="m.label" class="strip-item">
        <span class="strip-label">{{ m.label }}</span>
        <span class="strip-value">{{ valueOf(m.path) }}</span>
        <span v-if="m.pctPath" class="strip-pct">{{ pctOf(m.pctPath) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.strip{padding:16px 18px;margin-bottom:14px}
.strip-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.strip-title{font-size:.92rem;font-weight:800;color:#0f172a}
.strip-state{font-size:.82rem;color:#94a3b8;font-weight:600}
.strip-err{color:#dc2626;background:rgba(220,38,38,.07);border:1px solid rgba(220,38,38,.18);border-radius:10px;padding:8px 12px}
.strip-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(130px,100%),1fr));gap:10px}
.strip-item{display:flex;flex-direction:column;gap:2px;background:#f8fafc;border:1px solid #eef2f7;border-radius:12px;padding:10px 12px}
.strip-label{font-size:.7rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.03em}
.strip-value{font-size:1.25rem;font-weight:900;color:#0f172a;line-height:1.1}
.strip-pct{font-size:.75rem;font-weight:700;color:#2563eb}
</style>
