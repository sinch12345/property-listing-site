/* ===== Compare page =====
   Uses PROPERTIES (data.js), formatPrice, monthlyPayment, artHTML (main.js)
   and getCompare, setCompare (layout.js) */

const cmpRoot = document.getElementById('compareRoot');

/* Each row: how to read the value, how to show it, and what "best" means */
const CMP_ROWS = [
  { label: 'Price',           get: p => p.price,                                fmt: v => formatPrice(v),                 best: 'min' },
  { label: 'Est. monthly',    get: p => monthlyPayment(p.price),                fmt: v => formatPrice(v) + ' / mo',       best: 'min' },
  { label: 'Price per sq ft', get: p => p.area ? Math.round(p.price / p.area) : 0, fmt: v => '$' + v.toLocaleString('en-US'), best: 'min' },
  { label: 'Bedrooms',        get: p => p.beds,                                 fmt: v => String(v),                      best: 'max' },
  { label: 'Bathrooms',       get: p => p.baths,                                fmt: v => String(v),                      best: 'max' },
  { label: 'Living area',     get: p => p.area,                                 fmt: v => v.toLocaleString('en-US') + ' sq ft', best: 'max' },
  { label: 'Neighborhood',    get: p => p.location,                             fmt: v => v,                              best: null },
  { label: 'Type',            get: p => p.type,                                 fmt: v => v,                              best: null }
];

/* Which columns hold the best value? (none if everyone is equal) */
function cmpBest(values, mode) {
  if (!mode) return [];
  const target = mode === 'min' ? Math.min(...values) : Math.max(...values);
  if (values.every(v => v === target)) return [];
  return values.map((v, i) => (v === target ? i : -1)).filter(i => i >= 0);
}

function renderCompare() {
  const homes = getCompare()
    .map(id => PROPERTIES.find(p => p.id === id))
    .filter(Boolean);

  if (homes.length < 2) {
    cmpRoot.innerHTML = `
      <div class="cmp-empty">
        <h2>Pick at least <em>two</em> homes</h2>
        <p>Tap <strong>+ Compare</strong> on any home and it will show up here.</p>
        <a href="listings.html" class="btn btn-primary">Browse homes</a>
      </div>`;
    return;
  }

  const wins = homes.map(() => 0);

  const rowsHTML = CMP_ROWS.map((row, r) => {
    const values = homes.map(row.get);
    const best = cmpBest(values, row.best);
    best.forEach(i => { wins[i]++; });
    return `
      <div class="cmp-row" style="--d:${0.15 + r * 0.06}s">
        <div class="cmp-label">${row.label}</div>
        ${values.map((v, i) => `
          <div class="cmp-cell ${best.includes(i) ? 'best' : ''}">
            ${row.fmt(v)}
            ${best.includes(i) ? '<span class="best-tag">Best</span>' : ''}
          </div>`).join('')}
      </div>`;
  }).join('');

  const vibesRow = `
    <div class="cmp-row" style="--d:${0.15 + CMP_ROWS.length * 0.06}s">
      <div class="cmp-label">Vibes</div>
      ${homes.map(p => `
        <div class="cmp-cell">
          <div class="chips">${p.vibes.map(v => `<span class="chip">${v}</span>`).join('') || '—'}</div>
        </div>`).join('')}
    </div>`;

  const head = homes.map(p => `
    <div class="cmp-head">
      <div class="arch cmp-arch">${artHTML(p)}</div>
      <h3><a href="property.html?id=${p.id}">${p.title}</a></h3>
      <p>${p.location} · ${p.type}</p>
      <button type="button" class="cmp-remove" data-id="${p.id}">Remove</button>
    </div>`).join('');

  /* verdict */
  const top = Math.max(...wins);
  const leaders = homes.filter((_, i) => wins[i] === top);
  let verdict;
  if (top === 0) {
    verdict = 'These homes are evenly matched. It comes down to the vibe.';
  } else if (leaders.length === 1) {
    verdict = `<strong>${leaders[0].title}</strong> comes out ahead, with the best value in ${top} ${top === 1 ? 'category' : 'categories'}.`;
  } else {
    verdict = `It's close! ${leaders.map(h => `<strong>${h.title}</strong>`).join(' and ')} are neck and neck.`;
  }

  cmpRoot.innerHTML = `
    <p class="cmp-verdict">${verdict}</p>
    <div class="cmp-wrap">
      <div class="cmp-table" style="--n:${homes.length}">
        <div class="cmp-head-row"><div></div>${head}</div>
        ${rowsHTML}
        ${vibesRow}
      </div>
    </div>
    <div class="cmp-actions">
      <button type="button" class="btn btn-ghost" id="cmpClear">Clear comparison</button>
      <a href="listings.html" class="btn btn-primary">Add more homes</a>
    </div>`;
}

cmpRoot.addEventListener('click', (e) => {
  const rm = e.target.closest('.cmp-remove');
  if (rm) {
    setCompare(getCompare().filter(id => id !== Number(rm.dataset.id)));
    renderCompare();
    return;
  }
  if (e.target.closest('#cmpClear')) {
    setCompare([]);
    renderCompare();
  }
});

renderCompare();