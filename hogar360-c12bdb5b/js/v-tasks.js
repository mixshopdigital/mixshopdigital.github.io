/* HomeFlow 360 — Tasks & routines */
(function () {
  'use strict';
  var HF = window.HF, t = HF.t, esc = HF.esc;

  HF.addDict({
    'tasks.title': ['Tareas y rutinas', 'Tasks & routines', 'Tarefas e rotinas'],
    'tasks.tab.today': ['Hoy', 'Today', 'Hoje'], 'tasks.tab.week': ['Esta semana', 'This week', 'Esta semana'],
    'tasks.tab.all': ['Pendientes', 'Open', 'Pendentes'], 'tasks.tab.done': ['Hechas', 'Done', 'Concluídas'], 'tasks.tab.routines': ['Rutinas', 'Routines', 'Rotinas'],
    'tasks.add': ['Nueva tarea', 'New task', 'Nova tarefa'], 'tasks.edit': ['Editar tarea', 'Edit task', 'Editar tarefa'],
    'tasks.f.title': ['¿Qué hay que hacer?', 'What needs to be done?', 'O que precisa ser feito?'],
    'tasks.f.due': ['Fecha', 'Due date', 'Data'], 'tasks.f.assignee': ['Responsable', 'Assigned to', 'Responsável'], 'tasks.f.recur': ['Repetir', 'Repeat', 'Repetir'],
    'tasks.f.rotate': ['Rotar el responsable cada vez que se complete', 'Rotate the owner every time it is completed', 'Alternar o responsável a cada conclusão'],
    'tasks.filter.cat': ['Categoría', 'Category', 'Categoria'], 'tasks.filter.who': ['Responsable', 'Person', 'Pessoa'],
    'tasks.empty.title': ['Nada pendiente por aquí', 'Nothing pending here', 'Nada pendente por aqui'],
    'tasks.empty.text': ['Agrega una tarea o elige una sugerencia para empezar.', 'Add a task or pick a suggestion to get started.', 'Adicione uma tarefa ou escolha uma sugestão para começar.'],
    'tasks.suggest': ['Sugerencias', 'Suggestions', 'Sugestões'],
    'tasks.suggest.title': ['Sugerencias de tareas', 'Task suggestions', 'Sugestões de tarefas'],
    'tasks.suggest.text': ['Toca una para agregarla a tu lista.', 'Tap one to add it to your list.', 'Toque em uma para adicioná-la à lista.'],
    'tasks.suggest.added': ['Agregada: {title}', 'Added: {title}', 'Adicionada: {title}'],
    'tasks.rotate': ['Rotar responsabilidades', 'Rotate responsibilities', 'Alternar responsabilidades'],
    'tasks.rotated': ['Responsabilidades rotadas', 'Responsibilities rotated', 'Responsabilidades alternadas'],
    'tasks.rotate.need': ['Agrega al menos dos integrantes en Familia para rotar tareas.', 'Add at least two members in Family to rotate tasks.', 'Adicione pelo menos duas pessoas em Família para alternar tarefas.'],
    'tasks.rotate.none': ['No hay tareas con responsable para rotar.', 'There are no assigned tasks to rotate.', 'Não há tarefas com responsável para alternar.'],
    'tasks.completed': ['Completada', 'Completed', 'Concluída'],
    'tasks.reopened': ['Tarea reabierta', 'Task reopened', 'Tarefa reaberta'],
    'tasks.today.of': ['{done} de {total} hechas hoy', '{done} of {total} done today', '{done} de {total} feitas hoje'],
    'tasks.today.none': ['Sin tareas para hoy', 'No tasks for today', 'Sem tarefas para hoje'],
    'tasks.week.prog': ['Progreso de la semana', 'Weekly progress', 'Progresso da semana'],
    'tasks.week.of': ['{done} de {total} tareas', '{done} of {total} tasks', '{done} de {total} tarefas'],
    'tasks.streak': ['Racha: {n} días', 'Streak: {n} days', 'Sequência: {n} dias'],
    'tasks.routine.new': ['Nueva rutina', 'New routine', 'Nova rotina'], 'tasks.routine.name': ['Nombre de la rutina', 'Routine name', 'Nome da rotina'],
    'tasks.routine.lines': ['Tareas (una por línea)', 'Tasks (one per line)', 'Tarefas (uma por linha)'],
    'tasks.routine.hint': ['Cada línea se convierte en una tarea que se repite sola.', 'Each line becomes a task that repeats on its own.', 'Cada linha vira uma tarefa que se repete sozinha.'],
    'tasks.routine.empty': ['Aún no tienes rutinas. Crea una desde cero o usa una plantilla.', 'You have no routines yet. Create one from scratch or use a template.', 'Você ainda não tem rotinas. Crie uma do zero ou use um modelo.'],
    'tasks.routine.fromTpl': ['Usar una plantilla', 'Use a template', 'Usar um modelo'],
    'tasks.routine.delete': ['¿Eliminar la rutina "{name}" y sus {n} tareas?', 'Delete the routine "{name}" and its {n} tasks?', 'Excluir a rotina "{name}" e suas {n} tarefas?'],
    'tasks.routine.single': ['Tareas repetitivas sueltas', 'Individual repeating tasks', 'Tarefas repetidas avulsas'],
    'tasks.saved.for': ['Tarea guardada · {d}', 'Task saved · {d}', 'Tarefa salva · {d}'],
    'tasks.done.empty': ['Todavía no completaste tareas.', 'No completed tasks yet.', 'Nenhuma tarefa concluída ainda.'],
    'tasks.routine.created': ['Rutina creada con {n} tareas', 'Routine created with {n} tasks', 'Rotina criada com {n} tarefas'],
    'tasks.routine.count': ['{n} tareas', '{n} tasks', '{n} tarefas'],
    'freq.days': ['Días de la semana', 'Days of the week', 'Dias da semana'],
    'tasks.f.days': ['¿Qué días de la semana?', 'Which days of the week?', 'Quais dias da semana?'],
    'tasks.f.days.hint': ['Ej.: basura martes, jueves y sábado. Al completarla, pasa sola al siguiente día elegido.', 'E.g. trash on Tue, Thu and Sat. When completed, it moves on to the next chosen day.', 'Ex.: lixo na terça, quinta e sábado. Ao concluir, passa sozinha para o próximo dia escolhido.'],
    'tasks.f.days.need': ['Elige al menos un día de la semana.', 'Pick at least one day of the week.', 'Escolha pelo menos um dia da semana.'],
    'tasks.next': ['Próxima', 'Next', 'Próxima'],
    'tasks.doneOn': ['Hecha {d}', 'Done {d}', 'Feita {d}'],
    'tasks.reopen': ['Reabrir', 'Reopen', 'Reabrir'],
    'tasks.mark': ['Marcar como hecha: {title}', 'Mark as done: {title}', 'Marcar como feita: {title}'],
    'tasks.unmark': ['Reabrir: {title}', 'Reopen: {title}', 'Reabrir: {title}'],
    'tasks.noneFilter': ['No hay tareas con estos filtros.', 'No tasks match these filters.', 'Nenhuma tarefa com esses filtros.']
  });

  HF.nextWeekday = function (from, days) {
    for (var i = 0; i < 7; i++) { var d = HF.addDays(from, i); if (days.indexOf(HF.parse(d).getDay()) >= 0) return d; }
    return from;
  };
  HF.recurLabel = function (x) {
    if (x.recur !== 'days') return t('freq.' + x.recur);
    var ws = HF.state.settings.weekStart || 0, ds = (x.days || []).slice().sort(function (a, b) { return ((a - ws + 7) % 7) - ((b - ws + 7) % 7); });
    return ds.map(function (d) { return HF.weekdayName(HF.addDays('2024-01-07', d), 'short'); }).join(', ');
  };
  var NEXT = function (base, r, days) { if (r === 'days') return HF.nextWeekday(HF.addDays(base, 1), days || [1]); return r === 'daily' ? HF.addDays(base, 1) : r === 'weekly' ? HF.addDays(base, 7) : HF.addMonths(base, 1); };
  var catLabel = function (id) { return t('cat.' + id); };
  HF.ui.tasks = { tab: 'today', cat: '', who: '' };

  /* ----- logic ----- */
  function nextMember(cur) {
    var ms = HF.state.members; if (!ms.length) return '';
    var i = ms.findIndex(function (m) { return m.id === cur; });
    return ms[(i + 1) % ms.length].id;
  }
  HF.completeTask = function (id) {
    var S = HF.state, task = S.tasks.filter(function (x) { return x.id === id; })[0]; if (!task) return null;
    var snap = HF.clone(task), today = HF.today();
    var entry = { id: HF.uid(), taskId: task.id, title: task.title, date: today, at: Date.now(), memberId: task.assignee || '' };
    S.log.push(entry);
    if (task.recur && task.recur !== 'none') {
      var base = task.due && task.due > today ? task.due : today;
      entry.prevDue = task.due; entry.prevAssignee = task.assignee || '';
      task.due = NEXT(base, task.recur, task.days);
      if (task.rotate) task.assignee = nextMember(task.assignee);
    } else { task.done = true; task.doneAt = today; }
    return { snap: snap, entry: entry };
  };
  HF.undoComplete = function (r) {
    var S = HF.state, i = S.tasks.findIndex(function (x) { return x.id === r.snap.id; });
    if (i >= 0) S.tasks[i] = r.snap;
    S.log = S.log.filter(function (l) { return l.id !== r.entry.id; });
    HF.commit();
  };
  HF.reopenTask = function (id) {
    var S = HF.state, task = S.tasks.filter(function (x) { return x.id === id; })[0]; if (!task) return;
    task.done = false; delete task.doneAt;
    for (var i = S.log.length - 1; i >= 0; i--) if (S.log[i].taskId === id) { S.log.splice(i, 1); break; }
  };
  HF.todayStats = function () {
    var S = HF.state, td = HF.today();
    var done = S.log.filter(function (l) { return l.date === td; }).length;
    var pending = S.tasks.filter(function (x) { return !x.done && x.due && x.due <= td; }).length;
    var total = done + pending;
    return { done: done, pending: pending, total: total, pct: total ? Math.round(done / total * 100) : 0 };
  };
  HF.weekStats = function () {
    var S = HF.state, ws = HF.weekStart(HF.today()), we = HF.addDays(ws, 6);
    var done = S.log.filter(function (l) { return l.date >= ws && l.date <= we; }).length;
    var pending = S.tasks.filter(function (x) { return !x.done && x.due && x.due <= we; }).length;
    var total = done + pending;
    return { done: done, pending: pending, total: total, pct: total ? Math.round(done / total * 100) : 0 };
  };
  HF.streak = function () {
    var days = {}; HF.state.log.forEach(function (l) { days[l.date] = 1; });
    var d = HF.today(), n = 0;
    if (!days[d]) d = HF.addDays(d, -1);
    while (days[d]) { n++; d = HF.addDays(d, -1); }
    return n;
  };
  function sortTasks(list) {
    var pr = { high: 0, mid: 1, low: 2 };
    return list.sort(function (a, b) {
      var da = a.due || '9999', db = b.due || '9999';
      if (da !== db) return da < db ? -1 : 1;
      if (pr[a.prio] !== pr[b.prio]) return (pr[a.prio] || 1) - (pr[b.prio] || 1);
      return a.title.localeCompare(b.title);
    });
  }

  /* ----- completed history (includes recurring tasks, which jump to their next date instead of staying "done") ----- */
  function doneRows() {
    var S = HF.state, U = HF.ui.tasks, seen = {}, rows = [];
    S.log.slice().sort(function (a, b) { return (b.at || 0) - (a.at || 0); }).forEach(function (l) {
      var tk = S.tasks.filter(function (x) { return x.id === l.taskId; })[0]; seen[l.taskId] = 1;
      if (U.cat && (!tk || tk.cat !== U.cat)) return;
      if (U.who && l.memberId !== U.who) return;
      rows.push({ kind: 'log', l: l, tk: tk });
    });
    S.tasks.filter(function (x) { return x.done && !seen[x.id] && (!U.cat || x.cat === U.cat) && (!U.who || x.assignee === U.who); }).forEach(function (x) { rows.push({ kind: 'task', tk: x }); });
    return rows.slice(0, 80);
  }
  function doneRowHtml(r) {
    if (r.kind === 'task') return HF.taskRow(r.tk);
    var l = r.l, tk = r.tk, m = l.memberId ? HF.member(l.memberId) : null, c = tk ? HF.catOf(HF.TASK_CATS, tk.cat) : null;
    return '<li class="task done"><span class="chk-btn on" aria-hidden="true">' + HF.icon('check', 18) + '</span><div class="task-main"><span class="task-title">' + esc(l.title) + '</span><span class="task-meta">' +
      (c ? HF.chip(catLabel(c.id), 'cat', c.icon) : '') + HF.chip(t('tasks.doneOn', { d: HF.relDay(l.date) }), 'ok') + (l.demo ? HF.chip(t('c.demo'), 'demo') : '') + '</span></div>' + (m ? HF.avatar(m, 30) : '') +
      '<button type="button" class="btn sm ghost" data-act="task.undoLog" data-id="' + l.id + '">' + esc(t('c.undo')) + '</button></li>';
  }
  HF.act['task.undoLog'] = function (el) {
    var S = HF.state, id = el.getAttribute('data-id'), l = S.log.filter(function (x) { return x.id === id; })[0]; if (!l) return;
    var tk = S.tasks.filter(function (x) { return x.id === l.taskId; })[0];
    if (tk) {
      if (l.prevDue !== undefined) { tk.due = l.prevDue; tk.assignee = l.prevAssignee; }
      else if (tk.done) { tk.done = false; delete tk.doneAt; }
    }
    S.log = S.log.filter(function (x) { return x.id !== id; });
    HF.toast(t('tasks.reopened')); HF.commit();
  };

  /* ----- row ----- */
  HF.taskRow = function (x, opts) {
    opts = opts || {};
    var m = x.assignee ? HF.member(x.assignee) : null, c = HF.catOf(HF.TASK_CATS, x.cat);
    var chips = HF.chip(catLabel(c.id), 'cat', c.icon) + (x.done ? HF.chip(t('tasks.doneOn', { d: HF.relDay(x.doneAt || HF.today()) }), 'ok') : HF.dueChip(x.due)) +
      (x.recur && x.recur !== 'none' ? HF.chip(HF.recurLabel(x), '', HF.icon('repeat', 13)) : '') + (x.prio === 'high' && !x.done ? HF.chip(t('prio.high'), 'bad') : '') + (x.demo ? HF.chip(t('c.demo'), 'demo') : '');
    return '<li class="task' + (x.done ? ' done' : '') + '"><button type="button" class="chk-btn" data-act="task.toggle" data-id="' + x.id + '" aria-label="' + esc(t(x.done ? 'tasks.unmark' : 'tasks.mark', { title: x.title })) + '" aria-pressed="' + (x.done ? 'true' : 'false') + '">' + HF.icon('check', 18) + '</button>' +
      '<button type="button" class="task-main" data-act="task.edit" data-id="' + x.id + '"><span class="task-title">' + esc(x.title) + '</span><span class="task-meta">' + chips + '</span></button>' + (m ? HF.avatar(m, 30) : '') + '</li>';
  };

  /* ----- actions ----- */
  function floatPlus(el) {
    var r = el.getBoundingClientRect(), s = document.createElement('span');
    s.className = 'floatplus'; s.textContent = '+1 ⭐'; s.style.left = (r.left + 4) + 'px'; s.style.top = (r.top - 4) + 'px';
    document.body.appendChild(s); setTimeout(function () { s.remove(); }, 1000);
  }
  HF.act['task.toggle'] = function (el) {
    if (el.getAttribute('data-busy')) return;
    var id = el.getAttribute('data-id'), x = HF.state.tasks.filter(function (k) { return k.id === id; })[0]; if (!x) return;
    if (x.done) { HF.reopenTask(id); HF.toast(t('tasks.reopened')); HF.commit(); return; }
    el.setAttribute('data-busy', '1'); el.classList.add('popping'); floatPlus(el);
    var r = HF.completeTask(id);
    setTimeout(function () {
      HF.toast(t('msg.p' + (1 + Math.floor(Math.random() * 6))) + ' ' + '🎉', { action: { label: t('c.undo'), fn: function () { HF.undoComplete(r); } } });
      HF.commit(); if (HF.checkAch) HF.checkAch();
    }, 340);
  };
  HF.act['task.edit'] = function (el) { HF.taskForm(el.getAttribute('data-id')); };
  HF.act['task.new'] = function () { HF.taskForm(null); };
  HF.act['task.suggest'] = function () { suggestions(); };
  HF.act['task.rotate'] = function () { rotateAll(); };
  HF.act['task.routineNew'] = function () { routineForm(); };
  HF.act['task.routineDel'] = function (el) {
    var name = el.getAttribute('data-name'), list = HF.state.tasks.filter(function (x) { return x.routine === name; });
    HF.confirm({ title: t('c.delete'), text: t('tasks.routine.delete', { name: name, n: list.length }), ok: t('c.delete'), danger: true }).then(function (y) {
      if (!y) return; HF.state.tasks = HF.state.tasks.filter(function (x) { return x.routine !== name; }); HF.commit();
    });
  };
  HF.act['task.tab'] = function (el) { HF.ui.tasks.tab = el.getAttribute('data-tab'); HF.refresh(); };
  HF.chg['task.filter'] = function (el) { HF.ui.tasks[el.getAttribute('data-k')] = el.value; HF.refresh(); };
  HF.act['task.tpl'] = function () { HF.go('templates'); };

  function rotateAll() {
    var S = HF.state;
    if (S.members.length < 2) { HF.toast(t('tasks.rotate.need')); return; }
    var open = S.tasks.filter(function (x) { return !x.done && x.assignee; });
    if (!open.length) { HF.toast(t('tasks.rotate.none')); return; }
    var prev = open.map(function (x) { return [x.id, x.assignee]; });
    open.forEach(function (x) { x.assignee = nextMember(x.assignee); });
    HF.toast(t('tasks.rotated'), { action: { label: t('c.undo'), fn: function () { prev.forEach(function (p) { var k = S.tasks.filter(function (x) { return x.id === p[0]; })[0]; if (k) k.assignee = p[1]; }); HF.commit(); } } });
    HF.commit();
  }
  function suggestions() {
    var src = HF.BUILTIN_TEMPLATES.filter(function (x) { return x.kind === 'tasks' && x.freq !== 'none'; }), li = { es: 0, en: 1, pt: 2 }[HF.lang()], chips = '';
    src.forEach(function (tp) { tp.items.forEach(function (i, k) { chips += '<button type="button" class="chip btn-chip" data-act="task.addSuggest" data-tpl="' + tp.id + '" data-i="' + k + '">' + HF.catOf(HF.TASK_CATS, tp.cat).icon + ' ' + esc(i[li]) + '</button>'; }); });
    HF.modal({ title: t('tasks.suggest.title'), body: '<p class="muted">' + esc(t('tasks.suggest.text')) + '</p><div class="chips-wrap">' + chips + '</div>', foot: '<button type="button" class="btn primary" data-mclose>' + esc(t('c.close')) + '</button>' });
  }
  HF.act['task.addSuggest'] = function (el) {
    var tp = HF.BUILTIN_TEMPLATES.filter(function (x) { return x.id === el.getAttribute('data-tpl'); })[0], li = { es: 0, en: 1, pt: 2 }[HF.lang()];
    var title = tp.items[+el.getAttribute('data-i')][li];
    HF.state.tasks.push({ id: HF.uid(), title: title, cat: tp.cat, due: HF.today(), recur: 'none', assignee: '', prio: 'mid', rotate: false, done: false, notes: '' });
    HF.toast(t('tasks.suggest.added', { title: title })); el.classList.add('chosen'); HF.commit();
  };

  function memberOptions(withNone) {
    return [{ value: '', label: t('c.unassigned') }].concat(HF.state.members.map(function (m) { return { value: m.id, label: m.avatar + ' ' + m.name }; }));
  }
  HF.taskForm = function (id, preset) {
    var S = HF.state, x = id ? S.tasks.filter(function (k) { return k.id === id; })[0] : null;
    var v = x ? HF.clone(x) : Object.assign({ cat: 'clean', due: HF.today(), recur: 'none', prio: 'mid', assignee: '', rotate: false }, preset || {});
    var fields = [
      { name: 'title', label: t('tasks.f.title'), required: true, full: true, autofocus: true },
      { name: 'cat', label: t('c.category'), type: 'select', options: HF.TASK_CATS.map(function (c) { return { value: c.id, label: c.icon + ' ' + catLabel(c.id) }; }) },
      { name: 'due', label: t('tasks.f.due'), type: 'date' },
      { name: 'recur', label: t('tasks.f.recur'), type: 'select', options: ['none', 'daily', 'weekly', 'monthly', 'days'].map(function (r) { return { value: r, label: t('freq.' + r) }; } ) },
      { name: 'days', label: t('tasks.f.days'), type: 'weekdays', hint: t('tasks.f.days.hint') },
      { name: 'prio', label: t('prio.label'), type: 'select', options: ['high', 'mid', 'low'].map(function (p) { return { value: p, label: t('prio.' + p) }; }) },
      { name: 'assignee', label: t('tasks.f.assignee'), type: 'select', options: memberOptions(), full: true }
    ];
    if (S.members.length > 1) fields.push({ name: 'rotate', label: t('tasks.f.rotate'), type: 'checkbox' });
    fields.push({ name: 'notes', label: t('c.notes'), type: 'textarea', rows: 2 });
    HF.openForm({
      title: x ? t('tasks.edit') : t('tasks.add'), values: v, fields: fields,
      onOpen: function (ctl, form) { bindDays(form); },
      onSubmit: function (val) {
        if (val.recur === 'days') {
          if (!val.days.length) { HF.toast(t('tasks.f.days.need')); return false; }
          if (HF.validDate(val.due)) val.due = HF.nextWeekday(val.due, val.days);
        } else delete val.days;
        var saved;
        if (x) { Object.assign(x, val); x.demo = false; saved = x; }
        else { saved = Object.assign({ id: HF.uid(), done: false }, val); S.tasks.push(saved); }
        revealTask(saved);
        HF.commit();
      },
      onDelete: x ? function () { S.tasks = S.tasks.filter(function (k) { return k.id !== x.id; }); HF.commit(); } : null
    });
  };
  /* After saving, make sure the task is visible: switch to the tab/filters that show it and say when it is due. */
  function revealTask(tk) {
    var U = HF.ui.tasks, td = HF.today(), we = HF.addDays(HF.weekStart(td), 6);
    var tab = (tk.due && tk.due <= td) ? 'today' : (tk.due && tk.due <= we) ? 'week' : 'all';
    var shown = U.tab === 'all' || (U.tab === 'week' && tk.due && tk.due <= we) || (U.tab === 'today' && tk.due && tk.due <= td);
    if (!shown) U.tab = tab;
    if (U.cat && U.cat !== tk.cat) U.cat = '';
    if (U.who && U.who !== tk.assignee) U.who = '';
    HF.toast(t('tasks.saved.for', { d: tk.due ? HF.relDay(tk.due) : '' }).replace(/ · $/, ''));
  }
  function bindDays(form) {
    var sel = form.querySelector('select[name=recur],select[name=freq]'), box = form.querySelector('[data-wd-box]');
    if (!sel || !box) return;
    var upd = function () { box.hidden = sel.value !== 'days'; }; sel.addEventListener('change', upd); upd();
  }
  function routineForm() {
    HF.openForm({
      title: t('tasks.routine.new'), values: { freq: 'daily', cat: 'clean', days: [] },
      onOpen: function (ctl, form) { bindDays(form); },
      fields: [
        { name: 'name', label: t('tasks.routine.name'), required: true, full: true, autofocus: true },
        { name: 'freq', label: t('tasks.f.recur'), type: 'select', options: ['daily', 'weekly', 'monthly', 'days'].map(function (r) { return { value: r, label: t('freq.' + r) }; }) },
        { name: 'days', label: t('tasks.f.days'), type: 'weekdays', hint: t('tasks.f.days.hint') },
        { name: 'cat', label: t('c.category'), type: 'select', options: HF.TASK_CATS.map(function (c) { return { value: c.id, label: c.icon + ' ' + catLabel(c.id) }; }) },
        { name: 'assignee', label: t('tasks.f.assignee'), type: 'select', options: memberOptions(), full: true },
        { name: 'lines', label: t('tasks.routine.lines'), type: 'textarea', rows: 5, required: true, hint: t('tasks.routine.hint') }
      ],
      onSubmit: function (v) {
        if (v.freq === 'days' && !v.days.length) { HF.toast(t('tasks.f.days.need')); return false; }
        var firstDue = v.freq === 'days' ? HF.nextWeekday(HF.today(), v.days) : HF.today();
        var lines = v.lines.split('\n').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 40);
        lines.forEach(function (l) { HF.state.tasks.push({ id: HF.uid(), title: l.slice(0, 120), cat: v.cat, due: firstDue, recur: v.freq, days: v.freq === 'days' ? v.days.slice() : undefined, assignee: v.assignee, prio: 'mid', rotate: false, done: false, notes: '', routine: v.name }); });
        HF.toast(t('tasks.routine.created', { n: lines.length })); HF.ui.tasks.tab = 'routines'; HF.commit();
      }
    });
  }

  /* ----- view ----- */
  HF.views.tasks = {
    render: function (root) {
      var S = HF.state, U = HF.ui.tasks, td = HF.today(), we = HF.addDays(HF.weekStart(td), 6);
      var ts = HF.todayStats(), wk = HF.weekStats();
      var open = S.tasks.filter(function (x) { return !x.done; });
      var list;
      if (U.tab === 'today') list = open.filter(function (x) { return x.due && x.due <= td; });
      else if (U.tab === 'week') list = open.filter(function (x) { return x.due && x.due <= we; });
      else if (U.tab === 'all') list = open;
      else if (U.tab === 'done') list = doneRows();
      else list = [];
      if (U.cat && U.tab !== 'done') list = list.filter(function (x) { return x.cat === U.cat; });
      if (U.who && U.tab !== 'done') list = list.filter(function (x) { return x.assignee === U.who; });
      if (U.tab !== 'done') sortTasks(list);

      var tabs = ['today', 'week', 'all', 'done', 'routines'].map(function (k) {
        return '<button type="button" role="tab" class="tab' + (U.tab === k ? ' on' : '') + '" aria-selected="' + (U.tab === k) + '" data-act="task.tab" data-tab="' + k + '">' + esc(t('tasks.tab.' + k)) + '</button>';
      }).join('');
      var filters = U.tab === 'routines' ? '' : '<div class="filters"><label class="sel"><span class="sr">' + esc(t('tasks.filter.cat')) + '</span><select data-chg="task.filter" data-k="cat" aria-label="' + esc(t('tasks.filter.cat')) + '"><option value="">' + esc(t('tasks.filter.cat') + ': ' + t('c.all')) + '</option>' +
        HF.TASK_CATS.map(function (c) { return '<option value="' + c.id + '"' + (U.cat === c.id ? ' selected' : '') + '>' + c.icon + ' ' + esc(catLabel(c.id)) + '</option>'; }).join('') + '</select></label>' +
        (S.members.length > 1 ? '<label class="sel"><span class="sr">' + esc(t('tasks.filter.who')) + '</span><select data-chg="task.filter" data-k="who" aria-label="' + esc(t('tasks.filter.who')) + '"><option value="">' + esc(t('tasks.filter.who') + ': ' + t('c.everyone')) + '</option>' +
          S.members.map(function (m) { return '<option value="' + m.id + '"' + (U.who === m.id ? ' selected' : '') + '>' + esc(m.avatar + ' ' + m.name) + '</option>'; }).join('') + '</select></label>' : '') + '</div>';

      var body;
      if (U.tab === 'routines') {
        var rec = open.filter(function (x) { return x.recur && x.recur !== 'none'; });
        if (!rec.length) body = HF.empty({ illo: 'pot', title: t('tasks.routine.empty'), actions: '<button type="button" class="btn primary" data-act="task.routineNew">' + HF.icon('plus', 16) + ' ' + esc(t('tasks.routine.new')) + '</button><button type="button" class="btn" data-act="task.tpl">' + esc(t('tasks.routine.fromTpl')) + '</button>' });
        else {
          var groups = {}, order = [];
          rec.forEach(function (x) { var k = x.routine || ''; if (!groups[k]) { groups[k] = []; order.push(k); } groups[k].push(x); });
          body = order.map(function (k) {
            var g = groups[k]; sortTasks(g);
            var fr = g[0].recur;
            return '<section class="card"><div class="card-h"><h3>' + esc(k || t('tasks.routine.single')) + '</h3><span class="chip">' + HF.icon('repeat', 13) + ' ' + esc(HF.recurLabel(g[0])) + '</span><span class="muted sm">' + esc(t('tasks.routine.count', { n: g.length })) + '</span>' +
              (k ? '<button type="button" class="icon-btn" data-act="task.routineDel" data-name="' + esc(k) + '" aria-label="' + esc(t('c.delete') + ' ' + k) + '">' + HF.icon('trash', 18) + '</button>' : '') + '</div><ul class="tasklist">' + g.map(function (x) { return HF.taskRow(x); }).join('') + '</ul></section>';
          }).join('') + '<p><button type="button" class="btn" data-act="task.routineNew">' + HF.icon('plus', 16) + ' ' + esc(t('tasks.routine.new')) + '</button> <button type="button" class="btn ghost" data-act="task.tpl">' + esc(t('tasks.routine.fromTpl')) + '</button></p>';
        }
      } else if (U.tab === 'done') {
        body = list.length ? '<ul class="tasklist card">' + list.map(doneRowHtml).join('') + '</ul>' : HF.empty({ illo: 'list', title: t('tasks.done.empty') });
      } else if (!list.length) {
        body = HF.empty({ illo: 'list', title: (U.cat || U.who) ? t('tasks.noneFilter') : t('tasks.empty.title'), text: (U.cat || U.who) ? '' : t('tasks.empty.text'), actions: '<button type="button" class="btn primary" data-act="task.new">' + HF.icon('plus', 16) + ' ' + esc(t('tasks.add')) + '</button><button type="button" class="btn" data-act="task.suggest">' + HF.icon('sparkle', 16) + ' ' + esc(t('tasks.suggest')) + '</button>' });
      } else body = '<ul class="tasklist card">' + list.map(function (x) { return HF.taskRow(x); }).join('') + '</ul>';

      root.innerHTML = '<div class="page-h"><h1>' + esc(t('tasks.title')) + '</h1><div class="page-actions"><button type="button" class="btn ghost" data-act="task.suggest">' + HF.icon('sparkle', 16) + ' <span class="hide-sm">' + esc(t('tasks.suggest')) + '</span></button>' +
        '<button type="button" class="btn ghost" data-act="task.rotate">' + HF.icon('shuffle', 16) + ' <span class="hide-sm">' + esc(t('tasks.rotate')) + '</span></button><button type="button" class="btn primary" data-act="task.new">' + HF.icon('plus', 16) + ' ' + esc(t('tasks.add')) + '</button></div></div>' +
        '<section class="card summary"><div>' + HF.ring(ts.pct, ts.pct + '%', '', 96) + '</div><div class="grow"><h3>' + esc(ts.total ? t('tasks.today.of', { done: ts.done, total: ts.total }) : t('tasks.today.none')) + '</h3>' +
        '<p class="muted sm">' + esc(t('tasks.week.prog')) + ' · ' + esc(t('tasks.week.of', { done: wk.done, total: wk.total })) + (HF.streak() > 1 ? ' · 🔥 ' + esc(t('tasks.streak', { n: HF.streak() })) : '') + '</p>' + HF.bar(wk.pct, 'accent', t('tasks.week.prog')) + '</div></section>' +
        '<div class="tabs" role="tablist">' + tabs + '</div>' + filters + body;
    }
  };
})();
