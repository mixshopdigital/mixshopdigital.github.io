/* HomeFlow 360 — Home maintenance & deep cleaning */
(function () {
  'use strict';
  var HF = window.HF, t = HF.t, esc = HF.esc;

  HF.addDict({
    'maint.title': ['Mantenimiento y limpieza', 'Maintenance & cleaning', 'Manutenção e limpeza'],
    'maint.add': ['Nueva tarea periódica', 'New recurring job', 'Nova tarefa periódica'], 'maint.edit': ['Editar tarea periódica', 'Edit recurring job', 'Editar tarefa periódica'],
    'maint.presets': ['Agregar sugeridas', 'Add suggested', 'Adicionar sugeridas'], 'maint.presets.title': ['Tareas sugeridas', 'Suggested jobs', 'Tarefas sugeridas'],
    'maint.presets.text': ['Toca las que quieras llevar en tu hogar.', 'Tap the ones you want for your home.', 'Toque nas que deseja para sua casa.'], 'maint.presets.added': ['Agregada: {n}', 'Added: {n}', 'Adicionada: {n}'], 'maint.presets.have': ['Ya la tienes', 'Already added', 'Já adicionada'],
    'maint.f.name': ['Nombre', 'Name', 'Nome'], 'maint.f.freq': ['Cada cuántos días', 'Every how many days', 'A cada quantos dias'], 'maint.f.last': ['Última vez que se hizo', 'Last time done', 'Última vez feito'], 'maint.f.notes': ['Notas', 'Notes', 'Notas'],
    'maint.status.overdue': ['Atrasada', 'Overdue', 'Atrasada'], 'maint.status.soon': ['Próxima', 'Coming up', 'Próxima'], 'maint.status.ok': ['Al día', 'Up to date', 'Em dia'],
    'maint.every': ['Cada {n} días', 'Every {n} days', 'A cada {n} dias'], 'maint.next': ['Próxima: {d}', 'Next: {d}', 'Próxima: {d}'], 'maint.last': ['Última: {d}', 'Last: {d}', 'Última: {d}'],
    'maint.done': ['Hecho hoy', 'Done today', 'Feito hoje'], 'maint.done.toast': ['Registrado: {n}', 'Logged: {n}', 'Registrado: {n}'],
    'maint.empty': ['Aún no hay tareas periódicas', 'No recurring jobs yet', 'Ainda não há tarefas periódicas'],
    'maint.empty.t': ['Agrega las sugeridas o crea las tuyas y la app te avisa cuándo toca cada una.', 'Add the suggested ones or create your own and the app tells you when each is due.', 'Adicione as sugeridas ou crie as suas e o app avisa quando cada uma vence.'],
    'maint.history': ['Historial', 'History', 'Histórico'], 'maint.never': ['Sin registrar', 'Not logged yet', 'Sem registro'],
    'maint.sum': ['{a} atrasadas · {b} próximas · {c} al día', '{a} overdue · {b} coming up · {c} up to date', '{a} atrasadas · {b} próximas · {c} em dia']
  });

  HF.act['maint.new'] = function () { HF.maintForm(null); };
  HF.act['maint.open'] = function (el) { HF.maintForm(el.getAttribute('data-id')); };
  HF.act['maint.done'] = function (el) {
    var m = HF.state.maint.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!m) return;
    m.lastDone = HF.today(); m.history = (m.history || []); m.history.unshift(HF.today()); m.history = m.history.slice(0, 20);
    HF.toast(t('maint.done.toast', { n: m.name })); HF.commit(); if (HF.checkAch) HF.checkAch();
  };
  HF.act['maint.presets'] = function () {
    var S = HF.state;
    var ctl = HF.modal({ title: t('maint.presets.title'), body: '<p class="muted">' + esc(t('maint.presets.text')) + '</p><ul class="preset-list" id="preset-list"></ul>' });
    function draw() {
      ctl.el.querySelector('#preset-list').innerHTML = HF.MAINT_PRESETS.map(function (p) {
        var name = HF.L(p.n), has = S.maint.some(function (m) { return m.name === name; });
        return '<li><button type="button" class="btn ' + (has ? 'ghost' : '') + '" data-k="' + p.k + '"' + (has ? ' disabled' : '') + '>' + p.icon + ' ' + esc(name) + ' <small class="muted">· ' + esc(t('maint.every', { n: p.freq })) + (has ? ' · ' + esc(t('maint.presets.have')) : '') + '</small></button></li>';
      }).join('');
    }
    draw();
    ctl.el.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-k]') : null; if (!b) return;
      var p = HF.MAINT_PRESETS.filter(function (x) { return x.k === b.getAttribute('data-k'); })[0]; if (!p) return;
      S.maint.push({ id: HF.uid(), name: HF.L(p.n), icon: p.icon, freq: p.freq, lastDone: HF.today(), notes: '', history: [] });
      HF.toast(t('maint.presets.added', { n: HF.L(p.n) })); HF.save(); draw(); HF.refresh();
    });
  };

  HF.maintForm = function (id) {
    var S = HF.state, x = id ? S.maint.filter(function (y) { return y.id === id; })[0] : null;
    HF.openForm({
      title: x ? t('maint.edit') : t('maint.add'),
      values: x ? { name: x.name, freq: x.freq, lastDone: x.lastDone, notes: x.notes } : { freq: 30, lastDone: HF.today() },
      fields: [
        { name: 'name', label: t('maint.f.name'), required: true, full: true, autofocus: true },
        { name: 'freq', label: t('maint.f.freq'), type: 'number', min: 1, required: true },
        { name: 'lastDone', label: t('maint.f.last'), type: 'date' },
        { name: 'notes', label: t('maint.f.notes'), type: 'textarea', rows: 2 }
      ],
      onSubmit: function (v) {
        var rec = { name: v.name, freq: Math.max(1, Math.min(3650, Math.round(v.freq) || 30)), lastDone: HF.validDate(v.lastDone) ? v.lastDone : '', notes: v.notes || '' };
        if (x) { Object.keys(rec).forEach(function (k) { x[k] = rec[k]; }); delete x.demo; }
        else { rec.id = HF.uid(); rec.icon = '🧽'; rec.history = []; S.maint.push(rec); }
        HF.commit();
      },
      onDelete: x ? function () { S.maint = S.maint.filter(function (y) { return y.id !== id; }); HF.commit(); } : null
    });
  };

  HF.views.maintenance = {
    render: function (root) {
      var S = HF.state, list = S.maint.slice().sort(function (a, b) { return HF.maintNext(a) < HF.maintNext(b) ? -1 : 1; });
      var cnt = { overdue: 0, soon: 0, ok: 0 }; list.forEach(function (m) { cnt[HF.maintStatus(m)]++; });
      var body = list.length ? '<p class="muted">' + esc(t('maint.sum', { a: cnt.overdue, b: cnt.soon, c: cnt.ok })) + '</p><div class="cards">' + list.map(function (m) {
        var st = HF.maintStatus(m), nx = HF.maintNext(m), cls = st === 'overdue' ? 'bad' : st === 'soon' ? 'warn' : 'ok';
        return '<article class="card mcard ' + cls + '"><div class="mcard-h"><span class="mico" aria-hidden="true">' + (m.icon || '🧽') + '</span><div><h3>' + esc(m.name) + (m.demo ? ' ' + HF.chip(t('c.demo'), 'demo') : '') + '</h3><span class="muted sm">' + esc(t('maint.every', { n: m.freq })) + '</span></div>' + HF.chip(t('maint.status.' + st), cls) + '</div><p class="sm">' + esc(t('maint.next', { d: HF.fmtDate(nx, { day: 'numeric', month: 'long' }) })) + ' · <span class="muted">' + esc(m.lastDone ? t('maint.last', { d: HF.fmtDate(m.lastDone) }) : t('maint.never')) + '</span></p>' +
          '<div class="btn-row"><button type="button" class="btn sm primary" data-act="maint.done" data-id="' + m.id + '">' + HF.icon('check', 16) + ' ' + esc(t('maint.done')) + '</button><button type="button" class="icon-btn" data-act="maint.open" data-id="' + m.id + '" aria-label="' + esc(t('c.edit') + ' ' + m.name) + '">' + HF.icon('edit', 18) + '</button></div></article>';
      }).join('') + '</div>' : HF.empty({ illo: 'plant', title: t('maint.empty'), text: t('maint.empty.t') });
      root.innerHTML = '<div class="page-h"><h1>' + esc(t('maint.title')) + '</h1><div class="btn-row"><button type="button" class="btn" data-act="maint.presets">' + HF.icon('sparkle', 16) + ' ' + esc(t('maint.presets')) + '</button><button type="button" class="btn primary" data-act="maint.new">' + HF.icon('plus', 16) + ' ' + esc(t('maint.add')) + '</button></div></div>' + body;
    }
  };
})();
