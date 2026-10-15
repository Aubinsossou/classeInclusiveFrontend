<script setup>
import { useFormToast } from '@/composables/useFormToast'

const { state, hide, goToFirstInvalid } = useFormToast()
</script>

<template>
  <Transition name="fe-toast">
    <div
      v-if="state.visible"
      class="fe-toast"
      role="alert"
      aria-live="assertive"
      @click="goToFirstInvalid"
    >
      <span class="fe-toast-icon" aria-hidden="true">⚠️</span>
      <div class="fe-toast-body">
        <strong class="fe-toast-title">
          {{ state.count }} champ{{ state.count > 1 ? 's' : '' }} requis non
          rempli{{ state.count > 1 ? 's' : '' }}
        </strong>
        <span class="fe-toast-list">{{ state.labels.join(' · ') }}</span>
        <span class="fe-toast-hint">Cliquez pour y aller ↓</span>
      </div>
      <button
        type="button"
        class="fe-toast-close"
        aria-label="Fermer"
        @click.stop="hide"
      >
        ✕
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.fe-toast {
  position: fixed;
  z-index: 10000;
  right: 18px;
  bottom: 18px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: min(360px, calc(100vw - 32px));
  padding: 12px 14px;
  background: #fef2f2;
  border: 1px solid rgba(220, 38, 38, 0.45);
  border-left: 4px solid #dc2626;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(220, 38, 38, 0.18), 0 2px 8px rgba(15, 23, 42, 0.12);
  color: #991b1b;
  font-family: 'Plus Jakarta Sans', 'Nunito', sans-serif;
  cursor: pointer;
  pointer-events: auto;
}
.fe-toast-icon {
  font-size: 1.05rem;
  line-height: 1.4;
}
.fe-toast-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.fe-toast-title {
  font-size: 0.83rem;
  font-weight: 800;
}
.fe-toast-list {
  font-size: 0.76rem;
  font-weight: 600;
  color: #b91c1c;
  overflow-wrap: anywhere;
}
.fe-toast-hint {
  font-size: 0.7rem;
  opacity: 0.75;
  margin-top: 2px;
}
.fe-toast-close {
  flex-shrink: 0;
  background: transparent;
  color: #dc2626;
  font-size: 0.8rem;
  line-height: 1;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 6px;
}
.fe-toast-close:hover {
  background: rgba(220, 38, 38, 0.12);
}
@media (max-width: 640px) {
  .fe-toast {
    right: 12px;
    left: 12px;
    bottom: 12px;
    max-width: none;
  }
}
/* Entrée / sortie discrètes : non bloquant, ne gêne pas l'utilisateur */
.fe-toast-enter-active,
.fe-toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fe-toast-enter-from,
.fe-toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
