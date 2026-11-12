/* HomeFlow 360 — "Mi Hogar" dashboard */
(function () {
  'use strict';
  var HF = window.HF, t = HF.t, esc = HF.esc;

  HF.MODULES = [
    { id: 'tasks', icon: 'check' }, { id: 'calendar', icon: 'calendar' }, { id: 'meals', icon: 'bowl' }, { id: 'shopping', icon: 'cart' }, { id: 'money', icon: 'wallet' },
    { id: 'inventory', icon: 'box' }, { id: 'maintenance', icon: 'wrench' }, { id: 'family', icon: 'users' }, { id: 'docs', icon: 'file' }, { id: 'templates', icon: 'list' }
  ];
  HF.moduleOn = function (id) { return HF.state.settings.hidden.indexOf(id) < 0; };

  HF.addDict({
    'home.greet.m': ['Buenos días', 'Good morning', 'Bom dia'], 'home.greet.a': ['Buenas tardes', 'Good afternoon', 'Boa tarde'], 'home.greet.n': ['Buenas noches', 'Good evening', 'Boa noite'],
    'home.sub': ['Esto es lo que pasa hoy en casa.', 'Here is what is happening at home today.', 'Veja o que acontece hoje em casa.'],
    'home.w.summary': ['Resumen del día', 'Today at a glance', 'Resumo do dia'], 'home.w.tasks': ['Tareas de hoy', 'Today\'s tasks', 'Tarefas de hoje'], 'home.w.events': ['Próximos eventos', 'Upcoming events', 'Próximos eventos'],
    'home.w.progress': ['Progreso semanal', 'Weekly progress', 'Progresso semanal'], 'home.w.reminders': ['Recordatorios y vencimientos', 'Reminders & due dates', 'Lembretes e vencimentos'],
    'home.w.shopping': ['Lista de compras', 'Shopping list', 'Lista de compras'], 'home.w.money': ['Economía del mes', 'Money this month', 'Finanças do mês'],
    'home.w.index': ['Todo tu hogar', 'Your whole home', 'Toda a sua casa'], 'home.w.quick': ['Acciones rápidas', 'Quick actions', 'Ações rápidas'],
    'home.noEvents': ['Sin eventos próximos', 'No upcoming events', 'Sem eventos próximos'], 'home.noRem': ['Todo al día. ¡Bien hecho!', 'All caught up. Well done!', 'Tudo em dia. Muito bem!'],
    'home.noTasks': ['No hay tareas para hoy. ¡Disfruta!', 'No tasks for today. Enjoy!', 'Sem tarefas para hoje. Aproveite!'],
    'home.shop.n': ['{n} productos por comprar', '{n} items to buy', '{n} itens para comprar'], 'home.shop.none': ['La lista está vacía', 'The list is empty', 'A lista está vazia'],
    'home.seeAll': ['Ver todo', 'See all', 'Ver tudo'], 'home.demoBanner': ['Estás viendo datos de ejemplo.', 'You are seeing sample data.', 'Você está vendo dados de exemplo.'],
    'home.demoRemove': ['Quitar datos de ejemplo', 'Remove sample data', 'Remover dados de exemplo'],
    'home.demoRemoved': ['Datos de ejemplo eliminados', 'Sample data removed', 'Dados de exemplo removidos'],
    'home.backupNudge': ['Hace tiempo que no haces un respaldo. Guarda una copia para no perder nada.', 'It has been a while since your last backup. Save a copy so you never lose anything.', 'Faz tempo que você não faz backup. Salve uma cópia para não perder nada.'],
    'home.backupNow': ['Respaldar ahora', 'Back up now', 'Fazer backup'], 'home.overdue': ['{n} atrasadas', '{n} overdue', '{n} atrasadas'],
    'home.doneToday': ['hechas', 'done', 'feitas'], 'home.q.task': ['Nueva tarea', 'New task', 'Nova tarefa'], 'home.q.event': ['Nuevo evento', 'New event', 'Novo evento'], 'home.q.shop': ['Agregar compra', 'Add to shopping', 'Adicionar compra'], 'home.q.exp': ['Registrar gasto', 'Log expense', 'Registrar despesa'],
    'home.q.shop.prompt': ['¿Qué necesitas comprar?', 'What do you need to buy?', 'O que você precisa comprar?']
  });

  HF.act['home.removeDemo'] = function () {
    HF.confirm({ title: t('home.demoRemove'), text: t('c.deleteAsk'), ok: t('home.demoRemove'), danger: true }).then(function (y) {
      if (!y) return; HF.makeSnapshot().then(function () { HF.removeDemo(); HF.toast(t('home.demoRemoved')); HF.commit(); });
    });
  };
  HF.act['home.nav'] = function (el) { HF.go(el.getAttribute('data-v')); };
  HF.act['home.q'] = function (el) {
    var k = el.getAttribute('data-q');
    if (k === 'task') HF.taskForm(null);
    else if (k === 'event') HF.eventForm(null);
    else if (k === 'exp') { HF.ui.money.tab = 'moves'; HF.go('money'); HF.act['money.new'](null); }
    else if (k === 'shop') {
      HF.openForm({ title: t('home.q.shop'), values: { q: '' }, fields: [{ name: 'q', label: t('home.q.shop.prompt'), required: true, full: true, autofocus: true }], submit: t('shop.add'),
        onSubmit: function (v) { var p = HF.parseQtyLine(v.q); if (p) HF.addIngredientsToShopping([{ name: p.name, qty: p.qty, unit: p.unit, cat: HF.guessShopCat(p.name) }]); HF.commit(); } });
    }
  };

  function card(key, title, view, inner, cls) {
    return '<section class="card w w-' + key + (cls ? ' ' + cls : '') + '"><div class="w-h"><h2>' + esc(title) + '</h2>' + (view && HF.moduleOn(view) ? '<button type="button" class="link" data-act="home.nav" data-v="' + view + '">' + esc(t('home.seeAll')) + '</button>' : '') + '</div>' + inner + '</section>';
  }

  HF.views.home = {
    render: function (root) {
      var S = HF.state, D = S.settings.dash, td = HF.today(), h = new Date().getHours(), cur = S.settings.currency;
      var greet = t(h < 12 ? 'home.greet.m' : h < 19 ? 'home.greet.a' : 'home.greet.n');
      var out = '<div class="home-hero"><div><p class="eyebrow">' + esc(HF.fmtLong(td)) + '</p><h1>' + esc(greet) + (S.settings.homeName ? ', ' + esc(S.settings.homeName) : '') + '</h1><p class="muted">' + esc(t('home.sub')) + '</p></div>' + HF.illo.house + '</div>';
      var last = S.settings.lastBackup, stale = !last ? (S.log.length + S.tasks.length + S.docs.length > 12 && !S.settings.demo) : HF.diffDays(td, last) > 30;
      if (S.settings.demo && HF.hasDemo()) out += '<div class="banner"><span>' + HF.icon('sparkle', 16) + ' ' + esc(t('home.demoBanner')) + '</span><button type="button" class="btn sm" data-act="home.removeDemo">' + esc(t('home.demoRemove')) + '</button></div>';
      if (stale) out += '<div class="banner warn"><span>' + HF.icon('shield', 16) + ' ' + esc(t('home.backupNudge')) + '</span><button type="button" class="btn sm" data-act="set.export">' + esc(t('home.backupNow')) + '</button></div>';
      var w = [], ts = HF.todayStats(), wk = HF.weekStats();

      if (D.summary) {
        var up = HF.upcoming(7).filter(function (u) { return u.days <= 7; }).length, od = S.tasks.filter(function (x) { return !x.done && x.due && x.due < td; }).length;
        w.push(card('summary', t('home.w.summary'), null, '<div class="sum-row">' + HF.ring(ts.pct, ts.done + '/' + ts.total, t('home.doneToday'), 96) + '<div class="sum-txt"><p><b>' + esc(t('tasks.today.of', { done: ts.done, total: ts.total })) + '</b></p>' + (od ? '<p class="warn-t">' + esc(t('home.overdue', { n: od })) + '</p>' : '') + (HF.streak() > 1 ? '<p>🔥 ' + esc(t('tasks.streak', { n: HF.streak() })) + '</p>' : '') + '<p class="muted sm">' + esc(t('home.w.reminders')) + ': ' + up + '</p></div></div>', 'wide'));
      }
      if (D.tasks && HF.moduleOn('tasks')) {
        var todays = S.tasks.filter(function (x) { return !x.done && x.due && x.due <= td; }).sort(function (a, b) { return a.due < b.due ? -1 : 1; }).slice(0, 5);
        w.push(card('tasks', t('home.w.tasks'), 'tasks', todays.length ? '<ul class="tlist">' + todays.map(function (x) { return HF.taskRow(x); }).join('') + '</ul>' : '<p class="muted">' + esc(t('home.noTasks')) + '</p>'));
      }
      if (D.events && HF.moduleOn('calendar')) {
        var evs = []; for (var i = 0; i < 14 && evs.length < 4; i++) { var iso = HF.addDays(td, i); HF.eventsOn(iso).forEach(function (e) { if (evs.length < 4) evs.push({ e: e, d: iso }); }); }
        w.push(card('events', t('home.w.events'), 'calendar', evs.length ? '<ul class="mini-list">' + evs.map(function (o) { var c = HF.catOf(HF.EVENT_CATS, o.e.cat); return '<li><span class="dot" style="background:' + c.color + '"></span><b>' + esc(o.e.title) + '</b> <small class="muted">· ' + esc(HF.relDay(o.d)) + (o.e.time ? ' ' + esc(o.e.time) : '') + '</small></li>'; }).join('') + '</ul>' : '<p class="muted">' + esc(t('home.noEvents')) + '</p>'));
      }
      if (D.progress && HF.moduleOn('tasks')) {
        w.push(card('progress', t('home.w.progress'), null, '<p class="big">' + wk.pct + '%</p>' + HF.bar(wk.pct, 'accent', t('home.w.progress')) + '<p class="muted sm">' + esc(t('tasks.week.of', { done: wk.done, total: wk.total })) + '</p>'));
      }
      if (D.reminders) {
        var rem = HF.upcoming(14).slice(0, 5);
        w.push(card('reminders', t('home.w.reminders'), 'docs', rem.length ? '<ul class="mini-list">' + rem.map(function (r) { return '<li><span aria-hidden="true">' + r.icon + '</span> <b>' + esc(r.title) + '</b> <small class="' + (r.days < 0 ? 'warn-t' : 'muted') + '">· ' + esc(HF.statusDays(r.days)) + '</small></li>'; }).join('') + '</ul>' : '<p class="muted">' + esc(t('home.noRem')) + '</p>'));
      }
      if (D.shopping && HF.moduleOn('shopping')) {
        var left = S.shopping.filter(function (x) { return !x.bought; }).length;
        w.push(card('shopping', t('home.w.shopping'), 'shopping', '<p class="big">' + (left ? esc(t('home.shop.n', { n: left })) : esc(t('home.shop.none'))) + '</p>'));
      }
      if (D.money && HF.moduleOn('money')) {
        var ms = HF.monthStats(td.slice(0, 7)), al = HF.budgetAlerts(td.slice(0, 7));
        w.push(card('money', t('home.w.money'), 'money', '<div class="mini-stats"><div><span class="muted sm">' + esc(t('money.income')) + '</span><b>' + esc(HF.money(ms.income, cur)) + '</b></div><div><span class="muted sm">' + esc(t('money.expense')) + '</span><b>' + esc(HF.money(ms.expense, cur)) + '</b></div></div><p class="' + (ms.balance < 0 ? 'neg' : 'pos') + '">' + esc(t('money.balance')) + ': <b>' + esc(HF.money(ms.balance, cur)) + '</b></p>' + (al.length ? '<p class="warn-t">' + HF.icon('bell', 14) + ' ' + esc(t('money.alerts')) + ': ' + al.length + '</p>' : '')));
      }
      if (D.quick) {
        w.push(card('quick', t('home.w.quick'), null, '<div class="quick">' + [['task', 'check', 'home.q.task', 'tasks'], ['event', 'calendar', 'home.q.event', 'calendar'], ['shop', 'cart', 'home.q.shop', 'shopping'], ['exp', 'wallet', 'home.q.exp', 'money']].filter(function (q) { return HF.moduleOn(q[3]); }).map(function (q) { return '<button type="button" class="btn" data-act="home.q" data-q="' + q[0] + '">' + HF.icon(q[1], 16) + ' ' + esc(t(q[2])) + '</button>'; }).join('') + '</div>'));
      }
      out += '<div class="wgrid">' + w.join('') + '</div>';
      if (D.index) {
        out += '<section class="card w-index"><div class="w-h"><h2>' + esc(t('home.w.index')) + '</h2></div><div class="index-grid">' + HF.MODULES.filter(function (m) { return HF.moduleOn(m.id); }).map(function (m) {
          return '<button type="button" class="idx" data-act="home.nav" data-v="' + m.id + '"><span class="idx-i">' + HF.icon(m.icon, 22) + '</span><span>' + esc(t('nav.' + m.id)) + '</span></button>';
        }).join('') + '</div></section>';
      }
      root.innerHTML = out;
    }
  };
})();
