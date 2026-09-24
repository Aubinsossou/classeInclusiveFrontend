import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('@/helpers/axiosApi', () => ({ apiGet: vi.fn() }))

import { apiGet } from '@/helpers/axiosApi'
import ClientDashboard from '@/views/client/ClientDashboard.vue'

const overviewFixture = {
  data: {
    success: true,
    data: {
      total_etablissements: 1,
      total_classes: 2,
      total_eleves: 10,
      total_enseignants: 4,
      total_matieres: 3,
      total_cours: 6,
      total_cours_publies: 4,
      total_cours_publies_pourcentage: 66.67,
      total_quiz: 5,
      total_handicaps: 2,
      repartition_sexe: { disponible: false, raison: 'Aucune colonne sexe/genre dans eleves et enseignants.' },
      repartition_niveau: { disponible: false, raison: 'Aucune colonne niveau/cycle dans classes (seul champ : name).' },
      repartition_par_classe: [
        { id: 1, name: '6eme A', ecole_id: 1, ecole_name: 'Lycee Test', total_eleves: 6, pourcentage: 60 },
        { id: 2, name: '5eme B', ecole_id: 1, ecole_name: 'Lycee Test', total_eleves: 4, pourcentage: 40 },
      ],
      repartition_par_etablissement: [
        { id: 1, ecole_id: 1, name: 'Lycee Test', nom: 'Lycee Test', total_classes: 2, total_eleves: 10, total_enseignants: 4, total_cours: 6, total_matieres: 3, total_quiz: 5 },
      ],
      repartition_par_handicap: [{ id: 1, name: 'Auditif', total_eleves: 2, pourcentage: 20 }],
      cours: { total: 6, publies: 4, non_publies: 2, publies_pourcentage: 66.67, quiz_authorise: 3, quiz_authorise_pourcentage: 50, avec_medias: 1, avec_medias_pourcentage: 16.67 },
    },
  },
}

const emptyFixture = {
  data: {
    success: true,
    data: {
      total_etablissements: 1,
      total_classes: 0,
      total_eleves: 0,
      total_enseignants: 0,
      total_matieres: 0,
      total_cours: 0,
      total_cours_publies: 0,
      total_cours_publies_pourcentage: 0,
      total_quiz: 0,
      total_handicaps: 0,
      repartition_sexe: { disponible: false, raison: 'Raison test.' },
      repartition_niveau: { disponible: false, raison: 'Raison test 2.' },
      repartition_par_classe: [],
      repartition_par_etablissement: [{ id: 1, ecole_id: 1, name: 'Vide', nom: 'Vide', total_classes: 0, total_eleves: 0, total_enseignants: 0, total_cours: 0, total_matieres: 0, total_quiz: 0 }],
      repartition_par_handicap: [],
      cours: { total: 0, publies: 0, non_publies: 0, publies_pourcentage: 0, quiz_authorise: 0, quiz_authorise_pourcentage: 0, avec_medias: 0, avec_medias_pourcentage: 0 },
    },
  },
}

function mountDash() {
  return mount(ClientDashboard, {
    global: {
      stubs: {
        RouterLink: { template: '<a><slot /></a>', props: ['to'] },
      },
    },
  })
}

function expectNoInvalidDisplay(text) {
  expect(text).not.toContain('undefined')
  expect(text).not.toContain('NaN')
  expect(text).not.toContain('null')
  expect(text).not.toContain('— %')
  expect(text).not.toMatch(/>null</)
}

describe('ClientDashboard (overview réel)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('1 appel à statistics/overview, 8 compteurs dont Élèves, répartitions et comparaison', async () => {
    apiGet.mockResolvedValue(overviewFixture)
    const w = mountDash()
    await flushPromises()
    expect(apiGet).toHaveBeenCalledTimes(1)
    expect(apiGet).toHaveBeenCalledWith('client/statistics/overview')

    const t = w.text()
    // compteurs
    expect(t).toContain('Établissements')
    expect(t).toContain('Élèves')
    expect(t).toContain('10') // total_eleves
    expect(t).toContain('Quiz')
    expect(t).toContain('Handicaps')
    // répartitions + pourcentages réels
    expect(t).toContain('60 %')
    expect(t).toContain('20 %')
    expect(t).toContain('6eme A')
    // comparaison établissements + lien détail
    expect(t).toContain('Lycee Test')
    expect(t).toContain('Détail →')
    // répartitions sexe/niveau retirées de l'UI le 24/09/2026 :
    // jamais affichées même si l'API continue de renvoyer les champs.
    expect(t).not.toContain('Répartition par sexe')
    expect(t).not.toContain('Répartition par niveau')
    expect(t).not.toContain('Donnée non disponible')
    expectNoInvalidDisplay(t)
    // champs du sous-objet « cours » de overview (cours.publies, pas total_cours_publies)
    expect(t).toMatch(/Cours publiés :\s*4/)
    expect(t).toMatch(/\/\s*6/)
  })

  it('base vide : les 0 sont affichés et les listes vides signalées', async () => {
    apiGet.mockResolvedValue(emptyFixture)
    const w = mountDash()
    await flushPromises()
    const t = w.text()
    expect(t).toContain('Aucune donnée disponible.') // répartitions classes/handicap vides
    expect(t).toContain('Vide') // ligne école présente, compteurs à 0
    expect(t).toContain('0') // totaux à 0 réels
    expect(t).toContain('0 %')
    expectNoInvalidDisplay(t)
  })

  it('erreur API : message unifié + bouton Réessayer, aucun compteur fantôme', async () => {
    apiGet.mockRejectedValue({ response: { status: 500, data: {} } })
    const w = mountDash()
    await flushPromises()
    expect(w.text()).toMatch(/Erreur serveur/)
    expect(w.find('button').exists()).toBe(true)
    expect(w.find('.dash-grid').exists()).toBe(false)
  })

  it('réponse invalide : message dédié', async () => {
    apiGet.mockResolvedValue({ data: {} })
    const w = mountDash()
    await flushPromises()
    expect(w.text()).toContain('Réponse du serveur invalide.')
  })
})
