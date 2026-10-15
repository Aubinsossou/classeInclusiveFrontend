import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordInput from '@/components/PasswordInput.vue'

describe('PasswordInput.vue', () => {
  it('rend un input de type password masqué par défaut', () => {
    const wrapper = mount(PasswordInput, { props: { modelValue: 'secret', id: 'mon-champ' } })
    const input = wrapper.find('input')

    expect(input.attributes('type')).toBe('password')
    expect(input.attributes('id')).toBe('mon-champ')
    expect(input.element.value).toBe('secret')
  })

  it('affiche le mot de passe au clic sur le toggle puis le remasque', async () => {
    const wrapper = mount(PasswordInput, { props: { modelValue: 'secret' } })
    const toggle = wrapper.find('button.pw-toggle')

    expect(toggle.attributes('aria-label')).toBe('Afficher le mot de passe')
    expect(toggle.attributes('aria-pressed')).toBe('false')

    await toggle.trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('text')
    expect(toggle.attributes('aria-label')).toBe('Masquer le mot de passe')
    expect(toggle.attributes('aria-pressed')).toBe('true')

    await toggle.trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('émet update:modelValue à la saisie', async () => {
    const wrapper = mount(PasswordInput, { props: { modelValue: '' } })
    const input = wrapper.find('input')

    await input.setValue('nouveau')

    expect(wrapper.emitted('update:modelValue')).toEqual([['nouveau']])
  })

  it("préserve les attributs passés par la vue (class, required, autocomplete)", () => {
    const wrapper = mount(PasswordInput, {
      props: { modelValue: '', autocomplete: 'new-password', required: true },
      attrs: { class: 'pro-input pf-invalid' },
    })

    const input = wrapper.find('input')
    expect(input.classes()).toContain('pro-input')
    expect(input.classes()).toContain('pf-invalid')
    expect(input.attributes('required')).toBeDefined()
    expect(input.attributes('autocomplete')).toBe('new-password')

    // inheritAttrs: false → les classes ne polluent pas le wrapper racine
    expect(wrapper.classes()).not.toContain('pro-input')
    expect(wrapper.classes()).toContain('pw-wrap')
  })

  it("l'input est bien typé password par défaut (valeur non lisible)", () => {
    const wrapper = mount(PasswordInput, { props: { modelValue: 'secret' } })
    const input = wrapper.find('input')

    expect(input.attributes('type')).toBe('password')
    expect(input.classes()).toContain('pw-input')
    expect(input.element.value).toBe('secret')
  })
})
