<template>
  <Transition name="loader-fade">
    <div v-if="visible" class="loader-overlay" :class="{ 'loader-fullscreen': fullscreen }">
      <div class="loader-box">

        <!-- Cercles concentriques -->
        <div class="loader-rings">
          <div class="ring ring-1"></div>
          <div class="ring ring-2"></div>
          <div class="ring ring-3"></div>
          <div class="loader-core">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        </div>

        <!-- Texte -->
        <div class="loader-text">
          <span class="loader-label">{{ message }}</span>
          <span class="loader-dots">
            <span></span><span></span><span></span>
          </span>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible:    { type: Boolean, default: true },
  fullscreen: { type: Boolean, default: false },
  message:    { type: String,  default: 'Chargement' },
  offsetTop:  { type: String,  default: '0px' },
})
</script>

<style scoped>
.loader-overlay {
  --c-blue:      #2563EB;
  --c-blue-mid:  #3b82f6;
  --c-blue-soft: rgba(37, 99, 235, 0.12);
  --c-ink:       #0f172a;
  --c-muted:     #475569;
  --c-bg:        #eff5ff;

  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-bg);
  
  border-radius: 20px;
  padding: 48px;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.loader-fullscreen {
  position: fixed;
  inset: 0;
  border-radius: 0;
  z-index: 9999;
  top: v-bind(offsetTop);
}

/* ── BOÎTE ───────────────────────────── */
.loader-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* ── CERCLES ─────────────────────────── */
.loader-rings {
  position: relative;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 2.5px solid transparent;
}

.ring-1 {
  width: 72px;
  height: 72px;
  border-top-color: var(--c-blue);
  border-right-color: var(--c-blue);
  animation: spin 1s linear infinite;
}

.ring-2 {
  width: 54px;
  height: 54px;
  border-bottom-color: var(--c-blue-mid);
  border-left-color: var(--c-blue-mid);
  animation: spin 0.75s linear infinite reverse;
  opacity: 0.7;
}

.ring-3 {
  width: 36px;
  height: 36px;
  border-top-color: #93c5fd;
  animation: spin 1.4s linear infinite;
  opacity: 0.5;
}

.loader-core {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--c-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(37, 99, 235, 0.4);
  animation: pulse-core 1.4s ease-in-out infinite;
  z-index: 1;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse-core {
  0%, 100% { box-shadow: 0 0 12px rgba(37,99,235,0.3); transform: scale(1); }
  50%       { box-shadow: 0 0 22px rgba(37,99,235,0.6); transform: scale(1.08); }
}

/* ── TEXTE ───────────────────────────── */
.loader-text {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.83rem;
  font-weight: 600;
}

.loader-label { color: var(--c-ink); letter-spacing: 0.01em; }

.loader-dots {
  display: flex;
  gap: 3px;
  align-items: center;
}

.loader-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: dot-blink 1s ease-in-out infinite;
}

.loader-dots span:nth-child(1) { background: var(--c-blue);     animation-delay: 0s;    }
.loader-dots span:nth-child(2) { background: var(--c-blue-mid); animation-delay: 0.18s; }
.loader-dots span:nth-child(3) { background: #93c5fd;            animation-delay: 0.36s; }

@keyframes dot-blink {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40%            { opacity: 1;   transform: scale(1.2); }
}

/* ── TRANSITION ──────────────────────── */
.loader-fade-enter-active,
.loader-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.loader-fade-enter-from,
.loader-fade-leave-to     { opacity: 0; transform: scale(0.96); }
</style>