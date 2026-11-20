const AREAS = {
  'Lakeside':  [13.035, 77.600],
  'Old Town':  [12.975, 77.585],
  'Hillcrest': [12.930, 77.625],
  'Harbour':   [12.995, 77.660]
};

function shortPrice(v) {
  if (v >= 1000000) return '$' + (v / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'm';
  return '$' + Math.round(v / 1000) + 'k';
}

const map = L.map('map', { scrollWheelZoom: false }).setView([12.98, 77.61], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

const pins = L.layerGroup().addTo(map);

PROPERTIES.forEach((p) => {
  const center = AREAS[p.location];
  if (!center) return;
  const n = PROPERTIES.filter(x => x.location === p.location).indexOf(p);
  const angle = n * 2.4;
  const dist = 0.006 + (n % 3) * 0.004;
  const icon = L.divIcon({
    className: '',
    html: `<span class="price-pin">${shortPrice(p.price)}</span>`,
    iconSize: [0, 0]
  });
  L.marker([center[0] + Math.sin(angle) * dist, center[1] + Math.cos(angle) * dist], { icon })
    .bindPopup(`<strong>${p.title}</strong><br>${formatPrice(p.price)}<br><a href="property.html?id=${p.id}">View home →</a>`)
    .addTo(pins);
});

document.getElementById('mapCount').textContent =
  PROPERTIES.length + ' homes across four neighborhoods';


  function mixColor(a, b, t) {
  const ca = a.slice(1).match(/../g).map(h => parseInt(h, 16));
  const cb = b.slice(1).match(/../g).map(h => parseInt(h, 16));
  return 'rgb(' + ca.map((c, i) => Math.round(c + (cb[i] - c) * t)).join(',') + ')';
}

const areas = L.layerGroup();
const stats = Object.keys(AREAS).map(name => {
  const list = PROPERTIES.filter(p => p.location === name);
  const avg = list.length ? list.reduce((s, p) => s + p.price, 0) / list.length : 0;
  return { name, count: list.length, avg };
});
const avgs = stats.filter(s => s.count).map(s => s.avg);
const lo = Math.min(...avgs);
const hi = Math.max(...avgs);

stats.forEach(s => {
  const t = hi === lo ? 0.5 : (s.avg - lo) / (hi - lo);
  L.circle(AREAS[s.name], {
    radius: 2600,
    color: '#1F3D2F',
    weight: 2,
    fillColor: s.count ? mixColor('#DDE5D8', '#C8553D', t) : '#cccccc',
    fillOpacity: 0.65
  })
    .bindTooltip(`<strong>${s.name}</strong><br>${s.count ? 'avg ' + shortPrice(s.avg) : 'no homes yet'}`,
      { permanent: true, direction: 'center', className: 'area-tip' })
    .on('click', () => { location.href = 'listings.html?location=' + encodeURIComponent(s.name); })
    .addTo(areas);
});

document.getElementById('mapSwitch').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const showAreas = btn.dataset.mode === 'areas';
  map.removeLayer(showAreas ? pins : areas);
  map.addLayer(showAreas ? areas : pins);
  document.querySelectorAll('#mapSwitch button').forEach(b => b.classList.toggle('active', b === btn));
});