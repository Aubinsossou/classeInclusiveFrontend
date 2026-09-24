<script setup>
import { ref } from 'vue'
import LoadingEcole from '@/components/admin/LoadingEcole.vue'
import { useClientList, useFiltered } from '@/composables/useClientList'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  endpoint: { type: String, required: true },
  columns: { type: Array, required: true },
  searchKeys: { type: Array, default: () => [] },
  searchPlaceholder: { type: String, default: 'Rechercher…' },
})

const emit = defineEmits(['loaded'])
const base = useClientList(props.endpoint)
const { items, loading, error, search, sortKey, sortDir, page, perPage, load, toggleSort } = base
const { filtered, totalPages, paged } = useFiltered(base, props.searchKeys.length ? props.searchKeys : props.columns.flatMap((c) => c.keys || [c.key]))

function prettyObject(v) {
  if (Array.isArray(v)) return v.length ? `${v.length} élément(s)` : '—'
  if (v && typeof v === 'object') return v.name || v.title || v.nom || v.label || v.email || (v.id ?? '—')
  return v
}
function get(row, path) {
  if (!path) return ''
  return String(path).split('.').reduce((o, k) => (o == null ? o : o[k]), row) ?? ''
}
function countOf(row, path) {
  const v = get(row, path)
  return Array.isArray(v) ? v.length : 0
}
function cell(row, col) {
  if (col.countOf) return `${countOf(row, col.countOf)}`
  if (col.boolOf) { const v = get(row, col.boolOf); return v ? (col.boolTrue || 'Oui') : (col.boolFalse || 'Non') }
  const keys = col.keys || (col.key ? [col.key] : [])
  for (const k of keys) { const v = get(row, k); if (v !== '' && v !== null && v !== undefined) return prettyObject(v) }
  return '—'
}
function badgeClass(v) {
  const s = String(v); const m = ['blue', 'green', 'violet', 'amber', 'red']
  let h = 0; for (const c of s) h += c.charCodeAt(0)
  return 'pro-badge-' + m[h % m.length]
}
async function init() { await load(); emit('loaded', items.value) }
init()
function retry() { page.value = 1; init() }
</script>
<template>
  <div class="container">
    <div class="pro-page-header">
      <div><h1 class="pro-page-title">{{ title }}</h1><p class="pro-page-sub" v-if="subtitle">{{ subtitle }}</p></div>
      <span class="pro-badge pro-badge-gray" v-if="!loading && !error">{{ filtered.length }} résultat(s)</span>
    </div>
    <slot name="stats" :items="items" :filtered="filtered" />
    <LoadingEcole :visible="loading" message="Chargement" />
    <div v-if="error && !loading" class="pro-card pro-err">
      <p>{{ error }}</p>
      <button class="pro-btn pro-btn-primary pro-btn-sm" type="button" @click="retry">Réessayer</button>
    </div>
    <template v-if="!loading && !error">
      <div class="pro-toolbar">
        <div class="pro-toolbar-left"><input v-model="search" class="pro-search" :placeholder="searchPlaceholder" @input="page = 1" /></div>
        <div class="pro-toolbar-right">
          <select v-model="perPage" class="pro-select" @change="page = 1">
            <option :value="8">8 / page</option><option :value="12">12 / page</option><option :value="24">24 / page</option>
          </select>
        </div>
      </div>
      <div v-if="!filtered.length" class="pro-card pro-empty"><p>Aucune donnée disponible.</p></div>
      <div v-else class="pro-table-wrap"><table class="pro-table">
        <thead><tr>
          <th v-for="c in columns" :key="c.label" @click="c.sortable === false ? null : toggleSort((c.keys || [c.key])[0])" :style="c.sortable === false ? '' : 'cursor:pointer'">
            {{ c.label }}<span v-if="sortKey === (c.keys || [c.key])[0]">{{ sortDir === 1 ? ' ▲' : ' ▼' }}</span>
          </th>
        </tr></thead>
        <tbody><tr v-for="(r, i) in paged" :key="r.id ?? i">
          <td v-for="c in columns" :key="c.label">
            <RouterLink v-if="c.link" :to="c.link(r)" class="pd-link">{{ c.linkLabel || cell(r, c) }}</RouterLink>
            <span v-else-if="c.badge" class="pro-badge" :class="badgeClass(cell(r, c))">{{ cell(r, c) }}</span>
            <span v-else :class="c.muted ? 'td-muted' : (c.strong ? 'td-name' : '')">{{ cell(r, c) }}</span>
          </td>
        </tr></tbody>
      </table></div>
      <div v-if="totalPages > 1" class="pg">
        <button class="pro-btn pro-btn-ghost pro-btn-sm" :disabled="page === 1" @click="page--">‹ Précédent</button>
        <span class="pg-info">Page {{ page }} / {{ totalPages }}</span>
        <button class="pro-btn pro-btn-ghost pro-btn-sm" :disabled="page === totalPages" @click="page++">Suivant ›</button>
      </div>
    </template>
  </div>
</template>
<style scoped>
.container{max-width:1200px;margin:0 auto;padding:0 20px 40px}
.pro-page-header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:6px 0 18px;flex-wrap:wrap}
.pro-err{padding:22px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.pg{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:16px}
.pg-info{font-size:.82rem;color:var(--pro-muted);font-weight:700}
.td-name{font-weight:700}.td-muted{color:var(--pro-muted);font-size:.78rem}
.pd-link{color:#2563eb;font-weight:700;font-size:.8rem;text-decoration:none;white-space:nowrap}
.pd-link:hover{text-decoration:underline}
@media(max-width:640px){.pro-table th:nth-child(n+4),.pro-table td:nth-child(n+4){display:none}}
</style>
