// ---------------------------------------------------------------------------
// App list — edit names, descriptions, colours and links here.
// `logo` is either "k" (the Konda K mark in the app's colours), "flask",
// or a path to an image file in assets/logos/.
// ---------------------------------------------------------------------------
const APPS = [
  {
    name: "Konda Asset Management",
    tag: "Every asset, accounted for",
    desc: "Track assets, inspections and maintenance schedules in one place — with full history at your fingertips.",
    features: ["Asset register", "Inspections", "Maintenance plans"],
    colors: ["#7c3aed", "#c026d3"],
    logo: "k",
    url: "#",
  },
  {
    name: "Konda Training",
    tag: "Competence, made simple",
    desc: "Manage staff training, certificates and renewals, with automatic reminders before anything expires.",
    features: ["Training matrix", "Certificates", "Expiry alerts"],
    colors: ["#d98e45", "#f2b36b"],
    logo: "k",
    url: "#",
  },
  {
    name: "Seguro RAMS",
    tag: "Safer work, signed off faster",
    desc: "Create, approve and share Risk Assessments & Method Statements in minutes, with digital sign-off on site.",
    features: ["RAMS builder", "Approvals", "Digital sign-off"],
    colors: ["#2563eb", "#e4572e"],
    logo: "assets/logos/seguro-shield.png",
    url: "#",
  },
  {
    name: "Konda Sense",
    tag: "Live data from the field",
    desc: "Connect sensors and monitor readings in real time, with instant alerts when something needs attention.",
    features: ["Live dashboards", "Smart alerts", "Data history"],
    colors: ["#10b981", "#84cc16"],
    logo: "k",
    url: "#",
  },
  {
    name: "Labportal",
    tag: "Results, without the chase",
    desc: "Submit samples, track progress and receive lab results online — clear, searchable and ready to share.",
    features: ["Sample tracking", "Online results", "Reports"],
    colors: ["#4f46e5", "#06b6d4"],
    logo: "flask",
    url: "#",
  },
  {
    name: "Konda Job Management",
    tag: "From booking to done",
    desc: "Schedule, dispatch and track jobs across your team, from first call to completed paperwork.",
    features: ["Scheduling", "Mobile workforce", "Job sheets"],
    colors: ["#1f9e9e", "#2dd4bf"],
    logo: "k",
    url: "#",
  },
];

const AUTOPLAY_MS = 5000;

// ---------------------------------------------------------------------------

const stage = document.getElementById("stage");
const switcher = document.getElementById("switcher");
const root = document.documentElement;
let active = 0;
let timer = null;
let paused = false;

function logoMarkup(app, i) {
  if (app.logo === "k") {
    const id = `kgrad-${i}`;
    return `
      <svg viewBox="0 0 325 417" aria-hidden="true">
        <defs>
          <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${app.colors[0]}" />
            <stop offset="1" stop-color="${app.colors[1]}" />
          </linearGradient>
        </defs>
        <g fill="url(#${id})">
          <polygon points="0,0 158,0 0,233" />
          <polygon points="285,0 325,0 325,417 297,417 160,190" />
          <polygon points="0,417 93,282 170,417" />
        </g>
      </svg>`;
  }
  if (app.logo === "flask") {
    // Round-bottom flask with an orbiting "portal" ring
    const g = `fgrad-${i}`, r = `fring-${i}`, clip = `fbulb-${i}`;
    const ring = "M8 57 A42 12 0 0 {s} 92 57";
    const tilt = 'transform="rotate(-16 50 57)"';
    return `
      <svg class="logo--flask" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${app.colors[0]}" />
            <stop offset="1" stop-color="${app.colors[1]}" />
          </linearGradient>
          <linearGradient id="${r}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="${app.colors[1]}" />
            <stop offset="1" stop-color="${app.colors[0]}" />
          </linearGradient>
          <clipPath id="${clip}"><circle cx="50" cy="62" r="27" /></clipPath>
        </defs>
        <path d="${ring.replace("{s}", 1)}" ${tilt} fill="none" stroke="url(#${r})" stroke-width="4.5" stroke-linecap="round" opacity=".45" />
        <rect x="42" y="10" width="16" height="30" fill="url(#${g})" opacity=".25" />
        <circle cx="50" cy="62" r="27" fill="url(#${g})" opacity=".25" />
        <rect x="37" y="5" width="26" height="7" rx="2.5" fill="url(#${g})" />
        <g clip-path="url(#${clip})">
          <polygon points="0,58 100,74 100,100 0,100" fill="url(#${g})" />
          <circle cx="42" cy="80" r="3.4" fill="#fff" />
          <circle cx="54" cy="84" r="2.3" fill="#fff" />
          <circle cx="34" cy="72" r="1.8" fill="#fff" />
        </g>
        <path d="${ring.replace("{s}", 0)}" ${tilt} fill="none" stroke="#fff" stroke-width="9" />
        <path d="${ring.replace("{s}", 0)}" ${tilt} fill="none" stroke="url(#${r})" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="89" cy="40" r="4.5" fill="url(#${g})" />
      </svg>`;
  }
  return `<img src="${app.logo}" alt="" draggable="false" />`;
}

function build() {
  APPS.forEach((app, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.setProperty("--c1", app.colors[0]);
    card.style.setProperty("--c2", app.colors[1]);
    card.setAttribute("aria-roledescription", "slide");
    card.setAttribute("aria-label", `${i + 1} of ${APPS.length}: ${app.name}`);
    card.innerHTML = `
      <div class="logo-tile">${logoMarkup(app, i)}</div>
      <h2 class="card__name">${app.name}</h2>
      <p class="card__tag">${app.tag}</p>
      <p class="card__desc">${app.desc}</p>
      <ul class="card__features">${app.features.map((f) => `<li>${f}</li>`).join("")}</ul>
      <a class="card__cta" href="${app.url}">
        Explore ${app.name.replace(/^Konda /, "")}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
      <div class="card__progress"><span></span></div>`;
    card.addEventListener("click", () => {
      if (i !== active) go(i);
    });
    stage.appendChild(card);

    const btn = document.createElement("button");
    btn.textContent = app.name.replace(/^Konda /, "");
    btn.style.setProperty("--c1", app.colors[0]);
    btn.style.setProperty("--c2", app.colors[1]);
    btn.addEventListener("click", () => go(i));
    switcher.appendChild(btn);
  });
}

function layout() {
  const cards = stage.children;
  const n = APPS.length;
  const w = window.innerWidth;
  const spread = w <= 640 ? w * 0.64 : Math.min(330, Math.max(150, w * 0.24));

  for (let i = 0; i < n; i++) {
    // Shortest signed distance around the loop, e.g. -3..+2 for 6 apps
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    const abs = Math.abs(d);

    const x = d * spread * (abs > 1 ? 0.82 : 1);
    const z = -abs * 220;
    const rot = -d * 28;
    const scale = abs === 0 ? 1 : 0.86 - (abs - 1) * 0.08;

    const card = cards[i];
    card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rot}deg) scale(${scale})`;
    card.style.opacity = abs === 0 ? 1 : abs === 1 ? 0.55 : abs === 2 ? 0.18 : 0;
    card.style.filter = abs === 0 ? "none" : `blur(${abs * 1.5}px) saturate(0.7)`;
    card.style.zIndex = String(10 - abs);
    card.style.pointerEvents = abs > 2 ? "none" : "auto";
    card.classList.toggle("is-active", abs === 0);
    card.setAttribute("aria-hidden", abs === 0 ? "false" : "true");
    card.querySelector(".card__cta").tabIndex = abs === 0 ? 0 : -1;
  }

  [...switcher.children].forEach((b, i) => b.setAttribute("aria-current", String(i === active)));

  root.style.setProperty("--a1", APPS[active].colors[0]);
  root.style.setProperty("--a2", APPS[active].colors[1]);
}

function restartProgress() {
  const bar = stage.children[active].querySelector(".card__progress span");
  bar.style.animation = "none";
  void bar.offsetWidth; // reflow so the animation starts fresh
  bar.style.animation = "";
}

function go(i) {
  active = (i + APPS.length) % APPS.length;
  layout();
  restartProgress();
  schedule();
}

function schedule() {
  clearTimeout(timer);
  if (!paused) timer = setTimeout(() => go(active + 1), AUTOPLAY_MS);
}

function setPaused(p) {
  paused = p;
  stage.classList.toggle("is-paused", p);
  schedule();
}

// ---- Controls ----
document.querySelector(".arrow--prev").addEventListener("click", () => go(active - 1));
document.querySelector(".arrow--next").addEventListener("click", () => go(active + 1));

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") go(active - 1);
  if (e.key === "ArrowRight") go(active + 1);
});

stage.addEventListener("mouseenter", () => setPaused(true));
stage.addEventListener("mouseleave", () => setPaused(false));
document.addEventListener("visibilitychange", () => setPaused(document.hidden));

// Swipe on touch devices
let startX = null;
stage.addEventListener("pointerdown", (e) => { startX = e.clientX; });
stage.addEventListener("pointerup", (e) => {
  if (startX === null) return;
  const dx = e.clientX - startX;
  startX = null;
  if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
});

window.addEventListener("resize", layout);

// ---- Init ----
root.style.setProperty("--autoplay", `${AUTOPLAY_MS}ms`);
document.getElementById("year").textContent = new Date().getFullYear();
build();
layout();
schedule();
