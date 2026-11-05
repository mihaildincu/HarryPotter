const grid = document.getElementById('grid');
const searchInput = document.getElementById('search');
const countEl = document.getElementById('count');
const emptyEl = document.getElementById('empty');
const onlyFavEl = document.getElementById('onlyFav');
const onlyUnforgivableEl = document.getElementById('onlyUnforgivable');
const installBtn = document.getElementById('installBtn');
const offlineBadge = document.getElementById('offlineBadge');

function findItalianVoice() {
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    // exact vocea preferata
    let v = voices.find((x) => (x.name || '').toLowerCase().includes('google italiano'));
    if (v) return v;
    v = voices.find((x) => (x.lang || '').toLowerCase() === 'it-it');
    if (v) return v;
    v = voices.find((x) => (x.lang || '').toLowerCase().startsWith('it'));
    return v || null;
  } catch { return null; }
}

function findRomanianVoice() {
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    return voices.find((x) => (x.lang || '').toLowerCase().startsWith('ro')) || null;
  } catch { return null; }
}

const FAV_KEY = 'hp-spells-fav-v1';
let favorites = new Set();
try {
  favorites = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
} catch { favorites = new Set(); }

function saveFav() {
  localStorage.setItem(FAV_KEY, JSON.stringify([...favorites]));
}

function normalize(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getSpells() {
  if (Array.isArray(window.SPELLS)) return window.SPELLS;
  try {
    if (typeof SPELLS !== 'undefined' && Array.isArray(SPELLS)) return SPELLS;
  } catch {}
  return [];
}

function slugify(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function imgFor(spell) {
  return 'images/' + slugify(spell) + '.svg';
}

function speakSpell(spell, descRo) {
  try {
    if (!('speechSynthesis' in window)) {
      alert('Browserul nu suportă citirea cu voce.');
      return;
    }
    window.speechSynthesis.cancel();
    const itVoice = findItalianVoice();
    const roVoice = findRomanianVoice();
    const u1 = new SpeechSynthesisUtterance(spell);
    if (itVoice) {
      u1.voice = itVoice;
      u1.lang = itVoice.lang;
    } else {
      u1.lang = 'it-IT';
    }
    u1.rate = 0.85;
    u1.pitch = 1;
    window.speechSynthesis.speak(u1);
    if (descRo) {
      const u2 = new SpeechSynthesisUtterance(descRo);
      if (roVoice) {
        u2.voice = roVoice;
        u2.lang = roVoice.lang;
      } else if (itVoice) {
        // Italiana aproximeaza bine romana (5 vocale pure), engleza default nu
        u2.voice = itVoice;
        u2.lang = 'ro-RO';
      } else {
        u2.lang = 'ro-RO';
      }
      u2.rate = 1;
      u2.pitch = 1;
      window.speechSynthesis.speak(u2);
    }
  } catch {}
}

function render() {
  const q = normalize(searchInput.value.trim());
  const onlyFav = onlyFavEl.checked;
  const onlyUnf = onlyUnforgivableEl.checked;

  const all = getSpells();
  const list = all.filter((s) => {
    if (onlyFav && !favorites.has(s.spell)) return false;
    if (onlyUnf && !s.unforgivable) return false;
    if (!q) return true;
    return normalize(s.spell).includes(q) || normalize(s.use_ro).includes(q) || normalize(s.use_en).includes(q);
  });

  countEl.textContent = `${list.length} din ${all.length} vrăji`;
  emptyEl.hidden = list.length !== 0;
  grid.innerHTML = '';

  for (const s of list) {
    const card = document.createElement('article');
    card.className = 'card' + (s.unforgivable ? ' unforgivable' : '');

    const img = document.createElement('img');
    img.className = 'spell-img clickable';
    img.src = imgFor(s.spell);
    img.alt = 'Ilustrație pentru vraja ' + s.spell;
    img.loading = 'lazy';
    img.title = 'Click pentru a asculta: ' + s.spell;
    img.onerror = () => { img.onerror = null; img.src = 'icons/icon-192.svg'; };
    img.onclick = () => speakSpell(s.spell, s.use_ro);

    const h = document.createElement('h2');
    h.className = 'clickable';
    h.textContent = '✨ ' + s.spell;
    h.title = 'Click pentru a asculta';
    h.onclick = () => speakSpell(s.spell, s.use_ro);

    const ro = document.createElement('p');
    ro.textContent = s.use_ro;

    const en = document.createElement('small');
    en.textContent = s.use_en;

    const charRow = document.createElement('div');
    charRow.className = 'char-row';
    try {
      const ch = (typeof charForSpell === 'function') ? charForSpell(s.spell) : null;
      if (ch) {
        const av = document.createElement('img');
        av.className = 'char-avatar';
        av.src = 'images/chars/' + ch.slug + '.svg';
        av.alt = ch.name;
        av.loading = 'lazy';
        av.onerror = () => { av.style.display = 'none'; };
        const nm = document.createElement('span');
        nm.textContent = '🧙 ' + ch.name;
        charRow.append(av, nm);
      }
    } catch {}

    const row = document.createElement('div');
    row.className = 'card-row';

    if (s.unforgivable) {
      const b = document.createElement('span');
      b.className = 'badge danger';
      b.textContent = '☠️ De Neiertat';
      row.appendChild(b);
    } else {
      const b = document.createElement('span');
      b.className = 'badge';
      b.textContent = 'Vrajă';
      row.appendChild(b);
    }

    const favBtn = document.createElement('button');
    favBtn.className = 'icon-btn' + (favorites.has(s.spell) ? ' active' : '');
    favBtn.textContent = favorites.has(s.spell) ? '★ Favorit' : '☆ Salvează';
    favBtn.setAttribute('aria-label', 'Salvează la favorite: ' + s.spell);
    favBtn.onclick = (e) => {
      e.stopPropagation();
      if (favorites.has(s.spell)) favorites.delete(s.spell);
      else favorites.add(s.spell);
      saveFav();
      render();
    };
    row.appendChild(favBtn);

    const sayBtn = document.createElement('button');
    sayBtn.className = 'icon-btn say-btn';
    sayBtn.textContent = '🔊 Spune';
    sayBtn.setAttribute('aria-label', 'Spune vraja: ' + s.spell);
    sayBtn.onclick = (e) => {
      e.stopPropagation();
      speakSpell(s.spell, s.use_ro);
    };
    row.appendChild(sayBtn);

    card.append(img, h, ro, en, charRow, row);
    grid.appendChild(card);
  }
}

searchInput.addEventListener('input', render);
onlyFavEl.addEventListener('change', render);
onlyUnforgivableEl.addEventListener('change', render);

// Preincarca vocile (Chrome le ofera asincron)
if ('speechSynthesis' in window) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      try { window.speechSynthesis.getVoices(); } catch {}
    };
  } catch {}
}

function updateOffline() {
  offlineBadge.hidden = navigator.onLine;
}
window.addEventListener('online', updateOffline);
window.addEventListener('offline', updateOffline);
updateOffline();

// PWA install prompt
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});
installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

render();
