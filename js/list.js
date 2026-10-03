/* ===== List a property: live preview, photo upload, saving =====
   Uses cardHTML from main.js */

const listForm = document.getElementById('listForm');
const previewCard = document.getElementById('previewCard');
const MAX_PHOTOS = 6;
let photos = [];                       // compressed photos (data URLs)

const PALETTES = {
  'Lakeside':  ['#CFDCD3', '#9DB8A6', '#1F3D2F'],
  'Old Town':  ['#EBC9BC', '#E2B866', '#1F3D2F'],
  'Hillcrest': ['#F3D9A4', '#C8553D', '#1F3D2F'],
  'Harbour':   ['#DDE5D8', '#E2B866', '#C8553D']
};

function val(id) {
  return document.getElementById(id).value;
}

/* ---- Build a property object from the form ---- */
function buildHome() {
  const vibes = [...document.querySelectorAll('#lVibes input:checked')].map(i => i.value);
  const location = val('lLocation');
  const title = val('lTitle').trim().replace(/[<>"]/g, '') || 'Your home title';

  return {
    id: 999,
    title: title,
    location: location,
    type: val('lType'),
    price: Number(val('lPrice')) || 0,
    beds: Number(val('lBeds')) || 1,
    baths: Number(val('lBaths')) || 1,
    area: Number(val('lArea')) || 0,
    vibes: vibes,
    palette: PALETTES[location],
    photos: [...photos],
    image: photos[0] || null
  };
}

function drawPreview() {
  previewCard.innerHTML = cardHTML(buildHome(), []);
  previewCard.querySelector('.card').classList.add('in');   // skip the reveal animation
}

/* ---- Photo handling ---- */
const thumbs = document.getElementById('thumbs');
const photoNote = document.getElementById('photoNote');
const dropzone = document.getElementById('dropzone');
const photoInput = document.getElementById('lPhotos');

/* Shrink each photo to max 900px wide/tall so it saves small */
function compress(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(null);
      img.onload = () => {
        const scale = Math.min(1, 900 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function addFiles(fileList) {
  photoNote.textContent = '';
  const files = [...fileList].filter(f => f.type.startsWith('image/'));

  if (!files.length) {
    photoNote.textContent = 'Please choose image files (JPG or PNG).';
    return;
  }

  for (const file of files) {
    if (photos.length >= MAX_PHOTOS) {
      photoNote.textContent = 'You can add up to ' + MAX_PHOTOS + ' photos.';
      break;
    }
    const data = await compress(file);
    if (data) photos.push(data);
  }
  drawThumbs();
  drawPreview();
}

function drawThumbs() {
  thumbs.innerHTML = photos.map((src, i) => `
    <div class="thumb ${i === 0 ? 'is-cover' : ''}">
      <img src="${src}" alt="Uploaded photo ${i + 1}">
      ${i === 0
        ? '<span class="cover-badge">Cover</span>'
        : `<button type="button" class="thumb-cover" data-act="cover" data-i="${i}">Make cover</button>`}
      <button type="button" class="thumb-remove" data-act="remove" data-i="${i}" aria-label="Remove photo">×</button>
    </div>`).join('');
}

if (listForm) {
  /* choose files with the button */
  photoInput.addEventListener('change', () => {
    addFiles(photoInput.files);
    photoInput.value = '';             // lets you pick the same file again later
  });

  /* drag and drop */
  ['dragenter', 'dragover'].forEach(evt =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add('drag');
    }));
  ['dragleave', 'drop'].forEach(evt =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag');
    }));
  dropzone.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));

  /* remove / make cover */
  thumbs.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const i = Number(btn.dataset.i);
    if (btn.dataset.act === 'remove') {
      photos.splice(i, 1);
    } else {
      photos.unshift(photos.splice(i, 1)[0]);
    }
    photoNote.textContent = '';
    drawThumbs();
    drawPreview();
  });

  /* limit vibes to 3 */
  document.getElementById('lVibes').addEventListener('change', (e) => {
    if (document.querySelectorAll('#lVibes input:checked').length > 3) {
      e.target.checked = false;
    }
  });

  listForm.addEventListener('input', drawPreview);
  listForm.addEventListener('change', drawPreview);

  /* ---- Submit: save the listing in this browser ---- */
  listForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const listing = buildHome();
    listing.id = Date.now();
    listing.added = new Date().toISOString().slice(0, 10);
    delete listing.image;              // data.js rebuilds it from photos[0]

    try {
      const saved = JSON.parse(localStorage.getItem('nestora_user_listings') || '[]');
      saved.push(listing);
      localStorage.setItem('nestora_user_listings', JSON.stringify(saved));
    } catch (err) {
      photoNote.textContent = 'Could not save: browser storage is full or blocked. Try fewer photos.';
      return;
    }

    listForm.innerHTML = `
      <p class="thanks">Thank you! Your listing is live on Nestora. 🏡</p>
      <div class="hero-actions">
        <a href="property.html?id=${listing.id}" class="btn btn-primary">View your listing</a>
        <a href="listings.html" class="btn btn-ghost">Browse all homes</a>
      </div>`;
  });

  drawPreview();
}