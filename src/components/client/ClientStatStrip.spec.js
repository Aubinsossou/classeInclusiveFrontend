import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('@/helpers/axiosApi', () => ({ apiGet: vi.fn() }))

import { apiGet } from '@/helpers/axiosApi'
import ClientStatStrip from '@/components/client/ClientStatStrip.vue'

const metrics = [
  { label: 'Total', path: 'total_enseignants' },
  { label: 'Avec classe', path: 'avec_classe', pctPath: 'avec_classe_pourcentage' },
]

function mountStrip(endpoint = 'client/statistics/enseignants') {
  return mount(ClientStatStrip, {
    props: { title: 'Statistiques enseignants', endpoint, metrics },
    global: { stubs: { RouterLink: { template: '<a><slot /></a>', props: ['to'] } } },
  })
}

describe('ClientStatStrip', () => {
  beforeEach(() => vi.clearAllMocks())

  it('affiche l état de chargement puis les valeurs réelles', async () => {
    apiGet.mockResolvedValue({
      data: { data: { total_enseignants: 4, avec_classe: 3, avec_classe_pourcentage: 75 } },
    })
    const w = mountStrip()
    expect(w.text()).toContain('Chargement')
    await flushPromises()
    expect(w.text()).toContain('Total')
    expect(w.text()).toContain('4')
    expect(w.text()).toContain('75 %')
    expect(apiGet).toHaveBeenCalledWith('client/statistics/enseignants')
  })

  it('affiche 0 et 0 % quand la base est vide (valeurs zéro valides)', async () => {
    apiGet.mockResolvedValue({
      data: { data: { total_enseignants: 0, avec_classe: 0, avec_classe_pourcentage: 0 } },
    })
    const w = mountStrip()
    await flushPromises()
    expect(w.text()).toContain('0')
    expect(w.text()).toContain('0 %')
    expect(w.text()).not.toContain('NaN')
    expect(w.text()).not.toContain('undefined')
  })

  it('affiche n/d pour un champ absent — jamais undefined/null/NaN', async () => {
    apiGet.mockResolvedValue({ data: { data: { total_enseignants: 2 } } })
    const w = mountStrip()
    await flushPromises()
    expect(w.text()).toContain('n/d')
    expect(w.text()).not.toContain('undefined')
    expect(w.text()).not.toContain('NaN')
    expect(w.text()).not.toContain('null')
  })

  it('affiche un message d erreur unifié sur erreur API 500 + bouton Réessayer', async () => {
    apiGet.mockRejectedValue({ response: { status: 500, data: {} } })
    const w = mountStrip()
    await flushPromises()
    expect(w.text()).toMatch(/Erreur serveur/)
    expect(w.find('button').exists()).toBe(true)
    apiGet.mockResolvedValue({ data: { data: { total_enseignants: 1, avec_classe: 1, avec_classe_pourcentage: 100 } } })
    await w.find('button').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('1')
  })

  it('affiche la réponse invalide si data absent', async () => {
    apiGet.mockResolvedValue({ data: {} })
    const w = mountStrip()
    await flushPromises()
    expect(w.text()).toContain('Réponse du serveur invalide.')
  })
})
