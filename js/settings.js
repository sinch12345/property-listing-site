const SET_KEY = 'nestora_settings';
const DATA_KEYS = {
  favs: 'nestora_favs',
  compare: 'nestora_compare',
  listings: 'nestora_user_listings'
};

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SET_KEY) || '{}'); } catch (e) { return {}; }
}

function saveSettings(s) {
  try { localStorage.setItem(SET_KEY, JSON.stringify(s)); } catch (e) {}
  window.NestoraTheme.applyPrefs();
}

function countOf(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]').length; } catch (e) { return 0; }
}

function plural(n, one, many) {
  return n + ' ' + (n === 1 ? one : many);
}

let toastTimer;
function toast(msg) {
  const el = document.getElementById('setToast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

function markSeg(group, value) {
  document.querySelectorAll('.seg[data-group="' + group + '"] button').forEach(b => {
    b.setAttribute('aria-checked', b.dataset.value === value);
  });
}

function drawCounts() {
  document.getElementById('cntFavs').textContent = plural(countOf(DATA_KEYS.favs), 'home saved', 'homes saved');
  document.getElementById('cntCompare').textContent = plural(countOf(DATA_KEYS.compare), 'home picked', 'homes picked');
  document.getElementById('cntListings').textContent = plural(countOf(DATA_KEYS.listings), 'listing', 'listings');
}

function syncSettings() {
  const s = loadSettings();
  markSeg('theme', window.NestoraTheme.get());
  markSeg('text', s.text || 'normal');
  document.getElementById('optMotion').checked = s.motion === 'reduced';
  drawCounts();
}

document.querySelectorAll('.seg').forEach(seg => {
  seg.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (seg.dataset.group === 'theme') {
      window.NestoraTheme.set(btn.dataset.value);
    } else {
      const s = loadSettings();
      s.text = btn.dataset.value;
      saveSettings(s);
    }
    syncSettings();
    toast('Saved');
  });
});

document.getElementById('optMotion').addEventListener('change', (e) => {
  const s = loadSettings();
  s.motion = e.target.checked ? 'reduced' : 'full';
  saveSettings(s);
  toast(e.target.checked ? 'Animations reduced' : 'Animations on');
});

const CLEARERS = {
  favs: () => {
    try { localStorage.removeItem(DATA_KEYS.favs); } catch (e) {}
    const counter = document.getElementById('favCount');
    if (counter) counter.textContent = 0;
  },
  compare: () => setCompare([]),
  listings: () => {
    try { localStorage.removeItem(DATA_KEYS.listings); } catch (e) {}
  }
};

const CLEAR_LABELS = { favs: 'Clear', compare: 'Clear', listings: 'Delete' };

document.querySelectorAll('[data-clear]').forEach(btn => {
  const kind = btn.dataset.clear;
  let timer;

  const disarm = () => {
    clearTimeout(timer);
    btn.classList.remove('armed');
    btn.textContent = CLEAR_LABELS[kind];
  };

  btn.addEventListener('click', () => {
    if (!btn.classList.contains('armed')) {
      btn.classList.add('armed');
      btn.textContent = 'Tap again to confirm';
      timer = setTimeout(disarm, 3000);
      return;
    }
    CLEARERS[kind]();
    disarm();
    drawCounts();
    toast('Done');
  });
});

document.getElementById('resetSettings').addEventListener('click', () => {
  try { localStorage.removeItem(SET_KEY); } catch (e) {}
  window.NestoraTheme.set('auto');
  window.NestoraTheme.applyPrefs();
  syncSettings();
  toast('Settings reset');
});

document.addEventListener('nestora:theme', syncSettings);
window.addEventListener('storage', syncSettings);
syncSettings();