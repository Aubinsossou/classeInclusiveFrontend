import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('@/helpers/axiosApi', () => ({ apiGet: vi.fn(), apiPost: vi.fn(), apiDelete: vi.fn() }))
vi.mock('@/components/admin/Loading.vue', () => ({
  default: { name: 'LoadingView', template: '<div class="loading-stub" />' },
}))

import { apiGet, apiPost, apiDelete } from '@/helpers/axiosApi'
import Student from '@/views/enseignant/Student.vue'

const handicapsFixture = {
  data: {
    data: [
      { id: 1, name: 'Visuel' },
      { id: 2, name: 'Auditif' },
    ],
  },
}

const profileFixture = {
  data: {
    status: 'success',
    data: {
      id: 7,
      name: 'Dupont',
      prenom: 'Jean',
      classe_id: 3,
      classe: {
        id: 3,
        name: '6eme A',
        eleves: [
          {
            id: 11,
            name: 'Martin',
            prenom: 'Lucas',
            code: 123456,
            numeroParent: '0700000000',
            dateOfNaissance: '2015-04-12',
            is_connect: true,
            handicap: { id: 1, name: 'Visuel' },
          },
        ],
      },
    },
  },
}

function mountPage() {
  return mount(Student)
}

// Les modales sont téléportées dans document.body : hors du wrapper VTU.
const $id = (id) => document.getElementById(id)
const $sel = (sel) => document.querySelector(sel)
const clickEl = async (el) => {
  el.click()
  await flushPromises()
}

describe('Student.vue (espace enseignant)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.body.innerHTML = ''
    apiGet.mockImplementation((url) =>
      url.includes('handicap') ? Promise.resolve(handicapsFixture) : Promise.resolve(profileFixture),
    )
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it("affiche la liste des élèves de la classe et le bouton d'ajout", async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Martin')
    expect(wrapper.text()).toContain('6eme A')
    expect(wrapper.find('button.pro-btn-primary').text()).toContain('Ajouter un élève')
  })

  it('ouvre le formulaire et envoie le payload sans classe_id', async () => {
    apiPost.mockResolvedValue({ data: { status: 'success', message: 'Élève ajouté' } })
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.find('button.pro-btn-primary').trigger('click')
    await flushPromises()

    $id('st-nom').value = 'Durand'
    $id('st-nom').dispatchEvent(new Event('input'))
    $id('st-prenom').value = 'Alice'
    $id('st-prenom').dispatchEvent(new Event('input'))
    $id('st-dob').value = '2016-01-05'
    $id('st-dob').dispatchEvent(new Event('input'))
    $id('st-parent').value = '0711223344'
    $id('st-parent').dispatchEvent(new Event('input'))
    $id('st-code').value = '654321'
    $id('st-code').dispatchEvent(new Event('input'))
    $id('st-handicap').value = '2'
    $id('st-handicap').dispatchEvent(new Event('change'))
    await flushPromises()

    await clickEl($sel('.h-modal-foot button.h-btn-primary'))

    expect(apiPost).toHaveBeenCalledWith('enseignant/classe/eleve/store', {
      name: 'Durand',
      prenom: 'Alice',
      numeroParent: '0711223344',
      handicap_id: 2,
      dateOfNaissance: '2016-01-05',
      code: '654321',
    })
    await flushPromises()
    expect(wrapper.text()).toContain('Élève ajouté')
  })

  it('refuse la soumission si des champs obligatoires manquent', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.find('button.pro-btn-primary').trigger('click')
    await flushPromises()
    await clickEl($sel('.h-modal-foot button.h-btn-primary'))

    expect(apiPost).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('Veuillez remplir tous les champs obligatoires.')
  })

  it('affiche l’erreur 409 (code déjà utilisé)', async () => {
    apiPost.mockRejectedValue({
      response: { status: 409, data: { status: 'Echec', message: 'Ce code est déjà utilisé' } },
    })
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.find('button.pro-btn-primary').trigger('click')
    await flushPromises()

    for (const [id, value, event] of [
      ['st-nom', 'Durand', 'input'],
      ['st-prenom', 'Alice', 'input'],
      ['st-dob', '2016-01-05', 'input'],
      ['st-parent', '0711223344', 'input'],
      ['st-code', '123456', 'input'],
    ]) {
      $id(id).value = value
      $id(id).dispatchEvent(new Event(event))
    }
    $id('st-handicap').value = '1'
    $id('st-handicap').dispatchEvent(new Event('change'))
    await flushPromises()

    await clickEl($sel('.h-modal-foot button.h-btn-primary'))

    expect(document.body.textContent).toContain('Ce code est déjà utilisé')
  })

  it('demande confirmation puis supprime l’élève avec le bon id', async () => {
    apiDelete.mockResolvedValue({ data: { status: 'success', message: 'Élève supprimé' } })
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.find('button.pro-icon-btn-danger').trigger('click')
    await flushPromises()

    // l'API n'est pas appelée avant confirmation
    expect(apiDelete).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('Retirer')

    await clickEl($sel('.h-modal-foot button.h-btn-danger'))

    expect(apiDelete).toHaveBeenCalledWith('enseignant/classe/eleve/destroy/11')
    await flushPromises()
    expect(wrapper.text()).toContain('Élève supprimé')
  })

  it('ouvre le modal en édition, pré-remplit les champs et appelle la route update', async () => {
    apiPost.mockResolvedValue({
      data: { status: 'Success', message: 'Élève modifié avec succès', data: { id: 11 } },
    })
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.find('button.pro-icon-btn-primary').trigger('click')
    await flushPromises()

    expect($id('add-eleve-title').textContent).toContain("Modifier l'élève")
    expect($id('st-nom').value).toBe('Martin')
    expect($id('st-prenom').value).toBe('Lucas')

    $id('st-prenom').value = 'Lucas-Modifie'
    $id('st-prenom').dispatchEvent(new Event('input'))
    await flushPromises()

    await clickEl($sel('.h-modal-foot button.h-btn-primary'))

    expect(apiPost).toHaveBeenCalledWith(
      'enseignant/classe/eleve/update/11',
      expect.objectContaining({ prenom: 'Lucas-Modifie' }),
    )
    await flushPromises()
    expect(wrapper.text()).toContain('Élève modifié avec succès')
  })

  it("désactive l'ajout si l'enseignant n'a pas de classe", async () => {
    apiGet.mockImplementation((url) =>
      url.includes('handicap')
        ? Promise.resolve(handicapsFixture)
        : Promise.resolve({
            data: { status: 'success', data: { id: 7, classe_id: null, classe: null } },
          }),
    )
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Aucune classe assignée')
    expect(wrapper.find('button.pro-btn-primary').exists()).toBe(false)
  })

  it('désactive le bouton supprimer sans classe, même avec des élèves', async () => {
    apiGet.mockImplementation((url) =>
      url.includes('handicap')
        ? Promise.resolve(handicapsFixture)
        : Promise.resolve({
            data: {
              status: 'success',
              data: {
                id: 7,
                classe_id: null,
                classe: { id: 1, name: 'A', eleves: profileFixture.data.data.classe.eleves },
              },
            },
          }),
    )
    const wrapper = mountPage()
    await flushPromises()

    const deleteBtn = wrapper.find('button.pro-icon-btn-danger')
    expect(deleteBtn.exists()).toBe(true)
    expect(deleteBtn.attributes('disabled')).toBeDefined()
  })
})
