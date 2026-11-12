/* HomeFlow 360 — Household finances */
(function () {
  'use strict';
  var HF = window.HF, t = HF.t, esc = HF.esc;

  HF.addDict({
    'money.title': ['Economía del hogar', 'Household finances', 'Economia da casa'],
    'money.tab.overview': ['Resumen', 'Overview', 'Resumo'], 'money.tab.moves': ['Movimientos', 'Transactions', 'Movimentos'], 'money.tab.budgets': ['Presupuestos', 'Budgets', 'Orçamentos'],
    'money.income': ['Ingresos', 'Income', 'Receitas'], 'money.expense': ['Gastos', 'Expenses', 'Despesas'], 'money.balance': ['Saldo del mes', 'Month balance', 'Saldo do mês'],
    'money.fixed': ['Fijos', 'Fixed', 'Fixos'], 'money.variable': ['Variables', 'Variable', 'Variáveis'], 'money.fixedVar': ['Fijos vs. variables', 'Fixed vs. variable', 'Fixos vs. variáveis'],
    'money.byCat': ['Gastos por categoría', 'Spending by category', 'Despesas por categoria'], 'money.budgetVs': ['Presupuesto vs. real', 'Budget vs. actual', 'Orçamento vs. real'],
    'money.add': ['Nuevo movimiento', 'New transaction', 'Novo movimento'], 'money.edit': ['Editar movimiento', 'Edit transaction', 'Editar movimento'],
    'money.f.type': ['Tipo', 'Type', 'Tipo'], 'money.f.note': ['Descripción', 'Description', 'Descrição'], 'money.f.amount': ['Monto', 'Amount', 'Valor'],
    'money.moves.empty': ['Sin movimientos este mes', 'No transactions this month', 'Sem movimentos neste mês'],
    'money.moves.empty.t': ['Registra un ingreso o un gasto para ver cómo se mueve tu mes.', 'Record an income or an expense to see how your month moves.', 'Registre uma receita ou despesa para ver como seu mês se movimenta.'],
    'money.spent': ['{a} de {b}', '{a} of {b}', '{a} de {b}'], 'money.left': ['Quedan {a}', '{a} left', 'Restam {a}'], 'money.over': ['Te pasaste por {a}', 'Over by {a}', 'Passou {a}'],
    'money.alert.warn': ['Cerca del límite', 'Close to the limit', 'Perto do limite'], 'money.alert.bad': ['Superado', 'Over budget', 'Estourado'], 'money.alert.ok': ['En orden', 'On track', 'Em dia'],
    'money.alerts': ['Alertas de presupuesto', 'Budget alerts', 'Alertas de orçamento'], 'money.noBudget': ['Sin presupuesto', 'No budget', 'Sem orçamento'],
    'money.budgets.help': ['Define cuánto quieres gastar al mes en cada categoría. Deja vacío para no limitar.', 'Set how much you want to spend each month per category. Leave empty for no limit.', 'Defina quanto quer gastar por mês em cada categoria. Deixe vazio para não limitar.'],
    'money.budgets.save': ['Guardar presupuestos', 'Save budgets', 'Salvar orçamentos'], 'money.budgets.saved': ['Presupuestos guardados', 'Budgets saved', 'Orçamentos salvos'],
    'money.cat.new': ['Nueva categoría', 'New category', 'Nova categoria'], 'money.cat.edit': ['Editar categoría', 'Edit category', 'Editar categoria'],
    'money.cat.name': ['Nombre', 'Name', 'Nome'], 'money.cat.kind': ['Naturaleza', 'Nature', 'Natureza'], 'money.cat.icon': ['Ícono', 'Icon', 'Ícone'],
    'money.cat.inUse': ['Esta categoría tiene movimientos. Se moverán a "Otros gastos".', 'This category has transactions. They will move to "Other expenses".', 'Esta categoria tem movimentos. Eles irão para "Outras despesas".'],
    'money.cat.manage': ['Categorías', 'Categories', 'Categorias'],
    'money.currencyNote': ['Los montos se guardan tal cual los escribes. Cambiar la moneda solo cambia el símbolo; no convierte valores.', 'Amounts are stored as you type them. Changing the currency only changes the symbol; values are not converted.', 'Os valores são salvos como você digita. Trocar a moeda só muda o símbolo; não converte valores.'],
    'money.type.income': ['Ingreso', 'Income', 'Receita'], 'money.type.expense': ['Gasto', 'Expense', 'Despesa'],
    'money.filter.all': ['Todos', 'All', 'Todos'], 'money.net': ['Neto', 'Net', 'Líquido'],
    'money.nodata': ['Sin gastos para graficar', 'No expenses to chart', 'Sem despesas para o gráfico']
  });
  var ICONS = ['💼', '🏠', '🧾', '💡', '🍎', '🚌', '🎓', '🩺', '🎬', '📦', '🐾', '👶', '🎁', '✈️', '🛠️', '💰'];

  HF.ui.money = { tab: 'overview', month: null, type: '' };
  var U = function () { var u = HF.ui.money; if (!u.month) u.month = HF.today().slice(0, 7); return u; };
  function monthTx(m) { return HF.state.fin.tx.filter(function (x) { return x.date && x.date.slice(0, 7) === m; }); }
  function cats() { return HF.state.fin.cats; }
  function cat(id) { var c = cats().filter(function (x) { return x.id === id; })[0]; return c || cats().filter(function (x) { return x.id === 'other'; })[0] || { id: 'other', icon: '📦', type: 'expense', kind: 'variable', name: '' }; }

  HF.monthStats = function (m) {
    var tx = monthTx(m), inc = 0, exp = 0, fixed = 0, variable = 0, by = {};
    tx.forEach(function (x) {
      var a = Number(x.amount) || 0, c = cat(x.cat);
      if (x.type === 'income') inc += a; else { exp += a; by[c.id] = (by[c.id] || 0) + a; if (c.kind === 'fixed') fixed += a; else variable += a; }
    });
    return { income: inc, expense: exp, balance: inc - exp, fixed: fixed, variable: variable, by: by };
  };
  HF.budgetAlerts = function (m) {
    var S = HF.state, st = HF.monthStats(m || HF.today().slice(0, 7)), out = [];
    Object.keys(S.fin.budgets).forEach(function (id) {
      var b = Number(S.fin.budgets[id]); if (!(b > 0)) return;
      var c = S.fin.cats.filter(function (x) { return x.id === id; })[0]; if (!c || c.type !== 'expense') return;
      var spent = st.by[id] || 0, pct = spent / b * 100;
      if (pct >= 80) out.push({ cat: c, spent: spent, budget: b, pct: pct, level: pct > 100 ? 'bad' : 'warn' });
    });
    return out.sort(function (a, b) { return b.pct - a.pct; });
  };

  HF.act['money.tab'] = function (el) { U().tab = el.getAttribute('data-tab'); HF.refresh(); };
  HF.act['money.nav'] = function (el) {
    var u = U(), d = +el.getAttribute('data-dir');
    u.month = d === 0 ? HF.today().slice(0, 7) : HF.addMonths(u.month + '-01', d).slice(0, 7); HF.refresh();
  };
  HF.act['money.new'] = function (el) { txForm(null, el && el.getAttribute('data-type')); };
  HF.act['money.edit'] = function (el) { txForm(el.getAttribute('data-id')); };
  HF.act['money.catNew'] = function () { catForm(null); };
  HF.act['money.catEdit'] = function (el) { catForm(el.getAttribute('data-id')); };
  HF.chg['money.type'] = function (el) { U().type = el.value; HF.refresh(); };
  HF.act['money.saveBudgets'] = function () {
    var S = HF.state;
    HF.$$('[data-budget]').forEach(function (i) {
      var v = String(i.value).replace(',', '.').trim(), id = i.getAttribute('data-budget'), n = parseFloat(v);
      if (v === '' || !(n > 0)) delete S.fin.budgets[id]; else S.fin.budgets[id] = n;
    });
    if (S.settings.demoBudgets) S.settings.demoBudgets = false;
    HF.toast(t('money.budgets.saved')); HF.commit();
  };

  function txForm(id, forceType) {
    var S = HF.state, x = id ? S.fin.tx.filter(function (y) { return y.id === id; })[0] : null;
    var type = x ? x.type : (forceType || 'expense');
    var v = x ? { type: x.type, cat: x.cat, amount: x.amount, date: x.date, note: x.note || '' } : { type: type, cat: type === 'income' ? 'income' : 'food', amount: '', date: (U().month === HF.today().slice(0, 7) ? HF.today() : U().month + '-01'), note: '' };
    var opts = function (tp) { return cats().filter(function (c) { return c.type === tp; }).map(function (c) { return { value: c.id, label: c.icon + ' ' + HF.finCatName(c) }; }); };
    HF.openForm({
      title: x ? t('money.edit') : t('money.add'), values: v,
      fields: [
        { name: 'type', label: t('money.f.type'), type: 'choice', options: [{ value: 'expense', label: t('money.type.expense') }, { value: 'income', label: t('money.type.income') }] },
        { name: 'cat', label: t('c.category'), type: 'select', full: true, options: opts('expense').concat([]) },
        { name: 'amount', label: t('money.f.amount') + ' (' + S.settings.currency + ')', type: 'number', min: 0, required: true },
        { name: 'date', label: t('c.date'), type: 'date', required: true },
        { name: 'note', label: t('money.f.note'), full: true, maxlength: 100 }
      ],
      onOpen: function (ctl, form) {
        var sel = form.querySelector('select[name=cat]');
        function fill() {
          var tp = (form.querySelector('input[name=type]:checked') || {}).value || 'expense', cur = sel.value, list = opts(tp);
          sel.innerHTML = list.map(function (o) { return '<option value="' + esc(o.value) + '">' + esc(o.label) + '</option>'; }).join('');
          sel.value = list.some(function (o) { return o.value === (v.cat || cur); }) && tp === v.type ? v.cat : (list[0] ? list[0].value : '');
        }
        HF.$$('input[name=type]', form).forEach(function (r) { r.addEventListener('change', fill); });
        sel.innerHTML = opts(v.type).map(function (o) { return '<option value="' + esc(o.value) + '"' + (o.value === v.cat ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join('');
      },
      onSubmit: function (val) {
        var amt = Math.max(0, Number(val.amount) || 0), rec = { type: val.type, cat: val.cat, amount: amt, date: HF.validDate(val.date) ? val.date : HF.today(), note: val.note };
        if (x) { Object.keys(rec).forEach(function (k) { x[k] = rec[k]; }); delete x.demo; } else { rec.id = HF.uid(); S.fin.tx.push(rec); }
        U().month = rec.date.slice(0, 7); HF.commit();
      },
      onDelete: x ? function () { S.fin.tx = S.fin.tx.filter(function (y) { return y.id !== id; }); HF.commit(); } : null
    });
  }
  function catForm(id) {
    var S = HF.state, c = id ? S.fin.cats.filter(function (y) { return y.id === id; })[0] : null;
    var builtin = c && HF.finCatDefs.some(function (d) { return d.id === c.id; });
    HF.openForm({
      title: c ? t('money.cat.edit') : t('money.cat.new'), values: c ? { name: HF.finCatName(c), icon: c.icon, kind: c.kind, type: c.type } : { name: '', icon: ICONS[10], kind: 'variable', type: 'expense' },
      fields: [
        { name: 'name', label: t('money.cat.name'), required: true, full: true, autofocus: true, maxlength: 40 },
        { name: 'type', label: t('money.f.type'), type: 'choice', options: [{ value: 'expense', label: t('money.type.expense') }, { value: 'income', label: t('money.type.income') }] },
        { name: 'kind', label: t('money.cat.kind'), type: 'choice', options: [{ value: 'fixed', label: t('money.fixed') }, { value: 'variable', label: t('money.variable') }] },
        { name: 'icon', label: t('money.cat.icon'), type: 'choice', options: ICONS.map(function (i) { return { value: i, label: i }; }) }
      ],
      onSubmit: function (v) {
        if (c) { c.name = v.name; c.icon = v.icon; c.kind = v.kind; if (!builtin) c.type = v.type; }
        else S.fin.cats.push({ id: 'c' + HF.uid(), type: v.type, kind: v.kind, icon: v.icon, name: v.name });
        HF.commit();
      },
      onDelete: c && !builtin ? function () {
        S.fin.tx.forEach(function (x) { if (x.cat === c.id) x.cat = c.type === 'income' ? 'income' : 'other'; });
        delete S.fin.budgets[c.id]; S.fin.cats = S.fin.cats.filter(function (y) { return y.id !== c.id; }); HF.commit();
      } : null
    });
  }

  function budgetRow(c, spent, b, cur) {
    var pct = b > 0 ? spent / b * 100 : 0, lvl = !b ? '' : pct > 100 ? 'bad' : pct >= 80 ? 'warn' : 'ok';
    return '<li class="brow"><div class="brow-h"><span>' + c.icon + ' ' + esc(HF.finCatName(c)) + '</span><span class="muted sm">' + (b ? esc(t('money.spent', { a: HF.money(spent, cur), b: HF.money(b, cur) })) : esc(HF.money(spent, cur) + ' · ' + t('money.noBudget'))) + '</span></div>' +
      (b ? HF.bar(pct, lvl, HF.finCatName(c)) + '<div class="brow-f ' + lvl + '">' + HF.icon(lvl === 'ok' ? 'check' : 'bell', 13) + ' ' + esc(lvl === 'bad' ? t('money.over', { a: HF.money(spent - b, cur) }) : t('money.left', { a: HF.money(b - spent, cur) })) + ' · ' + esc(t('money.alert.' + lvl)) + '</div>' : '') + '</li>';
  }

  HF.views.money = {
    render: function (root) {
      var S = HF.state, u = U(), cur = S.settings.currency, st = HF.monthStats(u.month);
      var tabs = ['overview', 'moves', 'budgets'].map(function (k) { return '<button type="button" role="tab" class="tab' + (u.tab === k ? ' on' : '') + '" aria-selected="' + (u.tab === k) + '" data-act="money.tab" data-tab="' + k + '">' + esc(t('money.tab.' + k)) + '</button>'; }).join('');
      var monthName = HF.fmtMonth ? HF.fmtMonth(u.month + '-01') : u.month;
      var nav = '<div class="cal-nav"><button type="button" class="icon-btn" data-act="money.nav" data-dir="-1" aria-label="' + esc(t('c.prev')) + '">' + HF.icon('chevL', 20) + '</button><h2 class="cal-title">' + esc(monthName) + '</h2><button type="button" class="icon-btn" data-act="money.nav" data-dir="1" aria-label="' + esc(t('c.nextP')) + '">' + HF.icon('chevR', 20) + '</button><button type="button" class="btn sm ghost" data-act="money.nav" data-dir="0">' + esc(t('c.today')) + '</button></div>';
      var head = '<div class="stat-row"><div class="card stat"><span class="muted sm">' + esc(t('money.income')) + '</span><strong class="pos">' + esc(HF.money(st.income, cur)) + '</strong></div><div class="card stat"><span class="muted sm">' + esc(t('money.expense')) + '</span><strong>' + esc(HF.money(st.expense, cur)) + '</strong></div><div class="card stat"><span class="muted sm">' + esc(t('money.balance')) + '</span><strong class="' + (st.balance < 0 ? 'neg' : 'pos') + '">' + esc(HF.money(st.balance, cur)) + '</strong></div></div>';
      var body = '';
      if (u.tab === 'overview') {
        var exps = cats().filter(function (c) { return c.type === 'expense'; });
        var items = exps.filter(function (c) { return st.by[c.id] > 0; }).map(function (c, i) { return { label: HF.finCatName(c), value: st.by[c.id], color: HF.DONUT[i % HF.DONUT.length] }; });
        var legend = items.map(function (i) { return '<li><i style="background:' + i.color + '"></i><span>' + esc(i.label) + '</span><b>' + esc(HF.money(i.value, cur)) + '</b></li>'; }).join('');
        var fv = st.expense > 0 ? '<div class="fixvar">' + HF.bar(st.fixed / st.expense * 100, '', t('money.fixedVar')) + '<div class="fv-l"><span>' + esc(t('money.fixed')) + ': <b>' + esc(HF.money(st.fixed, cur)) + '</b></span><span>' + esc(t('money.variable')) + ': <b>' + esc(HF.money(st.variable, cur)) + '</b></span></div></div>' : '';
        var al = HF.budgetAlerts(u.month);
        var alHtml = al.length ? '<div class="card alerts"><h3>' + HF.icon('bell', 18) + ' ' + esc(t('money.alerts')) + '</h3><ul>' + al.map(function (a) { return '<li class="' + a.level + '">' + a.cat.icon + ' ' + esc(HF.finCatName(a.cat)) + ': ' + esc(t('money.alert.' + (a.level === 'bad' ? 'bad' : 'warn'))) + ' (' + Math.round(a.pct) + '%)</li>'; }).join('') + '</ul></div>' : '';
        var bud = exps.filter(function (c) { return S.fin.budgets[c.id] > 0 || st.by[c.id] > 0; }).map(function (c) { return budgetRow(c, st.by[c.id] || 0, Number(S.fin.budgets[c.id]) || 0, cur); }).join('');
        body = alHtml + '<div class="grid2"><div class="card"><h3>' + esc(t('money.byCat')) + '</h3>' + (items.length ? '<div class="donut-wrap">' + HF.donut(items, HF.money(st.expense, cur), t('money.expense')) + '<ul class="legend">' + legend + '</ul></div>' : '<p class="muted">' + esc(t('money.nodata')) + '</p>') + fv + '</div><div class="card"><h3>' + esc(t('money.budgetVs')) + '</h3>' + (bud ? '<ul class="brows">' + bud + '</ul>' : '<p class="muted">' + esc(t('money.budgets.help')) + '</p>') + '</div></div>';
      } else if (u.tab === 'moves') {
        var list = monthTx(u.month).filter(function (x) { return !u.type || x.type === u.type; }).sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
        var filt = '<label class="inline-sel"><span class="sr">' + esc(t('money.f.type')) + '</span><select data-chg="money.type"><option value=""' + (!u.type ? ' selected' : '') + '>' + esc(t('money.filter.all')) + '</option><option value="income"' + (u.type === 'income' ? ' selected' : '') + '>' + esc(t('money.income')) + '</option><option value="expense"' + (u.type === 'expense' ? ' selected' : '') + '>' + esc(t('money.expense')) + '</option></select></label>';
        body = '<div class="toolbar">' + filt + '<span class="grow"></span><button type="button" class="btn" data-act="money.new" data-type="income">' + HF.icon('plus', 16) + ' ' + esc(t('money.type.income')) + '</button><button type="button" class="btn primary" data-act="money.new" data-type="expense">' + HF.icon('plus', 16) + ' ' + esc(t('money.type.expense')) + '</button></div>' +
          (list.length ? '<ul class="tx-list">' + list.map(function (x) {
            var c = cat(x.cat);
            return '<li><button type="button" class="tx" data-act="money.edit" data-id="' + x.id + '"><span class="tx-i">' + c.icon + '</span><span class="tx-m"><b>' + esc(x.note || HF.finCatName(c)) + '</b><small class="muted">' + esc(HF.finCatName(c)) + ' · ' + esc(HF.fmtDate(x.date)) + (x.demo ? ' · ' + esc(t('c.demo')) : '') + '</small></span><span class="tx-a ' + (x.type === 'income' ? 'pos' : '') + '">' + (x.type === 'income' ? '+' : '−') + esc(HF.money(x.amount, cur)) + '</span></button></li>';
          }).join('') + '</ul>' : HF.empty({ illo: 'wallet', title: t('money.moves.empty'), text: t('money.moves.empty.t') }));
      } else {
        var ex2 = cats().filter(function (c) { return c.type === 'expense'; });
        body = '<p class="muted">' + esc(t('money.budgets.help')) + '</p><div class="card"><div class="bform">' + ex2.map(function (c) {
          return '<label class="fld"><span>' + c.icon + ' ' + esc(HF.finCatName(c)) + '</span><input type="number" min="0" step="any" inputmode="decimal" data-budget="' + c.id + '" value="' + (S.fin.budgets[c.id] > 0 ? S.fin.budgets[c.id] : '') + '"></label>';
        }).join('') + '</div><div class="btn-row"><button type="button" class="btn primary" data-act="money.saveBudgets">' + esc(t('money.budgets.save')) + '</button></div></div>' +
          '<h3 class="h-sm">' + esc(t('money.cat.manage')) + '</h3><div class="chips-wrap">' + cats().map(function (c) { return '<button type="button" class="chip btn-chip" data-act="money.catEdit" data-id="' + c.id + '">' + c.icon + ' ' + esc(HF.finCatName(c)) + '</button>'; }).join('') + '<button type="button" class="chip btn-chip" data-act="money.catNew">' + HF.icon('plus', 13) + ' ' + esc(t('money.cat.new')) + '</button></div>';
      }
      root.innerHTML = '<div class="page-h"><h1>' + esc(t('money.title')) + '</h1><button type="button" class="btn primary" data-act="money.new">' + HF.icon('plus', 16) + ' ' + esc(t('money.add')) + '</button></div>' + nav + head + '<div class="tabs" role="tablist">' + tabs + '</div>' + body + '<p class="muted sm note">' + HF.icon('info', 14) + ' ' + esc(t('money.currencyNote')) + '</p>';
    }
  };
})();
