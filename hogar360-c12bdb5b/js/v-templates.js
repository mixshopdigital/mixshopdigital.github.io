/* HomeFlow 360 — Templates (editable, duplicable, deletable) */
(function () {
  'use strict';
  var HF = window.HF, t = HF.t, esc = HF.esc;

  HF.addDict({
    'tpl.title': ['Plantillas', 'Templates', 'Modelos'],
    'tpl.intro': ['Listas listas para usar. Aplícalas tal cual o edítalas: tus cambios se guardan como copia personal.', 'Ready-made lists. Apply them as they are or edit them: your changes are saved as a personal copy.', 'Listas prontas para usar. Aplique como estão ou edite: suas mudanças são salvas como cópia pessoal.'],
    'tpl.kind.tasks': ['Tareas', 'Tasks', 'Tarefas'], 'tpl.kind.shopping': ['Compras', 'Shopping', 'Compras'], 'tpl.kind.menu': ['Menú semanal', 'Weekly menu', 'Cardápio semanal'], 'tpl.kind.budget': ['Presupuesto', 'Budget', 'Orçamento'], 'tpl.kind.maintenance': ['Mantenimiento', 'Maintenance', 'Manutenção'],
    'tpl.apply': ['Usar plantilla', 'Use template', 'Usar modelo'], 'tpl.items': ['{n} elementos', '{n} items', '{n} itens'], 'tpl.mine': ['Mía', 'Mine', 'Minha'],
    'tpl.new': ['Nueva plantilla', 'New template', 'Novo modelo'], 'tpl.edit': ['Editar plantilla', 'Edit template', 'Editar modelo'],
    'tpl.f.name': ['Nombre', 'Name', 'Nome'], 'tpl.f.kind': ['Tipo', 'Type', 'Tipo'], 'tpl.f.items': ['Elementos (uno por línea)', 'Items (one per line)', 'Itens (um por linha)'],
    'tpl.f.freq': ['Repetir las tareas', 'Repeat the tasks', 'Repetir as tarefas'],
    'tpl.hint.tasks': ['Una tarea por línea.', 'One task per line.', 'Uma tarefa por linha.'], 'tpl.hint.shopping': ['Ejemplo: 2 l leche', 'Example: 2 l milk', 'Exemplo: 2 l leite'],
    'tpl.hint.menu': ['Formato: día|comida|plato. Día 1-7 (1 = primer día de la semana); comida: b desayuno, l almuerzo, s merienda, d cena.', 'Format: day|meal|dish. Day 1-7 (1 = first day of the week); meal: b breakfast, l lunch, s snack, d dinner.', 'Formato: dia|refeição|prato. Dia 1-7 (1 = primeiro dia da semana); refeição: b café, l almoço, s lanche, d jantar.'],
    'tpl.hint.budget': ['Formato: categoría|porcentaje (ej: food|25). Categorías: fixed, services, food, transport, education, health, fun, variable, other.', 'Format: category|percent (e.g. food|25). Categories: fixed, services, food, transport, education, health, fun, variable, other.', 'Formato: categoria|percentual (ex: food|25). Categorias: fixed, services, food, transport, education, health, fun, variable, other.'],
    'tpl.hint.maintenance': ['Formato: nombre|días (ej: Limpieza de ventanas|30).', 'Format: name|days (e.g. Window cleaning|30).', 'Formato: nome|dias (ex: Limpeza das janelas|30).'],
    'tpl.dup': ['Duplicar', 'Duplicate', 'Duplicar'], 'tpl.copy': ['{n} (copia)', '{n} (copy)', '{n} (cópia)'],
    'tpl.del.ask': ['¿Eliminar esta plantilla?', 'Delete this template?', 'Excluir este modelo?'], 'tpl.restore': ['Restaurar plantillas originales', 'Restore original templates', 'Restaurar modelos originais'],
    'tpl.applied.tasks': ['{n} tareas agregadas', '{n} tasks added', '{n} tarefas adicionadas'], 'tpl.applied.shopping': ['{n} productos agregados a la lista', '{n} items added to the list', '{n} itens adicionados à lista'],
    'tpl.applied.menu': ['Menú cargado en la semana', 'Menu loaded into the week', 'Cardápio carregado na semana'], 'tpl.applied.budget': ['Presupuestos actualizados', 'Budgets updated', 'Orçamentos atualizados'], 'tpl.applied.maintenance': ['{n} tareas de mantenimiento agregadas', '{n} maintenance jobs added', '{n} tarefas de manutenção adicionadas'],
    'tpl.budget.income': ['Ingreso mensual del hogar', 'Monthly household income', 'Renda mensal da casa'], 'tpl.budget.note': ['Reemplaza los presupuestos de las categorías incluidas, repartiendo ese ingreso según los porcentajes.', 'Replaces the budgets of the included categories, splitting this income by the percentages.', 'Substitui os orçamentos das categorias incluídas, dividindo essa renda pelos percentuais.'],
    'tpl.menu.replace': ['La semana ya tiene comidas en esos espacios. ¿Reemplazarlas?', 'The week already has meals in those slots. Replace them?', 'A semana já tem refeições nesses espaços. Substituir?'],
    'tpl.none': ['No hay plantillas.', 'No templates.', 'Nenhum modelo.']
  });
  var KINDS = ['tasks', 'shopping', 'menu', 'budget', 'maintenance'], SL = { b: 'breakfast', l: 'lunch', s: 'snack', d: 'dinner' };
  function find(id) { return HF.allTemplates().filter(function (x) { return x.id === id; })[0]; }

  HF.applyTemplate = function (tp) {
    var S = HF.state, lines = tp.items.filter(Boolean);
    if (tp.kind === 'tasks') {
      var freq = tp.freq || 'none';
      lines.forEach(function (l) { S.tasks.push({ id: HF.uid(), title: l.slice(0, 120), cat: tp.cat || 'clean', due: HF.today(), recur: freq, assignee: '', prio: 'mid', rotate: false, done: false, notes: '', routine: freq !== 'none' ? tp.name : '' }); });
      HF.toast(t('tpl.applied.tasks', { n: lines.length })); HF.commit(); return;
    }
    if (tp.kind === 'shopping') {
      var n = HF.addIngredientsToShopping(lines.map(HF.parseQtyLine).filter(Boolean).map(function (p) { return { name: p.name, qty: p.qty, unit: p.unit, cat: HF.guessShopCat(p.name) }; }));
      HF.toast(t('tpl.applied.shopping', { n: n })); HF.commit(); return;
    }
    if (tp.kind === 'maintenance') {
      var c = 0;
      lines.forEach(function (l) {
        var p = l.split('|'), name = p[0].trim(), days = parseInt(p[1], 10) || 30; if (!name) return;
        if (S.maint.some(function (m) { return m.name.toLowerCase() === name.toLowerCase(); })) return;
        S.maint.push({ id: HF.uid(), name: name.slice(0, 80), icon: '🧽', freq: Math.max(1, Math.min(3650, days)), lastDone: HF.today(), notes: '', history: [] }); c++;
      });
      HF.toast(t('tpl.applied.maintenance', { n: c })); HF.commit(); return;
    }
    if (tp.kind === 'menu') {
      var ws = HF.ui.meals && HF.ui.meals.week ? HF.ui.meals.week : HF.weekStart(HF.today());
      var items = lines.map(function (l) { var p = l.split('|'); return { d: (parseInt(p[0], 10) || 1) - 1, s: SL[(p[1] || '').trim()], txt: p.slice(2).join('|').trim() }; }).filter(function (x) { return x.s && x.txt && x.d >= 0 && x.d < 7; });
      var clash = items.some(function (x) { var day = S.meals[HF.addDays(ws, x.d)]; return day && day[x.s]; });
      var go = function () {
        items.forEach(function (x) {
          var k = HF.addDays(ws, x.d), rec = S.recipes.filter(function (r) { return r.name.toLowerCase() === x.txt.toLowerCase(); })[0];
          S.meals[k] = S.meals[k] || {}; S.meals[k][x.s] = { text: rec ? '' : x.txt, recipeId: rec ? rec.id : '' };
        });
        HF.toast(t('tpl.applied.menu')); HF.go('meals');
        HF.commit();
      };
      if (clash) HF.confirm({ title: t('tpl.apply'), text: t('tpl.menu.replace'), ok: t('c.apply') }).then(function (y) { if (y) go(); }); else go();
      return;
    }
    if (tp.kind === 'budget') {
      var st = HF.monthStats ? HF.monthStats(HF.today().slice(0, 7)) : { income: 0 };
      HF.openForm({
        title: tp.name, values: { income: st.income || '' }, submit: t('c.apply'),
        fields: [{ name: 'income', label: t('tpl.budget.income') + ' (' + S.settings.currency + ')', type: 'number', min: 1, required: true, full: true, autofocus: true }, { name: 'n', label: t('tpl.budget.note'), type: 'note' }],
        onSubmit: function (v) {
          lines.forEach(function (l) { var p = l.split('|'), id = p[0].trim(), pct = parseFloat(p[1]); if (!(pct > 0) || !S.fin.cats.some(function (c) { return c.id === id && c.type === 'expense'; })) return; S.fin.budgets[id] = HF.round2(v.income * pct / 100); });
          S.settings.demoBudgets = false; HF.toast(t('tpl.applied.budget')); HF.commit();
        }
      });
    }
  };

  function form(id, copyOf) {
    var S = HF.state, src = id ? find(id) : null, mine = src && !src.builtin;
    HF.openForm({
      title: src ? t('tpl.edit') : t('tpl.new'), wide: true,
      values: src ? { name: src.name, kind: src.kind, items: src.items.join('\n'), freq: src.freq || 'none' } : { kind: 'tasks', freq: 'none' },
      fields: [
        { name: 'name', label: t('tpl.f.name'), required: true, full: true, autofocus: true, maxlength: 60 },
        { name: 'kind', label: t('tpl.f.kind'), type: 'select', options: KINDS.map(function (k) { return { value: k, label: t('tpl.kind.' + k) }; }) },
        { name: 'freq', label: t('tpl.f.freq'), type: 'select', options: ['none', 'daily', 'weekly', 'monthly'].map(function (f) { return { value: f, label: f === 'none' ? t('c.none') : t('freq.' + f) }; }) },
        { name: 'items', label: t('tpl.f.items'), type: 'textarea', rows: 8, hint: src ? t('tpl.hint.' + src.kind) : t('tpl.hint.tasks') }
      ],
      onSubmit: function (v) {
        var items = v.items.split('\n').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 80).map(function (s) { return s.slice(0, 160); });
        var rec = { name: v.name, kind: v.kind, freq: v.kind === 'tasks' ? v.freq : 'none', cat: src && src.cat ? src.cat : 'clean', items: items };
        if (mine) { var o = S.templates.filter(function (x) { return x.id === id; })[0]; if (o) Object.keys(rec).forEach(function (k) { o[k] = rec[k]; }); }
        else { rec.id = 'u' + HF.uid(); S.templates.push(rec); if (src && src.builtin && S.hiddenTemplates.indexOf(src.id) < 0) S.hiddenTemplates.push(src.id); }
        HF.commit();
      },
      onDelete: mine ? function () { S.templates = S.templates.filter(function (x) { return x.id !== id; }); HF.commit(); } : null
    });
  }

  HF.act['tpl.apply'] = function (el) { var tp = find(el.getAttribute('data-id')); if (tp) HF.applyTemplate(tp); };
  HF.act['tpl.new'] = function () { form(null); };
  HF.act['tpl.edit'] = function (el) { form(el.getAttribute('data-id')); };
  HF.act['tpl.dup'] = function (el) {
    var tp = find(el.getAttribute('data-id')); if (!tp) return;
    HF.state.templates.push({ id: 'u' + HF.uid(), name: t('tpl.copy', { n: tp.name }), kind: tp.kind, freq: tp.freq || 'none', cat: tp.cat || 'clean', items: tp.items.slice() }); HF.commit();
  };
  HF.act['tpl.del'] = function (el) {
    var id = el.getAttribute('data-id'), tp = find(id); if (!tp) return;
    HF.confirm({ title: t('c.delete'), text: t('tpl.del.ask'), ok: t('c.delete'), danger: true }).then(function (y) {
      if (!y) return;
      if (tp.builtin) HF.state.hiddenTemplates.push(id); else HF.state.templates = HF.state.templates.filter(function (x) { return x.id !== id; });
      HF.commit();
    });
  };
  HF.act['tpl.restore'] = function () { HF.state.hiddenTemplates = []; HF.commit(); };

  HF.views.templates = {
    render: function (root) {
      var S = HF.state, all = HF.allTemplates();
      var sec = KINDS.map(function (k) {
        var li = all.filter(function (x) { return x.kind === k; }); if (!li.length) return '';
        return '<section><h2 class="h-md">' + esc(t('tpl.kind.' + k)) + '</h2><div class="cards">' + li.map(function (x) {
          return '<article class="card"><h3>' + esc(x.name) + (!x.builtin ? ' ' + HF.chip(t('tpl.mine'), 'ok') : '') + '</h3><p class="muted sm">' + esc(t('tpl.items', { n: x.items.length })) + '</p><p class="sm clip">' + esc(x.items.slice(0, 3).map(function (i) { return i.split('|').pop(); }).join(' · ')) + '…</p><div class="btn-row"><button type="button" class="btn sm primary" data-act="tpl.apply" data-id="' + x.id + '">' + esc(t('tpl.apply')) + '</button><button type="button" class="icon-btn" data-act="tpl.edit" data-id="' + x.id + '" aria-label="' + esc(t('c.edit') + ' ' + x.name) + '">' + HF.icon('edit', 18) + '</button><button type="button" class="icon-btn" data-act="tpl.dup" data-id="' + x.id + '" aria-label="' + esc(t('tpl.dup') + ' ' + x.name) + '">' + HF.icon('copy', 18) + '</button><button type="button" class="icon-btn" data-act="tpl.del" data-id="' + x.id + '" aria-label="' + esc(t('c.delete') + ' ' + x.name) + '">' + HF.icon('trash', 18) + '</button></div></article>';
        }).join('') + '</div></section>';
      }).join('');
      root.innerHTML = '<div class="page-h"><h1>' + esc(t('tpl.title')) + '</h1><button type="button" class="btn primary" data-act="tpl.new">' + HF.icon('plus', 16) + ' ' + esc(t('tpl.new')) + '</button></div><p class="muted">' + esc(t('tpl.intro')) + '</p>' + (sec || '<p class="muted">' + esc(t('tpl.none')) + '</p>') +
        (S.hiddenTemplates.length ? '<div class="btn-row"><button type="button" class="btn ghost" data-act="tpl.restore">' + esc(t('tpl.restore')) + '</button></div>' : '');
    }
  };
})();
