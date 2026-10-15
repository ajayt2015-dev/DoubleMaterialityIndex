/* The Corporate — Double Materiality matrix (hand-written SVG). */
(function () {
  "use strict";

  var DMA = window.DMA;
  var SVG_NS = "http://www.w3.org/2000/svg";
  var MIN = 1, MAX = 5;

  var check = window.runSelfCheck(DMA);
  if (check.ok) console.info("[DMA] Data self-check passed (16 topics, scores in range, zones match spec).");
  else console.error("[DMA] Data self-check FAILED:\n - " + check.errors.join("\n - "));

  var visible = { E: true, S: true, G: true };
  var activeDot = null; // topic number whose tooltip is open

  var wrap = document.getElementById("chartWrap");
  var svg = document.getElementById("chart");
  var tooltip = document.getElementById("tooltip");
  var emptyMsg = document.getElementById("emptyMsg");

  var topics = DMA.TOPICS.map(function (t) {
    return Object.assign({}, t, { zone: DMA.classify(t.f, t.i) });
  });

  function el(name, attrs, parent) {
    var node = document.createElementNS(SVG_NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  /* ---------- Filters and legends ---------- */

  function buildFilters() {
    var bar = document.getElementById("filters");
    ["E", "S", "G"].forEach(function (code) {
      var c = DMA.CATEGORIES[code];
      var count = topics.filter(function (t) { return t.cat === code; }).length;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-btn";
      btn.style.setProperty("--cat-color", c.color);
      btn.setAttribute("aria-pressed", "true");
      btn.setAttribute("aria-label", c.name + " topics (" + count + ")");
      btn.innerHTML =
        '<span class="swatch" aria-hidden="true"></span>' +
        '<span class="letter">' + code + '</span>' +
        '<span class="label">' + c.name + '</span>' +
        '<span class="count">' + count + '</span>' +
        '<span class="state" aria-hidden="true">On</span>';
      btn.addEventListener("click", function () {
        visible[code] = !visible[code];
        btn.setAttribute("aria-pressed", String(visible[code]));
        btn.querySelector(".state").textContent = visible[code] ? "On" : "Off";
        if (activeDot !== null) {
          var t = topics.find(function (x) { return x.n === activeDot; });
          if (!visible[t.cat]) hideTooltip();
        }
        renderDots(true);
      });
      bar.appendChild(btn);
    });
  }

  function buildLegends() {
    var zl = document.getElementById("zoneLegend");
    DMA.ZONE_ORDER.forEach(function (id) {
      var z = DMA.ZONES[id];
      var li = document.createElement("li");
      li.innerHTML = '<span class="sw" style="background:' + z.color + '" aria-hidden="true"></span>' +
        '<span><strong>' + z.name + '</strong></span>';
      zl.appendChild(li);
    });
    var cl = document.getElementById("catLegend");
    ["E", "S", "G"].forEach(function (code) {
      var c = DMA.CATEGORIES[code];
      var li = document.createElement("li");
      li.innerHTML = '<span class="sw round" style="background:' + c.color + '" aria-hidden="true"></span>' +
        '<span><strong>' + code + ' — ' + c.name + '</strong></span>';
      cl.appendChild(li);
    });
  }

  /* ---------- Geometry ---------- */

  var g = null; // current geometry

  function computeGeometry() {
    var width = Math.min(wrap.clientWidth, 680);
    var small = width < 440;
    var m = { l: small ? 44 : 58, r: small ? 10 : 16, t: small ? 10 : 14, b: small ? 42 : 50 };
    var p = Math.max(160, width - m.l - m.r);
    var r = Math.max(11, Math.min(15, p / 34));
    return {
      width: p + m.l + m.r,
      height: p + m.t + m.b,
      m: m, p: p, r: r, small: small,
      x: function (v) { return m.l + ((v - MIN) / (MAX - MIN)) * p; },
      y: function (v) { return m.t + ((MAX - v) / (MAX - MIN)) * p; }
    };
  }

  /* ---------- Static chart (zones, grid, axes) ---------- */

  var dotsLayer, leadersLayer, zoneLabelLayer;

  // Zone names are printed faintly inside each zone. Each has candidate corners; the first one
  // that clears every visible dot and marker is used, otherwise the name is left to the legend.
  function placeZoneLabels(pts) {
    while (zoneLabelLayer.firstChild) zoneLabelLayer.removeChild(zoneLabelLayer.firstChild);
    var pad = g.small ? 5 : 7;
    var Z = DMA.ZONES;
    var specs = [
      { text: Z.HIGHLY_MATERIAL.name, spots: [
        [g.x(5) - pad, g.y(3.5) - pad, "end", "auto"],
        [g.x(5) - pad, g.y(5) + pad, "end", "hanging"],
        [g.x(3.5) + pad, g.y(5) + pad, "start", "hanging"],
        [g.x(3.5) + pad, g.y(3.5) - pad, "start", "auto"]] },
      { text: Z.MATERIAL.name, spots: [
        [g.x(1) + pad, g.y(5) + pad, "start", "hanging"],
        [g.x(5) - pad, g.y(1) - pad, "end", "auto"]] },
      { text: Z.WATCH_LIST.name, spots: [
        [g.x(1) + pad, g.y(3) + pad, "start", "hanging"],
        [g.x(3) - pad, g.y(1) - pad, "end", "auto"]] },
      { text: Z.NOT_MATERIAL.name, spots: [
        [g.x(1) + pad, g.y(1) - pad, "start", "auto"]] }
    ];
    var clear = g.r + 3;
    specs.forEach(function (s) {
      for (var k = 0; k < s.spots.length; k++) {
        var sp = s.spots[k];
        var t = el("text", { x: sp[0], y: sp[1], "text-anchor": sp[2], "dominant-baseline": sp[3] }, zoneLabelLayer);
        t.textContent = s.text.toUpperCase();
        var b = t.getBBox();
        var hit = pts.some(function (p) {
          return [[p.x, p.y], [p.tx, p.ty]].some(function (c) {
            return c[0] + clear > b.x && c[0] - clear < b.x + b.width && c[1] + clear > b.y && c[1] - clear < b.y + b.height;
          });
        });
        if (!hit) return;
        zoneLabelLayer.removeChild(t);
      }
    });
  }

  function renderChart() {
    g = computeGeometry();
    svg.setAttribute("width", g.width);
    svg.setAttribute("height", g.height);
    svg.setAttribute("viewBox", "0 0 " + g.width + " " + g.height);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var zones = el("g", { "aria-hidden": "true" }, svg);
    function rect(x0, y0, x1, y1, fill) {
      el("rect", { x: g.x(x0), y: g.y(y1), width: g.x(x1) - g.x(x0), height: g.y(y0) - g.y(y1), fill: fill }, zones);
    }
    // Painted back to front: Material covers all, then the lower zones and the Highly Material square.
    rect(1, 1, 5, 5, DMA.ZONES.MATERIAL.color);
    rect(1, 1, 3, 3, DMA.ZONES.WATCH_LIST.color);
    rect(1, 1, 2, 2, DMA.ZONES.NOT_MATERIAL.color);
    rect(3.5, 3.5, 5, 5, DMA.ZONES.HIGHLY_MATERIAL.color);

    // Gridlines at every whole number.
    var grid = el("g", { stroke: "rgba(0,0,0,0.10)", "stroke-width": 1, "aria-hidden": "true" }, svg);
    for (var v = 2; v <= 4; v++) {
      el("line", { x1: g.x(v), x2: g.x(v), y1: g.y(MIN), y2: g.y(MAX) }, grid);
      el("line", { x1: g.x(MIN), x2: g.x(MAX), y1: g.y(v), y2: g.y(v) }, grid);
    }

    // Zone boundaries.
    var bounds = el("g", { fill: "none", stroke: "rgba(0,0,0,0.32)", "stroke-width": 1, "aria-hidden": "true" }, svg);
    el("path", { d: "M" + g.x(3.5) + "," + g.y(5) + "V" + g.y(3.5) + "H" + g.x(5) }, bounds);
    el("path", { d: "M" + g.x(1) + "," + g.y(3) + "H" + g.x(3) + "V" + g.y(1) }, bounds);
    el("path", { d: "M" + g.x(1) + "," + g.y(2) + "H" + g.x(2) + "V" + g.y(1) }, bounds);

    zoneLabelLayer = el("g", {
      fill: "#5E5949", "font-size": g.small ? 8.5 : 10, "font-weight": 700,
      "letter-spacing": "0.08em", "aria-hidden": "true"
    }, svg);

    // Plot frame.
    el("rect", { x: g.x(1), y: g.y(5), width: g.p, height: g.p, fill: "none", stroke: "#111111", "stroke-width": 1, "aria-hidden": "true" }, svg);

    // Ticks and axis labels.
    var axes = el("g", { fill: "#111111", "font-size": g.small ? 11 : 12.5, "aria-hidden": "true" }, svg);
    for (var tv = 1; tv <= 5; tv++) {
      el("line", { x1: g.x(tv), x2: g.x(tv), y1: g.y(1), y2: g.y(1) + 5, stroke: "#111111" }, axes);
      el("line", { x1: g.x(1) - 5, x2: g.x(1), y1: g.y(tv), y2: g.y(tv), stroke: "#111111" }, axes);
      var xt = el("text", { x: g.x(tv), y: g.y(1) + 9, "text-anchor": "middle", "dominant-baseline": "hanging" }, axes);
      xt.textContent = tv;
      var yt = el("text", { x: g.x(1) - 9, y: g.y(tv), "text-anchor": "end", "dominant-baseline": "central" }, axes);
      yt.textContent = tv;
    }
    var labelSize = g.small ? 12 : 14;
    var xl = el("text", {
      x: g.x(3), y: g.height - 4, "text-anchor": "middle", "font-size": labelSize, "font-weight": 700
    }, axes);
    xl.textContent = "Financial Materiality →";
    var ylx = g.small ? 12 : 16;
    var yl = el("text", {
      x: ylx, y: g.y(3), "text-anchor": "middle", "dominant-baseline": "central",
      "font-size": labelSize, "font-weight": 700, transform: "rotate(-90 " + ylx + " " + g.y(3) + ")"
    }, axes);
    yl.textContent = "Impact Materiality →";

    leadersLayer = el("g", { "aria-hidden": "true" }, svg);
    dotsLayer = el("g", {}, svg);

    renderDots(false);
  }

  /* ---------- Collision avoidance (display-only nudge) ---------- */

  function layoutDots(items) {
    var r = g.r;
    var minDot = 2 * r + 2;        // dot edges never touch
    var minMarker = r + 5;         // a dot never covers any exact-position marker
    var lo = g.x(1) + r, hi = g.x(5) - r, top = g.y(5) + r, bottom = g.y(1) - r;

    var pts = items.map(function (t) {
      var x = g.x(t.f), y = g.y(t.i);
      return { t: t, tx: x, ty: y, x: x, y: y };
    });

    function push(a, dx, dy, d, need, share) {
      if (d < 0.01) {           // identical points: deterministic direction
        var ang = (a.t.n * 2.399963) % (2 * Math.PI);
        dx = Math.cos(ang); dy = Math.sin(ang); d = 1;
      }
      var k = ((need - d) * share) / d;
      a.x += dx * k; a.y += dy * k;
    }

    var displaced = [];
    for (var round = 0; round < 6; round++) {
      for (var iter = 0; iter < 400; iter++) {
        var moved = false;
        for (var i = 0; i < pts.length; i++) {
          for (var j = i + 1; j < pts.length; j++) {
            var a = pts[i], b = pts[j];
            var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
            if (d < minDot - 0.01) {
              push(a, dx, dy, d, minDot, 0.5);
              push(b, -dx, -dy, d, minDot, 0.5);
              moved = true;
            }
          }
          for (var k = 0; k < displaced.length; k++) {
            var mk = displaced[k], p = pts[i];
            var mx = p.x - mk.tx, my = p.y - mk.ty, md = Math.sqrt(mx * mx + my * my);
            if (md < minMarker - 0.01) {
              push(p, mx, my, md, minMarker, 1);
              moved = true;
            }
          }
        }
        pts.forEach(function (p) {
          p.x = Math.min(hi, Math.max(lo, p.x));
          p.y = Math.min(bottom, Math.max(top, p.y));
        });
        if (!moved) break;
      }
      var next = pts.filter(function (p) { return Math.hypot(p.x - p.tx, p.y - p.ty) > 0.5; });
      if (next.length === displaced.length) break;
      displaced = next;
    }
    pts.forEach(function (p) { p.nudged = Math.hypot(p.x - p.tx, p.y - p.ty) > 0.5; });
    return pts;
  }

  /* ---------- Dots ---------- */

  function renderDots(animate) {
    while (dotsLayer.firstChild) dotsLayer.removeChild(dotsLayer.firstChild);
    while (leadersLayer.firstChild) leadersLayer.removeChild(leadersLayer.firstChild);

    var shown = topics.filter(function (t) { return visible[t.cat]; });
    var pts = layoutDots(shown);
    placeZoneLabels(pts);

    pts.forEach(function (p) {
      if (!p.nudged) return;
      el("line", { x1: p.tx, y1: p.ty, x2: p.x, y2: p.y, stroke: "#111111", "stroke-width": 1 }, leadersLayer);
      el("circle", { cx: p.tx, cy: p.ty, r: 2.6, fill: "#111111", stroke: "#FFFFFF", "stroke-width": 1 }, leadersLayer);
    });

    pts.forEach(function (p) {
      var t = p.t, c = DMA.CATEGORIES[t.cat], z = DMA.ZONES[t.zone];
      var dot = el("g", {
        class: "dot" + (animate ? " enter" : "") + (activeDot === t.n ? " active" : ""),
        transform: "translate(" + p.x.toFixed(2) + " " + p.y.toFixed(2) + ")",
        tabindex: 0,
        role: "button",
        "data-n": t.n,
        "aria-label": DMA.pad2(t.n) + " " + t.name + ". " + c.name + ". Financial " + t.f.toFixed(2) +
          ", Impact " + t.i.toFixed(2) + ". " + z.name + "."
      }, dotsLayer);
      el("circle", { class: "dot-ring", r: g.r + 3.5 }, dot);
      el("circle", { r: g.r, fill: c.color, stroke: "#111111", "stroke-width": 1.5 }, dot);
      var num = el("text", {
        class: "dot-num", "text-anchor": "middle", "dominant-baseline": "central", dy: "0.04em",
        fill: c.text, "font-size": (g.r * 0.92).toFixed(1)
      }, dot);
      num.textContent = DMA.pad2(t.n);
      bindDot(dot, t);
    });

    var none = pts.length === 0;
    emptyMsg.hidden = !none;
    if (none) {
      emptyMsg.style.left = g.x(3) + "px";
      emptyMsg.style.top = g.y(3) + "px";
    }

    if (activeDot !== null) {
      var still = dotsLayer.querySelector('[data-n="' + activeDot + '"]');
      if (still) positionTooltip(still); else hideTooltip();
    }
  }

  /* ---------- Tooltip ---------- */

  function tooltipHTML(t) {
    var c = DMA.CATEGORIES[t.cat], z = DMA.ZONES[t.zone];
    function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    return '<div class="tt-name">' + DMA.pad2(t.n) + ' · ' + esc(t.name) + '</div>' +
      '<div class="tt-row"><span>Category</span><span><span class="tt-sw" style="background:' + c.color + '"></span>' + c.name + '</span></div>' +
      '<div class="tt-row"><span>Financial</span><span>' + t.f.toFixed(2) + '</span></div>' +
      '<div class="tt-row"><span>Impact</span><span>' + t.i.toFixed(2) + '</span></div>' +
      '<div class="tt-row"><span>Zone</span><span><span class="tt-sw" style="background:' + z.color + '"></span>' + z.name + '</span></div>';
  }

  function showTooltip(dot, t) {
    activeDot = t.n;
    dotsLayer.querySelectorAll(".dot.active").forEach(function (d) { d.classList.remove("active"); });
    dot.classList.add("active");
    tooltip.innerHTML = tooltipHTML(t);
    tooltip.hidden = false;
    positionTooltip(dot);
  }

  function positionTooltip(dot) {
    var b = dot.getBoundingClientRect();
    var tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var gap = 10, edge = 8;
    var left = b.right + gap;
    if (left + tw > vw - edge) left = b.left - gap - tw;              // flip to the left
    var top = b.top + b.height / 2 - th / 2;
    if (left < edge) {                                                // no room either side: go above/below
      left = Math.min(Math.max(edge, b.left + b.width / 2 - tw / 2), vw - tw - edge);
      top = b.top - gap - th;
      if (top < edge) top = b.bottom + gap;
    }
    top = Math.min(Math.max(edge, top), vh - th - edge);
    tooltip.style.left = Math.round(left) + "px";
    tooltip.style.top = Math.round(top) + "px";
  }

  function hideTooltip() {
    activeDot = null;
    tooltip.hidden = true;
    dotsLayer && dotsLayer.querySelectorAll(".dot.active").forEach(function (d) { d.classList.remove("active"); });
  }

  function bindDot(dot, t) {
    dot.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") showTooltip(dot, t); });
    dot.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse" && document.activeElement !== dot) hideTooltip();
    });
    dot.addEventListener("click", function (e) { e.stopPropagation(); showTooltip(dot, t); });
    dot.addEventListener("focus", function () { showTooltip(dot, t); });
    dot.addEventListener("blur", function () {
      // Ignore blur caused by the whole window losing focus; close only when focus moves within the page.
      setTimeout(function () {
        if (activeDot === t.n && document.hasFocus() && document.activeElement !== dot) hideTooltip();
      }, 0);
    });
    dot.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showTooltip(dot, t); }
    });
  }

  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hideTooltip(); });
  document.addEventListener("click", function () { if (activeDot !== null) hideTooltip(); });
  window.addEventListener("scroll", function () {
    if (activeDot === null) return;
    var d = dotsLayer.querySelector('[data-n="' + activeDot + '"]');
    if (d) positionTooltip(d);
  }, { passive: true });

  /* ---------- Init ---------- */

  buildFilters();
  buildLegends();
  renderChart();

  var lastWidth = wrap.clientWidth;
  var raf = 0;
  new ResizeObserver(function () {
    if (wrap.clientWidth === lastWidth) return;
    lastWidth = wrap.clientWidth;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(renderChart);
  }).observe(wrap);
})();
