// Kombu Fitness: small, dependency-free enhancements. The page works without JS.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Opening hours in IST, minutes from midnight. Index = Date.getDay() (0 = Sunday).
  const HOURS = [
    [360, 780],   // Sun 6:00 – 13:00
    [330, 1320],  // Mon 5:30 – 22:00
    [330, 1320],
    [330, 1320],
    [330, 1320],
    [330, 1320],
    [330, 1320],  // Sat
  ];

  // Current time in Kochi regardless of the visitor's timezone
  const nowInIST = () => {
    const d = new Date();
    return new Date(d.getTime() + (d.getTimezoneOffset() + 330) * 60000);
  };

  const fmt = (mins) => {
    const h = Math.floor(mins / 60), m = mins % 60;
    const ap = h >= 12 ? "PM" : "AM";
    const h12 = ((h + 11) % 12) + 1;
    return m ? `${h12}:${String(m).padStart(2, "0")} ${ap}` : `${h12} ${ap}`;
  };

  // Header: stuck style after scrolling, hide on scroll down, show on scroll up
  const header = $("[data-header]");
  const dock = $(".dock");
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle("is-stuck", y > 20);
    const navOpen = $("#nav").classList.contains("is-open");
    header.classList.toggle("is-hidden", !navOpen && y > 400 && y > lastY);
    dock?.classList.toggle("is-visible", y > 500);
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile nav
  const toggle = $("[data-nav-toggle]");
  const nav = $("#nav");
  const setNav = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setNav(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setNav(false));

  // Scrollspy for nav links
  const links = $$('.nav ul a[href^="#"]');
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.hash === `#${en.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  links.forEach((a) => { const t = $(a.hash); if (t) spy.observe(t); });

  // Reveal on scroll
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    }),
    { rootMargin: "0px 0px -10% 0px" }
  );
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = reduceMotion ? "0s" : `${(i % 3) * 80}ms`;
    io.observe(el);
  });

  // Live "open now" status + highlight today's hours
  const updateStatus = () => {
    const now = nowInIST();
    const day = now.getDay();
    const mins = now.getHours() * 60 + now.getMinutes();
    const [open, close] = HOURS[day];
    const status = $("[data-status]");
    const text = $("[data-status-text]");
    const isOpen = mins >= open && mins < close;

    if (status && text) {
      status.classList.toggle("is-open", isOpen);
      if (isOpen) {
        text.textContent = `Open now · until ${fmt(close)} today`;
      } else if (mins < open) {
        text.textContent = `Closed · opens ${fmt(open)} today`;
      } else {
        const next = (day + 1) % 7;
        text.textContent = `Closed · opens ${fmt(HOURS[next][0])} tomorrow`;
      }
    }

    $$("[data-hours] tr").forEach((tr) => {
      tr.classList.toggle("is-today", tr.dataset.days.split(",").includes(String(day)));
    });
  };
  updateStatus();
  setInterval(updateStatus, 60000);

  // November challenge countdown
  const challenge = $("[data-challenge]");
  if (challenge) {
    const start = new Date(challenge.dataset.start).getTime();
    const end = new Date(challenge.dataset.end).getTime();
    const lede = $("[data-challenge-lede]", challenge);
    const set = (k, v) => { const el = $(`[data-cd="${k}"]`, challenge); if (el) el.textContent = String(v).padStart(2, "0"); };

    const tick = () => {
      const now = Date.now();
      if (now >= end) {
        challenge.classList.add("is-over");
        $("#challenge-title").innerHTML = "<span>Next round.</span> Kombu challenges.";
        lede.textContent = "Our 30-day challenges run through the year. Message us to get a spot in the next one.";
        return false;
      }
      if (now >= start) {
        challenge.classList.add("is-over");
        lede.innerHTML = "The challenge is <strong>running now</strong>. It's not too late: message us and a coach will tell you how to jump in.";
        return false;
      }
      let s = Math.floor((start - now) / 1000);
      set("d", Math.floor(s / 86400)); s %= 86400;
      set("h", Math.floor(s / 3600)); s %= 3600;
      set("m", Math.floor(s / 60));
      return true;
    };
    if (tick()) { const t = setInterval(() => tick() || clearInterval(t), 30000); }
  }

  // Click-to-load Google Map (keeps the page fast; no third-party requests until asked)
  const map = $("[data-map]");
  $("[data-map-load]")?.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.title = "Map showing Kombu Fitness, Judgemukku, Thrikkakara";
    f.loading = "lazy";
    f.referrerPolicy = "no-referrer-when-downgrade";
    f.src = "https://www.google.com/maps?q=Kombu+Fitness+Judgemukku+Thrikkakara+Kakkanad&output=embed";
    map.append(f);
  });

  const year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
