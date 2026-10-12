/* Love calculator: fun, deterministic score from two names. */
(function () {
  'use strict';
  function score(a, b) {
    var s = [a, b].map(function (x) { return x.trim().toLowerCase().replace(/\s+/g, ' '); }).sort().join('|');
    var h = 7;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003;
    return 45 + (h % 56);
  }
  function message(p) {
    if (p >= 90) return 'A match made in heaven! Just for fun, of course.';
    if (p >= 75) return 'Strong chemistry. Go and plan something special!';
    if (p >= 60) return 'Good vibes. A little effort makes it even better.';
    return 'Opposites attract! Good communication is the real secret.';
  }
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('loveForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var a = form.elements.n1.value, b = form.elements.n2.value;
      var out = document.getElementById('loveResult');
      if (!a.trim() || !b.trim()) { out.innerHTML = '<p class="err">Please enter both names.</p>'; return; }
      var p = score(a, b);
      out.innerHTML = '<div class="heart-box"><svg viewBox="0 0 100 90" aria-hidden="true"><defs><clipPath id="hc"><rect x="0" y="' + (90 - 90 * p / 100) + '" width="100" height="90"/></clipPath></defs>' +
        '<path d="M50 86 C10 56 2 36 2 24 C2 11 12 3 25 3 C36 3 45 9 50 18 C55 9 64 3 75 3 C88 3 98 11 98 24 C98 36 90 56 50 86Z" fill="#f4c7cf"/>' +
        '<path clip-path="url(#hc)" d="M50 86 C10 56 2 36 2 24 C2 11 12 3 25 3 C36 3 45 9 50 18 C55 9 64 3 75 3 C88 3 98 11 98 24 C98 36 90 56 50 86Z" fill="#dc5468"/></svg>' +
        '<div class="heart-pct">' + p + '%</div></div><p class="love-msg"></p>';
      out.querySelector('.love-msg').textContent = a.trim() + ' + ' + b.trim() + ': ' + message(p);
    });
  });
})();
