/* ===== Vibe quiz =====
   Uses PROPERTIES (data.js) and cardHTML, getFavs, setFavs (main.js) */

const QUIZ = [
  {
    key: 'morning',
    question: 'Your perfect morning starts with…',
    options: [
      { icon: '☀️', label: 'Sunlight pouring through the windows', value: 'Sunlit mornings' },
      { icon: '☕', label: 'Silent coffee, no traffic in earshot', value: 'Quiet street' },
      { icon: '💻', label: 'Laptop open and a big idea brewing', value: 'Work-from-home ready' },
      { icon: '🐕', label: 'A long walk with my four-legged friend', value: 'Pet friendly' },
      { icon: '🥐', label: 'Setting the table for a friends\' brunch', value: 'Great for hosting' }
    ]
  },
  {
    key: 'weekend',
    question: 'Your ideal weekend is…',
    options: [
      { icon: '🌿', label: 'Slow breakfast on a bright balcony', value: 'Sunlit mornings' },
      { icon: '📚', label: 'A good book and total peace', value: 'Quiet street' },
      { icon: '🛠️', label: 'Working on my side project', value: 'Work-from-home ready' },
      { icon: '🌳', label: 'Park trips with pets or kids', value: 'Pet friendly' },
      { icon: '🍷', label: 'A dinner party with the whole crew', value: 'Great for hosting' }
    ]
  },
  {
    key: 'budget',
    question: 'What budget feels comfortable?',
    options: [
      { icon: '🌱', label: 'Up to $200,000', value: 200000 },
      { icon: '🌼', label: 'Up to $400,000', value: 400000 },
      { icon: '🌳', label: 'Up to $700,000', value: 700000 },
      { icon: '🏔️', label: 'Up to $1,000,000', value: 1000000 },
      { icon: '✨', label: 'Show me everything', value: 0 }
    ]
  },
  {
    key: 'setting',
    question: 'Where do you feel most like yourself?',
    options: [
      { icon: '💧', label: 'By the water, calm and open', value: 'Lakeside' },
      { icon: '🏛️', label: 'Among cafés, markets and history', value: 'Old Town' },
      { icon: '⛰️', label: 'Up high, with views and greenery', value: 'Hillcrest' },
      { icon: '⚓', label: 'Where sea air meets weekend energy', value: 'Harbour' }
    ]
  }
];

const PERSONAS = {
  'Sunlit mornings': ['The Sun Chaser', 'You wake with the light and want a home that does too. Big windows and bright rooms are your love language.'],
  'Quiet street': ['The Calm Seeker', 'Peace is your luxury. You want a home that feels like a deep breath at the end of a long day.'],
  'Work-from-home ready': ['The Quiet Builder', 'Your best ideas happen at home. You need a space that makes focus feel effortless.'],
  'Pet friendly': ['The Nature Lover', 'Muddy paws, open air and green space matter more to you than a fancy lobby.'],
  'Great for hosting': ['The Gracious Host', 'Your home is a stage for good company. Space, flow and a kitchen that everyone gathers in.']
};

const quizRoot = document.getElementById('quizRoot');
let quizStep = 0;
let quizAnswers = {};
let quizLocked = false;

/* ---- One question ---- */
function renderQuizStep() {
  const q = QUIZ[quizStep];
  const dots = QUIZ.map((_, i) =>
    `<i class="${i < quizStep ? 'done' : i === quizStep ? 'now' : ''}"></i>`).join('');

  quizRoot.innerHTML = `
    <div class="quiz-card quiz-step">
      <div class="quiz-progress">${dots}</div>
      <p class="eyebrow">Question ${quizStep + 1} of ${QUIZ.length}</p>
      <h2>${q.question}</h2>
      <div class="quiz-options">
        ${q.options.map((o, i) => `
          <button type="button" class="quiz-option ${quizAnswers[q.key] === o.value ? 'picked' : ''}" data-i="${i}">
            <span class="qo-icon">${o.icon}</span><span>${o.label}</span>
          </button>`).join('')}
      </div>
      ${quizStep > 0 ? '<button type="button" class="quiz-back" id="quizBack">← Back</button>' : ''}
    </div>`;
}

/* ---- Score a home against the answers (max 8 points) ---- */
function scoreHome(p, a) {
  let score = 0;
  const reasons = [];

  [a.morning, a.weekend].forEach(v => {
    if (p.vibes.includes(v)) {
      score += 3;
      if (!reasons.includes(v)) reasons.push(v);
    }
  });

  if (p.location === a.setting) {
    score += 2;
    reasons.push('Located in ' + p.location);
  }
  return { p, score, reasons };
}

/* ---- Results ---- */
function showQuizResults() {
  const a = quizAnswers;
  const [name, blurb] = PERSONAS[a.morning];

  const ranked = PROPERTIES
    .filter(p => !a.budget || p.price <= a.budget)
    .map(p => scoreHome(p, a))
    .sort((x, y) => y.score - x.score || x.p.price - y.p.price)
    .slice(0, 3);

  const favs = getFavs();
  const cards = ranked.map(({ p, score, reasons }) => {
    const pct = Math.round(score / 8 * 100);
    const pill =
      `<p class="match-pill">${score ? pct + '% match' : 'Worth a look'}</p>` +
      `<p class="match-why">${reasons.length ? 'Why it fits: ' + reasons.join(' · ') : 'Fits your budget'}</p>`;
    return cardHTML(p, favs).replace('<p class="card-loc">', pill + '<p class="card-loc">');
  }).join('');

  const params = new URLSearchParams();
  params.set('vibe', a.morning);
  if (a.budget) params.set('budget', a.budget);

  quizRoot.innerHTML = `
    <div class="quiz-result">
      <p class="eyebrow">Your home personality</p>
      <h2>You're <em>${name}</em></h2>
      <p class="hero-sub">${blurb}</p>

      ${ranked.length
        ? `<div class="grid" id="quizGrid">${cards}</div>`
        : '<p class="empty-note">No homes fit that budget yet. Try a higher one.</p>'}

      <div class="hero-actions">
        <button type="button" class="btn btn-primary" id="quizRetake">Retake the quiz</button>
        <a href="listings.html?${params.toString()}" class="btn btn-ghost">See all homes with this vibe</a>
      </div>
    </div>`;

  quizRoot.querySelectorAll('.card').forEach((card, i) => {
    card.style.setProperty('--d', i * 0.15 + 's');
    window.observeReveal(card);
  });

  window.scrollTo({
    top: window.scrollY + quizRoot.getBoundingClientRect().top - 110,
    behavior: 'smooth'
  });
}

/* ---- Clicks: answers, back, retake, hearts ---- */
quizRoot.addEventListener('click', (e) => {
  const opt = e.target.closest('.quiz-option');
  if (opt && !quizLocked) {
    const q = QUIZ[quizStep];
    quizAnswers[q.key] = q.options[Number(opt.dataset.i)].value;
    opt.classList.add('picked');
    quizLocked = true;
    setTimeout(() => {
      quizLocked = false;
      quizStep++;
      if (quizStep < QUIZ.length) renderQuizStep();
      else showQuizResults();
    }, 280);
    return;
  }

  if (e.target.closest('#quizBack')) {
    quizStep = Math.max(0, quizStep - 1);
    renderQuizStep();
    return;
  }

  if (e.target.closest('#quizRetake')) {
    quizStep = 0;
    quizAnswers = {};
    renderQuizStep();
    return;
  }

  const heart = e.target.closest('.heart');
  if (heart) {
    const id = Number(heart.dataset.id);
    let f = getFavs();
    f = f.includes(id) ? f.filter(v => v !== id) : [...f, id];
    setFavs(f);
    heart.classList.toggle('on', f.includes(id));
  }
});

renderQuizStep();