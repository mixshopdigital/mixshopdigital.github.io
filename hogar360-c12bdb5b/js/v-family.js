/* HomeFlow 360 — Family, responsibilities & achievements (local profiles, no sync) */
(function () {
  'use strict';
  var HF = window.HF, t = HF.t, esc = HF.esc;

  HF.addDict({
    'fam.title': ['Familia y responsabilidades', 'Family & responsibilities', 'Família e responsabilidades'],
    'fam.add': ['Agregar integrante', 'Add member', 'Adicionar pessoa'], 'fam.edit': ['Editar integrante', 'Edit member', 'Editar pessoa'],
    'fam.f.name': ['Nombre', 'Name', 'Nome'], 'fam.f.role': ['Rol (opcional)', 'Role (optional)', 'Papel (opcional)'], 'fam.f.avatar': ['Avatar', 'Avatar', 'Avatar'], 'fam.f.color': ['Color', 'Color', 'Cor'],
    'fam.empty': ['Aún no hay integrantes', 'No members yet', 'Ainda não há pessoas'],
    'fam.empty.t': ['Agrega a quienes viven en casa para repartir tareas y celebrar logros. Son solo perfiles locales, no cuentas.', 'Add the people who live at home to share tasks and celebrate wins. These are local profiles, not accounts.', 'Adicione quem mora na casa para dividir tarefas e comemorar conquistas. São perfis locais, não contas.'],
    'fam.pending': ['{n} pendientes', '{n} pending', '{n} pendentes'], 'fam.doneWeek': ['{n} hechas esta semana', '{n} done this week', '{n} feitas esta semana'], 'fam.points': ['{n} puntos', '{n} points', '{n} pontos'],
    'fam.level': ['Nivel {n}', 'Level {n}', 'Nível {n}'], 'fam.toNext': ['{n} puntos para el nivel {l}', '{n} points to level {l}', '{n} pontos para o nível {l}'],
    'fam.tasksOf': ['Responsabilidades', 'Responsibilities', 'Responsabilidades'], 'fam.noTasks': ['Sin tareas asignadas', 'No tasks assigned', 'Sem tarefas atribuídas'],
    'fam.del.note': ['Sus tareas quedarán sin responsable.', 'Their tasks will become unassigned.', 'As tarefas dela ficarão sem responsável.'],
    'fam.ach': ['Logros del hogar', 'Household achievements', 'Conquistas da casa'], 'fam.unlocked': ['{a} de {b} desbloqueados', '{a} of {b} unlocked', '{a} de {b} desbloqueadas'],
    'fam.rank': ['Quién ayudó más esta semana', 'Top helpers this week', 'Quem mais ajudou esta semana'], 'fam.local': ['Perfiles locales: no hay cuentas ni sincronización entre dispositivos.', 'Local profiles: no accounts and no sync between devices.', 'Perfis locais: sem contas nem sincronização entre dispositivos.'],
    'ach.first': ['Primer paso', 'First step', 'Primeiro passo'], 'ach.first.d': ['Completa tu primera tarea', 'Complete your first task', 'Conclua sua primeira tarefa'],
    'ach.ten': ['Hogar en marcha', 'Home in motion', 'Casa em movimento'], 'ach.ten.d': ['10 tareas completadas', '10 tasks completed', '10 tarefas concluídas'],
    'ach.fifty': ['Constancia', 'Consistency', 'Constância'], 'ach.fifty.d': ['50 tareas completadas', '50 tasks completed', '50 tarefas concluídas'],
    'ach.hundred': ['Hogar de campeones', 'Home of champions', 'Casa de campeões'], 'ach.hundred.d': ['100 tareas completadas', '100 tasks completed', '100 tarefas concluídas'],
    'ach.streak3': ['Racha de 3 días', '3-day streak', 'Sequência de 3 dias'], 'ach.streak3.d': ['Completa tareas 3 días seguidos', 'Complete tasks 3 days in a row', 'Conclua tarefas 3 dias seguidos'],
    'ach.streak7': ['Semana perfecta', 'Perfect week', 'Semana perfeita'], 'ach.streak7.d': ['Completa tareas 7 días seguidos', 'Complete tasks 7 days in a row', 'Conclua tarefas 7 dias seguidos'],
    'ach.team': ['Trabajo en equipo', 'Teamwork', 'Trabalho em equipe'], 'ach.team.d': ['Dos personas completan tareas', 'Two people complete tasks', 'Duas pessoas concluem tarefas'],
    'ach.shop': ['Compra al día', 'Shopping done', 'Compras em dia'], 'ach.shop.d': ['Finaliza una compra', 'Finish a shopping trip', 'Finalize uma compra'],
    'ach.inv': ['Todo registrado', 'All on record', 'Tudo registrado'], 'ach.inv.d': ['Registra 5 objetos en el inventario', 'Record 5 items in the inventory', 'Registre 5 itens no inventário'],
    'ach.maint': ['Casa cuidada', 'Well-kept home', 'Casa bem cuidada'], 'ach.maint.d': ['Registra un mantenimiento hecho', 'Log a completed maintenance job', 'Registre uma manutenção feita'],
    'ach.budget': ['Presupuesto en marcha', 'Budget in place', 'Orçamento em ação'], 'ach.budget.d': ['Define tu primer presupuesto', 'Set your first budget', 'Defina seu primeiro orçamento']
  });
  var ACH = [
    { id: 'first', icon: '🌱', ok: function (c) { return c.total >= 1; } }, { id: 'ten', icon: '🏡', ok: function (c) { return c.total >= 10; } },
    { id: 'fifty', icon: '🌟', ok: function (c) { return c.total >= 50; } }, { id: 'hundred', icon: '🏆', ok: function (c) { return c.total >= 100; } },
    { id: 'streak3', icon: '🔥', ok: function (c) { return c.streak >= 3; } }, { id: 'streak7', icon: '🌈', ok: function (c) { return c.streak >= 7; } },
    { id: 'team', icon: '🤝', ok: function (c) { return c.people >= 2; } }, { id: 'shop', icon: '🛒', ok: function (c) { return c.purchases >= 1; } },
    { id: 'inv', icon: '📦', ok: function (c) { return c.inv >= 5; } }, { id: 'maint', icon: '🧽', ok: function (c) { return c.maintDone >= 1; } },
    { id: 'budget', icon: '💚', ok: function (c) { return c.budgets >= 1; } }
  ];
  function ctx() {
    var S = HF.state, ppl = {}; S.log.forEach(function (l) { if (l.memberId) ppl[l.memberId] = 1; });
    return {
      total: S.log.length, streak: HF.streak ? HF.streak() : 0, people: Object.keys(ppl).length, purchases: S.purchases.filter(function (p) { return !p.demo; }).length,
      inv: S.inventory.filter(function (x) { return !x.demo; }).length, maintDone: S.maint.filter(function (m) { return !m.demo && m.history && m.history.length; }).length,
      budgets: S.settings.demoBudgets ? 0 : Object.keys(S.fin.budgets).length
    };
  }
  HF.achievements = function () { var c = ctx(); return ACH.map(function (a) { return { id: a.id, icon: a.icon, unlocked: a.ok(c) }; }); };
  HF.checkAch = function () {
    var S = HF.state, fresh = HF.achievements().filter(function (a) { return a.unlocked && S.achSeen.indexOf(a.id) < 0; });
    if (!fresh.length) return;
    fresh.forEach(function (a) { S.achSeen.push(a.id); });
    HF.save();
    HF.toast(a0(fresh[0]) , { ms: 5200 });
    function a0(a) { return a.icon + ' ' + t('msg.ach', { name: t('ach.' + a.id) }); }
  };
  HF.memberStats = function (m) {
    var S = HF.state, ws = HF.weekStart(HF.today()), we = HF.addDays(ws, 6), pts = 0, wk = 0;
    S.log.forEach(function (l) { if (l.memberId === m.id) { pts += 10; if (l.date >= ws && l.date <= we) wk++; } });
    var level = Math.floor(pts / 100) + 1;
    return { points: pts, week: wk, level: level, toNext: level * 100 - pts, pending: S.tasks.filter(function (x) { return !x.done && x.assignee === m.id; }).length };
  };

  HF.act['fam.new'] = function () { form(null); };
  HF.act['fam.edit'] = function (el) { form(el.getAttribute('data-id')); };

  function form(id) {
    var S = HF.state, m = id ? HF.member(id) : null;
    HF.openForm({
      title: m ? t('fam.edit') : t('fam.add'),
      values: m ? { name: m.name, role: m.role || '', avatar: m.avatar, color: m.color } : { avatar: HF.AVATARS[S.members.length % HF.AVATARS.length], color: HF.COLORS[S.members.length % HF.COLORS.length] },
      fields: [
        { name: 'name', label: t('fam.f.name'), required: true, full: true, autofocus: true, maxlength: 30 },
        { name: 'role', label: t('fam.f.role'), full: true, maxlength: 30 },
        { name: 'avatar', label: t('fam.f.avatar'), type: 'choice', options: HF.AVATARS.map(function (a) { return { value: a, label: a }; }) },
        { name: 'color', label: t('fam.f.color'), type: 'swatch', options: HF.COLORS.map(function (c) { return { value: c, label: c }; }) }
      ],
      deleteText: t('fam.del.note'),
      onSubmit: function (v) {
        if (m) { m.name = v.name; m.role = v.role; m.avatar = v.avatar; m.color = v.color; delete m.demo; }
        else S.members.push({ id: HF.uid(), name: v.name, role: v.role, avatar: v.avatar, color: v.color });
        HF.commit();
      },
      onDelete: m ? function () { S.tasks.forEach(function (x) { if (x.assignee === m.id) x.assignee = ''; }); S.members = S.members.filter(function (y) { return y.id !== m.id; }); HF.commit(); } : null
    });
  }

  HF.views.family = {
    render: function (root) {
      var S = HF.state, ach = HF.achievements(), un = ach.filter(function (a) { return a.unlocked; }).length;
      var body = '';
      if (!S.members.length) body = HF.empty({ illo: 'house', title: t('fam.empty'), text: t('fam.empty.t'), actions: '<button type="button" class="btn primary" data-act="fam.new">' + HF.icon('plus', 16) + ' ' + esc(t('fam.add')) + '</button>' });
      else {
        var rank = S.members.map(function (m) { return { m: m, s: HF.memberStats(m) }; });
        body = '<div class="cards">' + rank.map(function (r) {
          var m = r.m, s = r.s, mine = S.tasks.filter(function (x) { return !x.done && x.assignee === m.id; }).sort(function (a, b) { return (a.due || '9') < (b.due || '9') ? -1 : 1; }).slice(0, 5);
          return '<article class="card mem"><div class="mem-h">' + HF.avatar(m, 48) + '<div><h3>' + esc(m.name) + '</h3><span class="muted sm">' + esc(m.role || '') + '</span></div><button type="button" class="icon-btn" data-act="fam.edit" data-id="' + m.id + '" aria-label="' + esc(t('c.edit') + ' ' + m.name) + '">' + HF.icon('edit', 18) + '</button></div>' +
            '<div class="chips">' + HF.chip(t('fam.level', { n: s.level }), 'ok', '⭐') + HF.chip(t('fam.points', { n: s.points })) + HF.chip(t('fam.doneWeek', { n: s.week })) + HF.chip(t('fam.pending', { n: s.pending }), s.pending ? 'warn' : '') + '</div>' +
            HF.bar(100 - s.toNext, 'accent', t('fam.level', { n: s.level })) + '<p class="muted sm">' + esc(t('fam.toNext', { n: s.toNext, l: s.level + 1 })) + '</p>' +
            '<h4 class="h-sm">' + esc(t('fam.tasksOf')) + '</h4>' + (mine.length ? '<ul class="mini-list">' + mine.map(function (x) { return '<li>' + esc(x.title) + (x.due ? ' <small class="muted">· ' + esc(HF.fmtDate(x.due)) + '</small>' : '') + '</li>'; }).join('') + '</ul>' : '<p class="muted sm">' + esc(t('fam.noTasks')) + '</p>') + '</article>';
        }).join('') + '</div>';
      }
      var achHtml = '<h2 class="h-md">' + esc(t('fam.ach')) + ' <small class="muted">' + esc(t('fam.unlocked', { a: un, b: ach.length })) + '</small></h2><div class="ach-grid">' + ach.map(function (a) {
        return '<div class="ach' + (a.unlocked ? ' on' : '') + '"><span class="ach-i" aria-hidden="true">' + (a.unlocked ? a.icon : '🔒') + '</span><b>' + esc(t('ach.' + a.id)) + '</b><small>' + esc(t('ach.' + a.id + '.d')) + '</small></div>';
      }).join('') + '</div>';
      root.innerHTML = '<div class="page-h"><h1>' + esc(t('fam.title')) + '</h1><button type="button" class="btn primary" data-act="fam.new">' + HF.icon('plus', 16) + ' ' + esc(t('fam.add')) + '</button></div>' + body + achHtml + '<p class="muted sm note">' + HF.icon('info', 14) + ' ' + esc(t('fam.local')) + '</p>';
    }
  };
})();
