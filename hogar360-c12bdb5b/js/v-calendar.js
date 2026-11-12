/* HomeFlow 360 — Family calendar */
(function () {
  'use strict';
  var HF = window.HF, t = HF.t, esc = HF.esc;

  HF.addDict({
    'cal.title': ['Calendario familiar', 'Family calendar', 'Calendário da família'],
    'cal.month': ['Mes', 'Month', 'Mês'], 'cal.week': ['Semana', 'Week', 'Semana'], 'cal.list': ['Próximos', 'Upcoming', 'Próximos'],
    'cal.add': ['Nuevo evento', 'New event', 'Novo evento'], 'cal.edit': ['Editar evento', 'Edit event', 'Editar evento'],
    'cal.f.title': ['Título', 'Title', 'Título'], 'cal.f.repeat': ['Repetir', 'Repeat', 'Repetir'],
    'cal.day.empty': ['Sin actividades este día', 'Nothing planned this day', 'Nada planejado neste dia'],
    'cal.list.empty': ['No hay actividades en los próximos 60 días.', 'Nothing planned in the next 60 days.', 'Nada planejado nos próximos 60 dias.'],
    'cal.kind.task': ['Tarea', 'Task', 'Tarefa'], 'cal.kind.doc': ['Vencimiento', 'Deadline', 'Vencimento'],
    'cal.kind.warranty': ['Fin de garantía', 'Warranty ends', 'Fim da garantia'], 'cal.kind.maint': ['Mantenimiento', 'Maintenance', 'Manutenção'],
    'cal.kind.imaint': ['Mantenimiento de equipo', 'Equipment service', 'Manutenção de equipamento'],
    'cal.legend': ['Eventos, tareas con fecha y vencimientos aparecen juntos.', 'Events, dated tasks and deadlines appear together.', 'Eventos, tarefas com data e vencimentos aparecem juntos.'],
    'cal.more': ['+{n} más', '+{n} more', '+{n} mais'], 'cal.on': ['{n} actividades', '{n} items', '{n} atividades']
  });

  HF.ui.cal = { mode: 'month', cursor: null, sel: null };
  function U() { var c = HF.ui.cal; if (!c.cursor) { c.cursor = HF.today(); c.sel = HF.today(); } return c; }

  /* Recurring deadlines/tasks are projected into the following weeks/months (same rule as repeating events). */
  function docOn(d, iso) {
    if (!d.due) return false;
    if (d.due === iso) return true;
    return !!d.repeat && d.repeat !== 'none' && HF.eventOn({ date: d.due, repeat: d.repeat }, iso);
  }
  function taskOn(x, iso) {
    if (!x.due) return false;
    if (x.due === iso) return true;
    if (iso < x.due) return false;
    if (x.recur === 'weekly' || x.recur === 'monthly') return HF.eventOn({ date: x.due, repeat: x.recur }, iso);
    if (x.recur === 'days' && x.days && x.days.length) return x.days.indexOf(HF.parse(iso).getDay()) >= 0;
    return false;
  }

  HF.dayItems = function (iso) {
    var S = HF.state, out = [];
    HF.eventsOn(iso).forEach(function (e) { var c = HF.catOf(HF.EVENT_CATS, e.cat); out.push({ kind: 'event', id: e.id, title: e.title, icon: c.icon, color: c.color, time: e.time, sub: t('ev.cat.' + c.id) }); });
    S.tasks.forEach(function (x) { if (!x.done && taskOn(x, iso)) { var c = HF.catOf(HF.TASK_CATS, x.cat); out.push({ kind: 'task', id: x.id, title: x.title, icon: '✅', color: c.color, sub: t('cal.kind.task') }); } });
    S.docs.forEach(function (d) { if (!d.archived && docOn(d, iso)) out.push({ kind: 'doc', id: d.id, title: d.title, icon: HF.catOf(HF.DOC_TYPES, d.type).icon, color: '#d9a82e', sub: t('cal.kind.doc') }); });
    S.inventory.forEach(function (i) {
      if (i.warrantyEnd === iso) out.push({ kind: 'warranty', id: i.id, title: i.name, icon: '🧾', color: '#5f9ed1', sub: t('cal.kind.warranty') });
      if (i.nextMaint === iso) out.push({ kind: 'imaint', id: i.id, title: i.name, icon: '🔧', color: '#7e8fa3', sub: t('cal.kind.imaint') });
    });
    S.maint.forEach(function (m) { if (HF.maintNext(m) === iso) out.push({ kind: 'maint', id: m.id, title: m.name, icon: m.icon || '🧽', color: '#7e8fa3', sub: t('cal.kind.maint') }); });
    return out;
  };
  var itemBtn = function (it, full) {
    return '<button type="button" class="cal-item" style="--c:' + it.color + '" data-act="cal.open" data-kind="' + it.kind + '" data-id="' + it.id + '"><span class="ci-ic" aria-hidden="true">' + it.icon + '</span><span class="ci-t">' + esc(it.title) + '</span>' +
      (it.time ? '<span class="ci-time">' + esc(HF.fmtTime(it.time)) + '</span>' : '') + (full ? '<span class="ci-sub">' + esc(it.sub) + '</span>' : '') + '</button>';
  };

  HF.eventForm = function (id, preset) {
    var S = HF.state, x = id ? S.events.filter(function (e) { return e.id === id; })[0] : null;
    var v = x ? HF.clone(x) : Object.assign({ cat: 'family', date: U().sel || HF.today(), time: '', repeat: 'none' }, preset || {});
    HF.openForm({
      title: x ? t('cal.edit') : t('cal.add'), values: v,
      fields: [
        { name: 'title', label: t('cal.f.title'), required: true, full: true, autofocus: true },
        { name: 'cat', label: t('c.category'), type: 'select', options: HF.EVENT_CATS.map(function (c) { return { value: c.id, label: c.icon + ' ' + t('ev.cat.' + c.id) }; }) },
        { name: 'date', label: t('c.date'), type: 'date', required: true },
        { name: 'time', label: t('c.time'), type: 'time' },
        { name: 'repeat', label: t('cal.f.repeat'), type: 'select', options: ['none', 'weekly', 'monthly', 'yearly'].map(function (r) { return { value: r, label: t('freq.' + r) }; }) },
        { name: 'notes', label: t('c.notes'), type: 'textarea', rows: 2 }
      ],
      onSubmit: function (val) {
        if (!HF.validDate(val.date)) return false;
        if (x) { Object.assign(x, val); x.demo = false; } else S.events.push(Object.assign({ id: HF.uid() }, val));
        U().sel = val.date; U().cursor = val.date; HF.commit();
      },
      onDelete: x ? function () { S.events = S.events.filter(function (e) { return e.id !== x.id; }); HF.commit(); } : null
    });
  };

  HF.act['cal.open'] = function (el) {
    closeDay();
    var k = el.getAttribute('data-kind'), id = el.getAttribute('data-id');
    if (k === 'event') HF.eventForm(id);
    else if (k === 'task') HF.taskForm(id);
    else HF.openItem(k === 'doc' ? 'doc' : k === 'maint' ? 'maint' : 'inv', id);
  };
  HF.act['cal.new'] = function () { closeDay(); HF.eventForm(null); };
  HF.act['cal.mode'] = function (el) { U().mode = el.getAttribute('data-m'); HF.refresh(); };
  var dayCtl = null;
  function closeDay() { if (dayCtl) { dayCtl.close(); dayCtl = null; } }
  /* Tapping a day opens a window with everything that day, plus a button to add. */
  HF.act['cal.sel'] = function (el) {
    var d = el.getAttribute('data-d'); U().sel = d; HF.refresh();
    closeDay();
    var its = HF.dayItems(d);
    dayCtl = HF.modal({
      title: HF.fmtLong(d),
      body: its.length ? '<div class="cal-items">' + its.map(function (it) { return itemBtn(it, true); }).join('') + '</div>' : '<p class="muted">' + esc(t('cal.day.empty')) + '</p>',
      foot: '<button type="button" class="btn primary" data-act="cal.new">' + HF.icon('plus', 16) + ' ' + esc(t('cal.add')) + '</button>',
      onClose: function () { dayCtl = null; }
    });
  };
  HF.act['cal.nav'] = function (el) {
    var c = U(), dir = +el.getAttribute('data-dir');
    if (c.mode === 'month') c.cursor = HF.addMonths(c.cursor.slice(0, 8) + '01', dir);
    else c.cursor = HF.addDays(c.cursor, 7 * dir);
    c.sel = c.cursor; HF.refresh();
  };
  HF.act['cal.today'] = function () { var c = U(); c.cursor = HF.today(); c.sel = HF.today(); HF.refresh(); };

  HF.views.calendar = {
    render: function (root) {
      var c = U(), td = HF.today(), body = '', title = '';
      if (c.mode === 'month') {
        var first = c.cursor.slice(0, 8) + '01', gs = HF.weekStart(first), cells = '', i, d, cm = c.cursor.slice(0, 7);
        title = HF.fmtMonth(first);
        var wd = '';
        for (i = 0; i < 7; i++) wd += '<div class="cal-wd" aria-hidden="true">' + esc(HF.weekdayName(HF.addDays(gs, i), 'short')) + '</div>';
        var rows = Math.ceil((HF.diffDays(first, gs) + HF.daysInMonth(+first.slice(0, 4), +first.slice(5, 7))) / 7);
        for (i = 0; i < rows * 7; i++) {
          d = HF.addDays(gs, i);
          var its = HF.dayItems(d), dim = d.slice(0, 7) !== cm;
          cells += '<button type="button" class="cal-cell' + (dim ? ' dim' : '') + (d === td ? ' today' : '') + (d === c.sel ? ' sel' : '') + '" data-act="cal.sel" data-d="' + d + '" aria-label="' + esc(HF.fmtLong(d) + (its.length ? ', ' + t('cal.on', { n: its.length }) : '')) + '" aria-pressed="' + (d === c.sel) + '"><span class="cal-n">' + (+d.slice(8)) + '</span>' +
            '<span class="cal-dots">' + its.slice(0, 3).map(function (it) { return '<i style="background:' + it.color + '"></i>'; }).join('') + '</span>' +
            '<span class="cal-tt">' + its.slice(0, 2).map(function (it) { return '<em style="--c:' + it.color + '">' + esc(it.title) + '</em>'; }).join('') + (its.length > 2 ? '<em class="more">' + esc(t('cal.more', { n: its.length - 2 })) + '</em>' : '') + '</span></button>';
        }
        var selIts = HF.dayItems(c.sel);
        body = '<div class="cal-grid" role="group" aria-label="' + esc(title) + '">' + wd + cells + '</div>' +
          '<section class="card day-panel"><div class="card-h"><h3>' + esc(HF.fmtLong(c.sel)) + '</h3><button type="button" class="btn sm primary" data-act="cal.new">' + HF.icon('plus', 15) + ' ' + esc(t('cal.add')) + '</button></div>' +
          (selIts.length ? '<div class="cal-items">' + selIts.map(function (it) { return itemBtn(it, true); }).join('') + '</div>' : '<p class="muted">' + esc(t('cal.day.empty')) + '</p>') + '</section>';
      } else if (c.mode === 'week') {
        var ws = HF.weekStart(c.cursor), cols = '';
        title = HF.fmtDate(ws) + ' – ' + HF.fmtDate(HF.addDays(ws, 6), { day: 'numeric', month: 'short', year: 'numeric' });
        for (var k = 0; k < 7; k++) {
          var dd = HF.addDays(ws, k), ii = HF.dayItems(dd);
          cols += '<section class="wk-col' + (dd === td ? ' today' : '') + '"><h4><span>' + esc(HF.weekdayName(dd, 'short')) + '</span> <b>' + (+dd.slice(8)) + '</b></h4>' +
            (ii.length ? ii.map(function (it) { return itemBtn(it, false); }).join('') : '<p class="muted sm">—</p>') +
            '<button type="button" class="btn sm ghost wk-add" data-act="cal.sel" data-d="' + dd + '" aria-label="' + esc(t('cal.add') + ' ' + HF.fmtLong(dd)) + '"></button></section>';
        }
        body = '<div class="wk-grid">' + cols + '</div><p class="muted sm">' + esc(t('cal.legend')) + '</p>';
      } else {
        title = t('cal.list');
        var out = '', n = 0;
        for (var j = 0; j < 60; j++) {
          var d2 = HF.addDays(td, j), it2 = HF.dayItems(d2);
          if (it2.length) { n++; out += '<section class="card list-day"><h4>' + esc(j === 0 ? t('c.today') + ' · ' : j === 1 ? t('c.tomorrow') + ' · ' : '') + esc(HF.fmtLong(d2)) + '</h4><div class="cal-items">' + it2.map(function (it) { return itemBtn(it, true); }).join('') + '</div></section>'; }
        }
        body = n ? out : HF.empty({ illo: 'plant', title: t('cal.list.empty'), actions: '<button type="button" class="btn primary" data-act="cal.new">' + HF.icon('plus', 16) + ' ' + esc(t('cal.add')) + '</button>' });
      }
      var modes = ['month', 'week', 'list'].map(function (m) { return '<button type="button" role="tab" class="tab' + (c.mode === m ? ' on' : '') + '" aria-selected="' + (c.mode === m) + '" data-act="cal.mode" data-m="' + m + '">' + esc(t('cal.' + m)) + '</button>'; }).join('');
      var nav = c.mode === 'list' ? '' : '<div class="cal-nav"><button type="button" class="icon-btn" data-act="cal.nav" data-dir="-1" aria-label="' + esc(t('c.prev')) + '">' + HF.icon('chevL', 20) + '</button><h2 class="cal-title" aria-live="polite">' + esc(title) + '</h2><button type="button" class="icon-btn" data-act="cal.nav" data-dir="1" aria-label="' + esc(t('c.nextP')) + '">' + HF.icon('chevR', 20) + '</button><button type="button" class="btn sm ghost" data-act="cal.today">' + esc(t('c.today')) + '</button></div>';
      root.innerHTML = '<div class="page-h"><h1>' + esc(t('cal.title')) + '</h1><div class="page-actions"><button type="button" class="btn primary" data-act="cal.new">' + HF.icon('plus', 16) + ' ' + esc(t('cal.add')) + '</button></div></div><div class="tabs" role="tablist">' + modes + '</div>' + nav + body;
    }
  };
})();
