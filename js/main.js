(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- header: clear over the photo, solid once you scroll ---------- */
  var header = $('[data-header]');
  function onScroll() { header.classList.toggle('is-solid', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var toggle = $('[data-menu-toggle]');
  var nav = $('[data-nav]');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    toggle.querySelector('.menu-toggle-label').textContent = open ? 'Close' : 'Menu';
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- services dropdown: hover or click on desktop, tap to expand on phones ---------- */
  var desktopHover = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 961px)');
  $$('[data-dd]').forEach(function (dd) {
    var btn = $('[data-dd-btn]', dd);
    var closeTimer = 0;
    function set(open) {
      dd.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (desktopHover.matches) set(true); else set(!dd.classList.contains('is-open'));
    });
    dd.addEventListener('mouseenter', function () { if (!desktopHover.matches) return; clearTimeout(closeTimer); set(true); });
    dd.addEventListener('mouseleave', function () { if (!desktopHover.matches) return; closeTimer = setTimeout(function () { set(false); }, 200); });
    dd.addEventListener('focusout', function (e) { if (desktopHover.matches && !dd.contains(e.relatedTarget)) set(false); });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) set(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dd.classList.contains('is-open')) { set(false); btn.focus(); }
    });
  });

  /* ---------- reveal on scroll ---------- */
  var revealables = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- almanac: where we are in the year ---------- */
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var NOTES = [
    'Deep winter. Snow removal is coming soon, and it’s a smart time to lock in your spring cleanup.',
    'Deep winter. Snow removal is coming soon, and it’s a smart time to lock in your spring cleanup.',
    'The thaw is close. Spring cleanups start soon, so now’s a good time to set up weekly mowing for the year.',
    'Spring cleanups are underway and mowing season is starting. Get on the schedule early.',
    'Spring cleanups are wrapping up and mowing is in full swing. Get on the schedule early.',
    'Peak mowing season. Weekly service keeps the lawn sharp all summer.',
    'Peak mowing season. Weekly service keeps the lawn sharp all summer.',
    'Peak mowing season. Weekly service keeps the lawn sharp through the dog days.',
    'Late season. A great window for hedge trimming and fresh mulch before the leaves drop.',
    'Fall cleanup season. Book yours before the snow flies.',
    'Fall cleanup season. Book yours before the snow flies.',
    'Winter’s here. Snow removal is coming soon, so ask to be first in line.'
  ];
  var now = new Date();
  var m = now.getMonth();
  var daysIn = new Date(now.getFullYear(), m + 1, 0).getDate();
  var t = (m + (now.getDate() - 0.5) / daysIn) / 12;
  var today = $('[data-today]');
  if (today) {
    today.style.setProperty('--t', t.toFixed(4));
    today.classList.toggle('is-start', t < 0.1);
    today.classList.toggle('is-end', t > 0.88);
    $('[data-almanac]').style.setProperty('--t', t.toFixed(4));
    $('[data-today-label]').textContent = 'Today · ' + MONTHS[m].slice(0, 3);
  }
  var seasonNow = $('[data-season-now]');
  if (seasonNow) {
    seasonNow.innerHTML = '<span class="now-label">Right now · ' + MONTHS[m] + '</span>' + NOTES[m];
  }

  /* ---------- the ruler: blades cut to one height ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var ruler = $('[data-ruler]');
  if (ruler) {
    var GROUND = 400, UNIT = 48, CUT = GROUND - 3.5 * UNIT;
    var rnd = mulberry32(7);
    var parts = [];
    parts.push('<defs>' +
      '<clipPath id="r-below"><rect x="0" y="' + CUT + '" width="340" height="' + (440 - CUT) + '"/></clipPath>' +
      '<clipPath id="r-above"><rect x="0" y="0" width="340" height="' + CUT + '"/></clipPath>' +
      '</defs>');

    // scale
    parts.push('<line class="r-axis" x1="40" y1="' + GROUND + '" x2="40" y2="' + (GROUND - 7 * UNIT) + '"/>');
    for (var i = 0; i <= 28; i++) {
      var y = GROUND - i * UNIT / 4;
      var len = i % 4 === 0 ? 14 : (i % 2 === 0 ? 9 : 5);
      parts.push('<line class="r-tick" x1="40" y1="' + y + '" x2="' + (40 - len) + '" y2="' + y + '"/>');
      if (i % 4 === 0 && i > 0) parts.push('<text class="r-num" x="20" y="' + (y + 4) + '" text-anchor="end">' + (i / 4) + '</text>');
    }
    parts.push('<text class="r-num" x="20" y="' + (GROUND - 7 * UNIT - 16) + '" text-anchor="end">in</text>');
    parts.push('<line class="r-ground" x1="52" y1="' + GROUND + '" x2="336" y2="' + GROUND + '"/>');

    // blades
    var COLORS = ['#7A9475', '#8BA484', '#6C8668', '#94AC8D', '#5F7A5C'];
    var blades = [];
    var N = 15;
    for (var b = 0; b < N; b++) {
      var x = 72 + b * (252 / (N - 1)) + (rnd() - 0.5) * 8;
      var hIn = 4.4 + rnd() * 2.3;
      var tip = GROUND - hIn * UNIT;
      var lean = (rnd() - 0.5) * 36;
      var w = 4.5 + rnd() * 3;
      var d = 'M' + (x - w) + ' ' + GROUND +
        ' C ' + (x - w * 0.6) + ' ' + (GROUND - 90) + ', ' + (x + lean * 0.45 - 1.5) + ' ' + (tip + 70) + ', ' + (x + lean) + ' ' + tip +
        ' C ' + (x + lean * 0.45 + 1.5) + ' ' + (tip + 70) + ', ' + (x + w * 0.6) + ' ' + (GROUND - 90) + ', ' + (x + w) + ' ' + GROUND + ' Z';
      blades.push({ x: x, d: d, c: COLORS[b % COLORS.length], lean: lean });
    }
    parts.push('<g clip-path="url(#r-below)">' + blades.map(function (bl) { return '<path d="' + bl.d + '" fill="' + bl.c + '"/>'; }).join('') + '</g>');
    blades.forEach(function (bl) {
      var delay = ((bl.x - 52) / 284).toFixed(2);
      var rot = ((bl.lean >= 0 ? 1 : -1) * (35 + rnd() * 70)).toFixed(0);
      var dx = (rnd() * 46 - 12).toFixed(0);
      parts.push('<g class="clip-piece" style="--d:' + delay + 's;--r:' + rot + 'deg;--dx:' + dx + 'px">' +
        '<path d="' + bl.d + '" fill="' + bl.c + '" clip-path="url(#r-above)"/></g>');
    });

    parts.push('<line class="r-cut" x1="52" y1="' + CUT + '" x2="336" y2="' + CUT + '"/>');
    parts.push('<text class="r-label" x="336" y="' + (CUT - 12) + '" text-anchor="end">Cut line</text>');
    parts.push('<g class="r-sweep"><rect x="-7" y="' + (CUT - 10) + '" width="14" height="20" rx="2"/></g>');
    ruler.innerHTML = parts.join('');

    var doneTimer = 0;
    function cut() {
      ruler.classList.remove('is-done');
      ruler.classList.add('is-cut');
      clearTimeout(doneTimer);
      doneTimer = setTimeout(function () { ruler.classList.add('is-done'); }, 1100);
    }
    var again = $('[data-ruler-again]');
    if (again) {
      again.addEventListener('click', function () {
        ruler.classList.remove('is-cut', 'is-done');
        setTimeout(cut, reduceMotion ? 0 : 900);
      });
    }
    if ('IntersectionObserver' in window && !reduceMotion) {
      var rio = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { rio.disconnect(); setTimeout(cut, 350); }
      }, { threshold: 0.55 });
      rio.observe(ruler);
    } else {
      cut();
    }
  }

  /* ---------- quote form: hands off to the visitor's email app ---------- */
  var form = $('[data-quote-form]');
  if (form) {
    var status = $('[data-form-status]');

    // arriving from a service page (?service=cleanup) pre-selects that service
    var wanted = new URLSearchParams(window.location.search).get('service');
    if (wanted && /^[a-z]+$/.test(wanted)) {
      var chip = form.querySelector('[data-chip="' + wanted + '"]');
      if (chip) $$('[data-chip]', form).forEach(function (c) { c.checked = c === chip; });
    }
    var CHECKS = {
      name: function (v) { return v.trim().length > 1; },
      phone: function (v) { return v.replace(/\D/g, '').length >= 10; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
    };

    Object.keys(CHECKS).forEach(function (name) {
      form.elements[name].addEventListener('input', function () {
        var field = this.closest('.field');
        if (field.classList.contains('is-invalid') && CHECKS[name](this.value)) {
          field.classList.remove('is-invalid');
          this.removeAttribute('aria-invalid');
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(CHECKS).forEach(function (name) {
        var input = form.elements[name];
        var ok = CHECKS[name](input.value);
        input.closest('.field').classList.toggle('is-invalid', !ok);
        if (ok) input.removeAttribute('aria-invalid'); else input.setAttribute('aria-invalid', 'true');
        if (!ok && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); status.textContent = ''; return; }

      var fd = new FormData(form);
      var services = fd.getAll('services');
      var lines = [
        'Hi Green Standard,',
        '',
        'I’d like a complimentary quote.',
        '',
        'Name: ' + fd.get('name').trim(),
        'Phone: ' + fd.get('phone').trim(),
        'Email: ' + fd.get('email').trim(),
        'Property address: ' + (fd.get('address').trim() || '(not given)'),
        'Services: ' + (services.length ? services.join(', ') : '(not sure yet)'),
        'How often: ' + fd.get('frequency')
      ];
      var notes = fd.get('notes').trim();
      if (notes) lines.push('', 'Notes:', notes);

      var href = 'mailto:greenstandard.team@gmail.com' +
        '?subject=' + encodeURIComponent('Quote request: ' + fd.get('name').trim()) +
        '&body=' + encodeURIComponent(lines.join('\n'));

      status.innerHTML = 'Opening your email app with everything filled in. If nothing opens, email ' +
        '<a href="mailto:greenstandard.team@gmail.com">greenstandard.team@gmail.com</a> or call ' +
        '<a href="tel:2622903375">262-290-3375</a>.';
      window.location.href = href;
    });
  }
})();
