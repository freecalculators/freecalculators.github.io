/* Graphing calculator: plot up to three functions of x, with pan and zoom. */
(function () {
  'use strict';
  var E = window.CalcEngine;
  var cv, g, W = 0, H = 0;
  var inputs, msgs, fns = [];
  var colors = ['#2f7fd6', '#d9534f', '#2e9e5b'];
  var view = { cx: 0, cy: 0, s: 40 };

  function X(x) { return W / 2 + (x - view.cx) * view.s; }
  function Y(y) { return H / 2 - (y - view.cy) * view.s; }
  function fmt(v) { return String(Number(v.toPrecision(6))); }

  function niceStep() {
    var target = 70 / view.s, p = Math.pow(10, Math.floor(Math.log10(target))), m = target / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
  }

  function compileAll() {
    fns = inputs.map(function (inp, i) {
      var src = inp.value.trim().toLowerCase().replace(/^y\s*=/, '');
      msgs[i].textContent = '';
      if (!src) return null;
      try { return E.compile(src).f; }
      catch (e) { msgs[i].textContent = 'Cannot read this function.'; return null; }
    });
    draw();
  }

  function draw() {
    if (!W) return;
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#fff';
    g.fillRect(0, 0, W, H);
    var step = niceStep();
    var x0 = view.cx - W / 2 / view.s, x1 = view.cx + W / 2 / view.s;
    var y0 = view.cy - H / 2 / view.s, y1 = view.cy + H / 2 / view.s;
    var ax = Math.min(Math.max(Y(0), 14), H - 6), ay = Math.min(Math.max(X(0), 6), W - 30);

    g.lineWidth = 1;
    g.font = '11px Segoe UI, Arial, sans-serif';
    g.fillStyle = '#6b7280';
    var i, v;
    for (i = Math.ceil(x0 / step); i * step <= x1; i++) {
      v = i * step;
      g.strokeStyle = i === 0 ? '#444' : '#e5e8ec';
      g.beginPath(); g.moveTo(X(v) + 0.5, 0); g.lineTo(X(v) + 0.5, H); g.stroke();
      if (i !== 0) { g.textAlign = 'center'; g.fillText(fmt(v), X(v), ax + 12 > H ? ax - 4 : ax + 12); }
    }
    for (i = Math.ceil(y0 / step); i * step <= y1; i++) {
      v = i * step;
      g.strokeStyle = i === 0 ? '#444' : '#e5e8ec';
      g.beginPath(); g.moveTo(0, Y(v) + 0.5); g.lineTo(W, Y(v) + 0.5); g.stroke();
      if (i !== 0) { g.textAlign = 'left'; g.fillText(fmt(v), ay + 4, Y(v) - 3); }
    }

    g.lineWidth = 2;
    g.lineJoin = 'round';
    fns.forEach(function (f, k) {
      if (!f) return;
      g.strokeStyle = colors[k];
      g.beginPath();
      var pen = false, prev = 0;
      for (var px = 0; px <= W; px++) {
        var x = view.cx + (px - W / 2) / view.s, y;
        try { y = f({ x: x, deg: false, ans: 0 }); } catch (e) { y = NaN; }
        if (!isFinite(y)) { pen = false; continue; }
        var py = Y(y);
        if (pen && Math.abs(py - prev) > H * 1.5) pen = false;
        if (pen) g.lineTo(px, py); else g.moveTo(px, py);
        pen = true; prev = py;
      }
      g.stroke();
    });
  }

  function resize() {
    var r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function zoom(factor, mx, my) {
    if (mx === undefined) { mx = W / 2; my = H / 2; }
    var wx = view.cx + (mx - W / 2) / view.s, wy = view.cy - (my - H / 2) / view.s;
    view.s = Math.min(Math.max(view.s * factor, 0.5), 20000);
    view.cx = wx - (mx - W / 2) / view.s;
    view.cy = wy + (my - H / 2) / view.s;
    draw();
  }

  document.addEventListener('DOMContentLoaded', function () {
    cv = document.getElementById('graph');
    if (!cv) return;
    g = cv.getContext('2d');
    inputs = Array.prototype.slice.call(document.querySelectorAll('.fn-input'));
    msgs = Array.prototype.slice.call(document.querySelectorAll('.fn-msg'));
    inputs.forEach(function (i) { i.addEventListener('input', compileAll); });

    var drag = null, coords = document.getElementById('coords');
    cv.addEventListener('pointerdown', function (e) {
      drag = { x: e.clientX, y: e.clientY };
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      if (coords) coords.textContent = 'x = ' + fmt(view.cx + (e.clientX - r.left - W / 2) / view.s) +
        ',  y = ' + fmt(view.cy - (e.clientY - r.top - H / 2) / view.s);
      if (!drag) return;
      view.cx -= (e.clientX - drag.x) / view.s;
      view.cy += (e.clientY - drag.y) / view.s;
      drag = { x: e.clientX, y: e.clientY };
      draw();
    });
    cv.addEventListener('pointerup', function () { drag = null; });
    cv.addEventListener('pointercancel', function () { drag = null; });
    cv.addEventListener('wheel', function (e) {
      e.preventDefault();
      var r = cv.getBoundingClientRect();
      zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });

    document.getElementById('zin').addEventListener('click', function () { zoom(1.3); });
    document.getElementById('zout').addEventListener('click', function () { zoom(1 / 1.3); });
    document.getElementById('zreset').addEventListener('click', function () {
      view = { cx: 0, cy: 0, s: 40 }; draw();
    });
    window.addEventListener('resize', resize);
    resize();
    compileAll();
  });
})();
