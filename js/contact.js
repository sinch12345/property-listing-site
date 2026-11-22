const contactForm = document.getElementById('contactForm');
const contactBtn = contactForm.querySelector('button[type="submit"]');
const contactError = document.getElementById('contactError');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  contactError.textContent = '';
  contactBtn.disabled = true;
  contactBtn.textContent = 'Sending…';

  const res = await apiPost('/api/contact', {
    name: document.getElementById('cName').value,
    email: document.getElementById('cEmail').value,
    topic: document.getElementById('cTopic').value,
    message: document.getElementById('cMsg').value
  });

  if (!res.ok) {
    contactError.textContent = apiErrorText(res.data);
    contactBtn.disabled = false;
    contactBtn.textContent = 'Send message';
    return;
  }

  contactForm.innerHTML = `
    <p class="thanks"></p>
    <a href="listings.html" class="btn btn-primary">Browse homes</a>`;
  contactForm.querySelector('.thanks').textContent = res.data.message + ' 🏡';
});