import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('@/helpers/axiosApi', () => ({ apiGet: vi.fn(), apiPost: vi.fn() }))
vi.mock('@/components/admin/Loading.vue', () => ({
  default: { name: 'LoadingView', template: '<div class="loading-stub" />' },
}))

import { apiGet, apiPost } from '@/helpers/axiosApi'
import EnseignantProfil from '@/views/enseignant/EnseignantProfil.vue'

const profileFixture = {
  data: {
    status: 'success',
    data: {
      id: 7,
      name: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      numero: '0700000000',
      matricule: 'ENS-001',
    },
  },
}

function mountPage() {
  return mount(EnseignantProfil)
}

async function fillValidForm(wrapper) {
  await wrapper.find('#current_password').setValue('AncienMotDePasse1')
  await wrapper.find('#password').setValue('NouveauMotDePasse1')
  await wrapper.find('#password_confirmation').setValue('NouveauMotDePasse1')
}

describe('EnseignantProfil.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    apiGet.mockResolvedValue(profileFixture)
  })

  it("affiche les informations de l'enseignant", async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(apiGet).toHaveBeenCalledWith('enseignant/getEnseignant')
    expect(wrapper.text()).toContain('Dupont')
    expect(wrapper.text()).toContain('jean.dupont@example.com')
    expect(wrapper.text()).toContain('ENS-001')
  })

  it("bloque l'envoi et affiche les erreurs de validation locales", async () => {
    apiPost.mockResolvedValue({ data: { status: 'success' } })
    const wrapper = mountPage()
    await flushPromises()

    await fillValidForm(wrapper)
    await wrapper.find('#password_confirmation').setValue('AutreMotDePasse1')
    await wrapper.find('form').trigger('submit.prevent')

    expect(apiPost).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Les deux mots de passe ne correspondent pas')
  })

  it("rejette un nouveau mot de passe trop court", async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.find('#current_password').setValue('AncienMotDePasse1')
    await wrapper.find('#password').setValue('court')
    await wrapper.find('#password_confirmation').setValue('court')
    await wrapper.find('form').trigger('submit.prevent')

    expect(apiPost).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('au moins 8 caractères')
  })

  it('envoie le bon payload et affiche le succès', async () => {
    apiPost.mockResolvedValue({ data: { status: 'success', message: 'Mot de passe modifié' } })
    const wrapper = mountPage()
    await flushPromises()

    await fillValidForm(wrapper)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(apiPost).toHaveBeenCalledWith('enseignant/change-password', {
      current_password: 'AncienMotDePasse1',
      password: 'NouveauMotDePasse1',
      password_confirmation: 'NouveauMotDePasse1',
    })
    expect(wrapper.text()).toContain('Votre mot de passe a été modifié avec succès')
    // les champs sont vidés après succès
    expect(wrapper.find('#current_password').element.value).toBe('')
    expect(wrapper.find('#password').element.value).toBe('')
  })

  it('permet d’afficher le mot de passe saisi via le toggle', async () => {
    apiPost.mockResolvedValue({ data: { status: 'success' } })
    const wrapper = mountPage()
    await flushPromises()

    await fillValidForm(wrapper)

    // le toggle est propre à chaque champ : on prend celui du champ « Nouveau mot de passe »
    const passField = wrapper.find('#password').element.closest('.pf-field')
    const toggle = passField.querySelector('button.pw-toggle')

    expect(wrapper.find('#password').element.type).toBe('password')

    toggle.click()
    await flushPromises()

    expect(wrapper.find('#password').element.type).toBe('text')
    expect(wrapper.find('#password').element.value).toBe('NouveauMotDePasse1')

    passField.querySelector('button.pw-toggle').click()
    await flushPromises()

    expect(wrapper.find('#password').element.type).toBe('password')
  })

  it("affiche l'erreur renvoyée par le backend (mot de passe actuel incorrect)", async () => {
    apiPost.mockRejectedValue({
      response: {
        status: 400,
        data: {
          status: 'Echoué',
          message: 'Le mot de passe actuel est incorrect',
          errors: { current_password: ['Le mot de passe actuel est incorrect'] },
        },
      },
    })
    const wrapper = mountPage()
    await flushPromises()

    await fillValidForm(wrapper)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Le mot de passe actuel est incorrect')
  })

  it('redirige vers le login enseignant si le profil renvoie 401', async () => {
    // jsdom ne permet pas la navigation : on remplace location pour intercepter l'affectation
    const originalLocation = window.location
    delete window.location
    window.location = { href: '' }

    localStorage.setItem('access_token', 'token-de-test')
    localStorage.setItem('role', 'enseignant')
    apiGet.mockRejectedValue({ response: { status: 401 } })

    const wrapper = mountPage()
    await flushPromises()

    expect(window.location.href).toBe('/enseignant/login')
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('role')).toBeNull()
    expect(wrapper.text()).not.toContain('Dupont')

    window.location = originalLocation
  })
})
