/* Keypad controller for .calc widgets (scientific + standard). */
(function () {
  'use strict';
  var E = window.CalcEngine;
  var BIN = '+−×÷^';
  var POST = ['!', '%', '^2'];

  function initCalc(root) {
    var exprEl = root.querySelector('.disp-expr');
    var mainEl = root.querySelector('.disp-main');
    var histBtn = root.querySelector('.hist-btn');
    var histPanel = root.querySelector('.hist-panel');
    var delBtn = root.querySelector('.del-btn');
    var keys = root.querySelectorAll('[data-k]');
    var st = { expr: '', top: '', ans: 0, just: false, err: false, deg: true, inv: false, hist: [] };

    function render() {
      var txt = st.err ? 'Error' : (st.expr || '0');
      mainEl.textContent = txt;
      var n = txt.length;
      mainEl.style.fontSize = n > 22 ? '1.3rem' : n > 16 ? '1.7rem' : n > 11 ? '2.1rem' : '';
      exprEl.textContent = st.top;
      mainEl.scrollLeft = mainEl.scrollWidth;
    }

    function renderHist() {
      if (!histPanel) return;
      histPanel.innerHTML = '';
      if (!st.hist.length) {
        var p = document.createElement('p');
        p.className = 'hist-empty';
        p.textContent = 'No history yet.';
        histPanel.appendChild(p);
        return;
      }
      st.hist.slice(0, 30).forEach(function (h) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'hist-item';
        b.innerHTML = '<span></span><strong></strong>';
        b.firstChild.textContent = h.e + ' =';
        b.lastChild.textContent = h.r;
        b.addEventListener('click', function () {
          st.expr = h.r; st.top = ''; st.just = true; st.err = false;
          histPanel.hidden = true;
          render();
        });
        histPanel.appendChild(b);
      });
      var c = document.createElement('button');
      c.type = 'button';
      c.className = 'hist-clear';
      c.textContent = 'Clear history';
      c.addEventListener('click', function () { st.hist = []; renderHist(); });
      histPanel.appendChild(c);
    }

    function setInv(on) {
      st.inv = on;
      keys.forEach(function (b) {
        if (b.dataset.k === 'inv') b.classList.toggle('active', on);
        if (b.dataset.inv) b.innerHTML = on ? b.dataset.invLabel : b.dataset.label;
      });
    }

    function setDeg(d) {
      st.deg = d;
      keys.forEach(function (b) {
        if (b.dataset.k === 'deg') b.classList.toggle('active', d);
        if (b.dataset.k === 'rad') b.classList.toggle('active', !d);
      });
    }

    function del() {
      var m = st.expr.match(/(asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|ln\(|log\(|√\(|Ans)$/);
      st.expr = m ? st.expr.slice(0, -m[0].length) : st.expr.slice(0, -1);
    }

    function equals() {
      if (!st.expr) return;
      var src = st.expr;
      try {
        var v = E.compile(src).f({ deg: st.deg, ans: st.ans });
        var out = E.format(v);
        st.hist.unshift({ e: src, r: out });
        renderHist();
        st.top = src + ' =';
        st.ans = v;
        st.expr = out;
        st.just = true;
        st.err = false;
      } catch (e) {
        st.top = src + ' =';
        st.expr = '';
        st.err = true;
        st.just = true;
      }
    }

    function press(k) {
      if (k === 'inv') { setInv(!st.inv); return; }
      if (k === 'deg') { setDeg(true); return; }
      if (k === 'rad') { setDeg(false); return; }
      if (st.err) { st.err = false; st.expr = ''; st.top = ''; }
      if (k === 'AC') { st.expr = ''; st.top = ''; st.just = false; render(); return; }
      if (k === 'DEL') { del(); st.just = false; render(); return; }
      if (k === '=') { equals(); render(); return; }

      var isDigit = /^[0-9.]$/.test(k);
      var isBin = BIN.indexOf(k) > -1 && k.length === 1;
      var isPost = POST.indexOf(k) > -1;

      if (st.just) {
        if (!(isBin || isPost)) { st.expr = ''; st.top = ''; }
        st.just = false;
      }

      if (isDigit) {
        if (k === '.') {
          if (/[0-9]*\.[0-9]*$/.test(st.expr)) return;
          if (!/[0-9]$/.test(st.expr)) st.expr += '0';
        }
        st.expr += k;
      } else if (isBin) {
        var last = st.expr.slice(-1);
        if (!st.expr) {
          st.expr = k === '−' ? '−' : 'Ans' + k;
        } else if (BIN.indexOf(last) > -1) {
          if (k === '−' && '×÷^'.indexOf(last) > -1) st.expr += k;
          else if (st.expr.length > 1) st.expr = st.expr.slice(0, -1) + k;
        } else if (last === '(' && k !== '−') {
          /* ignore operator right after an opening bracket */
        } else {
          st.expr += k;
        }
      } else if (k === 'EXP') {
        if (/[0-9]$/.test(st.expr)) st.expr += 'E';
      } else {
        st.expr += k;
      }
      render();
    }

    keys.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.k;
        if (st.inv && b.dataset.inv) k = b.dataset.inv;
        press(k);
        b.blur();
      });
    });
    if (delBtn) delBtn.addEventListener('click', function () { press('DEL'); });
    if (histBtn && histPanel) {
      histBtn.addEventListener('click', function () {
        renderHist();
        histPanel.hidden = !histPanel.hidden;
      });
    }
    root._press = press;
    render();
    return press;
  }

  var KEYMAP = { '*': '×', '/': '÷', '-': '−', '+': '+', '^': '^', '(': '(', ')': ')', '!': '!', '%': '%', '.': '.', ',': '.', '=': '=', Enter: '=', Backspace: 'DEL', Escape: 'AC', p: 'π' };

  document.addEventListener('DOMContentLoaded', function () {
    var first = null;
    document.querySelectorAll('.calc').forEach(function (el) {
      var p = initCalc(el);
      if (!first) first = p;
    });
    if (!first) return;
    document.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var k = null;
      if (/^[0-9]$/.test(e.key)) k = e.key;
      else if (KEYMAP[e.key]) k = KEYMAP[e.key];
      if (k) { e.preventDefault(); first(k); }
    });
  });
})();
