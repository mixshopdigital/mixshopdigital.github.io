// Mix Shop Digital · menú en el celular y filtro de soluciones por rubro
(function () {
  var b = document.querySelector('.boton-menu'), m = document.getElementById('menu');
  if (b && m) {
    b.addEventListener('click', function () {
      var abierto = m.classList.toggle('abierto');
      b.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });
    m.addEventListener('click', function (e) { if (e.target.closest('a')) { m.classList.remove('abierto'); b.setAttribute('aria-expanded', 'false'); } });
  }
  var botones = document.querySelectorAll('.rubro');
  botones.forEach(function (x) {
    x.addEventListener('click', function () {
      var r = x.getAttribute('data-rubro');
      botones.forEach(function (y) { y.setAttribute('aria-pressed', y === x ? 'true' : 'false'); });
      document.querySelectorAll('#catalogo .tarjeta[data-rubro]').forEach(function (t) {
        t.hidden = !(r === 'todos' || t.getAttribute('data-rubro') === r);
      });
    });
  });
})();

/* Video de YouTube: se carga solo al tocar (más rápido y más privado) */
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('.video-play');
  if (!b) return;
  var f = document.createElement('iframe');
  f.src = 'https://www.youtube-nocookie.com/embed/' + b.getAttribute('data-yt') + '?autoplay=1&rel=0';
  f.title = b.getAttribute('aria-label') || 'Video';
  f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  f.setAttribute('allowfullscreen', '');
  b.parentNode.replaceChild(f, b);
});

/* ===== Buscador, filtros y botones para compartir (nov 2026) ===== */
(function () {
  function limpio(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function contar() {
    if (window.goatcounter && window.goatcounter.bind_events) { try { window.goatcounter.bind_events(); } catch (e) {} }
  }
  function marcar(grupo, boton) {
    grupo.querySelectorAll('.filtro').forEach(function (y) { y.setAttribute('aria-pressed', y === boton ? 'true' : 'false'); });
  }

  /* 1. Buscador de una lista que ya está en la página (materiales gratuitos) */
  document.querySelectorAll('[data-buscador]').forEach(function (caja) {
    var items = document.querySelectorAll(caja.getAttribute('data-buscador'));
    var campo = caja.querySelector('input');
    var vacio = caja.querySelector('.buscador-vacio');
    var tema = 'todos';
    function aplicar() {
      var q = limpio(campo ? campo.value : '').trim();
      var visibles = 0;
      items.forEach(function (it) {
        var ok = (tema === 'todos' || it.getAttribute('data-tema') === tema) && (!q || limpio(it.textContent).indexOf(q) !== -1);
        it.hidden = !ok;
        if (ok) visibles++;
      });
      if (vacio) vacio.hidden = visibles > 0;
    }
    if (campo) campo.addEventListener('input', aplicar);
    caja.querySelectorAll('.filtro').forEach(function (b) {
      b.addEventListener('click', function () { tema = b.getAttribute('data-filtro'); marcar(b.parentNode, b); aplicar(); });
    });
  });

  /* 2. Buscador de Mundo Infantil: lee las carpetas y busca en todas */
  var caja = document.querySelector('[data-buscador-ninos]');
  if (caja) {
    var carpetas = [['colorear/', 'colorear', 'Para colorear'], ['cuentos/', 'cuentos', 'Cuento'], ['juegos/', 'juegos', 'Juego'], ['chiquitos/', 'actividades', 'Actividad'], ['grandes/', 'actividades', 'Actividad']];
    var campo = caja.querySelector('input');
    var salida = document.getElementById('res-ninos');
    var cuenta = document.getElementById('cuenta-ninos');
    var datos = null, pedido = null, edad = 'todas', tipo = 'todos';
    function edades(txt) {
      var m = /(\d+)\s*a\s*(\d+)\s*a[nñ]os/i.exec(txt);
      if (m) return [+m[1], +m[2]];
      m = /desde\s*(?:los\s*)?(\d+)\s*a[nñ]os/i.exec(txt);
      if (m) return [+m[1], 12];
      return null;
    }
    function cargar() {
      if (pedido) return pedido;
      pedido = Promise.all(carpetas.map(function (c) {
        return fetch(c[0]).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }).then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var base = new URL(c[0], location.href).href;
          var et = doc.querySelector('.ni-etiqueta');
          var deCarpeta = edades(et ? et.textContent : '');
          return Array.prototype.map.call(doc.querySelectorAll('article.ni-card[id]'), function (a) {
            var h = a.querySelector('h3'), p = a.querySelector('p'), img = a.querySelector('img');
            var sello = a.querySelector('.ni-sello'), chips = a.querySelector('.chips');
            var e = edades((sello ? sello.textContent : '') + ' ' + (chips ? chips.textContent : '')) || deCarpeta;
            return {
              id: a.id, titulo: h ? h.textContent.trim() : '', desc: p ? p.textContent.trim() : '',
              img: img ? new URL(img.getAttribute('src'), base).href : '', alt: img ? img.getAttribute('alt') || '' : '',
              edad: e, tipo: c[1], nombre: c[2], url: base + '#' + a.id,
              texto: limpio(a.textContent)
            };
          });
        });
      })).then(function (listas) {
        var vistos = {}; datos = [];
        listas.forEach(function (l) { l.forEach(function (m) { if (!vistos[m.id]) { vistos[m.id] = 1; datos.push(m); } }); });
        return datos;
      });
      return pedido;
    }
    function pintar() {
      var q = limpio(campo.value).trim();
      if (!q && edad === 'todas' && tipo === 'todos') { salida.hidden = true; salida.innerHTML = ''; cuenta.hidden = true; return; }
      cargar().then(function (d) {
        var r = edad === 'todas' ? null : edad.split('-').map(Number);
        var lista = d.filter(function (m) {
          if (tipo !== 'todos' && m.tipo !== tipo) return false;
          if (r && m.edad && (m.edad[1] < r[0] || m.edad[0] > r[1])) return false;
          return !q || m.texto.indexOf(q) !== -1;
        });
        salida.innerHTML = '';
        lista.forEach(function (m) {
          var a = document.createElement('a'); a.className = 'mi-res'; a.href = m.url;
          var i = document.createElement('img'); i.src = m.img; i.alt = ''; i.loading = 'lazy'; i.width = 96; i.height = 72;
          var caja2 = document.createElement('div');
          var s = document.createElement('strong'); s.textContent = m.titulo;
          var sp = document.createElement('span');
          sp.textContent = m.nombre + (m.edad ? ' · ' + (m.edad[1] >= 12 && m.edad[0] <= 2 ? 'de 2 a 12 años' : 'de ' + m.edad[0] + ' a ' + m.edad[1] + ' años') : '');
          caja2.appendChild(s); caja2.appendChild(sp); a.appendChild(i); a.appendChild(caja2); salida.appendChild(a);
        });
        cuenta.hidden = false; salida.hidden = false;
        cuenta.textContent = lista.length === 0 ? 'No encontramos nada con esa búsqueda. Probá con otra palabra o con otra edad.' : (lista.length === 1 ? '1 material encontrado' : lista.length + ' materiales encontrados');
      });
    }
    campo.addEventListener('focus', cargar);
    campo.addEventListener('input', pintar);
    caja.querySelectorAll('.filtro').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.hasAttribute('data-edad')) edad = b.getAttribute('data-edad'); else tipo = b.getAttribute('data-tipo');
        marcar(b.parentNode, b); pintar();
      });
    });
  }

  /* 3. Botones para compartir en cada material */
  var tarjetas = document.querySelectorAll('article.mat[id], article.ni-card[id]');
  if (tarjetas.length) {
    var canon = document.querySelector('link[rel="canonical"]');
    var pagina = (canon ? canon.href : location.href).split('#')[0];
    var og = document.querySelector('meta[property="og:image"]');
    var IC = {
      wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1c-1.2-.5-2.3-1.6-2.9-2.9l1-1-1-2L9 8.5z"/></svg>',
      fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8.5V7c0-.8.5-1 1-1h1.5V3.5h-2.2C12 3.5 11 5 11 6.8v1.7H9V11h2v9.5h3V11h2.2l.3-2.5z"/></svg>',
      pi: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3a9 9 0 0 0-3.3 17.4c-.1-.7-.1-1.8 0-2.6l1.1-4.5s-.3-.6-.3-1.4c0-1.300.8-2.300 1.700-2.300.8 0 1.200.6 1.200 1.300 0 .8-.5 2-.8 3.100-.2.9.5 1.700 1.400 1.700 1.700 0 2.900-1.800 2.900-4.300 0-2.200-1.600-3.800-3.900-3.800a4 4 0 0 0-4.200 4c0 .800.3 1.600.7 2.100.1.100.1.200.1.300l-.3 1c0 .200-.1.200-.3.100-1.100-.5-1.800-2.100-1.800-3.400 0-2.800 2-5.300 5.800-5.300 3 0 5.400 2.200 5.400 5.100 0 3-1.900 5.500-4.600 5.500-.9 0-1.700-.5-2-1l-.5 2.100c-.2.800-.7 1.700-1.100 2.300A9 9 0 1 0 12 3z"/></svg>'
    };
    tarjetas.forEach(function (t) {
      var h = t.querySelector('h3');
      var titulo = h ? h.textContent.trim() : document.title;
      var url = pagina + '#' + t.id;
      var img = t.querySelector('.ni-foto img');
      var foto = img ? new URL(img.getAttribute('src'), location.href).href : (og ? og.content : '');
      var texto = titulo + ' · gratis en Mix Shop Digital';
      var ruta = 'compartir/' + t.id + '/';
      var fila = document.createElement('div');
      fila.className = 'compartir';
      fila.innerHTML = '<span>Compartir:</span>' +
        '<a class="c-wa" target="_blank" rel="noopener" aria-label="Compartir por WhatsApp" href="https://wa.me/?text=' + encodeURIComponent(texto + ' ' + url) + '" data-goatcounter-click="' + ruta + 'whatsapp">' + IC.wa + '</a>' +
        '<a class="c-fb" target="_blank" rel="noopener" aria-label="Compartir en Facebook" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '" data-goatcounter-click="' + ruta + 'facebook">' + IC.fb + '</a>' +
        '<a class="c-pi" target="_blank" rel="noopener" aria-label="Guardar en Pinterest" href="https://www.pinterest.com/pin/create/button/?url=' + encodeURIComponent(url) + '&media=' + encodeURIComponent(foto) + '&description=' + encodeURIComponent(texto) + '" data-goatcounter-click="' + ruta + 'pinterest">' + IC.pi + '</a>';
      (t.querySelector('.mat-cuerpo') || t).appendChild(fila);
    });
    contar();
    window.addEventListener('load', contar);
  }
})();
