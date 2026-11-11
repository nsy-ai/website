(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const onScroll = () => {
    if (window.scrollY > 8) {
      header.setAttribute("data-scrolled", "");
    } else {
      header.removeAttribute("data-scrolled");
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#menu-mobile");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Ouvrir le menu" : "Fermer le menu");
    menu.hidden = open;
    if (!open) menu.setAttribute("data-open", "");
    else menu.removeAttribute("data-open");
  });
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.hidden = true;
      menu.removeAttribute("data-open");
    })
  );

  document.getElementById("annee").textContent = String(new Date().getFullYear());

  const lines = [
    { prompt: "nsyai run --task devis-entrant", out: null },
    { prompt: null, out: "→ lecture du mail (PDF joint)… ok", cls: "t-dim" },
    { prompt: null, out: "→ extraction : client, montant, urgence", cls: "t-dim" },
    { prompt: null, out: "→ rédaction réponse + mise à jour CRM", cls: "t-dim" },
    { prompt: null, out: "✓ devis traité en 41 s — escalade : non", cls: "t-ok" },
    { prompt: "nsyai run --taskveille-secteur", out: null },
    { prompt: null, out: "→ 128 sources analysées", cls: "t-dim" },
    { prompt: null, out: "✓ synthèse envoyée à 3 collaborateurs", cls: "t-ok" },
  ];

  const term = document.querySelector("[data-terminal]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function renderStatic() {
    const html = lines
      .map((l) =>
        l.prompt
          ? `<span class="t-line"><span class="t-prompt">$</span> ${l.prompt}</span>`
          : `<span class="t-line ${l.cls || ""}">${l.out}</span>`
      )
      .join("");
    term.innerHTML = html + `<span class="t-line"><span class="t-prompt">$</span> <span class="t-caret"></span></span>`;
  }

  function typeLoop() {
    const speed = 26;
    const pause = 900;
    let li = 0;

    function nextLine() {
      if (li >= lines.length) {
        setTimeout(() => {
          term.innerHTML = "";
          li = 0;
          setTimeout(nextLine, 400);
        }, 2200);
        return;
      }
      const l = lines[li];
      const span = document.createElement("span");
      span.className = "t-line";
      if (l.prompt) {
        const p = document.createElement("span");
        p.className = "t-prompt";
        p.textContent = "$ ";
        span.appendChild(p);
        term.appendChild(span);
        typeText(span, l.prompt, speed, () => {
          li++;
          setTimeout(nextLine, 350);
        });
      } else {
        span.className = "t-line " + (l.cls || "");
        term.appendChild(span);
        typeText(span, l.out, 8, () => {
          li++;
          setTimeout(nextLine, 180);
        });
      }
      term.scrollTop = term.scrollHeight;
    }

    function typeText(el, text, ms, done) {
      let i = 0;
      (function tick() {
        if (i <= text.length) {
          el.lastChild.textContent = "";
          el.appendChild(document.createTextNode(text.slice(0, i)));
          i++;
          setTimeout(tick, ms);
        } else {
          done();
        }
      })();
    }

    nextLine();
  }

  if (reduce.matches) renderStatic();
  else {
    renderStatic();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            term.innerHTML = "";
            typeLoop();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(term);
  }

  const form = document.querySelector(".contact-form");
  const submitBtn = form.querySelector("[data-submit-btn]");
  const success = form.querySelector(".form-success");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let firstError = null;

    form.querySelectorAll(".field").forEach((field) => {
      const input = field.querySelector("input, textarea");
      const err = field.querySelector(".field-error");
      let valid = input.value.trim() !== "";
      if (valid && input.type === "email") {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
      }
      field.classList.toggle("invalid", !valid);
      err.hidden = valid;
      if (!valid && !firstError) firstError = input;
    });

    if (firstError) {
      firstError.focus();
      return;
    }

    const original = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Envoi…';
    success.hidden = true;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = original;
      success.hidden = false;
      form.reset();
      form.querySelectorAll(".field").forEach((f) => {
        f.classList.remove("invalid");
        const err = f.querySelector(".field-error");
        if (err) err.hidden = true;
      });
      success.focus?.();
    }, 1200);
  });

  form.querySelectorAll("input, textarea").forEach((el) =>
    el.addEventListener("input", () => {
      const field = el.closest(".field");
      field.classList.remove("invalid");
      const err = field.querySelector(".field-error");
      if (err) err.hidden = true;
    })
  );
})();
