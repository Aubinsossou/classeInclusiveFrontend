<script setup>
/**
 * ResponsiveTable — composant générique pour tableaux responsives.
 *
 * Deux stratégies selon le nombre de colonnes :
 *  - mode "cards" (< 5 colonnes par défaut) : chaque ligne devient une
 *    carte empilée sous 768px, avec le libellé de la colonne au-dessus
 *    de chaque valeur.
 *  - mode "scroll" (>= 5 colonnes) : conteneur overflow-x: auto avec
 *    première colonne sticky (position: sticky; left: 0).
 *
 * Utilisation :
 *   <ResponsiveTable :columns="['Nom','Code','Statut']" mode="cards">
 *     <template #default="{ row }"> ... </template>
 *   </ResponsiveTable>
 *
 * Ou pour un tableau statique (slot) :
 *   <ResponsiveTable :columns="labels" mode="scroll">
 *     <table class="pro-table"> ... </table>
 *   </ResponsiveTable>
 */
import { computed } from 'vue'

const props = defineProps({
  /** Libellés des colonnes (utilisés en mode cards pour les <dt>). */
  columns: { type: Array, default: () => [] },
  /** 'auto' (défaut), 'cards' ou 'scroll'. */
  mode: { type: String, default: 'auto' },
  /** Largeur minimale du tableau en mode scroll (px). */
  minWidth: { type: Number, default: 560 },
  /** Sous ce nombre de colonnes, auto → cards. */
  cardsThreshold: { type: Number, default: 5 },
  /** Lignes à afficher (mode cards). */
  rows: { type: Array, default: () => [] },
})

const resolvedMode = computed(() => {
  if (props.mode !== 'auto') return props.mode
  return props.columns.length < props.cardsThreshold ? 'cards' : 'scroll'
})

const isCards = computed(() => resolvedMode.value === 'cards')
</script>

<template>
  <!-- ── MODE CARDES (< 768px) ── -->
  <div v-if="isCards" class="rt-cards">
    <div v-if="$slots.default && !rows.length" class="rt-slot-table">
      <slot />
    </div>
    <template v-else>
      <article v-for="(row, i) in rows" :key="row.id ?? i" class="rt-card">
        <dl class="rt-card-dl">
          <template v-for="(col, j) in columns" :key="j">
            <dt class="rt-card-dt">{{ col }}</dt>
            <dd class="rt-card-dd">
              <slot name="cell" :row="row" :col="col" :index="j" />
            </dd>
          </template>
        </dl>
      </article>
    </template>
  </div>

  <!-- ── MODE DÉFILEMENT (desktop & >= 768px, ou forcé) ── -->
  <div
    v-else
    class="pro-table-wrap rt-scroll"
    :style="{ '--rt-min': minWidth + 'px' }"
  >
    <slot />
  </div>
</template>

<style scoped>
/* ── Mode cartes ── */
.rt-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rt-slot-table {
  /* Quand on passe un tableau statique en mode cards, on le rend tel quel ;
     le parent peut appliquer ses propres styles responsive. */
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.rt-card {
  background: var(--pro-card, #fff);
  border: 1px solid var(--pro-border, rgba(15, 23, 42, 0.08));
  border-radius: var(--pro-r-lg, 16px);
  box-shadow: var(--pro-shadow-md, 0 1px 3px rgba(0, 0, 0, 0.06));
  padding: 14px 16px;
}
.rt-card-dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 14px;
  margin: 0;
}
.rt-card-dt {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--pro-muted, #94a3b8);
  white-space: nowrap;
  align-self: center;
}
.rt-card-dd {
  margin: 0;
  font-size: 0.85rem;
  color: var(--pro-ink, #0f172a);
  min-width: 0;
  overflow-wrap: break-word;
  align-self: center;
}

/* ── Mode défilement ── */
.rt-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.rt-scroll :deep(.pro-table) {
  min-width: var(--rt-min, 560px);
}
/* Première colonne collante */
.rt-scroll :deep(.pro-table th:first-child),
.rt-scroll :deep(.pro-table td:first-child) {
  position: sticky;
  left: 0;
  z-index: 1;
  background: #fff;
}
.rt-scroll :deep(.pro-table th:first-child) {
  background: #f8fafc;
  z-index: 2;
}
.rt-scroll :deep(.pro-table tr:hover td:first-child) {
  background: #fafcff;
}
/* Ombre subtile pour indiquer le défilement */
.rt-scroll {
  position: relative;
}
.rt-scroll::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 24px;
  pointer-events: none;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.9));
  opacity: 0;
  transition: opacity 0.2s;
}
.rt-scroll:hover::after {
  opacity: 1;
}

/* ── Accessibilité : réduire le mouvement si demandé ── */
@media (prefers-reduced-motion: reduce) {
  .rt-scroll::after {
    transition: none;
  }
}
</style>
