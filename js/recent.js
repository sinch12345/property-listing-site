const recentRoot = document.getElementById('recent');

function getRecent() {
  try { return JSON.parse(localStorage.getItem('nestora_recent') || '[]'); } catch (e) { return []; }
}

function drawRecent() {
  const homes = getRecent().map(id => PROPERTIES.find(p => p.id === id)).filter(Boolean);
  recentRoot.hidden = !homes.length;
  if (!homes.length) {
    recentRoot.innerHTML = '';
    return;
  }
  recentRoot.innerHTML = `
    <div class="recent-head">
      <h3>Recently viewed</h3>
      <button type="button" class="clear-link" id="clearRecent">Clear</button>
    </div>
    <div class="recent-row">
      ${homes.map(p => `
        <a class="recent-item" href="property.html?id=${p.id}">
          <div class="arch recent-arch">${artHTML(p)}</div>
          <strong>${p.title}</strong>
          <span>${formatPrice(p.price)}</span>
        </a>`).join('')}
    </div>`;
}

recentRoot.addEventListener('click', (e) => {
  if (!e.target.closest('#clearRecent')) return;
  try { localStorage.removeItem('nestora_recent'); } catch (err) {}
  drawRecent();
});

drawRecent();