const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('cName').value.trim().replace(/[<>&"]/g, '');
  contactForm.innerHTML = `
    <p class="thanks">Thank you${name ? ', ' + name : ''}! We'll reply within one working day. 🏡</p>
    <a href="listings.html" class="btn btn-primary">Browse homes</a>`;
});