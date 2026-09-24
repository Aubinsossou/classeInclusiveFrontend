import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiGet } from '@/helpers/axiosApi'
import { clientErrorMessage } from '@/composables/useClientStats'

const SENSITIVE = ['password', 'password_hash', 'access_token', 'refresh_token', 'token', 'secret', 'api_token']

export function stripSensitive(obj) {
  if (Array.isArray(obj)) return obj.map(stripSensitive)
  if (obj && typeof obj === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      if (SENSITIVE.includes(k.toLowerCase())) continue
      out[k] = stripSensitive(v)
    }
    return out
  }
  return obj
}

export function normList(payload) {
  const d = payload?.data ?? payload
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.data)) return d.data
  if (Array.isArray(d?.items)) return d.items
  if (d && typeof d === 'object') return [d]
  return []
}

export function resolvePath(row, path) {
  if (!path) return ''
  return String(path).split('.').reduce((o, k) => (o == null ? o : o[k]), row) ?? ''
}

export function val(row, keys) {
  for (const k of keys) {
    const v = resolvePath(row, k)
    if (v !== undefined && v !== null && v !== '') return v
  }
  return ''
}

export function useClientList(endpoint) {
  const router = useRouter()
  const items = ref([])
  const loading = ref(true)
  const error = ref('')
  const search = ref('')
  const sortKey = ref('')
  const sortDir = ref(1)
  const page = ref(1)
  const perPage = ref(12)

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const res = await apiGet(endpoint)
      items.value = stripSensitive(normList(res.data))
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('role')
        router.push('/client/login')
        return
      }
      error.value = clientErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  function toggleSort(k) {
    if (sortKey.value === k) sortDir.value *= -1
    else { sortKey.value = k; sortDir.value = 1 }
  }

  return { items, loading, error, search, sortKey, sortDir, page, perPage, load, toggleSort }
}

export function useFiltered(base, searchKeys) {
  const { items, search, sortKey, sortDir, page, perPage } = base
  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    let r = items.value
    if (q) r = r.filter((x) => searchKeys.some((k) => String(val(x, Array.isArray(k) ? k : [k])).toLowerCase().includes(q)))
    if (sortKey.value) {
      r = [...r].sort((a, b) => {
        const av = String(val(a, [sortKey.value])).toLowerCase()
        const bv = String(val(b, [sortKey.value])).toLowerCase()
        return av < bv ? -1 * sortDir.value : av > bv ? sortDir.value : 0
      })
    }
    return r
  })
  const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
  const paged = computed(() => filtered.value.slice((page.value - 1) * perPage.value, page.value * perPage.value))
  return { filtered, totalPages, paged }
}
