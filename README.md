import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard, Apple, Flame, Beef, Droplet, Wheat, Plus, Trash2,
  Pencil, X, ChevronLeft, ChevronRight, Loader2, Sparkles, Check
} from 'lucide-react';

const PROFILES = [
  { id: 'me', name: 'Me', accent: '#8B5CF6', glow: 'rgba(139,92,246,0.45)' },
  { id: 'darling', name: 'Darling', accent: '#F472B6', glow: 'rgba(244,114,182,0.45)' },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');

.app-root, .app-root * { box-sizing: border-box; }
.app-root {
  position: relative;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #EDEBFA;
  background: radial-gradient(ellipse at 20% -10%, #241246 0%, transparent 55%),
              radial-gradient(ellipse at 90% 10%, #0f2a4a 0%, transparent 45%),
              linear-gradient(160deg, #05040d 0%, #0a0818 45%, #120a26 100%);
  overflow-x: hidden;
  padding-bottom: 60px;
}
.stars {
  position: fixed; inset:0; pointer-events:none; z-index:0;
  background-image:
    radial-gradient(1.5px 1.5px at 10% 20%, #fff, transparent),
    radial-gradient(1px 1px at 80% 10%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 60% 70%, #fff, transparent),
    radial-gradient(1px 1px at 30% 85%, #fff, transparent),
    radial-gradient(2px 2px at 90% 60%, #fff, transparent),
    radial-gradient(1px 1px at 45% 40%, #fff, transparent),
    radial-gradient(1px 1px at 15% 55%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 70% 30%, #fff, transparent);
  background-repeat: repeat;
  background-size: 600px 600px;
  opacity: .5;
  animation: twinkle 6s ease-in-out infinite alternate;
}
@keyframes twinkle { from{opacity:.3;} to{opacity:.6;} }
@media (prefers-reduced-motion: reduce){ .stars{animation:none;} }

.topbar{
  position:relative; z-index:1;
  display:flex; align-items:center; justify-content:space-between;
  padding: 22px 40px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-wrap: wrap; gap: 14px;
}
.brand{ display:flex; align-items:center; gap:8px; font-family:'Space Grotesk', sans-serif; font-weight:600; font-size:19px; letter-spacing:.3px;}
.brand-icon{ color:#8B5CF6; }
.nav{ display:flex; gap:8px; }
.nav-btn{
  display:flex; align-items:center; gap:6px;
  background:transparent; border:1px solid transparent; color:#9895b8;
  padding:9px 16px; border-radius:12px; font-size:14px; font-weight:500; cursor:pointer;
  font-family:inherit; transition: all .15s ease;
}
.nav-btn:hover{ color:#EDEBFA; background: rgba(255,255,255,0.05); }
.nav-btn.active{ color:#EDEBFA; background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.4); }
.nav-btn:focus-visible, .icon-btn:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible{
  outline: 2px solid #8B5CF6; outline-offset: 2px;
}

.main{ position:relative; z-index:1; max-width: 1040px; margin: 0 auto; padding: 40px 24px; }

.dash-head h1, .foods-head h1{ font-family:'Space Grotesk', sans-serif; font-size: 30px; font-weight:600; margin:0 0 6px; }
.muted{ color:#8D8AB0; font-size:14px; }
.muted.small{ font-size:12px; }
.muted.empty{ padding: 24px 0; text-align:center; }

.profile-grid{ display:grid; grid-template-columns: repeat(auto-fit,minmax(300px,1fr)); gap:24px; margin-top:28px; }

.profile-card{
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 22px;
  padding: 26px;
  backdrop-filter: blur(14px);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.02) inset, 0 20px 40px -20px rgba(0,0,0,.6);
  position: relative;
  overflow:hidden;
}
.profile-card::before{
  content:''; position:absolute; top:-60px; right:-60px; width:180px; height:180px; border-radius:50%;
  background: radial-gradient(circle, var(--glow) 0%, transparent 70%);
  pointer-events:none;
}
.card-top{ display:flex; align-items:center; gap:18px; }
.avatar-orbit{ flex-shrink:0; }
.orbit-ring{
  width:104px; height:104px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  animation: rotate 40s linear infinite;
}
@media (prefers-reduced-motion: reduce){ .orbit-ring{ animation:none; } }
@keyframes rotate{ to{ transform: rotate(360deg); } }
.orbit-core{
  width:78px; height:78px; border-radius:50%;
  background: #0c0a1a;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  animation: counter-rotate 40s linear infinite;
}
@keyframes counter-rotate{ to{ transform: rotate(-360deg); } }
@media (prefers-reduced-motion: reduce){ .orbit-core{ animation:none; } }
.core-num{ font-family:'JetBrains Mono', monospace; font-size:19px; font-weight:600; color:#fff; }
.core-label{ font-size:9px; color:#8D8AB0; text-transform:uppercase; letter-spacing:.06em; }
.card-id h2{ font-family:'Space Grotesk', sans-serif; font-size:20px; margin:0 0 4px; color:var(--accent); }

.macro-row{ display:flex; justify-content:space-between; margin: 20px 0 18px; padding: 14px 0; border-top:1px solid rgba(255,255,255,0.07); border-bottom:1px solid rgba(255,255,255,0.07); }
.macro{ display:flex; flex-direction:column; align-items:center; gap:3px; font-family:'JetBrains Mono', monospace; font-size:13px; color:#EDEBFA; }
.macro em{ font-family:'Inter',sans-serif; font-style:normal; font-size:10px; color:#8D8AB0; text-transform:uppercase; letter-spacing:.05em; }

.log-btn{
  width:100%; display:flex; align-items:center; justify-content:center; gap:8px;
  background: var(--accent); color:#0c0a1a; font-weight:600; font-size:14px;
  border:none; border-radius:12px; padding:12px; cursor:pointer; font-family:inherit;
  transition: filter .15s ease, transform .1s ease;
}
.log-btn:hover{ filter:brightness(1.1); }
.log-btn:active{ transform: scale(.98); }

.food-form{
  background: rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.08); border-radius:20px;
  padding:24px; margin: 26px 0 32px; display:flex; flex-direction:column; gap:18px;
}
.field{ display:flex; flex-direction:column; gap:7px; }
.field label{ font-size:12px; color:#8D8AB0; display:flex; align-items:center; gap:5px; text-transform:uppercase; letter-spacing:.04em; }
.field-grid{ display:grid; grid-template-columns: repeat(auto-fit,minmax(140px,1fr)); gap:16px; }

input[type="text"], input[type="number"], input[type="date"], select{
  background: rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.12); color:#EDEBFA;
  border-radius:10px; padding:10px 12px; font-size:14px; font-family:'JetBrains Mono', monospace;
  outline:none; transition: border-color .15s; width:100%;
  color-scheme: dark;
}
select{ font-family:'Inter',sans-serif; }
input:focus, select:focus{ border-color:#8B5CF6; }

.toggle{ display:inline-flex; background:rgba(0,0,0,.3); border:1px solid rgba(255,255,255,.12); border-radius:10px; padding:3px; width:fit-content; }
.toggle button{ background:transparent; border:none; color:#8D8AB0; padding:8px 16px; border-radius:8px; font-size:13px; cursor:pointer; font-family:inherit; }
.toggle button.active{ background:#8B5CF6; color:#0c0a1a; font-weight:600; }

.form-actions{ display:flex; justify-content:flex-end; gap:10px; }
.primary-btn{
  display:flex; align-items:center; gap:7px; background:#8B5CF6; color:#0c0a1a; font-weight:600;
  border:none; border-radius:10px; padding:10px 18px; font-size:14px; cursor:pointer; font-family:inherit;
}
.primary-btn:disabled{ opacity:.5; cursor:not-allowed; }
.ghost-btn{ background:transparent; border:1px solid rgba(255,255,255,.15); color:#8D8AB0; border-radius:10px; padding:10px 16px; font-size:14px; cursor:pointer; font-family:inherit; }
.form-error{ background: rgba(244,63,94,0.1); border:1px solid rgba(244,63,94,0.35); color:#fca5b5; border-radius:10px; padding:9px 14px; font-size:13px; margin:0; }

.food-list-head{ display:flex; align-items:center; gap:10px; margin: 0 0 14px; }
.food-list-head h2{ font-family:'Space Grotesk', sans-serif; font-size:18px; font-weight:600; margin:0; }
.food-count{ background: rgba(139,92,246,0.18); color:#c9baff; border:1px solid rgba(139,92,246,0.4); border-radius:999px; padding:2px 10px; font-size:12px; font-family:'JetBrains Mono', monospace; }
.food-list{ display:flex; flex-direction:column; gap:10px; }
.food-row{
  display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap;
  background: rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:14px 16px;
}
.food-row-main{ display:flex; flex-direction:column; gap:2px; min-width:140px; }
.food-name{ font-weight:600; font-size:14px; }
.food-unit{ font-size:11px; color:#8D8AB0; }
.food-row-macros{ display:flex; gap:14px; font-family:'JetBrains Mono', monospace; font-size:12px; color:#c9c6e0; flex-wrap:wrap; }
.food-row-macros span{ display:flex; align-items:center; gap:4px; }
.food-row-actions{ display:flex; gap:6px; }
.food-row-actions button, .icon-btn{
  background: rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); color:#c9c6e0; border-radius:8px;
  width:30px; height:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;
}
.food-row-actions button:hover, .icon-btn:hover{ background: rgba(255,255,255,.1); color:#fff; }

.modal-backdrop{
  position:fixed; inset:0; background: rgba(4,3,10,.7); backdrop-filter: blur(4px);
  display:flex; align-items:center; justify-content:center; z-index:50; padding:20px;
}
.modal{
  width:100%; max-width:520px; max-height:88vh; overflow-y:auto;
  background: linear-gradient(180deg, #14102a 0%, #0c0a1a 100%);
  border:1px solid rgba(255,255,255,.1); border-radius:22px; padding:26px;
  box-shadow: 0 0 60px -10px var(--glow), 0 30px 60px -20px rgba(0,0,0,.7);
}
.modal-head{ display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:18px; }
.modal-eyebrow{ font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:#8D8AB0; }
.modal-head h2{ font-family:'Space Grotesk', sans-serif; font-size:24px; margin:2px 0 0; color:var(--accent); }

.date-nav{ display:flex; align-items:center; gap:10px; margin-bottom:20px; }
.date-picker{ flex:1; position:relative; display:flex; flex-direction:column; }
.date-label{ font-size:11px; color:#8D8AB0; margin-top:4px; font-family:'Inter',sans-serif;}

.entry-form{ display:grid; grid-template-columns: 2fr 1fr auto; gap:10px; margin-bottom:18px; align-items:center; }

.entry-list{ display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; margin-bottom:18px; padding-right:4px; }
.entry-row{
  display:flex; align-items:center; gap:10px;
  background: rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:10px 12px;
}
.entry-main{ display:flex; flex-direction:column; gap:1px; min-width:100px; flex:1; }
.entry-name{ font-size:13px; font-weight:600; }
.entry-amount{ font-size:11px; color:#8D8AB0; }
.entry-macros{ display:flex; gap:10px; font-family:'JetBrains Mono', monospace; font-size:11px; color:#c9c6e0; flex-wrap:wrap; }
.icon-btn.small{ width:26px; height:26px; flex-shrink:0; }

.modal-summary{
  display:grid; grid-template-columns: repeat(4,1fr); gap:10px;
  border-top:1px solid rgba(255,255,255,.08); padding-top:16px;
}
.sum-item{ display:flex; flex-direction:column; align-items:center; gap:3px; color:var(--accent); }
.sum-item span{ font-family:'JetBrains Mono', monospace; font-weight:600; font-size:15px; color:#fff; }
.sum-item em{ font-style:normal; font-size:10px; color:#8D8AB0; text-transform:uppercase; }

.spin{ animation: spin 1s linear infinite; }
@keyframes spin{ to{ transform:rotate(360deg); } }

@media (max-width: 560px){
  .topbar{ padding:16px 20px; }
  .main{ padding:24px 16px; }
  .entry-form{ grid-template-columns: 1fr; }
  .modal-summary{ grid-template-columns: repeat(2,1fr); }
}
`;

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

async function safeGet(key, shared) {
  try { const r = await window.storage.get(key, shared); return r ? r.value : null; }
  catch (e) { return null; }
}
async function safeSet(key, value, shared) {
  try { await window.storage.set(key, value, shared); return true; } catch (e) { return false; }
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

function ProfileCard({ profile, stats, loading, onOpenLog }) {
  const s = stats || { avgCal: 0, avgP: 0, avgF: 0, avgC: 0, loggedDays: 0 };
  const pk = s.avgP * 4, fk = s.avgF * 9, ck = s.avgC * 4;
  const totalK = pk + fk + ck;
  const pPct = totalK ? (pk / totalK * 100) : 0;
  const fPct = totalK ? (fk / totalK * 100) : 0;
  const ringStyle = totalK
    ? { background: `conic-gradient(#2DD4BF 0% ${pPct}%, #FB923C ${pPct}% ${pPct + fPct}%, #FBBF24 ${pPct + fPct}% 100%)` }
    : { background: 'rgba(255,255,255,0.08)' };

  return (
    <div className="profile-card" style={{ '--accent': profile.accent, '--glow': profile.glow }}>
      <div className="card-top">
        <div className="avatar-orbit">
          <div className="orbit-ring" style={ringStyle}>
            <div className="orbit-core">
              <span className="core-num">{loading ? '···' : round(s.avgCal)}</span>
              <span className="core-label">kcal/day</span>
            </div>
          </div>
        </div>
        <div className="card-id">
          <h2>{profile.name}</h2>
          <span className="muted small">{s.loggedDays} of 7 days logged</span>
        </div>
      </div>

      <div className="macro-row">
        <div className="macro"><Beef size={14} /><span>{loading ? '—' : round(s.avgP, 1)}g</span><em>protein</em></div>
        <div className="macro"><Droplet size={14} /><span>{loading ? '—' : round(s.avgF, 1)}g</span><em>fat</em></div>
        <div className="macro"><Wheat size={14} /><span>{loading ? '—' : round(s.avgC, 1)}g</span><em>carbs</em></div>
      </div>

      <button className="log-btn" onClick={onOpenLog}><Plus size={16} />Log food for {profile.name}</button>
    </div>
  );
}

function DashboardView({ weekStats, statsLoading, weekDates, onOpenLog }) {
  const rangeLabel = `${formatShort(weekDates[0])} – ${formatShort(weekDates[6])}`;
  return (
    <div className="dashboard">
      <div className="dash-head">
        <h1>Mission Control</h1>
        <p className="muted">Daily average for the current orbit — {rangeLabel} · resets every Monday</p>
      </div>
      <div className="profile-grid">
        {PROFILES.map(p => (
          <ProfileCard key={p.id} profile={p} stats={weekStats[p.id]} loading={statsLoading} onOpenLog={() => onOpenLog(p)} />
        ))}
      </div>
    </div>
  );
}

function emptyFoodForm() {
  return { name: '', unit: 'pc', calories: '', protein: '', fat: '', carbs: '' };
}

function FoodsView({ foods, onSave, ready }) {
  const [form, setForm] = useState(emptyFoodForm());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  function update(field, value) { setForm(f => ({ ...f, [field]: value })); if (error) setError(''); }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Give the food a name before adding it.'); return; }
    if (form.calories === '' || isNaN(parseFloat(form.calories))) { setError('Enter a calorie value before adding it.'); return; }
    setError('');
    const entry = {
      id: editingId || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
      name: form.name.trim(),
      unit: form.unit,
      calories: parseFloat(form.calories) || 0,
      protein: parseFloat(form.protein) || 0,
      fat: parseFloat(form.fat) || 0,
      carbs: parseFloat(form.carbs) || 0,
    };
    const next = editingId ? foods.map(f => (f.id === editingId ? entry : f)) : [...foods, entry];
    onSave(next);
    setForm(emptyFoodForm());
    setEditingId(null);
  }

  function edit(f) {
    setEditingId(f.id);
    setForm({ name: f.name, unit: f.unit, calories: String(f.calories), protein: String(f.protein), fat: String(f.fat), carbs: String(f.carbs) });
  }
  function remove(id) {
    onSave(foods.filter(f => f.id !== id));
    if (editingId === id) { setEditingId(null); setForm(emptyFoodForm()); }
  }
  function cancelEdit() { setEditingId(null); setForm(emptyFoodForm()); }

  const unitLabel = form.unit === 'pc' ? 'piece' : '100 g';

  return (
    <div className="foods-view">
      <div className="foods-head">
        <h1>Food Catalog</h1>
        <p className="muted">Define each food once — values per piece or per 100 g, your choice.</p>
      </div>

      <form className="food-form" onSubmit={submit}>
        <div className="field">
          <label>Name</label>
          <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Cottage cheese" />
        </div>

        <div className="field">
          <label>Values are per</label>
          <div className="toggle">
            <button type="button" className={form.unit === 'pc' ? 'active' : ''} onClick={() => update('unit', 'pc')}>1 pc</button>
            <button type="button" className={form.unit === '100g' ? 'active' : ''} onClick={() => update('unit', '100g')}>100 g</button>
          </div>
        </div>

        <div className="field-grid">
          <div className="field">
            <label><Flame size={13} /> Calories / {unitLabel}</label>
            <input type="number" step="0.1" min="0" value={form.calories} onChange={e => update('calories', e.target.value)} />
          </div>
          <div className="field">
            <label><Beef size={13} /> Protein (g)</label>
            <input type="number" step="0.1" min="0" value={form.protein} onChange={e => update('protein', e.target.value)} />
          </div>
          <div className="field">
            <label><Droplet size={13} /> Fat (g)</label>
            <input type="number" step="0.1" min="0" value={form.fat} onChange={e => update('fat', e.target.value)} />
          </div>
          <div className="field">
            <label><Wheat size={13} /> Carbs (g)</label>
            <input type="number" step="0.1" min="0" value={form.carbs} onChange={e => update('carbs', e.target.value)} />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          {editingId && <button type="button" className="ghost-btn" onClick={cancelEdit}>Cancel</button>}
          <button type="submit" className="primary-btn">
            {editingId ? <><Check size={16} />Save changes</> : <><Plus size={16} />Add food</>}
          </button>
        </div>
      </form>

      <div className="food-list-head">
        <h2>Your Foods</h2>
        {ready && <span className="food-count">{foods.length}</span>}
      </div>
      <div className="food-list">
        {!ready && <p className="muted">Loading catalog…</p>}
        {ready && foods.length === 0 && <p className="muted empty">No foods yet — add your first one above.</p>}
        {foods.slice().sort((a, b) => a.name.localeCompare(b.name)).map(f => (
          <div className="food-row" key={f.id}>
            <div className="food-row-main">
              <span className="food-name">{f.name}</span>
              <span className="food-unit">per {f.unit === 'pc' ? 'piece' : '100 g'}</span>
            </div>
            <div className="food-row-macros">
              <span><Flame size={12} />{round(f.calories)}</span>
              <span><Beef size={12} />{round(f.protein, 1)}g</span>
              <span><Droplet size={12} />{round(f.fat, 1)}g</span>
              <span><Wheat size={12} />{round(f.carbs, 1)}g</span>
            </div>
            <div className="food-row-actions">
              <button onClick={() => edit(f)} aria-label="Edit"><Pencil size={14} /></button>
              <button onClick={() => remove(f.id)} aria-label="Delete"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogModal({ profile, foods, onClose }) {
  const [date, setDate] = useState(todayISO());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [foodId, setFoodId] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [entryError, setEntryError] = useState('');

  const load = useCallback(async (d) => {
    setLoading(true);
    const v = await safeGet(`entries:${profile.id}:${d}`, true);
    setEntries(v ? JSON.parse(v) : []);
    setLoading(false);
  }, [profile.id]);

  useEffect(() => { load(date); }, [date, load]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const selectedFood = foods.find(f => f.id === foodId);

  async function submit(e) {
    e.preventDefault();
    if (!selectedFood) { setEntryError('Pick a food from the list first.'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setEntryError('Enter an amount greater than 0.'); return; }
    setEntryError('');
    setSaving(true);
    const macros = computeMacros(selectedFood, amt);
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      foodId: selectedFood.id,
      name: selectedFood.name,
      unit: selectedFood.unit,
      amount: amt,
      calories: macros.calories, protein: macros.protein, fat: macros.fat, carbs: macros.carbs,
    };
    const next = [...entries, entry];
    setEntries(next);
    await safeSet(`entries:${profile.id}:${date}`, JSON.stringify(next), true);
    setFoodId(''); setAmount('');
    setSaving(false);
  }

  async function removeEntry(id) {
    const next = entries.filter(e => e.id !== id);
    setEntries(next);
    await safeSet(`entries:${profile.id}:${date}`, JSON.stringify(next), true);
  }

  const summary = entries.reduce((acc, e) => ({
    calories: acc.calories + e.calories, protein: acc.protein + e.protein, fat: acc.fat + e.fat, carbs: acc.carbs + e.carbs
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

  function shiftDate(n) { setDate(d => addDays(d, n)); }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ '--accent': profile.accent, '--glow': profile.glow }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="modal-eyebrow">Logging for</span>
            <h2>{profile.name}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="date-nav">
          <button className="icon-btn" onClick={() => shiftDate(-1)} aria-label="Previous day"><ChevronLeft size={16} /></button>
          <div className="date-picker">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <span className="date-label">{formatLong(date)}</span>
          </div>
          <button className="icon-btn" onClick={() => shiftDate(1)} aria-label="Next day"><ChevronRight size={16} /></button>
        </div>

        {foods.length === 0 ? (
          <p className="muted empty">No foods in the catalog yet. Add some on the Manage Foods page first.</p>
        ) : (
          <form className="entry-form" onSubmit={submit}>
            <select value={foodId} onChange={e => { setFoodId(e.target.value); if (entryError) setEntryError(''); }}>
              <option value="" disabled>Select a food…</option>
              {foods.slice().sort((a, b) => a.name.localeCompare(b.name)).map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <input
              type="number" min="0" step={selectedFood?.unit === 'pc' ? '0.5' : '1'}
              placeholder={selectedFood ? (selectedFood.unit === 'pc' ? 'Pieces' : 'Grams') : 'Amount'}
              value={amount} onChange={e => { setAmount(e.target.value); if (entryError) setEntryError(''); }}
              disabled={!selectedFood}
            />
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}Submit
            </button>
          </form>
        )}
        {entryError && <p className="form-error" style={{ marginBottom: 14 }}>{entryError}</p>}

        <div className="entry-list">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="muted empty">Nothing logged for this day yet.</p>
          ) : (
            entries.map(e => (
              <div className="entry-row" key={e.id}>
                <div className="entry-main">
                  <span className="entry-name">{e.name}</span>
                  <span className="entry-amount">{e.amount}{e.unit === 'pc' ? ' pc' : ' g'}</span>
                </div>
                <div className="entry-macros">
                  <span>{round(e.calories)} kcal</span>
                  <span>{round(e.protein, 1)}g P</span>
                  <span>{round(e.fat, 1)}g F</span>
                  <span>{round(e.carbs, 1)}g C</span>
                </div>
                <button className="icon-btn small" onClick={() => removeEntry(e.id)} aria-label="Remove"><Trash2 size={13} /></button>
              </div>
            ))
          )}
        </div>

        <div className="modal-summary">
          <div className="sum-item"><Flame size={14} /><span>{round(summary.calories)}</span><em>kcal</em></div>
          <div className="sum-item"><Beef size={14} /><span>{round(summary.protein, 1)}</span><em>protein</em></div>
          <div className="sum-item"><Droplet size={14} /><span>{round(summary.fat, 1)}</span><em>fat</em></div>
          <div className="sum-item"><Wheat size={14} /><span>{round(summary.carbs, 1)}</span><em>carbs</em></div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('dashboard');
  const [foods, setFoods] = useState([]);
  const [foodsReady, setFoodsReady] = useState(false);
  const [modalProfile, setModalProfile] = useState(null);
  const [weekStats, setWeekStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const v = await safeGet('foods', true);
      setFoods(v ? JSON.parse(v) : []);
      setFoodsReady(true);
    })();
  }, []);

  const refreshWeekStats = useCallback(async () => {
    setStatsLoading(true);
    const week = getWeekDates(todayISO());
    const results = {};
    for (const p of PROFILES) {
      const days = [];
      for (const d of week) {
        const v = await safeGet(`entries:${p.id}:${d}`, true);
        const arr = v ? JSON.parse(v) : [];
        if (arr.length) {
          const tot = arr.reduce((acc, e) => ({
            calories: acc.calories + e.calories, protein: acc.protein + e.protein, fat: acc.fat + e.fat, carbs: acc.carbs + e.carbs
          }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
          days.push(tot);
        }
      }
      const n = days.length;
      const sum = days.reduce((acc, d) => ({
        calories: acc.calories + d.calories, protein: acc.protein + d.protein, fat: acc.fat + d.fat, carbs: acc.carbs + d.carbs
      }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
      results[p.id] = {
        avgCal: n ? sum.calories / n : 0, avgP: n ? sum.protein / n : 0, avgF: n ? sum.fat / n : 0, avgC: n ? sum.carbs / n : 0, loggedDays: n
      };
    }
    setWeekStats(results);
    setStatsLoading(false);
  }, []);

  useEffect(() => { refreshWeekStats(); }, [refreshWeekStats]);

  function saveFoods(next) {
    setFoods(next);
    safeSet('foods', JSON.stringify(next), true);
  }

  const weekDates = useMemo(() => getWeekDates(todayISO()), []);

  return (
    <div className="app-root">
      <style>{CSS}</style>
      <div className="stars" aria-hidden="true" />
      <header className="topbar">
        <div className="brand"><Sparkles size={18} className="brand-icon" /><span>NutriOrbit</span></div>
        <nav className="nav">
          <button className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}><LayoutDashboard size={16} />Dashboard</button>
          <button className={`nav-btn ${view === 'foods' ? 'active' : ''}`} onClick={() => setView('foods')}><Apple size={16} />Manage Foods</button>
        </nav>
      </header>

      <main className="main">
        {view === 'dashboard' && (
          <DashboardView
            weekStats={weekStats}
            statsLoading={statsLoading}
            weekDates={weekDates}
            onOpenLog={(p) => setModalProfile(p)}
          />
        )}
        {view === 'foods' && (
          <FoodsView foods={foods} onSave={saveFoods} ready={foodsReady} />
        )}
      </main>

      {modalProfile && (
        <LogModal
          profile={modalProfile}
          foods={foods}
          onClose={() => { setModalProfile(null); refreshWeekStats(); }}
        />
      )}
    </div>
  );
}
