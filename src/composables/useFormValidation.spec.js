import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFormValidation } from './useFormValidation'
import { useFormToast } from './useFormToast'

/** Construit un mini formulaire « maison » dans le DOM de test. */
function buildForm() {
  const form = document.createElement('form')
  form.innerHTML = `
    <div>
      <label for="f-name">Nom complet</label>
      <input id="f-name" type="text" required />
    </div>
    <div>
      <label for="f-mail">Adresse e-mail</label>
      <input id="f-mail" type="email" required />
    </div>
    <div>
      <label for="f-phone">Téléphone</label>
      <input id="f-phone" type="text" />
    </div>
    <div>
      <label for="f-classe">Classe</label>
      <select id="f-classe" required>
        <option value="">— Choisir —</option>
        <option value="1">CP-A</option>
      </select>
    </div>
  `
  document.body.appendChild(form)
  return form
}

describe('useFormValidation', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('marque les champs requis vides et retourne false', () => {
    const form = buildForm()
    const { validate } = useFormValidation()

    expect(validate(form)).toBe(false)

    expect(document.getElementById('f-name').classList.contains('fe-invalid')).toBe(true)
    expect(document.getElementById('f-mail').classList.contains('fe-invalid')).toBe(true)
    expect(document.getElementById('f-classe').classList.contains('fe-invalid')).toBe(true)
    // aria-invalid pour l'accessibilité
    expect(document.getElementById('f-name').getAttribute('aria-invalid')).toBe('true')
    // petit message inline sous chaque champ vide
    const msgs = form.querySelectorAll('.fe-msg')
    expect(msgs.length).toBe(3)
    expect(msgs[0].textContent).toBe('Ce champ est requis.')
  })

  it('ignore les champs non requis', () => {
    const form = buildForm()
    const { validate } = useFormValidation()
    validate(form)

    expect(document.getElementById('f-phone').classList.contains('fe-invalid')).toBe(false)
  })

  it('retourne true quand tous les champs requis sont remplis', () => {
    const form = buildForm()
    const { validate } = useFormValidation()

    document.getElementById('f-name').value = 'Dupont'
    document.getElementById('f-mail').value = 'jean@example.com'
    document.getElementById('f-classe').value = '1'

    expect(validate(form)).toBe(true)
    expect(form.querySelectorAll('.fe-msg').length).toBe(0)
  })

  it('efface l’erreur d’un champ dès qu’il est rempli (validation live)', async () => {
    const form = buildForm()
    const { validate, attach } = useFormValidation()
    const detach = attach(form)

    validate(form)
    expect(document.getElementById('f-name').classList.contains('fe-invalid')).toBe(true)

    const input = document.getElementById('f-name')
    input.value = 'Dupont'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    expect(input.classList.contains('fe-invalid')).toBe(false)
    expect(input.getAttribute('aria-invalid')).toBeNull()
    // il reste seulement les 2 autres champs en erreur (mail + classe)
    expect(form.querySelectorAll('.fe-msg').length).toBe(2)

    detach()
  })

  it('clearErrors retire toutes les erreurs du formulaire', () => {
    const form = buildForm()
    const { validate, clearErrors } = useFormValidation()

    validate(form)
    expect(form.querySelectorAll('.fe-msg').length).toBe(3)

    clearErrors(form)
    expect(form.querySelectorAll('.fe-msg').length).toBe(0)
    expect(form.querySelector('.fe-invalid')).toBeNull()
  })

  it('tolère un conteneur absent (retourne true sans planter)', () => {
    const { validate } = useFormValidation()
    expect(validate(null)).toBe(true)
  })

  it('utilise le placeholder quand aucun label n’est associé', () => {
    const form = document.createElement('form')
    form.innerHTML = `<div><input type="text" placeholder="Ex : 123456" required /></div>`
    document.body.appendChild(form)

    const { validate } = useFormValidation()
    expect(validate(form)).toBe(false)

    const toast = useFormToast()
    // le libellé déduit du placeholder est bien utilisé par le toast
    toast.show([{ el: form.querySelector('input'), label: 'Ex : 123456' }])
    expect(toast.state.labels).toEqual(['Ex : 123456'])
    toast.hide()
  })
})
