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
