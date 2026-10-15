<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  id: { type: String, default: undefined },
  placeholder: { type: String, default: '••••••••' },
  autocomplete: { type: String, default: 'current-password' },
  required: { type: Boolean, default: false },
})

// Sans ceci, `class` et `style` seraient aussi appliqués au wrapper racine :
// on veut qu'ils aillent uniquement sur l'<input> via v-bind="$attrs".
defineOptions({ inheritAttrs: false })

const emit = defineEmits(['update:modelValue'])
const visible = ref(false)

function toggle() {
  visible.value = !visible.value
}
</script>

<template>
  <div class="pw-wrap">
    <input
      v-bind="$attrs"
      :id="id"
      :value="modelValue"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      class="pw-input"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <button
      type="button"
      class="pw-toggle"
      :aria-label="visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
      :aria-pressed="visible"
      :title="visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
      @click="toggle"
    >
      <svg
        v-if="!visible"
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.pw-wrap {
  position: relative;
  width: 100%;
}
.pw-input {
  width: 100%;
  padding-right: 40px;
}
.pw-toggle {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  color: var(--pro-muted, #94a3b8);
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}
.pw-toggle:hover {
  color: var(--pro-ink, #0f172a);
  background: rgba(148, 163, 184, 0.14);
}
.pw-toggle:focus-visible {
  outline: 2px solid var(--pro-blue, #2563eb);
  outline-offset: 1px;
}
</style>
