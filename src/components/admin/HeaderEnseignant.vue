<script setup>
import { ref,onMounted } from 'vue';
import { apiDelete,apiGet } from '@/helpers/axiosApi';
import { useRouter } from 'vue-router';

const router = useRouter()
const userLogout = ref()
const getEnseignantAuth = ref()
const mobileOpen = ref(false)

// Liens de navigation partagés entre le menu desktop et le menu mobile burger
const navLinks = [
  { to: '/enseignant/dashboard', label: 'Tableau de bord' },
  { to: '/enseignant/cours', label: 'Mes cours' },
  { to: '/enseignant/quiz', label: 'Mes quiz' },
  { to: '/enseignant/eleve', label: 'Mes Elèves' },
  { to: '/enseignant/profil', label: 'Mon profil' },
  { to: '/enseignant/cours/bilan', label: 'Elèves Bilan' },
]


/* Api logout */

const apiLogoutUser = async () => {
  const response = await apiDelete('enseignant/logout')
  userLogout.value = response.data
  console.log(' userLogout.value: ', userLogout.value)
  localStorage.removeItem("access_token")
  localStorage.removeItem("role")
  router.push("/enseignant/login")
}

const apiGetEnseignantConnect = async () =>{
  const response = await apiGet("/enseignant/getEnseignant")
  getEnseignantAuth.value = response.data
  console.log('getEnseignantAuth.value: ', getEnseignantAuth.value);
}
onMounted(()=>{
  apiGetEnseignantConnect()
})
</script>

<template>
  <header id="header" role="banner">
    <div class="header-inner">
      <RouterLink to="/enseignant/dashboard" class="header-brand" @click="mobileOpen = false">
        <div class="header-logo">
          <img src="@/assets/images/logo_classe_inclusive.png" alt="Logo classe inclusive" />
        </div>
        <div class="header-brand-txt">
          <div class="logo-title">Classe inclusive</div>
          <div class="logo-desc">
            {{ getEnseignantAuth?.data?.name + " " + getEnseignantAuth?.data?.prenom }}
          </div>
        </div>
      </RouterLink>

      <nav class="header-part2" aria-label="Navigation enseignant">
        <RouterLink v-for="l in navLinks" :key="l.to" :to="l.to" active-class="active">{{
          l.label
        }}</RouterLink>
      </nav>

      <div class="header-actions">
        <div class="header-part3">
          <button type="button" class="header-part3-link2" @click="apiLogoutUser">Déconnexion</button>
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

    <nav v-if="mobileOpen" class="hm-mobile" aria-label="Navigation mobile enseignant">
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
  background: linear-gradient(135deg, #0D5F3A 0%, #1A8F5A 100%);
  padding: 0;
  margin-bottom: 32px;
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
  gap: 5px;
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

/* ── Menu mobile (v-if) : masqué au-dessus de 1024px ── */
.hm-mobile {
  display: none;
}

/* ── Bouton déconnexion dans le menu burger (mobile) : masqué en desktop ── */
.logout-mobile {
  display: none;
}

.active {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 10px;
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
