/* HomeFlow 360 — Meal planner & recipes */
(function () {
  'use strict';
  var HF = window.HF, t = HF.t, esc = HF.esc;

  HF.addDict({
    'meals.title': ['Planificador de comidas', 'Meal planner', 'Planejador de refeições'],
    'meals.tab.plan': ['Semana', 'Week', 'Semana'], 'meals.tab.recipes': ['Recetas', 'Recipes', 'Receitas'], 'meals.tab.menus': ['Menús guardados', 'Saved menus', 'Cardápios salvos'],
    'slot.breakfast': ['Desayuno', 'Breakfast', 'Café da manhã'], 'slot.lunch': ['Almuerzo', 'Lunch', 'Almoço'], 'slot.snack': ['Merienda', 'Snack', 'Lanche'], 'slot.dinner': ['Cena', 'Dinner', 'Jantar'],
    'meals.weekOf': ['Semana del {d}', 'Week of {d}', 'Semana de {d}'], 'meals.thisWeek': ['Esta semana', 'This week', 'Esta semana'],
    'meals.slot.title': ['{slot} · {day}', '{slot} · {day}', '{slot} · {day}'],
    'meals.slot.recipe': ['Elegir una receta', 'Pick a recipe', 'Escolher uma receita'], 'meals.slot.free': ['…o escribir una comida', '…or type a meal', '…ou escreva uma refeição'],
    'meals.slot.none': ['— Sin receta —', '— No recipe —', '— Sem receita —'], 'meals.slot.add': ['Agregar comida', 'Add a meal', 'Adicionar refeição'],
    'meals.gen': ['Generar lista de compras', 'Create shopping list', 'Gerar lista de compras'],
    'meals.gen.done': ['{n} ingredientes agregados a la lista de compras', '{n} ingredients added to the shopping list', '{n} ingredientes adicionados à lista de compras'],
    'meals.gen.none': ['Elige recetas para esta semana y generaremos la lista con sus ingredientes.', 'Pick recipes for this week and we will build the list from their ingredients.', 'Escolha receitas para esta semana e geraremos a lista com os ingredientes.'],
    'meals.view': ['Ver lista', 'View list', 'Ver lista'],
    'meals.copy': ['Copiar semana anterior', 'Copy previous week', 'Copiar semana anterior'], 'meals.copy.done': ['Menú de la semana anterior copiado', 'Previous week copied', 'Semana anterior copiada'],
    'meals.copy.none': ['La semana anterior no tiene comidas.', 'The previous week has no meals.', 'A semana anterior não tem refeições.'],
    'meals.save': ['Guardar como menú', 'Save as menu', 'Salvar como cardápio'], 'meals.save.name': ['Nombre del menú', 'Menu name', 'Nome do cardápio'], 'meals.save.done': ['Menú guardado', 'Menu saved', 'Cardápio salvo'],
    'meals.save.empty': ['Esta semana no tiene comidas para guardar.', 'This week has no meals to save.', 'Esta semana não tem refeições para salvar.'],
    'meals.clear': ['Vaciar semana', 'Clear week', 'Limpar semana'], 'meals.clear.ask': ['¿Quitar todas las comidas de esta semana?', 'Remove all meals from this week?', 'Remover todas as refeições desta semana?'],
    'meals.menus.empty': ['Aún no guardaste menús', 'No saved menus yet', 'Nenhum cardápio salvo ainda'],
    'meals.menus.empty.t': ['Arma una semana en el planificador y guárdala para reutilizarla cuando quieras.', 'Plan a week in the planner and save it to reuse any time.', 'Monte uma semana no planejador e salve para reutilizar quando quiser.'],
    'meals.menu.apply': ['Usar en esta semana', 'Use this week', 'Usar nesta semana'], 'meals.menu.apply.ask': ['Esta semana ya tiene comidas. ¿Reemplazarlas con este menú?', 'This week already has meals. Replace them with this menu?', 'Esta semana já tem refeições. Substituir por este cardápio?'],
    'meals.menu.applied': ['Menú aplicado', 'Menu applied', 'Cardápio aplicado'], 'meals.menu.count': ['{n} comidas', '{n} meals', '{n} refeições'],
    'rec.search': ['Buscar receta', 'Search recipes', 'Buscar receita'], 'rec.fav': ['Favoritas', 'Favorites', 'Favoritas'], 'rec.new': ['Nueva receta', 'New recipe', 'Nova receita'], 'rec.edit': ['Editar receta', 'Edit recipe', 'Editar receita'],
    'rec.name': ['Nombre de la receta', 'Recipe name', 'Nome da receita'], 'rec.ing': ['Ingredientes (uno por línea)', 'Ingredients (one per line)', 'Ingredientes (um por linha)'],
    'rec.ing.hint': ['Ejemplo: 200 g espaguetis · 2 huevos · 1 cda aceite', 'Example: 200 g spaghetti · 2 eggs · 1 tbsp oil', 'Exemplo: 200 g espaguete · 2 ovos · 1 colher de sopa azeite'],
    'rec.steps': ['Preparación', 'Method', 'Modo de preparo'], 'rec.favMark': ['Marcar como favorita', 'Mark as favorite', 'Marcar como favorita'],
    'rec.addShop': ['Agregar ingredientes a compras', 'Add ingredients to shopping', 'Adicionar ingredientes às compras'],
    'rec.fav.on': ['Quitar de favoritas: {n}', 'Remove from favorites: {n}', 'Remover das favoritas: {n}'], 'rec.fav.off': ['Marcar como favorita: {n}', 'Add to favorites: {n}', 'Favoritar: {n}'],
    'rec.none': ['No hay recetas con ese filtro.', 'No recipes match that filter.', 'Nenhuma receita com esse filtro.'],
    'rec.ingCount': ['{n} ingredientes', '{n} ingredients', '{n} ingredientes'], 'rec.plan': ['Planificar', 'Plan it', 'Planejar']
  });
  var SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];
  HF.ui.meals = { tab: 'plan', week: null, rcat: '', rfav: false, rq: '' };
  var U = function () { var u = HF.ui.meals; if (!u.week) u.week = HF.weekStart(HF.today()); return u; };

  function recipe(id) { return HF.state.recipes.filter(function (r) { return r.id === id; })[0]; }
  function slotName(s) { if (!s) return ''; if (s.recipeId) { var r = recipe(s.recipeId); if (r) return r.name; } return s.text || ''; }

  HF.addIngredientsToShopping = function (list) {
    var S = HF.state, n = 0;
    list.forEach(function (i) {
      var key = i.name.toLowerCase(), ex = S.shopping.filter(function (x) { return !x.bought && x.name.toLowerCase() === key && x.unit === i.unit; })[0];
      if (ex) ex.qty = HF.round2((ex.qty || 0) + (i.qty || 0)); else S.shopping.push({ id: HF.uid(), name: i.name, qty: i.qty, unit: i.unit, price: null, cat: i.cat || HF.guessShopCat(i.name), bought: false, fromMeal: true });
      n++;
    });
    return n;
  };
  function weekIngredients(ws) {
    var agg = {}, order = [];
    for (var d = 0; d < 7; d++) {
      var day = HF.state.meals[HF.addDays(ws, d)]; if (!day) continue;
      SLOTS.forEach(function (sl) {
        var s = day[sl]; if (!s || !s.recipeId) return; var r = recipe(s.recipeId); if (!r) return;
        r.ingredients.forEach(function (i) {
          var k = i.name.toLowerCase() + '|' + i.unit;
          if (!agg[k]) { agg[k] = { name: i.name, qty: 0, unit: i.unit, cat: i.cat }; order.push(k); }
          agg[k].qty += i.qty || 0;
        });
      });
    }
    return order.map(function (k) { agg[k].qty = HF.round2(agg[k].qty); return agg[k]; });
  }
  function weekCount(ws) { var n = 0; for (var d = 0; d < 7; d++) { var day = HF.state.meals[HF.addDays(ws, d)]; if (day) SLOTS.forEach(function (s) { if (slotName(day[s])) n++; }); } return n; }

  /* ----- actions ----- */
  HF.act['meal.tab'] = function (el) { U().tab = el.getAttribute('data-tab'); HF.refresh(); };
  HF.act['meal.wk'] = function (el) { var u = U(), d = +el.getAttribute('data-dir'); u.week = d === 0 ? HF.weekStart(HF.today()) : HF.addDays(u.week, 7 * d); HF.refresh(); };
  HF.act['meal.slot'] = function (el) { slotForm(el.getAttribute('data-d'), el.getAttribute('data-s')); };
  HF.act['meal.gen'] = function () {
    var list = weekIngredients(U().week);
    if (!list.length) { HF.toast(t('meals.gen.none'), { ms: 5000 }); return; }
    var n = HF.addIngredientsToShopping(list); HF.commit();
    HF.toast(t('meals.gen.done', { n: n }), { action: { label: t('meals.view'), fn: function () { HF.go('shopping'); } }, ms: 6000 });
  };
  HF.act['meal.copy'] = function () {
    var S = HF.state, ws = U().week, pw = HF.addDays(ws, -7), n = 0;
    for (var d = 0; d < 7; d++) {
      var src = S.meals[HF.addDays(pw, d)]; if (!src) continue;
      SLOTS.forEach(function (sl) { if (slotName(src[sl])) { var k = HF.addDays(ws, d); S.meals[k] = S.meals[k] || {}; S.meals[k][sl] = { text: src[sl].text || '', recipeId: src[sl].recipeId || '' }; n++; } });
    }
    if (!n) { HF.toast(t('meals.copy.none')); return; }
    HF.toast(t('meals.copy.done')); HF.commit();
  };
  HF.act['meal.saveMenu'] = function () {
    var S = HF.state, ws = U().week;
    if (!weekCount(ws)) { HF.toast(t('meals.save.empty')); return; }
    HF.openForm({ title: t('meals.save'), values: { name: t('meals.weekOf', { d: HF.fmtDate(ws) }) }, fields: [{ name: 'name', label: t('meals.save.name'), required: true, full: true, autofocus: true }],
      onSubmit: function (v) {
        var plan = {};
        for (var d = 0; d < 7; d++) { var day = S.meals[HF.addDays(ws, d)]; if (!day) continue; SLOTS.forEach(function (sl) { if (slotName(day[sl])) { plan[d] = plan[d] || {}; plan[d][sl] = { text: day[sl].text || '', recipeId: day[sl].recipeId || '' }; } }); }
        S.menus.push({ id: HF.uid(), name: v.name, plan: plan }); HF.toast(t('meals.save.done')); HF.commit();
      } });
  };
  HF.act['meal.clearWeek'] = function () {
    HF.confirm({ title: t('meals.clear'), text: t('meals.clear.ask'), ok: t('meals.clear'), danger: true }).then(function (y) {
      if (!y) return; var ws = U().week; for (var d = 0; d < 7; d++) delete HF.state.meals[HF.addDays(ws, d)]; HF.commit();
    });
  };
  HF.act['meal.menuApply'] = function (el) {
    var S = HF.state, m = S.menus.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!m) return;
    var ws = U().week;
    var go = function () {
      for (var d = 0; d < 7; d++) delete S.meals[HF.addDays(ws, d)];
      Object.keys(m.plan).forEach(function (d) { var k = HF.addDays(ws, +d); S.meals[k] = {}; Object.keys(m.plan[d]).forEach(function (sl) { S.meals[k][sl] = { text: m.plan[d][sl].text || '', recipeId: m.plan[d][sl].recipeId || '' }; }); });
      U().tab = 'plan'; HF.toast(t('meals.menu.applied')); HF.commit();
    };
    if (weekCount(ws)) HF.confirm({ title: t('meals.menu.apply'), text: t('meals.menu.apply.ask'), ok: t('c.apply') }).then(function (y) { if (y) go(); }); else go();
  };
  HF.act['meal.menuDel'] = function (el) {
    HF.confirm({ title: t('c.delete'), text: t('c.deleteAsk'), ok: t('c.delete'), danger: true }).then(function (y) { if (y) { HF.state.menus = HF.state.menus.filter(function (m) { return m.id !== el.getAttribute('data-id'); }); HF.commit(); } });
  };
  HF.act['rec.cat'] = function (el) { var u = U(), c = el.getAttribute('data-c'); if (c === 'fav') { u.rfav = !u.rfav; } else { u.rcat = c; u.rfav = false; } HF.refresh(); };
  HF.inp['rec.search'] = function (el) { U().rq = el.value; var box = HF.$('#rec-list'); if (box) { box.innerHTML = recipeCards(); } };
  HF.act['rec.new'] = function () { recipeForm(null); };
  HF.act['rec.open'] = function (el) { recipeDetail(el.getAttribute('data-id')); };
  HF.act['rec.favtoggle'] = function (el) { var r = recipe(el.getAttribute('data-id')); if (r) { r.fav = !r.fav; HF.commit(); } };

  /* ----- forms ----- */
  function slotForm(day, slot) {
    var S = HF.state, cur = (S.meals[day] || {})[slot] || {};
    var groups = HF.RECIPE_CATS.map(function (c) {
      var items = S.recipes.filter(function (r) { return r.cat === c; }).map(function (r) { return { value: r.id, label: r.name }; });
      return items.length ? { group: t('rcat.' + c), items: items } : null;
    }).filter(Boolean);
    var other = S.recipes.filter(function (r) { return HF.RECIPE_CATS.indexOf(r.cat) < 0; }).map(function (r) { return { value: r.id, label: r.name }; });
    if (other.length) groups.push({ group: t('rcat.main'), items: other });
    var has = !!slotName(cur);
    HF.openForm({
      title: t('meals.slot.title', { slot: t('slot.' + slot), day: HF.fmtLong(day) }), values: { recipeId: cur.recipeId || '', text: cur.text || '' },
      fields: [
        { name: 'recipeId', label: t('meals.slot.recipe'), type: 'select', full: true, options: [{ value: '', label: t('meals.slot.none') }].concat(groups) },
        { name: 'text', label: t('meals.slot.free'), full: true, maxlength: 120 }
      ],
      onSubmit: function (v) {
        S.meals[day] = S.meals[day] || {};
        if (!v.recipeId && !v.text) delete S.meals[day][slot]; else S.meals[day][slot] = { text: v.recipeId ? '' : v.text, recipeId: v.recipeId };
        if (!Object.keys(S.meals[day]).length) delete S.meals[day];
        HF.commit();
      },
      onDelete: has ? function () { delete S.meals[day][slot]; if (!Object.keys(S.meals[day]).length) delete S.meals[day]; HF.commit(); } : null
    });
  }
  function ingLine(i) { return (i.unit === 'u' ? HF.num(i.qty) : HF.num(i.qty) + ' ' + i.unit) + ' ' + i.name; }
  function recipeForm(id) {
    var S = HF.state, x = id ? recipe(id) : null;
    var v = x ? { name: x.name, cat: x.cat, fav: x.fav, ing: x.ingredients.map(function (i) { return (i.unit === 'u' ? String(i.qty) : i.qty + ' ' + i.unit) + ' ' + i.name; }).join('\n'), steps: x.steps || '' } : { cat: 'main', fav: false };
    HF.openForm({
      title: x ? t('rec.edit') : t('rec.new'), values: v, wide: true,
      fields: [
        { name: 'name', label: t('rec.name'), required: true, full: true, autofocus: true },
        { name: 'cat', label: t('c.category'), type: 'select', options: HF.RECIPE_CATS.map(function (c) { return { value: c, label: t('rcat.' + c) }; }) },
        { name: 'fav', label: t('rec.favMark'), type: 'checkbox' },
        { name: 'ing', label: t('rec.ing'), type: 'textarea', rows: 6, hint: t('rec.ing.hint') },
        { name: 'steps', label: t('rec.steps'), type: 'textarea', rows: 5 }
      ],
      onSubmit: function (val) {
        var old = x ? x.ingredients : [];
        var ings = val.ing.split('\n').map(HF.parseQtyLine).filter(Boolean).slice(0, 60).map(function (p) {
          var prev = old.filter(function (o) { return o.name.toLowerCase() === p.name.toLowerCase(); })[0];
          return { name: p.name, qty: p.qty, unit: p.unit, cat: prev ? prev.cat : HF.guessShopCat(p.name) };
        });
        if (x) { delete x.seed; x.name = val.name; x.cat = val.cat; x.fav = val.fav; x.ingredients = ings; x.steps = val.steps; }
        else S.recipes.push({ id: 'r' + HF.uid(), name: val.name, cat: val.cat, fav: val.fav, ingredients: ings, steps: val.steps });
        HF.commit();
      },
      onDelete: x ? function () { S.recipes = S.recipes.filter(function (r) { return r.id !== x.id; }); HF.commit(); } : null
    });
  }
  function recipeDetail(id) {
    var r = recipe(id); if (!r) return;
    var ctl = HF.modal({
      title: r.name, wide: true,
      body: '<p>' + HF.chip(t('rcat.' + (HF.RECIPE_CATS.indexOf(r.cat) >= 0 ? r.cat : 'main')), 'cat') + ' ' + HF.chip(t('rec.ingCount', { n: r.ingredients.length })) + '</p><h3 class="h-sm">' + esc(t('rec.ing').replace(/ \(.*\)/, '')) + '</h3><ul class="ing-list">' +
        r.ingredients.map(function (i) { return '<li><span>' + esc(HF.qtyStr(i.qty, i.unit)) + '</span> ' + esc(i.name) + '</li>'; }).join('') + '</ul><h3 class="h-sm">' + esc(t('rec.steps')) + '</h3><ol class="steps">' +
        (r.steps || '').split('\n').filter(Boolean).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>',
      foot: '<button type="button" class="btn ghost" data-edit>' + HF.icon('edit', 16) + ' ' + esc(t('c.edit')) + '</button><span class="grow"></span><button type="button" class="btn primary" data-shop>' + HF.icon('cart', 16) + ' ' + esc(t('rec.addShop')) + '</button>'
    });
    ctl.el.querySelector('[data-edit]').addEventListener('click', function () { ctl.close(); recipeForm(id); });
    ctl.el.querySelector('[data-shop]').addEventListener('click', function () {
      var n = HF.addIngredientsToShopping(r.ingredients); HF.commit(); ctl.close();
      HF.toast(t('meals.gen.done', { n: n }), { action: { label: t('meals.view'), fn: function () { HF.go('shopping'); } }, ms: 6000 });
    });
  }
  function recipeCards() {
    var u = U(), q = u.rq.trim().toLowerCase();
    var list = HF.state.recipes.filter(function (r) { return (!u.rcat || r.cat === u.rcat) && (!u.rfav || r.fav) && (!q || r.name.toLowerCase().indexOf(q) >= 0 || r.ingredients.some(function (i) { return i.name.toLowerCase().indexOf(q) >= 0; })); })
      .sort(function (a, b) { return a.name.localeCompare(b.name); });
    if (!list.length) return '<p class="muted">' + esc(t('rec.none')) + '</p>';
    return '<div class="cards">' + list.map(function (r) {
      return '<article class="card rcard"><button type="button" class="rcard-main" data-act="rec.open" data-id="' + r.id + '"><strong>' + esc(r.name) + '</strong><span class="muted sm">' + esc(t('rcat.' + (HF.RECIPE_CATS.indexOf(r.cat) >= 0 ? r.cat : 'main'))) + ' · ' + esc(t('rec.ingCount', { n: r.ingredients.length })) + '</span></button>' +
        '<button type="button" class="icon-btn fav' + (r.fav ? ' on' : '') + '" data-act="rec.favtoggle" data-id="' + r.id + '" aria-pressed="' + !!r.fav + '" aria-label="' + esc(t(r.fav ? 'rec.fav.on' : 'rec.fav.off', { n: r.name })) + '">' + HF.icon('heart', 20) + '</button></article>';
    }).join('') + '</div>';
  }

  HF.views.meals = {
    render: function (root) {
      var S = HF.state, u = U(), td = HF.today(), body = '';
      var tabs = ['plan', 'recipes', 'menus'].map(function (k) { return '<button type="button" role="tab" class="tab' + (u.tab === k ? ' on' : '') + '" aria-selected="' + (u.tab === k) + '" data-act="meal.tab" data-tab="' + k + '">' + esc(t('meals.tab.' + k)) + '</button>'; }).join('');
      if (u.tab === 'plan') {
        var days = '';
        for (var d = 0; d < 7; d++) {
          var iso = HF.addDays(u.week, d), day = S.meals[iso] || {};
          days += '<section class="mday' + (iso === td ? ' today' : '') + '"><h4><span>' + esc(HF.weekdayName(iso, 'long')) + '</span> <b>' + esc(HF.fmtDate(iso)) + '</b></h4>' + SLOTS.map(function (sl) {
            var nm = slotName(day[sl]);
            return '<button type="button" class="mslot' + (nm ? ' filled' : '') + '" data-act="meal.slot" data-d="' + iso + '" data-s="' + sl + '" aria-label="' + esc(t('slot.' + sl) + ', ' + HF.fmtLong(iso) + ': ' + (nm || t('meals.slot.add'))) + '"><small>' + esc(t('slot.' + sl)) + '</small><span>' + (nm ? esc(nm) : HF.icon('plus', 14)) + '</span></button>';
          }).join('') + '</section>';
        }
        body = '<div class="cal-nav"><button type="button" class="icon-btn" data-act="meal.wk" data-dir="-1" aria-label="' + esc(t('c.prev')) + '">' + HF.icon('chevL', 20) + '</button><h2 class="cal-title">' + esc(t('meals.weekOf', { d: HF.fmtDate(u.week, { day: 'numeric', month: 'long' }) })) + '</h2><button type="button" class="icon-btn" data-act="meal.wk" data-dir="1" aria-label="' + esc(t('c.nextP')) + '">' + HF.icon('chevR', 20) + '</button><button type="button" class="btn sm ghost" data-act="meal.wk" data-dir="0">' + esc(t('meals.thisWeek')) + '</button></div>' +
          '<div class="week">' + days + '</div><div class="btn-row"><button type="button" class="btn primary" data-act="meal.gen">' + HF.icon('cart', 16) + ' ' + esc(t('meals.gen')) + '</button><button type="button" class="btn" data-act="meal.copy">' + HF.icon('copy', 16) + ' ' + esc(t('meals.copy')) + '</button><button type="button" class="btn" data-act="meal.saveMenu">' + HF.icon('download', 16) + ' ' + esc(t('meals.save')) + '</button><button type="button" class="btn ghost danger" data-act="meal.clearWeek">' + esc(t('meals.clear')) + '</button></div>';
      } else if (u.tab === 'recipes') {
        var chips = '<button type="button" class="chip btn-chip' + (!u.rcat && !u.rfav ? ' chosen' : '') + '" data-act="rec.cat" data-c="">' + esc(t('c.all')) + '</button>' + HF.RECIPE_CATS.map(function (c) { return '<button type="button" class="chip btn-chip' + (u.rcat === c ? ' chosen' : '') + '" data-act="rec.cat" data-c="' + c + '">' + esc(t('rcat.' + c)) + '</button>'; }).join('') + '<button type="button" class="chip btn-chip' + (u.rfav ? ' chosen' : '') + '" data-act="rec.cat" data-c="fav">❤ ' + esc(t('rec.fav')) + '</button>';
        body = '<div class="toolbar"><label class="search"><span class="sr">' + esc(t('rec.search')) + '</span>' + HF.icon('search', 18) + '<input type="search" value="' + esc(u.rq) + '" placeholder="' + esc(t('rec.search')) + '" data-inp="rec.search" aria-label="' + esc(t('rec.search')) + '"></label><button type="button" class="btn primary" data-act="rec.new">' + HF.icon('plus', 16) + ' ' + esc(t('rec.new')) + '</button></div><div class="chips-wrap">' + chips + '</div><div id="rec-list">' + recipeCards() + '</div>';
      } else {
        body = S.menus.length ? '<div class="cards">' + S.menus.map(function (m) {
          var n = 0; Object.keys(m.plan).forEach(function (d) { n += Object.keys(m.plan[d]).length; });
          return '<article class="card"><h3>' + esc(m.name) + (m.demo ? ' ' + HF.chip(t('c.demo'), 'demo') : '') + '</h3><p class="muted sm">' + esc(t('meals.menu.count', { n: n })) + '</p><div class="btn-row"><button type="button" class="btn sm primary" data-act="meal.menuApply" data-id="' + m.id + '">' + esc(t('meals.menu.apply')) + '</button><button type="button" class="icon-btn" data-act="meal.menuDel" data-id="' + m.id + '" aria-label="' + esc(t('c.delete') + ' ' + m.name) + '">' + HF.icon('trash', 18) + '</button></div></article>';
        }).join('') + '</div>' : HF.empty({ illo: 'pot', title: t('meals.menus.empty'), text: t('meals.menus.empty.t') });
      }
      root.innerHTML = '<div class="page-h"><h1>' + esc(t('meals.title')) + '</h1></div><div class="tabs" role="tablist">' + tabs + '</div>' + body;
    }
  };
})();
