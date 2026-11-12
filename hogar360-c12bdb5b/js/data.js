/* HomeFlow 360 — starter content: ingredients, recipes, templates, maintenance presets, demo data */
(function () {
  'use strict';
  var HF = window.HF;
  var LI = { es: 0, en: 1, pt: 2 };
  HF.L = function (arr, lang) { lang = lang || HF.lang(); return arr[LI[lang]] || arr[1]; };

  /* ---------- quantity helpers ---------- */
  HF.UNITS = ['g', 'kg', 'ml', 'l', 'u', 'tbsp', 'tsp', 'cup'];
  var UMAP = { un: 'u', pcs: 'u', u: 'u', cda: 'tbsp', cdta: 'tsp', taza: 'cup', tazas: 'cup', cups: 'cup' };
  HF.parseQtyLine = function (line) {
    line = String(line || '').trim(); if (!line) return null;
    var m = line.match(/^(\d+(?:[.,]\d+)?|\d+\/\d+)\s*(kg|g|ml|l|u|un|pcs|tbsp|tsp|cup|cups|cda|cdta|taza|tazas)?\s+(.+)$/i);
    if (m) {
      var q = m[1], qty;
      if (q.indexOf('/') > 0) { var p = q.split('/'); qty = parseFloat(p[0]) / parseFloat(p[1]); } else qty = parseFloat(q.replace(',', '.'));
      var u = (m[2] || 'u').toLowerCase(); u = UMAP[u] || u;
      return { qty: qty || 1, unit: HF.UNITS.indexOf(u) >= 0 ? u : 'u', name: m[3].trim() };
    }
    return { qty: 1, unit: 'u', name: line };
  };
  HF.qtyStr = function (qty, unit) {
    if (qty == null || qty === '') return '';
    return unit && unit !== 'u' ? HF.num(qty) + ' ' + HF.t('unit.' + unit) : HF.num(qty);
  };

  /* ---------- ingredients (name es/en/pt, shopping category) ---------- */
  var ING = {
    egg: ['huevos', 'eggs', 'ovos', 'meat'], milk: ['leche', 'milk', 'leite', 'dairy'], flour: ['harina', 'flour', 'farinha', 'other'],
    sugar: ['azúcar', 'sugar', 'açúcar', 'other'], butter: ['mantequilla', 'butter', 'manteiga', 'dairy'], honey: ['miel', 'honey', 'mel', 'other'],
    onion: ['cebolla', 'onion', 'cebola', 'produce'], bellpepper: ['pimiento', 'bell pepper', 'pimentão', 'produce'], cheese: ['queso', 'cheese', 'queijo', 'dairy'],
    salt: ['sal', 'salt', 'sal', 'other'], oil: ['aceite de oliva', 'olive oil', 'azeite', 'other'], oats: ['avena', 'oats', 'aveia', 'other'],
    banana: ['banana', 'banana', 'banana', 'produce'], cinnamon: ['canela', 'cinnamon', 'canela', 'other'], yogurt: ['yogur', 'yogurt', 'iogurte', 'dairy'],
    granola: ['granola', 'granola', 'granola', 'other'], fruit: ['fruta de estación', 'seasonal fruit', 'fruta da estação', 'produce'],
    spaghetti: ['espaguetis', 'spaghetti', 'espaguete', 'other'], beef: ['carne molida', 'ground beef', 'carne moída', 'meat'],
    tomsauce: ['salsa de tomate', 'tomato sauce', 'molho de tomate', 'other'], garlic: ['dientes de ajo', 'garlic cloves', 'dentes de alho', 'produce'],
    rice: ['arroz', 'rice', 'arroz', 'other'], chicken: ['pechuga de pollo', 'chicken breast', 'peito de frango', 'meat'], peas: ['arvejas', 'peas', 'ervilhas', 'produce'],
    carrot: ['zanahoria', 'carrot', 'cenoura', 'produce'], soy: ['salsa de soja', 'soy sauce', 'molho shoyu', 'other'], lentils: ['lentejas', 'lentils', 'lentilhas', 'other'],
    potato: ['papas', 'potatoes', 'batatas', 'produce'], tortillas: ['tortillas', 'tortillas', 'tortilhas', 'bakery'], tomato: ['tomate', 'tomato', 'tomate', 'produce'],
    lettuce: ['lechuga', 'lettuce', 'alface', 'produce'], lemon: ['limón', 'lemon', 'limão', 'produce'], cucumber: ['pepino', 'cucumber', 'pepino', 'produce'],
    feta: ['queso feta', 'feta cheese', 'queijo feta', 'dairy'], olives: ['aceitunas', 'olives', 'azeitonas', 'other'], wholechicken: ['pollo entero', 'whole chicken', 'frango inteiro', 'meat'],
    currypaste: ['pasta de curry', 'curry paste', 'pasta de curry', 'other'], coconut: ['leche de coco', 'coconut milk', 'leite de coco', 'other'],
    veg: ['verduras variadas', 'mixed vegetables', 'legumes variados', 'produce']
  };
  var NAME2CAT = null;
  function buildNameMap() {
    NAME2CAT = {};
    Object.keys(ING).forEach(function (k) { for (var i = 0; i < 3; i++) NAME2CAT[ING[k][i].toLowerCase()] = ING[k][3]; });
  }
  var KW = [
    ['hygiene', ['papel higi', 'toilet paper', 'shampoo', 'champú', 'champu', 'toothpaste', 'pasta dental', 'creme dental', 'desodor', 'deodorant', 'pañal', 'diaper', 'fralda', 'sabonete', 'jabón de tocador', 'cepillo de dientes', 'toothbrush']],
    ['cleaning', ['detergent', 'dish soap', 'lavavajilla', 'lava-lou', 'lavandina', 'bleach', 'cloro', 'esponja', 'sponge', 'esponj', 'suavizante', 'softener', 'amaciante', 'trash bag', 'bolsa de basura', 'saco de lixo', 'limpiador', 'cleaner', 'limpa', 'jabón', 'jabon', 'soap', 'sabão']],
    ['drinks', ['agua', 'water', 'água', 'jugo', 'juice', 'suco', 'refresco', 'soda', 'cerveza', 'beer', 'cerveja', 'vino', 'wine', 'vinho', 'café', 'coffee', 'cafe', ' té', 'tea', 'chá', 'gaseosa']],
    ['meat', ['carne', 'beef', 'pollo', 'chicken', 'frango', 'pescado', 'fish', 'peixe', 'cerdo', 'pork', 'porco', 'jamón', 'jamon', 'ham', 'salmon', 'salmón', 'atún', 'tuna', 'salchicha', 'sausage', 'linguiça', 'bacon']],
    ['dairy', ['leche', 'milk', 'leite', 'queso', 'cheese', 'queijo', 'yogur', 'yogurt', 'iogurte', 'mantequilla', 'butter', 'manteiga', 'crema', 'cream', 'nata']],
    ['bakery', ['pan ', 'pan', 'bread', 'pão', 'tortilla', 'galleta', 'cookie', 'biscoito', 'bizcocho', 'cake', 'bolo']],
    ['produce', ['tomat', 'banan', 'apple', 'manzana', 'maçã', 'fruit', 'fruta', 'verdur', 'veg', 'legum', 'lechug', 'lettuce', 'alface', 'cebolla', 'onion', 'cebola', 'carrot', 'zanahoria', 'cenoura', 'papa', 'potato', 'batata', 'limón', 'lemon', 'limão', 'pepino', 'cucumber', 'naranja', 'orange', 'laranja', 'uva', 'grape', 'pera', 'pear', 'frutill', 'strawberr', 'morango', 'palta', 'avocado', 'abacate', 'ajo', 'garlic', 'alho', 'espinaca', 'spinach', 'espinafre', 'zapallo', 'squash', 'mandioca', 'cassava']]
  ];
  HF.isEggName = function (n) { return /(^|[^a-záéíóúñãõç])(huevos?|eggs?|ovos?)($|[^a-záéíóúñãõç])/i.test(String(n || '')); };
  HF.guessShopCat = function (name) {
    if (!NAME2CAT) buildNameMap();
    var n = String(name || '').toLowerCase().trim();
    if (NAME2CAT[n]) return NAME2CAT[n];
    if (HF.isEggName(n)) return 'meat';
    var hist = HF.state.shopping.concat(HF.state.purchases.reduce(function (a, p) { return a.concat(p.items || []); }, []), HF.state.lists.reduce(function (a, l) { return a.concat(l.items || []); }, []));
    for (var i = 0; i < hist.length; i++) if (hist[i].name && hist[i].name.toLowerCase() === n) return hist[i].cat || 'other';
    for (var k = 0; k < KW.length; k++) for (var j = 0; j < KW[k][1].length; j++) if (n.indexOf(KW[k][1][j]) >= 0) return KW[k][0];
    return 'other';
  };

  /* ---------- starter recipes (each: id, category, [ingredient, qty, unit], names + steps in 3 languages) ---------- */
  var RECIPES = [
    { id: 'pancakes', cat: 'breakfast', fav: true, ing: [['flour', 200, 'g'], ['milk', 300, 'ml'], ['egg', 2, 'u'], ['sugar', 1, 'tbsp'], ['butter', 30, 'g'], ['honey', 2, 'tbsp']],
      n: ['Panqueques con miel', 'Pancakes with honey', 'Panquecas com mel'],
      s: ['Mezcla la harina, el azúcar, los huevos y la leche hasta lograr una masa lisa.\nDerrite la mantequilla en una sartén y cocina porciones de masa 2 minutos por lado.\nSirve con miel.',
        'Mix the flour, sugar, eggs and milk into a smooth batter.\nMelt the butter in a pan and cook spoonfuls of batter for 2 minutes per side.\nServe with honey.',
        'Misture a farinha, o açúcar, os ovos e o leite até obter uma massa lisa.\nDerreta a manteiga na frigideira e cozinhe porções de massa por 2 minutos de cada lado.\nSirva com mel.'] },
    { id: 'omelette', cat: 'breakfast', ing: [['egg', 3, 'u'], ['onion', 0.5, 'u'], ['bellpepper', 0.5, 'u'], ['cheese', 40, 'g'], ['salt', 0.5, 'tsp'], ['oil', 1, 'tbsp']],
      n: ['Tortilla de verduras y queso', 'Veggie & cheese omelette', 'Omelete de legumes e queijo'],
      s: ['Saltea la cebolla y el pimiento picados en aceite durante 4 minutos.\nBate los huevos con sal, vuélcalos en la sartén y agrega el queso.\nCocina 3 minutos y dobla la tortilla.',
        'Sauté the chopped onion and pepper in oil for 4 minutes.\nBeat the eggs with salt, pour into the pan and add the cheese.\nCook for 3 minutes and fold the omelette.',
        'Refogue a cebola e o pimentão picados no azeite por 4 minutos.\nBata os ovos com sal, despeje na frigideira e adicione o queijo.\nCozinhe por 3 minutos e dobre o omelete.'] },
    { id: 'oatmeal', cat: 'breakfast', ing: [['oats', 80, 'g'], ['milk', 250, 'ml'], ['banana', 1, 'u'], ['cinnamon', 1, 'tsp'], ['honey', 1, 'tbsp']],
      n: ['Avena con banana y canela', 'Oatmeal with banana & cinnamon', 'Mingau de aveia com banana e canela'],
      s: ['Calienta la leche con la avena a fuego medio, revolviendo 5 minutos.\nAgrega la canela y la miel.\nSirve con rodajas de banana.',
        'Warm the milk with the oats over medium heat, stirring for 5 minutes.\nStir in the cinnamon and honey.\nServe topped with sliced banana.',
        'Aqueça o leite com a aveia em fogo médio, mexendo por 5 minutos.\nAcrescente a canela e o mel.\nSirva com rodelas de banana.'] },
    { id: 'yogurtbowl', cat: 'breakfast', ing: [['yogurt', 300, 'g'], ['granola', 60, 'g'], ['fruit', 200, 'g'], ['honey', 1, 'tbsp']],
      n: ['Bowl de yogur, granola y fruta', 'Yogurt, granola & fruit bowl', 'Bowl de iogurte, granola e frutas'],
      s: ['Sirve el yogur en un bowl.\nAgrega la fruta picada y la granola.\nTermina con un hilo de miel.',
        'Spoon the yogurt into a bowl.\nAdd the chopped fruit and granola.\nFinish with a drizzle of honey.',
        'Coloque o iogurte em uma tigela.\nAdicione a fruta picada e a granola.\nFinalize com um fio de mel.'] },
    { id: 'bolognese', cat: 'main', fav: true, ing: [['spaghetti', 400, 'g'], ['beef', 400, 'g'], ['tomsauce', 400, 'ml'], ['onion', 1, 'u'], ['garlic', 2, 'u'], ['oil', 2, 'tbsp'], ['salt', 1, 'tsp']],
      n: ['Espaguetis con salsa de carne', 'Spaghetti with meat sauce', 'Espaguete à bolonhesa'],
      s: ['Dora la cebolla y el ajo en aceite, agrega la carne y cocina 8 minutos.\nSuma la salsa de tomate y la sal; cocina a fuego bajo 15 minutos.\nHierve los espaguetis, escúrrelos y sírvelos con la salsa.',
        'Brown the onion and garlic in oil, add the beef and cook for 8 minutes.\nAdd the tomato sauce and salt; simmer for 15 minutes.\nBoil the spaghetti, drain and serve with the sauce.',
        'Doure a cebola e o alho no azeite, acrescente a carne e cozinhe por 8 minutos.\nAdicione o molho de tomate e o sal; cozinhe em fogo baixo por 15 minutos.\nCozinhe o espaguete, escorra e sirva com o molho.'] },
    { id: 'friedrice', cat: 'main', ing: [['rice', 300, 'g'], ['chicken', 300, 'g'], ['egg', 2, 'u'], ['peas', 100, 'g'], ['carrot', 1, 'u'], ['soy', 3, 'tbsp'], ['garlic', 2, 'u'], ['oil', 2, 'tbsp']],
      n: ['Arroz frito con pollo', 'Chicken fried rice', 'Arroz frito com frango'],
      s: ['Cocina el arroz y déjalo enfriar.\nSaltea el pollo en cubos con ajo y zanahoria; agrega las arvejas y los huevos revueltos.\nSuma el arroz y la salsa de soja y mezcla 3 minutos.',
        'Cook the rice and let it cool.\nStir-fry the diced chicken with garlic and carrot; add the peas and scrambled eggs.\nAdd the rice and soy sauce and toss for 3 minutes.',
        'Cozinhe o arroz e deixe esfriar.\nRefogue o frango em cubos com alho e cenoura; junte as ervilhas e os ovos mexidos.\nAcrescente o arroz e o shoyu e misture por 3 minutos.'] },
    { id: 'lentilsoup', cat: 'light', ing: [['lentils', 300, 'g'], ['onion', 1, 'u'], ['carrot', 2, 'u'], ['potato', 1, 'u'], ['garlic', 2, 'u'], ['oil', 2, 'tbsp'], ['salt', 1, 'tsp']],
      n: ['Sopa de lentejas', 'Lentil soup', 'Sopa de lentilhas'],
      s: ['Sofríe la cebolla, el ajo y la zanahoria en aceite.\nAgrega la papa en cubos, las lentejas, la sal y 1,5 litros de agua.\nCocina 30 minutos a fuego medio.',
        'Sauté the onion, garlic and carrot in oil.\nAdd the diced potato, lentils, salt and 1.5 liters of water.\nSimmer for 30 minutes over medium heat.',
        'Refogue a cebola, o alho e a cenoura no azeite.\nAdicione a batata em cubos, as lentilhas, o sal e 1,5 litro de água.\nCozinhe por 30 minutos em fogo médio.'] },
    { id: 'tacos', cat: 'main', ing: [['tortillas', 8, 'u'], ['chicken', 400, 'g'], ['onion', 1, 'u'], ['tomato', 2, 'u'], ['lettuce', 0.5, 'u'], ['cheese', 100, 'g'], ['lemon', 1, 'u']],
      n: ['Tacos de pollo', 'Chicken tacos', 'Tacos de frango'],
      s: ['Corta el pollo en tiras y cocínalo en sartén 8 minutos con sal y limón.\nPica la cebolla, el tomate y la lechuga.\nCalienta las tortillas y arma los tacos con queso.',
        'Slice the chicken into strips and pan-cook for 8 minutes with salt and lemon.\nChop the onion, tomato and lettuce.\nWarm the tortillas and assemble the tacos with cheese.',
        'Corte o frango em tiras e cozinhe na frigideira por 8 minutos com sal e limão.\nPique a cebola, o tomate e a alface.\nAqueça as tortilhas e monte os tacos com queijo.'] },
    { id: 'greeksalad', cat: 'light', ing: [['tomato', 3, 'u'], ['cucumber', 1, 'u'], ['onion', 0.5, 'u'], ['feta', 150, 'g'], ['olives', 80, 'g'], ['oil', 3, 'tbsp'], ['lemon', 1, 'u']],
      n: ['Ensalada griega', 'Greek salad', 'Salada grega'],
      s: ['Corta el tomate, el pepino y la cebolla en trozos.\nAgrega las aceitunas y el queso feta en cubos.\nAliña con aceite, jugo de limón y sal.',
        'Cut the tomato, cucumber and onion into chunks.\nAdd the olives and cubed feta.\nDress with oil, lemon juice and salt.',
        'Corte o tomate, o pepino e a cebola em pedaços.\nAdicione as azeitonas e o queijo feta em cubos.\nTempere com azeite, suco de limão e sal.'] },
    { id: 'roastchicken', cat: 'main', ing: [['wholechicken', 1, 'u'], ['potato', 800, 'g'], ['garlic', 4, 'u'], ['oil', 2, 'tbsp'], ['lemon', 1, 'u'], ['salt', 1, 'tsp']],
      n: ['Pollo al horno con papas', 'Roast chicken with potatoes', 'Frango assado com batatas'],
      s: ['Unta el pollo con aceite, sal, ajo y limón.\nColócalo en una fuente con las papas en trozos.\nHornea a 200 °C durante 1 hora y 15 minutos.',
        'Rub the chicken with oil, salt, garlic and lemon.\nPlace it in a dish with the potatoes in chunks.\nBake at 200 °C (400 °F) for 1 hour 15 minutes.',
        'Esfregue o frango com azeite, sal, alho e limão.\nColoque em uma assadeira com as batatas em pedaços.\nAsse a 200 °C por 1 hora e 15 minutos.'] },
    { id: 'curry', cat: 'main', ing: [['currypaste', 2, 'tbsp'], ['coconut', 400, 'ml'], ['veg', 500, 'g'], ['onion', 1, 'u'], ['rice', 300, 'g'], ['garlic', 2, 'u']],
      n: ['Curry de verduras con arroz', 'Vegetable curry with rice', 'Curry de legumes com arroz'],
      s: ['Sofríe la cebolla y el ajo, agrega la pasta de curry y cocina 1 minuto.\nSuma las verduras y la leche de coco; cocina 15 minutos.\nSirve sobre arroz recién cocido.',
        'Sauté the onion and garlic, add the curry paste and cook for 1 minute.\nAdd the vegetables and coconut milk; simmer for 15 minutes.\nServe over freshly cooked rice.',
        'Refogue a cebola e o alho, junte a pasta de curry e cozinhe por 1 minuto.\nAdicione os legumes e o leite de coco; cozinhe por 15 minutos.\nSirva sobre arroz recém-cozido.'] },
    { id: 'fruitsalad', cat: 'snack', ing: [['fruit', 500, 'g'], ['lemon', 1, 'u'], ['honey', 1, 'tbsp']],
      n: ['Ensalada de frutas', 'Fruit salad', 'Salada de frutas'],
      s: ['Lava y corta la fruta en trozos.\nMezcla el jugo de limón con la miel.\nBaña la fruta y sirve fría.',
        'Wash and cut the fruit into pieces.\nMix the lemon juice with the honey.\nToss the fruit in it and serve chilled.',
        'Lave e corte as frutas em pedaços.\nMisture o suco de limão com o mel.\nRegue as frutas e sirva gelada.'] }
  ];
  HF.RECIPE_CATS = ['breakfast', 'main', 'light', 'snack'];
  HF.addDict({
    'rcat.breakfast': ['Desayuno', 'Breakfast', 'Café da manhã'], 'rcat.main': ['Plato principal', 'Main dish', 'Prato principal'],
    'rcat.light': ['Sopas y ensaladas', 'Soups & salads', 'Sopas e saladas'], 'rcat.snack': ['Merienda y postre', 'Snack & dessert', 'Lanche e sobremesa']
  });
  HF.seedRecipes = function (lang) {
    return RECIPES.map(function (r) {
      return {
        id: 'r_' + r.id, name: r.n[LI[lang]], cat: r.cat, fav: !!r.fav, seed: true,
        ingredients: r.ing.map(function (i) { return { name: ING[i[0]][LI[lang]], qty: i[1], unit: i[2], cat: ING[i[0]][3] }; }),
        steps: r.s[LI[lang]]
      };
    });
  };

  /* ---------- maintenance presets ---------- */
  HF.MAINT_PRESETS = [
    { k: 'kitchen', icon: '🍳', freq: 7, n: ['Limpieza de cocina', 'Kitchen cleaning', 'Limpeza da cozinha'] },
    { k: 'deep', icon: '🧽', freq: 30, n: ['Limpieza profunda', 'Deep cleaning', 'Limpeza profunda'] },
    { k: 'curtains', icon: '🧺', freq: 90, n: ['Lavado de cortinas', 'Washing curtains', 'Lavagem das cortinas'] },
    { k: 'windows', icon: '🪟', freq: 30, n: ['Limpieza de ventanas', 'Window cleaning', 'Limpeza das janelas'] },
    { k: 'filters', icon: '🔄', freq: 90, n: ['Cambio de filtros', 'Changing filters', 'Troca de filtros'] },
    { k: 'appliances', icon: '🔌', freq: 180, n: ['Revisión de electrodomésticos', 'Appliance check', 'Revisão dos eletrodomésticos'] },
    { k: 'garden', icon: '🌿', freq: 14, n: ['Jardinería', 'Gardening', 'Jardinagem'] },
    { k: 'ac', icon: '❄️', freq: 180, n: ['Mantenimiento del aire acondicionado', 'Air conditioner maintenance', 'Manutenção do ar-condicionado'] }
  ];
  HF.presetMaint = function (lang, demo, offsets) {
    return HF.MAINT_PRESETS.map(function (p, i) {
      return { id: HF.uid() + i, name: p.n[LI[lang]], icon: p.icon, freq: p.freq, lastDone: offsets ? HF.addDays(HF.today(), -offsets[i]) : HF.today(), notes: '', history: [], demo: !!demo };
    });
  };

  /* ---------- built-in templates (shown in the user's language; editing makes a personal copy) ---------- */
  HF.BUILTIN_TEMPLATES = [
    { id: 'b-clean-daily', kind: 'tasks', freq: 'daily', cat: 'clean', n: ['Rutina de limpieza diaria', 'Daily cleaning routine', 'Rotina de limpeza diária'], items: [
      ['Hacer las camas', 'Make the beds', 'Arrumar as camas'], ['Ordenar los espacios comunes', 'Tidy the common areas', 'Organizar as áreas comuns'],
      ['Lavar los platos', 'Wash the dishes', 'Lavar a louça'], ['Limpiar mesadas y mesa', 'Wipe counters and table', 'Limpar bancadas e mesa'],
      ['Sacar la basura', 'Take out the trash', 'Levar o lixo para fora'], ['Barrido rápido del piso', 'Quick floor sweep', 'Varrição rápida do chão']] },
    { id: 'b-clean-weekly', kind: 'tasks', freq: 'weekly', cat: 'clean', n: ['Rutina de limpieza semanal', 'Weekly cleaning routine', 'Rotina de limpeza semanal'], items: [
      ['Aspirar todas las habitaciones', 'Vacuum every room', 'Aspirar todos os cômodos'], ['Trapear los pisos', 'Mop the floors', 'Passar pano no chão'],
      ['Limpiar los baños', 'Clean the bathrooms', 'Limpar os banheiros'], ['Cambiar las sábanas', 'Change the bed sheets', 'Trocar os lençóis'],
      ['Quitar el polvo de los muebles', 'Dust the furniture', 'Tirar o pó dos móveis'], ['Limpiar espejos y vidrios', 'Clean mirrors and glass', 'Limpar espelhos e vidros']] },
    { id: 'b-org-monthly', kind: 'tasks', freq: 'monthly', cat: 'organize', n: ['Organización mensual', 'Monthly organization', 'Organização mensal'], items: [
      ['Revisar y pagar las cuentas', 'Review and pay the bills', 'Revisar e pagar as contas'], ['Ordenar un armario o cajón', 'Declutter one closet or drawer', 'Organizar um armário ou gaveta'],
      ['Limpiar la heladera por dentro', 'Clean inside the fridge', 'Limpar a geladeira por dentro'], ['Revisar vencimientos de la despensa', 'Check pantry expiry dates', 'Conferir validades da despensa'],
      ['Planificar el calendario del mes', 'Plan next month\'s calendar', 'Planejar o calendário do mês'], ['Hacer respaldo de fotos del celular', 'Back up phone photos', 'Fazer backup das fotos do celular']] },
    { id: 'b-shop-weekly', kind: 'shopping', n: ['Compras semanales', 'Weekly groceries', 'Compras da semana'], items: [
      ['2 l leche', '2 l milk', '2 l leite'], ['12 huevos', '12 eggs', '12 ovos'], ['1 pan', '1 bread', '1 pão'], ['6 bananas', '6 bananas', '6 bananas'],
      ['1 kg tomate', '1 kg tomato', '1 kg tomate'], ['1 kg papas', '1 kg potatoes', '1 kg batatas'], ['800 g pechuga de pollo', '800 g chicken breast', '800 g peito de frango'],
      ['1 kg arroz', '1 kg rice', '1 kg arroz'], ['1 aceite de oliva', '1 olive oil', '1 azeite'], ['1 detergente', '1 dish soap', '1 detergente'], ['1 papel higiénico', '1 toilet paper', '1 papel higiênico']] },
    { id: 'b-menu-weekly', kind: 'menu', n: ['Menú semanal', 'Weekly menu', 'Cardápio semanal'], items: [
      ['1|l|Arroz frito con pollo', '1|l|Chicken fried rice', '1|l|Arroz frito com frango'], ['1|d|Sopa de lentejas', '1|d|Lentil soup', '1|d|Sopa de lentilhas'],
      ['2|l|Ensalada griega', '2|l|Greek salad', '2|l|Salada grega'], ['2|d|Espaguetis con salsa de carne', '2|d|Spaghetti with meat sauce', '2|d|Espaguete à bolonhesa'],
      ['3|l|Tacos de pollo', '3|l|Chicken tacos', '3|l|Tacos de frango'], ['3|d|Tortilla de verduras y queso', '3|d|Veggie & cheese omelette', '3|d|Omelete de legumes e queijo'],
      ['4|l|Curry de verduras con arroz', '4|l|Vegetable curry with rice', '4|l|Curry de legumes com arroz'], ['4|d|Sopa de lentejas', '4|d|Lentil soup', '4|d|Sopa de lentilhas'],
      ['5|l|Pollo al horno con papas', '5|l|Roast chicken with potatoes', '5|l|Frango assado com batatas'], ['5|d|Ensalada griega', '5|d|Greek salad', '5|d|Salada grega'],
      ['6|l|Espaguetis con salsa de carne', '6|l|Spaghetti with meat sauce', '6|l|Espaguete à bolonhesa'], ['6|d|Tacos de pollo', '6|d|Chicken tacos', '6|d|Tacos de frango'],
      ['7|l|Pollo al horno con papas', '7|l|Roast chicken with potatoes', '7|l|Frango assado com batatas'], ['7|d|Ensalada de frutas', '7|d|Fruit salad', '7|d|Salada de frutas']] },
    { id: 'b-budget-family', kind: 'budget', n: ['Presupuesto familiar', 'Family budget', 'Orçamento familiar'], items: [
      ['fixed|30', 'fixed|30', 'fixed|30'], ['services|10', 'services|10', 'services|10'], ['food|25', 'food|25', 'food|25'], ['transport|10', 'transport|10', 'transport|10'],
      ['education|5', 'education|5', 'education|5'], ['health|5', 'health|5', 'health|5'], ['fun|5', 'fun|5', 'fun|5'], ['variable|5', 'variable|5', 'variable|5'], ['other|5', 'other|5', 'other|5']] },
    { id: 'b-home-maint', kind: 'maintenance', n: ['Mantenimiento del hogar', 'Home maintenance', 'Manutenção da casa'], items: HF.MAINT_PRESETS.map(function (p) {
      return [p.n[0] + '|' + p.freq, p.n[1] + '|' + p.freq, p.n[2] + '|' + p.freq];
    }) },
    { id: 'b-vacation', kind: 'tasks', freq: 'none', cat: 'family', n: ['Preparación para vacaciones', 'Vacation preparation', 'Preparação para as férias'], items: [
      ['Revisar documentos y reservas', 'Check documents and bookings', 'Conferir documentos e reservas'], ['Armar las valijas', 'Pack the bags', 'Fazer as malas'],
      ['Pausar correo y entregas', 'Pause mail and deliveries', 'Pausar correspondência e entregas'], ['Dejar quien cuide plantas y mascotas', 'Arrange care for plants and pets', 'Combinar quem cuida de plantas e pets'],
      ['Vaciar la heladera de perecederos', 'Empty the fridge of perishables', 'Esvaziar a geladeira de perecíveis'], ['Cerrar llaves de agua y gas', 'Turn off water and gas', 'Fechar água e gás'],
      ['Cargar celulares y baterías', 'Charge phones and power banks', 'Carregar celulares e baterias'], ['Cerrar puertas y ventanas', 'Lock doors and windows', 'Trancar portas e janelas']] },
    { id: 'b-moving', kind: 'tasks', freq: 'none', cat: 'organize', n: ['Organización de mudanza', 'Moving organizer', 'Organização de mudança'], items: [
      ['Contratar flete o camión', 'Book movers or a truck', 'Contratar frete ou caminhão'], ['Clasificar y donar lo que no uso', 'Sort and donate what you don\'t use', 'Separar e doar o que não usa'],
      ['Empacar por habitación y rotular cajas', 'Pack by room and label boxes', 'Embalar por cômodo e etiquetar caixas'], ['Avisar el cambio de dirección', 'Update your address', 'Avisar a mudança de endereço'],
      ['Trasladar servicios (luz, agua, internet)', 'Transfer utilities (power, water, internet)', 'Transferir serviços (luz, água, internet)'], ['Limpiar el lugar anterior', 'Clean the old place', 'Limpar o lugar anterior'],
      ['Preparar una caja de lo esencial', 'Prepare an essentials box', 'Preparar uma caixa de essenciais']] }
  ];
  HF.templateView = function (tp) {
    // resolve a template (built-in or personal) to display strings in the current language
    if (tp.builtin) {
      var li = LI[HF.lang()];
      return { id: tp.id, kind: tp.kind, freq: tp.freq, cat: tp.cat, builtin: true, name: tp.n[li], items: tp.items.map(function (i) { return i[li]; }) };
    }
    return { id: tp.id, kind: tp.kind, freq: tp.freq, cat: tp.cat, builtin: false, name: tp.name, items: tp.items || [] };
  };
  HF.allTemplates = function () {
    var hidden = HF.state.hiddenTemplates;
    var b = HF.BUILTIN_TEMPLATES.filter(function (x) { return hidden.indexOf(x.id) < 0; }).map(function (x) { return HF.templateView(Object.assign({ builtin: true }, x)); });
    var u = HF.state.templates.map(function (x) { return HF.templateView(Object.assign({ builtin: false }, x)); });
    return b.concat(u);
  };

  /* ---------- demo data (optional, removable) ---------- */
  var SCALE = { USD: 1, EUR: 0.95, GBP: 0.8, BRL: 5, PYG: 7500, MXN: 18, COP: 4000, ARS: 1000, CLP: 950, PEN: 3.7, CAD: 1.35, AUD: 1.5 };
  function nice(n) { return n >= 1000 ? Math.round(n / 100) * 100 : n >= 100 ? Math.round(n / 10) * 10 : n >= 10 ? Math.round(n) : Math.round(n * 2) / 2; }
  HF.demoMoney = function (usd) { var k = SCALE[HF.state.settings.currency] || 1; return nice(usd * k); };

  HF.seedDemo = function () {
    var S = HF.state, lang = S.settings.lang, L = function (a) { return HF.L(a, lang); }, td = HF.today(), ms = S.members, d = function (n) { return HF.addDays(td, n); }, M = HF.demoMoney;
    var m0 = ms[0] ? ms[0].id : '', m1 = ms[1] ? ms[1].id : m0, m2 = ms[2] ? ms[2].id : m1;
    var task = function (title, cat, due, rec, who, prio, rot) {
      return { id: HF.uid(), title: L(title), cat: cat, due: due, recur: rec || 'none', assignee: who || '', prio: prio || 'mid', rotate: !!rot, done: false, notes: '', demo: true };
    };
    var tasks = [
      task(['Lavar los platos', 'Wash the dishes', 'Lavar a louça'], 'kitchen', td, 'daily', m0, 'mid', true),
      task(['Aspirar la sala', 'Vacuum the living room', 'Aspirar a sala'], 'clean', d(1), 'weekly', m1, 'mid', true),
      task(['Sacar la basura', 'Take out the trash', 'Levar o lixo para fora'], 'clean', td, 'daily', m1, 'low'),
      task(['Lavar y doblar la ropa', 'Wash and fold the laundry', 'Lavar e dobrar a roupa'], 'laundry', d(2), 'weekly', m0, 'mid', true),
      task(['Regar las plantas', 'Water the plants', 'Regar as plantas'], 'garden', td, 'weekly', m2, 'low'),
      task(['Dar de comer a las mascotas', 'Feed the pets', 'Alimentar os pets'], 'pets', td, 'daily', m2, 'high'),
      task(['Llamar al plomero por la canilla', 'Call the plumber about the tap', 'Ligar para o encanador por causa da torneira'], 'maint', d(3), 'none', m0, 'high'),
      task(['Noche de juegos en familia', 'Family game night', 'Noite de jogos em família'], 'family', d(4), 'weekly', m0, 'low')
    ];
    S.tasks = S.tasks.concat(tasks);
    [1, 2, 3, 3].forEach(function (back, i) {
      var tk = tasks[i % tasks.length];
      S.log.push({ id: HF.uid(), taskId: tk.id, title: tk.title, date: d(-back), at: Date.now() - back * 864e5, memberId: tk.assignee, demo: true });
    });
    var ev = function (title, cat, date, time, rep) { return { id: HF.uid(), title: L(title), cat: cat, date: date, time: time || '', repeat: rep || 'none', notes: '', demo: true }; };
    var sunday = HF.addDays(td, (7 - HF.parse(td).getDay()) % 7 || 7);
    S.events = S.events.concat([
      ev(['Cumpleaños de la abuela', 'Grandma\'s birthday', 'Aniversário da vovó'], 'birthday', d(9), '', 'yearly'),
      ev(['Control con el dentista', 'Dentist check-up', 'Consulta no dentista'], 'appointment', d(5), '10:30'),
      ev(['Reunión de padres en la escuela', 'Parents\' meeting at school', 'Reunião de pais na escola'], 'school', d(8), '18:00'),
      ev(['Vence la cuenta de electricidad', 'Electricity bill due', 'Vence a conta de luz'], 'payment', d(6), '', 'monthly'),
      ev(['Almuerzo en casa de los abuelos', 'Lunch at the grandparents\'', 'Almoço na casa dos avós'], 'family', sunday, '12:30', 'weekly'),
      ev(['Servicio del aire acondicionado', 'Air conditioner service', 'Revisão do ar-condicionado'], 'maintenance', d(12), '09:00')
    ]);
    var it = function (n, q, u, price, cat, demoOnly) { return { id: HF.uid(), name: L(n), qty: q, unit: u, price: price, cat: cat, bought: false, demo: true }; };
    S.shopping = S.shopping.concat([
      it(['Bananas', 'Bananas', 'Bananas'], 6, 'u', M(1.5), 'produce'), it(['Tomate', 'Tomatoes', 'Tomates'], 1, 'kg', M(2.2), 'produce'),
      it(['Pechuga de pollo', 'Chicken breast', 'Peito de frango'], 800, 'g', M(6), 'meat'), it(['Leche', 'Milk', 'Leite'], 2, 'l', M(2.4), 'dairy'),
      it(['Huevos', 'Eggs', 'Ovos'], 12, 'u', M(3), 'dairy'), it(['Pan', 'Bread', 'Pão'], 1, 'u', M(1.8), 'bakery'),
      it(['Detergente', 'Dish soap', 'Detergente'], 1, 'u', M(2), 'cleaning'), it(['Jugo de naranja', 'Orange juice', 'Suco de laranja'], 1, 'l', M(2.5), 'drinks')
    ]);
    S.lists.push({ id: HF.uid(), name: L(['Básicos de la semana', 'Weekly basics', 'Básicos da semana']), demo: true, items: [
      { name: L(['Leche', 'Milk', 'Leite']), qty: 2, unit: 'l', price: M(2.4), cat: 'dairy' }, { name: L(['Pan', 'Bread', 'Pão']), qty: 1, unit: 'u', price: M(1.8), cat: 'bakery' },
      { name: L(['Huevos', 'Eggs', 'Ovos']), qty: 12, unit: 'u', price: M(3), cat: 'dairy' }] });
    S.purchases.push({ id: HF.uid(), date: d(-7), total: M(38), demo: true, items: [
      { name: L(['Arroz', 'Rice', 'Arroz']), qty: 1, unit: 'kg', price: M(1.6), cat: 'other' }, { name: L(['Manzanas', 'Apples', 'Maçãs']), qty: 1, unit: 'kg', price: M(2.2), cat: 'produce' },
      { name: L(['Queso', 'Cheese', 'Queijo']), qty: 300, unit: 'g', price: M(3.5), cat: 'dairy' }] });
    // finance
    var fcats = HF.defaultFinCats();
    S.fin.cats = S.fin.cats.length ? S.fin.cats : fcats;
    var ms0 = td.slice(0, 8) + '01', clamp = function (n) { var x = HF.addDays(td, -n); return x < ms0 ? ms0 : x; };
    var tx = function (type, cat, amt, date, note) { return { id: HF.uid(), type: type, cat: cat, amount: M(amt), date: date, note: note ? L(note) : '', demo: true }; };
    S.fin.tx = S.fin.tx.concat([
      tx('income', 'income', 2400, ms0, ['Sueldo', 'Salary', 'Salário']), tx('expense', 'fixed', 700, ms0, ['Alquiler', 'Rent', 'Aluguel']),
      tx('expense', 'services', 95, clamp(6), ['Luz y agua', 'Power & water', 'Luz e água']), tx('expense', 'services', 35, clamp(5), ['Internet', 'Internet', 'Internet']),
      tx('expense', 'food', 82, clamp(8), ['Supermercado', 'Supermarket', 'Supermercado']), tx('expense', 'food', 45, clamp(3), ['Verdulería', 'Greengrocer', 'Hortifruti']),
      tx('expense', 'food', 28, clamp(1), ['Panadería', 'Bakery', 'Padaria']), tx('expense', 'transport', 60, clamp(7), ['Combustible', 'Fuel', 'Combustível']),
      tx('expense', 'transport', 14, clamp(2), ['Transporte', 'Transit', 'Transporte']), tx('expense', 'health', 30, clamp(4), ['Farmacia', 'Pharmacy', 'Farmácia']),
      tx('expense', 'fun', 25, clamp(1), ['Cine en familia', 'Family movie', 'Cinema em família']), tx('expense', 'education', 120, clamp(9), ['Cuota escolar', 'School fee', 'Mensalidade escolar'])
    ]);
    var B = { fixed: 700, services: 150, food: 450, transport: 150, education: 120, health: 80, fun: 60, variable: 50, other: 50 };
    Object.keys(B).forEach(function (k) { if (S.fin.budgets[k] == null) S.fin.budgets[k] = M(B[k]); });
    S.settings.demoBudgets = true;
    // inventory
    var inv = function (n, cat, bought, price, wend, nm) { return { id: HF.uid(), name: L(n), cat: cat, purchaseDate: bought, price: M(price), warrantyEnd: wend, nextMaint: nm || '', notes: '', photo: null, demo: true }; };
    S.inventory = S.inventory.concat([
      inv(['Heladera', 'Refrigerator', 'Geladeira'], 'appliance', d(-540), 650, d(75)),
      inv(['Lavarropas', 'Washing machine', 'Máquina de lavar'], 'appliance', d(-300), 420, d(210), d(40)),
      inv(['Taladro con accesorios', 'Drill with accessories', 'Furadeira com acessórios'], 'tools', d(-900), 70, '')
    ]);
    // maintenance
    S.maint = S.maint.concat(HF.presetMaint(lang, true, [5, 12, 60, 34, 20, 100, 15, 170]));
    // docs
    var doc = function (n, type, due, rep, amt) { return { id: HF.uid(), title: L(n), type: type, due: due, repeat: rep || 'none', amount: amt ? M(amt) : null, notes: '', archived: false, demo: true }; };
    S.docs = S.docs.concat([
      doc(['Factura de internet', 'Internet bill', 'Fatura da internet'], 'service', d(4), 'monthly', 35),
      doc(['Renovación del seguro del hogar', 'Home insurance renewal', 'Renovação do seguro residencial'], 'insurance', d(45), 'yearly', 180),
      doc(['Suscripción de streaming', 'Streaming subscription', 'Assinatura de streaming'], 'subscription', d(8), 'monthly', 12),
      doc(['Vacunas de la mascota', 'Pet vaccines', 'Vacinas do pet'], 'reminder', d(21))
    ]);
    // meals this week
    var wk = HF.weekStart(td), slot = function (offset, s, rid, txt) { var k = HF.addDays(wk, offset); S.meals[k] = S.meals[k] || {}; S.meals[k][s] = { text: txt || '', recipeId: rid || '', demo: true }; };
    slot(0, 'dinner', 'r_bolognese'); slot(1, 'lunch', 'r_friedrice'); slot(2, 'dinner', 'r_lentilsoup'); slot(3, 'breakfast', 'r_pancakes');
    slot(4, 'lunch', 'r_tacos'); slot(5, 'dinner', 'r_roastchicken'); slot(6, 'snack', 'r_fruitsalad');
    S.settings.demo = true;
  };

  HF.finCatDefs = [
    { id: 'income', type: 'income', kind: 'income', icon: '💼' }, { id: 'fixed', type: 'expense', kind: 'fixed', icon: '🏠' },
    { id: 'variable', type: 'expense', kind: 'variable', icon: '🧾' }, { id: 'services', type: 'expense', kind: 'fixed', icon: '💡' },
    { id: 'food', type: 'expense', kind: 'variable', icon: '🍎' }, { id: 'transport', type: 'expense', kind: 'variable', icon: '🚌' },
    { id: 'education', type: 'expense', kind: 'fixed', icon: '🎓' }, { id: 'health', type: 'expense', kind: 'variable', icon: '🩺' },
    { id: 'fun', type: 'expense', kind: 'variable', icon: '🎬' }, { id: 'other', type: 'expense', kind: 'variable', icon: '📦' }
  ];
  HF.defaultFinCats = function () { return HF.finCatDefs.map(function (c) { return { id: c.id, type: c.type, kind: c.kind, icon: c.icon, name: '' }; }); };
  HF.addDict({
    'fin.cat.income': ['Ingresos del hogar', 'Household income', 'Renda da casa'], 'fin.cat.fixed': ['Gastos fijos', 'Fixed expenses', 'Gastos fixos'],
    'fin.cat.variable': ['Gastos variables', 'Variable expenses', 'Gastos variáveis'], 'fin.cat.services': ['Servicios', 'Utilities', 'Serviços'],
    'fin.cat.food': ['Alimentación', 'Food', 'Alimentação'], 'fin.cat.transport': ['Transporte', 'Transport', 'Transporte'],
    'fin.cat.education': ['Educación', 'Education', 'Educação'], 'fin.cat.health': ['Salud', 'Health', 'Saúde'],
    'fin.cat.fun': ['Entretenimiento', 'Entertainment', 'Entretenimento'], 'fin.cat.other': ['Otros gastos', 'Other expenses', 'Outras despesas']
  });
  HF.finCatName = function (c) { return c.name ? c.name : HF.t('fin.cat.' + c.id); };
})();
