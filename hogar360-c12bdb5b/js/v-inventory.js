/* HomeFlow 360 — Home inventory */
(function () {
  'use strict';
  var HF = window.HF, t = HF.t, esc = HF.esc;

  HF.INV_CATS = [
    { id: 'appliance', icon: '🔌' }, { id: 'furniture', icon: '🛋️' }, { id: 'electronics', icon: '💻' }, { id: 'tools', icon: '🧰' },
    { id: 'kitchen', icon: '🍴' }, { id: 'decor', icon: '🖼️' }, { id: 'toys', icon: '🧸' }, { id: 'other', icon: '📦' }
  ];
  HF.addDict({
    'inv.title': ['Inventario del hogar', 'Home inventory', 'Inventário da casa'],
    'inv.cat.appliance': ['Electrodomésticos', 'Appliances', 'Eletrodomésticos'], 'inv.cat.furniture': ['Muebles', 'Furniture', 'Móveis'], 'inv.cat.electronics': ['Electrónica', 'Electronics', 'Eletrônicos'],
    'inv.cat.tools': ['Herramientas', 'Tools', 'Ferramentas'], 'inv.cat.kitchen': ['Cocina', 'Kitchen', 'Cozinha'], 'inv.cat.decor': ['Decoración', 'Decor', 'Decoração'], 'inv.cat.toys': ['Juguetes', 'Toys', 'Brinquedos'], 'inv.cat.other': ['Otros', 'Other', 'Outros'],
    'inv.add': ['Agregar objeto', 'Add item', 'Adicionar item'], 'inv.edit': ['Editar objeto', 'Edit item', 'Editar item'],
    'inv.search': ['Buscar en el inventario', 'Search inventory', 'Buscar no inventário'],
    'inv.f.name': ['Nombre del objeto', 'Item name', 'Nome do item'], 'inv.f.bought': ['Fecha de compra', 'Purchase date', 'Data da compra'], 'inv.f.price': ['Valor / precio', 'Value / price', 'Valor / preço'],
    'inv.f.warranty': ['Garantía hasta', 'Warranty until', 'Garantia até'], 'inv.f.maint': ['Próximo mantenimiento', 'Next maintenance', 'Próxima manutenção'], 'inv.f.notes': ['Notas (modelo, tienda, ubicación…)', 'Notes (model, store, location…)', 'Notas (modelo, loja, local…)'],
    'inv.f.photo': ['Foto (opcional)', 'Photo (optional)', 'Foto (opcional)'],
    'inv.empty': ['Tu inventario está vacío', 'Your inventory is empty', 'Seu inventário está vazio'],
    'inv.empty.t': ['Registra electrodomésticos, muebles y objetos importantes con su garantía y una foto.', 'Record appliances, furniture and important items with their warranty and a photo.', 'Registre eletrodomésticos, móveis e itens importantes com garantia e foto.'],
    'inv.total': ['Valor registrado', 'Recorded value', 'Valor registrado'], 'inv.count': ['{n} objetos', '{n} items', '{n} itens'],
    'inv.warr.ok': ['Garantía vigente · {d}', 'In warranty · {d}', 'Garantia vigente · {d}'], 'inv.warr.soon': ['Garantía vence pronto · {d}', 'Warranty ends soon · {d}', 'Garantia vence em breve · {d}'], 'inv.warr.end': ['Garantía vencida · {d}', 'Warranty expired · {d}', 'Garantia vencida · {d}'],
    'inv.maint': ['Mantenimiento: {d}', 'Maintenance: {d}', 'Manutenção: {d}'], 'inv.sort.name': ['Nombre', 'Name', 'Nome'], 'inv.sort.warranty': ['Garantía', 'Warranty', 'Garantia'],
    'inv.none': ['Nada coincide con tu búsqueda.', 'Nothing matches your search.', 'Nada corresponde à sua busca.'], 'inv.photoNote': ['Las fotos se guardan solo en este dispositivo y se reducen para ahorrar espacio.', 'Photos stay on this device only and are shrunk to save space.', 'As fotos ficam só neste dispositivo e são reduzidas para economizar espaço.']
  });

  HF.ui.inv = { q: '', cat: '', sort: 'name' };
  var U = function () { return HF.ui.inv; };

  HF.invForm = function (id) {
    var S = HF.state, x = id ? S.inventory.filter(function (y) { return y.id === id; })[0] : null;
    HF.openForm({
      title: x ? t('inv.edit') : t('inv.add'), wide: true,
      values: x ? { name: x.name, cat: x.cat, purchaseDate: x.purchaseDate, price: x.price == null ? '' : x.price, warrantyEnd: x.warrantyEnd, nextMaint: x.nextMaint, notes: x.notes, photo: x.photo } : { cat: 'appliance', purchaseDate: HF.today() },
      fields: [
        { name: 'name', label: t('inv.f.name'), required: true, full: true, autofocus: true },
        { name: 'cat', label: t('c.category'), type: 'select', options: HF.INV_CATS.map(function (c) { return { value: c.id, label: c.icon + ' ' + t('inv.cat.' + c.id) }; }) },
        { name: 'price', label: t('inv.f.price') + ' (' + S.settings.currency + ')', type: 'number', min: 0 },
        { name: 'purchaseDate', label: t('inv.f.bought'), type: 'date' },
        { name: 'warrantyEnd', label: t('inv.f.warranty'), type: 'date' },
        { name: 'nextMaint', label: t('inv.f.maint'), type: 'date', full: true },
        { name: 'notes', label: t('inv.f.notes'), type: 'textarea', rows: 2 },
        { name: 'photo', label: t('inv.f.photo'), type: 'photo', hint: t('inv.photoNote') }
      ],
      onSubmit: function (v) {
        var rec = { name: v.name, cat: v.cat, price: v.price === '' || v.price == null ? null : Math.max(0, Number(v.price) || 0), purchaseDate: v.purchaseDate || '', warrantyEnd: v.warrantyEnd || '', nextMaint: v.nextMaint || '', notes: v.notes || '' };
        var photo = HF.savePhotoField(v.photo, x ? x.photo : null);
        if (x) { Object.keys(rec).forEach(function (k) { x[k] = rec[k]; }); x.photo = photo; delete x.demo; }
        else { rec.id = HF.uid(); rec.photo = photo; S.inventory.push(rec); }
        HF.commit();
      },
      onDelete: x ? function () { if (x.photo) HF.photos.del(x.photo); S.inventory = S.inventory.filter(function (y) { return y.id !== id; }); HF.commit(); } : null
    });
  };

  HF.act['inv.new'] = function () { HF.invForm(null); };
  HF.act['inv.open'] = function (el) { HF.invForm(el.getAttribute('data-id')); };
  HF.act['inv.cat'] = function (el) { U().cat = el.getAttribute('data-c'); HF.refresh(); };
  HF.chg['inv.sort'] = function (el) { U().sort = el.value; HF.refresh(); };
  HF.inp['inv.search'] = function (el) { U().q = el.value; var b = HF.$('#inv-list'); if (b) { b.innerHTML = cards(); HF.hydratePhotos(b); } };

  function warr(x) {
    if (!x.warrantyEnd) return '';
    var d = HF.diffDays(x.warrantyEnd, HF.today()), dt = HF.fmtDate(x.warrantyEnd, { day: 'numeric', month: 'short', year: 'numeric' });
    return d < 0 ? HF.chip(t('inv.warr.end', { d: dt }), 'bad') : d <= 60 ? HF.chip(t('inv.warr.soon', { d: dt }), 'warn') : HF.chip(t('inv.warr.ok', { d: dt }), 'ok');
  }
  function cards() {
    var u = U(), q = u.q.trim().toLowerCase(), cur = HF.state.settings.currency;
    var list = HF.state.inventory.filter(function (x) { return (!u.cat || x.cat === u.cat) && (!q || x.name.toLowerCase().indexOf(q) >= 0 || (x.notes || '').toLowerCase().indexOf(q) >= 0); });
    list.sort(function (a, b) { return u.sort === 'warranty' ? ((a.warrantyEnd || '9999') < (b.warrantyEnd || '9999') ? -1 : 1) : a.name.localeCompare(b.name); });
    if (!list.length) return '<p class="muted">' + esc(t('inv.none')) + '</p>';
    return '<div class="cards">' + list.map(function (x) {
      var c = HF.catOf(HF.INV_CATS, x.cat);
      return '<button type="button" class="card icard" data-act="inv.open" data-id="' + x.id + '" aria-label="' + esc(x.name) + '"><span class="icard-img">' + (x.photo ? '<img alt="" data-photo="' + esc(x.photo) + '" hidden>' : '') + '<span class="icard-ico" aria-hidden="true">' + c.icon + '</span></span><strong>' + esc(x.name) + (x.demo ? ' ' + HF.chip(t('c.demo'), 'demo') : '') + '</strong><span class="muted sm">' + esc(t('inv.cat.' + c.id)) + (x.price != null && x.price !== '' ? ' · ' + esc(HF.money(x.price, cur)) : '') + '</span><span class="chips">' + warr(x) + (x.nextMaint ? HF.chip(t('inv.maint', { d: HF.fmtDate(x.nextMaint) }), HF.diffDays(x.nextMaint, HF.today()) < 0 ? 'bad' : '') : '') + '</span></button>';
    }).join('') + '</div>';
  }

  HF.views.inventory = {
    render: function (root) {
      var S = HF.state, u = U(), cur = S.settings.currency;
      var total = HF.sum(S.inventory, function (x) { return Number(x.price) || 0; });
      var chips = '<button type="button" class="chip btn-chip' + (!u.cat ? ' chosen' : '') + '" data-act="inv.cat" data-c="">' + esc(t('c.all')) + '</button>' + HF.INV_CATS.map(function (c) { return '<button type="button" class="chip btn-chip' + (u.cat === c.id ? ' chosen' : '') + '" data-act="inv.cat" data-c="' + c.id + '">' + c.icon + ' ' + esc(t('inv.cat.' + c.id)) + '</button>'; }).join('');
      var body = S.inventory.length ? '<div class="toolbar"><label class="search"><span class="sr">' + esc(t('inv.search')) + '</span>' + HF.icon('search', 18) + '<input type="search" value="' + esc(u.q) + '" placeholder="' + esc(t('inv.search')) + '" data-inp="inv.search" aria-label="' + esc(t('inv.search')) + '"></label><label class="inline-sel"><span class="sr">Sort</span><select data-chg="inv.sort"><option value="name"' + (u.sort === 'name' ? ' selected' : '') + '>' + esc(t('inv.sort.name')) + '</option><option value="warranty"' + (u.sort === 'warranty' ? ' selected' : '') + '>' + esc(t('inv.sort.warranty')) + '</option></select></label></div><div class="chips-wrap">' + chips + '</div><p class="muted sm">' + esc(t('inv.count', { n: S.inventory.length })) + ' · ' + esc(t('inv.total')) + ': ' + esc(HF.money(total, cur)) + '</p><div id="inv-list">' + cards() + '</div>'
        : HF.empty({ illo: 'house', title: t('inv.empty'), text: t('inv.empty.t'), actions: '<button type="button" class="btn primary" data-act="inv.new">' + HF.icon('plus', 16) + ' ' + esc(t('inv.add')) + '</button>' });
      root.innerHTML = '<div class="page-h"><h1>' + esc(t('inv.title')) + '</h1><button type="button" class="btn primary" data-act="inv.new">' + HF.icon('plus', 16) + ' ' + esc(t('inv.add')) + '</button></div>' + body;
      HF.hydratePhotos(root);
    }
  };
})();
