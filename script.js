/* ---------- Config ---------- */
const PROFILES = [
  { id: 'me', name: 'Me', accent: '#8B5CF6', glow: 'rgba(139,92,246,0.45)' },
  { id: 'darling', name: 'Darling', accent: '#F472B6', glow: 'rgba(244,114,182,0.45)' },
];

/* ---------- Date helpers ---------- */
function pad(n) { return String(n).padStart(2, '0'); }
function isoDate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parseISO(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function todayISO() { return isoDate(new Date()); }
function addDays(iso, n) { const d = parseISO(iso); d.setDate(d.getDate() + n); return isoDate(d); }
function getMonday(iso) { const d = parseISO(iso); const day = d.getDay(); const diff = day === 0 ? -6 : 1 - day; d.setDate(d.getDate() + diff); return isoDate(d); }
function getWeekDates(iso) { const mon = getMonday(iso); return Array.from({ length: 7 }, (_, i) => addDays(mon, i)); }
function formatLong(iso) { const d = parseISO(iso); return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }); }
function formatShort(iso) { const d = parseISO(iso); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
function round(n, d = 0) { const f = Math.pow(10, d); return Math.round((n + Number.EPSILON) * f) / f; }

/* ---------- Storage (browser localStorage — persists on this device/browser only) ---------- */
function getFoods() {
  try { return JSON.parse(localStorage.getItem('foods') || '[]'); } catch (e) { return []; }
}
function setFoods(arr) {
  try { localStorage.setItem('foods', JSON.stringify(arr)); } catch (e) {}
}
function getEntries(profileId, date) {
  try { return JSON.parse(localStorage.getItem(`entries:${profileId}:${date}`) || '[]'); } catch (e) { return []; }
}
function setEntries(profileId, date, arr) {
  try { localStorage.setItem(`entries:${profileId}:${date}`, JSON.stringify(arr)); } catch (e) {}
}

function computeMacros(food, amount) {
  const factor = food.unit === 'pc' ? amount : amount / 100;
  return {
    calories: food.calories * factor,
    protein: food.protein * factor,
    fat: food.fat * factor,
    carbs: food.carbs * factor,
  };
}
function sumEntries(arr) {
  return arr.reduce((acc, e) => ({
    calories: acc.calories + e.calories, protein: acc.protein + e.protein, fat: acc.fat + e.fat, carbs: acc.carbs + e.carbs
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
}

/* ---------- App state ---------- */
let state = { view: 'dashboard' };
let modalState = null; // { profile, date, entries, foodId, query, suggestOpen, error }

/* ---------- Icons ---------- */
function icons() { if (window.lucide) window.lucide.createIcons(); }

/* ---------- Clock (CET/CEST) ---------- */
function renderClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const now = new Date();
  const opts = { timeZone: 'Europe/Berlin', weekday: 'short', month: 'short', day: 'numeric' };
  const timeOpts = { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hour12: false };
  const dateStr = now.toLocaleDateString('en-GB', opts);
  const timeStr = now.toLocaleTimeString('en-GB', timeOpts);
  const tzName = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', timeZoneName: 'short' })
    .formatToParts(now).find(p => p.type === 'timeZoneName')?.value || 'CET';
  el.innerHTML = `<i data-lucide="calendar-clock"></i> ${dateStr} · ${timeStr} ${tzName}`;
  icons();
}

/* ---------- Dashboard ---------- */
function profileStats(profileId) {
  const week = getWeekDates(todayISO());
  const dayTotals = [];
  week.forEach(d => {
    const arr = getEntries(profileId, d);
    if (arr.length) dayTotals.push(sumEntries(arr));
  });
  const today = sumEntries(getEntries(profileId, todayISO()));
  const n = dayTotals.length;
  const weekSum = dayTotals.reduce((acc, d) => ({
    calories: acc.calories + d.calories, protein: acc.protein + d.protein, fat: acc.fat + d.fat, carbs: acc.carbs + d.carbs
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
  return {
    today,
    weeklyAvgCal: n ? weekSum.calories / n : 0,
    loggedDays: n,
  };
}

function profileCardHTML(profile) {
  const s = profileStats(profile.id);
  const pk = s.today.protein * 4, fk = s.today.fat * 9, ck = s.today.carbs * 4;
  const totalK = pk + fk + ck;
  const pPct = totalK ? (pk / totalK * 100) : 0;
  const fPct = totalK ? (fk / totalK * 100) : 0;
  const ringBg = totalK
    ? `conic-gradient(#2DD4BF 0% ${pPct}%, #FB923C ${pPct}% ${pPct + fPct}%, #FBBF24 ${pPct + fPct}% 100%)`
    : 'rgba(255,255,255,0.08)';

  return `
  <div class="profile-card" style="--accent:${profile.accent}; --glow:${profile.glow}">
    <div class="card-top">
      <div class="avatar-orbit">
        <div class="orbit-ring" style="background:${ringBg}">
          <div class="orbit-core">
            <span class="core-num">${round(s.today.calories)}</span>
            <span class="core-label">kcal /day</span>
          </div>
        </div>
      </div>
      <div class="card-id">
        <h2>${profile.name}</h2>
        <span class="muted small">${s.loggedDays} of 7 days logged this week</span>
      </div>
    </div>

    <div class="section-label">Today</div>
    <div class="macro-row">
      <div class="macro"><i data-lucide="beef"></i><span>${round(s.today.protein, 1)}g</span><em>protein /day</em></div>
      <div class="macro"><i data-lucide="droplet"></i><span>${round(s.today.fat, 1)}g</span><em>fat /day</em></div>
      <div class="macro"><i data-lucide="wheat"></i><span>${round(s.today.carbs, 1)}g</span><em>carbs /day</em></div>
    </div>

    <div class="weekly-avg">
      <i data-lucide="trending-up"></i>
      <div class="weekly-avg-text">
        <span class="weekly-avg-num">${round(s.weeklyAvgCal)} kcal</span>
        <span class="weekly-avg-label">weekly average calories</span>
      </div>
    </div>

    <button class="log-btn" data-open-log="${profile.id}"><i data-lucide="plus"></i>Log food for ${profile.name}</button>
  </div>`;
}

function renderDashboard() {
  const weekDates = getWeekDates(todayISO());
  const rangeLabel = `${formatShort(weekDates[0])} – ${formatShort(weekDates[6])}`;
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="dashboard">
      <div class="dash-head">
        <h1>Mission Control</h1>
        <p class="muted">Today's totals plus this week's average — ${rangeLabel} · resets every Monday</p>
      </div>
      <div class="profile-grid">
        ${PROFILES.map(profileCardHTML).join('')}
      </div>
    </div>`;
  icons();
  main.querySelectorAll('[data-open-log]').forEach(btn => {
    btn.addEventListener('click', () => {
      const profile = PROFILES.find(p => p.id === btn.dataset.openLog);
      openLogModal(profile);
    });
  });
}

/* ---------- Manage Foods ---------- */
let foodForm = { name: '', unit: 'pc', calories: '', protein: '', fat: '', carbs: '' };
let editingId = null;
let foodFormError = '';

function resetFoodForm() { foodForm = { name: '', unit: 'pc', calories: '', protein: '', fat: '', carbs: '' }; editingId = null; foodFormError = ''; }

function renderFoods() {
  const foods = getFoods();
  const unitLabel = foodForm.unit === 'pc' ? 'piece' : '100 g';
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="foods-view">
      <div class="foods-head">
        <h1>Food Catalog</h1>
        <p class="muted">Define each food once — values per piece or per 100 g, your choice.</p>
      </div>

      <form class="food-form" id="food-form">
        <div class="field">
          <label>Name</label>
          <input class="food-name-input" type="text" id="f-name" placeholder="e.g. Cottage cheese" value="${escapeAttr(foodForm.name)}" autocomplete="off" />
        </div>

        <div class="field">
          <label>Values are per</label>
          <div class="toggle">
            <button type="button" data-unit="pc" class="${foodForm.unit === 'pc' ? 'active' : ''}">1 pc</button>
            <button type="button" data-unit="100g" class="${foodForm.unit === '100g' ? 'active' : ''}">100 g</button>
          </div>
        </div>

        <div class="field-grid">
          <div class="field">
            <label><i data-lucide="flame"></i> Calories / ${unitLabel}</label>
            <input type="number" step="0.1" min="0" id="f-calories" value="${escapeAttr(foodForm.calories)}" />
          </div>
          <div class="field">
            <label><i data-lucide="beef"></i> Protein (g)</label>
            <input type="number" step="0.1" min="0" id="f-protein" value="${escapeAttr(foodForm.protein)}" />
          </div>
          <div class="field">
            <label><i data-lucide="droplet"></i> Fat (g)</label>
            <input type="number" step="0.1" min="0" id="f-fat" value="${escapeAttr(foodForm.fat)}" />
          </div>
          <div class="field">
            <label><i data-lucide="wheat"></i> Carbs (g)</label>
            <input type="number" step="0.1" min="0" id="f-carbs" value="${escapeAttr(foodForm.carbs)}" />
          </div>
        </div>

        ${foodFormError ? `<p class="form-error">${escapeHtml(foodFormError)}</p>` : ''}

        <div class="form-actions">
          ${editingId ? `<button type="button" class="ghost-btn" id="cancel-edit">Cancel</button>` : ''}
          <button type="submit" class="primary-btn">
            ${editingId ? '<i data-lucide="check"></i>Save changes' : '<i data-lucide="plus"></i>Add food'}
          </button>
        </div>
      </form>

      <div class="food-list-head">
        <h2>Your Foods</h2>
        <span class="food-count">${foods.length}</span>
      </div>
      <div class="food-list">
        ${foods.length === 0 ? '<p class="muted empty">No foods yet — add your first one above.</p>' :
          foods.slice().sort((a, b) => a.name.localeCompare(b.name)).map(f => `
            <div class="food-row">
              <div class="food-row-main">
                <span class="food-name">${escapeHtml(f.name)}</span>
                <span class="food-unit">per ${f.unit === 'pc' ? 'piece' : '100 g'}</span>
              </div>
              <div class="food-row-macros">
                <span><i data-lucide="flame"></i>${round(f.calories)}</span>
                <span><i data-lucide="beef"></i>${round(f.protein, 1)}g</span>
                <span><i data-lucide="droplet"></i>${round(f.fat, 1)}g</span>
                <span><i data-lucide="wheat"></i>${round(f.carbs, 1)}g</span>
              </div>
              <div class="food-row-actions">
                <button data-edit="${f.id}" aria-label="Edit"><i data-lucide="pencil"></i></button>
                <button data-delete="${f.id}" aria-label="Delete"><i data-lucide="trash-2"></i></button>
              </div>
            </div>
          `).join('')}
      </div>
    </div>`;
  icons();

  document.querySelectorAll('.toggle [data-unit]').forEach(btn => {
    btn.addEventListener('click', () => { foodForm.unit = btn.dataset.unit; syncFoodFormFromInputs(); renderFoods(); });
  });
  document.getElementById('food-form').addEventListener('submit', onFoodFormSubmit);
  const cancelBtn = document.getElementById('cancel-edit');
  if (cancelBtn) cancelBtn.addEventListener('click', () => { resetFoodForm(); renderFoods(); });
  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => { editFood(btn.dataset.edit); });
  });
  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => { deleteFood(btn.dataset.delete); });
  });

  // keep form values in sync as user types (without full re-render, to preserve focus)
  ['f-name', 'f-calories', 'f-protein', 'f-fat', 'f-carbs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { syncFoodFormFromInputs(); if (foodFormError) { foodFormError = ''; } });
  });
}

function syncFoodFormFromInputs() {
  const g = id => document.getElementById(id);
  foodForm.name = g('f-name') ? g('f-name').value : foodForm.name;
  foodForm.calories = g('f-calories') ? g('f-calories').value : foodForm.calories;
  foodForm.protein = g('f-protein') ? g('f-protein').value : foodForm.protein;
  foodForm.fat = g('f-fat') ? g('f-fat').value : foodForm.fat;
  foodForm.carbs = g('f-carbs') ? g('f-carbs').value : foodForm.carbs;
}

function onFoodFormSubmit(e) {
  e.preventDefault();
  syncFoodFormFromInputs();
  if (!foodForm.name.trim()) { foodFormError = 'Give the food a name before adding it.'; renderFoods(); return; }
  if (foodForm.calories === '' || isNaN(parseFloat(foodForm.calories))) { foodFormError = 'Enter a calorie value before adding it.'; renderFoods(); return; }

  const foods = getFoods();
  const entry = {
    id: editingId || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
    name: foodForm.name.trim(),
    unit: foodForm.unit,
    calories: parseFloat(foodForm.calories) || 0,
    protein: parseFloat(foodForm.protein) || 0,
    fat: parseFloat(foodForm.fat) || 0,
    carbs: parseFloat(foodForm.carbs) || 0,
  };
  const next = editingId ? foods.map(f => (f.id === editingId ? entry : f)) : [...foods, entry];
  setFoods(next);
  resetFoodForm();
  renderFoods();
}

function editFood(id) {
  const foods = getFoods();
  const f = foods.find(x => x.id === id);
  if (!f) return;
  editingId = id;
  foodFormError = '';
  foodForm = { name: f.name, unit: f.unit, calories: String(f.calories), protein: String(f.protein), fat: String(f.fat), carbs: String(f.carbs) };
  renderFoods();
}
function deleteFood(id) {
  setFoods(getFoods().filter(f => f.id !== id));
  if (editingId === id) resetFoodForm();
  renderFoods();
}

/* ---------- Log Modal ---------- */
function openLogModal(profile) {
  modalState = { profile, date: todayISO(), foodId: '', query: '', suggestOpen: false, error: '' };
  renderModal();
}
function closeLogModal() {
  modalState = null;
  document.getElementById('modal-root').innerHTML = '';
  renderDashboard();
}

function renderModal() {
  const root = document.getElementById('modal-root');
  if (!modalState) { root.innerHTML = ''; return; }
  const { profile, date } = modalState;
  const foods = getFoods();
  const entries = getEntries(profile.id, date);
  const summary = sumEntries(entries);
  const selectedFood = foods.find(f => f.id === modalState.foodId);

  root.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal" style="--accent:${profile.accent}; --glow:${profile.glow}">
        <div class="modal-head">
          <div>
            <span class="modal-eyebrow">Logging for</span>
            <h2>${profile.name}</h2>
          </div>
          <button class="icon-btn" id="modal-close" aria-label="Close"><i data-lucide="x"></i></button>
        </div>

        <div class="date-nav">
          <button class="icon-btn" id="date-prev" aria-label="Previous day"><i data-lucide="chevron-left"></i></button>
          <div class="date-picker">
            <input type="date" id="date-input" value="${date}" />
            <span class="date-label">${formatLong(date)}</span>
          </div>
          <button class="icon-btn" id="date-next" aria-label="Next day"><i data-lucide="chevron-right"></i></button>
        </div>

        ${foods.length === 0 ? `
          <p class="muted empty">No foods in the catalog yet. Add some on the Manage Foods page first.</p>
        ` : `
          <form class="entry-form" id="entry-form">
            <div class="field autocomplete">
              <input type="text" id="food-query" placeholder="Type a food name…" autocomplete="off"
                value="${escapeAttr(modalState.query)}" />
              ${modalState.suggestOpen ? renderSuggestions(foods, modalState.query) : ''}
            </div>
            <input type="number" min="0" step="${selectedFood?.unit === 'pc' ? '0.5' : '1'}"
              placeholder="${selectedFood ? (selectedFood.unit === 'pc' ? 'Pieces' : 'Grams') : 'Amount'}"
              id="amount-input" ${selectedFood ? '' : 'disabled'} />
            <button type="submit" class="primary-btn"><i data-lucide="plus"></i>Submit</button>
          </form>
        `}
        ${modalState.error ? `<p class="form-error" style="margin-bottom:14px">${escapeHtml(modalState.error)}</p>` : ''}

        <div class="entry-list">
          ${entries.length === 0 ? '<p class="muted empty">Nothing logged for this day yet.</p>' :
            entries.map(e => `
              <div class="entry-row">
                <div class="entry-main">
                  <span class="entry-name">${escapeHtml(e.name)}</span>
                  <span class="entry-amount">${e.amount}${e.unit === 'pc' ? ' pc' : ' g'}</span>
                </div>
                <div class="entry-macros">
                  <span>${round(e.calories)} kcal</span>
                  <span>${round(e.protein, 1)}g P</span>
                  <span>${round(e.fat, 1)}g F</span>
                  <span>${round(e.carbs, 1)}g C</span>
                </div>
                <button class="icon-btn small" data-remove="${e.id}" aria-label="Remove"><i data-lucide="trash-2"></i></button>
              </div>
            `).join('')}
        </div>

        <div class="modal-summary">
          <div class="sum-item"><i data-lucide="flame"></i><span>${round(summary.calories)}</span><em>kcal</em></div>
          <div class="sum-item"><i data-lucide="beef"></i><span>${round(summary.protein, 1)}</span><em>protein</em></div>
          <div class="sum-item"><i data-lucide="droplet"></i><span>${round(summary.fat, 1)}</span><em>fat</em></div>
          <div class="sum-item"><i data-lucide="wheat"></i><span>${round(summary.carbs, 1)}</span><em>carbs</em></div>
        </div>
      </div>
    </div>`;
  icons();
  wireModalEvents();
}

function renderSuggestions(foods, query) {
  const q = query.trim().toLowerCase();
  if (!q) return '';
  const starts = foods.filter(f => f.name.toLowerCase().startsWith(q));
  const contains = foods.filter(f => !f.name.toLowerCase().startsWith(q) && f.name.toLowerCase().includes(q));
  const matches = [...starts, ...contains].slice(0, 5);
  if (matches.length === 0) return '<div class="suggestion-list"><div class="suggestion-item"><span class="s-meta">No matches</span></div></div>';
  return `<div class="suggestion-list">
    ${matches.map(f => `
      <div class="suggestion-item" data-suggest="${f.id}">
        <span class="s-name">${escapeHtml(f.name)}</span>
        <span class="s-meta">${round(f.calories)} kcal / ${f.unit === 'pc' ? 'pc' : '100g'}</span>
      </div>
    `).join('')}
  </div>`;
}

function wireModalEvents() {
  const backdrop = document.getElementById('modal-backdrop');
  backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) closeLogModal(); });
  document.getElementById('modal-close').addEventListener('click', closeLogModal);
  document.getElementById('date-prev').addEventListener('click', () => { modalState.date = addDays(modalState.date, -1); renderModal(); });
  document.getElementById('date-next').addEventListener('click', () => { modalState.date = addDays(modalState.date, 1); renderModal(); });
  document.getElementById('date-input').addEventListener('change', (e) => { modalState.date = e.target.value; renderModal(); });

  const queryInput = document.getElementById('food-query');
  if (queryInput) {
    queryInput.addEventListener('input', (e) => {
      modalState.query = e.target.value;
      modalState.foodId = '';
      modalState.suggestOpen = true;
      modalState.error = '';
      renderModal();
      const el = document.getElementById('food-query');
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    });
    queryInput.addEventListener('focus', () => { if (modalState.query) { modalState.suggestOpen = true; renderModal(); } });
  }

  document.querySelectorAll('[data-suggest]').forEach(item => {
    item.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const foods = getFoods();
      const f = foods.find(x => x.id === item.dataset.suggest);
      if (!f) return;
      modalState.foodId = f.id;
      modalState.query = f.name;
      modalState.suggestOpen = false;
      renderModal();
    });
  });

  const entryForm = document.getElementById('entry-form');
  if (entryForm) entryForm.addEventListener('submit', onEntrySubmit);

  document.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const entries = getEntries(modalState.profile.id, modalState.date).filter(e => e.id !== btn.dataset.remove);
      setEntries(modalState.profile.id, modalState.date, entries);
      renderModal();
    });
  });

  document.addEventListener('keydown', onModalKeydown);
}
function onModalKeydown(e) {
  if (!modalState) { document.removeEventListener('keydown', onModalKeydown); return; }
  if (e.key === 'Escape') closeLogModal();
}

function onEntrySubmit(e) {
  e.preventDefault();
  const foods = getFoods();
  const selectedFood = foods.find(f => f.id === modalState.foodId);
  const amountInput = document.getElementById('amount-input');
  const amt = parseFloat(amountInput ? amountInput.value : '');

  if (!selectedFood) { modalState.error = 'Pick a food from the suggestions first.'; renderModal(); return; }
  if (!amt || amt <= 0) { modalState.error = 'Enter an amount greater than 0.'; renderModal(); return; }

  const macros = computeMacros(selectedFood, amt);
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    foodId: selectedFood.id, name: selectedFood.name, unit: selectedFood.unit, amount: amt,
    calories: macros.calories, protein: macros.protein, fat: macros.fat, carbs: macros.carbs,
  };
  const entries = [...getEntries(modalState.profile.id, modalState.date), entry];
  setEntries(modalState.profile.id, modalState.date, entries);

  modalState.foodId = ''; modalState.query = ''; modalState.error = ''; modalState.suggestOpen = false;
  renderModal();
}

/* ---------- Utilities ---------- */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(str) { return escapeHtml(str); }

/* ---------- Nav & init ---------- */
function setView(view) {
  state.view = view;
  document.getElementById('nav-dashboard').classList.toggle('active', view === 'dashboard');
  document.getElementById('nav-foods').classList.toggle('active', view === 'foods');
  if (view === 'dashboard') renderDashboard(); else renderFoods();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('nav-dashboard').addEventListener('click', () => setView('dashboard'));
  document.getElementById('nav-foods').addEventListener('click', () => setView('foods'));
  renderClock();
  setInterval(renderClock, 30000);
  renderDashboard();
});
