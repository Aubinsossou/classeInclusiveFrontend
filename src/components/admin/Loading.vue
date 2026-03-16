<template>
  <Transition name="loader-fade">
    <div v-if="visible" class="loader-overlay" :class="{ 'loader-fullscreen': fullscreen }">
      <div class="loader-box">

        <!-- Barres qui dansent -->
        <div class="loader-bars">
          <span></span><span></span><span></span>
          <span></span><span></span>
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
  --c-green-dark: #0D5F3A;
  --c-green:      #1A8F5A;
  --c-green-mid:  #22D4A0;
  --c-green-soft: rgba(34, 212, 160, 0.6);
  --c-bg:         #eff5ff;

  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff5ff;
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

/* ── BARRES ──────────────────────────── */
.loader-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 48px;
}

.loader-bars span {
  display: block;
  width: 8px;
  border-radius: 8px 8px 4px 4px;
  animation: bar-dance 1s ease-in-out infinite;
}

.loader-bars span:nth-child(1) {
  height: 24px;
  background: #0D5F3A;
  animation-delay: 0s;
}
.loader-bars span:nth-child(2) {
  height: 38px;
  background: #1A8F5A;
  animation-delay: 0.15s;
}
.loader-bars span:nth-child(3) {
  height: 48px;
  background: #1A8F5A;
  animation-delay: 0.3s;
}
.loader-bars span:nth-child(4) {
  height: 32px;
  background: #1A8F5A;
  animation-delay: 0.45s;
}
.loader-bars span:nth-child(5) {
  height: 20px;
  background: #0D5F3A;
  animation-delay: 0.6s;
}

@keyframes bar-dance {
  0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
  50%       { transform: scaleY(1);   opacity: 1;   }
}

/* ── TEXTE ───────────────────────────── */
.loader-text {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.83rem;
  font-weight: 600;
}

.loader-label {
  color: #0f172a;
  letter-spacing: 0.01em;
}

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

.loader-dots span:nth-child(1) { background: #1A8F5A;                    animation-delay: 0s;    }
.loader-dots span:nth-child(2) { background: #1A8F5A;    animation-delay: 0.18s; }
.loader-dots span:nth-child(3) { background: #0D5F3A;    animation-delay: 0.36s; }

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