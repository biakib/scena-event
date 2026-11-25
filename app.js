const formats = [
  {
    title: "Концерты и фестивали",
    option: "Концерт или фестиваль",
    group: "culture",
    image: "concert",
    description: "Собираем музыкальную программу и техническую команду, чтобы сцена и зрительская зона работали в одном ритме.",
    tasks: ["Программа и работа с артистами", "Сцена, свет, звук и репетиции", "Координация площадки и зрительских потоков"]
  },
  {
    title: "Конференции и форумы",
    option: "Конференция или форум",
    group: "business",
    image: "forum",
    description: "Проектируем программу, площадку и движение гостей с учётом параллельных сессий и перерывов.",
    tasks: ["Программа и работа со спикерами", "Регистрация, навигация и зоны общения", "Техническое сопровождение и трансляция по задаче"]
  },
  {
    title: "Корпоративы",
    option: "Корпоратив",
    group: "business",
    image: "dinner",
    description: "Готовим события для команд, партнёров и клиентов с программой, которую удобно прожить всем гостям.",
    tasks: ["Концепция, площадка и сценарий", "Ведущий, артисты и кейтеринг", "Координация гостей и подрядчиков"]
  },
  {
    title: "Городские события",
    option: "Городское событие",
    group: "culture",
    image: "city",
    description: "Организуем открытые события с учётом особенностей территории и движения посетителей.",
    tasks: ["Программа и схема площадки", "Зонирование, навигация и техническая подготовка", "Координация участников и работы на площадке"]
  },
  {
    title: "Премии и гала-вечера",
    option: "Премия или гала-вечер",
    group: "business",
    image: "awards",
    description: "Выстраиваем церемонию вокруг выхода номинантов и лауреатов, темпа вечера и работы сцены.",
    tasks: ["Драматургия, сценарий и порядок награждения", "Подготовка ведущего, участников и сценической графики", "Репетиции и режиссура церемонии"]
  }
];

const list = document.querySelector("#format-list");
const filters = [...document.querySelectorAll("[data-filter]")];
const dialog = document.querySelector("#format-dialog");
const brief = document.querySelector("#brief-form");
const briefDisclosure = document.querySelector("#brief-disclosure");
const briefFormat = document.querySelector("#brief-format");
const result = document.querySelector("#brief-result");
const briefText = document.querySelector("#brief-text");
const status = document.querySelector("#brief-status");
let currentFormat;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const menu = document.querySelector("#site-menu");
const menuToggle = document.querySelector("#menu-toggle");

menuToggle.addEventListener("click", () => {
  menu.showModal();
  menuToggle.setAttribute("aria-expanded", "true");
});
document.querySelector("#menu-close").addEventListener("click", () => menu.close());
menu.addEventListener("close", () => menuToggle.setAttribute("aria-expanded", "false"));
menu.querySelectorAll(".menu-links a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.close();
    const section = document.querySelector(link.hash);
    section?.querySelector("h1, h2")?.focus({ preventScroll: true });
  });
});

const hero = document.querySelector("#featured-format");
const featuredFormats = [formats[0], formats[1], formats[4]];
const heroFrames = [...hero.querySelectorAll(".hero-frame")];
const heroButtons = [...hero.querySelectorAll("[data-frame]")];
const heroCaption = document.querySelector("#hero-caption");
const heroPlay = document.querySelector("#hero-play");
let activeFrame = 0;
let playing = !reducedMotion.matches;
let heroInView = true;
let heroTimer;

function showFrame(index) {
  activeFrame = index;
  heroFrames.forEach((frame, order) => frame.classList.toggle("is-active", order === index));
  heroButtons.forEach((button, order) => button.setAttribute("aria-pressed", String(order === index)));
  heroCaption.textContent = featuredFormats[index].title;
}

function syncHeroPlayback() {
  clearInterval(heroTimer);
  heroPlay.classList.toggle("is-paused", !playing);
  heroPlay.setAttribute("aria-label", playing ? "Пауза смены кадров" : "Включить смену кадров");
  if (playing && heroInView && !hero.hidden && !document.hidden && !menu.open && !dialog.open) {
    heroTimer = setInterval(() => showFrame((activeFrame + 1) % heroFrames.length), 4800);
  }
}

document.querySelector("#featured-details").addEventListener("click", () => {
  showDetails(featuredFormats[activeFrame]);
});
dialog.addEventListener("close", syncHeroPlayback);
heroButtons.forEach((button, index) => button.addEventListener("click", () => {
  playing = false;
  showFrame(index);
  syncHeroPlayback();
}));
heroPlay.addEventListener("click", () => {
  playing = !playing;
  syncHeroPlayback();
});
document.addEventListener("visibilitychange", syncHeroPlayback);
menu.addEventListener("close", syncHeroPlayback);
menuToggle.addEventListener("click", syncHeroPlayback);
reducedMotion.addEventListener("change", (event) => {
  if (event.matches) playing = false;
  syncHeroPlayback();
});
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    heroInView = entry.isIntersecting;
    syncHeroPlayback();
  }, { threshold: 0.2 }).observe(hero);
}
syncHeroPlayback();

const revealOnScroll = "IntersectionObserver" in window
  ? new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (!reducedMotion.matches) entry.target.classList.add("has-entered");
    }
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.11 })
  : null;

if (revealOnScroll) {
  document.querySelectorAll("[data-reveal]").forEach((block) => revealOnScroll.observe(block));
}

function showDetails(format) {
  currentFormat = format;
  document.querySelector("#dialog-image").src = `assets/${format.image}.webp`;
  document.querySelector("#dialog-title").textContent = format.title;
  document.querySelector("#dialog-description").textContent = format.description;
  document.querySelector("#dialog-list").replaceChildren(...format.tasks.map((task) => {
    const item = document.createElement("li");
    item.textContent = task;
    return item;
  }));
  dialog.showModal();
  syncHeroPlayback();
}

function renderFormats(group) {
  const showFeatured = group === "all";
  hero.hidden = !showFeatured;
  syncHeroPlayback();
  const matching = showFeatured ? formats.slice(1) : formats.filter((format) => format.group === group);
  if (revealOnScroll) {
    [...list.querySelectorAll(".format-img")].forEach((image) => revealOnScroll.unobserve(image));
  }
  list.replaceChildren(...matching.map((format, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "format-card";
    card.dataset.visual = format.image;
    if (showFeatured && index < 2) card.classList.add("editorial-row");
    card.setAttribute("aria-haspopup", "dialog");
    card.innerHTML = `<span class="format-img"><img src="assets/${format.image}.webp" alt="" loading="lazy"></span>
      <span class="format-info">
        <span class="format-name">${format.title}</span>
        <span class="format-type">${format.group === "business" ? "Для компаний" : "Культурные и городские"}</span>
        <span class="format-open" aria-hidden="true">+</span>
      </span>`;
    revealOnScroll?.observe(card.querySelector(".format-img"));
    card.addEventListener("click", () => showDetails(format));
    return card;
  }));
}

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    if (filter.getAttribute("aria-pressed") === "true") return;
    filters.forEach((item) => item.setAttribute("aria-pressed", String(item === filter)));
    renderFormats(filter.dataset.filter);
  });
});
renderFormats("all");

dialog.querySelector(".close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
document.querySelector("#choose-format").addEventListener("click", () => {
  briefFormat.value = currentFormat.option;
  result.hidden = true;
  dialog.close();
  briefDisclosure.open = true;
  briefFormat.focus({ preventScroll: true });
  briefFormat.scrollIntoView({ block: "center" });
});

function clearResult() {
  result.hidden = true;
  status.textContent = "";
}
brief.addEventListener("input", clearResult);
brief.addEventListener("change", clearResult);
brief.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(brief);
  const details = data.get("details").trim();
  if (!details) {
    brief.elements.details.setCustomValidity("Добавь пару слов о событии.");
    brief.elements.details.reportValidity();
    return;
  }
  const date = data.get("date").trim();
  const city = data.get("city").trim();
  briefText.value = [
    "Бриф на событие",
    `Формат: ${data.get("format")}`,
    ...(date ? [`Дата или период: ${date}`] : []),
    ...(city ? [`Город: ${city}`] : []),
    "",
    details
  ].join("\n");
  result.hidden = false;
  briefText.focus();
});
brief.elements.details.addEventListener("input", () => brief.elements.details.setCustomValidity(""));

document.querySelector("#copy-brief").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(briefText.value);
    status.textContent = "Бриф скопирован.";
  } catch {
    briefText.select();
    status.textContent = "Текст выделен. Скопируй его или скачай файл.";
  }
});

document.querySelector("#download-brief").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([briefText.value], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "event-brief.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
