/* HomeFlow 360 — core: utilities, dates, formats, storage, backup */
(function () {
  'use strict';
  var HF = window.HF;
  HF.SCHEMA = 1;

  /* ---------- basics ---------- */
  HF.$ = function (s, r) { return (r || document).querySelector(s); };
  HF.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  HF.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); };
  HF.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  HF.clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  HF.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  HF.sum = function (arr, f) { return arr.reduce(function (a, x) { return a + (f ? f(x) : x); }, 0); };
  HF.round2 = function (n) { return Math.round((n + Number.EPSILON) * 100) / 100; };

  /* ---------- dates (ISO yyyy-mm-dd, local time) ---------- */
  HF.iso = function (d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  HF.parse = function (s) { var p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  HF.today = function () { return HF.iso(new Date()); };
  HF.validDate = function (s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(HF.parse(s).getTime()); };
  HF.addDays = function (s, n) { var d = HF.parse(s); d.setDate(d.getDate() + n); return HF.iso(d); };
  HF.addMonths = function (s, n) {
    var d = HF.parse(s), day = d.getDate();
    d.setDate(1); d.setMonth(d.getMonth() + n);
    var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, last));
    return HF.iso(d);
  };
  HF.diffDays = function (a, b) { return Math.round((HF.parse(a) - HF.parse(b)) / 864e5); };
  HF.weekStart = function (s) {
    var d = HF.parse(s), ws = HF.state.settings.weekStart;
    var diff = (d.getDay() - ws + 7) % 7;
    d.setDate(d.getDate() - diff);
    return HF.iso(d);
  };
  HF.monthKey = function (s) { return String(s).slice(0, 7); };
  HF.daysInMonth = function (y, m) { return new Date(y, m, 0).getDate(); };

  /* ---------- formats ---------- */
  HF.locale = function () {
    var s = HF.state ? HF.state.settings : {}, l = s.lang || HF.lang(), loc = l;
    if (l === 'pt') loc = s.country === 'PT' ? 'pt-PT' : 'pt-BR';
    else if (s.country && /^[A-Z]{2}$/.test(s.country)) loc = l + '-' + s.country;
    try { new Intl.NumberFormat(loc); return loc; } catch (e) { return l === 'pt' ? 'pt-BR' : l; }
  };
  HF.ZERO_DEC = ['PYG', 'CLP', 'COP', 'JPY', 'KRW', 'VND', 'UYI'];
  HF.money = function (n, cur) {
    cur = cur || HF.state.settings.currency || 'USD';
    n = Number(n) || 0;
    var o = { style: 'currency', currency: cur };
    if (HF.ZERO_DEC.indexOf(cur) >= 0) { o.minimumFractionDigits = 0; o.maximumFractionDigits = 0; }
    try { return new Intl.NumberFormat(HF.locale(), o).format(n); }
    catch (e) { return n.toFixed(2) + ' ' + cur; }
  };
  HF.num = function (n, max) {
    try { return new Intl.NumberFormat(HF.locale(), { maximumFractionDigits: max == null ? 2 : max }).format(Number(n) || 0); }
    catch (e) { return String(n); }
  };
  HF.fmtDate = function (iso, o) {
    if (!iso) return '';
    try { return new Intl.DateTimeFormat(HF.locale(), o || { day: 'numeric', month: 'short' }).format(HF.parse(iso)); }
    catch (e) { return iso; }
  };
  HF.fmtLong = function (iso) { return HF.fmtDate(iso, { weekday: 'long', day: 'numeric', month: 'long' }); };
  HF.fmtMonth = function (iso) { return HF.fmtDate(iso, { month: 'long', year: 'numeric' }); };
  HF.weekdayName = function (iso, style) { return HF.fmtDate(iso, { weekday: style || 'short' }); };
  HF.fmtTime = function (hhmm) {
    if (!hhmm) return '';
    try { var p = hhmm.split(':'); var d = new Date(2000, 0, 1, +p[0], +p[1]); return new Intl.DateTimeFormat(HF.locale(), { hour: 'numeric', minute: '2-digit' }).format(d); } catch (e) { return hhmm; }
  };
  HF.relDay = function (iso) {
    var d = HF.diffDays(iso, HF.today());
    if (d === 0) return HF.t('c.today');
    if (d === 1) return HF.t('c.tomorrow');
    if (d === -1) return HF.t('c.yesterday');
    return HF.fmtDate(iso);
  };
  HF.countryName = function (code) {
    try { return new Intl.DisplayNames([HF.lang()], { type: 'region' }).of(code) || code; } catch (e) { return code; }
  };
  HF.COUNTRIES = ['AR', 'AU', 'BO', 'BR', 'CA', 'CL', 'CO', 'CR', 'DO', 'EC', 'SV', 'ES', 'US', 'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'PT', 'UY', 'VE', 'GB', 'IE', 'FR', 'DE', 'IT', 'NL'];
  HF.COUNTRY_CUR = { US: 'USD', GB: 'GBP', BR: 'BRL', PY: 'PYG', MX: 'MXN', CO: 'COP', AR: 'ARS', CL: 'CLP', PE: 'PEN', CA: 'CAD', AU: 'AUD', EC: 'USD', SV: 'USD', PA: 'USD',
    ES: 'EUR', PT: 'EUR', FR: 'EUR', DE: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR' };
  HF.CURRENCIES = ['USD', 'EUR', 'GBP', 'BRL', 'PYG', 'MXN', 'COP', 'ARS', 'CLP', 'PEN', 'CAD', 'AUD'];
  HF.currencyName = function (c) {
    try { return new Intl.DisplayNames([HF.lang()], { type: 'currency' }).of(c) || c; } catch (e) { return c; }
  };
  HF.allCurrencies = function () { return HF.CURRENCIES.concat((HF.state.settings.extraCurrencies || []).filter(function (c) { return HF.CURRENCIES.indexOf(c) < 0; })); };
  HF.validCurrency = function (c) {
    if (!/^[A-Z]{3}$/.test(c)) return false;
    try { new Intl.NumberFormat('en', { style: 'currency', currency: c }); return true; } catch (e) { return false; }
  };

  /* ---------- constants ---------- */
  HF.TASK_CATS = [
    { id: 'clean', icon: '🧹', color: '#6fae9c' }, { id: 'kitchen', icon: '🍳', color: '#e8a25f' },
    { id: 'laundry', icon: '🧺', color: '#6ba0d6' }, { id: 'organize', icon: '📦', color: '#a690d6' },
    { id: 'garden', icon: '🌿', color: '#7fb35f' }, { id: 'maint', icon: '🔧', color: '#8a97a6' },
    { id: 'pets', icon: '🐾', color: '#d98a6c' }, { id: 'family', icon: '👨‍👩‍👧', color: '#d673a0' }
  ];
  HF.SHOP_CATS = [
    { id: 'produce', icon: '🥦' }, { id: 'meat', icon: '🥩' }, { id: 'dairy', icon: '🧀' }, { id: 'bakery', icon: '🥖' },
    { id: 'cleaning', icon: '🧴' }, { id: 'hygiene', icon: '🧼' }, { id: 'drinks', icon: '🥤' }, { id: 'other', icon: '🛒' }
  ];
  HF.EVENT_CATS = [
    { id: 'birthday', icon: '🎂', color: '#d673a0' }, { id: 'appointment', icon: '🩺', color: '#5f9ed1' },
    { id: 'meeting', icon: '💼', color: '#8a97a6' }, { id: 'school', icon: '🎒', color: '#e3b84b' },
    { id: 'family', icon: '👨‍👩‍👧', color: '#6ba58a' }, { id: 'payment', icon: '💳', color: '#e9846c' },
    { id: 'maintenance', icon: '🔧', color: '#7e8fa3' }, { id: 'special', icon: '⭐', color: '#a690d6' }
  ];
  HF.COLORS = ['#e9846c', '#6ba58a', '#8d7fd1', '#d9a82e', '#5f9ed1', '#d173a2', '#8aa05a', '#c98b5a'];
  HF.AVATARS = ['🦊', '🐼', '🦉', '🐢', '🐱', '🐶', '🦁', '🐰', '🌻', '🚀', '⚽', '🎨'];
  HF.catOf = function (list, id) { return list.filter(function (c) { return c.id === id; })[0] || list[list.length - 1]; };

  /* ---------- state ---------- */
  HF.defaultState = function () {
    return {
      v: HF.SCHEMA,
      settings: {
        lang: HF.detectLang(), country: '', currency: 'USD', extraCurrencies: [], theme: 'auto', homeName: '',
        homeType: 'family', weekStart: 1, hidden: [], onboarded: false, demo: false, lastBackup: '', persisted: false,
        dash: { summary: true, tasks: true, events: true, progress: true, reminders: true, shopping: true, money: true, index: true, quick: true }
      },
      members: [], tasks: [], log: [], events: [], recipes: [], meals: {}, menus: [], shopping: [], lists: [], purchases: [],
      fin: { cats: [], budgets: {}, tx: [] }, inventory: [], maint: [], docs: [], templates: [], hiddenTemplates: [], achSeen: []
    };
  };
  HF.normalize = function (s) {
    var d = HF.defaultState(); s = s || {};
    Object.keys(d).forEach(function (k) {
      if (k === 'settings') {
        var st = Object.assign({}, d.settings, s.settings || {});
        st.dash = Object.assign({}, d.settings.dash, (s.settings && s.settings.dash) || {});
        if (['es', 'en', 'pt'].indexOf(st.lang) < 0) st.lang = HF.detectLang();
        if (!Array.isArray(st.hidden)) st.hidden = [];
        if (!Array.isArray(st.extraCurrencies)) st.extraCurrencies = [];
        s.settings = st;
      } else if (k === 'fin') {
        var f = s.fin || {};
        s.fin = { cats: Array.isArray(f.cats) ? f.cats : [], budgets: (f.budgets && typeof f.budgets === 'object') ? f.budgets : {}, tx: Array.isArray(f.tx) ? f.tx : [] };
      } else if (k === 'meals') {
        s.meals = (s.meals && typeof s.meals === 'object' && !Array.isArray(s.meals)) ? s.meals : {};
      } else if (Array.isArray(d[k])) {
        s[k] = Array.isArray(s[k]) ? s[k] : [];
      } else if (s[k] === undefined) { s[k] = d[k]; }
    });
    s.v = HF.SCHEMA;
    return s;
  };

  /* ---------- storage: IndexedDB with localStorage fallback ---------- */
  var dbp = null;
  function openDB() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      try {
        var r = indexedDB.open('homeflow360', 1);
        r.onupgradeneeded = function () {
          var d = r.result;
          if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
          if (!d.objectStoreNames.contains('photos')) d.createObjectStore('photos');
        };
        r.onsuccess = function () { res(r.result); };
        r.onerror = function () { rej(r.error); };
        r.onblocked = function () { rej(new Error('blocked')); };
      } catch (e) { rej(e); }
    });
    return dbp;
  }
  function tx(store, mode, fn) {
    return openDB().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction(store, mode), rq = fn(t.objectStore(store));
        t.oncomplete = function () { res(rq ? rq.result : undefined); };
        t.onerror = function () { rej(t.error); };
        t.onabort = function () { rej(t.error || new Error('abort')); };
      });
    });
  }
  var LS = { useLS: false };
  function lsGet(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : undefined; } catch (e) { return undefined; } }
  function lsSet(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  HF.store = {
    init: function () {
      return Promise.race([openDB(), new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, 4000); })])
        .then(function () { LS.useLS = false; })
        .catch(function () { LS.useLS = true; });
    },
    get: function (k) { return LS.useLS ? Promise.resolve(lsGet('hf360:' + k)) : tx('kv', 'readonly', function (o) { return o.get(k); }); },
    set: function (k, v) { return LS.useLS ? Promise.resolve().then(function () { lsSet('hf360:' + k, v); }) : tx('kv', 'readwrite', function (o) { return o.put(v, k); }); },
    del: function (k) { return LS.useLS ? Promise.resolve().then(function () { localStorage.removeItem('hf360:' + k); }) : tx('kv', 'readwrite', function (o) { return o.delete(k); }); },
    usingFallback: function () { return LS.useLS; }
  };

  /* photos */
  var photoCache = {};
  HF.photos = {
    put: function (id, url) {
      photoCache[id] = url;
      if (LS.useLS) return Promise.resolve().then(function () { var all = lsGet('hf360:photos') || {}; all[id] = url; lsSet('hf360:photos', all); });
      return tx('photos', 'readwrite', function (o) { return o.put(url, id); });
    },
    get: function (id) {
      if (photoCache[id]) return Promise.resolve(photoCache[id]);
      var p = LS.useLS ? Promise.resolve((lsGet('hf360:photos') || {})[id]) : tx('photos', 'readonly', function (o) { return o.get(id); });
      return p.then(function (v) { if (v) photoCache[id] = v; return v; });
    },
    del: function (id) {
      delete photoCache[id];
      if (LS.useLS) return Promise.resolve().then(function () { var all = lsGet('hf360:photos') || {}; delete all[id]; lsSet('hf360:photos', all); });
      return tx('photos', 'readwrite', function (o) { return o.delete(id); });
    },
    all: function () {
      if (LS.useLS) return Promise.resolve(lsGet('hf360:photos') || {});
      return openDB().then(function (d) {
        return new Promise(function (res, rej) {
          var out = {}, t = d.transaction('photos', 'readonly'), c = t.objectStore('photos').openCursor();
          c.onsuccess = function () { var cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } };
          t.oncomplete = function () { res(out); };
          t.onerror = function () { rej(t.error); };
        });
      });
    },
    clear: function () {
      photoCache = {};
      if (LS.useLS) return Promise.resolve().then(function () { localStorage.removeItem('hf360:photos'); });
      return tx('photos', 'readwrite', function (o) { return o.clear(); });
    },
    replaceAll: function (map) {
      return HF.photos.clear().then(function () {
        return Object.keys(map || {}).reduce(function (p, id) { return p.then(function () { return HF.photos.put(id, map[id]); }); }, Promise.resolve());
      });
    }
  };
  HF.hydratePhotos = function (root) {
    HF.$$('img[data-photo]', root || document).forEach(function (img) {
      var id = img.getAttribute('data-photo'); if (!id) return;
      HF.photos.get(id).then(function (u) { if (u) { img.src = u; img.hidden = false; } });
    });
  };
  HF.imageToDataURL = function (file, max, q) {
    max = max || 900; q = q || 0.72;
    return new Promise(function (res, rej) {
      if (!file || !/^image\//.test(file.type)) return rej(new Error('not image'));
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, max / Math.max(w, h));
        var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
        var cx = c.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height); cx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        try { res(c.toDataURL('image/jpeg', q)); } catch (e) { rej(e); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('bad image')); };
      img.src = url;
    });
  };

  /* load / save */
  HF.load = function () {
    return HF.store.get('state').then(function (s) {
      HF.state = HF.normalize(s ? s : HF.defaultState());
      if (!s) HF.state.settings.lang = HF.pendingLang || HF.detectLang();
      return HF.state;
    });
  };
  var saveTimer = null, saveErrShown = false;
  HF.flush = function () {
    clearTimeout(saveTimer); saveTimer = null;
    if (!HF.state) return Promise.resolve();
    return HF.store.set('state', HF.state).then(function () { saveErrShown = false; }).catch(function (e) {
      if (!saveErrShown && HF.toast) { saveErrShown = true; HF.toast(HF.t('msg.storageErr')); }
    });
  };
  HF.save = function () { clearTimeout(saveTimer); saveTimer = null; HF.flush(); };
  window.addEventListener('pagehide', function () { HF.flush(); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') HF.flush(); });

  /* ---------- backup ---------- */
  HF.buildBackup = function () {
    return HF.photos.all().then(function (photos) {
      return { app: 'HomeFlow360', version: HF.SCHEMA, exportedAt: new Date().toISOString(), state: HF.state, photos: photos };
    });
  };
  HF.exportBackup = function () {
    HF.state.settings.lastBackup = HF.today();
    return HF.flush().then(HF.buildBackup).then(function (obj) {
      var blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'HomeFlow360-backup-' + HF.today() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
      return blob.size;
    });
  };
  HF.validateBackup = function (obj) {
    var bad = function (code) { return { ok: false, error: code }; };
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return bad('notBackup');
    if (obj.app !== 'HomeFlow360') return bad('notBackup');
    if (typeof obj.version !== 'number' || obj.version < 1) return bad('notBackup');
    if (obj.version > HF.SCHEMA) return bad('newer');
    var s = obj.state;
    if (!s || typeof s !== 'object' || Array.isArray(s)) return bad('corrupt');
    var arrays = ['members', 'tasks', 'log', 'events', 'recipes', 'menus', 'shopping', 'lists', 'purchases', 'inventory', 'maint', 'docs', 'templates', 'hiddenTemplates', 'achSeen'];
    for (var i = 0; i < arrays.length; i++) {
      var a = s[arrays[i]];
      if (a !== undefined) {
        if (!Array.isArray(a)) return bad('corrupt');
        if (arrays[i] !== 'hiddenTemplates' && arrays[i] !== 'achSeen' && a.some(function (x) { return !x || typeof x !== 'object'; })) return bad('corrupt');
      }
    }
    if (s.settings !== undefined && (typeof s.settings !== 'object' || Array.isArray(s.settings))) return bad('corrupt');
    if (s.fin !== undefined && (typeof s.fin !== 'object' || Array.isArray(s.fin))) return bad('corrupt');
    if (s.meals !== undefined && (typeof s.meals !== 'object' || Array.isArray(s.meals))) return bad('corrupt');
    var photos = {};
    if (obj.photos && typeof obj.photos === 'object') {
      Object.keys(obj.photos).forEach(function (k) {
        var v = obj.photos[k]; if (typeof v === 'string' && v.indexOf('data:image/') === 0) photos[k] = v;
      });
    }
    var st = HF.normalize(HF.clone(s));
    st.settings.onboarded = st.settings.onboarded !== false;
    return { ok: true, state: st, photos: photos, exportedAt: obj.exportedAt || '' };
  };
  HF.makeSnapshot = function () {
    return HF.photos.all().then(function (photos) {
      return HF.store.set('snapshot', { at: new Date().toISOString(), state: HF.clone(HF.state), photos: photos });
    });
  };
  HF.getSnapshot = function () { return HF.store.get('snapshot'); };
  HF.replaceState = function (st, photos) {
    HF.state = HF.normalize(st);
    return HF.photos.replaceAll(photos || {}).then(HF.flush);
  };

  /* ---------- derived helpers ---------- */
  HF.member = function (id) { return HF.state.members.filter(function (m) { return m.id === id; })[0]; };
  HF.eventOn = function (ev, iso) {
    if (!ev.date || iso < ev.date) return false;
    var a = HF.parse(ev.date), b = HF.parse(iso), r = ev.repeat || 'none';
    if (r === 'none') return ev.date === iso;
    if (r === 'weekly') return a.getDay() === b.getDay();
    if (r === 'monthly') { var last = HF.daysInMonth(b.getFullYear(), b.getMonth() + 1); return b.getDate() === Math.min(a.getDate(), last); }
    if (r === 'yearly') {
      if (a.getMonth() !== b.getMonth()) return false;
      var l2 = HF.daysInMonth(b.getFullYear(), b.getMonth() + 1); return b.getDate() === Math.min(a.getDate(), l2);
    }
    return false;
  };
  HF.eventNext = function (ev, from, horizon) {
    for (var i = 0; i <= (horizon || 400); i++) { var d = HF.addDays(from, i); if (HF.eventOn(ev, d)) return d; }
    return null;
  };
  HF.eventsOn = function (iso) {
    return HF.state.events.filter(function (e) { return HF.eventOn(e, iso); }).sort(function (a, b) { return (a.time || '99') < (b.time || '99') ? -1 : 1; });
  };
  HF.maintNext = function (m) {
    if (!m.lastDone) return HF.today();
    return HF.addDays(m.lastDone, m.freq || 30);
  };
  HF.maintStatus = function (m) {
    var d = HF.diffDays(HF.maintNext(m), HF.today());
    return d < 0 ? 'overdue' : d <= 7 ? 'soon' : 'ok';
  };
  HF.DOC_TYPES = [
    { id: 'service', icon: '💡' }, { id: 'insurance', icon: '🛡️' }, { id: 'warranty', icon: '🧾' }, { id: 'document', icon: '📄' },
    { id: 'renewal', icon: '🔁' }, { id: 'subscription', icon: '📺' }, { id: 'reminder', icon: '🔔' }
  ];
  HF.upcoming = function (days) {
    var today = HF.today(), out = [], S = HF.state;
    S.docs.forEach(function (d) {
      if (d.archived || !d.due) return;
      var df = HF.diffDays(d.due, today);
      if (df <= days) out.push({ kind: 'doc', id: d.id, title: d.title, date: d.due, days: df, icon: HF.catOf(HF.DOC_TYPES, d.type).icon, view: 'docs' });
    });
    S.inventory.forEach(function (i) {
      if (i.warrantyEnd) { var df = HF.diffDays(i.warrantyEnd, today); if (df >= 0 && df <= days) out.push({ kind: 'warranty', id: i.id, title: i.name, date: i.warrantyEnd, days: df, icon: '🧾', view: 'inventory' }); }
      if (i.nextMaint) { var d2 = HF.diffDays(i.nextMaint, today); if (d2 <= days) out.push({ kind: 'imaint', id: i.id, title: i.name, date: i.nextMaint, days: d2, icon: '🔧', view: 'inventory' }); }
    });
    S.maint.forEach(function (m) {
      var n = HF.maintNext(m), df = HF.diffDays(n, today);
      if (df <= days) out.push({ kind: 'maint', id: m.id, title: m.name, date: n, days: df, icon: m.icon || '🧽', view: 'maintenance' });
    });
    S.events.forEach(function (e) {
      if (e.cat !== 'payment') return;
      var n = HF.eventNext(e, today, days); if (n) out.push({ kind: 'event', id: e.id, title: e.title, date: n, days: HF.diffDays(n, today), icon: '💳', view: 'calendar' });
    });
    out.sort(function (a, b) { return a.days - b.days; });
    return out;
  };

  /* demo removal */
  HF.removeDemo = function () {
    var S = HF.state, keep = function (x) { return !x.demo; };
    var goneTasks = S.tasks.filter(function (x) { return x.demo; }).map(function (x) { return x.id; });
    ['tasks', 'events', 'shopping', 'inventory', 'maint', 'docs', 'lists', 'purchases', 'menus'].forEach(function (k) { S[k] = S[k].filter(keep); });
    S.log = S.log.filter(function (l) { return !l.demo && goneTasks.indexOf(l.taskId) < 0; });
    S.fin.tx = S.fin.tx.filter(keep);
    if (S.settings.demoBudgets) { S.fin.budgets = {}; S.settings.demoBudgets = false; }
    Object.keys(S.meals).forEach(function (k) { Object.keys(S.meals[k]).forEach(function (s) { if (S.meals[k][s] && S.meals[k][s].demo) delete S.meals[k][s]; }); if (!Object.keys(S.meals[k]).length) delete S.meals[k]; });
    S.settings.demo = false;
  };
  HF.hasDemo = function () {
    var S = HF.state, f = function (x) { return x.demo; };
    return ['tasks', 'events', 'shopping', 'inventory', 'maint', 'docs', 'lists', 'purchases'].some(function (k) { return S[k].some(f); }) || S.fin.tx.some(f);
  };
})();
