/* Percentage calculator: four common questions, live results. */
(function () {
  'use strict';
  function fmt(v) {
    if (!isFinite(v)) return '—';
    return Number(v.toFixed(6)).toLocaleString(undefined, { maximumFractionDigits: 6 });
  }
  function num(box, name) {
    var el = box.querySelector('[name="' + name + '"]');
    var v = parseFloat(el.value);
    return isNaN(v) ? null : v;
  }

  var modes = {
    of: function (a, b) { return a === null || b === null ? '' : '<strong>' + fmt(a * b / 100) + '</strong>'; },
    is: function (a, b) {
      if (a === null || b === null) return '';
      if (b === 0) return 'Second value cannot be 0.';
      return '<strong>' + fmt(a / b * 100) + '%</strong>';
    },
    change: function (a, b) {
      if (a === null || b === null) return '';
      if (a === 0) return 'Starting value cannot be 0.';
      var c = (b - a) / Math.abs(a) * 100;
      return '<strong>' + fmt(Math.abs(c)) + '%</strong> ' + (c > 0 ? 'increase' : c < 0 ? 'decrease' : '(no change)');
    },
    add: function (a, b) {
      if (a === null || b === null) return '';
      return 'Add: <strong>' + fmt(b + b * a / 100) + '</strong><br>Subtract: <strong>' + fmt(b - b * a / 100) + '</strong>';
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-mode]').forEach(function (box) {
      var fn = modes[box.getAttribute('data-mode')];
      var out = box.querySelector('.p-result');
      function update() { out.innerHTML = fn(num(box, 'a'), num(box, 'b')); }
      box.addEventListener('input', update);
      update();
    });
  });
})();
