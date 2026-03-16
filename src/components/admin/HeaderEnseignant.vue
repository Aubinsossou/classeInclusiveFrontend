<script setup>
import { ref,onMounted } from 'vue';
import { apiDelete,apiGet } from '@/helpers/axiosApi';
import { useRouter } from 'vue-router';

const router = useRouter()
const userLogout = ref()
const getEnseignantAuth = ref()


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
  <header id="header" >
    <a href="/enseignant/dashboard" style=" display:flex; align-items:center">
      <div style="width: 130px; display:flex; align-items:center">
        <img src="@/assets/images/logo_classe_inclusive.png" alt="Logo classe inclusive" style="width: 100%" />
      </div>
      <div>
        <div
          class="logo-title"
          style="font-weight: 900; font-family: 'Baloo 2', cursive; font-size: 1.4rem"
        >
          Classe inclusive
        </div>
        <div class="logo-desc">{{ getEnseignantAuth?.data?.name + " " + getEnseignantAuth?.data?.prenom }}</div>
      </div>
    </a>

    <div class="header-part2">
      <div>
        <span></span><router-link to="/enseignant/dashboard" active-class="active" class="header-part2-link1">Tableau de bord</router-link>
      </div>
      <div><span></span><router-link to="/enseignant/cours" active-class="active" class="header-part2-link2">Mes cours</router-link></div>
      <div><span></span><router-link to="/enseignant/quiz" active-class="active" class="header-part2-link3">Mes quiz</router-link></div>
      <div><span></span><router-link to="/enseignant/eleve" active-class="active" class="header-part2-link4"> Mes Elèves</router-link></div>
    </div>
    <div class="header-part3">
      <div class="header-part3-link2" @click="apiLogoutUser">Deconnexion</div>
    </div>
  </header>
</template>

<style scoped>
#header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #0D5F3A 0%, #1A8F5A 100%);
  height: 70px;

  padding: 40px ;
  margin-bottom: 50px;
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

.header-part2 {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  gap: 6px;
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
</style>
