/* HomeFlow 360 — shell, router, onboarding, search, boot */
(function () {
  'use strict';
  var HF = window.HF, t = HF.t, esc = HF.esc;

  HF.addDict({
    'inst.btn': ['Instalar como aplicación', 'Install as an app', 'Instalar como aplicativo'], 'inst.btn.short': ['Instalar', 'Install', 'Instalar'],
    'inst.title': ['Instalar HomeFlow 360', 'Install HomeFlow 360', 'Instalar o HomeFlow 360'],
    'inst.explain': ['Tendrás un acceso directo (en el escritorio o en la pantalla de inicio) y se abrirá como una aplicación, también sin internet.', 'You will get a shortcut (on the desktop or home screen) and it opens like an app, even offline.', 'Você terá um atalho (na área de trabalho ou na tela inicial) e ele abre como um aplicativo, mesmo sem internet.'],
    'inst.here': ['En este aparato:', 'On this device:', 'Neste aparelho:'], 'inst.others': ['En otros aparatos:', 'On other devices:', 'Em outros aparelhos:'],
    'inst.done': ['¡App instalada! Ya tienes el acceso directo.', 'App installed! You now have the shortcut.', 'App instalado! Você já tem o atalho.'],
    'inst.file': ['Para instalarla, ábrela desde su enlace web (no desde el archivo).', 'To install it, open it from its web link (not from the file).', 'Para instalar, abra pelo link da web (não pelo arquivo).'],
    'top.search': ['Buscar en todo', 'Search everything', 'Buscar em tudo'], 'top.theme': ['Cambiar tema claro/oscuro', 'Toggle light/dark theme', 'Alternar tema claro/escuro'],
    'skip': ['Saltar al contenido', 'Skip to content', 'Ir para o conteúdo'], 'nav.main': ['Navegación principal', 'Main navigation', 'Navegação principal'],
    'search.ph': ['Busca tareas, recetas, eventos, objetos…', 'Search tasks, recipes, events, items…', 'Busque tarefas, receitas, eventos, itens…'], 'search.none': ['Sin resultados', 'No results', 'Sem resultados'],
    'search.hint': ['Escribe al menos 2 letras.', 'Type at least 2 letters.', 'Digite pelo menos 2 letras.'],
    'ob.welcome': ['Bienvenida a HomeFlow 360', 'Welcome to HomeFlow 360', 'Bem-vinda ao HomeFlow 360'], 'ob.welcome.t': ['Organiza tu hogar con calma: tareas, comidas, compras, gastos y más, todo en un solo lugar y sin internet.', 'Organize your home calmly: tasks, meals, shopping, expenses and more, all in one place and without internet.', 'Organize sua casa com calma: tarefas, refeições, compras, gastos e mais, tudo em um só lugar e sem internet.'],
    'ob.step': ['Paso {a} de {b}', 'Step {a} of {b}', 'Passo {a} de {b}'], 'ob.next': ['Siguiente', 'Next', 'Próximo'], 'ob.back': ['Atrás', 'Back', 'Voltar'], 'ob.finish': ['Empezar', 'Get started', 'Começar'],
    'ob.home': ['Tu hogar', 'Your home', 'Seu lar'], 'ob.homeName': ['¿Cómo se llama tu hogar? (opcional)', 'What is your home called? (optional)', 'Como se chama seu lar? (opcional)'], 'ob.homeName.ph': ['Ej: Casa Rivera', 'E.g. The Smith Home', 'Ex: Casa Silva'],
    'ob.country': ['País', 'Country', 'País'], 'ob.currency': ['Moneda', 'Currency', 'Moeda'], 'ob.type': ['Tipo de hogar', 'Household type', 'Tipo de lar'],
    'ob.type.family': ['Familia con hijos', 'Family with kids', 'Família com filhos'], 'ob.type.couple': ['Pareja', 'Couple', 'Casal'], 'ob.type.single': ['Vivo solo/a', 'Living alone', 'Moro sozinho/a'], 'ob.type.shared': ['Casa compartida', 'Shared house', 'Casa compartilhada'], 'ob.type.other': ['Otro', 'Other', 'Outro'],
    'ob.members': ['¿Quiénes viven en casa?', 'Who lives at home?', 'Quem mora em casa?'], 'ob.members.t': ['Opcional. Sirve para repartir tareas. Puedes agregar más después.', 'Optional. Used to share tasks. You can add more later.', 'Opcional. Serve para dividir tarefas. Você pode adicionar mais depois.'], 'ob.members.ph': ['Nombre {n}', 'Name {n}', 'Nome {n}'],
    'ob.demo': ['Datos de ejemplo', 'Sample data', 'Dados de exemplo'], 'ob.demo.t': ['Puedes empezar con ejemplos para ver cómo funciona todo. Se quitan con un solo botón cuando quieras.', 'You can start with examples to see how everything works. Remove them with a single button whenever you want.', 'Você pode começar com exemplos para ver como tudo funciona. Remova com um único botão quando quiser.'],
    'ob.demo.yes': ['Sí, cargar ejemplos', 'Yes, load examples', 'Sim, carregar exemplos'], 'ob.demo.no': ['No, empezar vacío', 'No, start empty', 'Não, começar vazio'],
    'ob.privacy': ['Tus datos se guardan solo en este dispositivo. Nada se envía a internet.', 'Your data is stored only on this device. Nothing is sent to the internet.', 'Seus dados ficam só neste dispositivo. Nada é enviado para a internet.']
  });

  var cur = 'home';

  /* ---------- recipes in the active language ---------- */
  HF.reseedRecipes = function (lang) {
    var S = HF.state, favs = {}; S.recipes.forEach(function (r) { if (r.seed && r.fav) favs[r.id] = 1; });
    var keep = S.recipes.filter(function (r) { return !r.seed; });
    var fresh = HF.seedRecipes(lang).map(function (r) { if (favs[r.id]) r.fav = true; return r; });
    S.recipes = fresh.concat(keep);
  };

  /* ---------- chrome ---------- */
  function navItems() {
    var items = [{ id: 'home', icon: 'home' }].concat(HF.MODULES.filter(function (m) { return HF.moduleOn(m.id); }));
    items.push({ id: 'settings', icon: 'sliders' });
    return items;
  }
  /* ---- "Instalar como aplicación" (acceso directo) ---- */
  var INST = { prompt: null, installed: false };
  function isStandalone() { try { return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true; } catch (e) { return false; } }
  INST.installed = isStandalone();
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); INST.prompt = e; if (HF.state && HF.$('#top')) renderChrome(); });
  window.addEventListener('appinstalled', function () { INST.installed = true; INST.prompt = null; if (HF.toast) HF.toast(t('inst.done')); if (HF.state && HF.$('#top')) renderChrome(); if (cur === 'settings' && HF.refresh) HF.refresh(); });
  HF.canInstall = function () { return !INST.installed && /^https?:$/.test(location.protocol); };
  function platform() {
    var ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'iphone';
    if (/Android/.test(ua)) return 'android';
    if (/Macintosh|Mac OS X/.test(ua)) return 'mac';
    return 'windows';
  }
  HF.act['app.install'] = function () {
    if (INST.prompt) {
      var pr = INST.prompt; INST.prompt = null;
      try { pr.prompt(); } catch (e) { /* fall through to steps */ }
      if (pr.userChoice && pr.userChoice.then) pr.userChoice.then(function () { renderChrome(); });
      renderChrome(); return;
    }
    if (!/^https?:$/.test(location.protocol)) { HF.toast(t('inst.file'), { ms: 6000 }); return; }
    var me = platform(), all = ['android', 'iphone', 'windows', 'mac'], others = all.filter(function (k) { return k !== me; });
    var li = function (k) { return '<li>' + esc(t('inst.' + k)) + '</li>'; };
    HF.modal({ title: t('inst.title'), body: '<p>' + esc(t('inst.explain')) + '</p><p class="muted sm" style="margin-bottom:4px"><strong>' + esc(t('inst.here')) + '</strong></p><ul class="info-list">' + li(me) + '</ul>' +
      '<p class="muted sm" style="margin:12px 0 4px"><strong>' + esc(t('inst.others')) + '</strong></p><ul class="info-list">' + others.map(li).join('') + '</ul><p class="muted sm">' + esc(t('inst.note')) + '</p>' });
  };
  function installBtn() {
    if (!HF.canInstall()) return '';
    return '<button type="button" class="btn sm primary inst-btn" data-act="app.install" aria-label="' + esc(t('inst.btn')) + '">' + HF.icon('download', 16) + ' <span class="inst-l">' + esc(t('inst.btn')) + '</span><span class="inst-s">' + esc(t('inst.btn.short')) + '</span></button>';
  }

  function renderChrome() {
    var items = navItems(), S = HF.state;
    document.documentElement.lang = HF.lang() === 'pt' ? 'pt-BR' : HF.lang();
    document.title = t('app.name') + (S.settings.homeName ? ' · ' + S.settings.homeName : '');
    var sk = HF.$('#skip-link'); if (sk) sk.textContent = t('skip');
    HF.$('#side').setAttribute('aria-label', t('nav.main'));
    HF.$('#bottom').setAttribute('aria-label', t('nav.main'));
    HF.$('#side').innerHTML = '<div class="brand">' + HF.illo.plant.replace('class="illo"', 'class="brand-i"') + '<div><strong>' + esc(t('app.name')) + '</strong><small>' + esc(t('app.tagline')) + '</small></div></div><nav class="side-nav">' + items.map(function (i) {
      return '<a href="#' + i.id + '" class="nav-a' + (cur === i.id ? ' on' : '') + '" data-nav="' + i.id + '"' + (cur === i.id ? ' aria-current="page"' : '') + '>' + HF.icon(i.icon, 20) + '<span>' + esc(t('nav.' + i.id)) + '</span></a>';
    }).join('') + '</nav>';
    var main = ['home', 'tasks', 'calendar', 'shopping'].filter(function (id) { return items.some(function (i) { return i.id === id; }); });
    var rest = items.filter(function (i) { return main.indexOf(i.id) < 0; });
    var inRest = rest.some(function (i) { return i.id === cur; });
    HF.$('#bottom').innerHTML = main.map(function (id) {
      var i = items.filter(function (x) { return x.id === id; })[0];
      return '<a href="#' + id + '" class="bn' + (cur === id ? ' on' : '') + '" data-nav="' + id + '"' + (cur === id ? ' aria-current="page"' : '') + '>' + HF.icon(i.icon, 22) + '<span>' + esc(t('nav.' + id)) + '</span></a>';
    }).join('') + '<button type="button" class="bn' + (inRest ? ' on' : '') + '" data-act="nav.more">' + HF.icon('more', 22) + '<span>' + esc(t('nav.more')) + '</span></button>';
    HF.$('#top').innerHTML = '<div class="top-brand">' + esc(t('app.name')) + '</div><span class="grow"></span>' + installBtn() + '<button type="button" class="icon-btn" data-act="top.search" aria-label="' + esc(t('top.search')) + '">' + HF.icon('search', 20) + '</button><button type="button" class="icon-btn" data-act="top.theme" aria-label="' + esc(t('top.theme')) + '">' + HF.icon(document.documentElement.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon', 20) + '</button>';
  }
  function renderView() {
    var v = HF.views[cur] || HF.views.home, root = HF.$('#view');
    try { v.render(root); } catch (e) { root.innerHTML = '<p class="muted">⚠ ' + esc(String(e && e.message || e)) + '</p>'; if (window.console) console.error(e); }
    HF.hydratePhotos(root);
  }
  HF.refresh = function () {
    if (!HF.$('#app') || HF.$('#app').hidden) return;
    var y = window.scrollY; renderView(); window.scrollTo(0, y);
  };
  HF.rebuild = function () {
    if (!HF.state || !HF.state.settings.onboarded) { startOnboarding(); return; }
    var ob = HF.$('#onboard-root'); ob.innerHTML = ''; HF.$('#app').hidden = false;
    if (cur !== 'home' && cur !== 'settings' && !HF.moduleOn(cur)) cur = 'home';
    renderChrome(); renderView();
  };
  HF.navigate = function (view) {
    if (!HF.views[view]) view = 'home';
    if (location.hash !== '#' + view) { location.hash = view; } else route();
  };
  function route() {
    var v = (location.hash || '#home').slice(1);
    if (!HF.views[v] || (v !== 'home' && v !== 'settings' && !HF.moduleOn(v))) v = 'home';
    cur = v; HF.closeAllModals(); renderChrome(); renderView(); window.scrollTo(0, 0);
    var main = HF.$('#view'); if (main && document.activeElement && document.activeElement.closest && document.activeElement.closest('nav,aside')) { /* keep focus in nav */ } else if (main) main.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', function () { if (HF.state && HF.state.settings.onboarded) route(); });
  HF.openItem = function (kind, id) { if (kind === 'doc') HF.docForm(id); else if (kind === 'maint') HF.maintForm(id); else if (kind === 'inv') HF.invForm(id); };

  HF.act['top.theme'] = function () {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    HF.state.settings.theme = dark ? 'light' : 'dark'; HF.applyTheme(); HF.save(); renderChrome(); if (cur === 'settings') HF.refresh();
  };
  HF.act['nav.more'] = function () {
    var items = navItems(), ctl = HF.modal({ title: t('nav.more'), body: '<div class="more-grid">' + items.map(function (i) { return '<a href="#' + i.id + '" class="idx" data-more-link>' + '<span class="idx-i">' + HF.icon(i.icon, 22) + '</span><span>' + esc(t('nav.' + i.id)) + '</span></a>'; }).join('') + '</div>' });
    ctl.el.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-more-link]')) ctl.close(); });
  };

  /* ---------- global search ---------- */
  HF.act['top.search'] = function () {
    var ctl = HF.modal({ title: t('top.search'), wide: true, body: '<label class="search big"><span class="sr">' + esc(t('top.search')) + '</span>' + HF.icon('search', 18) + '<input id="gs-q" type="search" placeholder="' + esc(t('search.ph')) + '" autocomplete="off" maxlength="60"></label><div id="gs-res" class="gs-res" aria-live="polite"><p class="muted">' + esc(t('search.hint')) + '</p></div>' });
    var q = ctl.el.querySelector('#gs-q'), res = ctl.el.querySelector('#gs-res');
    setTimeout(function () { q.focus(); }, 40);
    q.addEventListener('input', function () {
      var r = searchAll(q.value);
      res.innerHTML = q.value.trim().length < 2 ? '<p class="muted">' + esc(t('search.hint')) + '</p>' : r.length ? '<ul class="gs-list">' + r.map(function (x, i) { return '<li><button type="button" class="gs-item" data-i="' + i + '"><span aria-hidden="true">' + x.icon + '</span><span><b>' + esc(x.title) + '</b><small class="muted">' + esc(x.kind) + (x.sub ? ' · ' + esc(x.sub) : '') + '</small></span></button></li>'; }).join('') + '</ul>' : '<p class="muted">' + esc(t('search.none')) + '</p>';
      res._r = r;
    });
    res.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-i]') : null; if (!b || !res._r) return;
      var x = res._r[+b.getAttribute('data-i')]; ctl.close(); if (x) x.go();
    });
  };
  function searchAll(raw) {
    var q = raw.trim().toLowerCase(), S = HF.state, out = []; if (q.length < 2) return out;
    var has = function (s) { return String(s || '').toLowerCase().indexOf(q) >= 0; };
    var push = function (o) { if (out.length < 40) out.push(o); };
    S.tasks.forEach(function (x) { if (has(x.title) || has(x.notes)) push({ icon: '✅', kind: t('nav.tasks'), title: x.title, sub: x.due ? HF.fmtDate(x.due) : '', go: function () { HF.taskForm(x.id); } }); });
    S.events.forEach(function (x) { if (has(x.title) || has(x.notes)) push({ icon: '📅', kind: t('nav.calendar'), title: x.title, sub: HF.fmtDate(x.date), go: function () { HF.eventForm(x.id); } }); });
    S.recipes.forEach(function (x) { if (has(x.name) || x.ingredients.some(function (i) { return has(i.name); })) push({ icon: '🍲', kind: t('nav.meals'), title: x.name, go: function () { HF.ui.meals.tab = 'recipes'; HF.ui.meals.rq = x.name; HF.go('meals'); } }); });
    S.shopping.forEach(function (x) { if (has(x.name)) push({ icon: '🛒', kind: t('nav.shopping'), title: x.name, go: function () { HF.ui.shop.tab = 'list'; HF.go('shopping'); } }); });
    S.inventory.forEach(function (x) { if (has(x.name) || has(x.notes)) push({ icon: '📦', kind: t('nav.inventory'), title: x.name, go: function () { HF.invForm(x.id); } }); });
    S.docs.forEach(function (x) { if (has(x.title) || has(x.notes)) push({ icon: '📄', kind: t('nav.docs'), title: x.title, sub: x.due ? HF.fmtDate(x.due) : '', go: function () { HF.docForm(x.id); } }); });
    S.maint.forEach(function (x) { if (has(x.name)) push({ icon: '🧽', kind: t('nav.maintenance'), title: x.name, go: function () { HF.maintForm(x.id); } }); });
    S.fin.tx.forEach(function (x) { if (has(x.note)) push({ icon: '💰', kind: t('nav.money'), title: x.note, sub: HF.money(x.amount) + ' · ' + HF.fmtDate(x.date), go: function () { HF.ui.money.month = x.date.slice(0, 7); HF.ui.money.tab = 'moves'; HF.go('money'); } }); });
    S.members.forEach(function (x) { if (has(x.name)) push({ icon: x.avatar, kind: t('nav.family'), title: x.name, go: function () { HF.go('family'); } }); });
    HF.allTemplates().forEach(function (x) { if (has(x.name)) push({ icon: '📋', kind: t('nav.templates'), title: x.name, go: function () { HF.go('templates'); } }); });
    return out;
  }

  /* ---------- onboarding ---------- */
  var ob = null;
  function startOnboarding() {
    if (!ob) { ob = { step: 0, lang: HF.state.settings.lang, name: '', country: '', currency: 'USD', type: 'family', members: ['', '', '', ''], demo: false }; }
    HF.$('#app').hidden = true; renderOb();
  }
  function renderOb() {
    var STEPS = 5, root = HF.$('#onboard-root'), s = ob.step;
    HF.state.settings.lang = ob.lang; HF.applyTheme(); document.documentElement.lang = ob.lang === 'pt' ? 'pt-BR' : ob.lang;
    var body = '';
    var sel = function (id, label, opts, val) { return '<label class="fld full"><span>' + esc(label) + '</span><select id="' + id + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></label>'; };
    if (s === 0) body = '<div class="ob-hero">' + HF.illo.house + '</div><h1>' + esc(t('ob.welcome')) + '</h1><p class="muted">' + esc(t('ob.welcome.t')) + '</p><div class="lang-row" role="group" aria-label="' + esc(t('set.lang')) + '">' + HF.LANGS.map(function (l) { return '<button type="button" class="btn' + (ob.lang === l[0] ? ' primary' : '') + '" data-ob-lang="' + l[0] + '" aria-pressed="' + (ob.lang === l[0]) + '">' + esc(l[1]) + '</button>'; }).join('') + '</div><p class="muted sm">' + HF.icon('shield', 14) + ' ' + esc(t('ob.privacy')) + '</p>';
    else if (s === 1) body = '<h2>' + esc(t('ob.home')) + '</h2><label class="fld full"><span>' + esc(t('ob.homeName')) + '</span><input id="ob-name" type="text" maxlength="40" value="' + esc(ob.name) + '" placeholder="' + esc(t('ob.homeName.ph')) + '"></label>' +
      sel('ob-country', t('ob.country'), [['', '—']].concat(HF.COUNTRIES.map(function (c) { return [c, HF.countryName(c)]; }).sort(function (a, b) { return a[1].localeCompare(b[1]); })), ob.country);
    else if (s === 2) body = '<h2>' + esc(t('ob.currency')) + '</h2>' + sel('ob-cur', t('ob.currency'), HF.CURRENCIES.map(function (c) { return [c, c + ' · ' + HF.currencyName(c)]; }), ob.currency) + '<p class="muted sm">' + esc(t('set.currency.note')) + '</p>' +
      sel('ob-type', t('ob.type'), ['family', 'couple', 'single', 'shared', 'other'].map(function (k) { return [k, t('ob.type.' + k)]; }), ob.type);
    else if (s === 3) body = '<h2>' + esc(t('ob.members')) + '</h2><p class="muted">' + esc(t('ob.members.t')) + '</p>' + ob.members.map(function (m, i) { return '<label class="fld full"><span class="sr">' + esc(t('ob.members.ph', { n: i + 1 })) + '</span><input type="text" class="ob-m" data-i="' + i + '" maxlength="30" value="' + esc(m) + '" placeholder="' + esc(t('ob.members.ph', { n: i + 1 })) + '"></label>'; }).join('');
    else body = '<h2>' + esc(t('ob.demo')) + '</h2><p class="muted">' + esc(t('ob.demo.t')) + '</p><div class="pick-row col"><button type="button" class="btn' + (ob.demo ? ' primary' : '') + '" data-ob-demo="1" aria-pressed="' + ob.demo + '">' + esc(t('ob.demo.yes')) + '</button><button type="button" class="btn' + (!ob.demo ? ' primary' : '') + '" data-ob-demo="0" aria-pressed="' + !ob.demo + '">' + esc(t('ob.demo.no')) + '</button></div>';
    root.innerHTML = '<div class="ob"><div class="ob-card" role="dialog" aria-modal="true" aria-label="' + esc(t('app.name')) + '"><div class="ob-prog" aria-hidden="true">' + [0, 1, 2, 3, 4].map(function (i) { return '<i class="' + (i <= s ? 'on' : '') + '"></i>'; }).join('') + '</div><p class="muted sm">' + esc(t('ob.step', { a: s + 1, b: STEPS })) + '</p>' + body +
      '<div class="ob-foot">' + (s > 0 ? '<button type="button" class="btn ghost" data-ob="back">' + esc(t('ob.back')) + '</button>' : '<span></span>') + '<button type="button" class="btn primary" data-ob="' + (s === STEPS - 1 ? 'finish' : 'next') + '">' + esc(s === STEPS - 1 ? t('ob.finish') : t('ob.next')) + '</button></div></div></div>';
    var first = root.querySelector('input,select,button.primary'); if (first) first.focus({ preventScroll: true });
  }
  function readOb() {
    var g = function (id) { return HF.$('#' + id); };
    if (g('ob-name')) ob.name = g('ob-name').value.trim();
    if (g('ob-country')) {
      var c = g('ob-country').value; if (c !== ob.country) { ob.country = c; if (HF.COUNTRY_CUR[c]) ob.currency = HF.COUNTRY_CUR[c]; }
    }
    if (g('ob-cur')) ob.currency = g('ob-cur').value;
    if (g('ob-type')) ob.type = g('ob-type').value;
    HF.$$('.ob-m').forEach(function (i) { ob.members[+i.getAttribute('data-i')] = i.value.trim(); });
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-ob],[data-ob-lang],[data-ob-demo]') : null; if (!el) return;
    if (el.hasAttribute('data-ob-lang')) { readOb(); ob.lang = el.getAttribute('data-ob-lang'); renderOb(); return; }
    if (el.hasAttribute('data-ob-demo')) { ob.demo = el.getAttribute('data-ob-demo') === '1'; renderOb(); return; }
    readOb();
    var a = el.getAttribute('data-ob');
    if (a === 'back') { ob.step = Math.max(0, ob.step - 1); renderOb(); }
    else if (a === 'next') { ob.step++; renderOb(); }
    else if (a === 'finish') finishOb();
  });
  function finishOb() {
    var S = HF.state, st = S.settings, colors = HF.COLORS, av = HF.AVATARS;
    st.lang = ob.lang; st.homeName = ob.name; st.country = ob.country; st.currency = ob.currency; st.homeType = ob.type;
    var si = 0;
    ob.members.forEach(function (n) { if (n) { S.members.push({ id: HF.uid(), name: n, role: '', avatar: av[si % av.length], color: colors[si % colors.length] }); si++; } });
    if (!S.fin.cats.length) S.fin.cats = HF.defaultFinCats();
    if (!S.recipes.length) S.recipes = HF.seedRecipes(st.lang);
    if (ob.demo) HF.seedDemo();
    st.onboarded = true; ob = null;
    HF.flush().then(function () { location.hash = 'home'; HF.rebuild(); route(); });
  }

  /* ---------- boot ---------- */
  function ready() {
    HF.store.init().then(HF.load).then(function () {
      var S = HF.state; HF.applyTheme();
      if (!S.fin.cats.length) S.fin.cats = HF.defaultFinCats();
      if (S.settings.onboarded && !S.recipes.length) S.recipes = HF.seedRecipes(S.settings.lang);
      var boot = HF.$('#boot'); if (boot) boot.remove();
      if (!S.settings.onboarded) startOnboarding();
      else { HF.$('#app').hidden = false; route(); }
    }).catch(function (e) {
      var b = HF.$('#boot'); if (b) b.innerHTML = '<p style="padding:24px;font-family:sans-serif">⚠ ' + esc(String(e && e.message || e)) + '</p>';
      if (window.console) console.error(e);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();

  /* service worker (only over http/https; never needed for file://) */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* offline cache optional */ }); });
  }
})();
