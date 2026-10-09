/* ===== Interactive neighborhood map =====
   Uses PROPERTIES (data.js) and formatPrice (main.js) */

const mapSvg = document.getElementById('mapSvg');
const mapPanel = document.getElementById('mapPanel');
const mapLegend = document.getElementById('mapLegend');
const SVG_NS = 'http://www.w3.org/2000/svg';

const MAP_FILLS = {
  'Lakeside':  '#DDE5D8',
  'Old Town':  '#F0DDB0',
  'Hillcrest': '#EBC9BC',
  'Harbour':   '#CFDCD3'
};

const MAP_BLURBS = {
  'Lakeside':  'Morning walks and quiet evenings by the water.',
  'Old Town':  'Cafés, markets and homes with history.',
  'Hillcrest': 'Space, greenery and city views from above.',
  'Harbour':   'Fresh air, open skies and weekend energy.'
};

let mapMode = 'character';
let mapSelected = '';

/* ---- Small helpers ---- */
function shortPrice(v) {
  if (v >= 1000000) return '$' + (v / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'M';
  return '$' + Math.round(v / 1000) + 'k';
}

function mixColor(a, b, t) {
  const ca = a.slice(1).match(/../g).map(h => parseInt(h, 16));
  const cb = b.slice(1).match(/../g).map(h => parseInt(h, 16));
  return 'rgb(' + ca.map((c, i) => Math.round(c + (cb[i] - c) * t)).join(',') + ')';
}

function areaStats(name) {
  const list = PROPERTIES.filter(p => p.location === name);
  if (!list.length) return { list: list, count: 0 };

  const prices = list.map(p => p.price);
  const tally = {};
  list.forEach(p => p.vibes.forEach(v => { tally[v] = (tally[v] || 0) + 1; }));

  return {
    list: list,
    count: list.length,
    avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    min: Math.min(...prices),
    max: Math.max(...prices),
    topVibes: Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0])
  };
}

/* ---- Add pins and sub-labels to each district ---- */
mapSvg.querySelectorAll('.district').forEach(d => {
  const stats = areaStats(d.dataset.area);
  const label = d.querySelector('.map-label');
  const x = Number(label.getAttribute('x'));
  const y = Number(label.getAttribute('y'));

  const sub = document.createElementNS(SVG_NS, 'text');
  sub.setAttribute('class', 'map-sub');
  sub.setAttribute('x', x);
  sub.setAttribute('y', y + 18);
  d.appendChild(sub);

  const shown = Math.min(stats.count, 6);
  for (let i = 0; i < shown; i++) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('transform', 'translate(' + (x + (i - (shown - 1) / 2) * 24) + ',' + (y + 40) + ')');
    const pin = document.createElementNS(SVG_NS, 'path');
    pin.setAttribute('class', 'pin');
    pin.setAttribute('d', 'M-7 9 V-2 a7 7 0 0 1 14 0 V9 Z');
    pin.style.animationDelay = (1 + i * 0.12) + 's';
    g.appendChild(pin);
    d.appendChild(g);
  }
});

/* ---- Character view / Price view ---- */
function applyMapMode() {
  const all = [...mapSvg.querySelectorAll('.district')];
  const avgs = all.map(d => areaStats(d.dataset.area).avg).filter(Boolean);
  const lo = Math.min(...avgs);
  const hi = Math.max(...avgs);

  all.forEach(d => {
    const area = d.dataset.area;
    const stats = areaStats(area);
    const shape = d.querySelector('.shape');
    const sub = d.querySelector('.map-sub');
    let dark = false;

    if (mapMode === 'price') {
      if (stats.count) {
        const t = hi === lo ? 0.5 : (stats.avg - lo) / (hi - lo);
        shape.style.fill = mixColor('#DDE5D8', '#C8553D', t);
        dark = t > 0.6;
        sub.textContent = 'avg ' + shortPrice(stats.avg);
      } else {
        shape.style.fill = '#E8E8E0';
        sub.textContent = 'no homes yet';
      }
    } else {
      shape.style.fill = MAP_FILLS[area];
      sub.textContent = stats.count + (stats.count === 1 ? ' home' : ' homes');
    }
    d.classList.toggle('on-dark', dark);
  });

  mapLegend.classList.toggle('show', mapMode === 'price');
}

/* ---- Side panel ---- */
function drawPanel() {
  if (!mapSelected) {
    mapPanel.innerHTML = `
      <div class="map-hint">
        <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 52V30a14 14 0 0 1 28 0v22z" fill="#C8553D"/><path d="M26 52V34a6 6 0 0 1 12 0v18z" fill="#E2B866"/></svg>
        <h3>Pick a <em>neighborhood</em></h3>
        <p>Tap any district on the map to see what living there is like.</p>
      </div>`;
    return;
  }

  const s = areaStats(mapSelected);
  const link = 'listings.html?location=' + encodeURIComponent(mapSelected);

  if (!s.count) {
    mapPanel.innerHTML = `
      <div class="map-detail">
        <p class="eyebrow">Neighborhood</p>
        <h3>${mapSelected}</h3>
        <p class="map-blurb">${MAP_BLURBS[mapSelected]}</p>
        <p>No homes listed here yet.</p>
      </div>`;
    return;
  }

  mapPanel.innerHTML = `
    <div class="map-detail">
      <p class="eyebrow">Neighborhood</p>
      <h3>${mapSelected}</h3>
      <p class="map-blurb">${MAP_BLURBS[mapSelected]}</p>

      <div class="map-stats">
        <div><strong>${s.count}</strong><span>Homes</span></div>
        <div><strong>${shortPrice(s.avg)}</strong><span>Avg price</span></div>
        <div><strong>${shortPrice(s.min)}</strong><span>From</span></div>
      </div>

      <div class="chips">${s.topVibes.map(v => `<span class="chip">${v}</span>`).join('')}</div>

      <ul class="map-homes">
        ${s.list.map(p => `
          <li><a href="property.html?id=${p.id}">
            <span>${p.title}<small>${p.beds} bed · ${p.type}</small></span>
            <strong>${formatPrice(p.price)}</strong>
          </a></li>`).join('')}
      </ul>

      <a href="${link}" class="btn btn-primary">See all homes in ${mapSelected}</a>
    </div>`;
}

function selectArea(name) {
  mapSelected = name;
  mapSvg.querySelectorAll('.district').forEach(d => {
    d.classList.toggle('sel', d.dataset.area === name);
  });
  drawPanel();

  if (window.innerWidth <= 900) {
    mapPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* ---- Events ---- */
mapSvg.addEventListener('click', (e) => {
  const d = e.target.closest('.district');
  if (d) selectArea(d.dataset.area);
});

mapSvg.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const d = e.target.closest('.district');
  if (d) {
    e.preventDefault();
    selectArea(d.dataset.area);
  }
});

document.getElementById('mapToggle').addEventListener('click', (e) => {
  const btn = e.target.closest('.vibe-pill');
  if (!btn) return;
  mapMode = btn.dataset.mode;
  document.querySelectorAll('#mapToggle .vibe-pill').forEach(b => {
    b.classList.toggle('active', b === btn);
  });
  applyMapMode();
});

applyMapMode();
drawPanel();