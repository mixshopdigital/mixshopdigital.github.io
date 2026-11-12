/* HomeFlow 360 — Smart shopping list */
(function () {
  'use strict';
  var HF = window.HF, t = HF.t, esc = HF.esc;

  HF.addDict({
    'shop.title': ['Lista de compras', 'Shopping list', 'Lista de compras'],
    'shop.tab.list': ['Lista', 'List', 'Lista'], 'shop.tab.lists': ['Listas frecuentes', 'Frequent lists', 'Listas frequentes'], 'shop.tab.history': ['Historial', 'History', 'Histórico'],
    'shop.quick': ['Agregar producto (ej: 2 l leche)', 'Add item (e.g. 2 l milk)', 'Adicionar item (ex: 2 l leite)'], 'shop.add': ['Agregar', 'Add', 'Adicionar'],
    'shop.quick.hint': ['Escribe el producto y toca Agregar para completar cantidad, unidad y precio. Con Enter se agrega directo.', 'Type the item and tap Add to set quantity, unit and price. Enter adds it straight away.', 'Digite o item e toque em Adicionar para definir quantidade, unidade e preço. Enter adiciona direto.'],
    'shop.est': ['Total estimado', 'Estimated total', 'Total estimado'], 'shop.inCart': ['En el carrito', 'In cart', 'No carrinho'],
    'shop.left': ['{n} por comprar', '{n} left to buy', '{n} para comprar'], 'shop.allDone': ['¡Todo comprado!', 'Everything bought!', 'Tudo comprado!'],
    'shop.empty': ['Tu lista está vacía', 'Your list is empty', 'Sua lista está vazia'],
    'shop.empty.t': ['Agrega productos arriba, genera la lista desde tu menú semanal o carga una lista frecuente.', 'Add items above, build the list from your weekly menu or load a frequent list.', 'Adicione itens acima, gere a lista pelo cardápio semanal ou carregue uma lista frequente.'],
    'shop.item.new': ['Nuevo producto', 'New item', 'Novo item'],
    'shop.item.edit': ['Editar producto', 'Edit item', 'Editar item'], 'shop.f.name': ['Producto', 'Item', 'Item'], 'shop.f.qty': ['Cantidad', 'Quantity', 'Quantidade'], 'shop.f.unit': ['Unidad', 'Unit', 'Unidade'],
    'shop.f.price': ['Precio estimado (total del producto)', 'Estimated price (item total)', 'Preço estimado (total do item)'],
    'shop.finish': ['Finalizar compra', 'Finish shopping', 'Finalizar compra'], 'shop.finish.none': ['Marca primero los productos que compraste.', 'Check the items you bought first.', 'Marque primeiro os itens que comprou.'],
    'shop.finish.total': ['Total pagado', 'Total paid', 'Total pago'], 'shop.finish.expense': ['Registrar como gasto de Alimentación', 'Record as a Food expense', 'Registrar como despesa de Alimentação'],
    'shop.finish.done': ['Compra guardada en el historial', 'Purchase saved to history', 'Compra salva no histórico'],
    'shop.clear': ['Quitar comprados', 'Remove bought', 'Remover comprados'], 'shop.clearAll': ['Vaciar lista', 'Empty list', 'Esvaziar lista'],
    'shop.clearAll.ask': ['¿Vaciar toda la lista de compras?', 'Empty the whole shopping list?', 'Esvaziar toda a lista de compras?'],
    'shop.saveList': ['Guardar como lista frecuente', 'Save as frequent list', 'Salvar como lista frequente'], 'shop.saveList.name': ['Nombre de la lista', 'List name', 'Nome da lista'],
    'shop.saveList.empty': ['La lista está vacía.', 'The list is empty.', 'A lista está vazia.'], 'shop.saveList.done': ['Lista guardada', 'List saved', 'Lista salva'],
    'shop.lists.empty': ['Sin listas frecuentes', 'No frequent lists', 'Sem listas frequentes'],
    'shop.lists.empty.t': ['Guarda tu lista actual para repetirla con un toque cada semana.', 'Save your current list to repeat it with one tap every week.', 'Salve sua lista atual para repeti-la com um toque toda semana.'],
    'shop.lists.load': ['Agregar a la lista', 'Add to list', 'Adicionar à lista'], 'shop.lists.loaded': ['{n} productos agregados', '{n} items added', '{n} itens adicionados'],
    'shop.hist.empty': ['Todavía no hay compras', 'No purchases yet', 'Ainda não há compras'],
    'shop.hist.empty.t': ['Cuando finalices una compra aparecerá aquí y podrás repetirla.', 'When you finish a shopping trip it will appear here and you can repeat it.', 'Quando você finalizar uma compra ela aparecerá aqui e poderá repeti-la.'],
    'shop.hist.repeat': ['Repetir compra', 'Repeat purchase', 'Repetir compra'], 'shop.hist.items': ['{n} productos', '{n} items', '{n} itens'],
    'shop.hist.del': ['Eliminar del historial', 'Remove from history', 'Remover do histórico'],
    'shop.check': ['Marcar {n} como comprado', 'Mark {n} as bought', 'Marcar {n} como comprado'], 'shop.uncheck': ['Desmarcar {n}', 'Uncheck {n}', 'Desmarcar {n}']
  });

  HF.ui.shop = { tab: 'list' };
  var U = function () { return HF.ui.shop; };

  function parseQuick(txt) { var p = HF.parseQtyLine(txt); if (!p) return null; p.name = p.name.slice(0, 80); return p; }
  function addItem(txt) {
    var p = parseQuick(txt); if (!p) return false;
    var S = HF.state, ex = S.shopping.filter(function (x) { return !x.bought && x.name.toLowerCase() === p.name.toLowerCase() && x.unit === p.unit; })[0];
    if (ex) { ex.qty = HF.round2((ex.qty || 0) + p.qty); if (ex.demo) delete ex.demo; }
    else S.shopping.push({ id: HF.uid(), name: p.name, qty: p.qty, unit: p.unit, price: null, cat: HF.guessShopCat(p.name), bought: false });
    return true;
  }
  function item(id) { return HF.state.shopping.filter(function (x) { return x.id === id; })[0]; }
  function itemTotal(list) { return HF.sum(list.map(function (x) { return Number(x.price) || 0; })); }

  HF.act['shop.tab'] = function (el) { U().tab = el.getAttribute('data-tab'); HF.refresh(); };
  /* "Agregar" opens the item form (name, quantity, unit, category, price) pre-filled from what was typed. Enter = quick add. */
  HF.act['shop.add'] = function () {
    var inp = HF.$('#shop-quick'); if (!inp || !inp.value.trim()) return;
    var p = parseQuick(inp.value); if (!p) return;
    itemForm(null, { name: p.name, qty: p.qty, unit: p.unit, cat: HF.guessShopCat(p.name), price: '' });
  };
  HF.act['shop.quickAdd'] = function () {
    var inp = HF.$('#shop-quick'); if (!inp || !inp.value.trim()) return;
    if (addItem(inp.value)) { inp.value = ''; HF.commit(); var n = HF.$('#shop-quick'); if (n) { n.value = ''; n.focus(); } }
  };
  HF.act['shop.toggle'] = function (el) { var x = item(el.getAttribute('data-id')); if (x) { x.bought = !x.bought; HF.commit(); } };
  HF.act['shop.edit'] = function (el) { itemForm(el.getAttribute('data-id')); };
  HF.act['shop.finish'] = function () { finish(); };
  HF.act['shop.clearBought'] = function () { HF.state.shopping = HF.state.shopping.filter(function (x) { return !x.bought; }); HF.commit(); };
  HF.act['shop.clearAll'] = function () {
    HF.confirm({ title: t('shop.clearAll'), text: t('shop.clearAll.ask'), ok: t('shop.clearAll'), danger: true }).then(function (y) { if (y) { HF.state.shopping = []; HF.commit(); } });
  };
  HF.act['shop.saveList'] = function () {
    var S = HF.state; if (!S.shopping.length) { HF.toast(t('shop.saveList.empty')); return; }
    HF.openForm({ title: t('shop.saveList'), values: { name: '' }, fields: [{ name: 'name', label: t('shop.saveList.name'), required: true, full: true, autofocus: true }],
      onSubmit: function (v) {
        S.lists.push({ id: HF.uid(), name: v.name, items: S.shopping.map(function (x) { return { name: x.name, qty: x.qty, unit: x.unit, price: x.price, cat: x.cat }; }) });
        HF.toast(t('shop.saveList.done')); HF.commit();
      } });
  };
  HF.act['shop.listLoad'] = function (el) {
    var l = HF.state.lists.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!l) return;
    var n = HF.addIngredientsToShopping(l.items.map(function (i) { return { name: i.name, qty: i.qty, unit: i.unit, cat: i.cat }; }));
    HF.state.shopping.forEach(function (x) { if (x.fromMeal && !x.bought) { delete x.fromMeal; } });
    HF.toast(t('shop.lists.loaded', { n: n })); U().tab = 'list'; HF.commit();
  };
  HF.act['shop.listDel'] = function (el) {
    HF.confirm({ title: t('c.delete'), text: t('c.deleteAsk'), ok: t('c.delete'), danger: true }).then(function (y) { if (y) { HF.state.lists = HF.state.lists.filter(function (l) { return l.id !== el.getAttribute('data-id'); }); HF.commit(); } });
  };
  HF.act['shop.repeat'] = function (el) {
    var p = HF.state.purchases.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!p) return;
    var n = HF.addIngredientsToShopping(p.items.map(function (i) { return { name: i.name, qty: i.qty, unit: i.unit, cat: i.cat }; }));
    HF.toast(t('shop.lists.loaded', { n: n })); U().tab = 'list'; HF.commit();
  };
  HF.act['shop.purchDel'] = function (el) {
    HF.confirm({ title: t('c.delete'), text: t('c.deleteAsk'), ok: t('c.delete'), danger: true }).then(function (y) { if (y) { HF.state.purchases = HF.state.purchases.filter(function (l) { return l.id !== el.getAttribute('data-id'); }); HF.commit(); } });
  };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target && e.target.id === 'shop-quick') { e.preventDefault(); HF.act['shop.quickAdd'](); }
  });

  function itemForm(id, preset) {
    var S = HF.state, x = id ? item(id) : null; if (id && !x) return;
    var v = x ? { name: x.name, qty: x.qty, unit: x.unit, price: x.price == null ? '' : x.price, cat: x.cat } : Object.assign({ name: '', qty: 1, unit: 'u', price: '', cat: 'other' }, preset || {});
    HF.openForm({
      title: x ? t('shop.item.edit') : t('shop.item.new'), values: v,
      fields: [
        { name: 'name', label: t('shop.f.name'), required: true, full: true, autofocus: true },
        { name: 'qty', label: t('shop.f.qty'), type: 'number', min: 0 },
        { name: 'unit', label: t('shop.f.unit'), type: 'select', options: HF.UNITS.map(function (u) { return { value: u, label: t('unit.' + u) }; }) },
        { name: 'cat', label: t('c.category'), type: 'select', full: true, options: HF.SHOP_CATS.map(function (c) { return { value: c.id, label: c.icon + ' ' + t('shop.cat.' + c.id) }; }) },
        { name: 'price', label: t('shop.f.price'), type: 'number', min: 0, full: true }
      ],
      onSubmit: function (f) {
        var price = f.price === '' || f.price == null ? null : Math.max(0, Number(f.price) || 0), qty = Number(f.qty) || 1;
        if (x) { x.name = f.name; x.qty = qty; x.unit = f.unit; x.cat = f.cat; x.price = price; delete x.demo; }
        else {
          var ex = S.shopping.filter(function (y) { return !y.bought && y.name.toLowerCase() === f.name.toLowerCase() && y.unit === f.unit; })[0];
          if (ex) { ex.qty = HF.round2((ex.qty || 0) + qty); if (price != null) ex.price = price; delete ex.demo; }
          else S.shopping.push({ id: HF.uid(), name: f.name, qty: qty, unit: f.unit, price: price, cat: f.cat, bought: false });
          var qi = HF.$('#shop-quick'); if (qi) qi.value = '';
        }
        HF.commit();
      },
      onDelete: x ? function () { S.shopping = S.shopping.filter(function (y) { return y.id !== id; }); HF.commit(); } : null
    });
  }

  function finish() {
    var S = HF.state, bought = S.shopping.filter(function (x) { return x.bought; });
    if (!bought.length) { HF.toast(t('shop.finish.none'), { ms: 5000 }); return; }
    var est = HF.round2(itemTotal(bought));
    HF.openForm({
      title: t('shop.finish'), values: { total: est || '', date: HF.today(), expense: true },
      fields: [
        { name: 'total', label: t('shop.finish.total') + ' (' + (S.settings.currency) + ')', type: 'number', min: 0, required: true, autofocus: true },
        { name: 'date', label: t('c.date'), type: 'date', required: true },
        { name: 'expense', label: t('shop.finish.expense'), type: 'checkbox' }
      ],
      submit: t('shop.finish'),
      onSubmit: function (v) {
        var total = Math.max(0, Number(v.total) || 0), date = HF.validDate(v.date) ? v.date : HF.today();
        S.purchases.push({ id: HF.uid(), date: date, total: total, items: bought.map(function (x) { return { name: x.name, qty: x.qty, unit: x.unit, price: x.price, cat: x.cat }; }) });
        S.purchases.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
        if (v.expense && total > 0) S.fin.tx.push({ id: HF.uid(), type: 'expense', cat: 'food', amount: total, date: date, note: t('shop.title') });
        S.shopping = S.shopping.filter(function (x) { return !x.bought; });
        HF.toast(t('shop.finish.done')); HF.commit();
      }
    });
  }

  function listTab() {
    var S = HF.state, items = S.shopping;
    var quick = '<div class="quick-add"><label class="sr" for="shop-quick">' + esc(t('shop.quick')) + '</label><input id="shop-quick" type="text" maxlength="100" placeholder="' + esc(t('shop.quick')) + '" autocomplete="off"><button type="button" class="btn primary" data-act="shop.add">' + HF.icon('plus', 16) + ' ' + esc(t('shop.add')) + '</button></div><p class="muted sm">' + esc(t('shop.quick.hint')) + '</p>';
    if (!items.length) return quick + HF.empty({ illo: 'list', title: t('shop.empty'), text: t('shop.empty.t') });
    var left = items.filter(function (x) { return !x.bought; }).length, boughtN = items.length - left;
    var cur = S.settings.currency, tot = itemTotal(items), cart = itemTotal(items.filter(function (x) { return x.bought; }));
    var head = '<div class="card sum-card"><div><span class="muted sm">' + esc(t('shop.est')) + '</span><strong class="big">' + esc(HF.money(tot, cur)) + '</strong></div><div><span class="muted sm">' + esc(t('shop.inCart')) + '</span><strong>' + esc(HF.money(cart, cur)) + '</strong></div><div class="grow"><span class="muted sm">' + esc(left ? t('shop.left', { n: left }) : t('shop.allDone')) + '</span>' + HF.bar(items.length ? boughtN / items.length * 100 : 0, '', t('shop.inCart')) + '</div></div>';
    var groups = HF.SHOP_CATS.map(function (c) {
      var li = items.filter(function (x) { return (HF.SHOP_CATS.some(function (k) { return k.id === x.cat; }) ? x.cat : 'other') === c.id; });
      if (!li.length) return '';
      li.sort(function (a, b) { return (a.bought ? 1 : 0) - (b.bought ? 1 : 0) || a.name.localeCompare(b.name); });
      return '<section class="sgroup"><h3>' + c.icon + ' ' + esc(t('shop.cat.' + c.id)) + ' <small>' + li.length + '</small></h3><ul class="slist">' + li.map(function (x) {
        return '<li class="sitem' + (x.bought ? ' done' : '') + '"><button type="button" class="chk-btn' + (x.bought ? ' on' : '') + '" data-act="shop.toggle" data-id="' + x.id + '" role="checkbox" aria-checked="' + !!x.bought + '" aria-label="' + esc(t(x.bought ? 'shop.uncheck' : 'shop.check', { n: x.name })) + '">' + (x.bought ? HF.icon('check', 16) : '') + '</button><button type="button" class="sitem-main" data-act="shop.edit" data-id="' + x.id + '"><span class="sname">' + esc(x.name) + '</span><span class="muted sm">' + esc(HF.qtyStr(x.qty, x.unit)) + (x.price != null && x.price !== '' ? ' · ' + esc(HF.money(x.price, cur)) : '') + (x.demo ? ' · ' + esc(t('c.demo')) : '') + '</span></button></li>';
      }).join('') + '</ul></section>';
    }).join('');
    var actions = '<div class="btn-row"><button type="button" class="btn primary" data-act="shop.finish">' + HF.icon('check', 16) + ' ' + esc(t('shop.finish')) + '</button>' +
      (boughtN ? '<button type="button" class="btn" data-act="shop.clearBought">' + esc(t('shop.clear')) + '</button>' : '') +
      '<button type="button" class="btn" data-act="shop.saveList">' + HF.icon('copy', 16) + ' ' + esc(t('shop.saveList')) + '</button><button type="button" class="btn ghost danger" data-act="shop.clearAll">' + esc(t('shop.clearAll')) + '</button></div>';
    return quick + head + '<div class="sgroups">' + groups + '</div>' + actions;
  }
  function listsTab() {
    var S = HF.state;
    if (!S.lists.length) return HF.empty({ illo: 'list', title: t('shop.lists.empty'), text: t('shop.lists.empty.t') });
    return '<div class="cards">' + S.lists.map(function (l) {
      return '<article class="card"><h3>' + esc(l.name) + (l.demo ? ' ' + HF.chip(t('c.demo'), 'demo') : '') + '</h3><p class="muted sm">' + esc(t('shop.hist.items', { n: l.items.length })) + '</p><p class="sm clip">' + esc(l.items.slice(0, 6).map(function (i) { return i.name; }).join(', ')) + (l.items.length > 6 ? '…' : '') + '</p><div class="btn-row"><button type="button" class="btn sm primary" data-act="shop.listLoad" data-id="' + l.id + '">' + esc(t('shop.lists.load')) + '</button><button type="button" class="icon-btn" data-act="shop.listDel" data-id="' + l.id + '" aria-label="' + esc(t('c.delete') + ' ' + l.name) + '">' + HF.icon('trash', 18) + '</button></div></article>';
    }).join('') + '</div>';
  }
  function historyTab() {
    var S = HF.state, cur = S.settings.currency;
    if (!S.purchases.length) return HF.empty({ illo: 'wallet', title: t('shop.hist.empty'), text: t('shop.hist.empty.t') });
    return '<div class="cards">' + S.purchases.map(function (p) {
      return '<article class="card"><h3>' + esc(HF.fmtDate(p.date, { day: 'numeric', month: 'long', year: 'numeric' })) + (p.demo ? ' ' + HF.chip(t('c.demo'), 'demo') : '') + '</h3><p><strong>' + esc(HF.money(p.total, cur)) + '</strong> <span class="muted sm">· ' + esc(t('shop.hist.items', { n: p.items.length })) + '</span></p><p class="sm clip">' + esc(p.items.slice(0, 6).map(function (i) { return i.name; }).join(', ')) + (p.items.length > 6 ? '…' : '') + '</p><div class="btn-row"><button type="button" class="btn sm primary" data-act="shop.repeat" data-id="' + p.id + '">' + HF.icon('repeat', 16) + ' ' + esc(t('shop.hist.repeat')) + '</button><button type="button" class="icon-btn" data-act="shop.purchDel" data-id="' + p.id + '" aria-label="' + esc(t('shop.hist.del')) + '">' + HF.icon('trash', 18) + '</button></div></article>';
    }).join('') + '</div>';
  }

  HF.views.shopping = {
    render: function (root) {
      var u = U(), tabs = ['list', 'lists', 'history'].map(function (k) { return '<button type="button" role="tab" class="tab' + (u.tab === k ? ' on' : '') + '" aria-selected="' + (u.tab === k) + '" data-act="shop.tab" data-tab="' + k + '">' + esc(t('shop.tab.' + k)) + '</button>'; }).join('');
      HF.state.shopping.forEach(function (x) { if (x.cat === 'dairy' && HF.isEggName(x.name)) x.cat = 'meat'; });
      var keep = HF.$('#shop-quick'), had = keep ? keep.value : '';
      root.innerHTML = '<div class="page-h"><h1>' + esc(t('shop.title')) + '</h1></div><div class="tabs" role="tablist">' + tabs + '</div>' + (u.tab === 'list' ? listTab() : u.tab === 'lists' ? listsTab() : historyTab());
      var nq = HF.$('#shop-quick'); if (nq && had) nq.value = had;
    }
  };
})();
