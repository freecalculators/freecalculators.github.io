/* Fractions calculator (supports mixed numbers). */
(function () {
  'use strict';
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
  function val(id) { var v = parseInt(document.getElementById(id).value, 10); return isNaN(v) ? 0 : v; }

  function read(prefix) {
    var w = val(prefix + 'w'), n = val(prefix + 'n'), d = val(prefix + 'd');
    if (document.getElementById(prefix + 'd').value === '') d = 1;
    var top = w < 0 ? w * d - Math.abs(n) : w * d + n;
    return { n: top, d: d, w: w, rawN: n };
  }
  function show(f) {
    var g = gcd(f.n, f.d), n = f.n / g, d = f.d / g;
    if (d < 0) { n = -n; d = -d; }
    return { n: n, d: d };
  }
  function mixed(n, d) {
    if (d === 1) return String(n);
    var s = n < 0 ? '−' : '', a = Math.abs(n), w = Math.floor(a / d), r = a % d;
    if (w === 0) return s + r + '/' + d;
    return s + w + ' ' + r + '/' + d;
  }
  function fr(n, d) { return d === 1 ? String(n) : n + '/' + d; }

  function calc() {
    var out = document.getElementById('fracResult');
    var a = read('a'), b = read('b'), op = document.getElementById('fop').value;
    if (a.d === 0 || b.d === 0) { out.innerHTML = '<p class="err">A denominator cannot be zero.</p>'; return; }
    var rn, rd, steps = [];
    steps.push('Convert to improper fractions: ' + fr(a.n, a.d) + ' and ' + fr(b.n, b.d) + '.');
    if (op === '+' || op === '−') {
      var L = lcm(a.d, b.d), an = a.n * (L / a.d), bn = b.n * (L / b.d);
      steps.push('Common denominator (LCM of ' + a.d + ' and ' + b.d + ') is ' + L + ': ' + an + '/' + L + ' and ' + bn + '/' + L + '.');
      rn = op === '+' ? an + bn : an - bn; rd = L;
      steps.push((op === '+' ? 'Add' : 'Subtract') + ' the numerators: ' + an + (op === '+' ? ' + ' : ' − ') + bn + ' = ' + rn + ', giving ' + rn + '/' + rd + '.');
    } else if (op === '×') {
      rn = a.n * b.n; rd = a.d * b.d;
      steps.push('Multiply numerators and denominators: (' + a.n + ' × ' + b.n + ') / (' + a.d + ' × ' + b.d + ') = ' + rn + '/' + rd + '.');
    } else {
      if (b.n === 0) { out.innerHTML = '<p class="err">You cannot divide by zero.</p>'; return; }
      rn = a.n * b.d; rd = a.d * b.n;
      steps.push('Flip the second fraction and multiply: (' + a.n + ' × ' + b.d + ') / (' + a.d + ' × ' + b.n + ') = ' + rn + '/' + rd + '.');
    }
    var s = show({ n: rn, d: rd });
    steps.push('Simplify by dividing by the GCD (' + gcd(rn, rd) + '): ' + fr(s.n, s.d) + '.');
    var dec = Number((s.n / s.d).toPrecision(10));
    var html = '<div class="res-grid">' +
      '<div><span>Fraction</span><strong>' + fr(s.n, s.d).replace('-', '−') + '</strong></div>' +
      '<div><span>Mixed number</span><strong>' + mixed(s.n, s.d) + '</strong></div>' +
      '<div><span>Decimal</span><strong>' + String(dec).replace('-', '−') + '</strong></div></div>' +
      '<h3>Steps</h3><ol>' + steps.map(function (x) { return '<li>' + x.replace(/-/g, '−') + '</li>'; }).join('') + '</ol>';
    out.innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('fracForm');
    if (!form) return;
    form.addEventListener('input', calc);
    form.addEventListener('change', calc);
    form.addEventListener('submit', function (e) { e.preventDefault(); calc(); });
    calc();
  });
})();
