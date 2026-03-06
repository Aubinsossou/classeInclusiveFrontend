<script setup>
import { ref, reactive, h } from 'vue'
import { useRouter } from 'vue-router'

// ============================================================================
// 1. COMPOSANT ICONE AUTONOME
// ============================================================================
function getIconInner(name) {
  switch (name) {
    case 'school': return '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>';
    case 'lock': return '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>';
    case 'warning': return '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>';
    case 'mail': return '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>';
    case 'arrow-right': return '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>';
    case 'user': return '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>';
    case 'check': return '<polyline points="20 6 9 17 4 12"/>';
    default: return '<circle cx="12" cy="12" r="4"/>';
  }
}

const AppIcon = (props, { attrs }) => {
  return h('svg', {
    width: props.size || 20, height: props.size || 20, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', 'stroke-width': props.weight || 1.8,
    'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'aria-hidden': !props.label, 'aria-label': props.label, role: 'img',
    innerHTML: getIconInner(props.name),
    ...attrs
  })
}

// ============================================================================
// 2. LOGIQUE DU COMPOSANT (Inscription)
// ============================================================================
const router    = useRouter()
const error     = ref('')
const isLoading = ref(false)

// Objet réactif lié aux inputs de l'interface
const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

async function handleRegister() {
  error.value = ''
  
  // 1. Validation simple
  if (!form.fullName || !form.email || !form.password || !form.confirmPassword) { 
    error.value = 'Veuillez remplir tous les champs.'
    return 
  }
  
  if (form.password !== form.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  if (form.password.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères.'
    return
  }
  
  // 2. Préparation des données formatées (La fameuse variable formData)
  // On extrait uniquement les données nécessaires pour le backend
  const formData = {
    name: form.fullName,
    email: form.email,
    password: form.password
  }
  
  // Tu pourras utiliser `formData` ici pour l'envoyer via Axios ou Fetch
  console.log("✅ Données prêtes à être envoyées à l'API :", formData)

  // 3. Traitement
  isLoading.value = true
  
  // Simulation d'un appel réseau d'inscription
  await new Promise(r => setTimeout(r, 1200)) 
  
  isLoading.value = false
  
  
}
</script>

<template>
  <div class="login-page">
    <div class="login-left">
      <div class="ll-content">
        <div class="ll-brand">
          <div class="ll-mark">
            <AppIcon name="school" :size="28" />
          </div>
          <div>
            <div class="ll-name">Classe Inclusive</div>
            <div class="ll-sub">Plateforme d'apprentissage adapté</div>
          </div>
        </div>
        <blockquote class="ll-quote">
          "L'éducation est l'arme la plus puissante pour changer le monde."
          <cite>— Nelson Mandela</cite>
        </blockquote>
        <div class="ll-stats">
          <div class="ll-stat"><span class="ll-stat-n">10+</span><span class="ll-stat-l">Élèves</span></div>
          <div class="ll-stat"><span class="ll-stat-n">5</span><span class="ll-stat-l">Enseignants</span></div>
          <div class="ll-stat"><span class="ll-stat-n">4</span><span class="ll-stat-l">Classes</span></div>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="login-card">
        <div class="lc-header">
          <div class="lc-role-tag">
            <AppIcon name="lock" :size="13" />
            Espace Administration
          </div>
          <h1 class="lc-title">Créer un compte</h1>
          <p class="lc-desc">Inscrivez-vous pour commencer à utiliser la plateforme.</p>
        </div>

        <Transition name="fade">
          <div v-if="error" class="lc-error" role="alert">
            <AppIcon name="warning" :size="16" />
            {{ error }}
          </div>
        </Transition>

        <form @submit.prevent="handleRegister" class="lc-form" novalidate>
          
          <div class="pro-field">
            <label for="r-name" class="pro-label">Nom de l'établissement</label>
            <div class="lc-input-wrap">
              <AppIcon name="user" :size="16" class="lc-input-icon" />
              <input id="r-name" v-model="form.fullName" type="text"
                class="pro-input lc-input-padded"
                placeholder="Jean Dupont" required />
            </div>
          </div>

          <div class="pro-field">
            <label for="r-email" class="pro-label">Adresse e-mail</label>
            <div class="lc-input-wrap">
              <AppIcon name="mail" :size="16" class="lc-input-icon" />
              <input id="r-email" v-model="form.email" type="email"
                class="pro-input lc-input-padded"
                placeholder="direction@ecole.fr" autocomplete="email" required />
            </div>
          </div>

          <div class="pro-form-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="pro-field">
              <label for="r-pass" class="pro-label">Mot de passe</label>
              <div class="lc-input-wrap">
                <AppIcon name="lock" :size="16" class="lc-input-icon" />
                <input id="r-pass" v-model="form.password" type="password"
                  class="pro-input lc-input-padded"
                  placeholder="••••••••" required />
              </div>
            </div>

            <div class="pro-field">
              <label for="r-pass-conf" class="pro-label">Confirmation</label>
              <div class="lc-input-wrap">
                <AppIcon name="check" :size="16" class="lc-input-icon" />
                <input id="r-pass-conf" v-model="form.confirmPassword" type="password"
                  class="pro-input lc-input-padded"
                  placeholder="••••••••" required />
              </div>
            </div>
          </div>

          <button type="submit" class="pro-btn pro-btn-primary pro-btn-lg lc-submit" :disabled="isLoading">
            <AppIcon v-if="!isLoading" name="arrow-right" :size="18" />
            <span>{{ isLoading ? 'Création en cours…' : 'Créer mon compte' }}</span>
          </button>
        </form>

        <div class="lc-footer-links">
          <span style="color: var(--pro-muted); font-size: 0.85rem;">Vous avez déjà un compte ?</span>
          <RouterLink :to="{ name: 'ecoleLogin' }" class="lc-link" style="color: var(--pro-blue);">
            Se connecter
          </RouterLink>
        </div>

      </div>
    </div>
  </div>
</template>



<style scoped>
/* 1. Importation des polices Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* 2. Variables attachées à la racine du composant (.login-page) */
.login-page {
  --pro-navy:       #0F1B3E;
  --pro-blue:       #2563EB;
  --pro-blue-soft:  rgba(37,99,235,0.09);
  --pro-green:      #059669;
  --pro-green-soft: rgba(5,150,105,0.09);
  --pro-red:        #DC2626;
  --pro-red-soft:   rgba(220,38,38,0.09);
  --pro-ink:        #0f172a;
  --pro-sub:        #475569;
  --pro-muted:      #94a3b8;
  --pro-border:     rgba(15,23,42,0.08);
  --pro-bg:         #f1f5f9;
  --pro-card:       #ffffff;
  --pro-r-sm:       8px;
  --pro-r-md:       12px;
  --pro-font:       'Plus Jakarta Sans', 'Nunito', sans-serif;

  min-height: 100vh; 
  display: flex;
  background: var(--pro-bg);
  font-family: var(--pro-font);
}

/* ============================================================================
   CLASSES PRO GÉNÉRIQUES
   ============================================================================ */
.pro-field { display: flex; flex-direction: column; gap: 5px; }
.pro-label { font-size: 0.8rem; font-weight: 700; color: var(--pro-ink); }
.pro-input {
  width: 100%; padding: 10px 13px;
  border: 1.5px solid var(--pro-border); border-radius: var(--pro-r-md);
  font-size: 0.88rem; font-family: var(--pro-font); color: var(--pro-ink);
  background: #fafcff; outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}
.pro-input:focus { border-color: var(--pro-blue); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
.pro-input::placeholder { color: #c0ccdc; }

.pro-btn {
  display: inline-flex; align-items: center; gap: 7px;
  border-radius: var(--pro-r-md); padding: 9px 18px;
  font-family: var(--pro-font); font-size: 0.83rem; font-weight: 700;
  cursor: pointer; border: none; transition: all 0.2s ease;
  white-space: nowrap;
}
.pro-btn-primary {
  background: var(--pro-blue); color: white;
  box-shadow: 0 2px 8px rgba(37,99,235,0.3);
}
.pro-btn-primary:hover:not(:disabled) { 
  background: #1d4ed8; 
  box-shadow: 0 4px 16px rgba(37,99,235,0.4); 
  transform: translateY(-1px); 
}
.pro-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.pro-btn-lg { padding: 12px 26px; font-size: 0.92rem; }

/* ============================================================================
   STYLES SPÉCIFIQUES À LA PAGE (Panneau gauche)
   ============================================================================ */
.login-left {
  flex: 1; display: none;
  background: linear-gradient(160deg, #0f1b3e 0%, #1e3a8a 55%, #1d4ed8 100%);
  padding: 48px; position: relative; overflow: hidden;
}
.login-left::before {
  content: '';
  position: absolute; top: -80px; right: -80px;
  width: 320px; height: 320px; border-radius: 50%;
  background: rgba(255,255,255,0.04);
}
.login-left::after {
  content: '';
  position: absolute; bottom: -60px; left: -60px;
  width: 240px; height: 240px; border-radius: 50%;
  background: rgba(255,255,255,0.03);
}
@media (min-width: 900px) { .login-left { display: flex; align-items: center; } }
.ll-content { position: relative; z-index: 1; }
.ll-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 64px; }
.ll-mark {
  width: 52px; height: 52px; border-radius: 14px;
  background: rgba(255,255,255,0.12); color: white;
  display: flex; align-items: center; justify-content: center;
}
.ll-name { font-size: 1.3rem; font-weight: 900; color: white; }
.ll-sub  { font-size: 0.75rem; color: rgba(255,255,255,0.45); margin-top: 2px; }

.ll-quote { color: rgba(255,255,255,0.75); font-size: 1.1rem; line-height: 1.7; font-style: italic; margin-bottom: 48px; border-left: 3px solid rgba(255,255,255,0.2); padding-left: 20px; }
.ll-quote cite { display: block; font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-top: 8px; font-style: normal; }

.ll-stats { display: flex; gap: 32px; }
.ll-stat  { display: flex; flex-direction: column; }
.ll-stat-n { font-size: 1.8rem; font-weight: 900; color: white; line-height: 1; }
.ll-stat-l { font-size: 0.72rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 3px; }

/* ============================================================================
   STYLES SPÉCIFIQUES À LA PAGE (Panneau droit)
   ============================================================================ */
.login-right {
  width: 100%; display: flex; align-items: center; justify-content: center;
  padding: 24px; overflow-y: auto;
}
@media (min-width: 900px) { .login-right { width: 600px; flex-shrink: 0; } }

.login-card { width: 100%; max-width: 420px; padding-top: 20px; padding-bottom: 20px;}

.lc-header     { margin-bottom: 28px; }
.lc-role-tag {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--pro-blue-soft); color: var(--pro-blue);
  border-radius: 100px; padding: 5px 12px;
  font-size: 0.72rem; font-weight: 700; margin-bottom: 14px;
}
.lc-title { font-size: 1.8rem; font-weight: 900; color: var(--pro-ink); letter-spacing: -0.025em; margin-bottom: 6px; }
.lc-desc  { font-size: 0.85rem; color: var(--pro-muted); line-height: 1.5; }

.lc-error {
  display: flex; align-items: center; gap: 8px;
  background: var(--pro-red-soft); border: 1px solid rgba(220,38,38,0.2);
  color: var(--pro-red); border-radius: var(--pro-r-md);
  padding: 10px 14px; font-size: 0.83rem; font-weight: 600; margin-bottom: 16px;
}
.lc-form { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
.lc-input-wrap { position: relative; }
.lc-input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--pro-muted); pointer-events: none; }
.lc-input-padded { padding-left: 38px; }
.lc-submit { width: 100%; justify-content: center; margin-top: 8px; }

/* Footer Links pour l'inscription */
.lc-footer-links { 
  display: flex; justify-content: center; align-items: center; gap: 6px; 
  margin-top: 16px;
}
.lc-link {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.85rem; font-weight: 700;
  text-decoration: none; transition: opacity 0.15s;
}
.lc-link:hover { opacity: 0.8; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>