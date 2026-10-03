<script setup>
import { heroContent, stackBadges } from '@/data/landingContent.js'
</script>

<template>
  <section class="ld-hero" aria-labelledby="ld-title">
    <div class="ld-hero-grid">
      <div>
        <p class="ld-badge">{{ heroContent.badge }}</p>
        <h1 id="ld-title">{{ heroContent.titleA }}<br /><span>{{ heroContent.titleB }}</span></h1>
        <p class="ld-sub">{{ heroContent.subtitle }}</p>
        <div class="ld-cta">
          <a class="pro-btn pro-btn-primary pro-btn-lg" :href="heroContent.primaryCta.href">{{ heroContent.primaryCta.label }} →</a>
          <a class="pro-btn pro-btn-ghost pro-btn-lg" :href="heroContent.secondaryCta.href">{{ heroContent.secondaryCta.label }}</a>
        </div>
        <p class="ld-note">{{ heroContent.note }}</p>
        <div class="ld-stack" aria-label="Technologies utilisées">
          <span v-for="s in stackBadges" :key="s" class="pro-badge pro-badge-gray">{{ s }}</span>
        </div>
      </div>
      <div class="ld-mock" aria-hidden="true">
        <div class="pro-card ld-mock-card">
          <p class="ld-mock-top"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="ld-mock-url">classe-inclusive · présentation</span></p>
          <div class="ld-mock-row"><span class="pro-badge pro-badge-blue">Espaces</span><strong>Établissement · Enseignant · Partenaire</strong></div>
          <div class="ld-mock-row"><span class="pro-badge pro-badge-green">Contenus</span><strong>Cours · Questionnaires · Suivi</strong></div>
          <div class="ld-mock-row"><span class="pro-badge pro-badge-violet">Accès</span><strong>Réservé aux comptes autorisés</strong></div>
          <p class="ld-mock-cap">Illustration générique — aucune donnée réelle. Les informations et indicateurs sont consultables uniquement après authentification, dans le périmètre autorisé.</p>
        </div>
        <div class="pro-card ld-mock-card ld-mock-small">
          <p class="ld-mock-voice">Navigation vocale · contraste renforcé · sous-titrage</p>
          <p class="ld-mock-cap">Des parcours tenant compte des besoins éducatifs de chaque élève.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ld-hero{max-width:1180px;margin:0 auto;padding:44px 20px 10px}
.ld-hero-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:28px;align-items:start}
.ld-badge{display:inline-block;background:var(--pro-blue-soft);color:var(--pro-blue);border-radius:99px;padding:6px 14px;font-size:.75rem;font-weight:800;margin-bottom:14px}
h1{font-size:2.6rem;line-height:1.08;letter-spacing:-.02em;color:var(--pro-ink);margin-bottom:12px}
h1 span{background:linear-gradient(90deg,#2563eb,#6d28d9);-webkit-background-clip:text;background-clip:text;color:transparent}
.ld-sub{color:var(--pro-sub);font-size:1rem;line-height:1.65;max-width:560px;margin-bottom:18px}
.ld-cta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.ld-note{font-size:.78rem;color:var(--pro-muted);margin-bottom:14px}
.ld-stack{display:flex;gap:6px;flex-wrap:wrap}
.ld-mock{display:flex;flex-direction:column;gap:12px}
.ld-mock-card{padding:18px}
.ld-mock-top{display:flex;align-items:center;gap:6px;margin-bottom:12px}
.dot{width:9px;height:9px;border-radius:50%;background:#e2e8f0;display:inline-block}
.ld-mock-url{margin-left:8px;font-size:.72rem;color:var(--pro-muted);font-weight:700}
.ld-mock-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-top:1px solid #f1f5f9;font-size:.85rem}
.ld-mock-cap{font-size:.72rem;color:var(--pro-muted);margin-top:8px;line-height:1.5}
.ld-mock-small{background:linear-gradient(160deg,#0f1b3e,#1d2f6e 60%,#6d28d9 130%);color:#fff;border:none}
.ld-mock-voice{font-weight:800;margin-bottom:4px}
.ld-mock-small .ld-mock-cap{color:rgba(255,255,255,.7)}
@media(max-width:900px){.ld-hero-grid{grid-template-columns:1fr}h1{font-size:2rem}}
</style>
