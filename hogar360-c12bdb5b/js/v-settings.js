/* HomeFlow 360 — Settings, backup & privacy */
(function () {
  'use strict';
  var HF = window.HF, t = HF.t, esc = HF.esc;

  HF.addDict({
    'set.title': ['Ajustes', 'Settings', 'Configurações'],
    'set.general': ['General', 'General', 'Geral'], 'set.homeName': ['Nombre del hogar', 'Home name', 'Nome do lar'], 'set.lang': ['Idioma', 'Language', 'Idioma'], 'set.country': ['País', 'Country', 'País'],
    'set.currency': ['Moneda', 'Currency', 'Moeda'], 'set.currency.note': ['Cambiar la moneda solo cambia cómo se muestran los montos. No convierte ni modifica tus datos.', 'Changing currency only changes how amounts are displayed. It never converts or alters your data.', 'Trocar a moeda só muda como os valores são exibidos. Não converte nem altera seus dados.'],
    'set.currency.extra': ['Otra moneda (código de 3 letras, ej: JPY)', 'Another currency (3-letter code, e.g. JPY)', 'Outra moeda (código de 3 letras, ex: JPY)'], 'set.currency.bad': ['Ese código de moneda no es válido', 'That currency code is not valid', 'Esse código de moeda não é válido'],
    'set.weekStart': ['La semana empieza el', 'Week starts on', 'A semana começa em'], 'set.theme': ['Apariencia', 'Appearance', 'Aparência'], 'set.theme.auto': ['Automática', 'Automatic', 'Automática'], 'set.theme.light': ['Clara', 'Light', 'Clara'], 'set.theme.dark': ['Oscura', 'Dark', 'Escura'],
    'set.modules': ['Módulos visibles', 'Visible modules', 'Módulos visíveis'], 'set.modules.t': ['Oculta lo que no uses; tus datos se conservan.', 'Hide what you do not use; your data is kept.', 'Oculte o que não usa; seus dados são mantidos.'],
    'set.dash': ['Panel de inicio', 'Home dashboard', 'Painel inicial'], 'set.dash.t': ['Elige qué tarjetas ver en Mi hogar.', 'Choose which cards show on My Home.', 'Escolha quais cartões aparecem em Meu lar.'],
    'set.backup': ['Respaldo y datos', 'Backup & data', 'Backup e dados'], 'set.backup.t': ['Tus datos viven solo en este dispositivo. Guarda un respaldo para moverlos o protegerlos.', 'Your data lives only on this device. Save a backup to move or protect it.', 'Seus dados ficam só neste dispositivo. Salve um backup para movê-los ou protegê-los.'],
    'set.export': ['Exportar respaldo (JSON)', 'Export backup (JSON)', 'Exportar backup (JSON)'], 'set.import': ['Importar respaldo', 'Import backup', 'Importar backup'], 'set.restorePrev': ['Restaurar versión anterior', 'Restore previous version', 'Restaurar versão anterior'],
    'set.lastBackup': ['Último respaldo: {d}', 'Last backup: {d}', 'Último backup: {d}'], 'set.neverBackup': ['Aún no hiciste un respaldo', 'You have not made a backup yet', 'Você ainda não fez backup'],
    'set.exported': ['Respaldo descargado', 'Backup downloaded', 'Backup baixado'],
    'set.import.ask': ['Importar reemplazará TODOS los datos actuales de este dispositivo. Antes se guarda una copia por si te arrepientes.', 'Importing will REPLACE all current data on this device. A copy is saved first in case you change your mind.', 'Importar vai SUBSTITUIR todos os dados atuais deste dispositivo. Uma cópia é salva antes, caso você se arrependa.'],
    'set.import.ok': ['Respaldo importado', 'Backup imported', 'Backup importado'],
    'set.import.notBackup': ['Ese archivo no es un respaldo de HomeFlow 360.', 'That file is not a HomeFlow 360 backup.', 'Esse arquivo não é um backup do HomeFlow 360.'],
    'set.import.corrupt': ['El respaldo está dañado o incompleto. No se cambió nada.', 'The backup is damaged or incomplete. Nothing was changed.', 'O backup está danificado ou incompleto. Nada foi alterado.'],
    'set.import.newer': ['Ese respaldo viene de una versión más nueva de la app.', 'That backup comes from a newer version of the app.', 'Esse backup vem de uma versão mais nova do app.'],
    'set.import.read': ['No se pudo leer el archivo.', 'The file could not be read.', 'Não foi possível ler o arquivo.'],
    'set.import.big': ['El archivo es demasiado grande.', 'The file is too large.', 'O arquivo é grande demais.'],
    'set.restore.none': ['No hay una versión anterior guardada.', 'There is no previous version saved.', 'Não há versão anterior salva.'], 'set.restore.ask': ['Se volverá al estado guardado el {d}. Los datos actuales se reemplazan.', 'This returns to the state saved on {d}. Current data is replaced.', 'Isso volta ao estado salvo em {d}. Os dados atuais são substituídos.'],
    'set.restore.ok': ['Versión anterior restaurada', 'Previous version restored', 'Versão anterior restaurada'],
    'set.demo': ['Quitar datos de ejemplo', 'Remove sample data', 'Remover dados de exemplo'], 'set.demo.none': ['No hay datos de ejemplo.', 'There is no sample data.', 'Não há dados de exemplo.'],
    'set.wipe': ['Borrar todos los datos', 'Erase all data', 'Apagar todos os dados'], 'set.wipe.ask1': ['Se borrará todo lo que guardaste en HomeFlow 360 en este dispositivo.', 'Everything you saved in HomeFlow 360 on this device will be erased.', 'Tudo o que você salvou no HomeFlow 360 neste dispositivo será apagado.'],
    'set.wipe.ask2': ['Última confirmación: ¿seguro que quieres borrar todo? Si hiciste un respaldo podrás importarlo después.', 'Final confirmation: are you sure you want to erase everything? If you made a backup you can import it later.', 'Última confirmação: tem certeza de que quer apagar tudo? Se fez backup, poderá importá-lo depois.'],
    'set.continue': ['Continuar', 'Continue', 'Continuar'], 'set.wipe.yes': ['Sí, borrar todo', 'Yes, erase everything', 'Sim, apagar tudo'], 'set.wipe.done': ['Datos borrados', 'Data erased', 'Dados apagados'],
    'set.storage': ['Almacenamiento', 'Storage', 'Armazenamento'], 'set.storage.used': ['Usado: {n}', 'Used: {n}', 'Usado: {n}'], 'set.storage.persist': ['Pedir al navegador que proteja mis datos', 'Ask the browser to protect my data', 'Pedir ao navegador que proteja meus dados'],
    'set.persist.yes': ['El navegador protege tus datos contra borrado automático.', 'The browser protects your data from automatic clean-up.', 'O navegador protege seus dados contra limpeza automática.'], 'set.persist.no': ['El navegador no garantizó protección. Haz respaldos y, si puedes, instala la app.', 'The browser did not guarantee protection. Make backups and, if you can, install the app.', 'O navegador não garantiu proteção. Faça backups e, se puder, instale o app.'],
    'set.fallback': ['Este navegador guarda en modo reducido; haz respaldos con frecuencia.', 'This browser is storing in reduced mode; back up often.', 'Este navegador está guardando em modo reduzido; faça backups com frequência.'],
    'set.help': ['Ayuda', 'Help', 'Ajuda'], 'set.guide': ['Guía rápida', 'Quick guide', 'Guia rápido'], 'set.install': ['Cómo instalar la app', 'How to install the app', 'Como instalar o app'], 'set.privacy': ['Privacidad y uso sin internet', 'Privacy & offline use', 'Privacidade e uso offline'],
    'set.about': ['HomeFlow 360 · versión {v}', 'HomeFlow 360 · version {v}', 'HomeFlow 360 · versão {v}'],
    'guide.1': ['Empieza por Mi hogar: ahí ves el día de un vistazo. Todo se personaliza en Ajustes.', 'Start at My Home: your day at a glance. Everything is customizable in Settings.', 'Comece em Meu lar: o dia num relance. Tudo é personalizável em Configurações.'],
    'guide.2': ['Tareas: crea tareas sueltas o rutinas que se repiten, y reparte responsables con rotación.', 'Tasks: create one-off tasks or repeating routines and share owners with rotation.', 'Tarefas: crie tarefas avulsas ou rotinas que se repetem e divida responsáveis com rodízio.'],
    'guide.3': ['Comidas: planifica la semana y genera la lista de compras con un toque.', 'Meals: plan the week and build the shopping list with one tap.', 'Refeições: planeje a semana e gere a lista de compras com um toque.'],
    'guide.4': ['Economía: registra ingresos y gastos, define presupuestos y mira las alertas.', 'Money: record income and expenses, set budgets and watch the alerts.', 'Finanças: registre receitas e despesas, defina orçamentos e veja os alertas.'],
    'guide.5': ['Plantillas: aplica listas listas para usar (limpieza, mudanza, vacaciones…) y edítalas a tu gusto.', 'Templates: apply ready-made lists (cleaning, moving, vacation…) and edit them as you like.', 'Modelos: aplique listas prontas (limpeza, mudança, férias…) e edite como quiser.'],
    'guide.6': ['Respaldo: descarga un archivo JSON de vez en cuando. Es tu seguro si cambias de equipo o borras el navegador.', 'Backup: download a JSON file now and then. It is your insurance if you switch devices or clear the browser.', 'Backup: baixe um arquivo JSON de vez em quando. É seu seguro se trocar de aparelho ou limpar o navegador.'],
    'inst.android': ['Android (Chrome): menú ⋮ → "Instalar app" o "Agregar a pantalla principal".', 'Android (Chrome): menu ⋮ → "Install app" or "Add to Home screen".', 'Android (Chrome): menu ⋮ → "Instalar app" ou "Adicionar à tela inicial".'],
    'inst.iphone': ['iPhone/iPad (Safari): botón Compartir → "Agregar a pantalla de inicio". Usa Safari, no otro navegador.', 'iPhone/iPad (Safari): Share button → "Add to Home Screen". Use Safari, not another browser.', 'iPhone/iPad (Safari): botão Compartilhar → "Adicionar à Tela de Início". Use o Safari, não outro navegador.'],
    'inst.windows': ['Windows (Chrome o Edge): ícono de instalar en la barra de direcciones, o menú → "Instalar HomeFlow 360".', 'Windows (Chrome or Edge): install icon in the address bar, or menu → "Install HomeFlow 360".', 'Windows (Chrome ou Edge): ícone de instalar na barra de endereço, ou menu → "Instalar HomeFlow 360".'],
    'inst.mac': ['Mac (Chrome/Edge): igual que en Windows. Safari: Archivo → "Agregar al Dock".', 'Mac (Chrome/Edge): same as Windows. Safari: File → "Add to Dock".', 'Mac (Chrome/Edge): igual ao Windows. Safari: Arquivo → "Adicionar ao Dock".'],
    'inst.note': ['La primera vez necesitas internet para abrir la app; después funciona sin conexión.', 'You need internet the first time you open the app; afterwards it works offline.', 'Na primeira vez você precisa de internet para abrir o app; depois funciona offline.'],
    'priv.1': ['Tus datos se guardan solo en este dispositivo y navegador. No hay cuentas ni servidores.', 'Your data is stored only on this device and browser. There are no accounts and no servers.', 'Seus dados ficam só neste dispositivo e navegador. Não há contas nem servidores.'],
    'priv.2': ['La app no envía nada a internet, no usa rastreadores ni anuncios.', 'The app sends nothing to the internet and uses no trackers or ads.', 'O app não envia nada para a internet e não usa rastreadores nem anúncios.'],
    'priv.3': ['Funciona sin conexión después de la primera carga. No necesita internet para ninguna función.', 'It works offline after the first load. No feature needs internet.', 'Funciona offline após o primeiro carregamento. Nenhuma função precisa de internet.'],
    'priv.4': ['No hay sincronización entre dispositivos: para pasar datos usa Exportar e Importar.', 'There is no sync between devices: use Export and Import to move data.', 'Não há sincronização entre dispositivos: para passar dados use Exportar e Importar.'],
    'priv.5': ['Los recordatorios se ven dentro de la app; no se envían notificaciones del sistema.', 'Reminders are shown inside the app; no system notifications are sent.', 'Os lembretes aparecem dentro do app; não são enviadas notificações do sistema.'],
    'priv.6': ['Si borras los datos del navegador, se pierden. Por eso conviene hacer respaldos.', 'If you clear browser data, it is lost. That is why backups matter.', 'Se você limpar os dados do navegador, eles se perdem. Por isso os backups importam.'],
    'dash.summary': ['Resumen del día', 'Today at a glance', 'Resumo do dia'], 'dash.tasks': ['Tareas de hoy', 'Today\'s tasks', 'Tarefas de hoje'], 'dash.events': ['Próximos eventos', 'Upcoming events', 'Próximos eventos'], 'dash.progress': ['Progreso semanal', 'Weekly progress', 'Progresso semanal'],
    'dash.reminders': ['Recordatorios', 'Reminders', 'Lembretes'], 'dash.shopping': ['Lista de compras', 'Shopping list', 'Lista de compras'], 'dash.money': ['Economía del mes', 'Money this month', 'Finanças do mês'], 'dash.index': ['Índice del hogar', 'Home index', 'Índice da casa'], 'dash.quick': ['Acciones rápidas', 'Quick actions', 'Ações rápidas']
  });

  function fileSize(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
  function infoModal(title, keys, extra) {
    HF.modal({ title: title, body: '<ul class="info-list">' + keys.map(function (k) { return '<li>' + esc(t(k)) + '</li>'; }).join('') + '</ul>' + (extra ? '<p class="muted sm">' + esc(t(extra)) + '</p>' : '') });
  }

  HF.act['set.export'] = function () {
    HF.exportBackup().then(function () { HF.toast(t('set.exported')); if (HF.state && HF.refresh) HF.refresh(); }).catch(function () { HF.toast(t('msg.storageErr')); });
  };
  HF.act['set.import'] = function () { var f = HF.$('#import-file'); if (f) { f.value = ''; f.click(); } };
  HF.chg['set.importFile'] = function (el) {
    var f = el.files && el.files[0]; if (!f) return;
    if (f.size > 80 * 1024 * 1024) { HF.toast(t('set.import.big'), { ms: 6000 }); return; }
    var rd = new FileReader();
    rd.onerror = function () { HF.toast(t('set.import.read'), { ms: 6000 }); };
    rd.onload = function () {
      var obj; try { obj = JSON.parse(rd.result); } catch (e) { HF.toast(t('set.import.notBackup'), { ms: 6000 }); return; }
      var r = HF.validateBackup(obj);
      if (!r.ok) { HF.toast(t('set.import.' + r.error), { ms: 6500 }); return; }
      HF.confirm({ title: t('set.import'), text: t('set.import.ask') + (r.exportedAt ? ' (' + r.exportedAt.slice(0, 10) + ')' : ''), ok: t('set.import'), danger: true }).then(function (y) {
        if (!y) return;
        HF.makeSnapshot().then(function () { return HF.replaceState(r.state, r.photos); }).then(function () { HF.applyTheme(); HF.rebuild(); HF.toast(t('set.import.ok')); })
          .catch(function () { HF.toast(t('msg.storageErr')); });
      });
    };
    rd.readAsText(f);
  };
  HF.act['set.restore'] = function () {
    HF.getSnapshot().then(function (s) {
      if (!s || !s.state) { HF.toast(t('set.restore.none')); return; }
      var r = HF.validateBackup({ app: 'HomeFlow360', version: HF.SCHEMA, state: s.state, photos: s.photos });
      if (!r.ok) { HF.toast(t('set.restore.none')); return; }
      HF.confirm({ title: t('set.restorePrev'), text: t('set.restore.ask', { d: String(s.at || '').slice(0, 16).replace('T', ' ') }), ok: t('set.restorePrev'), danger: true }).then(function (y) {
        if (!y) return;
        HF.makeSnapshot().then(function () { return HF.replaceState(r.state, r.photos); }).then(function () { HF.applyTheme(); HF.rebuild(); HF.toast(t('set.restore.ok')); });
      });
    });
  };
  HF.act['set.demo'] = function () {
    if (!HF.hasDemo()) { HF.toast(t('set.demo.none')); return; }
    HF.act['home.removeDemo']();
  };
  HF.act['set.wipe'] = function () {
    HF.confirm({ title: t('set.wipe'), text: t('set.wipe.ask1'), ok: t('set.continue'), danger: true }).then(function (y) {
      if (!y) return;
      HF.confirm({ title: t('set.wipe'), text: t('set.wipe.ask2'), ok: t('set.wipe.yes'), danger: true }).then(function (y2) {
        if (!y2) return;
        HF.makeSnapshot().then(function () { return HF.photos.clear(); }).then(function () {
          var keepLang = HF.state.settings.lang; HF.state = HF.normalize(HF.defaultState()); HF.state.settings.lang = keepLang; return HF.flush();
        }).then(function () { HF.applyTheme(); HF.closeAllModals(); HF.rebuild(); HF.toast(t('set.wipe.done')); });
      });
    });
  };
  HF.act['set.persist'] = function () {
    if (!(navigator.storage && navigator.storage.persist)) { HF.toast(t('set.persist.no'), { ms: 6000 }); return; }
    navigator.storage.persist().then(function (ok) { HF.state.settings.persisted = !!ok; HF.toast(t(ok ? 'set.persist.yes' : 'set.persist.no'), { ms: 6000 }); HF.commit(); });
  };
  HF.act['set.guide'] = function () { infoModal(t('set.guide'), ['guide.1', 'guide.2', 'guide.3', 'guide.4', 'guide.5', 'guide.6']); };
  HF.act['set.install'] = function () { infoModal(t('set.install'), ['inst.android', 'inst.iphone', 'inst.windows', 'inst.mac'], 'inst.note'); };
  HF.act['set.privacy'] = function () { infoModal(t('set.privacy'), ['priv.1', 'priv.2', 'priv.3', 'priv.4', 'priv.5', 'priv.6']); };
  HF.act['set.addCur'] = function () {
    var i = HF.$('#extra-cur'), c = i ? i.value.trim().toUpperCase() : '';
    if (!/^[A-Z]{3}$/.test(c) || !HF.validCurrency(c)) { HF.toast(t('set.currency.bad')); return; }
    var S = HF.state; if (S.settings.extraCurrencies.indexOf(c) < 0 && HF.CURRENCIES.indexOf(c) < 0) S.settings.extraCurrencies.push(c);
    S.settings.currency = c; HF.commit();
  };

  HF.chg['set.name'] = function (el) { HF.state.settings.homeName = el.value.trim().slice(0, 40); HF.commit(); };
  HF.chg['set.lang'] = function (el) { HF.state.settings.lang = el.value; HF.reseedRecipes(el.value); HF.save(); HF.rebuild(); };
  HF.chg['set.country'] = function (el) { HF.state.settings.country = el.value; HF.commit(); };
  HF.chg['set.currency'] = function (el) { HF.state.settings.currency = el.value; HF.commit(); };
  HF.chg['set.week'] = function (el) { HF.state.settings.weekStart = +el.value; HF.commit(); };
  HF.chg['set.theme'] = function (el) { HF.state.settings.theme = el.value; HF.applyTheme(); HF.commit(); };
  HF.chg['set.mod'] = function (el) {
    var h = HF.state.settings.hidden, id = el.getAttribute('data-id'), i = h.indexOf(id);
    if (el.checked && i >= 0) h.splice(i, 1); else if (!el.checked && i < 0) h.push(id);
    HF.save(); HF.rebuild();
  };
  HF.chg['set.dash'] = function (el) { HF.state.settings.dash[el.getAttribute('data-id')] = el.checked; HF.commit(); };

  function sel(name, label, opts, val) {
    return '<label class="fld"><span>' + esc(label) + '</span><select data-chg="' + name + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></label>';
  }
  HF.views.settings = {
    render: function (root) {
      var S = HF.state, st = S.settings, last = st.lastBackup;
      var countries = [['', '—']].concat(HF.COUNTRIES.map(function (c) { return [c, HF.countryName(c)]; }).sort(function (a, b) { return a[1].localeCompare(b[1]); }));
      var curs = HF.allCurrencies().map(function (c) { return [c, c + ' · ' + HF.currencyName(c)]; });
      var days = [[1, '2024-01-01'], [0, '2023-12-31'], [6, '2023-12-30']].map(function (d) { return [d[0], HF.weekdayName(d[1], 'long')]; });
      var general = '<section class="card"><h2>' + esc(t('set.general')) + '</h2><div class="fgrid">' +
        '<label class="fld full"><span>' + esc(t('set.homeName')) + '</span><input type="text" maxlength="40" value="' + esc(st.homeName) + '" data-chg="set.name"></label>' +
        sel('set.lang', t('set.lang'), HF.LANGS, st.lang) + sel('set.country', t('set.country'), countries, st.country) + sel('set.currency', t('set.currency'), curs, st.currency) +
        '<div class="fld"><span>' + esc(t('set.currency.extra')) + '</span><div class="inline-add"><input id="extra-cur" type="text" maxlength="3" autocapitalize="characters" placeholder="JPY"><button type="button" class="btn sm" data-act="set.addCur">' + esc(t('c.add')) + '</button></div></div>' +
        sel('set.week', t('set.weekStart'), days, st.weekStart) + sel('set.theme', t('set.theme'), [['auto', t('set.theme.auto')], ['light', t('set.theme.light')], ['dark', t('set.theme.dark')]], st.theme) +
        '</div><p class="muted sm">' + HF.icon('info', 14) + ' ' + esc(t('set.currency.note')) + '</p></section>';
      var mods = '<section class="card"><h2>' + esc(t('set.modules')) + '</h2><p class="muted sm">' + esc(t('set.modules.t')) + '</p><div class="chk-grid">' + HF.MODULES.map(function (m) { return '<label class="chk"><input type="checkbox" data-chg="set.mod" data-id="' + m.id + '"' + (HF.moduleOn(m.id) ? ' checked' : '') + '><span>' + esc(t('nav.' + m.id)) + '</span></label>'; }).join('') + '</div></section>';
      var dash = '<section class="card"><h2>' + esc(t('set.dash')) + '</h2><p class="muted sm">' + esc(t('set.dash.t')) + '</p><div class="chk-grid">' + Object.keys(st.dash).map(function (k) { return '<label class="chk"><input type="checkbox" data-chg="set.dash" data-id="' + k + '"' + (st.dash[k] ? ' checked' : '') + '><span>' + esc(t('dash.' + k)) + '</span></label>'; }).join('') + '</div></section>';
      var backup = '<section class="card"><h2>' + esc(t('set.backup')) + '</h2><p class="muted">' + esc(t('set.backup.t')) + '</p><p class="sm"><b>' + esc(last ? t('set.lastBackup', { d: HF.fmtDate(last, { day: 'numeric', month: 'long', year: 'numeric' }) }) : t('set.neverBackup')) + '</b></p><div class="btn-row"><button type="button" class="btn primary" data-act="set.export">' + HF.icon('download', 16) + ' ' + esc(t('set.export')) + '</button><button type="button" class="btn" data-act="set.import">' + HF.icon('upload', 16) + ' ' + esc(t('set.import')) + '</button><button type="button" class="btn" data-act="set.restore">' + HF.icon('refresh', 16) + ' ' + esc(t('set.restorePrev')) + '</button></div><input id="import-file" class="sr" type="file" accept="application/json,.json" data-chg="set.importFile" tabindex="-1" aria-label="' + esc(t('set.import')) + '">' +
        '<div class="btn-row"><button type="button" class="btn ghost" data-act="set.demo">' + esc(t('set.demo')) + '</button><button type="button" class="btn danger ghost" data-act="set.wipe">' + HF.icon('trash', 16) + ' ' + esc(t('set.wipe')) + '</button></div></section>';
      var storage = '<section class="card"><h2>' + esc(t('set.storage')) + '</h2><p id="stor-used" class="muted sm"></p><p class="sm">' + esc(HF.store.usingFallback() ? t('set.fallback') : (st.persisted ? t('set.persist.yes') : t('set.persist.no'))) + '</p><div class="btn-row"><button type="button" class="btn" data-act="set.persist">' + HF.icon('shield', 16) + ' ' + esc(t('set.storage.persist')) + '</button></div></section>';
      var help = '<section class="card"><h2>' + esc(t('set.help')) + '</h2><div class="btn-row"><button type="button" class="btn" data-act="set.guide">' + esc(t('set.guide')) + '</button>' + (HF.canInstall && HF.canInstall() ? '<button type="button" class="btn primary" data-act="app.install">' + esc(t('inst.btn')) + '</button>' : '') + '<button type="button" class="btn" data-act="set.install">' + esc(t('set.install')) + '</button><button type="button" class="btn" data-act="set.privacy">' + esc(t('set.privacy')) + '</button></div></section>';
      root.innerHTML = '<div class="page-h"><h1>' + esc(t('set.title')) + '</h1></div><div class="stack">' + general + mods + dash + backup + storage + help + '</div><p class="muted sm center">' + esc(t('set.about', { v: HF.version })) + '</p>';
      if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function (e) { var el = HF.$('#stor-used'); if (el && e && e.usage != null) el.textContent = t('set.storage.used', { n: fileSize(e.usage) }); }).catch(function () {});
    }
  };
})();
