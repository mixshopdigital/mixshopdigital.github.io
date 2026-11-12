/* HomeFlow 360 — Documents & in-app reminders */
(function () {
  'use strict';
  var HF = window.HF, t = HF.t, esc = HF.esc;

  HF.addDict({
    'docs.title': ['Documentos y recordatorios', 'Documents & reminders', 'Documentos e lembretes'],
    'docs.type.service': ['Servicio / factura', 'Utility / bill', 'Serviço / fatura'], 'docs.type.insurance': ['Seguro', 'Insurance', 'Seguro'], 'docs.type.warranty': ['Garantía', 'Warranty', 'Garantia'],
    'docs.type.document': ['Documento', 'Document', 'Documento'], 'docs.type.renewal': ['Renovación', 'Renewal', 'Renovação'], 'docs.type.subscription': ['Suscripción', 'Subscription', 'Assinatura'], 'docs.type.reminder': ['Recordatorio', 'Reminder', 'Lembrete'],
    'docs.rep.none': ['No se repite', 'Does not repeat', 'Não se repete'], 'docs.rep.weekly': ['Cada semana', 'Weekly', 'Toda semana'], 'docs.rep.monthly': ['Cada mes', 'Monthly', 'Todo mês'], 'docs.rep.yearly': ['Cada año', 'Yearly', 'Todo ano'],
    'docs.add': ['Nuevo recordatorio', 'New reminder', 'Novo lembrete'], 'docs.edit': ['Editar recordatorio', 'Edit reminder', 'Editar lembrete'],
    'docs.f.title': ['Título', 'Title', 'Título'], 'docs.f.due': ['Vence el', 'Due date', 'Vence em'], 'docs.f.repeat': ['Repetición', 'Repeats', 'Repetição'], 'docs.f.amount': ['Monto (opcional)', 'Amount (optional)', 'Valor (opcional)'],
    'docs.f.notes': ['Notas (no escribas números de documentos ni claves)', 'Notes (do not enter ID numbers or passwords)', 'Notas (não digite números de documentos nem senhas)'],
    'docs.sec.overdue': ['Vencidos', 'Overdue', 'Vencidos'], 'docs.sec.soon': ['Próximos 30 días', 'Next 30 days', 'Próximos 30 dias'], 'docs.sec.later': ['Más adelante', 'Later', 'Mais adiante'], 'docs.sec.nodate': ['Sin fecha', 'No date', 'Sem data'], 'docs.sec.archived': ['Archivados', 'Archived', 'Arquivados'],
    'docs.paid': ['Marcar como pagado / renovado', 'Mark paid / renewed', 'Marcar como pago / renovado'], 'docs.paid.short': ['Listo', 'Done', 'Feito'],
    'docs.paid.toast': ['Listo: {n}', 'Done: {n}', 'Pronto: {n}'], 'docs.paid.next': ['Próximo vencimiento: {d}', 'Next due: {d}', 'Próximo vencimento: {d}'], 'docs.paid.arch': ['Archivado', 'Archived', 'Arquivado'],
    'docs.paid.exp': ['Registrar también como gasto', 'Also record as an expense', 'Registrar também como despesa'],
    'docs.empty': ['Sin recordatorios', 'No reminders', 'Sem lembretes'], 'docs.empty.t': ['Guarda vencimientos de facturas, seguros, garantías y suscripciones. Los avisos aparecen dentro de la app.', 'Keep due dates for bills, insurance, warranties and subscriptions. Alerts show up inside the app.', 'Guarde vencimentos de faturas, seguros, garantias e assinaturas. Os avisos aparecem dentro do app.'],
    'docs.inapp': ['Los avisos se muestran dentro de la app al abrirla; no se envían notificaciones del sistema.', 'Alerts appear inside the app when you open it; no system notifications are sent.', 'Os avisos aparecem dentro do app ao abri-lo; não são enviadas notificações do sistema.'],
    'docs.unarchive': ['Reactivar', 'Reactivate', 'Reativar']
  });
  HF.ui.docs = { showArch: false };
  var REP = ['none', 'weekly', 'monthly', 'yearly'];
  function nextDue(d, rep) {
    if (rep === 'weekly') return HF.addDays(d, 7);
    if (rep === 'monthly') return HF.addMonths(d, 1);
    if (rep === 'yearly') return HF.addMonths(d, 12);
    return null;
  }
  function doc(id) { return HF.state.docs.filter(function (x) { return x.id === id; })[0]; }

  HF.docForm = function (id) {
    var S = HF.state, x = id ? doc(id) : null;
    HF.openForm({
      title: x ? t('docs.edit') : t('docs.add'),
      values: x ? { title: x.title, type: x.type, due: x.due, repeat: x.repeat, amount: x.amount == null ? '' : x.amount, notes: x.notes } : { type: 'service', repeat: 'none', due: HF.addDays(HF.today(), 7) },
      fields: [
        { name: 'title', label: t('docs.f.title'), required: true, full: true, autofocus: true },
        { name: 'type', label: t('c.category'), type: 'select', options: HF.DOC_TYPES.map(function (c) { return { value: c.id, label: c.icon + ' ' + t('docs.type.' + c.id) }; }) },
        { name: 'due', label: t('docs.f.due'), type: 'date' },
        { name: 'repeat', label: t('docs.f.repeat'), type: 'select', options: REP.map(function (r) { return { value: r, label: t('docs.rep.' + r) }; }) },
        { name: 'amount', label: t('docs.f.amount') + ' (' + S.settings.currency + ')', type: 'number', min: 0 },
        { name: 'notes', label: t('docs.f.notes'), type: 'textarea', rows: 2 }
      ],
      onSubmit: function (v) {
        var rec = { title: v.title, type: v.type, due: HF.validDate(v.due) ? v.due : '', repeat: v.due ? v.repeat : 'none', amount: v.amount == null ? null : Math.max(0, v.amount), notes: v.notes || '' };
        if (x) { Object.keys(rec).forEach(function (k) { x[k] = rec[k]; }); delete x.demo; } else { rec.id = HF.uid(); rec.archived = false; S.docs.push(rec); }
        HF.commit();
      },
      onDelete: x ? function () { S.docs = S.docs.filter(function (y) { return y.id !== id; }); HF.commit(); } : null
    });
  };

  HF.act['doc.new'] = function () { HF.docForm(null); };
  HF.act['doc.edit'] = function (el) { HF.docForm(el.getAttribute('data-id')); };
  HF.act['doc.toggleArch'] = function () { HF.ui.docs.showArch = !HF.ui.docs.showArch; HF.refresh(); };
  HF.act['doc.unarch'] = function (el) { var x = doc(el.getAttribute('data-id')); if (x) { x.archived = false; HF.commit(); } };
  HF.act['doc.paid'] = function (el) {
    var S = HF.state, x = doc(el.getAttribute('data-id')); if (!x) return;
    var nx = x.due ? nextDue(x.due < HF.today() ? x.due : x.due, x.repeat) : null;
    var finalize = function (rec) {
      if (rec && x.amount > 0) S.fin.tx.push({ id: HF.uid(), type: 'expense', cat: x.type === 'service' || x.type === 'subscription' ? 'services' : 'other', amount: x.amount, date: HF.today(), note: x.title });
      var msg;
      if (nx) { while (nx < HF.today()) nx = nextDue(nx, x.repeat); x.due = nx; msg = t('docs.paid.next', { d: HF.fmtDate(nx, { day: 'numeric', month: 'long' }) }); }
      else { x.archived = true; msg = t('docs.paid.arch'); }
      HF.toast(t('docs.paid.toast', { n: x.title }) + ' · ' + msg); HF.commit();
    };
    if (x.amount > 0) {
      HF.confirm({ title: t('docs.paid'), text: x.title + ' · ' + HF.money(x.amount), ok: t('docs.paid.exp'), cancel: t('docs.paid.short') }).then(function (y) { finalize(y); });
    } else finalize(false);
  };

  function row(x, cur) {
    var c = HF.catOf(HF.DOC_TYPES, x.type);
    return '<li class="drow"><span class="drow-i" aria-hidden="true">' + c.icon + '</span><button type="button" class="drow-m" data-act="doc.edit" data-id="' + x.id + '"><b>' + esc(x.title) + (x.demo ? ' ' + esc('·') + ' ' + esc(t('c.demo')) : '') + '</b><small class="muted">' + esc(t('docs.type.' + c.id)) + (x.amount != null && x.amount !== '' ? ' · ' + esc(HF.money(x.amount, cur)) : '') + (x.repeat && x.repeat !== 'none' ? ' · ' + esc(t('docs.rep.' + x.repeat)) : '') + '</small></button><span class="drow-d">' + (x.due ? HF.dueChip(x.due) : '') + '</span>' +
      (x.archived ? '<button type="button" class="btn sm ghost" data-act="doc.unarch" data-id="' + x.id + '">' + esc(t('docs.unarchive')) + '</button>' : '<button type="button" class="btn sm" data-act="doc.paid" data-id="' + x.id + '" title="' + esc(t('docs.paid')) + '" aria-label="' + esc(t('docs.paid') + ': ' + x.title) + '">' + HF.icon('check', 16) + ' ' + esc(t('docs.paid.short')) + '</button>') + '</li>';
  }

  HF.views.docs = {
    render: function (root) {
      var S = HF.state, cur = S.settings.currency, td = HF.today(), act = S.docs.filter(function (x) { return !x.archived; }), arch = S.docs.filter(function (x) { return x.archived; });
      var by = function (a, b) { return (a.due || '9') < (b.due || '9') ? -1 : 1; };
      var secs = [
        ['overdue', act.filter(function (x) { return x.due && x.due < td; })],
        ['soon', act.filter(function (x) { return x.due && x.due >= td && HF.diffDays(x.due, td) <= 30; })],
        ['later', act.filter(function (x) { return x.due && HF.diffDays(x.due, td) > 30; })],
        ['nodate', act.filter(function (x) { return !x.due; })]
      ];
      var body = act.length || arch.length ? secs.map(function (s) {
        return s[1].length ? '<section class="dsec ' + s[0] + '"><h3>' + esc(t('docs.sec.' + s[0])) + ' <small>' + s[1].length + '</small></h3><ul class="dlist">' + s[1].sort(by).map(function (x) { return row(x, cur); }).join('') + '</ul></section>' : '';
      }).join('') : HF.empty({ illo: 'list', title: t('docs.empty'), text: t('docs.empty.t'), actions: '<button type="button" class="btn primary" data-act="doc.new">' + HF.icon('plus', 16) + ' ' + esc(t('docs.add')) + '</button>' });
      if (arch.length) body += '<button type="button" class="btn ghost" data-act="doc.toggleArch" aria-expanded="' + HF.ui.docs.showArch + '">' + esc(t('docs.sec.archived')) + ' (' + arch.length + ')</button>' + (HF.ui.docs.showArch ? '<ul class="dlist">' + arch.map(function (x) { return row(x, cur); }).join('') + '</ul>' : '');
      root.innerHTML = '<div class="page-h"><h1>' + esc(t('docs.title')) + '</h1><button type="button" class="btn primary" data-act="doc.new">' + HF.icon('plus', 16) + ' ' + esc(t('docs.add')) + '</button></div>' + body + '<p class="muted sm note">' + HF.icon('info', 14) + ' ' + esc(t('docs.inapp')) + '</p>';
    }
  };
})();
