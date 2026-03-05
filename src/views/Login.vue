<template>
  <div class="login-page">
    <div class="login-left">
      <div class="ll-content">
        <div class="ll-brand">
          <div class="ll-mark" style="background:var(--pro-green)">
            <AppIcon name="book" :size="26" />
          </div>
          <div>
            <div class="ll-name">Classe Inclusive</div>
            <div class="ll-sub">Plateforme d'apprentissage adapté</div>
          </div>
        </div>
        <div class="ll-features">
          <div class="ll-feat">
            <div class="ll-feat-icon"><AppIcon name="book" :size="18" /></div>
            <div>
              <div class="ll-feat-title">Gérer vos cours</div>
              <div class="ll-feat-desc">Créez, publiez et suivez vos contenus pédagogiques</div>
            </div>
          </div>
          <div class="ll-feat">
            <div class="ll-feat-icon"><AppIcon name="quiz" :size="18" /></div>
            <div>
              <div class="ll-feat-title">Créer des quiz</div>
              <div class="ll-feat-desc">Évaluez vos élèves avec des questions interactives</div>
            </div>
          </div>
          <div class="ll-feat">
            <div class="ll-feat-icon"><AppIcon name="chart" :size="18" /></div>
            <div>
              <div class="ll-feat-title">Suivre les résultats</div>
              <div class="ll-feat-desc">Visualisez la progression en temps réel</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="login-card">
        <div class="lc-header">
          <div class="lc-role-tag" style="background:var(--pro-green-soft);color:var(--pro-green)">
            <AppIcon name="teachers" :size="13" />
            Espace Enseignant
          </div>
          <h1 class="lc-title">Connexion</h1>
          <p class="lc-desc">Accédez à votre espace de gestion pédagogique.</p>
        </div>

        <Transition name="fade">
          <div v-if="error" class="lc-error" role="alert">
            <AppIcon name="warning" :size="16" /> {{ error }}
          </div>
        </Transition>

        <form @submit.prevent="handleLogin" style="display:flex;flex-direction:column;gap:14px;margin-bottom:28px" novalidate>
          <div class="pro-field">
            <label for="tl-email" class="pro-label">Adresse e-mail</label>
            <div style="position:relative">
              <AppIcon name="mail" :size="15" style="position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--pro-muted);pointer-events:none" />
              <input id="tl-email" v-model="email" type="email" class="pro-input" style="padding-left:36px"
                placeholder="votre@ecole.fr" autocomplete="email" required />
            </div>
          </div>
          <div class="pro-field">
            <label for="tl-pass" class="pro-label">Mot de passe</label>
            <div style="position:relative">
              <AppIcon name="lock" :size="15" style="position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--pro-muted);pointer-events:none" />
              <input id="tl-pass" v-model="password" type="password" class="pro-input" style="padding-left:36px"
                placeholder="••••••••" autocomplete="current-password" required />
            </div>
          </div>
          <button type="submit" class="pro-btn pro-btn-green pro-btn-lg" style="width:100%;justify-content:center;margin-top:4px" :disabled="isLoading">
            <AppIcon v-if="!isLoading" name="arrow-right" :size="18" />
            {{ isLoading ? 'Connexion…' : 'Se connecter' }}
          </button>
        </form>

        <div class="lc-links">
          <RouterLink to="/login" class="lc-link">
            <AppIcon name="chevron-right" :size="14" style="transform:rotate(180deg)" /> Espace élève
          </RouterLink>
          <RouterLink to="/admin/login" class="lc-link">
            Administration <AppIcon name="chevron-right" :size="14" />
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, h } from 'vue'
import { useRouter } from 'vue-router'

// ============================================================================
// 1. REPRODUCTION DE AppIcon.vue (Fonction de rendu)
// ============================================================================
function getIconInner(name) {
  switch (name) {
    case 'book': return '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>';
    case 'quiz': return '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>';
    case 'chart': return '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6"  y1="20" x2="6"  y2="14"/>';
    case 'teachers': return '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>';
    case 'warning': return '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>';
    case 'mail': return '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>';
    case 'lock': return '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>';
    case 'arrow-right': return '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>';
    case 'chevron-right': return '<polyline points="9 18 15 12 9 6"/>';
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
// 2. LOGIQUE DU COMPOSANT
// ============================================================================
const router    = useRouter()
const email     = ref('')
const password  = ref('')
const error     = ref('')
const isLoading = ref(false)

async function handleLogin() {
  error.value = ''
  if (!email.value || !password.value) { 
    error.value = 'Veuillez remplir tous les champs.'
    return 
  }
  
  isLoading.value = true
  
  // TODO: Remplacer ceci par votre véritable appel au backend/store
  await new Promise(r => setTimeout(r, 800)) 
  const ok = email.value === 'prof@ecole.fr' && password.value === 'prof123'
  
  isLoading.value = false
  
  if (ok) {
    if (router) {
      // Redirection vers PreviewCours après connexion
      router.push({ name: 'previewcours' })
    } else {
      console.log('Navigation vers PreviewCours réussie !')
    }
  } else { 
    error.value = 'Identifiants incorrects.'
    password.value = '' 
  }
}
</script>

<style scoped>
/* 1. Importation des polices Google Fonts au tout début */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* ============================================================================
   VARIABLES ET CLASSES PRO
   ============================================================================ */
/* 2. On attache les variables au conteneur principal au lieu de :root pour respecter le "scoped" */
.login-page {
  --pro-blue:       #2563EB;
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

.pro-btn {
  display: inline-flex; align-items: center; gap: 7px;
  border-radius: var(--pro-r-md); padding: 9px 18px;
  font-family: var(--pro-font); font-size: 0.83rem; font-weight: 700;
  cursor: pointer; border: none; transition: all 0.2s ease;
  white-space: nowrap;
}
.pro-btn-green {
  background: var(--pro-green); color: white;
  box-shadow: 0 2px 8px rgba(5,150,105,0.3);
}
.pro-btn-green:hover:not(:disabled) { 
  background: #047857; 
  box-shadow: 0 4px 16px rgba(5,150,105,0.4); 
  transform: translateY(-1px); 
}
.pro-btn-green:disabled { opacity: 0.6; cursor: not-allowed; }
.pro-btn-lg { padding: 12px 26px; font-size: 0.92rem; }

.pro-field { display: flex; flex-direction: column; gap: 5px; }
.pro-label { font-size: 0.8rem; font-weight: 700; color: var(--pro-ink); }
.pro-input {
  width: 100%; padding: 10px 13px;
  border: 1.5px solid var(--pro-border); border-radius: var(--pro-r-md);
  font-size: 0.88rem; font-family: var(--pro-font); color: var(--pro-ink);
  background: #fafcff; outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.pro-input:focus { border-color: var(--pro-blue); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
.pro-input::placeholder { color: #c0ccdc; }

/* ============================================================================
   STYLES SPÉCIFIQUES À LA PAGE DE LOGIN
   ============================================================================ */
.login-left {
  flex:1; display:none;
  background:linear-gradient(160deg,#064e3b 0%,#065f46 50%,#047857 100%);
  padding:48px; position:relative; overflow:hidden;
}
.login-left::before { content:''; position:absolute; top:-80px; right:-80px; width:280px; height:280px; border-radius:50%; background:rgba(255,255,255,0.04); }
@media(min-width:900px){ .login-left{ display:flex; align-items:center; } }

.ll-content { position:relative; z-index:1; }
.ll-brand   { display:flex; align-items:center; gap:14px; margin-bottom:56px; }
.ll-mark    { width:50px; height:50px; border-radius:13px; display:flex; align-items:center; justify-content:center; color:white; }
.ll-name    { font-size:1.3rem; font-weight:900; color:white; }
.ll-sub     { font-size:0.73rem; color:rgba(255,255,255,0.4); margin-top:2px; }

.ll-features { display:flex; flex-direction:column; gap:20px; }
.ll-feat { display:flex; align-items:flex-start; gap:12px; }
.ll-feat-icon { width:36px; height:36px; border-radius:9px; background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.8); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ll-feat-title { font-size:0.9rem; font-weight:700; color:white; margin-bottom:2px; }
.ll-feat-desc  { font-size:0.75rem; color:rgba(255,255,255,0.45); line-height:1.5; }

.login-right { width:100%; display:flex; align-items:center; justify-content:center; padding:24px; }
@media(min-width:900px){ .login-right{ width:480px; flex-shrink:0; } }
.login-card { width:100%; max-width:400px; }

.lc-header  { margin-bottom:28px; }
.lc-role-tag { display:inline-flex; align-items:center; gap:6px; border-radius:100px; padding:5px 12px; font-size:0.72rem; font-weight:700; margin-bottom:14px; }
.lc-title { font-size:1.8rem; font-weight:900; color:var(--pro-ink); letter-spacing:-0.025em; margin-bottom:6px; }
.lc-desc  { font-size:0.85rem; color:var(--pro-muted); }

.lc-error { display:flex; align-items:center; gap:8px; background:var(--pro-red-soft); border:1px solid rgba(220,38,38,0.2); color:var(--pro-red); border-radius:var(--pro-r-md); padding:10px 14px; font-size:0.83rem; font-weight:600; margin-bottom:16px; }

.lc-links { display:flex; justify-content:space-between; }
.lc-link  { display:inline-flex; align-items:center; gap:4px; font-size:0.78rem; font-weight:600; color:var(--pro-muted); text-decoration:none; transition:color 0.15s; }
.lc-link:hover { color:var(--pro-green); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>