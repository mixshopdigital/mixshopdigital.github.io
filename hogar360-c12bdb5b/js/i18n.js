/* HomeFlow 360 — i18n: all interface text lives in dictionaries [es, en, pt-BR] */
(function () {
  'use strict';
  var HF = window.HF = window.HF || {};
  HF.version = '1.0.0';
  HF.dict = {};
  HF.missing = new Set();
  var LI = { es: 0, en: 1, pt: 2 };
  HF.LANGS = [['es', 'Español'], ['en', 'English'], ['pt', 'Português']];

  HF.addDict = function (o) { for (var k in o) { HF.dict[k] = o[k]; } };

  HF.detectLang = function () {
    var l = String((navigator.language || 'en')).toLowerCase();
    return l.indexOf('pt') === 0 ? 'pt' : l.indexOf('es') === 0 ? 'es' : 'en';
  };
  HF.lang = function () { return (HF.state && HF.state.settings && HF.state.settings.lang) || HF.pendingLang || HF.detectLang(); };

  HF.t = function (k, vars, lang) {
    var e = HF.dict[k];
    if (!e) { HF.missing.add(k); return k; }
    var s = e[LI[lang || HF.lang()]];
    if (s == null || s === '') s = e[1] || e[0];
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, n) { return vars[n] != null ? vars[n] : m; });
    return s;
  };
  // singular/plural helper: keys base+'.one' / base+'.many'
  HF.tn = function (base, n, vars) {
    var v = Object.assign({ n: n }, vars || {});
    return HF.t(base + (n === 1 ? '.one' : '.many'), v);
  };

  HF.addDict({
    'app.name': ['HomeFlow 360', 'HomeFlow 360', 'HomeFlow 360'],
    'app.tagline': ['Tu hogar, tu ritmo', 'Your Home, Your Rhythm', 'Seu lar, seu ritmo'],
    'a11y.skip': ['Saltar al contenido', 'Skip to content', 'Ir para o conteúdo'],
    'a11y.main': ['Navegación principal', 'Main navigation', 'Navegação principal'],

    'nav.home': ['Mi hogar', 'My Home', 'Meu lar'],
    'nav.tasks': ['Tareas', 'Tasks', 'Tarefas'],
    'nav.calendar': ['Calendario', 'Calendar', 'Calendário'],
    'nav.meals': ['Comidas', 'Meals', 'Refeições'],
    'nav.shopping': ['Compras', 'Shopping', 'Compras'],
    'nav.money': ['Economía', 'Money', 'Finanças'],
    'nav.inventory': ['Inventario', 'Inventory', 'Inventário'],
    'nav.maintenance': ['Mantenimiento', 'Maintenance', 'Manutenção'],
    'nav.family': ['Familia', 'Family', 'Família'],
    'nav.docs': ['Documentos', 'Documents', 'Documentos'],
    'nav.templates': ['Plantillas', 'Templates', 'Modelos'],
    'nav.settings': ['Ajustes', 'Settings', 'Configurações'],
    'nav.more': ['Más', 'More', 'Mais'],

    'c.save': ['Guardar', 'Save', 'Salvar'],
    'c.cancel': ['Cancelar', 'Cancel', 'Cancelar'],
    'c.delete': ['Eliminar', 'Delete', 'Excluir'],
    'c.edit': ['Editar', 'Edit', 'Editar'],
    'c.add': ['Agregar', 'Add', 'Adicionar'],
    'c.close': ['Cerrar', 'Close', 'Fechar'],
    'c.ok': ['Aceptar', 'OK', 'OK'],
    'c.yes': ['Sí', 'Yes', 'Sim'],
    'c.no': ['No', 'No', 'Não'],
    'c.back': ['Atrás', 'Back', 'Voltar'],
    'c.next': ['Siguiente', 'Next', 'Avançar'],
    'c.skip': ['Omitir', 'Skip', 'Pular'],
    'c.search': ['Buscar', 'Search', 'Buscar'],
    'c.today': ['Hoy', 'Today', 'Hoje'],
    'c.tomorrow': ['Mañana', 'Tomorrow', 'Amanhã'],
    'c.yesterday': ['Ayer', 'Yesterday', 'Ontem'],
    'c.none': ['Ninguno', 'None', 'Nenhum'],
    'c.all': ['Todas', 'All', 'Todas'],
    'c.optional': ['opcional', 'optional', 'opcional'],
    'c.name': ['Nombre', 'Name', 'Nome'],
    'c.notes': ['Notas', 'Notes', 'Notas'],
    'c.category': ['Categoría', 'Category', 'Categoria'],
    'c.date': ['Fecha', 'Date', 'Data'],
    'c.time': ['Hora', 'Time', 'Hora'],
    'c.amount': ['Monto', 'Amount', 'Valor'],
    'c.apply': ['Aplicar', 'Apply', 'Aplicar'],
    'c.duplicate': ['Duplicar', 'Duplicate', 'Duplicar'],
    'c.undo': ['Deshacer', 'Undo', 'Desfazer'],
    'c.confirm': ['Confirmar', 'Confirm', 'Confirmar'],
    'c.more': ['Ver más', 'See more', 'Ver mais'],
    'c.required': ['Este dato es necesario', 'This field is required', 'Este campo é obrigatório'],
    'c.items': ['{n} elementos', '{n} items', '{n} itens'],
    'c.overdue': ['Vencido', 'Overdue', 'Atrasado'],
    'c.inDays': ['en {n} días', 'in {n} days', 'em {n} dias'],
    'c.daysAgo': ['hace {n} días', '{n} days ago', 'há {n} dias'],
    'c.demo': ['Ejemplo', 'Example', 'Exemplo'],
    'c.noDate': ['Sin fecha', 'No date', 'Sem data'],
    'c.theme': ['Cambiar tema', 'Change theme', 'Mudar tema'],
    'c.pickPhoto': ['Elegir foto', 'Choose photo', 'Escolher foto'],
    'c.removePhoto': ['Quitar foto', 'Remove photo', 'Remover foto'],
    'c.prev': ['Anterior', 'Previous', 'Anterior'],
    'c.nextP': ['Siguiente', 'Next', 'Próximo'],
    'c.total': ['Total', 'Total', 'Total'],
    'c.open': ['Abrir', 'Open', 'Abrir'],
    'c.unassigned': ['Sin asignar', 'Unassigned', 'Sem responsável'],
    'c.everyone': ['Todos', 'Everyone', 'Todos'],

    'freq.none': ['No se repite', 'Does not repeat', 'Não se repete'],
    'freq.daily': ['Todos los días', 'Every day', 'Todos os dias'],
    'freq.weekly': ['Todas las semanas', 'Every week', 'Toda semana'],
    'freq.monthly': ['Todos los meses', 'Every month', 'Todo mês'],
    'freq.yearly': ['Todos los años', 'Every year', 'Todo ano'],

    'prio.high': ['Alta', 'High', 'Alta'],
    'prio.mid': ['Media', 'Medium', 'Média'],
    'prio.low': ['Baja', 'Low', 'Baixa'],
    'prio.label': ['Prioridad', 'Priority', 'Prioridade'],

    'cat.clean': ['Limpieza', 'Cleaning', 'Limpeza'],
    'cat.kitchen': ['Cocina', 'Kitchen', 'Cozinha'],
    'cat.laundry': ['Lavandería', 'Laundry', 'Lavanderia'],
    'cat.organize': ['Organización', 'Organizing', 'Organização'],
    'cat.garden': ['Jardín', 'Garden', 'Jardim'],
    'cat.maint': ['Mantenimiento', 'Maintenance', 'Manutenção'],
    'cat.pets': ['Mascotas', 'Pets', 'Pets'],
    'cat.family': ['Actividades familiares', 'Family activities', 'Atividades em família'],

    'shop.cat.produce': ['Frutas y verduras', 'Fruits & vegetables', 'Frutas e verduras'],
    'shop.cat.meat': ['Carnes y huevos', 'Meat, fish & eggs', 'Carnes e ovos'],
    'shop.cat.dairy': ['Lácteos', 'Dairy', 'Laticínios'],
    'shop.cat.bakery': ['Panadería', 'Bakery', 'Padaria'],
    'shop.cat.cleaning': ['Limpieza', 'Cleaning', 'Limpeza'],
    'shop.cat.hygiene': ['Higiene', 'Personal care', 'Higiene'],
    'shop.cat.drinks': ['Bebidas', 'Drinks', 'Bebidas'],
    'shop.cat.other': ['Otros', 'Other', 'Outros'],

    'ev.cat.birthday': ['Cumpleaños', 'Birthday', 'Aniversário'],
    'ev.cat.appointment': ['Cita', 'Appointment', 'Consulta'],
    'ev.cat.meeting': ['Reunión', 'Meeting', 'Reunião'],
    'ev.cat.school': ['Actividad escolar', 'School activity', 'Atividade escolar'],
    'ev.cat.family': ['Evento familiar', 'Family event', 'Evento em família'],
    'ev.cat.payment': ['Pago importante', 'Important payment', 'Pagamento importante'],
    'ev.cat.maintenance': ['Mantenimiento del hogar', 'Home maintenance', 'Manutenção da casa'],
    'ev.cat.special': ['Fecha especial', 'Special date', 'Data especial'],

    'unit.g': ['g', 'g', 'g'], 'unit.kg': ['kg', 'kg', 'kg'], 'unit.ml': ['ml', 'ml', 'ml'], 'unit.l': ['l', 'l', 'l'],
    'unit.u': ['u.', 'pcs', 'un.'],
    'unit.tbsp': ['cda.', 'tbsp', 'colher de sopa'],
    'unit.tsp': ['cdta.', 'tsp', 'colher de chá'],
    'unit.cup': ['taza', 'cup', 'xícara'],

    'msg.ok': ['Listo', 'Done', 'Pronto'],
    'msg.saved': ['Guardado', 'Saved', 'Salvo'],
    'msg.deleted': ['Eliminado', 'Deleted', 'Excluído'],
    'msg.storageErr': ['No se pudo guardar en este navegador. Haz un respaldo cuanto antes.', 'Could not save in this browser. Make a backup soon.', 'Não foi possível salvar neste navegador. Faça um backup logo.'],
    'msg.p1': ['¡Muy bien!', 'Great job!', 'Muito bem!'],
    'msg.p2': ['¡Un paso más para un hogar en calma!', 'One more step to a calm home!', 'Mais um passo para um lar em paz!'],
    'msg.p3': ['¡Así se hace!', 'Nicely done!', 'Mandou bem!'],
    'msg.p4': ['¡Tarea cumplida!', 'Task complete!', 'Tarefa concluída!'],
    'msg.p5': ['¡Sigue así!', 'Keep it up!', 'Continue assim!'],
    'msg.p6': ['¡Qué buen ritmo!', 'What a great rhythm!', 'Que ritmo bom!'],
    'msg.ach': ['Logro desbloqueado: {name}', 'Achievement unlocked: {name}', 'Conquista desbloqueada: {name}']
  });
})();
