// ════════════════════════════════════════════════
// CEDAR GROVE FLEET — app.js
// ════════════════════════════════════════════════

// ── STATIC DATA ──────────────────────────────────
const ALL_STATES = ['SD','MN','IA','NE','UT','WY','ND','WV','MT','KS','AL','WA','AZ','AR','CA','CO','CT','DE','FL','GA','WI','ID','IL','IN','KY','LA','ME','MD','MA','MI','MS','MO','NV','NH','NJ','NM','NY','NC','OH','OK','OR','PA','RI','SC','TN','TX','VT','VA'];
const TRUCKS = ['Peterbilt White 389','Mack Truck 384','Peterbilt Gray 388','Peterbilt G P 383','Peterbilt Silver 382','Peterbilt Red 381','Kenworth 384','Peterbilt R W 385','Peterbilt Pink 386','Freightliner Cooler'];
const CARGOS = ['Hogs','Milk','Rock & Sand','Bean Meal','Groceries','Wheat','DDG','Alfalfa','Farm work','Other'];
const SERVICE_TYPES = ['Oil Change','Grease','Oil Change + Grease','Tire Rotation','Brake Service','Other'];
const ROLES = ['Admin','Mechanic','Trucker'];

const DRIVERS_DB = [
  {name:'Tim',    role:'Admin',    email:'waldnertim82@gmail.com'},
  {name:'Tom',    role:'Mechanic', email:'cgtch36926@gmail.com'},
  {name:'Sam',    role:'Trucker',  email:'cgshw36926@gmail.com'},
  {name:'Jacob',  role:'Trucker',  email:'cgjkh36926@gmail.com'},
  {name:'Derek',  role:'Trucker',  email:'cgdth36926@gmail.com'},
  {name:'David',  role:'Trucker',  email:'cgdjh36926@gmail.com'},
  {name:'Cameron',role:'Trucker',  email:'cgcmw36926@gmail.com'},
  {name:'Bob',    role:'Trucker',  email:'cgbew36926@gmail.com'},
  {name:'Kenneth',role:'Trucker',  email:'cg.kenny1986@gmail.com'},
  {name:'Marvin', role:'Trucker',  email:'cgmew36926@gmail.com'},
  {name:'Joe',    role:'Trucker',  email:'cgjmaw36926@gmail.com'},
  {name:'Zack',   role:'Trucker',  email:'cgzsw36926@gmail.com'},
];

const TRUCKS_SVC = [
  {name:'Peterbilt White 389', mpg:4.41, maxOdom:1002106, lastSvc:965929,  nextGrease:970929,  nextOil:975929,  greased:false},
  {name:'Mack Truck 384',      mpg:5.33, maxOdom:1006546, lastSvc:928378,  nextGrease:933378,  nextOil:938378,  greased:true},
  {name:'Peterbilt Gray 388',  mpg:3.24, maxOdom:678806,  lastSvc:654119,  nextGrease:659119,  nextOil:664119,  greased:false},
  {name:'Peterbilt G P 383',   mpg:4.24, maxOdom:288584,  lastSvc:259160,  nextGrease:264160,  nextOil:269160,  greased:false},
  {name:'Peterbilt Silver 382',mpg:3.57, maxOdom:1173055, lastSvc:1148089, nextGrease:1153089, nextOil:1158089, greased:false},
  {name:'Peterbilt Red 381',   mpg:4.24, maxOdom:1141068, lastSvc:1114776, nextGrease:1119776, nextOil:1124776, greased:true},
  {name:'Kenworth 384',        mpg:2.95, maxOdom:767852,  lastSvc:757876,  nextGrease:762876,  nextOil:767876,  greased:false},
  {name:'Peterbilt R W 385',   mpg:3.63, maxOdom:896235,  lastSvc:870325,  nextGrease:875325,  nextOil:880325,  greased:false},
  {name:'Peterbilt Pink 386',  mpg:3.51, maxOdom:731733,  lastSvc:724048,  nextGrease:729048,  nextOil:734048,  greased:false},
  {name:'Freightliner Cooler', mpg:3.57, maxOdom:88571,   lastSvc:76992,   nextGrease:81992,   nextOil:86992,   greased:true},
];

// ── STATE ─────────────────────────────────────────
let scriptUrl     = '';
let currentUser   = null;
let localTrips    = [];
let localFuel     = [];
let localService  = [];
let localDrivers  = [];
let activeChip    = 'All';
let formType      = '';
let selectedStates = ['SD'];

// ── STORAGE ───────────────────────────────────────
const LS = {
  get:  (k, d=[])  => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):d; } catch(e){ return d; } },
  set:  (k, v)     => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} },
  str:  (k, d='')  => { try { return localStorage.getItem(k)||d; } catch(e){ return d; } },
  setStr:(k,v)     => { try { localStorage.setItem(k, v); } catch(e){} },
};

function loadAll() {
  scriptUrl    = LS.str('cg_url');
  localTrips   = LS.get('cg_trips');
  localFuel    = LS.get('cg_fuel');
  localService = LS.get('cg_service');
  localDrivers = LS.get('cg_drivers');
  const u = LS.str('cg_user');
  currentUser  = u ? JSON.parse(u) : null;
}

// ── LOGIN ─────────────────────────────────────────
function doLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  if (!email) { toast('Enter your email', 'err'); return; }

  let found = DRIVERS_DB.find(d => d.email.toLowerCase() === email);
  if (!found) {
    const local = localDrivers.find(d => (d['Email']||'').toLowerCase() === email);
    if (!local) { toast('Email not found — contact admin', 'err'); return; }
    found = { name: local['Name'], role: local['Role'], email };
  }
  currentUser = { name: found.name, role: found.role, email };
  LS.setStr('cg_user', JSON.stringify(currentUser));

  if (!scriptUrl) { showSetup(); return; }
  launchApp();
}

function signOut() {
  LS.setStr('cg_user', '');
  currentUser = null;
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-email').value = '';
}

// Handle Enter key on login
document.getElementById('login-email').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

// ── SETUP ─────────────────────────────────────────
function showSetup() {
  document.getElementById('setup-url').value = scriptUrl || '';
  document.getElementById('setup-screen').style.display = 'flex';
}
function closeSetup() {
  document.getElementById('setup-screen').style.display = 'none';
}
function saveSetup() {
  const url = document.getElementById('setup-url').value.trim();
  if (!url) { toast('Paste the Apps Script URL', 'err'); return; }
  LS.setStr('cg_url', url);
  scriptUrl = url;
  closeSetup();
  if (currentUser) launchApp();
}

// ── BOOT ──────────────────────────────────────────
loadAll();
if (currentUser && scriptUrl) {
  document.getElementById('login-screen').style.display = 'none';
  launchApp();
} else if (currentUser && !scriptUrl) {
  document.getElementById('login-screen').style.display = 'none';
  showSetup();
}

// Handle ?form= shortcut from PWA shortcuts
const urlParams = new URLSearchParams(window.location.search);
const shortcutForm = urlParams.get('form');
if (shortcutForm && currentUser && scriptUrl) {
  setTimeout(() => openForm(shortcutForm), 500);
}

function launchApp() {
  document.getElementById('login-screen').style.display  = 'none';
  document.getElementById('app').style.display           = 'flex';
  document.getElementById('user-chip').textContent       = currentUser.name;
  document.getElementById('acct-info').innerHTML =
    `<span style="color:var(--accent)">${currentUser.name}</span> · <span style="color:var(--muted)">${currentUser.role}</span><br>
     <span style="font-size:11px;color:var(--muted)">${currentUser.email}</span>`;
  renderDash();
  renderTruckChips();
  filterTrips();
  renderTrucks();
  renderRecentLog();
  setSyncStatus('ok');
  if (scriptUrl) syncAll();
}

// ── NAV ───────────────────────────────────────────
function goPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  btn.classList.add('active');
}

// ── SYNC ──────────────────────────────────────────
function setSyncStatus(s) { document.getElementById('sync-dot').className = 'sync-dot ' + s; }

async function syncAll() {
  if (!scriptUrl) return;
  setSyncStatus('syncing');
  try {
    for (const tab of ['trips','fuel','service','drivers']) {
      const r = await fetch(scriptUrl + '?action=read&tab=' + tab);
      const d = await r.json();
      if (d.status === 'ok') {
        if (tab === 'trips')   { localTrips   = d.data; LS.set('cg_trips',   d.data); }
        if (tab === 'fuel')    { localFuel    = d.data; LS.set('cg_fuel',    d.data); }
        if (tab === 'service') { localService = d.data; LS.set('cg_service', d.data); }
        if (tab === 'drivers') { localDrivers = d.data; LS.set('cg_drivers', d.data); }
      }
    }
    setSyncStatus('ok');
    toast('✓ Synced with Google Sheets', 'ok');
    renderDash(); filterTrips(); renderTrucks(); renderRecentLog();
  } catch (e) {
    setSyncStatus('err');
    toast('Sync failed – working offline', 'err');
  }
}

async function pushToSheets(tab, row) {
  if (!scriptUrl) return null;
  setSyncStatus('syncing');
  try {
    const r = await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'write', tab, row }),
      headers: { 'Content-Type': 'application/json' }
    });
    const d = await r.json();
    setSyncStatus('ok');
    return d.id || null;
  } catch (e) {
    setSyncStatus('err');
    return null;
  }
}

async function deleteFromSheets(tab, id) {
  if (!scriptUrl) return;
  try {
    await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', tab, id }),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {}
}

// ── DASHBOARD ─────────────────────────────────────
function renderDash() {
  const totalMiles = 1507422 + localTrips.reduce((s,t) => s + (+t['Total Miles']||0), 0);
  const totalFuel  = 96470   + localTrips.reduce((s,t) => s + (+t['Fuel Used']||0),   0);
  const avgMpg     = totalFuel > 0 ? totalMiles / totalFuel : 4.74;

  document.getElementById('dash-stats').innerHTML = `
    <div class="stat-card" style="--ac:var(--accent)">
      <div class="stat-label">Total Miles</div>
      <div class="stat-value">${(totalMiles/1e6).toFixed(2)}M</div>
      <div class="stat-sub">All trips</div>
    </div>
    <div class="stat-card" style="--ac:var(--accent3)">
      <div class="stat-label">Fleet MPG</div>
      <div class="stat-value">${avgMpg.toFixed(2)}</div>
      <div class="stat-sub">Average</div>
    </div>
    <div class="stat-card" style="--ac:var(--accent2)">
      <div class="stat-label">Fuel Used</div>
      <div class="stat-value">${(totalFuel/1000).toFixed(1)}K</div>
      <div class="stat-sub">Gallons</div>
    </div>
    <div class="stat-card" style="--ac:var(--warn)">
      <div class="stat-label">Total Trips</div>
      <div class="stat-value">${1301 + localTrips.length}</div>
      <div class="stat-sub">All time</div>
    </div>`;

  const sorted = [...TRUCKS_SVC].sort((a,b) => b.mpg - a.mpg);
  const max = Math.max(...sorted.map(t => t.mpg));
  document.getElementById('mpg-chart').innerHTML = sorted.map(t => `
    <div class="mpg-wrap">
      <div class="mpg-hd">
        <span class="mpg-name">${t.name.replace('Peterbilt ','PB ')}</span>
        <span class="mpg-val">${t.mpg.toFixed(2)} mpg</span>
      </div>
      <div class="mpg-track"><div class="mpg-fill" style="width:${(t.mpg/max*100).toFixed(1)}%"></div></div>
    </div>`).join('');

  document.getElementById('dash-alerts').innerHTML = TRUCKS_SVC.map(t => {
    const ml = t.nextOil - t.maxOdom;
    if (ml <= 0)     return `<div class="alert-row danger"><span class="alert-icon">🚨</span><div class="alert-info"><div class="alert-title">${t.name}</div><div class="alert-sub">Oil change OVERDUE</div></div><div class="alert-mi" style="color:var(--danger)">${Math.abs(ml).toLocaleString()} over</div></div>`;
    if (ml <= 10000) return `<div class="alert-row"><span class="alert-icon">⚠️</span><div class="alert-info"><div class="alert-title">${t.name}</div><div class="alert-sub">Oil change due soon</div></div><div class="alert-mi" style="color:var(--warn)">${ml.toLocaleString()} mi</div></div>`;
    return             `<div class="alert-row ok"><span class="alert-icon">✅</span><div class="alert-info"><div class="alert-title">${t.name}</div><div class="alert-sub">Service OK</div></div><div class="alert-mi" style="color:var(--accent3)">${ml.toLocaleString()} mi</div></div>`;
  }).join('');
}

// ── TRIPS ─────────────────────────────────────────
function renderTruckChips() {
  document.getElementById('truck-chips').innerHTML =
    ['All', ...TRUCKS].map(n =>
      `<div class="chip ${n===activeChip?'on':''}" onclick="setChip('${n}')">${n.replace('Peterbilt ','PB ')}</div>`
    ).join('');
}
function setChip(n) { activeChip = n; renderTruckChips(); filterTrips(); }

function filterTrips() {
  const q = (document.getElementById('trip-search')?.value || '').toLowerCase();
  const list = localTrips.filter(t => {
    const mc = activeChip === 'All' || t['Truck'] === activeChip;
    const mq = !q || ['Driver','Destination','Cargo','Truck'].some(k => (t[k]||'').toLowerCase().includes(q));
    return mc && mq;
  });
  const el = document.getElementById('trip-list');
  if (!list.length) {
    el.innerHTML = '<div class="empty"><div class="empty-icon">🛣️</div><div>No trips yet — tap Log to add one</div></div>';
    return;
  }
  el.innerHTML = list.slice(0, 60).map((t, i) => `
    <div class="row-card" onclick='showTripDetail(${JSON.stringify(t)})'>
      <div class="row-dot" style="color:var(--accent);background:var(--accent)"></div>
      <div class="row-info">
        <div class="row-title">${t['Start Location']||'—'} → ${t['Destination']||'—'}</div>
        <div class="row-meta">${(t['Truck']||'').replace('Peterbilt ','')} · ${t['Driver']||''} · ${t['Cargo']||''}</div>
        <div class="row-meta">${(t['Date']||'').substring(0,10)}</div>
      </div>
      <div class="row-right">
        <div class="row-val">${+t['Fuel Avg (MPG)']>0 ? (+t['Fuel Avg (MPG)']).toFixed(2)+' mpg' : '—'}</div>
        <div class="row-sub">${(+t['Total Miles']||0).toLocaleString()} mi</div>
      </div>
    </div>`).join('');
}

function showTripDetail(t) {
  document.getElementById('detail-title').textContent = (t['Start Location']||'?') + ' → ' + (t['Destination']||'?');
  document.getElementById('detail-body').innerHTML = `
    <div class="detail-row"><span class="dl">Truck</span><span class="dv">${t['Truck']||'—'}</span></div>
    <div class="detail-row"><span class="dl">Driver</span><span class="dv">${t['Driver']||'—'}</span></div>
    <div class="detail-row"><span class="dl">Date</span><span class="dv">${(t['Date']||'').substring(0,10)}</span></div>
    <div class="detail-row"><span class="dl">Cargo</span><span class="dv">${t['Cargo']||'—'}</span></div>
    <div class="detail-row"><span class="dl">Highways</span><span class="dv">${t['Highways']||'—'}</span></div>
    <div class="detail-row"><span class="dl">Begin Odom</span><span class="dv">${(+t['Begin Odometer']||0).toLocaleString()}</span></div>
    <div class="detail-row"><span class="dl">End Odom</span><span class="dv">${(+t['End Odometer']||0).toLocaleString()}</span></div>
    <div class="detail-row"><span class="dl">Total Miles</span><span class="dv" style="color:var(--accent)">${(+t['Total Miles']||0).toLocaleString()}</span></div>
    <div class="detail-row"><span class="dl">SD Miles</span><span class="dv">${t['SD Miles']||'—'}</span></div>
    <div class="detail-row"><span class="dl">MN Miles</span><span class="dv">${t['MN Miles']||'—'}</span></div>
    <div class="detail-row"><span class="dl">IA Miles</span><span class="dv">${t['IA Miles']||'—'}</span></div>
    <div class="detail-row"><span class="dl">NE Miles</span><span class="dv">${t['NE Miles']||'—'}</span></div>
    <div class="detail-row"><span class="dl">Fuel Used</span><span class="dv">${+t['Fuel Used']>0 ? t['Fuel Used']+' gal' : '—'}</span></div>
    <div class="detail-row"><span class="dl">MPG</span><span class="dv" style="color:var(--accent3)">${+t['Fuel Avg (MPG)']>0 ? (+t['Fuel Avg (MPG)']).toFixed(3)+' mpg' : '—'}</span></div>
    ${t['Notes'] ? `<div class="detail-row"><span class="dl">Notes</span><span class="dv">${t['Notes']}</span></div>` : ''}
    <button class="btn-danger-sm" onclick="deleteEntry('trips','${t['ID']}')">🗑 Delete Trip</button>`;
  openOverlay('detail-overlay');
}

// ── TRUCKS ────────────────────────────────────────
function renderTrucks() {
  document.getElementById('truck-list').innerHTML = TRUCKS_SVC.map((t, i) => {
    const ml  = t.nextOil - t.maxOdom;
    const pct = Math.min(100, ((t.maxOdom - t.lastSvc) / 5000 * 100));
    let badge, bc;
    if (ml <= 0)     { badge = 'OVERDUE';      bc = 'badge-danger'; }
    else if (ml <= 8000) { badge = 'SERVICE SOON'; bc = 'badge-warn'; }
    else             { badge = 'OK';           bc = 'badge-ok'; }
    return `
    <div class="card" style="cursor:pointer" onclick="showTruckDetail(${i})">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700">🚛 ${t.name}</div>
        <div class="badge ${bc}">${badge}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        <div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px">Odometer</div>
             <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:600">${(t.maxOdom/1000).toFixed(1)}K</div></div>
        <div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px">Avg MPG</div>
             <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:600;color:var(--accent3)">${t.mpg.toFixed(2)}</div></div>
        <div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px">Oil Left</div>
             <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:600;color:${ml<=0?'var(--danger)':ml<=8000?'var(--warn)':'var(--text)'}">${ml<=0?'OVER':ml.toLocaleString()}</div></div>
      </div>
      <div style="background:var(--border);border-radius:4px;height:4px;margin-top:10px">
        <div style="width:${Math.min(100,pct).toFixed(0)}%;height:100%;border-radius:4px;background:${pct>80?'var(--danger)':pct>50?'var(--warn)':'var(--accent)'}"></div>
      </div>
    </div>`;
  }).join('');
}

function showTruckDetail(i) {
  const t  = TRUCKS_SVC[i];
  const ml = t.nextOil - t.maxOdom;
  document.getElementById('detail-title').textContent = '🚛 ' + t.name;
  document.getElementById('detail-body').innerHTML = `
    <div class="detail-row"><span class="dl">Odometer</span><span class="dv" style="color:var(--accent)">${t.maxOdom.toLocaleString()} mi</span></div>
    <div class="detail-row"><span class="dl">Last Service At</span><span class="dv">${t.lastSvc.toLocaleString()} mi</span></div>
    <div class="detail-row"><span class="dl">Next Grease</span><span class="dv">${t.nextGrease.toLocaleString()} mi</span></div>
    <div class="detail-row"><span class="dl">Next Oil Change</span><span class="dv">${t.nextOil.toLocaleString()} mi</span></div>
    <div class="detail-row"><span class="dl">Miles to Oil Change</span>
      <span class="dv" style="color:${ml<=0?'var(--danger)':ml<=8000?'var(--warn)':'var(--accent3)'}">
        ${ml<=0 ? 'OVERDUE by '+Math.abs(ml).toLocaleString() : ml.toLocaleString()}
      </span>
    </div>
    <div class="detail-row"><span class="dl">Fleet MPG</span><span class="dv" style="color:var(--accent3)">${t.mpg.toFixed(2)}</span></div>
    <div class="detail-row"><span class="dl">Greased?</span><span class="dv">${t.greased ? '✅ Yes' : '❌ No'}</span></div>`;
  openOverlay('detail-overlay');
}

// ── RECENT LOG ────────────────────────────────────
function renderRecentLog() {
  const all = [
    ...localTrips.map(t => ({ icon:'🛣️', title:(t['Driver']||'')+' → '+(t['Destination']||''), sub:t['Truck']||'', date:(t['Date']||'').substring(0,10), id:t['ID'], tab:'trips' })),
    ...localFuel.map(f => ({ icon:'⛽', title:(f['Gallons']||'')+'gal · '+(f['Truck']||''), sub:'$'+(f['Total Cost']||''), date:(f['Date']||'').substring(0,10), id:f['ID'], tab:'fuel' })),
    ...localService.map(s => ({ icon:'🔧', title:(s['Service Type']||'')+' · '+(s['Truck']||''), sub:s['Performed By']||'', date:(s['Date']||'').substring(0,10), id:s['ID'], tab:'service' })),
    ...localDrivers.map(d => ({ icon:'👤', title:(d['Name']||'')+' ('+d['Role']+')', sub:d['Email']||'', date:(d['Timestamp']||'').substring(0,10), id:d['ID'], tab:'drivers' })),
  ].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 20);

  const el = document.getElementById('recent-log');
  if (!all.length) { el.innerHTML = '<div class="empty"><div class="empty-icon">📋</div><div>No entries yet</div></div>'; return; }
  el.innerHTML = all.map(e => `
    <div class="row-card">
      <div class="row-dot" style="color:var(--accent3);background:var(--accent3)"></div>
      <div class="row-info">
        <div class="row-title">${e.icon} ${e.title}</div>
        <div class="row-meta">${e.sub}</div>
      </div>
      <div class="row-right">
        <div class="row-sub">${e.date}</div>
        <div style="font-size:9px;color:var(--danger);cursor:pointer;margin-top:4px" onclick="deleteEntry('${e.tab}','${e.id}')">✕ delete</div>
      </div>
    </div>`).join('');
}

// ── DELETE ────────────────────────────────────────
function deleteEntry(tab, id) {
  if (!confirm('Delete this entry?')) return;
  const map = { trips: localTrips, fuel: localFuel, service: localService, drivers: localDrivers };
  const arr = map[tab].filter(r => r['ID'] !== id);
  if (tab === 'trips')   { localTrips   = arr; LS.set('cg_trips',   arr); }
  if (tab === 'fuel')    { localFuel    = arr; LS.set('cg_fuel',    arr); }
  if (tab === 'service') { localService = arr; LS.set('cg_service', arr); }
  if (tab === 'drivers') { localDrivers = arr; LS.set('cg_drivers', arr); }
  closeOverlay('detail-overlay');
  renderRecentLog(); filterTrips(); renderDash();
  deleteFromSheets(tab, id);
  toast('Entry deleted', 'ok');
}

// ── FORMS ─────────────────────────────────────────
function openForm(type) {
  formType = type;
  selectedStates = ['SD'];
  const titles = { trip:'🛣️ Log Trip', fuel:'⛽ Fuel Fill-Up', service:'🔧 Service Record', driver:'👤 Add Driver' };
  document.getElementById('form-title').textContent = titles[type];
  document.getElementById('form-body').innerHTML = buildForm(type);
  openOverlay('form-overlay');
  if (type === 'trip') {
    renderStateButtons();
    renderStateMilesInputs();
    document.getElementById('f-truck').addEventListener('change', onTruckChange);
  }
}

function buildForm(type) {
  const today = new Date().toISOString().split('T')[0];
  const truckOpts  = TRUCKS.map(t => `<option value="${t}">${t}</option>`).join('');
  const driverOpts = DRIVERS_DB.map(d => `<option value="${d.name}">${d.name}</option>`).join('');

  if (type === 'trip') return `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="fi" type="date" id="f-date" value="${today}">
      </div>
      <div class="form-group">
        <label class="form-label">Driver <span class="auto-tag">AUTO</span></label>
        <input class="fi auto" id="f-driver" value="${currentUser?.name||''}" readonly>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Truck</label>
      <select class="fs" id="f-truck"><option value="">Select truck…</option>${truckOpts}</select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Start Location</label>
        <input class="fi" id="f-start" placeholder="Cedar Grove">
      </div>
      <div class="form-group">
        <label class="form-label">Destination</label>
        <input class="fi" id="f-dest" placeholder="e.g. Norfolk">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Load Stop</label>
        <input class="fi" id="f-loadstop" placeholder="Optional">
      </div>
      <div class="form-group">
        <label class="form-label">End Location</label>
        <input class="fi" id="f-endloc" placeholder="e.g. Cedar Grove">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Cargo / Trip Type</label>
      <select class="fs" id="f-cargo"><option value="">Select…</option>${CARGOS.map(c=>`<option>${c}</option>`).join('')}</select>
    </div>
    <div class="form-group">
      <label class="form-label">Highways</label>
      <input class="fi" id="f-hwys" placeholder="e.g. 45, I90, I29">
    </div>

    <div class="sec" style="margin-top:8px">States Traveled</div>
    <div id="state-buttons" class="state-grid"></div>
    <div id="state-miles" class="state-miles-grid" style="margin-top:10px"></div>

    <div class="sec" style="margin-top:8px">Odometer</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Begin Odom <span class="auto-tag">AUTO</span></label>
        <input class="fi auto" type="number" id="f-begin" placeholder="Select truck first…" oninput="calcTrip()">
      </div>
      <div class="form-group">
        <label class="form-label">End Odom</label>
        <input class="fi" type="number" id="f-end" placeholder="Enter ending miles" oninput="calcTrip()">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Total Miles <span class="calc-tag">CALC</span></label>
        <input class="fi" id="f-totalmiles" readonly placeholder="—">
      </div>
      <div class="form-group">
        <label class="form-label">Fuel Used (gal)</label>
        <input class="fi" type="number" id="f-fuel" placeholder="0" oninput="calcTrip()">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Fuel Avg MPG <span class="calc-tag">CALC</span></label>
      <input class="fi" id="f-mpg" readonly placeholder="—">
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea class="ft" id="f-notes"></textarea>
    </div>
    <button class="btn-primary" onclick="submitForm()">Save Trip to Google Sheets</button>
    <button class="btn-ghost" onclick="closeOverlay('form-overlay')">Cancel</button>`;

  if (type === 'fuel') return `
    <div class="form-row">
      <div class="form-group"><label class="form-label">Date</label><input class="fi" type="date" id="f-date" value="${today}"></div>
      <div class="form-group"><label class="form-label">Driver <span class="auto-tag">AUTO</span></label><input class="fi auto" id="f-driver" value="${currentUser?.name||''}" readonly></div>
    </div>
    <div class="form-group"><label class="form-label">Truck</label><select class="fs" id="f-truck"><option value="">Select…</option>${truckOpts}</select></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Gallons</label><input class="fi" type="number" step="0.1" id="f-gallons" placeholder="150" oninput="calcFuel()"></div>
      <div class="form-group"><label class="form-label">Price / Gal</label><input class="fi" type="number" step="0.001" id="f-price" placeholder="3.85" oninput="calcFuel()"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Total Cost <span class="calc-tag">CALC</span></label><input class="fi" id="f-cost" readonly placeholder="—"></div>
      <div class="form-group"><label class="form-label">Odometer</label><input class="fi" type="number" id="f-odom" placeholder="123456"></div>
    </div>
    <div class="form-group"><label class="form-label">Location / Station</label><input class="fi" id="f-location" placeholder="e.g. Cedar Grove Tank"></div>
    <div class="form-group"><label class="form-label">Notes</label><textarea class="ft" id="f-notes"></textarea></div>
    <button class="btn-primary" onclick="submitForm()">Save Fuel Log</button>
    <button class="btn-ghost" onclick="closeOverlay('form-overlay')">Cancel</button>`;

  if (type === 'service') return `
    <div class="form-row">
      <div class="form-group"><label class="form-label">Date</label><input class="fi" type="date" id="f-date" value="${today}"></div>
      <div class="form-group"><label class="form-label">Performed By</label><select class="fs" id="f-tech"><option value="">Select…</option>${driverOpts}</select></div>
    </div>
    <div class="form-group"><label class="form-label">Truck</label><select class="fs" id="f-truck"><option value="">Select…</option>${truckOpts}</select></div>
    <div class="form-group"><label class="form-label">Service Type</label><select class="fs" id="f-svctype"><option value="">Select…</option>${SERVICE_TYPES.map(s=>`<option>${s}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Odometer at Service</label><input class="fi" type="number" id="f-odom" placeholder="987654" oninput="calcService()"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Next Grease At <span class="calc-tag">CALC</span></label><input class="fi" id="f-nextgrease" readonly placeholder="—"></div>
      <div class="form-group"><label class="form-label">Next Oil At <span class="calc-tag">CALC</span></label><input class="fi" id="f-nextoil" readonly placeholder="—"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Oil Changed?</label><select class="fs" id="f-oil"><option>No</option><option>Yes</option></select></div>
      <div class="form-group"><label class="form-label">Greased?</label><select class="fs" id="f-greased"><option>No</option><option>Yes</option></select></div>
    </div>
    <div class="form-group"><label class="form-label">Notes</label><textarea class="ft" id="f-notes"></textarea></div>
    <button class="btn-primary" onclick="submitForm()">Save Service Record</button>
    <button class="btn-ghost" onclick="closeOverlay('form-overlay')">Cancel</button>`;

  if (type === 'driver') return `
    <div class="form-row">
      <div class="form-group"><label class="form-label">Name</label><input class="fi" id="f-name" placeholder="First name"></div>
      <div class="form-group"><label class="form-label">Role</label><select class="fs" id="f-role"><option value="">Select…</option>${ROLES.map(r=>`<option>${r}</option>`).join('')}</select></div>
    </div>
    <div class="form-group"><label class="form-label">Email</label><input class="fi" type="email" id="f-email" placeholder="name@cedargrovecolony.com"></div>
    <div class="form-group"><label class="form-label">Phone</label><input class="fi" type="tel" id="f-phone" placeholder="605-000-0000"></div>
    <div class="form-group"><label class="form-label">Text Number</label><input class="fi" id="f-textnum" placeholder="6055551234@vtext.com"></div>
    <div class="form-group"><label class="form-label">Active?</label><select class="fs" id="f-active"><option>Yes</option><option>No</option></select></div>
    <button class="btn-primary" onclick="submitForm()">Save Driver</button>
    <button class="btn-ghost" onclick="closeOverlay('form-overlay')">Cancel</button>`;
}

// ── SMART TRIP LOGIC ──────────────────────────────
function onTruckChange() {
  const truck = document.getElementById('f-truck')?.value;
  if (!truck) return;
  const prev = localTrips
    .filter(t => t['Truck'] === truck && +t['End Odometer'] > 0)
    .sort((a,b) => (+b['End Odometer']) - (+a['End Odometer']));
  const beginEl = document.getElementById('f-begin');
  if (!beginEl) return;
  if (prev.length) {
    beginEl.value = prev[0]['End Odometer'];
  } else {
    const svc = TRUCKS_SVC.find(t => t.name === truck);
    if (svc) beginEl.value = svc.maxOdom;
  }
  calcTrip();
}

function renderStateButtons() {
  document.getElementById('state-buttons').innerHTML = ALL_STATES.map(s => {
    const on     = selectedStates.includes(s);
    const locked = s === 'SD';
    return `<button class="state-btn ${on?'on':''} ${locked?'locked':''}" onclick="toggleState('${s}')">${s}</button>`;
  }).join('');
}

function toggleState(s) {
  if (s === 'SD') { toast('SD is always included', 'err'); return; }
  selectedStates = selectedStates.includes(s)
    ? selectedStates.filter(x => x !== s)
    : [...selectedStates, s];
  renderStateButtons();
  renderStateMilesInputs();
  calcTrip();
}

function renderStateMilesInputs() {
  const others = selectedStates.filter(s => s !== 'SD');
  const el = document.getElementById('state-miles');
  if (!others.length) {
    el.innerHTML = `<div style="grid-column:1/-1;font-size:11px;color:var(--muted)">SD only — SD Miles = Total Miles <span class="calc-tag">CALC</span></div>`;
    return;
  }
  el.innerHTML = others.map(s => `
    <div class="form-group">
      <label class="form-label">${s} Miles</label>
      <input class="fi" type="number" id="f-state-${s}" placeholder="0" oninput="calcTrip()">
    </div>`).join('') +
    `<div style="grid-column:1/-1;font-size:11px;color:var(--muted);margin-top:2px">
       SD Miles = Total Miles − Other States <span class="calc-tag">CALC</span>
     </div>`;
}

function calcTrip() {
  const begin = parseFloat(document.getElementById('f-begin')?.value) || 0;
  const end   = parseFloat(document.getElementById('f-end')?.value)   || 0;
  const fuel  = parseFloat(document.getElementById('f-fuel')?.value)  || 0;
  const miles = end > begin ? end - begin : 0;

  const tmEl  = document.getElementById('f-totalmiles');
  const mpgEl = document.getElementById('f-mpg');
  if (tmEl)  tmEl.value  = miles > 0 ? miles : '';
  if (mpgEl) mpgEl.value = (fuel > 0 && miles > 0) ? (miles / fuel).toFixed(3) : '';

  // Recalculate SD display note if SD-only
  const others    = selectedStates.filter(s => s !== 'SD');
  const otherSum  = others.reduce((s, st) => s + (parseFloat(document.getElementById('f-state-' + st)?.value) || 0), 0);
  const sdMiles   = miles > 0 ? Math.max(0, miles - otherSum) : 0;

  if (!others.length) {
    const el = document.getElementById('state-miles');
    if (el) el.innerHTML = `<div style="grid-column:1/-1;font-size:11px;color:var(--muted)">SD only — SD Miles = <strong style="color:var(--accent3)">${miles > 0 ? miles.toLocaleString() : 'Total Miles'}</strong> <span class="calc-tag">CALC</span></div>`;
  }
}

function calcFuel() {
  const g = parseFloat(document.getElementById('f-gallons')?.value) || 0;
  const p = parseFloat(document.getElementById('f-price')?.value)   || 0;
  const el = document.getElementById('f-cost');
  if (el) el.value = g && p ? '$' + (g * p).toFixed(2) : '';
}

function calcService() {
  const odom = parseFloat(document.getElementById('f-odom')?.value) || 0;
  const ng = document.getElementById('f-nextgrease');
  const no = document.getElementById('f-nextoil');
  if (ng) ng.value = odom > 0 ? odom + 5000  : '';
  if (no) no.value = odom > 0 ? odom + 10000 : '';
}

// ── SUBMIT ────────────────────────────────────────
async function submitForm() {
  const btn = document.querySelector('#form-body .btn-primary');
  btn.disabled = true; btn.textContent = 'Saving…';
  let row = {}, tab = '';

  if (formType === 'trip') {
    tab = 'trips';
    const begin = parseFloat(document.getElementById('f-begin')?.value) || 0;
    const end   = parseFloat(document.getElementById('f-end')?.value)   || 0;
    const fuel  = parseFloat(document.getElementById('f-fuel')?.value)  || 0;
    const miles = end > begin ? end - begin : 0;
    const mpg   = fuel > 0 && miles > 0 ? miles / fuel : 0;
    const others    = selectedStates.filter(s => s !== 'SD');
    const otherSum  = others.reduce((s, st) => s + (parseFloat(document.getElementById('f-state-' + st)?.value) || 0), 0);
    const sdMiles   = miles > 0 ? Math.max(0, miles - otherSum) : 0;

    if (!document.getElementById('f-truck')?.value || !end) {
      toast('Truck & end odometer required', 'err');
      btn.disabled = false; btn.textContent = 'Save Trip to Google Sheets'; return;
    }

    const stateMiles = {};
    ALL_STATES.forEach(s => {
      if (s === 'SD') stateMiles['SD Miles'] = sdMiles;
      else stateMiles[s + ' Miles'] = selectedStates.includes(s) ? (parseFloat(document.getElementById('f-state-' + s)?.value) || 0) : 0;
    });

    row = {
      'Truck':          document.getElementById('f-truck').value,
      'Driver':         document.getElementById('f-driver').value,
      'Date':           document.getElementById('f-date').value,
      'Start Location': document.getElementById('f-start').value,
      'Destination':    document.getElementById('f-dest').value,
      'Load Stop':      document.getElementById('f-loadstop').value,
      'End':            document.getElementById('f-endloc').value,
      'Cargo':          document.getElementById('f-cargo').value,
      'Highways':       document.getElementById('f-hwys').value,
      'Begin Odometer': begin,
      'End Odometer':   end,
      'Total Miles':    miles,
      'Fuel Used':      fuel,
      'Fuel Avg (MPG)': mpg.toFixed(3),
      'Notes':          document.getElementById('f-notes').value,
      ...stateMiles,
    };
  }
  else if (formType === 'fuel') {
    tab = 'fuel';
    const g = parseFloat(document.getElementById('f-gallons')?.value) || 0;
    const p = parseFloat(document.getElementById('f-price')?.value)   || 0;
    if (!document.getElementById('f-truck')?.value || !g) {
      toast('Truck & gallons required', 'err');
      btn.disabled = false; btn.textContent = 'Save Fuel Log'; return;
    }
    row = {
      'Date':            document.getElementById('f-date').value,
      'Truck':           document.getElementById('f-truck').value,
      'Driver':          document.getElementById('f-driver').value,
      'Gallons':         g,
      'Price Per Gallon':p,
      'Total Cost':      (g * p).toFixed(2),
      'Odometer':        document.getElementById('f-odom').value,
      'Location':        document.getElementById('f-location').value,
      'Notes':           document.getElementById('f-notes').value,
    };
  }
  else if (formType === 'service') {
    tab = 'service';
    if (!document.getElementById('f-truck')?.value || !document.getElementById('f-svctype')?.value) {
      toast('Truck & service type required', 'err');
      btn.disabled = false; btn.textContent = 'Save Service Record'; return;
    }
    row = {
      'Date':           document.getElementById('f-date').value,
      'Truck':          document.getElementById('f-truck').value,
      'Service Type':   document.getElementById('f-svctype').value,
      'Odometer':       document.getElementById('f-odom').value,
      'Greased':        document.getElementById('f-greased').value,
      'Oil Changed':    document.getElementById('f-oil').value,
      'Next Grease At': document.getElementById('f-nextgrease').value,
      'Next Oil At':    document.getElementById('f-nextoil').value,
      'Performed By':   document.getElementById('f-tech').value,
      'Notes':          document.getElementById('f-notes').value,
    };
  }
  else if (formType === 'driver') {
    tab = 'drivers';
    if (!document.getElementById('f-name')?.value || !document.getElementById('f-role')?.value) {
      toast('Name & role required', 'err');
      btn.disabled = false; btn.textContent = 'Save Driver'; return;
    }
    row = {
      'Name':        document.getElementById('f-name').value,
      'Role':        document.getElementById('f-role').value,
      'Email':       document.getElementById('f-email').value,
      'Phone':       document.getElementById('f-phone').value,
      'Text Number': document.getElementById('f-textnum').value,
      'Active':      document.getElementById('f-active').value,
    };
  }

  // Save locally first
  row['ID'] = 'local_' + Date.now();
  if (tab === 'trips')   { localTrips.push(row);   LS.set('cg_trips',   localTrips); }
  if (tab === 'fuel')    { localFuel.push(row);     LS.set('cg_fuel',    localFuel); }
  if (tab === 'service') { localService.push(row);  LS.set('cg_service', localService); }
  if (tab === 'drivers') { localDrivers.push(row);  LS.set('cg_drivers', localDrivers); }

  // Push to Sheets
  const sheetId = await pushToSheets(tab, row);
  if (sheetId) {
    row['ID'] = sheetId;
    if (tab === 'trips')   LS.set('cg_trips',   localTrips);
    if (tab === 'fuel')    LS.set('cg_fuel',    localFuel);
    if (tab === 'service') LS.set('cg_service', localService);
    if (tab === 'drivers') LS.set('cg_drivers', localDrivers);
  }

  closeOverlay('form-overlay');
  renderRecentLog(); filterTrips(); renderDash();
  toast(sheetId ? '✓ Saved to Google Sheets' : '✓ Saved locally', 'ok');
}

// ── OVERLAYS ──────────────────────────────────────
function openOverlay(id)  { document.getElementById(id).classList.add('open'); }
function closeOverlay(id) { document.getElementById(id).classList.remove('open'); }
function overlayClick(e, id) { if (e.target === document.getElementById(id)) closeOverlay(id); }

// ── TOAST ─────────────────────────────────────────
function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show ' + (type === 'ok' ? 'ok' : type === 'err' ? 'err' : '');
  setTimeout(() => el.className = '', 2600);
}

// ── SERVICE WORKER ────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
