/* Calculadoras gratuitas de Mix Shop Digital.
   Valores legales: actualizar acá cuando cambie el salario mínimo.
   Fuente: Decreto N.º 6225/2026 y Resolución MTESS N.º 670/2026 (rige desde el 1 de julio de 2026);
   Código del Trabajo, Ley N.º 213/93 (arts. 87, 90, 91, 92, 218, 221, 234, 243, 244, 261 a 263). */
(function () {
  var LEY = { SM: 3044000, JORNAL: 117077, IPS_OBRERO: 0.09, IPS_PATRONAL: 0.165, BONIF: 0.05 };

  function $(id) { return document.getElementById(id); }
  function num(id) {
    var e = $(id); if (!e) return 0;
    var v = String(e.value || '').replace(/[^\d]/g, '');
    return v ? parseInt(v, 10) : 0;
  }
  function dec(id) {
    var e = $(id); if (!e) return 0;
    var v = parseFloat(String(e.value || '').replace(',', '.'));
    return isFinite(v) && v > 0 ? v : 0;
  }
  function miles(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function gs(n) { return (n < 0 ? '− ' : '') + 'G. ' + miles(Math.abs(n)); }
  function pon(id, txt) { var e = $(id); if (e) e.textContent = txt; }
  function fila(id, visible) { var e = $(id); if (e) e.hidden = !visible; }
  function fecha(id) {
    var e = $(id); if (!e || !e.value) return null;
    var p = e.value.split('-'); if (p.length !== 3) return null;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d) ? null : d;
  }
  /* Diferencia entre dos fechas en años, meses y días completos */
  function difer(a, b) {
    var y = b.getFullYear() - a.getFullYear(), m = b.getMonth() - a.getMonth(), d = b.getDate() - a.getDate();
    if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return { y: y, m: m, d: d };
  }
  function textoAnt(t) {
    var p = [];
    if (t.y) p.push(t.y + (t.y === 1 ? ' año' : ' años'));
    if (t.m) p.push(t.m + (t.m === 1 ? ' mes' : ' meses'));
    if (t.d || !p.length) p.push(t.d + (t.d === 1 ? ' día' : ' días'));
    return p.join(', ');
  }
  function masDeAnios(t, n) { return t.y > n || (t.y === n && (t.m > 0 || t.d > 0)); }
  function diasPreaviso(t) { return masDeAnios(t, 10) ? 90 : masDeAnios(t, 5) ? 60 : masDeAnios(t, 1) ? 45 : 30; }
  function diasVacaciones(t) { return masDeAnios(t, 10) ? 30 : masDeAnios(t, 5) ? 18 : 12; }
  function radio(nombre) { var e = document.querySelector('input[name="' + nombre + '"]:checked'); return e ? e.value : ''; }

  /* Separador de miles mientras se escribe */
  document.querySelectorAll('input[data-gs]').forEach(function (i) {
    i.addEventListener('input', function () { var v = i.value.replace(/[^\d]/g, ''); i.value = v ? miles(parseInt(v, 10)) : ''; });
  });

  function conectar(raiz, calcular, resumen) {
    raiz.querySelectorAll('input,select').forEach(function (e) { e.addEventListener('input', calcular); e.addEventListener('change', calcular); });
    var lim = raiz.querySelector('[data-limpiar]');
    if (lim) lim.addEventListener('click', function () {
      raiz.querySelectorAll('input[type=text],input[type=number],input[type=date]').forEach(function (e) { e.value = e.getAttribute('data-inicial') || ''; });
      calcular();
    });
    var cop = raiz.querySelector('[data-copiar]');
    if (cop) cop.addEventListener('click', function () {
      var t = resumen() + '\nCalculado en mixshopdigital.com.py';
      var listo = function () { var o = cop.textContent; cop.textContent = '¡Copiado!'; setTimeout(function () { cop.textContent = o; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(listo, function () {});
    });
    calcular();
  }

  /* ---------- 1. Liquidación por despido o renuncia ---------- */
  var liq = $('calc-liq');
  if (liq) {
    var ultimoLiq = '';
    conectar(liq, function () {
      var motivo = radio('motivo'), sal = num('liq-salario'), a = fecha('liq-ingreso'), b = fecha('liq-salida');
      var diario = sal / 30, ok = sal > 0 && a && b && b > a;
      fila('liq-aviso', !!(a && b && b <= a));
      var t = ok ? difer(a, b) : { y: 0, m: 0, d: 0 };
      var dp = diasPreaviso(t), conPreaviso = $('liq-preaviso').value === 'si';
      var anios = t.y + ((t.m > 6 || (t.m === 6 && t.d > 0)) ? 1 : 0);
      var indem = ok && motivo === 'despido' ? 15 * diario * anios : 0;
      var prea = ok && motivo === 'despido' && !conPreaviso ? dp * diario : 0;
      var vacC = ok ? num('liq-vac') * diario : 0;
      var dv = diasVacaciones(t);
      var vacP = ok ? dv * ((t.m + t.d / 30) / 12) * diario : 0;
      var agu = 0;
      if (ok) {
        var ini = new Date(b.getFullYear(), 0, 1); if (a > ini) ini = a;
        var ta = difer(ini, b); agu = sal * (ta.m + ta.d / 30) / 12;
      }
      var dias = ok ? Math.min(num('liq-dias'), 31) * diario : 0;
      var total = indem + prea + vacC + vacP + agu + dias;
      pon('liq-total', gs(total));
      pon('liq-ant', ok ? textoAnt(t) : '—');
      pon('liq-indem', gs(indem)); pon('liq-indem-d', ok && motivo === 'despido' ? '15 jornales × ' + anios + (anios === 1 ? ' año' : ' años') : '');
      pon('liq-prea', gs(prea)); pon('liq-prea-d', ok && motivo === 'despido' && !conPreaviso ? dp + ' días' : '');
      pon('liq-vacc', gs(vacC)); pon('liq-vacp', gs(vacP)); pon('liq-agu', gs(agu)); pon('liq-diast', gs(dias));
      fila('liq-f-indem', motivo === 'despido'); fila('liq-f-prea', motivo === 'despido');
      var debe = ok && motivo === 'renuncia' && !conPreaviso;
      fila('liq-debe', debe);
      if (debe) pon('liq-debe-m', gs(dp * diario / 2));
      fila('liq-estab', ok && motivo === 'despido' && t.y >= 10);
      pon('liq-prea-rot', motivo === 'renuncia' ? '¿Diste el preaviso a tu empleador?' : '¿Te dieron el preaviso?');
      ultimoLiq = 'Liquidación estimada (' + (motivo === 'despido' ? 'despido sin causa' : motivo === 'renuncia' ? 'renuncia' : 'despido con causa') + '): ' + gs(total) +
        '\nAntigüedad: ' + (ok ? textoAnt(t) : '—') + (indem ? '\nIndemnización: ' + gs(indem) : '') + (prea ? '\nPreaviso: ' + gs(prea) : '') +
        '\nVacaciones: ' + gs(vacC + vacP) + '\nAguinaldo proporcional: ' + gs(agu) + (dias ? '\nDías trabajados: ' + gs(dias) : '');
    }, function () { return ultimoLiq; });
  }

  /* ---------- 2. Salario neto e IPS ---------- */
  var neto = $('calc-neto');
  if (neto) {
    var ultimoNeto = '';
    conectar(neto, function () {
      var bruto = num('neto-bruto'), extra = num('neto-extra'), hijos = Math.min(num('neto-hijos'), 20);
      var base = bruto + extra, ips = base * LEY.IPS_OBRERO, pat = base * LEY.IPS_PATRONAL;
      var corresponde = hijos > 0 && bruto > 0 && bruto <= 2 * LEY.SM;
      var bon = corresponde ? hijos * LEY.BONIF * LEY.SM : 0;
      pon('neto-total', gs(base - ips + bon));
      pon('neto-base', gs(base)); pon('neto-ips', gs(-ips)); pon('neto-bon', gs(bon));
      pon('neto-pat', gs(pat)); pon('neto-costo', gs(base + pat + bon));
      pon('neto-dia', gs(bruto / 30)); pon('neto-hora', gs(bruto / 240));
      pon('neto-sm', bruto ? (bruto / LEY.SM).toFixed(2).replace('.', ',') + ' salarios mínimos' : '—');
      fila('neto-f-bon', hijos > 0);
      fila('neto-sinbon', hijos > 0 && bruto > 2 * LEY.SM);
      fila('neto-bajo', bruto > 0 && bruto < LEY.SM);
      ultimoNeto = 'Salario bruto: ' + gs(base) + '\nAporte IPS (9 %): ' + gs(ips) + (bon ? '\nBonificación familiar: ' + gs(bon) : '') + '\nSalario neto: ' + gs(base - ips + bon) + '\nCosto para el empleador: ' + gs(base + pat + bon);
    }, function () { return ultimoNeto; });
  }

  /* ---------- 3. Horas extras ---------- */
  var hex = $('calc-hex');
  if (hex) {
    var ultimoHex = '';
    conectar(hex, function () {
      var modo = radio('hexmodo'), monto = num('hex-monto');
      var hora = modo === 'jornal' ? monto / 8 : monto / 240;
      var hd = dec('hex-hd'), hn = dec('hex-hn'), hf = dec('hex-hf'), ho = dec('hex-ho');
      var vd = hd * hora * 1.5, vn = hn * hora * 1.3 * 2, vf = hf * hora * 2, vo = ho * hora * 0.3;
      pon('hex-rot', modo === 'jornal' ? 'Jornal diario (G.)' : 'Salario mensual (G.)');
      pon('hex-total', gs(vd + vn + vf + vo));
      pon('hex-hora', gs(hora)); pon('hex-vd', gs(vd)); pon('hex-vn', gs(vn)); pon('hex-vf', gs(vf)); pon('hex-vo', gs(vo));
      pon('hex-pd', gs(hora * 1.5)); pon('hex-pn', gs(hora * 2.6)); pon('hex-pf', gs(hora * 2));
      fila('hex-tope', hd + hn > 0 && (hd + hn) > 3 * 26);
      ultimoHex = 'Horas extras y recargos: ' + gs(vd + vn + vf + vo) + '\nValor de la hora normal: ' + gs(hora) +
        (vd ? '\nExtras diurnas (' + hd + ' h): ' + gs(vd) : '') + (vn ? '\nExtras nocturnas (' + hn + ' h): ' + gs(vn) : '') +
        (vf ? '\nFeriados (' + hf + ' h): ' + gs(vf) : '') + (vo ? '\nRecargo nocturno (' + ho + ' h): ' + gs(vo) : '');
    }, function () { return ultimoHex; });
  }

  /* ---------- 4. Vacaciones ---------- */
  var vac = $('calc-vac');
  if (vac) {
    var ultimoVac = '';
    conectar(vac, function () {
      var sal = num('vac-salario'), a = fecha('vac-ingreso'), hoy = new Date(); hoy.setHours(0, 0, 0, 0);
      var ok = a && a < hoy, t = ok ? difer(a, hoy) : { y: 0, m: 0, d: 0 };
      var dias = diasVacaciones(t), diario = sal / 30, monto = ok && t.y >= 1 ? dias * diario : 0;
      pon('vac-total', gs(monto));
      pon('vac-ant', ok ? textoAnt(t) : '—');
      pon('vac-dias', ok ? (t.y >= 1 ? dias + ' días hábiles corridos' : 'Todavía no cumplís el primer año') : '—');
      pon('vac-dia', gs(diario));
      var prox = '—';
      if (ok) {
        if (t.y < 1) { var f1 = new Date(a.getFullYear() + 1, a.getMonth(), a.getDate()); prox = 'Tus primeras vacaciones: desde el ' + f1.toLocaleDateString('es-PY'); }
        else if (!masDeAnios(t, 5)) { var f5 = new Date(a.getFullYear() + 5, a.getMonth(), a.getDate() + 1); prox = 'Pasás a 18 días el ' + f5.toLocaleDateString('es-PY'); }
        else if (!masDeAnios(t, 10)) { var f10 = new Date(a.getFullYear() + 10, a.getMonth(), a.getDate() + 1); prox = 'Pasás a 30 días el ' + f10.toLocaleDateString('es-PY'); }
        else prox = 'Ya estás en el tramo máximo (30 días)';
      }
      pon('vac-prox', prox);
      pon('vac-prop', gs(ok ? dias * ((t.m + t.d / 30) / 12) * diario : 0));
      ultimoVac = 'Vacaciones: ' + (ok && t.y >= 1 ? dias + ' días hábiles' : '—') + '\nPago de vacaciones: ' + gs(monto) + '\nAntigüedad: ' + (ok ? textoAnt(t) : '—');
    }, function () { return ultimoVac; });
  }

  /* ---------- 5. Préstamos ---------- */
  var pre = $('calc-pre');
  if (pre) {
    var ultimoPre = '';
    conectar(pre, function () {
      var m = num('pre-monto'), tasa = dec('pre-tasa'), n = Math.min(num('pre-plazo'), 480);
      var i = tasa / 100 / 12, cuota = 0;
      if (m > 0 && n > 0) cuota = i > 0 ? m * i / (1 - Math.pow(1 + i, -n)) : m / n;
      var total = cuota * n;
      pon('pre-total', gs(cuota)); pon('pre-pagar', gs(total)); pon('pre-int', gs(Math.max(total - m, 0)));
      pon('pre-porc', m > 0 && total > 0 ? Math.round((total - m) / m * 100) + ' % más que lo prestado' : '—');
      var cuerpo = $('pre-tabla'); cuerpo.innerHTML = '';
      var saldo = m;
      for (var k = 1; k <= n && cuota > 0; k++) {
        var inte = saldo * i, cap = cuota - inte; saldo = Math.max(saldo - cap, 0);
        var tr = document.createElement('tr');
        [k, gs(cuota), gs(cap), gs(inte), gs(saldo)].forEach(function (v) { var td = document.createElement('td'); td.textContent = v; tr.appendChild(td); });
        cuerpo.appendChild(tr);
      }
      fila('pre-detalle', cuota > 0);
      ultimoPre = 'Préstamo de ' + gs(m) + ' a ' + n + ' meses con ' + String(tasa).replace('.', ',') + ' % anual\nCuota mensual: ' + gs(cuota) + '\nTotal a pagar: ' + gs(total) + '\nIntereses: ' + gs(Math.max(total - m, 0));
    }, function () { return ultimoPre; });
  }

  /* ---------- 6. Salario mínimo: conversor ---------- */
  var smi = $('calc-sm');
  if (smi) {
    var ultimoSm = '';
    conectar(smi, function () {
      var d = dec('sm-dias'), h = dec('sm-horas'), s = num('sm-salario');
      pon('sm-rd', gs(d * LEY.JORNAL)); pon('sm-rh', gs(h * LEY.JORNAL / 8));
      pon('sm-total', gs(d * LEY.JORNAL + h * LEY.JORNAL / 8));
      pon('sm-veces', s ? (s / LEY.SM).toFixed(2).replace('.', ',') + ' veces el salario mínimo' : '—');
      pon('sm-dif', s ? (s >= LEY.SM ? gs(s - LEY.SM) + ' por encima del mínimo' : gs(LEY.SM - s) + ' por debajo del mínimo') : '—');
      ultimoSm = 'Salario mínimo en Paraguay: ' + gs(LEY.SM) + ' por mes y ' + gs(LEY.JORNAL) + ' por jornal' + (d || h ? '\n' + d + ' jornales y ' + h + ' horas: ' + gs(d * LEY.JORNAL + h * LEY.JORNAL / 8) : '');
    }, function () { return ultimoSm; });
  }
})();
