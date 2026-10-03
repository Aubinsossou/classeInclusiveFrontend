<script setup>
import { ref,onMounted } from 'vue';
import { apiDelete, apiGet } from '@/helpers/axiosApi';
import { useRouter } from 'vue-router';

const router = useRouter()

/* Menu mobile */
const mobileOpen = ref(false)

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
  await apiGetUser()
})

</script>

<template>
  <header id="header">
    <RouterLink to="/ecole/dashboard" class="header-brand" @click="mobileOpen = false">
      <div class="header-logo">
        <img src="@/assets/images/logo_classe_inclusive.png" alt="Logo classe inclusive" />
      </div>
      <div>
        <div class="logo-title">Classe inclusive</div>
        <div class="logo-desc">{{ userAuth?.data?.name ?? role }}</div>
      </div>
    </RouterLink>

    <button
      class="header-burger"
      type="button"
      :aria-expanded="mobileOpen"
      aria-label="Ouvrir le menu de navigation"
      @click="mobileOpen = !mobileOpen"
    >
      ☰
    </button>

    <nav class="header-part2" :class="{ open: mobileOpen }" aria-label="Navigation établissement">
      <RouterLink to="/ecole/dashboard" active-class="active" @click="mobileOpen = false"
        >Tableau de bord</RouterLink
      >
      <RouterLink to="/ecole/enseignant" active-class="active" @click="mobileOpen = false"
        >Enseignant</RouterLink
      >
      <RouterLink to="/ecole/classe" active-class="active" @click="mobileOpen = false"
        >Classes</RouterLink
      >
      <RouterLink to="/ecole/matiere" active-class="active" @click="mobileOpen = false"
        >Matières</RouterLink
      >
      <RouterLink to="/ecole/eleve" active-class="active" @click="mobileOpen = false"
        >Elèves</RouterLink
      >
    </nav>

    <div class="header-part3">
      <button type="button" class="header-part3-link2" @click="apiLogoutUser()">
        Déconnexion
      </button>
    </div>
  </header>
</template>

<style scoped>
#header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  background: linear-gradient(135deg, #1a2b5e 0%, #2e4080 100%);
  padding: 16px 28px;
  margin-bottom: 32px;
  font-weight: 600;
  font-family: "Baloo 2", cursive;
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
.header-logo {
  width: 110px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.header-logo img {
  width: 100%;
  height: auto;
}
.header-burger {
  display: none;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
}
.header-burger:hover {
  background: rgba(255, 255, 255, 0.26);
}

.header-part2 {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  font-size: 1.05rem;
  color: #fff;
  
}
.header-part2-link1 {
  padding: 8px 14px;
  opacity: 0.7;
  text-align: center;
  font-weight: 700;
  transition: all ease 3s;
}
.header-part2-link1:hover {
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  opacity: 1;
  text-align: center;
}
.header-part2-link2 {
  padding: 8px 14px;
  text-align: center;
  opacity: 0.7;
}
.header-part2-link2:hover {
  background: rgba(255, 255, 255, 0.18);
  opacity: 1;
  border-radius: 10px;
  text-align: center;
}
.header-part2-link3 {
  padding: 8px 14px;
  text-align: center;
  opacity: 0.7;
}
.header-part2-link3:hover {
  background: rgba(255, 255, 255, 0.18);
  opacity: 1;
  border-radius: 10px;
  text-align: center;
}

.header-part2-link4 {
  padding: 8px 14px;
  text-align: center;
  opacity: 0.7;
}
.header-part2-link4:hover {
  background: rgba(255, 255, 255, 0.18);
  opacity: 1;
  border-radius: 10px;
  text-align: center;
}
.header-part2-link5 {
  padding: 8px 14px;
  text-align: center;
  opacity: 0.7;
}
.header-part2-link5:hover {
  background: rgba(255, 255, 255, 0.18);
  padding: 8px 14px;
  border-radius: 15px;
  text-align: center;
  opacity: 1;
}

.header-part3 {
  display: flex;
  gap: 10px;
  color: white;
}
.header-part3-link1 {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.18);
  border: 1.5px solid (255, 255, 255, 0.18);
  color: #fff;
  border-radius: 3rem;
  font-size: 1.3rem;
  font-weight: 800;
  cursor: pointer;
  transition: all ease-out 0.5s;
}
.header-part3-link1:hover {
}
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

.active {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 10px;
}

/* ── Liens de navigation ── */
.header-part2 a {
  padding: 8px 14px;
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  opacity: 0.75;
  text-align: center;
  border-radius: 10px;
  transition: background var(--t), opacity var(--t);
}
.header-part2 a:hover {
  background: rgba(255, 255, 255, 0.18);
  opacity: 1;
}

/* ── Mobile / tablette : navigation repliée dans un menu déroulant ── */
@media (max-width: 980px) {
  #header {
    padding: 14px 20px;
  }
  .header-logo {
    width: 66px;
  }
  .logo-title {
    font-size: 1.12rem;
  }
  .logo-desc {
    font-size: 0.82rem;
  }
  .header-burger {
    display: inline-flex;
    order: 3;
  }
  .header-brand {
    order: 1;
  }
  .header-part3 {
    order: 2;
    margin-left: auto;
  }
  .header-part2 {
    display: none;
    order: 4;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    font-size: 1rem;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.14);
  }
  .header-part2.open {
    display: flex;
  }
  .header-part2 a {
    text-align: left;
    padding: 11px 12px;
  }
}

@media (max-width: 600px) {
  #header {
    padding: 12px 16px;
    margin-bottom: 20px;
    gap: 10px;
  }
  .header-logo {
    width: 52px;
  }
  .logo-title {
    font-size: 1rem;
  }
  .header-part3-link2 {
    font-size: 0.95rem;
    padding: 7px 13px;
  }
}
</style>
