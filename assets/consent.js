/* ChiffreClair — bandeau de consentement (RGPD)
   Le Consent Mode v2 est pose en refus par defaut dans le <head> de chaque page.
   Ce script est la seule chose qui peut le passer a "accorde".
   Choix memorise 6 mois dans localStorage. Aucun cookie depose par ce script. */
(function () {
  var CLE = 'cc_consent_v1';
  var DUREE = 182 * 24 * 60 * 60 * 1000; // 6 mois

  function gtagSafe() {
    if (typeof window.gtag === 'function') window.gtag.apply(null, arguments);
  }

  function appliquer(accepte) {
    var v = accepte ? 'granted' : 'denied';
    gtagSafe('consent', 'update', {
      'ad_storage': v,
      'ad_user_data': v,
      'ad_personalization': v,
      'analytics_storage': v
    });
  }

  function lire() {
    try {
      var brut = localStorage.getItem(CLE);
      if (!brut) return null;
      var o = JSON.parse(brut);
      if (!o || typeof o.accepte !== 'boolean') return null;
      if (Date.now() - o.date > DUREE) return null; // expire : on redemande
      return o.accepte;
    } catch (e) { return null; }
  }

  function ecrire(accepte) {
    try {
      localStorage.setItem(CLE, JSON.stringify({ accepte: accepte, date: Date.now() }));
    } catch (e) { /* navigation privee : on n'insiste pas */ }
  }

  var choix = lire();
  if (choix !== null) { appliquer(choix); return; }

  // --- Aucun choix enregistre : on affiche le bandeau ---
  var css = document.createElement('style');
  css.textContent =
    '#cc-consent{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#111827;color:#E8ECF3;' +
    'padding:18px 20px;box-shadow:0 -4px 24px rgba(0,0,0,.35);font-size:.92rem;line-height:1.5}' +
    '#cc-consent .cc-in{max-width:1040px;margin:0 auto;display:flex;gap:18px;align-items:center;flex-wrap:wrap}' +
    '#cc-consent p{margin:0;flex:1 1 320px}' +
    '#cc-consent a{color:#93C5FD;text-decoration:underline}' +
    '#cc-consent .cc-btns{display:flex;gap:10px;flex:0 0 auto}' +
    '#cc-consent button{font:inherit;font-weight:600;padding:11px 20px;border-radius:8px;cursor:pointer;border:1px solid transparent}' +
    '#cc-oui{background:#2563EB;color:#fff}' +
    '#cc-oui:hover{background:#1D4ED8}' +
    '#cc-non{background:transparent;color:#E8ECF3;border-color:#4B5563}' +
    '#cc-non:hover{background:#1F2937}' +
    '@media(max-width:640px){#cc-consent .cc-btns{width:100%}#cc-consent button{flex:1}}';
  document.head.appendChild(css);

  var barre = document.createElement('div');
  barre.id = 'cc-consent';
  barre.setAttribute('role', 'dialog');
  barre.setAttribute('aria-label', 'Consentement aux cookies');
  barre.innerHTML =
    '<div class="cc-in">' +
    '<p>Nous utilisons des cookies de <strong>mesure d\'audience</strong> pour comprendre comment le site est trouvé et améliorer nos calculateurs. ' +
    'Rien n\'est déposé sans votre accord, et les montants que vous saisissez ne sortent jamais de votre navigateur. ' +
    '<a href="confidentialite.html">En savoir plus</a>.</p>' +
    '<div class="cc-btns">' +
    '<button type="button" id="cc-non">Refuser</button>' +
    '<button type="button" id="cc-oui">Accepter</button>' +
    '</div></div>';

  function poser() {
    document.body.appendChild(barre);
    document.getElementById('cc-oui').addEventListener('click', function () {
      ecrire(true); appliquer(true); barre.remove();
    });
    document.getElementById('cc-non').addEventListener('click', function () {
      ecrire(false); appliquer(false); barre.remove();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', poser);
  } else {
    poser();
  }
})();
