/**
 * Métriques de mesure — outils/responsive/probe.mjs
 *
 * L'expression PROBE est évaluée dans la page après rendu. Elle renvoie un
 * objet JSON décrivant :
 *   - le débordement horizontal (scrollWidth vs innerWidth)
 *   - le rognage vertical
 *   - les éléments hors cadre (tag + classe + géométrie)
 *   - le texte tronqué (scrollWidth > clientWidth sur conteneur)
 *   - les cibles tactiles < 44px (boutons/liens visibles)
 *   - les polices < 12px (accessibilité : public enfant/handicap)
 *
 * Volontairement sans dépendance : du JS vanilla, sérialisable en JSON.
 */

export const PROBE = `(function () {
  var de = document.documentElement;
  var vw = window.innerWidth;
  var vh = window.innerHeight;
  var sw = Math.max(de.scrollWidth, document.body ? document.body.scrollWidth : 0);
  var sh = Math.max(de.scrollHeight, document.body ? document.body.scrollHeight : 0);

  var off = [], truncated = [], smallTargets = [], smallFonts = [];
  var all = document.querySelectorAll('body *');

  function visible(el, cs) {
    return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) !== 0;
  }
  function cls(el) {
    var c = el.className;
    if (c && typeof c === 'object' && c.baseVal !== undefined) c = c.baseVal;
    return String(c || '').slice(0, 70);
  }
  /** Sélecteur court et stable, pour retrouver l'élément dans le code. */
  function sel(el) {
    var t = el.tagName.toLowerCase();
    var c = cls(el);
    return c ? t + '.' + c.split(/\\s+/).slice(0, 2).join('.') : t;
  }

  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    var cs = getComputedStyle(el);
    if (!visible(el, cs)) continue;
    var r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    // ── Débordement horizontal ──
    // On ignore les couches décoratives fixes et non interactives : elles
    // débordent volontairement (flous d'arrière-plan) sans impacter la lecture.
    var decorative = cs.position === 'fixed' && cs.pointerEvents === 'none';
    if (!decorative && (r.right > vw + 1 || r.left < -1)) {
      off.push({
        sel: sel(el),
        left: Math.round(r.left),
        right: Math.round(r.right),
        w: Math.round(r.width)
      });
    }

    // ── Texte tronqué ──
    // Contenu plus large que sa boîte, sans mécanisme de défilement :
    // l'information est réellement perdue pour l'utilisateur.
    if (
      el.scrollWidth > el.clientWidth + 1 &&
      cs.overflowX === 'visible' &&
      el.children.length === 0 &&
      (el.textContent || '').trim().length > 0
    ) {
      truncated.push({
        sel: sel(el),
        scrollW: el.scrollWidth,
        clientW: el.clientWidth,
        lost: el.scrollWidth - el.clientWidth
      });
    }

    // ── Cibles tactiles (boutons, liens, champs) ──
    var tag = el.tagName.toLowerCase();
    var role = el.getAttribute('role');
    var interactive =
      tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select' ||
      tag === 'textarea' || role === 'button';
    if (interactive && cs.pointerEvents !== 'none' && cs.position !== 'fixed') {
      if (r.height < 44 || r.width < 24) {
        smallTargets.push({
          sel: sel(el),
          w: Math.round(r.width),
          h: Math.round(r.height)
        });
      }
    }

    // ── Taille de police (accessibilité) ──
    var fs = parseFloat(cs.fontSize);
    if (fs > 0 && fs < 12 && el.children.length === 0 && (el.textContent || '').trim().length > 0) {
      smallFonts.push({ sel: sel(el), px: Math.round(fs * 10) / 10 });
    }
  }

  off.sort(function (a, b) { return b.right - a.right; });
  truncated.sort(function (a, b) { return b.lost - a.lost; });
  smallTargets.sort(function (a, b) { return (a.h - b.h) || (a.w - b.w); });
  smallFonts.sort(function (a, b) { return a.px - b.px; });

  return JSON.stringify({
    vw: vw, vh: vh, sw: sw, sh: sh,
    hOverflow: sw > vw + 1,
    hExcess: Math.max(0, sw - vw),
    vClipped: sh > vh + 1,
    off: off.slice(0, 12),
    offCount: off.length,
    truncated: truncated.slice(0, 8),
    truncatedCount: truncated.length,
    smallTargets: smallTargets.slice(0, 8),
    smallTargetsCount: smallTargets.length,
    smallFonts: smallFonts.slice(0, 8),
    smallFontsCount: smallFonts.length,
    title: document.title || ''
  });
})()`

/** Interprète le résultat JSON du probe en objet exploitable. */
export function parseProbe(json) {
  try {
    return typeof json === 'string' ? JSON.parse(json) : json
  } catch {
    return null
  }
}

export default { PROBE, parseProbe }
