(function () {
  var THEME_KEY = 'nestora_theme';
  var SET_KEY = 'nestora_settings';
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function settings() {
    try { return JSON.parse(read(SET_KEY) || '{}'); } catch (e) { return {}; }
  }

  function chosen() {
    var s = read(THEME_KEY);
    return s === 'light' || s === 'dark' ? s : 'auto';
  }

  function resolve() {
    var c = chosen();
    return c === 'auto' ? (media.matches ? 'dark' : 'light') : c;
  }

  function paint() {
    var mode = resolve();
    root.setAttribute('data-theme', mode);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = mode === 'dark' ? '#0F1713' : '#F6F0E6';

    var btn = document.getElementById('themeBtn');
    if (btn) btn.setAttribute('aria-pressed', mode === 'dark');
    document.dispatchEvent(new Event('nestora:theme'));
  }

  function setTheme(mode) {
    try {
      if (mode === 'auto') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, mode);
    } catch (e) {}
    root.classList.add('theme-fade');
    paint();
    setTimeout(function () { root.classList.remove('theme-fade'); }, 450);
  }

  function applyPrefs() {
    var s = settings();
    root.setAttribute('data-text', s.text || 'normal');
    root.setAttribute('data-motion', s.motion === 'reduced' ? 'reduced' : 'full');
  }

  applyPrefs();
  paint();

  document.addEventListener('DOMContentLoaded', paint);

  document.addEventListener('click', function (e) {
    if (!e.target.closest('#themeBtn')) return;
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  if (media.addEventListener) {
    media.addEventListener('change', function () {
      if (chosen() === 'auto') paint();
    });
  }

  window.NestoraTheme = { get: chosen, set: setTheme, applyPrefs: applyPrefs };
})();