(function(){
'use strict';

// ============ CONFIG ============
const STORAGE_KEY = 'bourse_ecole_v1';
const TICK_MS = 2000;
const HISTORY_LEN = 60;
const MAX_CATCHUP_TICKS = 500;
const NEWS_DURATION_TICKS = 20;
const NEWS_CHANCE = 0.014;

// ============ DATA ============
const SECTORS = [
  {id:'tech',  label:'Technologies'},
  {id:'comm',  label:'Communications'},
  {id:'metal', label:'Métaux'},
  {id:'manuf', label:'Manufacturier'}
];

const STOCKS_DEF = [
  {ticker:'AAPL',  name:'Apple Inc.',              sector:'tech',  basePrice:215.40, vol:0.0025},
  {ticker:'MSFT',  name:'Microsoft Corp.',         sector:'tech',  basePrice:432.80, vol:0.0022},
  {ticker:'NVDA',  name:'NVIDIA Corp.',            sector:'tech',  basePrice:124.15, vol:0.0045},
  {ticker:'GOOGL', name:'Alphabet (Google)',       sector:'tech',  basePrice:175.90, vol:0.0028},
  {ticker:'META',  name:'Meta Platforms',          sector:'tech',  basePrice:512.30, vol:0.0035},
  {ticker:'VZ',    name:'Verizon',                 sector:'comm',  basePrice: 41.25, vol:0.0015},
  {ticker:'T',     name:'AT&T',                    sector:'comm',  basePrice: 22.80, vol:0.0018},
  {ticker:'TMUS',  name:'T-Mobile',                sector:'comm',  basePrice:198.40, vol:0.0022},
  {ticker:'CMCSA', name:'Comcast',                 sector:'comm',  basePrice: 39.10, vol:0.0020},
  {ticker:'CHTR',  name:'Charter Communications',  sector:'comm',  basePrice:312.50, vol:0.0030},
  {ticker:'BHP',   name:'BHP Group',               sector:'metal', basePrice: 54.20, vol:0.0030},
  {ticker:'RIO',   name:'Rio Tinto',               sector:'metal', basePrice: 65.85, vol:0.0028},
  {ticker:'VALE',  name:'Vale S.A.',               sector:'metal', basePrice: 10.40, vol:0.0040},
  {ticker:'NEM',   name:'Newmont Corp.',           sector:'metal', basePrice: 48.70, vol:0.0035},
  {ticker:'FCX',   name:'Freeport-McMoRan',        sector:'metal', basePrice: 44.55, vol:0.0038},
  {ticker:'CAT',   name:'Caterpillar',             sector:'manuf', basePrice:348.20, vol:0.0025},
  {ticker:'GE',    name:'GE Aerospace',            sector:'manuf', basePrice:178.60, vol:0.0028},
  {ticker:'BA',    name:'Boeing',                  sector:'manuf', basePrice:182.40, vol:0.0042},
  {ticker:'HON',   name:'Honeywell',               sector:'manuf', basePrice:214.30, vol:0.0020},
  {ticker:'MMM',   name:'3M Company',              sector:'manuf', basePrice:132.85, vol:0.0025}
];

const NEWS_POOL = [
  {ticker:'NVDA',  bias:+1.3, text:"NVIDIA dévoile une puce IA révolutionnaire — Wall Street s'emballe.", why:"Quand une entreprise annonce un produit majeur, la demande pour ses actions explose."},
  {ticker:'AAPL',  bias:-0.9, text:"Apple visé par une enquête antitrust en Europe.", why:"Les enquêtes réglementaires créent de l'incertitude — les investisseurs vendent par prudence."},
  {ticker:'MSFT',  bias:+1.1, text:"Microsoft signe un contrat cloud de 5 G$ avec un gouvernement.", why:"Un gros contrat garantit des revenus futurs, donc une valeur d'action plus élevée."},
  {ticker:'META',  bias:-0.8, text:"Meta poursuivi en justice pour atteinte à la vie privée.", why:"Les amendes potentielles inquiètent les actionnaires."},
  {ticker:'GOOGL', bias:+0.7, text:"Google publie des résultats trimestriels au-dessus des attentes.", why:"Battre les prévisions des analystes est un signal très positif."},
  {ticker:'BA',    bias:+1.2, text:"Boeing décroche un contrat militaire majeur.", why:"Les contrats militaires sont stables et lucratifs sur le long terme."},
  {ticker:'BA',    bias:-1.5, text:"Un problème technique cloue un modèle Boeing au sol.", why:"Les risques de sécurité font chuter rapidement la confiance des marchés."},
  {ticker:'CAT',   bias:+0.8, text:"Caterpillar profite du boom des grands chantiers d'infrastructure.", why:"Plus de construction = plus de machines vendues."},
  {ticker:'GE',    bias:+0.9, text:"GE Aerospace augmente sa production de moteurs.", why:"Une hausse de production traduit une forte demande client."},
  {ticker:'BHP',   bias:+1.0, text:"Le prix du cuivre s'envole — les miniers en profitent.", why:"Quand les matières premières montent, les entreprises qui les extraient gagnent plus."},
  {ticker:'VALE',  bias:-1.1, text:"Vale ferme une mine pour raisons environnementales.", why:"Moins de production = moins de revenus."},
  {ticker:'NEM',   bias:+0.9, text:"L'or atteint un nouveau sommet historique.", why:"Newmont produit de l'or — ses revenus suivent directement le prix du métal."},
  {ticker:'TMUS',  bias:+0.8, text:"T-Mobile ajoute 2 millions d'abonnés ce trimestre.", why:"Plus d'abonnés = plus de revenus récurrents."},
  {ticker:'VZ',    bias:-0.6, text:"Verizon perd des abonnés face à la concurrence.", why:"La perte d'abonnés signale un déclin commercial."},
  {ticker:'T',     bias:+0.5, text:"AT&T relève son dividende.", why:"Un dividende plus élevé attire les investisseurs en quête de revenu."},
  {ticker:'FCX',   bias:-0.7, text:"Coûts d'extraction en hausse chez Freeport-McMoRan.", why:"Des coûts plus élevés rongent les profits."},
  {ticker:'HON',   bias:+0.7, text:"Honeywell remporte un appel d'offres aéronautique.", why:"Un gros contrat = revenus futurs garantis."},
  {ticker:'MMM',   bias:-0.7, text:"3M condamné à payer une indemnité dans un procès collectif.", why:"Les indemnités juridiques sont des dépenses imprévues qui pèsent sur les profits."},
  {ticker:'CMCSA', bias:-0.6, text:"Comcast perd des clients câble au profit du streaming.", why:"La désaffection du câble est une tendance lourde du secteur."},
  {ticker:'CHTR',  bias:+0.6, text:"Charter étend la fibre optique à 5 nouveaux États.", why:"L'expansion géographique ouvre de nouveaux marchés."},
  {ticker:'RIO',   bias:+0.8, text:"Rio Tinto signe un partenariat lithium pour batteries EV.", why:"Le lithium est crucial pour les voitures électriques — secteur en pleine croissance."}
];

const BADGES = [
  {id:'first_trade', icon:'ti-flag-3',     label:'Premier pas',           desc:'Effectue ta première transaction.'},
  {id:'first_gain',  icon:'ti-trending-up', label:'Dans le vert',         desc:'Reviens au-dessus de ton budget initial.'},
  {id:'diversified', icon:'ti-layout-grid', label:'Diversifié',           desc:'Détiens 4 titres différents en même temps.'},
  {id:'big_win',     icon:'ti-rocket',     label:'+10%',                  desc:'Une position avec 10% de gain ou plus.'},
  {id:'ten_trades',  icon:'ti-coin',       label:'Vétéran',               desc:'Réalise 10 transactions.'}
];

// ============ STATE ============
function defaultState(){
  const stocks = {};
  STOCKS_DEF.forEach(s => { stocks[s.ticker] = { price:s.basePrice, open:s.basePrice, history:[s.basePrice] }; });
  return {
    market: { stocks, lastTick:Date.now(), activeNews:[], newsLog:[], totalTicks:0 },
    accounts: {
      alex:   { password:'100', role:'student', initialBudget:10000, cash:10000, portfolio:{}, trades:0, badges:[] },
      sam:    { password:'200', role:'student', initialBudget:10000, cash:10000, portfolio:{}, trades:0, badges:[] },
      jordan: { password:'300', role:'student', initialBudget:10000, cash:10000, portfolio:{}, trades:0, badges:[] },
      prof:   { password:'999', role:'admin' }
    },
    meta: { createdAt: Date.now(), seenTutorial: {} }
  };
}

let S = null;
let currentUser = null;
let currentSector = 'tech';
let tickCount = 0;
let newsRotateIdx = 0;
let priceFlashEls = {};

// ============ STORAGE ============
function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { console.error('Load failed:', e); return null; }
}
function saveState(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); }
  catch (e) { console.error('Save failed:', e); }
}

// ============ HELPERS ============
const $ = id => document.getElementById(id);
const fmt = n => (n<0?'-':'') + '$' + Math.abs(+n).toLocaleString('fr-CA', {minimumFractionDigits:2, maximumFractionDigits:2});
const fmtPct = n => (n>=0?'+':'') + n.toFixed(2) + '%';
function portfolioValue(acc){ let v=0; for(const t in (acc.portfolio||{})) v += S.market.stocks[t].price * acc.portfolio[t].qty; return v; }
function totalValue(acc){ return acc.cash + portfolioValue(acc); }

// ============ SIMULATION ============
function tickOnce(recordHistory){
  // Maybe fire news
  if (Math.random() < NEWS_CHANCE && S.market.activeNews.length < 2) {
    const tmpl = NEWS_POOL[Math.floor(Math.random() * NEWS_POOL.length)];
    S.market.activeNews.push({...tmpl, ticksLeft: NEWS_DURATION_TICKS});
    S.market.newsLog.unshift({...tmpl, time: Date.now()});
    if (S.market.newsLog.length > 20) S.market.newsLog.pop();
  }
  S.market.activeNews = S.market.activeNews.filter(n => --n.ticksLeft > 0);

  STOCKS_DEF.forEach(def => {
    const s = S.market.stocks[def.ticker];
    const news = S.market.activeNews.find(n => n.ticker === def.ticker);
    const newsBias = news ? news.bias * 0.0018 * s.price : 0;
    const drift = (s.open - s.price) * 0.012;
    const shock = (Math.random() - 0.5) * 2 * def.vol * s.price;
    s.price = Math.max(0.5, s.price + drift + shock + newsBias);
    if (recordHistory) {
      s.history.push(s.price);
      if (s.history.length > HISTORY_LEN) s.history.shift();
    }
  });
  S.market.lastTick = Date.now();
  S.market.totalTicks++;
}
function catchUp(){
  const elapsed = Date.now() - S.market.lastTick;
  const missed = Math.min(MAX_CATCHUP_TICKS, Math.floor(elapsed / TICK_MS));
  for (let i = 0; i < missed; i++) tickOnce(i % 5 === 0);
  return missed;
}

// ============ TICKER TAPE ============
function renderTickerTape(){
  const track = $('ticker-track');
  const items = STOCKS_DEF.map(def => {
    const s = S.market.stocks[def.ticker];
    const pct = ((s.price - s.open) / s.open) * 100;
    const dir = pct >= 0 ? 'up' : 'dn';
    const arrow = pct >= 0 ? '▲' : '▼';
    return `<span class="ticker-item"><span class="t">${def.ticker}</span> <span class="mono">${fmt(s.price)}</span> <span class="${dir}">${arrow} ${fmtPct(pct)}</span></span>`;
  }).join('');
  track.innerHTML = items + items; // duplicate for seamless scroll
}

// ============ SPARKLINE ============
function sparkline(history, w=70, h=24){
  if (history.length < 2) return `<svg width="${w}" height="${h}"></svg>`;
  const min = Math.min(...history), max = Math.max(...history);
  const range = max - min || 1;
  const step = w / (history.length - 1);
  const pts = history.map((v, i) => `${(i*step).toFixed(1)},${(h - ((v-min)/range)*h).toFixed(1)}`).join(' ');
  const up = history[history.length-1] >= history[0];
  const color = up ? 'var(--success)' : 'var(--danger)';
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

// ============ RENDER: STOCKS ============
function renderSectorTabs(){
  $('sector-tabs').innerHTML = SECTORS.map(s =>
    `<button class="sector-tab ${s.id === currentSector ? 'active' : ''}" data-s="${s.id}">${s.label}</button>`
  ).join('');
  $('sector-tabs').querySelectorAll('button').forEach(b => {
    b.onclick = () => { currentSector = b.dataset.s; renderSectorTabs(); renderStocks(); };
  });
}

function renderStocks(){
  const acc = S.accounts[currentUser];
  priceFlashEls = {};
  const list = STOCKS_DEF.filter(s => s.sector === currentSector);
  $('stock-list').innerHTML = list.map(def => {
    const s = S.market.stocks[def.ticker];
    const pct = ((s.price - s.open) / s.open) * 100;
    const dir = pct >= 0 ? 'up' : 'dn';
    const held = acc.portfolio[def.ticker]?.qty || 0;
    const hasNews = S.market.activeNews.some(n => n.ticker === def.ticker);
    return `<div class="stock ${hasNews?'hot':''}" data-t="${def.ticker}">
      <div>
        <div class="tk-name" data-chart="${def.ticker}">${def.ticker}</div>
        ${held > 0 ? `<div class="held">${held} en portef.</div>` : ''}
      </div>
      <div class="s-name" title="${def.name}">${def.name}${hasNews ? '<span class="hot-flag"><i class="ti ti-flame"></i> actu</span>' : ''}</div>
      <div class="spark-c">${sparkline(s.history)}</div>
      <div class="price" id="px-${def.ticker}" data-prev="${s.price}">${fmt(s.price)}</div>
      <div class="change ${dir}">${fmtPct(pct)}</div>
      <div class="actions">
        <input class="qty" type="number" min="1" value="1" data-qty="${def.ticker}">
        <button class="btn-trade btn-buy" data-buy="${def.ticker}">Acheter</button>
        <button class="btn-trade btn-sell" data-sell="${def.ticker}" ${held===0?'disabled':''}>Vendre</button>
      </div>
    </div>`;
  }).join('');
  $('stock-list').querySelectorAll('[data-buy]').forEach(b => b.onclick = () => trade(b.dataset.buy, 'buy'));
  $('stock-list').querySelectorAll('[data-sell]').forEach(b => b.onclick = () => trade(b.dataset.sell, 'sell'));
  $('stock-list').querySelectorAll('[data-chart]').forEach(b => b.onclick = () => openChart(b.dataset.chart));
}

function updatePricesInPlace(){
  // Flash + update only the currently visible sector
  STOCKS_DEF.filter(s => s.sector === currentSector).forEach(def => {
    const el = $('px-' + def.ticker);
    if (!el) return;
    const s = S.market.stocks[def.ticker];
    const prev = parseFloat(el.dataset.prev || s.price);
    el.dataset.prev = s.price;
    el.textContent = fmt(s.price);
    el.classList.remove('fu', 'fd');
    if (s.price > prev) el.classList.add('fu');
    else if (s.price < prev) el.classList.add('fd');
  });
  // Always update tickertape (every tick) and all change cells
  renderTickerTape();
}

// ============ RENDER: PORTFOLIO ============
function renderPortfolio(){
  const acc = S.accounts[currentUser];
  const items = Object.entries(acc.portfolio).filter(([_, p]) => p.qty > 0);
  $('pos-count').textContent = items.length ? `(${items.length})` : '';
  if (items.length === 0) {
    $('portfolio').innerHTML = '<div class="empty">Aucune position ouverte.<br>Achète un titre pour commencer !</div>';
    return;
  }
  $('portfolio').innerHTML = items.map(([t, p]) => {
    const s = S.market.stocks[t];
    const val = s.price * p.qty;
    const cost = p.avg * p.qty;
    const pnl = val - cost;
    const pct = cost > 0 ? (pnl / cost) * 100 : 0;
    const dir = pnl >= 0 ? 'up' : 'dn';
    return `<div class="pos">
      <div class="pos-l">
        <div class="tk-name" data-chart="${t}">${t}</div>
        <div class="pos-sub">${p.qty} × ${fmt(p.avg)}</div>
      </div>
      <div class="pos-r">
        <div class="pos-val">${fmt(val)}</div>
        <div class="pos-pnl ${dir}">${pnl>=0?'+':''}${fmt(pnl)} (${fmtPct(pct)})</div>
      </div>
      <div class="pos-actions">
        <button class="btn-trade btn-sell" data-sell1="${t}">Vendre 1</button>
        <button class="btn-trade btn-sell" data-sellall="${t}">Tout vendre</button>
      </div>
    </div>`;
  }).join('');
  $('portfolio').querySelectorAll('[data-sell1]').forEach(b => b.onclick = () => trade(b.dataset.sell1, 'sell', 1));
  $('portfolio').querySelectorAll('[data-sellall]').forEach(b => b.onclick = () => trade(b.dataset.sellall, 'sellAll'));
  $('portfolio').querySelectorAll('[data-chart]').forEach(b => b.onclick = () => openChart(b.dataset.chart));
}

// ============ RENDER: METRICS ============
function renderMetrics(){
  const acc = S.accounts[currentUser];
  const pv = portfolioValue(acc);
  const tot = acc.cash + pv;
  const pnl = tot - acc.initialBudget;
  const pct = (pnl / acc.initialBudget) * 100;
  $('m-cash').textContent = fmt(acc.cash);
  $('m-port').textContent = fmt(pv);
  $('m-total').textContent = fmt(tot);
  $('m-pnl').textContent = (pnl >= 0 ? '+' : '') + fmt(pnl);
  $('m-pnl').className = 'metric-value ' + (pnl >= 0 ? 'up' : 'dn');
  $('m-pnl-pct').textContent = fmtPct(pct);
  $('m-pnl-pct').className = 'metric-sub ' + (pnl >= 0 ? 'up' : 'dn');
}

// ============ RENDER: BADGES ============
function renderBadges(){
  const acc = S.accounts[currentUser];
  const earned = new Set(acc.badges || []);
  $('badge-list').innerHTML = BADGES.map(b =>
    `<span class="badge ${earned.has(b.id)?'earned':''}" title="${b.desc}">
      <i class="ti ${b.icon}"></i>${b.label}
    </span>`
  ).join('');
}

// ============ RENDER: LEADERBOARD ============
function renderLeaderboard(){
  const students = Object.entries(S.accounts)
    .filter(([_, a]) => a.role === 'student')
    .map(([name, a]) => ({ name, total: totalValue(a), pnl: totalValue(a) - a.initialBudget }))
    .sort((a, b) => b.total - a.total);
  $('leaderboard').innerHTML = students.map((s, i) => {
    const dir = s.pnl >= 0 ? 'up' : 'dn';
    const rank = i === 0 ? '<i class="ti ti-trophy"></i>' : (i + 1);
    return `<div class="lb-row ${s.name === currentUser ? 'me' : ''} ${i === 0 ? 'gold' : ''}">
      <div class="lb-rank">${rank}</div>
      <div class="lb-name">${s.name}</div>
      <div>
        <div class="lb-tot">${fmt(s.total)}</div>
        <div class="lb-pnl ${dir}">${s.pnl>=0?'+':''}${fmt(s.pnl)}</div>
      </div>
    </div>`;
  }).join('');
}

// ============ RENDER: NEWS ============
function renderNews(){
  const log = S.market.newsLog;
  const el = $('news-display');
  if (log.length === 0) {
    el.innerHTML = '<div class="news-empty">Le marché est calme… aucune actualité pour l\'instant.</div>';
    return;
  }
  const item = log[newsRotateIdx % log.length];
  const dirColor = item.bias >= 0 ? 'var(--success)' : 'var(--danger)';
  const arrow = item.bias >= 0 ? 'ti-arrow-up-right' : 'ti-arrow-down-right';
  el.innerHTML = `
    <div class="news-label">
      <span class="pill">${item.ticker}</span>
      <span>Actualité de marché</span>
      <i class="ti ${arrow}" style="color:${dirColor}"></i>
    </div>
    <div class="news-headline">${item.text}</div>
    <div class="news-why">
      <i class="ti ti-bulb"></i>
      <div><b style="color:var(--text);font-weight:500">Pourquoi ?</b> ${item.why}</div>
    </div>`;
}
function rotateNews(){
  if (S.market.newsLog.length === 0) return;
  newsRotateIdx++;
  renderNews();
}

// ============ TRADING ============
function trade(ticker, action){
  const acc = S.accounts[currentUser];
  const s = S.market.stocks[ticker];
  const qtyInput = document.querySelector(`input[data-qty="${ticker}"]`);
  let qty;
  if (action === 'sellAll') qty = acc.portfolio[ticker]?.qty || 0;
  else if (action === 'sell' && arguments[2]) qty = arguments[2];
  else qty = qtyInput ? Math.max(1, parseInt(qtyInput.value) || 1) : 1;
  if (action === 'sell') qty = Math.min(qty, acc.portfolio[ticker]?.qty || 0);
  if (qty < 1) return;

  const pos = acc.portfolio[ticker] || { qty:0, avg:0 };

  if (action === 'buy') {
    const cost = s.price * qty;
    if (acc.cash < cost) {
      userFlash(`Pas assez d'argent : il te faut ${fmt(cost)}, tu n'as que ${fmt(acc.cash)}.`, 'error');
      return;
    }
    const newQty = pos.qty + qty;
    pos.avg = ((pos.avg * pos.qty) + (s.price * qty)) / newQty;
    pos.qty = newQty;
    acc.cash -= cost;
    acc.portfolio[ticker] = pos;
    acc.trades = (acc.trades || 0) + 1;
    userFlash(`✓ Acheté ${qty} × ${ticker} à ${fmt(s.price)} (${fmt(cost)})`, 'success');
  } else {
    if (pos.qty < qty) return;
    const proceeds = s.price * qty;
    pos.qty -= qty;
    acc.cash += proceeds;
    if (pos.qty === 0) delete acc.portfolio[ticker];
    else acc.portfolio[ticker] = pos;
    acc.trades = (acc.trades || 0) + 1;
    userFlash(`✓ Vendu ${qty} × ${ticker} à ${fmt(s.price)} (${fmt(proceeds)})`, 'success');
  }
  checkBadges(acc);
  renderStocks();
  renderPortfolio();
  renderMetrics();
  renderBadges();
  renderLeaderboard();
  saveState();
}

function checkBadges(acc){
  const earned = new Set(acc.badges || []);
  const grant = id => {
    if (!earned.has(id)) {
      earned.add(id);
      acc.badges = [...earned];
      const b = BADGES.find(x => x.id === id);
      pushToast(`Badge débloqué : ${b.label}`, 'ti-award');
    }
  };
  if (acc.trades >= 1) grant('first_trade');
  if (acc.trades >= 10) grant('ten_trades');
  if (totalValue(acc) > acc.initialBudget) grant('first_gain');
  if (Object.keys(acc.portfolio).length >= 4) grant('diversified');
  for (const t in acc.portfolio) {
    const p = acc.portfolio[t];
    if (p.avg > 0 && (S.market.stocks[t].price - p.avg) / p.avg >= 0.10) grant('big_win');
  }
}

function userFlash(msg, kind){
  const el = $('user-flash');
  el.textContent = msg;
  el.className = 'flash flash-' + (kind === 'error' ? 'error' : 'success') + ' show';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3000);
}

function pushToast(text, icon){
  const wrap = $('toasts');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<i class="ti ${icon || 'ti-info-circle'}"></i><div>${text}</div>`;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 4500);
}

// ============ MODAL: CHART ============
function openChart(ticker){
  const s = S.market.stocks[ticker];
  const def = STOCKS_DEF.find(x => x.ticker === ticker);
  const h = s.history;
  const w = 460, ht = 200;
  const min = Math.min(...h), max = Math.max(...h);
  const range = max - min || 1;
  const step = w / Math.max(1, h.length - 1);
  const pts = h.map((v, i) => `${(i*step).toFixed(1)},${(ht - ((v-min)/range)*ht).toFixed(1)}`).join(' ');
  const areaPts = `0,${ht} ${pts} ${w},${ht}`;
  const up = h[h.length-1] >= h[0];
  const color = up ? 'var(--success)' : 'var(--danger)';
  const tintColor = up ? 'var(--success-tint)' : 'var(--danger-tint)';
  const pct = ((s.price - s.open) / s.open) * 100;
  const dir = pct >= 0 ? 'up' : 'dn';
  const vol = def.vol * 100 < 0.30 ? 'Faible' : def.vol * 100 < 0.40 ? 'Moyenne' : 'Élevée';

  showModal(`
    <h3 style="font-family:var(--serif)">${def.name} <span style="font-family:var(--mono);color:var(--text3);font-size:14px;font-weight:400">${ticker}</span></h3>
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px">
      <div class="mono" style="font-size:32px;font-weight:500">${fmt(s.price)}</div>
      <div class="${dir} mono" style="font-size:15px;font-weight:500">${fmtPct(pct)} aujourd'hui</div>
    </div>
    <svg width="100%" viewBox="0 0 ${w} ${ht}" style="background:var(--inset);border-radius:var(--radius);display:block">
      <polygon points="${areaPts}" fill="${tintColor}" opacity="0.6"/>
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:16px;font-size:12px">
      <div><div style="color:var(--text3);text-transform:uppercase;letter-spacing:.5px;font-size:11px;margin-bottom:4px">Plus haut</div><div class="mono" style="font-size:14px;font-weight:500">${fmt(max)}</div></div>
      <div><div style="color:var(--text3);text-transform:uppercase;letter-spacing:.5px;font-size:11px;margin-bottom:4px">Plus bas</div><div class="mono" style="font-size:14px;font-weight:500">${fmt(min)}</div></div>
      <div><div style="color:var(--text3);text-transform:uppercase;letter-spacing:.5px;font-size:11px;margin-bottom:4px">Volatilité</div><div style="font-size:14px;font-weight:500">${vol}</div></div>
    </div>
  `);
}

// ============ MODAL: HELP ============
function openHelp(){
  showModal(`
    <h3>Comment ça marche</h3>
    <div class="tut-step">
      <div class="n">1</div>
      <div class="c"><b>Tu reçois un budget de départ.</b> Au début, tu as ton montant en <i>liquidités</i> — de l'argent disponible pour acheter des actions.</div>
    </div>
    <div class="tut-step">
      <div class="n">2</div>
      <div class="c"><b>Les prix bougent toutes les 2 secondes.</b> Comme à la vraie bourse. Quand une <span style="color:var(--warm)">actualité orange</span> tombe, ça pousse fortement le prix dans une direction pendant ~40 secondes.</div>
    </div>
    <div class="tut-step">
      <div class="n">3</div>
      <div class="c"><b>Achète bas, vends haut.</b> Tu achètes 5 actions à 50 $ et tu les revends à 60 $ ? Tu gagnes 50 $. Si tu les revends à 40 $, tu perds 50 $.</div>
    </div>
    <div class="tut-step">
      <div class="n">4</div>
      <div class="c"><b>Diversifie tes placements.</b> Mettre tous tes œufs dans le même panier est risqué : si ce titre s'effondre, tu perds gros. Acheter dans plusieurs secteurs (techno + métaux + manufacturier...) protège ton portefeuille.</div>
    </div>
    <div class="tut-step">
      <div class="n">5</div>
      <div class="c"><b>Le marché continue même quand tu pars.</b> Ferme ton onglet, va manger : à ton retour, les cours auront évolué. Un message t'expliquera ce qui s'est passé.</div>
    </div>
  `);
}

function showModal(html){
  $('modal-host').innerHTML = `<div class="modal-ov" id="mov"><div class="modal"><button class="modal-x" id="mcx">&times;</button>${html}</div></div>`;
  $('mcx').onclick = closeModal;
  $('mov').onclick = e => { if (e.target.id === 'mov') closeModal(); };
}
function closeModal(){ $('modal-host').innerHTML = ''; }

// ============ WELCOME BANNER ============
function showWelcome(missed, firstTime){
  const b = $('welcome-banner');
  if (firstTime) {
    b.innerHTML = `<div class="welcome">
      <i class="ti ti-confetti"></i>
      <div class="welcome-c">Bienvenue, <b>${currentUser}</b> ! Tu as <b>${fmt(S.accounts[currentUser].initialBudget)}</b> à investir. Si tu hésites, clique sur le <b>?</b> en haut à droite pour les règles.</div>
      <button class="welcome-x" onclick="this.parentElement.remove()">&times;</button>
    </div>`;
  } else if (missed > 5) {
    const min = Math.round(missed * TICK_MS / 60000);
    b.innerHTML = `<div class="welcome">
      <i class="ti ti-clock-hour-4"></i>
      <div class="welcome-c">Pendant ton absence (≈ <b>${min} min</b>), le marché a bougé <b>${missed} fois</b>. Tes positions ont peut-être pris de la valeur — ou en ont perdu. Vérifie !</div>
      <button class="welcome-x" onclick="this.parentElement.remove()">&times;</button>
    </div>`;
  } else {
    b.innerHTML = '';
  }
}

// ============ ADMIN ============
function renderAdmin(){
  const students = Object.entries(S.accounts).filter(([_, a]) => a.role === 'student');
  let totalBudget = 0, totalCash = 0, totalPort = 0;
  students.forEach(([_, a]) => { totalBudget += a.initialBudget; totalCash += a.cash; totalPort += portfolioValue(a); });
  const grand = totalCash + totalPort;
  const totalPnl = grand - totalBudget;
  $('adm-metrics').innerHTML =
    metricCard('Étudiants', students.length, '') +
    metricCard('Budgets alloués', fmt(totalBudget), '') +
    metricCard('Capital total', fmt(grand), (totalPnl>=0?'+':'')+fmt(totalPnl), totalPnl>=0?'up':'dn') +
    metricCard('Ticks de marché', S.market.totalTicks.toLocaleString('fr-CA'), '');

  $('adm-tbody').innerHTML = students.map(([name, a]) => {
    const pv = portfolioValue(a), tot = a.cash + pv, pnl = tot - a.initialBudget;
    const cls = pnl >= 0 ? 'up' : 'dn';
    return `<tr>
      <td><span class="uname">${name}</span><span class="trades-c">${a.trades||0} trades · ${(a.badges||[]).length}/${BADGES.length} badges</span></td>
      <td><input type="number" min="0" step="500" data-u="${name}" value="${a.initialBudget}"></td>
      <td class="mono">${fmt(a.cash)}</td>
      <td class="mono">${fmt(pv)}</td>
      <td class="mono ${cls}">${pnl>=0?'+':''}${fmt(pnl)}</td>
      <td>
        <button class="btn-action" data-act="save" data-u="${name}" style="padding:6px 12px;font-size:12px">Appliquer</button>
        <button class="btn-action" data-act="reset" data-u="${name}" style="padding:6px 12px;font-size:12px">RAZ</button>
      </td>
    </tr>`;
  }).join('');
  $('adm-tbody').querySelectorAll('button').forEach(b => {
    b.onclick = () => handleAdmin(b.dataset.act, b.dataset.u);
  });

  $('adm-news').innerHTML = S.market.newsLog.length === 0
    ? '<div class="empty">Pas encore d\'actualité.</div>'
    : S.market.newsLog.slice(0, 10).map(n => {
      const dir = n.bias >= 0 ? 'up' : 'dn';
      const arrow = n.bias >= 0 ? 'ti-arrow-up-right' : 'ti-arrow-down-right';
      return `<div class="adm-news-item">
        <div class="nt ${dir}"><i class="ti ${arrow}"></i> ${n.ticker}</div>
        <div class="nx">${n.text}</div>
      </div>`;
    }).join('');
}

function metricCard(label, value, sub, subClass){
  return `<div class="metric">
    <div class="metric-label">${label}</div>
    <div class="metric-value">${value}</div>
    ${sub ? `<div class="metric-sub ${subClass||''}">${sub}</div>` : ''}
  </div>`;
}

function handleAdmin(act, name){
  const a = S.accounts[name];
  if (act === 'save') {
    const v = parseFloat(document.querySelector(`input[data-u="${name}"]`).value);
    if (!isFinite(v) || v < 0) return;
    a.initialBudget = v;
    a.cash = v;
    a.portfolio = {};
    a.trades = 0;
    a.badges = [];
    adminFlash(`${name} : budget mis à ${fmt(v)}, portefeuille réinitialisé.`);
  } else if (act === 'reset') {
    a.cash = a.initialBudget;
    a.portfolio = {};
    a.trades = 0;
    a.badges = [];
    adminFlash(`${name} remis à zéro.`);
  }
  renderAdmin();
  saveState();
}

function adminFlash(msg){
  const el = $('adm-flash');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3000);
}

// ============ LOGIN ============
function attemptLogin(){
  const u = $('li-user').value.trim().toLowerCase();
  const p = $('li-pass').value.trim();
  const errEl = $('login-err');
  const acc = S.accounts[u];
  if (!acc || acc.password !== p) {
    errEl.textContent = 'Nom d\'utilisateur ou NIP incorrect.';
    errEl.classList.add('show');
    return;
  }
  if (!/^\d{3}$/.test(p)) {
    errEl.textContent = 'Le NIP doit contenir exactement 3 chiffres.';
    errEl.classList.add('show');
    return;
  }
  errEl.classList.remove('show');
  currentUser = u;
  $('li-pass').value = '';

  if (acc.role === 'admin') {
    $('login').style.display = 'none';
    $('admin').style.display = 'block';
    renderAdmin();
  } else {
    $('login').style.display = 'none';
    $('app').style.display = 'block';
    $('u-name').textContent = u;
    $('u-avatar').textContent = u.charAt(0).toUpperCase();
    const firstTime = !S.meta.seenTutorial[u];
    S.meta.seenTutorial[u] = true;
    showWelcome(window.__missed || 0, firstTime);
    renderSectorTabs();
    renderStocks();
    renderPortfolio();
    renderMetrics();
    renderBadges();
    renderLeaderboard();
    renderNews();
    renderTickerTape();
    saveState();
  }
}

function logout(){
  currentUser = null;
  $('app').style.display = 'none';
  $('admin').style.display = 'none';
  $('login').style.display = 'grid';
  $('toasts').innerHTML = '';
}

// ============ TICK LOOP ============
function tickLoop(){
  tickOnce(true);
  if (currentUser && S.accounts[currentUser].role === 'student') {
    updatePricesInPlace();
    // Full re-render every 3 ticks (6 sec) for change% and sparklines
    if (S.market.totalTicks % 3 === 0) renderStocks();
    renderMetrics();
    renderLeaderboard();
    renderPortfolio();
    checkBadges(S.accounts[currentUser]);
  } else if (currentUser && S.accounts[currentUser].role === 'admin') {
    renderAdmin();
  }
  tickCount++;
  if (tickCount % 5 === 0) saveState();
}

// ============ INIT ============
function init(){
  const loaded = loadState();
  if (loaded && loaded.market && loaded.accounts) {
    S = loaded;
    for (const k in S.accounts) {
      const a = S.accounts[k];
      if (a.role === 'student' && !a.badges) a.badges = [];
    }
    window.__missed = catchUp();
  } else {
    S = defaultState();
    window.__missed = 0;
  }
  saveState();

  // Wire up login
  $('li-go').onclick = attemptLogin;
  $('li-pass').addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin(); });
  $('li-user').addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin(); });
  document.querySelectorAll('#login .acc').forEach(a => {
    a.onclick = () => { $('li-user').value = a.dataset.u; $('li-pass').value = a.dataset.p; attemptLogin(); };
  });

  // Wire up user nav
  $('b-help').onclick = openHelp;
  $('b-logout').onclick = logout;

  // Wire up admin
  $('ba-logout').onclick = logout;
  $('ba-skip').onclick = () => {
    const skip = Math.floor(5 * 60 * 1000 / TICK_MS);
    for (let i = 0; i < skip; i++) tickOnce(i % 5 === 0);
    saveState();
    renderAdmin();
    adminFlash(`Le marché a avancé de 5 minutes (${skip} ticks simulés).`);
  };
  $('ba-reset').onclick = () => {
    if (!confirm('Réinitialiser tous les cours et l\'historique des actualités ? Les portefeuilles des étudiants sont conservés.')) return;
    const accountsBackup = S.accounts;
    const meta = S.meta;
    S = defaultState();
    S.accounts = accountsBackup;
    S.meta = meta;
    saveState();
    renderAdmin();
    adminFlash('Marché réinitialisé. Tous les prix sont revenus à leur valeur de départ.');
  };
  $('ba-wipe').onclick = () => {
    if (!confirm('Tout effacer (marché + portefeuilles + badges) et recommencer à zéro ? Cette action est irréversible.')) return;
    localStorage.removeItem(STORAGE_KEY);
    S = defaultState();
    saveState();
    renderAdmin();
    adminFlash('Toutes les données ont été effacées. Simulation remise à neuf.');
  };

  // Tick loops
  setInterval(tickLoop, TICK_MS);
  setInterval(rotateNews, 7000);

  // Esc closes modal
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

init();
})();
