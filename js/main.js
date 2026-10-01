/* ===== Property cards, favorites ===== */

const FAV_KEY = 'nestora_favs';
const grid = document.getElementById('propertyGrid');
const emptyNote = document.getElementById('emptyNote');   // only exists on saved.html
const resultCount = document.getElementById('resultCount'); // only exists on listings.html

/* ---- Favorites (saved in the browser) ---- */
function getFavs() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function setFavs(list) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(list));
  } catch (e) { /* storage blocked: ignore */ }
  const counter = document.getElementById('favCount');
  if (counter) counter.textContent = list.length;
}

/* ---- Helpers ---- */
function formatPrice(n) {
  return '$' + n.toLocaleString('en-US');
}

/* Estimated monthly payment: 20% down, 6.5% rate, 30 years */
function monthlyPayment(price) {
  const loan = price * 0.8;
  const r = 0.065 / 12;
  const n = 360;
  return Math.round(loan * r / (1 - Math.pow(1 + r, -n)));
}

/* A small house scene drawn in SVG, colored by the property's palette */
function artHTML(p) {
  if (p.image) {
    return `<img src="${p.image}" alt="${p.title}">`;
  }
  const [top, bottom, ground] = p.palette;
  return `
    <svg class="card-art" viewBox="0 0 300 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky${p.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${top}"/>
          <stop offset="1" stop-color="${bottom}"/>
        </linearGradient>
      </defs>
      <rect width="300" height="360" fill="url(#sky${p.id})"/>
      <circle cx="${p.id % 2 ? 225 : 75}" cy="105" r="36" fill="#F6F0E6" opacity=".85"/>
      <ellipse cx="150" cy="385" rx="270" ry="115" fill="${ground}"/>
      <rect x="95" y="212" width="110" height="86" fill="#F6F0E6"/>
      <polygon points="82,216 150,160 218,216" fill="#C8553D"/>
      <rect x="138" y="252" width="24" height="46" rx="12" fill="${ground}"/>
      <rect x="107" y="232" width="20" height="20" rx="3" fill="${bottom}"/>
      <rect x="173" y="232" width="20" height="20" rx="3" fill="${bottom}"/>
    </svg>`;
}

/* ---- Build one card ---- */
function cardHTML(p, favs) {
  const saved = favs.includes(p.id);
  const vibes = p.vibes.map(v => `<span class="chip">${v}</span>`).join('');
  return `
    <article class="card reveal" data-id="${p.id}">
      <div class="card-arch arch">
        ${artHTML(p)}
        <span class="price-tag">${formatPrice(p.price)}</span>
        <button class="heart ${saved ? 'on' : ''}" data-id="${p.id}"
                aria-label="${saved ? 'Remove from saved' : 'Save this home'}">
          <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
      </div>
      <div class="card-body">
        <p class="card-loc">${p.location} · ${p.type}</p>
        <h3>${p.title}</h3>
        <p class="card-specs">${p.beds} bed · ${p.baths} bath · ${p.area.toLocaleString('en-US')} sq ft</p>
        <div class="chips">${vibes}</div>
        <p class="card-monthly">≈ <strong>${formatPrice(monthlyPayment(p.price))}</strong> / month</p>
      </div>
    </article>`;
}

/* ---- Draw a list of properties into the grid ---- */
function renderGrid(list) {
  const favs = getFavs();
  grid.innerHTML = list.map(p => cardHTML(p, favs)).join('');

  grid.querySelectorAll('.card').forEach((card, i) => {
    card.style.setProperty('--d', (i % 3) * 0.12 + 's');
    window.observeReveal(card);
  });

  if (resultCount) {
    resultCount.textContent = list.length + (list.length === 1 ? ' home found' : ' homes found');
  }
  if (emptyNote) {
    emptyNote.style.display = list.length ? 'none' : 'block';
  }
}

/* ---- Decide which properties this page shows ---- */
function getPageList() {
  const favs = getFavs();
  let list = [...PROPERTIES].sort((a, b) => new Date(b.added) - new Date(a.added));

  if (emptyNote) {                       // saved.html
    return list.filter(p => favs.includes(p.id));
  }
  const limit = parseInt(grid.dataset.limit, 10);   // index.html shows 3
  return limit ? list.slice(0, limit) : list;
}

/* ---- Heart button clicks ---- */
if (grid) {
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.heart');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    let favs = getFavs();
    favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    setFavs(favs);

    if (emptyNote) {
      renderGrid(getPageList());          // saved page: remove the card
    } else {
      btn.classList.toggle('on', favs.includes(id));
      btn.classList.remove('pop');
      void btn.offsetWidth;               // restart the pop animation
      btn.classList.add('pop');
    }
  });

  renderGrid(getPageList());
}