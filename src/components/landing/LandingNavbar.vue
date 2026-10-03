<script setup>
import { ref } from 'vue'
import { landingNav } from '@/data/landingContent.js'
import logo from '@/assets/images/logo_classe_inclusive.png'

const open = ref(false)
const loginOpen = ref(false)
const logins = [
  { label: 'Enseignant', to: '/enseignant/login' },
  { label: 'Établissement', to: '/ecole/login' },
  { label: 'Partenaire', to: '/client/login' },
]
function close() { open.value = false; loginOpen.value = false }
</script>

<template>
  <header class="ld-nav" role="banner">
    <a href="#main" class="skip-link">Aller au contenu</a>
    <div class="ld-nav-inner">
      <RouterLink to="/" class="ld-brand" @click="close">
        <img :src="logo" alt="Logo Classe Inclusive" class="ld-logo" />
        <span class="ld-brand-txt">Classe <strong>Inclusive</strong><small>Présentation publique</small></span>
      </RouterLink>
      <nav class="ld-links" aria-label="Navigation principale">
        <a v-for="l in landingNav" :key="l.id" :href="'#' + l.id">{{ l.label }}</a>
      </nav>
      <div class="ld-actions">
        <div class="ld-login-wrap">
          <button class="pro-btn pro-btn-ghost pro-btn-sm" type="button" @click="loginOpen = !loginOpen" :aria-expanded="loginOpen">Se connecter</button>
          <div v-if="loginOpen" class="ld-login-drop" role="menu">
            <RouterLink v-for="l in logins" :key="l.to" :to="l.to" role="menuitem" @click="close">{{ l.label }}</RouterLink>
          </div>
        </div>
        <a href="#acces" class="pro-btn pro-btn-primary pro-btn-sm">Accéder aux espaces</a>
        <button class="ld-burger" type="button" @click="open = !open" :aria-expanded="open" aria-label="Menu">☰</button>
      </div>
    </div>
    <nav v-if="open" class="ld-mobile" aria-label="Navigation mobile">
      <a v-for="l in landingNav" :key="l.id" :href="'#' + l.id" @click="close">{{ l.label }}</a>
      <div class="ld-mobile-logins">
        <span>Accès aux espaces :</span>
        <RouterLink v-for="l in logins" :key="l.to" :to="l.to" @click="close">{{ l.label }}</RouterLink>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.skip-link{position:absolute;top:-100px;left:12px;background:var(--pro-blue);color:#fff;padding:8px 14px;border-radius:8px;z-index:99}
.skip-link:focus{top:10px}
.ld-nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--pro-border)}
.ld-nav-inner{max-width:1180px;margin:0 auto;padding:10px 20px;display:flex;align-items:center;gap:16px}
.ld-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--pro-ink)}
.ld-logo{width:44px;height:44px;object-fit:contain;border-radius:10px;background:#fff;border:1px solid var(--pro-border)}
.ld-brand-txt{display:flex;flex-direction:column;font-size:1rem;line-height:1.1}
.ld-brand-txt small{font-size:.65rem;color:var(--pro-muted);font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.ld-links{display:flex;gap:18px;margin-left:auto}
.ld-links a{font-size:.85rem;font-weight:700;color:var(--pro-sub);text-decoration:none}
.ld-links a:hover{color:var(--pro-blue)}
.ld-actions{display:flex;align-items:center;gap:8px;margin-left:12px}
.ld-login-wrap{position:relative}
.ld-login-drop{position:absolute;right:0;top:110%;background:#fff;border:1px solid var(--pro-border);border-radius:12px;box-shadow:var(--pro-shadow-lg);min-width:190px;padding:6px;display:flex;flex-direction:column}
.ld-login-drop a{padding:9px 12px;border-radius:8px;font-size:.83rem;font-weight:700;color:var(--pro-sub);text-decoration:none}
.ld-login-drop a:hover{background:var(--pro-blue-soft);color:var(--pro-blue)}
.ld-burger{display:none;border:1px solid var(--pro-border);background:#fff;border-radius:10px;width:38px;height:34px;font-size:1.1rem;cursor:pointer}
.ld-mobile{display:flex;flex-direction:column;gap:2px;padding:10px 20px 16px;border-top:1px solid var(--pro-border);background:#fff}
.ld-mobile>a{padding:10px 4px;font-weight:700;color:var(--pro-ink);text-decoration:none;border-bottom:1px solid #f1f5f9}
.ld-mobile-logins{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding-top:10px;font-size:.8rem;color:var(--pro-muted)}
.ld-mobile-logins a{background:#f1f5f9;border-radius:99px;padding:6px 12px;font-weight:700;color:var(--pro-blue);text-decoration:none}
@media(max-width:900px){.ld-links{display:none}.ld-burger{display:block}.ld-actions{margin-left:auto}}
</style>
