/* global MATOMO_SITE_ID, MATOMO_TRACKER_URL, MATOMO_ENABLE_LINK_TRACKING */

// Matomo integration. This is mostly a generalized version of the basic matomo
// tracker code you'd insert in a JS page. However, since vuepress is SSR, it
// requires some special workarounds to make sure paq object storage happens
// correctly.
export default ({ router }) => {
  // Don't remove window typeof check, as this what makes sure the SSR parser
  // doesn't error out during builds.
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' &&
      MATOMO_SITE_ID && MATOMO_TRACKER_URL) {
    // We're in SSR space here, meaning that we have to explictly attach _paq to
    // the window in order to store it globally.
    if (window._paq == undefined) {
      window._paq = [];
    }
    // Create convenience variable here, but don't expect it to last. Use
    // window._paq elsewhere when needed, including closure scopes.
    let _paq = window._paq;
    // Tracker methods like "setCustomDimension" should be called before
    // "trackPageView".
    _paq.push(['trackPageView']);
    if (MATOMO_ENABLE_LINK_TRACKING) {
      _paq.push(['enableLinkTracking']);
    }
    (function() {
      var u=MATOMO_TRACKER_URL;
      _paq.push(['setTrackerUrl', u+'piwik.php']);
      _paq.push(['setSiteId', MATOMO_SITE_ID]);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.type='text/javascript';
      g.async=true;
      g.defer=true;
      g.src=u+'piwik.js';
      s.parentNode.insertBefore(g,s);
    })();
    router.afterEach(function (to) {
      // Use window global here, the convenience variable doesn't stick around
      // for some reason.
      window._paq.push(['trackPageView', to.fullPath]);
    });
  }
}