<script setup>
import { ref,onMounted } from 'vue';
import { apiDelete, apiGet } from '@/helpers/axiosApi';
import { useRouter } from 'vue-router';

const router = useRouter()

/* Menu mobile */
const mobileOpen = ref(false)

// Liens de navigation partagés entre le menu desktop et le menu mobile burger
const navLinks = [
  { to: '/ecole/dashboard', label: 'Tableau de bord' },
  { to: '/ecole/enseignant', label: 'Enseignant' },
  { to: '/ecole/classe', label: 'Classes' },
  { to: '/ecole/matiere', label: 'Matières' },
  { to: '/ecole/eleve', label: 'Elèves' },
]

/* User connecter */
const apiGetUser = async () => {
  const response = await apiGet('ecole/getEcole')
  userAuth.value = response.data
  console.log(' userAuth.value: ', userAuth.value)
}
const role = localStorage.getItem("role")
const userAuth = ref()
const userLogout = ref()

/* Api logout */

const apiLogoutUser = async () => {
  const response = await apiDelete('ecole/logout')
  userLogout.value = response.data
  console.log(' userLogout.value: ', userLogout.value)
  localStorage.removeItem("access_token")
  localStorage.removeItem("role")
  router.push("/ecole/login")
}

onMounted( async () =>{
  try {
    await apiGetUser()
  } catch (e) {
    // 401 → l'intercepteur axios redirige vers le login ;
    // on laisse le header afficher le rôle faute de nom d'école.
    console.error('Erreur chargement utilisateur connecté :', e)
  }
})

</script>

<template>
  <header id="header" role="banner">
    <div class="header-inner">
      <RouterLink to="/ecole/dashboard" class="header-brand" @click="mobileOpen = false">
        <div class="header-logo">
          <img src="@/assets/images/logo_classe_inclusive.png" alt="Logo classe inclusive" />
        </div>
        <div class="header-brand-txt">
          <div class="logo-title">Classe inclusive</div>
          <div class="logo-desc">{{ userAuth?.data?.name ?? role }}</div>
        </div>
      </RouterLink>

      <nav class="header-part2" aria-label="Navigation établissement">
        <RouterLink v-for="l in navLinks" :key="l.to" :to="l.to" active-class="active">{{
          l.label
        }}</RouterLink>
      </nav>

      <div class="header-actions">
        <div class="header-part3">
          <button type="button" class="header-part3-link2" @click="apiLogoutUser()">Déconnexion</button>
        </div>
        <button
          class="header-burger"
          type="button"
          :aria-expanded="mobileOpen"
          aria-label="Menu"
          @click="mobileOpen = !mobileOpen"
        >
          ☰
        </button>
      </div>
    </div>

    <nav v-if="mobileOpen" class="hm-mobile" aria-label="Navigation mobile établissement">
      <RouterLink
        v-for="l in navLinks"
        :key="l.to"
        :to="l.to"
        active-class="active"
        @click="mobileOpen = false"
        >{{ l.label }}</RouterLink
      >
      <button type="button" class="logout-mobile" @click="mobileOpen = false; apiLogoutUser()">
        Déconnexion
      </button>
    </nav>
  </header>
</template>

<style scoped>
#header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: linear-gradient(135deg, #1a2b5e 0%, #2e4080 100%);
  padding: 0;
  margin-bottom: 32px;
  font-weight: 600;
  font-family: "Baloo 2", cursive;
}
/* Géométrie alignée sur la landing (.ld-nav-inner) :
   padding 14px 28px, flex space-between + wrap, gap 16px. */
.header-inner {
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
#header a {
  color: white;
}
#header a {
  display: flex;
  text-decoration: none;
  flex-shrink: 0;
  transition: opacity var(--t);
}
.header-brand-txt {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.logo-title {
  font-family: var(--font-h);
  font-size: 1.3rem;
  font-weight: 900;
  color: white;
  line-height: 1;
}
.logo-desc {
  opacity: 0.7;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  text-decoration: none;
  flex-shrink: 0;
  min-width: 0;
}
/* Logo carré 44px, aligné sur .ld-logo de la landing */
.header-logo {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
}
.header-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-burger {
  display: none;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  border: none;
  border-radius: 10px;
  width: 38px;
  height: 34px;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}
.header-burger:hover {
  background: rgba(255, 255, 255, 0.26);
}

/* ── Navigation desktop ── */
.header-part2 {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  font-size: 1.05rem;
  color: #fff;
}
.header-part2 a {
  padding: 8px 14px;
  text-align: center;
  opacity: 0.75;
  font-weight: 700;
  border-radius: 10px;
  transition: background var(--t), opacity var(--t);
}
.header-part2 a:hover {
  background: rgba(255, 255, 255, 0.18);
  opacity: 1;
}
/* logo 44px + burger : règles plus haut (géométrie landing) */

.header-part3 {
  display: flex;
  gap: 10px;
  color: white;
}
/* ancien bouton secondaire inutilisé supprimé */
.header-part3-link2 {
  padding: 8px 16px;
  background: rgba(255, 92, 92, 0.15);
  border: 1.5px solid rgba(255, 92, 92, 0.4);
  color: #ff9090;
  border-radius: 3rem;
  font-size: 1.3rem;
  font-weight: 800;
  font-family: inherit;
  line-height: 1.1;
  cursor: pointer;
  transition: all ease-out 0.5s;
}
.header-part3-link2:hover {
  background: rgba(255, 92, 92, 0.4);
}

/* ── Bouton déconnexion dans le menu burger (mobile) : masqué en desktop ── */
.logout-mobile {
  display: none;
}

.active {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 10px;
}

/* ── Menu mobile (v-if) : masqué au-dessus de 1024px ── */
.hm-mobile {
  display: none;
}

/* ── Mobile / tablette (≤1024px) : menu replié dans un <nav> séparé ── */
@media (max-width: 1024px) {
  .header-inner {
    padding: 14px 20px;
  }
  .header-part2 {
    display: none;
  }
  .header-part3 {
    display: none;
  }
  .header-burger {
    display: inline-flex;
  }
  .hm-mobile {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    padding: 10px 20px 16px;
    font-size: 1rem;
  }
  .hm-mobile > a {
    text-align: left;
    padding: 11px 12px;
    color: #fff;
    text-decoration: none;
    font-weight: 700;
    opacity: 0.75;
    border-radius: 10px;
  }
  .hm-mobile > a:hover {
    background: rgba(255, 255, 255, 0.18);
    opacity: 1;
  }
  .hm-mobile > a.active {
    background: rgba(255, 255, 255, 0.18);
    opacity: 1;
  }
  .logout-mobile {
    display: block;
    width: 100%;
    margin-top: 8px;
    padding: 11px 12px;
    text-align: left;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 800;
    color: #ff9090;
    background: rgba(255, 92, 92, 0.15);
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }
  .logout-mobile:hover {
    background: rgba(255, 92, 92, 0.4);
    color: #fff;
  }
}

@media (max-width: 640px) {
  #header {
    margin-bottom: 20px;
  }
  .header-inner {
    padding: 12px 16px;
  }
  .logo-title {
    font-size: 1rem;
  }
  .logo-desc {
    font-size: 0.82rem;
  }
  .header-part3-link2 {
    font-size: 0.95rem;
    padding: 7px 13px;
  }
}
/* Débordement 320px : marque contractile + noms longs en ellipse */
#header .header-brand { flex-shrink: 1; }
#header .header-brand-txt { min-width: 0; }
.logo-title, .logo-desc { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
