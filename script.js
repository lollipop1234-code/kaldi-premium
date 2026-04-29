const root = document.documentElement;
const header = document.querySelector("[data-header]");
const hero = document.querySelector(".hero");
const canvas = document.getElementById("hero-canvas");
const ctx = canvas.getContext("2d", { alpha: true });

const beers = {
  classic: {
    label: "Klassík",
    style: "Lager / tær og köld",
    name: "Kalda Klassík",
    description: "Hreinn, stökkur og bjartur Kaldi með léttri maltsætu, ferskri beiskju og norðlenskri skýrleika.",
    notes: ["Ferskt", "Korn", "Mjúk beiskja"],
    color: "#d49b35",
    dark: "#7e4d22",
    axes: { fresh: 0.98, malt: 0.76, bitter: 0.7, aroma: 0.62 },
  },
  dark: {
    label: "Dökkur",
    style: "Dökkur lager / ristaður",
    name: "Kalda Dökkur",
    description: "Dýpri maltkarakter með karamellu, ristuðum tónum og mjúkum endi sem heldur sér samt hreinum.",
    notes: ["Ristað", "Karamella", "Silkimjúkt"],
    color: "#8a4b2b",
    dark: "#321d17",
    axes: { fresh: 0.58, malt: 1, bitter: 0.72, aroma: 0.78 },
  },
  ipa: {
    label: "IPA",
    style: "IPA / humlar og sítrus",
    name: "Kalda IPA",
    description: "Líflegur humlakarakter með sítrus, jurtum og hreinni beiskju sem sker í gegnum ferska froðuna.",
    notes: ["Sítrus", "Humlar", "Beiskja"],
    color: "#d8722f",
    dark: "#5b291c",
    axes: { fresh: 0.86, malt: 0.66, bitter: 1, aroma: 0.96 },
  },
  seasonal: {
    label: "Árstíð",
    style: "Takmörkuð útgáfa / skap veðursins",
    name: "Kalda Árstíð",
    description: "Rými fyrir sérbrugg, hátíðir og tilraunir þar sem staðurinn, árstíðin og hráefnið fá að ráða ferðinni.",
    notes: ["Sérbrugg", "Árstíð", "Óvænt"],
    color: "#63bfca",
    dark: "#215b64",
    axes: { fresh: 0.92, malt: 0.7, bitter: 0.68, aroma: 1 },
  },
};

const updateScroll = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  root.style.setProperty("--scroll", `${Math.max(0, Math.min(1, ratio)) * 100}%`);
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

window.addEventListener("scroll", updateScroll, { passive: true });
updateScroll();

const setPointer = (event) => {
  const rect = hero.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  root.style.setProperty("--mx", x.toFixed(3));
  root.style.setProperty("--my", y.toFixed(3));
  pointer.x = x;
  pointer.y = y;
};

hero.addEventListener("pointermove", setPointer);
hero.addEventListener("pointerleave", () => {
  root.style.setProperty("--mx", "0");
  root.style.setProperty("--my", "0");
  pointer.x = 0;
  pointer.y = 0;
});

const setBeer = (key) => {
  const beer = beers[key] || beers.classic;
  root.style.setProperty("--beer-color", beer.color);
  root.style.setProperty("--beer-dark", beer.dark);
  for (const [axis, value] of Object.entries(beer.axes)) {
    root.style.setProperty(`--${axis}`, value);
  }

  document.querySelector("[data-beer-label]").textContent = beer.label;
  document.querySelector("[data-beer-style]").textContent = beer.style;
  document.querySelector("[data-beer-name]").textContent = beer.name;
  document.querySelector("[data-beer-description]").textContent = beer.description;

  const notes = document.querySelector("[data-beer-notes]");
  notes.replaceChildren(...beer.notes.map((note) => {
    const span = document.createElement("span");
    span.textContent = note;
    return span;
  }));

  document.querySelectorAll("[data-beer]").forEach((button) => {
    const active = button.dataset.beer === key;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
};

document.querySelectorAll("[data-beer]").forEach((button) => {
  button.addEventListener("click", () => setBeer(button.dataset.beer));
});

const mailLink = document.querySelector("[data-mail-link]");
const setIntent = (intent) => {
  const subject = encodeURIComponent(intent);
  mailLink.href = `mailto:bruggsmidjan@bruggsmidjan.is?subject=${subject}`;
  document.querySelectorAll("[data-intent]").forEach((button) => {
    const active = button.dataset.intent === intent;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
};

document.querySelectorAll("[data-intent]").forEach((button) => {
  button.addEventListener("click", () => setIntent(button.dataset.intent));
});

document.querySelectorAll("[data-service]").forEach((card) => {
  card.addEventListener("click", () => {
    const match = {
      Kynning: "Kynning fyrir hóp",
      Sérmerking: "Sérmerking á bjór",
      Dæluleiga: "Leiga á bjórdælu",
      "Beint frá býli": "Kaup beint frá verksmiðju",
    }[card.dataset.service];
    if (match) setIntent(match);
  });
});

const pointer = { x: 0, y: 0 };
let width = 0;
let height = 0;
let dpr = 1;
let time = 0;

const resizeCanvas = () => {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
};

const drawRibbon = (offset, color, alpha, amplitude) => {
  ctx.beginPath();
  const base = height * (0.24 + offset * 0.07);
  for (let x = -20; x <= width + 20; x += 18) {
    const wave = Math.sin(x * 0.008 + time * 0.018 + offset) * amplitude;
    const slow = Math.sin(x * 0.002 + time * 0.008 + offset * 2) * amplitude * 0.85;
    const y = base + wave + slow + pointer.y * 42;
    if (x === -20) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "rgba(99, 191, 202, 0)");
  gradient.addColorStop(0.35, color.replace("ALPHA", alpha));
  gradient.addColorStop(0.75, "rgba(201, 30, 46, 0.28)");
  gradient.addColorStop(1, "rgba(212, 155, 53, 0)");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 22 + offset * 8;
  ctx.lineCap = "round";
  ctx.stroke();
};

const drawFrost = () => {
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = "rgba(255, 250, 240, 0.7)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 42; i += 1) {
    const x = (i * 137 + time * (0.18 + (i % 5) * 0.04)) % (width + 120) - 60;
    const y = (i * 73 + Math.sin(time * 0.011 + i) * 40) % Math.max(height, 1);
    const len = 8 + (i % 7);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y - len * 0.45);
    ctx.stroke();
  }
  ctx.restore();
};

const animate = () => {
  time += 1;
  ctx.clearRect(0, 0, width, height);
  drawRibbon(0, "rgba(99, 191, 202, ALPHA)", 0.34, 26);
  drawRibbon(1, "rgba(214, 157, 54, ALPHA)", 0.24, 20);
  drawRibbon(2, "rgba(255, 250, 240, ALPHA)", 0.18, 14);
  drawFrost();
  requestAnimationFrame(animate);
};

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
setBeer("classic");
setIntent("Kynning fyrir hóp");
animate();
