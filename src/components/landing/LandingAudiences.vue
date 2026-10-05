<script setup>
import { audiences, techList, footerAccess } from '@/data/landingContent.js'
</script>

<template>
  <section id="pour-qui" class="ld-sec" aria-labelledby="t-who">
    <p class="ld-kicker">Destinataires</p>
    <h2 id="t-who">Des espaces adaptés à chaque catégorie d’acteurs</h2>
    <div class="ld-grid4">
      <article v-for="a in audiences" :key="a.role" class="pro-card ld-aud">
        <h3>{{ a.role }}</h3>
        <ul><li v-for="p in a.points" :key="p">{{ p }}</li></ul>
        <div class="ld-aud-links">
          <RouterLink :to="a.login" class="pro-btn pro-btn-primary pro-btn-sm">{{ a.loginLabel }}</RouterLink>
          <RouterLink v-if="a.register" :to="a.register" class="pro-btn pro-btn-ghost pro-btn-sm">Inscription établissement</RouterLink>
        </div>
      </article>
    </div>
  </section>

  <section id="acces" class="ld-sec" aria-labelledby="t-access">
    <div class="pro-card ld-cta-card">
      <div><p class="ld-kicker">Accès aux espaces</p><h2 id="t-access">Un accès sécurisé, selon le profil et les autorisations</h2>
      <p>La consultation de chaque espace nécessite une authentification et un périmètre d’accès autorisé. Les comptes partenaires sont attribués par l’administrateur et ne font l’objet d’aucune inscription publique. L’inscription des établissements demeure accessible depuis cette page.</p></div>
      <div class="ld-cta-btns">
        <RouterLink to="/enseignant/login" class="pro-btn pro-btn-ghost">Connexion enseignant</RouterLink>
        <RouterLink to="/ecole/login" class="pro-btn pro-btn-ghost">Connexion établissement</RouterLink>
        <RouterLink to="/client/login" class="pro-btn pro-btn-ghost">Connexion partenaire</RouterLink>
        <RouterLink to="/ecole/register" class="pro-btn pro-btn-primary">Inscription établissement</RouterLink>
      </div>
    </div>
  </section>

  <footer class="ld-foot">
    <div class="ld-foot-grid">
      <div><p class="ld-foot-brand">Classe Inclusive</p><p>Plateforme numérique au service de l’inclusion scolaire : structuration des informations, accompagnement des acteurs éducatifs et prise en compte des besoins de chaque élève.</p><p class="ld-foot-small">Projet numérique éducatif — page de présentation publique et espaces sécurisés.</p></div>
      <nav aria-label="Pied de page"><p class="ld-foot-t">Sections</p><a href="#plateforme">La plateforme</a><a href="#fonctionnalites">Fonctionnalités</a><a href="#pour-qui">Destinataires</a><a href="#tech">Sécurité et technologies</a></nav>
      <nav aria-label="Accès espaces"><p class="ld-foot-t">Accès aux espaces</p><RouterLink v-for="l in footerAccess" :key="l.href" :to="l.href">{{ l.label }}</RouterLink></nav>
    </div>
    <p class="ld-foot-bar">© {{ new Date().getFullYear() }} Classe Inclusive — Page de présentation publique. La consultation des espaces nécessite une authentification.</p>
  </footer>
</template>

<style scoped>
.ld-sec{max-width:1200px;margin:0 auto;padding:26px 20px;scroll-margin-top:76px}
.ld-kicker{font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--pro-blue);margin-bottom:6px}
h2{font-size:1.6rem;color:var(--pro-ink);letter-spacing:-.02em;margin-bottom:12px}
.ld-grid4{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.ld-aud{padding:18px;display:flex;flex-direction:column;gap:10px}
.ld-aud h3{font-size:1rem}
.ld-aud ul{list-style:none;padding:0;display:flex;flex-direction:column;gap:6px;font-size:.82rem;color:var(--pro-sub)}
.ld-aud li::before{content:'✓ ';color:var(--pro-green);font-weight:900}
.ld-aud-links{display:flex;flex-direction:column;gap:8px;margin-top:auto}
.ld-cta-card{padding:26px;display:grid;grid-template-columns:1.2fr .8fr;gap:18px;align-items:center;background:linear-gradient(160deg,#0f1b3e,#1d2f6e 60%,#6d28d9 130%);color:#fff;border:none}
.ld-cta-card h2,.ld-cta-card .ld-kicker{color:#fff}
.ld-cta-card p{color:rgba(255,255,255,.78);font-size:.88rem;line-height:1.6}
.ld-cta-btns{display:grid;gap:8px}
.ld-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ld-col{padding:20px}.ld-col h3{margin-bottom:8px}.ld-col p{font-size:.85rem;color:var(--pro-sub);line-height:1.65}
.ld-tech{list-style:none;padding:0;display:flex;flex-direction:column;gap:8px}
.ld-tech li{display:flex;flex-direction:column;font-size:.84rem}.ld-tech span{color:var(--pro-muted);font-size:.76rem}
/* Géométrie alignée sur le header Client (#header-client) : pleine largeur,
   aucun max-width, aucune marge auto, padding-inline 28px.
   L'espace au-dessus du footer est conservé (margin-top + padding de #acces).
   En revanche le bas du footer reste collé au bas de l'écran (voir .ld-foot-bar). */
.ld-foot{background:#0f172a;color:#cbd5e1;margin-top:26px}
.ld-foot-grid{padding:30px 28px;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:18px}
.ld-foot-brand{color:#fff;font-weight:900;font-size:1.1rem;margin-bottom:8px}
.ld-foot p{font-size:.82rem;line-height:1.6}
.ld-foot-small{color:#64748b;margin-top:8px}
.ld-foot-t{color:#fff;font-weight:800;font-size:.8rem;margin-bottom:8px;text-transform:uppercase;letter-spacing:.08em}
.ld-foot nav{display:flex;flex-direction:column;gap:6px}
.ld-foot a{color:#cbd5e1;text-decoration:none;font-size:.83rem}
.ld-foot a:hover{color:#fff}
/* margin:0 explicite — le reboot Bootstrap (p{margin-bottom:1rem}, spécificité 0-0-1)
   l'emporte sur le reset universel *{margin:0} (0-0-0) et créait une bande de
   ~16px sous le footer : le footer n'était plus collé au bas de l'écran. */
.ld-foot-bar{margin:0;border-top:1px solid rgba(255,255,255,.08);padding:14px 28px;text-align:center;font-size:.75rem;color:#64748b}
@media(max-width:900px){.ld-grid4,.ld-cols,.ld-cta-card,.ld-foot-grid{grid-template-columns:1fr}}
@media(max-width:480px){
  .ld-sec{padding:20px 20px}
  h2{font-size:1.35rem}
  .ld-aud{padding:16px}
  .ld-cta-card{padding:20px 16px}
  .ld-foot-grid{padding:24px 28px}
}
</style>
