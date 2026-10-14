/**
 * Sessions factices par rôle — outils/responsive/session.mjs
 *
 * Les routes protégées testent localStorage.access_token + localStorage.role
 * (src/router/index.js:177-219). On injecte donc une session factice AVANT
 * tout script de page (Page.addScriptToEvaluateOnNewDocument).
 *
 * Subtilité : un 401 déclenche un removeItem du token, ce qui viderait la
 * session et ferait mesurer une redirection vers le login au lieu de la page
 * visée. On neutralise donc le retrait des clés de session pendant la mesure.
 *
 * ⚠️ NE PAS injecter 'edu_token' : main.js n'appelle app.mount('#app') QU'APRÈS
 * `await auth.fetchProfile()`, déclenché précisément par la présence de
 * edu_token. Tant que cette promesse ne se résout pas, la page reste vide —
 * écran blanc sans aucune erreur console. Les rôles école/enseignant/client
 * n'en ont pas besoin ; l'espace élève pose ses propres jetons au login.
 */

export const ROLE_KEYS = ['access_token', 'role']

/**
 * Script injecté avant tout script de page.
 * @param {string} role rôle visé, ou '' pour une session vierge
 */
export function buildSessionScript(role) {
  return [
    '(function(){',
    '  var role = __ROLE__;',
    '  try {',
    '    // Une session vierge ne pose AUCUNE clé : en injecter une pour un rôle',
    '    // vide ferait rediriger les pages publiques vers un tableau de bord.',
    '    if (role) {',
    "      localStorage.setItem('access_token','e2e-responsive-fixture');",
    "      localStorage.setItem('role', role);",
    '    }',
    '    // Neutralise le nettoyage de session au 401 : la mesure doit porter',
    '    // sur la page, pas sur la redirection vers le login.',
    '    var rm = Storage.prototype.removeItem;',
    '    Storage.prototype.removeItem = function(k){',
    "      if (k === 'access_token' || k === 'role') return;",
    '      return rm.call(this, k);',
    '    };',
    '    Storage.prototype.clear = function(){};',
    '    // Les boîtes de dialogue bloqueraient la navigation.',
    '    window.confirm = function(){ return true; };',
    '    window.alert = function(){};',
    '  } catch(e){}',
    '})()',
  ]
    .join('\n')
    .replace('__ROLE__', JSON.stringify(role || ''))
}

/**
 * Prépare la session pour un rôle donné.
 * @param {object} driver pilote CDP
 * @param {string} role rôle visé
 */
export async function applySession(driver, role) {
  await driver.send(
    'Page.addScriptToEvaluateOnNewDocument',
    { source: buildSessionScript(role) },
    driver.sessionId
  )
}

export default { buildSessionScript, applySession, ROLE_KEYS }
