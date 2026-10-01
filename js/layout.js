/* ===== Shared layout: header, footer, page transitions, reveal ===== */

const PAGES = [
  { file: 'index.html',         label: 'Home' },
  { file: 'listings.html',      label: 'Homes' },
  { file: 'neighborhoods.html', label: 'Neighborhoods' },
  { file: 'about.html',         label: 'Why Nestora' },
  { file: 'saved.html',         label: 'Saved' }
];

const current = location.pathname.split('/').pop() || 'index.html';

function savedCount() {
  try {
    return JSON.parse(localStorage.getItem('nestora_favs') || '[]').length;
  } catch (e) {
    return 0;
  }
}

/* ---- Header ---- */
const navLinks = PAGES.map(p => {
  const active = p.file === current ? ' class="active"' : '';
  const count = p.file === 'saved.html'
    ? ` <span class="fav-count" id="favCount">${savedCount()}</span>`
    : '';
  return `<a href="${p.file}"${active}>${p.label}${count}</a>`;
}).join('');

document.body.insertAdjacentHTML('afterbegin', `
  <header class="site-header">
    <a href="index.html" class="logo">Nest<span>ora</span></a>
    <nav class="nav">${navLinks}</nav>
    <a href="#contact" class="btn btn-accent">List a property</a>
  </header>
`);

/* ---- Footer ---- */
document.body.insertAdjacentHTML('beforeend', `
  <footer class="site-footer" id="contact">
    <h2>Ready to find <em>your</em> place?</h2>
    <p>hello@nestora.example &nbsp;·&nbsp; +00 000 000 0000</p>
    <div class="footer-bottom">
      <span>© 2026 Nestora. All rights reserved.</span>
      <span>Built from scratch with HTML, CSS and JavaScript.</span>
    </div>
  </footer>
`);

/* ---- Arch curtain page transition ---- */
const curtain = document.querySelector('.curtain');

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link || !curtain) return;

  const href = link.getAttribute('href');
  const isInternal = link.origin === location.origin;
  const isHashOnly = href.startsWith('#');
  const newTab = link.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey;

  if (!isInternal || isHashOnly || newTab) return;
  if (link.pathname === location.pathname && link.search === location.search) return;

  e.preventDefault();
  curtain.style.animation = 'curtainIn 0.55s cubic-bezier(.7,0,.3,1) forwards';
  setTimeout(() => { location.href = link.href; }, 560);
});

/* Back/forward button: make sure the curtain is not stuck covering the page */
window.addEventListener('pageshow', (e) => {
  if (e.persisted && curtain) {
    curtain.style.animation = 'curtainOut 0.8s cubic-bezier(.7,0,.3,1) forwards';
  }
});

/* ---- Scroll reveal ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* Later, cards created by JavaScript will call this to animate in too */
window.observeReveal = (el) => revealObserver.observe(el);