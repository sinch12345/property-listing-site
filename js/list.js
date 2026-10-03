/* ===== List a property: live preview =====
   Uses cardHTML and formatPrice from main.js */

const listForm = document.getElementById('listForm');
const previewCard = document.getElementById('previewCard');

const PALETTES = {
  'Lakeside':  ['#CFDCD3', '#9DB8A6', '#1F3D2F'],
  'Old Town':  ['#EBC9BC', '#E2B866', '#1F3D2F'],
  'Hillcrest': ['#F3D9A4', '#C8553D', '#1F3D2F'],
  'Harbour':   ['#DDE5D8', '#E2B866', '#C8553D']
};

function val(id) {
  return document.getElementById(id).value;
}

function drawPreview() {
  const vibes = [...document.querySelectorAll('#lVibes input:checked')].map(i => i.value);
  const location = val('lLocation');

  const home = {
    id: 999,
    title: val('lTitle').trim() || 'Your home title',
    location: location,
    type: val('lType'),
    price: Number(val('lPrice')) || 0,
    beds: Number(val('lBeds')) || 1,
    baths: Number(val('lBaths')) || 1,
    area: Number(val('lArea')) || 0,
    vibes: vibes,
    palette: PALETTES[location],
    image: null
  };

  previewCard.innerHTML = cardHTML(home, []);
  previewCard.querySelector('.card').classList.add('in');   // skip the reveal animation
}

if (listForm) {
  /* limit vibes to 3 */
  document.getElementById('lVibes').addEventListener('change', (e) => {
    if (document.querySelectorAll('#lVibes input:checked').length > 3) {
      e.target.checked = false;
    }
  });

  listForm.addEventListener('input', drawPreview);
  listForm.addEventListener('change', drawPreview);

  listForm.addEventListener('submit', (e) => {
    e.preventDefault();
    listForm.innerHTML = `
      <p class="thanks">Thank you! Your listing is with our team and we'll email you within one working day. 🏡</p>
      <a href="listings.html" class="btn btn-primary">Browse homes</a>`;
  });

  drawPreview();
}