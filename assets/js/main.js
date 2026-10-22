/* Battle Born Custom Trailers — site script (no dependencies) */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var ICON_ZOOM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>';
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* ---------- Header + mobile menu ---------- */
  var header = $(".site-header");
  var onScroll = function () { if (header) header.classList.toggle("scrolled", window.scrollY > 30); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = $(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        document.body.style.overflow = "";
      });
    });
  }

  var yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Render gallery data ---------- */
  var CAT_LABEL = { wrap: "Custom Wrap", clean: "Clean Build", shop: "In the Shop" };

  function buildCard(b, i) {
    return '<figure class="build reveal" data-cat="' + esc(b.cat || "") + '" data-lb="builds" data-index="' + i + '" tabindex="0" role="button" aria-label="View ' + esc(b.title) + ' photo">' +
      (b.cat ? '<span class="tag">' + esc(CAT_LABEL[b.cat] || b.cat) + "</span>" : "") +
      '<span class="zoom-hint" aria-hidden="true">' + ICON_ZOOM + "</span>" +
      '<div class="ph"><img src="' + esc(b.img) + '" alt="' + esc(b.title) + " — " + esc(b.text) + '" loading="lazy" decoding="async"></div>' +
      "<figcaption><h3>" + esc(b.title) + "</h3><p>" + esc(b.text) + "</p></figcaption></figure>";
  }

  var buildsEl = $("#builds-grid");
  if (buildsEl && window.BB_BUILDS) {
    var limit = parseInt(buildsEl.getAttribute("data-limit") || "0", 10);
    var list = limit ? window.BB_BUILDS.slice(0, limit) : window.BB_BUILDS;
    buildsEl.innerHTML = list.map(buildCard).join("");

    // Filters with live counts
    var filterWrap = $("#build-filters");
    if (filterWrap) {
      var counts = { all: list.length };
      list.forEach(function (b) { counts[b.cat] = (counts[b.cat] || 0) + 1; });
      $$(".filter-btn", filterWrap).forEach(function (btn) {
        var f = btn.getAttribute("data-filter");
        var c = btn.querySelector(".count");
        if (c) c.textContent = counts[f] || 0;
        if (!counts[f] && f !== "all") btn.style.display = "none";
        btn.addEventListener("click", function () {
          $$(".filter-btn", filterWrap).forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
          btn.setAttribute("aria-pressed", "true");
          buildsEl.classList.toggle("feature-first", f === "all");
          $$(".build", buildsEl).forEach(function (card) {
            var show = f === "all" || card.getAttribute("data-cat") === f;
            card.classList.toggle("is-hidden", !show);
            if (show) card.classList.add("in");
          });
        });
      });
    }
  }

  var intEl = $("#interior-grid");
  if (intEl && window.BB_INTERIORS) {
    var ilimit = parseInt(intEl.getAttribute("data-limit") || "0", 10);
    var ilist = ilimit ? window.BB_INTERIORS.slice(0, ilimit) : window.BB_INTERIORS;
    intEl.innerHTML = ilist.map(function (b, i) {
      // rhythm: 3 across, then 2 wide, repeat
      var pos = i % 5;
      var wide = !ilimit && (pos === 3 || pos === 4);
      return '<figure class="interior reveal' + (wide ? " wide" : "") + '" data-lb="interiors" data-index="' + i + '" tabindex="0" role="button" aria-label="View ' + esc(b.title) + ' photo">' +
        '<img src="' + esc(b.img) + '" alt="' + esc(b.title) + '" loading="lazy" decoding="async">' +
        "<figcaption><h3>" + esc(b.title) + "</h3><p>" + esc(b.text) + "</p></figcaption></figure>";
    }).join("");
  }

  var reelsEl = $("#reels");
  if (reelsEl && window.BB_VIDEOS) {
    reelsEl.innerHTML = window.BB_VIDEOS.map(function (v) {
      return '<figure class="reel reveal"><video src="' + esc(v.src) + '"' + (v.poster ? ' poster="' + esc(v.poster) + '"' : "") + ' playsinline preload="none"></video>' +
        '<button class="play" type="button" aria-label="Play ' + esc(v.title) + '">' + ICON_PLAY + "</button>" +
        "<figcaption><h3>" + esc(v.title) + "</h3><p>" + esc(v.text || "") + "</p></figcaption></figure>";
    }).join("");
    $$(".reel", reelsEl).forEach(function (r) {
      var vid = $("video", r);
      $(".play", r).addEventListener("click", function () {
        $$("#reels video").forEach(function (o) { if (o !== vid) o.pause(); });
        vid.controls = true;
        vid.play();
        r.classList.add("playing");
      });
      vid.addEventListener("pause", function () { if (vid.ended) { r.classList.remove("playing"); vid.controls = false; } });
    });
  }

  /* ---------- Lightbox ---------- */
  var lb, lbImg, lbTitle, lbText, lbCount, group = [], idx = 0, lastFocus;
  function sourceFor(name) {
    if (name === "builds") return window.BB_BUILDS || [];
    if (name === "interiors") return window.BB_INTERIORS || [];
    if (name === "mendoza") return window.BB_MENDOZA || [];
    return [];
  }
  function ensureLB() {
    if (lb) return;
    lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Photo viewer");
    lb.innerHTML =
      '<span class="lb-count"></span>' +
      '<button class="lb-btn lb-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="lb-btn lb-prev" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<figure><img alt=""><figcaption><b></b><span></span></figcaption></figure>' +
      '<button class="lb-btn lb-next" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg></button>';
    document.body.appendChild(lb);
    lbImg = $("img", lb); lbTitle = $("figcaption b", lb); lbText = $("figcaption span", lb); lbCount = $(".lb-count", lb);
    $(".lb-close", lb).addEventListener("click", closeLB);
    $(".lb-prev", lb).addEventListener("click", function () { show(idx - 1); });
    $(".lb-next", lb).addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLB(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLB();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }
  function show(i) {
    if (!group.length) return;
    idx = (i + group.length) % group.length;
    var it = group[idx];
    lbImg.src = it.img; lbImg.alt = it.title;
    lbTitle.textContent = it.title; lbText.textContent = it.text || "";
    lbCount.textContent = (idx + 1) + " / " + group.length;
  }
  function openLB(name, i) {
    ensureLB();
    group = sourceFor(name);
    // When a filter is active, only page through the visible builds
    if (name === "builds") {
      var vis = $$('#builds-grid .build:not(.is-hidden)').map(function (c) { return parseInt(c.getAttribute("data-index"), 10); });
      if (vis.length && vis.length < group.length) {
        var all = group; group = vis.map(function (k) { return all[k]; });
        i = Math.max(0, vis.indexOf(i));
      }
    }
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    $(".lb-close", lb).focus();
  }
  function closeLB() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-lb]");
    if (!el) return;
    // Only open for visible gallery cards; respect filtered sets
    openLB(el.getAttribute("data-lb"), parseInt(el.getAttribute("data-index"), 10) || 0);
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("[data-lb]")) {
      e.preventDefault();
      openLB(e.target.getAttribute("data-lb"), parseInt(e.target.getAttribute("data-index"), 10) || 0);
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var reveal = function () {
    var els = $$(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  };
  reveal();

  /* ---------- Sparks in hero ---------- */
  var sparks = $(".sparks");
  if (sparks && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (var s = 0; s < 22; s++) {
      var i = document.createElement("i");
      i.style.left = (40 + Math.random() * 60) + "%";
      i.style.animationDuration = (5 + Math.random() * 7) + "s";
      i.style.animationDelay = (Math.random() * 8) + "s";
      i.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
      sparks.appendChild(i);
    }
  }

  /* ---------- Count-up stats ---------- */
  $$("[data-count]").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var done = false;
    var run = function () {
      if (done) return; done = true;
      var t0 = performance.now(), dur = 1400;
      (function tick(t) {
        var p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { run(); io.disconnect(); } });
      io.observe(el);
    } else run();
  });

  /* ---------- Unmute toggle for story videos ---------- */
  $$("[data-sound]").forEach(function (btn) {
    var vid = document.getElementById(btn.getAttribute("data-sound"));
    if (!vid) return;
    btn.addEventListener("click", function () {
      vid.muted = !vid.muted;
      if (!vid.muted) { vid.currentTime = 0; vid.play(); }
      btn.querySelector("span").textContent = vid.muted ? "Sound on" : "Mute";
    });
  });

  /* ---------- Contact form (FormSubmit AJAX) ---------- */
  var form = $("#quote-form");
  if (form) {
    var status = $("#form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector("button[type=submit]");
      var label = btn.innerHTML;
      btn.disabled = true; btn.textContent = "Sending…";
      status.className = "form-status"; status.textContent = "";

      var data = new FormData(form);
      // Combine multi-select chips into one readable line
      var services = data.getAll("Services needed");
      data.delete("Services needed");
      data.append("Services needed", services.length ? services.join(", ") : "—");

      fetch(form.getAttribute("action"), { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.j.success) !== "false") {
            form.reset();
            status.className = "form-status ok";
            status.innerHTML = "<b>Thank you — your request is in.</b> David or Oliver will reach out within one business day. ¡Gracias!";
            status.scrollIntoView({ behavior: "smooth", block: "center" });
          } else { throw new Error(res.j.message || "Send failed"); }
        })
        .catch(function () {
          status.className = "form-status err";
          status.innerHTML = 'Something went wrong sending the form. Please email us at <a href="mailto:battleborntrailers@gmail.com" style="text-decoration:underline">battleborntrailers@gmail.com</a> or call <a href="tel:+17752004169" style="text-decoration:underline">775-200-4169</a>.';
        })
        .finally(function () { btn.disabled = false; btn.innerHTML = label; });
    });
  }
})();
