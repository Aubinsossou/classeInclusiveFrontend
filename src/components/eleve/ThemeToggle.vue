<template>
  <button
    :class="['theme-toggle', `theme-toggle--${variant}`, { 'theme-toggle--light': theme.isLight }]"
    @click="theme.toggle"
    type="button"
    :aria-label="theme.isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
    :aria-pressed="theme.isLight">

    <!-- Icône Lune (dark) -->
    <svg v-if="theme.isDark" viewBox="0 0 24 24" fill="none" :width="size" :height="size" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Icône Soleil (light) -->
    <svg v-else viewBox="0 0 24 24" fill="none" :width="size" :height="size" aria-hidden="true">
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>

    <!-- Label optionnel -->
    <span v-if="showLabel" class="toggle-label">
      {{ theme.isDark ? 'Mode sombre' : 'Mode clair' }}
    </span>

    <!-- Pill animée (variant pill) -->
    <span v-if="variant === 'pill'" class="pill-track" aria-hidden="true">
      <span class="pill-thumb"></span>
    </span>

  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'

const theme = useThemeStore()

defineProps({
  variant:   { type: String,  default: 'icon'  }, // 'icon' | 'pill' | 'full'
  showLabel: { type: Boolean, default: false    },
  size:      { type: Number,  default: 18       },
})
</script>

<style scoped>
/* ── VARIANT ICON (header) ──────────────────────────────── */
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 12px;
  color: var(--text2);
  cursor: pointer;
  font-family: var(--font-b, 'Verdana', sans-serif);
  font-size: .82rem;
  font-weight: bold;
  transition: all .2s;
  outline: none;
}

.theme-toggle:hover { background: var(--surface2, rgba(255,255,255,.06)); color: var(--text); border-color: var(--accent, #4F46E5); }
.theme-toggle:focus-visible { box-shadow: 0 0 0 3px rgba(79,70,229,.5); }

/* Mode light : couleurs inversées pour que le bouton reste visible */
.theme-toggle--light { color: var(--text2); }
.theme-toggle--light:hover { background: var(--surface2); }

/* ── VARIANT FULL (sidebar) ─────────────────────────────── */
.theme-toggle--full {
  width: 100%;
  justify-content: flex-start;
  padding: 11px 14px;
  border-radius: 10px;
}

/* ── VARIANT PILL ───────────────────────────────────────── */
.theme-toggle--pill {
  gap: 10px;
  border: none;
  background: transparent;
  padding: 6px 0;
}
.theme-toggle--pill:hover { background: transparent; }

.pill-track {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: var(--surface2, #1A1E2B);
  border: 1px solid var(--border, rgba(255,255,255,.07));
  position: relative;
  flex-shrink: 0;
  transition: background .25s;
}
.theme-toggle--light .pill-track { background: #e8c97a; border-color: #d4a843; }

.pill-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--text2, #8B91B0);
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), background .25s;
}
.theme-toggle--light .pill-thumb {
  transform: translateX(20px);
  background: #FFF;
}

.toggle-label { font-size: .82rem; color: var(--text2); }
</style>
