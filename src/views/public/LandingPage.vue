<script setup>
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import LandingHero from '@/components/landing/LandingHero.vue'
import LandingSections from '@/components/landing/LandingSections.vue'
import LandingAudiences from '@/components/landing/LandingAudiences.vue'
</script>

<template>
  <div class="ld-page">
    <LandingNavbar />
    <main id="main">
      <LandingHero />
      <LandingSections />
      <LandingAudiences />
    </main>
  </div>
</template>

<style scoped>
.ld-page{background:#f8fafc;min-height:100vh;font-family:var(--font-b)}
</style>
