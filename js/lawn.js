/* ==========================================================================
   The mowable lawn.
   Real stripes come from the direction the grass is bent: mowing away from
   the viewer bends blades away and they catch the light; mowing toward the
   viewer bends them back and they read darker. Same rule here:
   moving up or right paints the light stripe, down or left paints the dark one.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- seeded random so the texture is identical on every visit ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- grass textures (tints of the brand moss green) ---------- */
  var TEXTURES = {
    rough: {
      base: '#334533',
      strokes: ['#24342A', '#2B3C2C', '#3B4D3C', '#455C45', '#2E402F', '#4F6650', '#1F2E22'],
      count: 6200, lenMin: 6, lenMax: 15, angle: -90, spread: 60, wMin: 1, wMax: 2.1, seed: 11
    },
    light: {
      base: '#7C9776',
      strokes: ['#88A281', '#76906F', '#93AB8B', '#809B7A', '#9AB291'],
      count: 7200, lenMin: 2.5, lenMax: 5, angle: -68, spread: 18, wMin: 0.9, wMax: 1.4, seed: 23
    },
    dark: {
      base: '#526C50',
      strokes: ['#4B644A', '#58725A', '#486148', '#5C7659', '#4F694D'],
      count: 7200, lenMin: 2.5, lenMax: 5, angle: 112, spread: 18, wMin: 0.9, wMax: 1.4, seed: 37
    }
  };
  var TILE = 220;
  var tileCache = {};

  function makeTile(spec, dpr) {
    var c = document.createElement('canvas');
    c.width = c.height = Math.round(TILE * dpr);
    var g = c.getContext('2d');
    g.scale(dpr, dpr);
    g.fillStyle = spec.base;
    g.fillRect(0, 0, TILE, TILE);
    g.lineCap = 'round';
    var rnd = mulberry32(spec.seed);
    for (var i = 0; i < spec.count; i++) {
      var x = rnd() * TILE, y = rnd() * TILE;
      var len = spec.lenMin + rnd() * (spec.lenMax - spec.lenMin);
      var ang = (spec.angle + (rnd() - 0.5) * spec.spread) * Math.PI / 180;
      var dx = Math.cos(ang) * len, dy = Math.sin(ang) * len;
      g.strokeStyle = spec.strokes[(rnd() * spec.strokes.length) | 0];
      g.lineWidth = spec.wMin + rnd() * (spec.wMax - spec.wMin);
      // draw wrapped copies near the edges so the tile repeats without seams
      for (var ox = -TILE; ox <= TILE; ox += TILE) {
        for (var oy = -TILE; oy <= TILE; oy += TILE) {
          var sx = x + ox, sy = y + oy, m = len + 2;
          if (sx + m < 0 || sx - m > TILE || sy + m < 0 || sy - m > TILE) continue;
          g.beginPath();
          g.moveTo(sx, sy);
          g.lineTo(sx + dx, sy + dy);
          g.stroke();
        }
      }
    }
    return c;
  }

  function tilesFor(dpr) {
    if (!tileCache[dpr]) {
      tileCache[dpr] = {
        rough: makeTile(TEXTURES.rough, dpr),
        light: makeTile(TEXTURES.light, dpr),
        dark: makeTile(TEXTURES.dark, dpr)
      };
    }
    return tileCache[dpr];
  }

  function patternsFor(ctx, dpr) {
    var t = tilesFor(dpr);
    function mk(tile) {
      var p = ctx.createPattern(tile, 'repeat');
      if (p && p.setTransform && window.DOMMatrix) p.setTransform(new DOMMatrix().scale(1 / dpr));
      return p;
    }
    return { rough: mk(t.rough), light: mk(t.light), dark: mk(t.dark) };
  }

  function currentDpr() { return Math.min(window.devicePixelRatio || 1, 2); }

  /* ---------- footer strip: a band of finished stripes ---------- */
  function paintFooterLawn() {
    var fc = document.querySelector('[data-footer-lawn]');
    if (!fc) return;
    var r = fc.getBoundingClientRect();
    if (!r.width) return;
    var dpr = currentDpr();
    fc.width = Math.round(r.width * dpr);
    fc.height = Math.round(r.height * dpr);
    var fctx = fc.getContext('2d');
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var p = patternsFor(fctx, dpr);
    var band = Math.max(40, Math.min(64, r.width * 0.045));
    for (var x = 0, i = 0; x < r.width; x += band, i++) {
      fctx.fillStyle = i % 2 ? p.dark : p.light;
      fctx.fillRect(x, 0, band + 0.5, r.height);
    }
  }

  /* ======================================================================
     Hero plot
     ====================================================================== */
  var frame = document.querySelector('[data-plot] .plot-frame');
  var canvas = document.querySelector('[data-lawn]');

  if (!frame || !canvas || !canvas.getContext) {
    paintFooterLawn();
    return;
  }

  var ctx = canvas.getContext('2d');
  var mower = document.querySelector('[data-mower]');
  var sqftEl = document.querySelector('[data-sqft]');
  var hintEl = document.querySelector('[data-hint]');
  var autoBtn = document.querySelector('[data-automow]');
  var regrowBtn = document.querySelector('[data-regrow]');

  var CELL = 10;            // coverage grid resolution, css px
  var PLOT_FEET = 64;       // the plot's width stands in for a 64 ft yard

  var W = 0, H = 0, dpr = 1, deck = 56, mowerW = 72, mowerH = 110;
  var patterns = null;
  var segments = [];        // normalized, so the lawn survives a resize
  var grid = null, gridW = 0, gridH = 0, mownCells = 0;
  var celebrated = false;
  var userHasMowed = false;

  var HINT_TURN = finePointer
    ? 'Your turn. Move your cursor across the lawn.'
    : 'Your turn. Swipe sideways across the lawn.';

  function setHint(text, html) {
    if (!hintEl) return;
    hintEl.classList.toggle('is-done', !!html);
    if (html) hintEl.innerHTML = html; else hintEl.textContent = text;
  }

  /* ---------- sizing ---------- */
  function resize(force) {
    var r = frame.getBoundingClientRect();
    var newW = Math.round(r.width), newH = Math.round(r.height);
    var newDpr = currentDpr();
    if (!force && newW === W && newH === H && newDpr === dpr) return;
    W = newW; H = newH;
    if (!patterns || newDpr !== dpr) { dpr = newDpr; patterns = null; }
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!patterns) patterns = patternsFor(ctx, dpr);

    deck = Math.max(34, Math.min(64, W * 0.045));
    mowerW = deck * 60 / 46;
    mowerH = mowerW * 92 / 60;
    if (mower) mower.style.width = mowerW + 'px';

    gridW = Math.ceil(W / CELL);
    gridH = Math.ceil(H / CELL);
    grid = new Uint8Array(gridW * gridH);
    mownCells = 0;

    paintRough(1);
    for (var i = 0; i < segments.length; i++) {
      var s = segments[i];
      drawSegment(s[0] * W, s[1] * H, s[2] * W, s[3] * H, s[4], false);
    }
    updateCount();
    paintFooterLawn();
  }

  function paintRough(alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = patterns.rough;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  /* ---------- mowing ---------- */
  function drawSegment(x0, y0, x1, y1, light, record) {
    ctx.strokeStyle = light ? patterns.light : patterns.dark;
    ctx.lineWidth = deck;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    markCells(x0, y0, x1, y1);
    if (record !== false) {
      segments.push([x0 / W, y0 / H, x1 / W, y1 / H, light]);
      if (segments.length > 8000) segments.splice(0, 2000);
    }
  }

  function markCells(x0, y0, x1, y1) {
    var r = deck / 2, r2 = r * r;
    var len = Math.hypot(x1 - x0, y1 - y0);
    var steps = Math.max(1, Math.ceil(len / CELL));
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t;
      var gx0 = Math.max(0, Math.floor((cx - r) / CELL)), gx1 = Math.min(gridW - 1, Math.floor((cx + r) / CELL));
      var gy0 = Math.max(0, Math.floor((cy - r) / CELL)), gy1 = Math.min(gridH - 1, Math.floor((cy + r) / CELL));
      for (var gy = gy0; gy <= gy1; gy++) {
        for (var gx = gx0; gx <= gx1; gx++) {
          var idx = gy * gridW + gx;
          if (grid[idx]) continue;
          var ccx = gx * CELL + CELL / 2 - cx, ccy = gy * CELL + CELL / 2 - cy;
          if (ccx * ccx + ccy * ccy <= r2) { grid[idx] = 1; mownCells++; }
        }
      }
    }
  }

  function isLight(vx, vy) {
    return Math.abs(vx) >= Math.abs(vy) ? vx > 0 : vy < 0;
  }

  /* ---------- counter ---------- */
  var countQueued = false;
  function scheduleCount() {
    if (countQueued) return;
    countQueued = true;
    requestAnimationFrame(function () { countQueued = false; updateCount(); });
  }
  function updateCount() {
    if (!W) return;
    var ftPerPx = PLOT_FEET / W;
    var sqft = Math.round(mownCells * CELL * CELL * ftPerPx * ftPerPx);
    if (sqftEl) sqftEl.textContent = sqft.toLocaleString('en-US');
    var pct = mownCells / (gridW * gridH);
    if (!celebrated && pct >= 0.9) {
      celebrated = true;
      setHint('', 'Looking sharp. <a href="#quote">Want this every week? &rarr;</a>');
    }
  }

  /* ---------- the mower sprite ---------- */
  var mowerAngle = 90; // degrees; sprite art faces up, so +90 = moving right
  function placeMower(x, y, heading) {
    if (!mower) return;
    if (heading !== null && heading !== undefined) {
      var target = heading * 180 / Math.PI + 90;
      var diff = ((target - mowerAngle + 540) % 360) - 180;
      mowerAngle += diff * 0.32;
    }
    mower.style.transform =
      'translate(' + (x - mowerW / 2).toFixed(1) + 'px,' + (y - mowerH * 0.304).toFixed(1) + 'px) rotate(' + mowerAngle.toFixed(1) + 'deg)';
  }
  function showMower(on) { if (mower) mower.classList.toggle('is-on', on); }

  /* ---------- pointer control ---------- */
  var last = null, vx = 0, vy = 0;

  function localPoint(e) {
    var r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onPointerMove(e) {
    if (e.pointerType !== 'mouse' && e.buttons === 0 && e.pressure === 0) return;
    if (auto) stopAuto(true);
    var p = localPoint(e);
    if (!last) { last = p; vx = vy = 0; placeMower(p.x, p.y, null); showMower(true); return; }
    var dx = p.x - last.x, dy = p.y - last.y;
    if (dx * dx + dy * dy < 2.5) return;
    vx = vx * 0.55 + dx * 0.45;
    vy = vy * 0.55 + dy * 0.45;
    drawSegment(last.x, last.y, p.x, p.y, isLight(vx, vy));
    placeMower(p.x, p.y, Math.atan2(vy, vx));
    showMower(true);
    scheduleCount();
    last = p;
    if (!userHasMowed) { userHasMowed = true; if (!celebrated) setHint('Nice line. Keep going.'); }
  }
  function onPointerEnd() { last = null; if (!auto) showMower(false); }

  canvas.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') last = null; });
  canvas.addEventListener('pointerdown', function (e) { last = null; onPointerMove(e); });
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerEnd);
  canvas.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') onPointerEnd(); });
  canvas.addEventListener('pointercancel', onPointerEnd);

  /* ---------- auto-mow: serpentine passes, like a real crew ---------- */
  var auto = null;

  function buildPath(passes) {
    var pts = [];
    var rows = Math.ceil(H / deck);
    var n = Math.min(rows, passes);
    var dir = 1;
    for (var i = 0; i < n; i++) {
      var y = deck / 2 + i * deck;
      var a = dir > 0 ? -deck * 1.2 : W + deck * 1.2;
      var b = dir > 0 ? W + deck * 1.2 : -deck * 1.2;
      pts.push([a, y], [b, y]);
      dir = -dir;
    }
    return pts;
  }

  function runAuto(passes, speed, onDone) {
    stopAuto(false);
    var pts = buildPath(passes);
    if (pts.length < 2) return;
    if (reduceMotion) {
      for (var k = 0; k < pts.length - 1; k++) {
        var p0 = pts[k], p1 = pts[k + 1];
        drawSegment(p0[0], p0[1], p1[0], p1[1], isLight(p1[0] - p0[0], p1[1] - p0[1]));
      }
      updateCount();
      if (onDone) onDone();
      return;
    }
    var seg = 0, along = 0, prevT = null, prev = pts[0].slice();
    auto = { raf: 0, onDone: onDone };
    if (autoBtn) autoBtn.disabled = true;
    showMower(true);
    placeMower(prev[0], prev[1], 0);

    function step(t) {
      if (!auto) return;
      if (prevT === null) prevT = t;
      var dt = Math.min(0.1, (t - prevT) / 1000);
      prevT = t;
      var budget = speed * dt;
      while (budget > 0 && seg < pts.length - 1) {
        var a = pts[seg], b = pts[seg + 1];
        var segLen = Math.hypot(b[0] - a[0], b[1] - a[1]);
        var remain = segLen - along;
        var move = Math.min(budget, remain);
        along += move;
        budget -= move;
        var f = along / segLen;
        var x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
        drawSegment(prev[0], prev[1], x, y, isLight(b[0] - a[0], b[1] - a[1]));
        placeMower(x, y, Math.atan2(b[1] - a[1], b[0] - a[0]));
        prev = [x, y];
        if (along >= segLen - 0.01) {
          seg++;
          along = 0;
          // turn-around: hop to the next row off-canvas, no paint needed
          if (seg < pts.length - 1 && seg % 2 === 1) {
            seg++;
            prev = pts[seg].slice();
          }
        }
      }
      scheduleCount();
      if (seg >= pts.length - 1) { finishAuto(); return; }
      auto.raf = requestAnimationFrame(step);
    }
    auto.raf = requestAnimationFrame(step);
  }

  function finishAuto() {
    var done = auto && auto.onDone;
    stopAuto(false);
    if (done) done();
  }

  function stopAuto(byUser) {
    if (!auto) return;
    cancelAnimationFrame(auto.raf);
    auto = null;
    if (autoBtn) autoBtn.disabled = false;
    if (!byUser) showMower(false);
    if (byUser && !celebrated) setHint('Nice line. Keep going.');
  }

  /* ---------- regrow ---------- */
  function regrow() {
    stopAuto(false);
    segments = [];
    celebrated = false;
    userHasMowed = false;
    var done = function () {
      grid = new Uint8Array(gridW * gridH);
      mownCells = 0;
      paintRough(1);
      updateCount();
      setHint('Fresh growth. ' + HINT_TURN);
    };
    if (reduceMotion) { done(); return; }
    var frames = 0;
    (function fade() {
      paintRough(0.16);
      if (++frames < 22) requestAnimationFrame(fade); else done();
    })();
  }

  if (autoBtn) autoBtn.addEventListener('click', function () {
    setHint('One row at a time…');
    runAuto(Infinity, 2300, function () { if (!celebrated) setHint(HINT_TURN); });
  });
  if (regrowBtn) regrowBtn.addEventListener('click', regrow);

  /* ---------- start ---------- */
  resize(true);
  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { resize(false); }, 120);
  });

  function intro() {
    setHint('Watch the first passes…');
    runAuto(3, 950, function () { if (!userHasMowed && !celebrated) setHint(HINT_TURN); });
  }

  if ('IntersectionObserver' in window) {
    var started = false;
    var io = new IntersectionObserver(function (entries) {
      if (!started && entries[0].isIntersecting) {
        started = true;
        io.disconnect();
        setTimeout(intro, reduceMotion ? 0 : 450);
      }
    }, { threshold: 0.2 });
    io.observe(frame);
  } else {
    intro();
  }
})();
