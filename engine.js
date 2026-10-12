/* CalcZone expression engine: safe parser (no eval). */
(function (global) {
  'use strict';

  var FUNCS = /^(asin|acos|atan|sin|cos|tan|ln|log|sqrt|abs|exp|√)\(/;

  function tokenize(src) {
    var s = String(src).replace(/\s+/g, '').replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/');
    var out = [], i = 0, m, rest;
    var numRe = /^(?:\d+\.?\d*|\.\d+)(?:E[+\-]?\d+)?/;
    while (i < s.length) {
      rest = s.slice(i);
      if ((m = rest.match(numRe))) {
        out.push({ t: 'num', v: parseFloat(m[0]) });
        i += m[0].length;
      } else if ((m = rest.match(FUNCS))) {
        out.push({ t: 'func', v: m[1] === '√' ? 'sqrt' : m[1] });
        i += m[0].length;
      } else if ((m = rest.match(/^(Ans|pi|π|e|x)/))) {
        out.push({ t: 'const', v: m[1] === 'π' ? 'pi' : m[1] });
        i += m[0].length;
      } else if ('+-*/^!%'.indexOf(rest[0]) > -1) {
        out.push({ t: 'op', v: rest[0] });
        i++;
      } else if (rest[0] === '(') {
        out.push({ t: 'lp' });
        i++;
      } else if (rest[0] === ')') {
        out.push({ t: 'rp' });
        i++;
      } else {
        throw new Error('Unexpected "' + rest[0] + '"');
      }
    }
    return out;
  }

  function snap(v) { return Math.abs(v) < 1e-15 ? 0 : v; }
  function toRad(x, d) { return d ? x * Math.PI / 180 : x; }
  function fromRad(r, d) { return d ? r * 180 / Math.PI : r; }

  function fact(n) {
    if (n < 0 || Math.floor(n) !== n || n > 170) throw new Error('Math error');
    var r = 1;
    for (var i = 2; i <= n; i++) r *= i;
    return r;
  }

  var F = {
    sin: function (x, d) { return snap(Math.sin(toRad(x, d))); },
    cos: function (x, d) { return snap(Math.cos(toRad(x, d))); },
    tan: function (x, d) {
      var a = toRad(x, d), c = snap(Math.cos(a));
      if (c === 0) throw new Error('Math error');
      return snap(Math.sin(a)) / c;
    },
    asin: function (x, d) { if (Math.abs(x) > 1) throw new Error('Math error'); return fromRad(Math.asin(x), d); },
    acos: function (x, d) { if (Math.abs(x) > 1) throw new Error('Math error'); return fromRad(Math.acos(x), d); },
    atan: function (x, d) { return fromRad(Math.atan(x), d); },
    ln: function (x) { if (x <= 0) throw new Error('Math error'); return Math.log(x); },
    log: function (x) { if (x <= 0) throw new Error('Math error'); return Math.log10(x); },
    sqrt: function (x) { if (x < 0) throw new Error('Math error'); return Math.sqrt(x); },
    abs: function (x) { return Math.abs(x); },
    exp: function (x) { return Math.exp(x); }
  };

  /* Returns {f: function(ctx) -> number}. ctx = {x, ans, deg} */
  function compile(src) {
    var tk = tokenize(src), p = 0;
    if (!tk.length) throw new Error('Empty');

    function isOp(c) { return tk[p] && tk[p].t === 'op' && tk[p].v === c; }
    function startsFactor(k) { return k.t === 'num' || k.t === 'const' || k.t === 'func' || k.t === 'lp'; }
    function closeParen() {
      if (tk[p] && tk[p].t === 'rp') p++;
      else if (p < tk.length) throw new Error('Bad bracket');
    }

    function expr() {
      var left = term();
      while (tk[p] && tk[p].t === 'op' && (tk[p].v === '+' || tk[p].v === '-')) {
        var op = tk[p++].v, right = term();
        left = (function (l, r, o, pct) {
          return { pct: false, f: function (c) {
            var a = l(c), b = r(c);
            if (pct) b = a * b;
            return o === '+' ? a + b : a - b;
          } };
        })(left.f, right.f, op, right.pct);
      }
      return left;
    }

    function term() {
      var left = unary();
      for (;;) {
        var k = tk[p];
        if (!k) break;
        if (k.t === 'op' && (k.v === '*' || k.v === '/')) {
          p++;
          var right = unary();
          left = (function (l, r, o) {
            return { pct: false, f: function (c) { return o === '*' ? l(c) * r(c) : l(c) / r(c); } };
          })(left.f, right.f, k.v);
        } else if (startsFactor(k)) {
          var r2 = unary();
          left = (function (l, r) {
            return { pct: false, f: function (c) { return l(c) * r(c); } };
          })(left.f, r2.f);
        } else break;
      }
      return left;
    }

    function unary() {
      if (isOp('-')) { p++; var u = unary(); return { pct: false, f: function (c) { return -u.f(c); } }; }
      if (isOp('+')) { p++; return unary(); }
      return power();
    }

    function power() {
      var base = postfix();
      if (isOp('^')) {
        p++;
        var ex = unary();
        return { pct: false, f: function (c) { return Math.pow(base.f(c), ex.f(c)); } };
      }
      return base;
    }

    function postfix() {
      var node = primary();
      while (tk[p] && tk[p].t === 'op' && (tk[p].v === '!' || tk[p].v === '%')) {
        var op = tk[p++].v;
        node = (function (inner, o) {
          return o === '!'
            ? { pct: false, f: function (c) { return fact(inner(c)); } }
            : { pct: true, f: function (c) { return inner(c) / 100; } };
        })(node.f, op);
      }
      return node;
    }

    function primary() {
      var k = tk[p++];
      if (!k) throw new Error('Incomplete');
      if (k.t === 'num') return { pct: false, f: function () { return k.v; } };
      if (k.t === 'const') {
        return { pct: false, f: function (c) {
          if (k.v === 'pi') return Math.PI;
          if (k.v === 'e') return Math.E;
          if (k.v === 'Ans') return (c && c.ans) || 0;
          return c && typeof c.x === 'number' ? c.x : NaN;
        } };
      }
      if (k.t === 'func') {
        var inner = expr();
        closeParen();
        return { pct: false, f: function (c) { return F[k.v](inner.f(c), !!(c && c.deg)); } };
      }
      if (k.t === 'lp') {
        var e = expr();
        closeParen();
        return { pct: false, f: e.f };
      }
      throw new Error('Unexpected token');
    }

    var root = expr();
    if (p < tk.length) throw new Error('Unexpected token');
    return root;
  }

  function format(v) {
    if (typeof v !== 'number' || !isFinite(v)) throw new Error('Math error');
    if (v === 0) return '0';
    var a = Math.abs(v), s;
    if (a >= 1e15 || a < 1e-9) {
      s = v.toExponential(11).replace(/\.?0+e/, 'e');
    } else {
      s = String(Number(v.toPrecision(12)));
    }
    return s.replace('e+', 'E').replace('e', 'E').replace(/-/g, '−');
  }

  function evaluate(src, ctx) { return compile(src).f(ctx || {}); }

  var Engine = { compile: compile, evaluate: evaluate, format: format };
  if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
  else global.CalcEngine = Engine;
})(typeof window !== 'undefined' ? window : this);
