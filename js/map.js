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