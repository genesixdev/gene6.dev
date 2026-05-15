/* ========================================
   GENE6IX.DEV — script.js
   No dependencies. Vanilla JS only.
   ======================================== */

(function () {
  "use strict";

  /* FOOTER YEAR */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* NAV SCROLL SHADOW */
  var nav = document.getElementById("nav");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* MOBILE MENU TOGGLE */
  var toggle   = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  toggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });

  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      navLinks.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  /* SCROLL REVEAL */
  var revealEls = document.querySelectorAll("[data-reveal]");
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el    = e.target;
      var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
      setTimeout(function () { el.classList.add("on"); }, delay);
      revealObs.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  revealEls.forEach(function (el) { revealObs.observe(el); });

  /* COUNTER ANIMATION */
  var counters  = document.querySelectorAll("[data-count]");
  var counted   = false;
  if (counters.length) {
    var statsRow = counters[0].closest(".stats");
    if (statsRow) {
      var countObs = new IntersectionObserver(function (entries) {
        if (counted || !entries[0].isIntersecting) return;
        counted = true;
        counters.forEach(function (el) {
          var target   = parseInt(el.getAttribute("data-count"), 10);
          var duration = 1400;
          var start    = performance.now();
          function step(now) {
            var p = Math.min((now - start) / duration, 1);
            var e = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(e * target);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target;
          }
          requestAnimationFrame(step);
        });
        countObs.disconnect();
      }, { threshold: 0.4 });
      countObs.observe(statsRow);
    }
  }

  /* FORM — VALIDATE AND SEND VIA WHATSAPP */
  var form      = document.getElementById("contactForm");
  var submitBtn = document.getElementById("submitBtn");
  var formMsg   = document.getElementById("formMsg");

  if (!form) return;

  /* Field map — IDs must match index.html exactly */
  var fields = {
    fname:    { el: document.getElementById("fname"),    err: document.getElementById("fnameErr"),    label: "Name" },
    femail:   { el: document.getElementById("femail"),   err: document.getElementById("femailErr"),   label: "Email" },
    fsubject: { el: document.getElementById("fsubject"), err: document.getElementById("fsubjectErr"), label: "Subject" },
    fmessage: { el: document.getElementById("fmessage"), err: document.getElementById("fmessageErr"), label: "Message" }
  };

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  function validateField(key) {
    var f   = fields[key];
    var val = f.el.value.trim();
    var err = "";
    if (!val) {
      err = f.label + " is required.";
    } else if (key === "femail" && !isEmail(val)) {
      err = "Enter a valid email address.";
    } else if (key === "fmessage" && val.length < 20) {
      err = "Write at least a little more — 20 characters minimum.";
    }
    f.err.textContent = err;
    f.el.classList.toggle("err", !!err);
    return !err;
  }

  Object.keys(fields).forEach(function (key) {
    fields[key].el.addEventListener("blur",  function () { validateField(key); });
    fields[key].el.addEventListener("input", function () {
      if (fields[key].el.classList.contains("err")) validateField(key);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    formMsg.textContent = "";

    var valid = Object.keys(fields).reduce(function (acc, key) {
      return validateField(key) && acc;
    }, true);

    if (!valid) return;

    var name    = fields.fname.el.value.trim();
    var email   = fields.femail.el.value.trim();
    var subject = fields.fsubject.el.value.trim();
    var message = fields.fmessage.el.value.trim();

    var text = [
      "Hello gene6ix,",
      "",
      "Name: "    + name,
      "Email: "   + email,
      "Project: " + subject,
      "",
      message
    ].join("\n");

    var waURL = "https://wa.me/2349018569990?text=" + encodeURIComponent(text);

    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    setTimeout(function () {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
      form.reset();
      Object.keys(fields).forEach(function (key) {
        fields[key].el.classList.remove("err");
        fields[key].err.textContent = "";
      });
      formMsg.textContent = "Opening WhatsApp — your message is ready to send.";
      setTimeout(function () { formMsg.textContent = ""; }, 6000);
      window.open(waURL, "_blank", "noopener,noreferrer");
    }, 700);
  });

})();
