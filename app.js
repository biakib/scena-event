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
}

function renderFormats(group) {
  const matching = formats.filter((format) => group === "all" || format.group === group);
  if (revealOnScroll) {
    [...list.querySelectorAll(".format-img")].forEach((image) => revealOnScroll.unobserve(image));
  }
  list.replaceChildren(...matching.map((format, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "format-card";
    card.dataset.visual = format.image;
    if (index === 0) card.classList.add("featured");
    if (group === "all" && index > 0) card.classList.add("gallery-card");
    card.setAttribute("aria-haspopup", "dialog");
    card.innerHTML = `<span class="format-img"><img src="assets/${format.image}.webp" alt="" loading="lazy"></span>
      <span class="format-info">
        <span class="format-name">${format.title}</span>
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
