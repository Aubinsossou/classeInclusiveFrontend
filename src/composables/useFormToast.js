import { reactive } from 'vue'

/**
 * État partagé du « petit modal rouge » (toast) affiché lorsqu'un
 * formulaire comporte des champs requis non remplis.
 * State réactif de module : un seul toast à l'écran pour toute l'app.
 */
const state = reactive({
  visible: false,
  count: 0,
  labels: [],
  // Réels DOM des champs invalides (pour le scroll/focus au clic)
  targets: [],
  timer: null,
})

const AUTO_CLOSE_MS = 6000

export function useFormToast() {
  /** Affiche le toast avec la liste des champs manquants. */
  function show(fields = []) {
    if (state.timer) clearTimeout(state.timer)
    state.count = fields.length
    state.labels = fields.map((f) => f.label)
    state.targets = fields.map((f) => f.el)
    state.visible = true
    state.timer = setTimeout(hide, AUTO_CLOSE_MS)
  }

  /** Ferme le toast. */
  function hide() {
    if (state.timer) {
      clearTimeout(state.timer)
      state.timer = null
    }
    state.visible = false
  }

  /** Clic sur le toast → on amène l'utilisateur au premier champ manquant. */
  function goToFirstInvalid() {
    const el = state.targets.find((t) => t && document.contains(t))
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      try {
        el.focus({ preventScroll: true })
      } catch {
        /* input non focusable (cas extrême) */
      }
    }
    hide()
  }

  return { state, show, hide, goToFirstInvalid }
}
