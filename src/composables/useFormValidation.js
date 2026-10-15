import { useFormToast } from './useFormToast'

const INVALID_CLASS = 'fe-invalid'
const MSG_CLASS = 'fe-msg'

/**
 * Libellé « humain » d'un champ, déduit du <label> associé
 * (for/id, label parent, ou à défaut placeholder/name).
 */
function labelFor(el) {
  let label = null
  if (el.id) {
    // CSS.escape n'existe pas dans tous les environnements (jsdom ancien)
    const safeId =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(el.id)
        : el.id.replace(/"/g, '\\"')
    label = document.querySelector(`label[for="${safeId}"]`)
  }
  if (!label) label = el.closest('label')
  if (label) {
    const text = (label.textContent || '').replace(/\*/g, '').trim()
    if (text) return text
  }
  return (el.getAttribute('placeholder') || el.getAttribute('name') || 'Champ').trim()
}

/** Un champ est-il « vide » ? */
function isEmpty(el) {
  if (el.type === 'checkbox') return !el.checked
  return !String(el.value ?? '').trim()
}

/** Injecte / supprime le petit message d'erreur sous un champ. */
function setFieldError(el, on) {
  if (on) {
    el.classList.add(INVALID_CLASS)
    el.setAttribute('aria-invalid', 'true')
    // PasswordInput : la racine est un wrapper, on cible l'input réel
    const target = el.tagName === 'DIV' ? el.querySelector('input, select, textarea') : el
    if (target) {
      target.classList.add(INVALID_CLASS)
      target.setAttribute('aria-invalid', 'true')
    }
    let msg = el.parentElement && el.parentElement.querySelector(`:scope > .${MSG_CLASS}`)
    if (!msg) {
      msg = document.createElement('span')
      msg.className = MSG_CLASS
      msg.textContent = 'Ce champ est requis.'
      ;(el.parentElement || el).appendChild(msg)
    }
  } else {
    el.classList.remove(INVALID_CLASS)
    el.removeAttribute('aria-invalid')
    const target = el.tagName === 'DIV' ? el.querySelector('input, select, textarea') : el
    if (target) {
      target.classList.remove(INVALID_CLASS)
      target.removeAttribute('aria-invalid')
    }
    const scope = el.parentElement || el
    const msg = scope.querySelector(`:scope > .${MSG_CLASS}`)
    if (msg) msg.remove()
  }
}

/**
 * Validation générique des champs requis d'un formulaire.
 *
 * - `validate(formEl)` : marque chaque champ requis vide (bordure rouge,
 *   message inline, aria-invalid) et affiche le toast rouge non bloquant
 *   listant les champs manquants. Retourne true si le formulaire est valide.
 * - Les erreurs s'effacent automatiquement dès que l'utilisateur saisit
 *   quelque chose (écoute input/change en délégation sur le formulaire).
 */
export function useFormValidation() {
  const { show } = useFormToast()

  /** Champs requis présents dans le conteneur donné. */
  function requiredFields(formEl) {
    if (!formEl) return []
    return Array.from(
      formEl.querySelectorAll('input[required], select[required], textarea[required]'),
    ).filter((el) => !el.disabled && el.type !== 'hidden')
  }

  /**
   * Valide le formulaire. Retourne true si tout est rempli,
   * sinon affiche les erreurs + toast et retourne false.
   */
  function validate(formEl) {
    if (!formEl) return true
    const missing = []
    for (const el of requiredFields(formEl)) {
      if (isEmpty(el)) {
        setFieldError(el, true)
        missing.push({ el, label: labelFor(el) })
      } else {
        setFieldError(el, false)
      }
    }
    if (missing.length) {
      show(missing)
      return false
    }
    return true
  }

  /** Nettoie toutes les erreurs du formulaire (ex : à la fermeture d'une modale). */
  function clearErrors(formEl) {
    if (!formEl) return
    for (const el of requiredFields(formEl)) setFieldError(el, false)
  }

  /**
   * Branche la réactivité « live » : dès qu'un champ requis est rempli,
   * son message d'erreur disparaît. À appeler dans onMounted / sur le ref.
   */
  function attach(formEl) {
    if (!formEl) return () => {}
    const handler = (e) => {
      const el = e.target
      if (
        el &&
        el.matches('input[required], select[required], textarea[required]') &&
        !isEmpty(el)
      ) {
        setFieldError(el, false)
      }
    }
    formEl.addEventListener('input', handler)
    formEl.addEventListener('change', handler)
    return () => {
      formEl.removeEventListener('input', handler)
      formEl.removeEventListener('change', handler)
    }
  }

  return { validate, clearErrors, attach }
}
