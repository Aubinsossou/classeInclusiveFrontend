<script setup>
import { problemsSolutions, features, steps, previewCards } from '@/data/landingContent.js'
</script>

<template>
  <section id="plateforme" class="ld-sec" aria-labelledby="t-plateforme">
    <p class="ld-kicker">La plateforme</p>
    <h2 id="t-plateforme">Comprendre le contexte et la proposition de Classe Inclusive</h2>
    <div class="ld-cols">
      <div class="pro-card ld-col ld-prob">
        <h3>Contexte observé</h3>
        <article v-for="p in problemsSolutions.problems" :key="p.title"><h4>{{ p.title }}</h4><p>{{ p.text }}</p></article>
      </div>
      <div class="pro-card ld-col ld-sol">
        <h3>Proposition de la plateforme</h3>
        <article v-for="s in problemsSolutions.solutions" :key="s.title"><h4>{{ s.title }}</h4><p>{{ s.text }}</p></article>
      </div>
    </div>
    <ol class="ld-steps">
      <li v-for="s in steps" :key="s.n" class="pro-card"><span>{{ s.n }}</span><h4>{{ s.title }}</h4><p>{{ s.text }}</p></li>
    </ol>
  </section>

  <section id="fonctionnalites" class="ld-sec" aria-labelledby="t-fonc">
    <p class="ld-kicker">Fonctionnalités</p>
    <h2 id="t-fonc">Les capacités mises à disposition des acteurs autorisés</h2>
    <p class="ld-lead">Chaque élément présenté correspond à une fonctionnalité mise en œuvre dans les espaces sécurisés de la plateforme.</p>
    <div class="ld-grid">
      <article v-for="f in features" :key="f.title" class="pro-card pro-card-hover ld-feat">
        <span class="pro-badge pro-badge-blue">{{ f.tag }}</span>
        <h3>{{ f.title }}</h3><p>{{ f.text }}</p>
      </article>
    </div>
  </section>

  <section class="ld-sec" aria-labelledby="t-prev">
    <p class="ld-kicker">Organisation des espaces</p>
    <h2 id="t-prev">Des espaces distincts, des accès encadrés</h2>
    <div class="ld-grid3">
      <article v-for="c in previewCards" :key="c.title" class="pro-card">
        <h3>{{ c.title }}</h3><p>{{ c.text }}</p>
        <RouterLink :to="c.link" class="ld-link">{{ c.linkLabel }} →</RouterLink>
      </article>
    </div>
    <p class="ld-hint">Aucune donnée n’est exposée sur cette page : la consultation des informations nécessite une authentification et un périmètre d’accès autorisé.</p>
  </section>
</template>

<style scoped>
.ld-sec{max-width:1180px;margin:0 auto;padding:26px 20px;scroll-margin-top:76px}
.ld-kicker{font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--pro-blue);margin-bottom:6px}
h2{font-size:1.6rem;color:var(--pro-ink);letter-spacing:-.02em;margin-bottom:6px}
.ld-lead{color:var(--pro-muted);font-size:.88rem;margin-bottom:16px}
.ld-cols{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:16px 0}
.ld-col{padding:20px}
.ld-col h3{margin-bottom:10px;font-size:1rem}
.ld-col article{padding:10px 0;border-top:1px solid #f1f5f9}
.ld-col h4{font-size:.9rem;margin-bottom:4px}
.ld-col p{font-size:.84rem;color:var(--pro-sub);line-height:1.6}
.ld-prob{border-top:4px solid var(--pro-red)}.ld-sol{border-top:4px solid var(--pro-green)}
.ld-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;list-style:none;padding:0;margin-top:6px}
.ld-steps li{padding:18px}
.ld-steps span{font-weight:900;color:var(--pro-violet);font-size:.8rem}
.ld-steps h4{margin:6px 0 4px}.ld-steps p{font-size:.84rem;color:var(--pro-sub)}
.ld-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.ld-feat{padding:18px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.ld-feat h3{font-size:1rem}.ld-feat p{font-size:.84rem;color:var(--pro-sub);line-height:1.6}
.ld-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.ld-grid3 article{padding:18px}.ld-grid3 h3{margin-bottom:6px}.ld-grid3 p{font-size:.85rem;color:var(--pro-sub);margin-bottom:10px}
.ld-link{color:var(--pro-blue);font-weight:800;font-size:.84rem;text-decoration:none}
.ld-link:hover{text-decoration:underline}
.ld-hint{font-size:.76rem;color:var(--pro-muted);margin-top:10px}
@media(max-width:900px){.ld-cols,.ld-grid,.ld-grid3,.ld-steps{grid-template-columns:1fr}}
</style>
