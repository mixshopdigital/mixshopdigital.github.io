/* HomeFlow 360 — UI toolkit: icons, illustrations, modal/forms, toasts, widgets, events */
(function () {
  'use strict';
  var HF = window.HF, esc = HF.esc, t = HF.t;

  /* ---------- icons (inline SVG, no external files) ---------- */
  var IC = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-6h4v6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    bowl: '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M8 7c0-1.5 1-2 1-3M12 7c0-1.5 1-2 1-3M16 7c0-1.5 1-2 1-3"/>',
    cart: '<path d="M3 4h2l2.4 11h9.7l2-8H6.2"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18"/><circle cx="16.5" cy="15" r="1"/>',
    box: '<path d="m3 8 9-5 9 5v8l-9 5-9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.5 2.5-2.2-.5-.5-2.2z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4.5 1.7 4.5 4.5"/>',
    file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>',
    edit: '<path d="M4 20h4l11-11-4-4L4 16z"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    chevL: '<path d="m15 5-7 7 7 7"/>', chevR: '<path d="m9 5 7 7-7 7"/>', chevD: '<path d="m5 9 7 7 7-7"/>',
    star: '<path d="m12 3 2.7 6 6.3.6-4.8 4.2 1.5 6.2L12 16.7 6.3 20l1.5-6.2L3 9.6 9.3 9z"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
    sparkle: '<path d="m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
    leaf: '<path d="M5 19c0-8 5-14 15-14 0 9-5 15-13 15"/><path d="m5 19 8-8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
    camera: '<rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13.5" r="3.5"/><path d="m8 7 1.5-3h5L16 7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    layout: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 10h18M10 10v10"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    shield: '<path d="m12 3 8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    repeat: '<path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/>',
    shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
    trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 21h8"/>'
  };
  HF.icon = function (n, s) {
    s = s || 22;
    return '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (IC[n] || '') + '</svg>';
  };

  /* ---------- original illustrations ---------- */
  HF.illo = {
    house: '<svg viewBox="0 0 200 160" class="illo" aria-hidden="true"><ellipse cx="100" cy="148" rx="82" ry="9" class="i-a"/><path d="M28 82 100 24l72 58z" class="i-b"/><rect x="134" y="34" width="14" height="28" rx="3" class="i-b2"/><rect x="44" y="80" width="112" height="68" rx="8" class="i-c"/><rect x="89" y="104" width="26" height="44" rx="13" class="i-e"/><rect x="56" y="94" width="26" height="26" rx="6" class="i-d"/><rect x="122" y="94" width="26" height="26" rx="6" class="i-d"/><path d="M69 94v26M56 107h26" class="i-ln"/><path d="M135 94v26M122 107h26" class="i-ln"/><circle cx="108" cy="127" r="2" class="i-c"/><g transform="translate(168 118)"><path d="M-8 30h16l-3-14h-10z" class="i-b"/><path d="M0 16C-8 8-8-4 0-10c8 6 8 18 0 26z" class="i-g"/><path d="M0 16C-12 12-16 4-14-4c10 0 16 8 14 20z" class="i-a2"/></g></svg>',
    plant: '<svg viewBox="0 0 160 140" class="illo" aria-hidden="true"><ellipse cx="80" cy="130" rx="52" ry="7" class="i-a"/><path d="M52 98h56l-8 32H60z" class="i-b"/><rect x="48" y="90" width="64" height="12" rx="5" class="i-b2"/><path d="M80 90C60 70 60 40 80 18c20 22 20 52 0 72z" class="i-g"/><path d="M80 92C56 88 40 70 42 48c24 2 42 20 38 44z" class="i-a2"/><path d="M80 92c24-4 40-22 38-44-24 2-42 20-38 44z" class="i-g"/><path d="M80 90V40" class="i-ln"/></svg>',
    list: '<svg viewBox="0 0 160 140" class="illo" aria-hidden="true"><ellipse cx="80" cy="130" rx="52" ry="7" class="i-a"/><rect x="38" y="14" width="84" height="108" rx="12" class="i-c"/><rect x="62" y="8" width="36" height="16" rx="8" class="i-e"/><circle cx="58" cy="52" r="7" class="i-d"/><path d="m54.5 52 3 3 5-6" class="i-ln"/><path d="M74 52h34" class="i-ln"/><circle cx="58" cy="78" r="7" class="i-d"/><path d="m54.5 78 3 3 5-6" class="i-ln"/><path d="M74 78h26" class="i-ln"/><circle cx="58" cy="104" r="7" class="i-b2"/><path d="M74 104h30" class="i-ln"/></svg>',
    pot: '<svg viewBox="0 0 160 140" class="illo" aria-hidden="true"><ellipse cx="80" cy="130" rx="52" ry="7" class="i-a"/><path d="M30 62h100v24a30 30 0 0 1-30 30H60a30 30 0 0 1-30-30z" class="i-b"/><rect x="24" y="54" width="112" height="12" rx="6" class="i-b2"/><path d="M130 76h18v10h-18M10 76h18" class="i-ln"/><path d="M60 40c0-8 8-10 8-18M82 40c0-8 8-10 8-18M104 40c0-8 8-10 8-18" class="i-ln"/></svg>',
    wallet: '<svg viewBox="0 0 160 140" class="illo" aria-hidden="true"><ellipse cx="80" cy="130" rx="52" ry="7" class="i-a"/><rect x="26" y="38" width="108" height="78" rx="14" class="i-g"/><rect x="26" y="30" width="96" height="30" rx="12" class="i-c"/><rect x="92" y="68" width="48" height="30" rx="12" class="i-b"/><circle cx="108" cy="83" r="5" class="i-c"/><path d="M42 44h40" class="i-ln"/></svg>'
  };
  HF.empty = function (o) {
    return '<div class="empty">' + (HF.illo[o.illo || 'plant']) + '<h3>' + esc(o.title) + '</h3>' + (o.text ? '<p>' + esc(o.text) + '</p>' : '') +
      '<div class="empty-actions">' + (o.actions || '') + '</div></div>';
  };

  /* ---------- small widgets ---------- */
  HF.ring = function (pct, big, small, size) {
    pct = Math.max(0, Math.min(100, Math.round(pct || 0))); size = size || 112;
    var c = 2 * Math.PI * 42;
    return '<div class="ringw" style="width:' + size + 'px;height:' + size + 'px"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" class="ring-bg"/><circle cx="50" cy="50" r="42" class="ring-fg" stroke-dasharray="' + (c * pct / 100).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 50 50)"/></svg><div class="ring-t"><strong>' + esc(big) + '</strong>' + (small ? '<span>' + esc(small) + '</span>' : '') + '</div></div>';
  };
  HF.bar = function (pct, cls, label) {
    pct = Math.max(0, Math.min(100, pct || 0));
    return '<div class="bar ' + (cls || '') + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(pct) + '"' + (label ? ' aria-label="' + esc(label) + '"' : '') + '><i style="width:' + pct + '%"></i></div>';
  };
  HF.DONUT = ['#4a7557', '#e9846c', '#8d7fd1', '#d9a82e', '#5f9ed1', '#d173a2', '#8aa05a', '#c98b5a', '#6fae9c', '#a0a8b0'];
  HF.donut = function (items, centerBig, centerSmall) {
    var total = HF.sum(items, function (i) { return i.value; });
    var r = 40, c = 2 * Math.PI * r, off = 0, segs = '';
    if (total > 0) {
      items.forEach(function (i) {
        var len = c * i.value / total;
        segs += '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="' + i.color + '" stroke-width="16" stroke-dasharray="' + len.toFixed(2) + ' ' + (c - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 50 50)"/>';
        off += len;
      });
    } else { segs = '<circle cx="50" cy="50" r="' + r + '" fill="none" class="ring-bg" stroke-width="16"/>'; }
    return '<div class="donut"><svg viewBox="0 0 100 100" role="img" aria-label="' + esc(items.map(function (i) { return i.label + ' ' + HF.money(i.value); }).join(', ')) + '">' + segs + '</svg><div class="ring-t"><strong>' + esc(centerBig || '') + '</strong><span>' + esc(centerSmall || '') + '</span></div></div>';
  };
  HF.avatar = function (m, size) {
    if (!m) return '<span class="av av-none" style="--c:#9aa5a0" aria-hidden="true">·</span>';
    return '<span class="av" style="--c:' + m.color + ';' + (size ? 'width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.55) + 'px' : '') + '" aria-hidden="true">' + esc(m.avatar || '🙂') + '</span>';
  };
  HF.chip = function (txt, cls, icon) { return '<span class="chip ' + (cls || '') + '">' + (icon ? icon + ' ' : '') + esc(txt) + '</span>'; };
  HF.dueChip = function (iso) {
    if (!iso) return '';
    var d = HF.diffDays(iso, HF.today()), cls = d < 0 ? 'bad' : d === 0 ? 'warn' : '';
    return HF.chip(d < 0 ? t('c.overdue') + ' · ' + HF.fmtDate(iso) : HF.relDay(iso), cls, HF.icon('clock', 13));
  };
  HF.statusDays = function (days) {
    return days < 0 ? t('c.daysAgo', { n: -days }) : days === 0 ? t('c.today') : days === 1 ? t('c.tomorrow') : t('c.inDays', { n: days });
  };

  /* ---------- theme ---------- */
  HF.applyTheme = function () {
    var th = HF.state ? HF.state.settings.theme : 'auto', dark = th === 'dark' || (th === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', dark ? '#1b221e' : '#4a7557');
  };
  if (window.matchMedia) { try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { if (HF.state && HF.state.settings.theme === 'auto') HF.applyTheme(); }); } catch (e) { /* old Safari */ } }

  /* ---------- toast ---------- */
  HF.toast = function (msg, o) {
    o = o || {};
    var root = document.getElementById('toast-root'); if (!root) return;
    var el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = '<span>' + esc(msg) + '</span>' + (o.action ? '<button type="button" class="btn sm">' + esc(o.action.label) + '</button>' : '');
    if (o.action) el.querySelector('button').addEventListener('click', function () { o.action.fn(); el.remove(); });
    root.appendChild(el);
    setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 300); }, o.ms || 4200);
  };

  /* ---------- modal ---------- */
  var stack = [];
  function focusables(el) {
    return HF.$$('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', el).filter(function (x) { return x.offsetParent !== null; });
  }
  HF.modal = function (o) {
    var id = 'mt' + HF.uid();
    var back = document.createElement('div'); back.className = 'mback';
    back.innerHTML = '<div class="modal' + (o.wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-labelledby="' + id + '"><div class="mhead"><h2 id="' + id + '">' + esc(o.title || '') + '</h2><button type="button" class="icon-btn" data-mclose aria-label="' + esc(t('c.close')) + '">' + HF.icon('x', 20) + '</button></div><div class="mbody">' + (o.body || '') + '</div>' + (o.foot ? '<div class="mfoot">' + o.foot + '</div>' : '') + '</div>';
    var prev = document.activeElement;
    document.getElementById('modal-root').appendChild(back);
    document.body.classList.add('modal-open');
    var ctl = { el: back, body: back.querySelector('.mbody'), box: back.querySelector('.modal') };
    ctl.close = function (result) {
      if (ctl.closed) return; ctl.closed = true;
      stack = stack.filter(function (x) { return x !== ctl; });
      back.remove();
      if (!stack.length) document.body.classList.remove('modal-open');
      if (prev && prev.focus && document.contains(prev)) { try { prev.focus(); } catch (e) { /* noop */ } }
      if (o.onClose) o.onClose(result);
    };
    back.addEventListener('mousedown', function (e) { if (e.target === back && !o.persistent) ctl.close(); });
    back.querySelector('[data-mclose]').addEventListener('click', function () { ctl.close(); });
    stack.push(ctl);
    HF.hydratePhotos(back);
    setTimeout(function () {
      var f = back.querySelector('[autofocus]') || back.querySelector('input:not([type=hidden]):not([type=radio]):not([type=checkbox]):not([type=file]),select,textarea') || back.querySelector('.mfoot .btn') || back.querySelector('[data-mclose]');
      if (f) f.focus();
    }, 30);
    return ctl;
  };
  document.addEventListener('keydown', function (e) {
    if (!stack.length) return;
    var top = stack[stack.length - 1];
    if (e.key === 'Escape') { e.preventDefault(); top.close(); }
    else if (e.key === 'Tab') {
      var f = focusables(top.box); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!top.box.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  });
  HF.closeAllModals = function () { stack.slice().forEach(function (m) { m.close(); }); };

  HF.confirm = function (o) {
    return new Promise(function (res) {
      var done = false;
      var ctl = HF.modal({
        title: o.title || t('c.confirm'), persistent: false,
        body: '<p class="confirm-text">' + esc(o.text || '') + '</p>' + (o.extra || ''),
        foot: '<button type="button" class="btn ghost" data-no>' + esc(o.cancel || t('c.cancel')) + '</button><button type="button" class="btn ' + (o.danger ? 'danger' : 'primary') + '" data-yes>' + esc(o.ok || t('c.ok')) + '</button>',
        onClose: function () { if (!done) { done = true; res(false); } }
      });
      ctl.el.querySelector('[data-no]').addEventListener('click', function () { ctl.close(); });
      ctl.el.querySelector('[data-yes]').addEventListener('click', function () { done = true; ctl.close(); res(true); });
      setTimeout(function () { var n = ctl.el.querySelector('[data-no]'); if (n) n.focus(); }, 40);
    });
  };

  /* ---------- forms ---------- */
  function fieldHtml(f, v) {
    var val = v[f.name] == null ? (f.def == null ? '' : f.def) : v[f.name], id = 'f_' + f.name + '_' + HF.uid().slice(-4);
    var req = f.required ? ' required aria-required="true"' : '';
    var lab = esc(f.label) + (f.required ? ' <b class="req" aria-hidden="true">*</b>' : '');
    var hint = f.hint ? '<small class="hint">' + esc(f.hint) + '</small>' : '';
    var err = '<small class="ferr" role="alert" hidden>' + esc(t('c.required')) + '</small>';
    switch (f.type) {
      case 'textarea':
        return '<label class="fld' + (f.full === false ? '' : ' full') + '"><span>' + lab + '</span><textarea name="' + f.name + '" rows="' + (f.rows || 3) + '"' + req + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>' + esc(val) + '</textarea>' + hint + err + '</label>';
      case 'select':
        return '<label class="fld' + (f.full ? ' full' : '') + '"><span>' + lab + '</span><select name="' + f.name + '"' + req + '>' + f.options.map(function (o) {
          if (o.group) return '<optgroup label="' + esc(o.group) + '">' + o.items.map(function (i) { return '<option value="' + esc(i.value) + '"' + (String(i.value) === String(val) ? ' selected' : '') + '>' + esc(i.label) + '</option>'; }).join('') + '</optgroup>';
          return '<option value="' + esc(o.value) + '"' + (String(o.value) === String(val) ? ' selected' : '') + '>' + esc(o.label) + '</option>';
        }).join('') + '</select>' + hint + err + '</label>';
      case 'checkbox':
        return '<label class="chk full"><input type="checkbox" name="' + f.name + '"' + (val ? ' checked' : '') + '><span>' + esc(f.label) + '</span></label>';
      case 'swatch':
      case 'choice':
        return '<fieldset class="fld full pick"><legend>' + lab + '</legend><div class="pick-row">' + f.options.map(function (o, i) {
          var chk = String(o.value) === String(val) || (val === '' && i === 0);
          return '<label class="pk ' + f.type + '"><input type="radio" name="' + f.name + '" value="' + esc(o.value) + '"' + (chk ? ' checked' : '') + '><span' + (f.type === 'swatch' ? ' style="background:' + o.value + '"' : '') + ' title="' + esc(o.label || '') + '"' + (o.label ? ' aria-label="' + esc(o.label) + '"' : '') + '>' + (f.type === 'choice' ? esc(o.label) : '') + '</span></label>';
        }).join('') + '</div></fieldset>';
      case 'weekdays':
        var ws = HF.state.settings.weekStart || 0, sel = Array.isArray(val) ? val : [];
        return '<fieldset class="fld full pick" data-wd-box><legend>' + lab + '</legend><div class="pick-row">' + [0, 1, 2, 3, 4, 5, 6].map(function (i) {
          var d = (ws + i) % 7;
          return '<label class="pk choice"><input type="checkbox" name="' + f.name + '" value="' + d + '"' + (sel.indexOf(d) >= 0 ? ' checked' : '') + '><span>' + esc(HF.weekdayName(HF.addDays('2024-01-07', d), 'short')) + '</span></label>';
        }).join('') + '</div>' + hint + '</fieldset>';
      case 'photo':
        return '<div class="fld full photo-fld" data-photo-field="' + f.name + '"><span>' + esc(f.label) + '</span><div class="photo-row"><img alt="" data-photo="' + esc(val || '') + '" ' + (val ? '' : 'hidden') + '><label class="btn sm ghost">' + HF.icon('camera', 16) + ' ' + esc(t('c.pickPhoto')) + '<input type="file" accept="image/*" class="sr"></label><button type="button" class="btn sm ghost" data-photo-rm ' + (val ? '' : 'hidden') + '>' + esc(t('c.removePhoto')) + '</button></div>' + hint + '</div>';
      case 'note':
        return '<p class="fnote full">' + esc(f.label) + '</p>';
      default:
        return '<label class="fld' + (f.full ? ' full' : '') + '"><span>' + lab + '</span><input id="' + id + '" type="' + (f.type || 'text') + '" name="' + f.name + '" value="' + esc(val) + '"' + req +
          (f.type === 'number' ? ' step="' + (f.step || 'any') + '"' + (f.min != null ? ' min="' + f.min + '"' : '') + ' inputmode="decimal"' : '') +
          (f.list ? ' list="' + f.list + '"' : '') + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + (f.maxlength ? ' maxlength="' + f.maxlength + '"' : ' maxlength="200"') + (f.autofocus ? ' autofocus' : '') + '>' + hint + err + '</label>';
    }
  }
  HF.openForm = function (cfg) {
    var v = cfg.values || {}, pend = {};
    var body = '<form class="form" novalidate autocomplete="off"><div class="fgrid">' + cfg.fields.map(function (f) { return fieldHtml(f, v); }).join('') + '</div><button type="submit" class="sr" tabindex="-1">ok</button></form>';
    var foot = (cfg.onDelete ? '<button type="button" class="btn danger ghost" data-del>' + HF.icon('trash', 16) + ' ' + esc(t('c.delete')) + '</button><span class="grow"></span>' : '') +
      '<button type="button" class="btn ghost" data-cancel>' + esc(t('c.cancel')) + '</button><button type="button" class="btn primary" data-save>' + esc(cfg.submit || t('c.save')) + '</button>';
    var ctl = HF.modal({ title: cfg.title, body: body, foot: foot, wide: cfg.wide });
    var form = ctl.el.querySelector('form');
    // photo handling
    HF.$$('[data-photo-field]', form).forEach(function (box) {
      var name = box.getAttribute('data-photo-field'), img = box.querySelector('img'), file = box.querySelector('input[type=file]'), rm = box.querySelector('[data-photo-rm]');
      pend[name] = { id: v[name] || null, pending: null, removed: false };
      file.addEventListener('change', function () {
        var f = file.files && file.files[0]; if (!f) return;
        HF.imageToDataURL(f, 900, 0.72).then(function (u) { pend[name].pending = u; pend[name].removed = false; img.src = u; img.hidden = false; rm.hidden = false; })
          .catch(function () { HF.toast(t('inv.badImage')); });
      });
      rm.addEventListener('click', function () { pend[name].pending = null; pend[name].removed = true; img.hidden = true; img.removeAttribute('src'); rm.hidden = true; file.value = ''; });
    });
    function collect() {
      var out = {}, ok = true, firstBad = null;
      cfg.fields.forEach(function (f) {
        if (f.type === 'note') return;
        if (f.type === 'photo') { out[f.name] = pend[f.name]; return; }
        if (f.type === 'weekdays') { out[f.name] = HF.$$('input[name="' + f.name + '"]:checked', form).map(function (i) { return +i.value; }); return; }
        var el = form.elements[f.name], val;
        if (f.type === 'checkbox') { val = !!(el && el.checked); }
        else if (f.type === 'swatch' || f.type === 'choice') { var c = form.querySelector('input[name="' + f.name + '"]:checked'); val = c ? c.value : ''; }
        else {
          val = el ? el.value : '';
          if (f.type === 'number') val = val === '' ? null : parseFloat(val);
          else if (typeof val === 'string') val = val.trim();
        }
        out[f.name] = val;
        if (f.required && (val === '' || val == null || (typeof val === 'number' && isNaN(val)))) {
          ok = false; var lab = el && el.closest ? el.closest('.fld') : null;
          if (lab) { var er = lab.querySelector('.ferr'); if (er) er.hidden = false; }
          if (el && el.setAttribute) el.setAttribute('aria-invalid', 'true');
          if (!firstBad) firstBad = el;
        } else if (el && el.removeAttribute && f.type !== 'checkbox') { el.removeAttribute('aria-invalid'); }
      });
      if (!ok && firstBad && firstBad.focus) firstBad.focus();
      return ok ? out : null;
    }
    function submit() {
      var vals = collect(); if (!vals) return;
      var r = cfg.onSubmit(vals, ctl);
      if (r && typeof r.then === 'function') r.then(function (x) { if (x !== false) ctl.close(); });
      else if (r !== false) ctl.close();
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    ctl.el.querySelector('[data-save]').addEventListener('click', submit);
    ctl.el.querySelector('[data-cancel]').addEventListener('click', function () { ctl.close(); });
    if (cfg.onDelete) ctl.el.querySelector('[data-del]').addEventListener('click', function () {
      HF.confirm({ title: t('c.delete'), text: cfg.deleteText || t('c.deleteAsk'), ok: t('c.delete'), danger: true }).then(function (y) { if (y) { cfg.onDelete(ctl); ctl.close(); } });
    });
    if (cfg.onOpen) cfg.onOpen(ctl, form);
    return ctl;
  };
  HF.savePhotoField = function (p, oldId) {
    if (!p) return oldId || null;
    if (p.removed) { if (oldId) HF.photos.del(oldId); return null; }
    if (p.pending) { var id = oldId || ('p' + HF.uid()); HF.photos.put(id, p.pending); return id; }
    return oldId || null;
  };
  HF.addDict({
    'c.deleteAsk': ['¿Eliminar este elemento? No se puede deshacer.', 'Delete this item? This cannot be undone.', 'Excluir este item? Não é possível desfazer.'],
    'inv.badImage': ['No se pudo usar esa imagen', 'That image could not be used', 'Não foi possível usar essa imagem']
  });

  /* ---------- delegated events ---------- */
  HF.act = {}; HF.chg = {}; HF.inp = {};
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null; if (!el) return;
    var fn = HF.act[el.getAttribute('data-act')]; if (fn) { fn(el, e); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target.closest ? e.target.closest('[data-chg]') : null; if (!el) return;
    var fn = HF.chg[el.getAttribute('data-chg')]; if (fn) fn(el, e);
  });
  document.addEventListener('input', function (e) {
    var el = e.target.closest ? e.target.closest('[data-inp]') : null; if (!el) return;
    var fn = HF.inp[el.getAttribute('data-inp')]; if (fn) fn(el, e);
  });

  /* views registry + refresh (router filled in app.js) */
  HF.views = {};
  HF.refresh = function () { /* replaced in app.js */ };
  HF.commit = function () { HF.save(); HF.refresh(); };
  HF.go = function (view, arg) { if (HF.navigate) HF.navigate(view, arg); };

  HF.ui = { cal: null }; // transient UI state
})();
