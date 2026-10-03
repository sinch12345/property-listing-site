/* ===== Property detail page =====
   Uses helpers from main.js: getFavs, setFavs, formatPrice, artHTML, cardHTML */

const detailParams = new URLSearchParams(location.search);
const prop = PROPERTIES.find(p => p.id === Number(detailParams.get('id')));
const detailRoot = document.getElementById('detail');

const HOOD = {
  'Lakeside': 'Morning walks and quiet evenings by the water.',
  'Old Town': 'Cafés, markets and streets full of history are on your doorstep.',
  'Hillcrest': 'Space, greenery and city views from above.',
  'Harbour': 'Fresh air, open skies and weekend energy.'
};

const TYPE_FEATURES = {
  Villa:     ['Private garden', 'Covered parking', 'Open-plan kitchen', 'Master suite with dressing room', 'Outdoor dining terrace', 'Smart home wiring'],
  Apartment: ['Balcony', 'Secure entry', 'Built-in wardrobes', 'Modern kitchen', 'Lift access', 'Resident parking'],
  Townhouse: ['Private courtyard', 'Garage', 'Two living areas', 'Fitted kitchen', 'Roof terrace', 'Storage room'],
  Studio:    ['Smart space-saving layout', 'Large window', 'Compact kitchenette', 'Built-in storage', 'Shared rooftop', 'Bike storage']
};

const VIBE_FEATURES = {
  'Sunlit mornings': 'East-facing windows for bright mornings',
  'Quiet street': 'Tucked away from main-road noise',
  'Work-from-home ready': 'Spare corner for a desk, with fast fibre internet',
  'Pet friendly': 'Pets welcome, with green space nearby',
  'Great for hosting': 'Generous living space for guests and dinners'
};

/* ---- Gallery scenes ---- */
function interiorHTML(p) {
  const [top, bottom, ground] = p.palette;
  return `
    <svg class="card-art" viewBox="0 0 300 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="300" height="360" fill="${top}"/>
      <rect y="272" width="300" height="88" fill="${ground}"/>
      <path d="M92 252 V132 a58 58 0 0 1 116 0 V252 Z" fill="${bottom}" stroke="#F6F0E6" stroke-width="7"/>
      <line x1="150" y1="74" x2="150" y2="252" stroke="#F6F0E6" stroke-width="5"/>
      <line x1="92" y1="170" x2="208" y2="170" stroke="#F6F0E6" stroke-width="5"/>
      <circle cx="176" cy="130" r="16" fill="#F6F0E6" opacity=".85"/>
      <rect x="30" y="236" width="150" height="48" rx="16" fill="#F6F0E6"/>
      <rect x="30" y="262" width="150" height="34" rx="12" fill="#E2B866"/>
      <rect x="226" y="262" width="28" height="36" rx="4" fill="#E2B866"/>
      <ellipse cx="240" cy="246" rx="20" ry="10" fill="#1F3D2F" transform="rotate(-25 240 246)"/>
      <ellipse cx="248" cy="238" rx="18" ry="9" fill="#2a5441" transform="rotate(30 248 238)"/>
    </svg>`;
}

function buildScenes(p) {
  /* listings with uploaded photos: use the real photos */
  if (p.photos && p.photos.length) {
    return p.photos.map((src, i) => ({
      label: 'Photo ' + (i + 1),
      html: `<img src="${src}" alt="${p.title}, photo ${i + 1}">`
    }));
  }
  const golden = { ...p, id: p.id + 100, palette: ['#E2B866', '#C8553D', p.palette[2]] };
  return [
    { label: 'Exterior',    html: artHTML(p) },
    { label: 'Golden hour', html: artHTML(golden) },
    { label: 'Living room', html: interiorHTML(p) }
  ];
}

/* ---- Mortgage maths ---- */
function calcPayment(price, downPct, ratePct, years) {
  const loan = price * (1 - downPct / 100);
  const r = ratePct / 100 / 12;
  const n = years * 12;
  const monthly = loan * r / (1 - Math.pow(1 + r, -n));
  return { loan, monthly, totalInterest: monthly * n - loan };
}

/* ---- Page ---- */
function renderDetail(p) {
  document.title = p.title + ' | Nestora';
  const scenes = buildScenes(p);
  const saved = getFavs().includes(p.id);
  const features = [...TYPE_FEATURES[p.type], ...p.vibes.map(v => VIBE_FEATURES[v])];
  const description =
    `${p.title} is a ${p.beds}-bedroom ${p.type.toLowerCase()} with ${p.baths} bathroom${p.baths > 1 ? 's' : ''} ` +
    `and ${p.area.toLocaleString('en-US')} sq ft of living space in ${p.location}. ${HOOD[p.location]} ` +
    `Light, calm and easy to live in, it's a home you can picture your everyday life in.`;

  detailRoot.innerHTML = `
    <a href="listings.html" class="back-link reveal">← Back to all homes</a>

    <div class="detail-top">
      <div class="gallery reveal">
        <div class="arch gallery-main" id="galleryMain">${scenes[0].html}</div>
        <div class="gallery-tabs" id="galleryTabs">
          ${scenes.map((s, i) => `<button type="button" class="vibe-pill ${i === 0 ? 'active' : ''}" data-i="${i}">${s.label}</button>`).join('')}
        </div>
      </div>

      <div class="detail-info reveal" style="--d:.15s">
        <p class="eyebrow">${p.location} · ${p.type}</p>
        <h1>${p.title}</h1>
        <p class="detail-price">${formatPrice(p.price)}</p>
        <p class="detail-monthly">≈ ${formatPrice(monthlyPayment(p.price))} / month</p>

        <div class="spec-row">
          <div><strong>${p.beds}</strong><span>Bedrooms</span></div>
          <div><strong>${p.baths}</strong><span>Bathrooms</span></div>
          <div><strong>${p.area.toLocaleString('en-US')}</strong><span>Sq ft</span></div>
        </div>

        <div class="chips">${p.vibes.map(v => `<span class="chip">${v}</span>`).join('')}</div>

        <div class="hero-actions">
          <a href="#enquire" class="btn btn-primary">Book a viewing</a>
          <button type="button" class="btn btn-ghost" id="saveBtn">${saved ? 'Saved ♥' : 'Save ♡'}</button>
        </div>
      </div>
    </div>

    <div class="detail-about reveal">
      <div>
        <h2>About this home</h2>
        <p>${description}</p>
      </div>
      <div>
        <h3>What's included</h3>
        <ul class="feature-list">${features.map(f => `<li>${f}</li>`).join('')}</ul>
      </div>
    </div>

    <div class="calc reveal">
      <h2>Your monthly <em>cost</em></h2>
      <div class="calc-grid">
        <div class="calc-controls">
          <label>Down payment <output id="oDown"></output>
            <input type="range" id="rDown" min="5" max="50" step="5" value="20"></label>
          <label>Interest rate <output id="oRate"></output>
            <input type="range" id="rRate" min="3" max="10" step="0.1" value="6.5"></label>
          <label>Loan length <output id="oYears"></output>
            <input type="range" id="rYears" min="10" max="30" step="5" value="30"></label>
        </div>
        <div class="calc-result">
          <p class="calc-label">Estimated monthly payment</p>
          <p class="calc-big" id="cMonthly"></p>
          <div class="calc-bar"><span id="cBar"></span></div>
          <div class="calc-rows">
            <p>Loan amount <strong id="cLoan"></strong></p>
            <p>Total interest <strong id="cInterest"></strong></p>
          </div>
          <small>Estimate only. Taxes, insurance and fees are not included.</small>
        </div>
      </div>
    </div>

    <div class="enquire reveal" id="enquire">
      <h2>Love it? Let's <em>talk</em></h2>
      <form id="enquiryForm" class="enquire-form">
        <input type="text" placeholder="Your name" required>
        <input type="email" placeholder="Email address" required>
        <textarea rows="3" placeholder="I'd like to view ${p.title}...">I'd like to book a viewing of ${p.title}.</textarea>
        <button type="submit" class="btn btn-accent">Send enquiry</button>
      </form>
    </div>

    <div class="similar">
      <div class="section-head reveal"><div>
        <p class="eyebrow">Keep looking</p><h2>You might also like</h2>
      </div></div>
      <div class="grid" id="similarGrid"></div>
    </div>
  `;

  /* animate sections in */
  detailRoot.querySelectorAll('.reveal').forEach(el => window.observeReveal(el));

  /* gallery tabs */
  const main = document.getElementById('galleryMain');
  document.getElementById('galleryTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.vibe-pill');
    if (!tab) return;
    document.querySelectorAll('#galleryTabs .vibe-pill').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    main.innerHTML = scenes[Number(tab.dataset.i)].html;
    main.classList.remove('swap');
    void main.offsetWidth;
    main.classList.add('swap');
  });

  /* save button */
  document.getElementById('saveBtn').addEventListener('click', (e) => {
    let favs = getFavs();
    favs = favs.includes(p.id) ? favs.filter(f => f !== p.id) : [...favs, p.id];
    setFavs(favs);
    e.target.textContent = favs.includes(p.id) ? 'Saved ♥' : 'Save ♡';
  });

  /* calculator */
  const rDown = document.getElementById('rDown');
  const rRate = document.getElementById('rRate');
  const rYears = document.getElementById('rYears');

  function updateCalc() {
    const down = Number(rDown.value), rate = Number(rRate.value), years = Number(rYears.value);
    const res = calcPayment(p.price, down, rate, years);
    document.getElementById('oDown').textContent = down + '%  (' + formatPrice(Math.round(p.price * down / 100)) + ')';
    document.getElementById('oRate').textContent = rate.toFixed(1) + '%';
    document.getElementById('oYears').textContent = years + ' years';
    document.getElementById('cMonthly').textContent = formatPrice(Math.round(res.monthly));
    document.getElementById('cLoan').textContent = formatPrice(Math.round(res.loan));
    document.getElementById('cInterest').textContent = formatPrice(Math.round(res.totalInterest));
    document.getElementById('cBar').style.width = (res.loan / (res.loan + res.totalInterest) * 100) + '%';
  }
  [rDown, rRate, rYears].forEach(r => r.addEventListener('input', updateCalc));
  updateCalc();

  /* enquiry form (front-end only) */
  document.getElementById('enquiryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    e.target.outerHTML = '<p class="thanks">Thank you! We\'ll be in touch within one working day. 🏡</p>';
  });

  /* similar homes */
  const favs = getFavs();
  const similar = PROPERTIES
    .filter(x => x.id !== p.id && (x.location === p.location || x.type === p.type))
    .slice(0, 3);
  const sGrid = document.getElementById('similarGrid');
  sGrid.innerHTML = similar.map(x => cardHTML(x, favs)).join('');
  sGrid.querySelectorAll('.card').forEach(c => window.observeReveal(c));
  sGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.heart');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    let f = getFavs();
    f = f.includes(id) ? f.filter(v => v !== id) : [...f, id];
    setFavs(f);
    btn.classList.toggle('on', f.includes(id));
  });
}

if (prop) {
  renderDetail(prop);
} else {
  detailRoot.innerHTML = `
    <h1>We couldn't find that <em>home</em></h1>
    <p class="hero-sub">It may have been sold. <a href="listings.html" class="back-link">Browse all homes →</a></p>`;
}