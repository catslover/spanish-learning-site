const state = {
  data: { children: [], materials: [] },
  curriculum: { items: [] },
  config: { currentScheduleNumber: 1, currentLabel: "Current Week" },
  filters: {
    child: "all",
    week: "all",
    topic: "all",
    type: "all"
  },
  progress: { done: [] }
};

const childFilter = document.querySelector("#childFilter");
const weekFilter = document.querySelector("#weekFilter");
const topicFilter = document.querySelector("#topicFilter");
const typeFilter = document.querySelector("#typeFilter");
const resetFilters = document.querySelector("#resetFilters");
const materialsGrid = document.querySelector("#materialsGrid");
const resultCount = document.querySelector("#resultCount");
const emptyState = document.querySelector("#emptyState");
const flashcardDeck = document.querySelector("#flashcardDeck");
const shuffleCards = document.querySelector("#shuffleCards");
const currentTitle = document.querySelector("#currentTitle");
const currentBadge = document.querySelector("#currentBadge");
const currentPanel = document.querySelector("#currentPanel");
const scheduleList = document.querySelector("#scheduleList");
const scheduleCount = document.querySelector("#scheduleCount");
const resetProgress = document.querySelector("#resetProgress");
const progressKey = "clairesSpanishHub.progress.v1";

const typeLabels = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  homework: "Homework",
  practice: "Supplemental practice"
};

async function loadSite() {
  try {
    const [materialsResponse, curriculumResponse, configResponse] = await Promise.all([
      fetch("data/materials.json"),
      fetch("data/curriculum.json"),
      fetch("data/site-config.json")
    ]);

    if (!materialsResponse.ok) throw new Error("Unable to load materials.");
    if (!curriculumResponse.ok) throw new Error("Unable to load curriculum.");
    if (!configResponse.ok) throw new Error("Unable to load site settings.");

    state.data = await materialsResponse.json();
    state.curriculum = await curriculumResponse.json();
    state.config = await configResponse.json();
    state.progress = loadProgress();
    populateFilters();
    render();
  } catch (error) {
    materialsGrid.innerHTML = "";
    emptyState.hidden = false;
    emptyState.textContent = "The site data could not be loaded.";
    console.error(error);
  }
}

function populateFilters() {
  state.data.children.forEach((child) => {
    childFilter.append(new Option(child.name, child.id));
  });

  uniqueValues(state.data.materials.map((item) => item.week)).forEach((week) => {
    weekFilter.append(new Option(week, week));
  });

  uniqueValues(state.data.materials.map((item) => item.topic)).forEach((topic) => {
    topicFilter.append(new Option(topic, topic));
  });
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function getChildName(childId) {
  return state.data.children.find((child) => child.id === childId)?.name || childId;
}

function getCurrentScheduleItem() {
  return state.curriculum.items.find((item) => item.number === Number(state.config.currentScheduleNumber));
}

function getMaterialById(materialId) {
  return state.data.materials.find((item) => item.id === materialId);
}

function getMaterialsForScheduleNumber(scheduleNumber) {
  return state.data.materials.filter((item) => item.scheduleNumber === scheduleNumber);
}

function setCurrentClass(scheduleNumber) {
  state.config.currentScheduleNumber = Number(scheduleNumber);
  render();
}

window.setCurrentClass = setCurrentClass;

function getFilteredMaterials() {
  return state.data.materials.filter((item) => {
    return (
      (state.filters.child === "all" || item.childId === state.filters.child) &&
      (state.filters.week === "all" || item.week === state.filters.week) &&
      (state.filters.topic === "all" || item.topic === state.filters.topic) &&
      (state.filters.type === "all" || item.type === state.filters.type)
    );
  });
}

function render() {
  const materials = getFilteredMaterials();
  resultCount.textContent = `${materials.length} ${materials.length === 1 ? "file" : "files"}`;
  emptyState.hidden = materials.length > 0;
  materialsGrid.innerHTML = materials.map(renderMaterial).join("");
  renderCurrentWeek();
  renderSchedule();
  renderFlashcards(materials);
}

function renderCurrentWeek() {
  const currentItem = getCurrentScheduleItem();
  if (!currentItem) {
    currentTitle.textContent = "Current week not set";
    currentBadge.textContent = "Check settings";
    currentPanel.innerHTML = '<p class="empty">Update <code>data/site-config.json</code> with a curriculum number from 1 to 30.</p>';
    return;
  }

  const materials = getMaterialsForScheduleNumber(currentItem.number);
  const isDone = state.progress.done.includes(currentItem.number);
  const nextItem = getNextOpenItem(currentItem.number);
  currentTitle.textContent = currentItem.title;
  currentBadge.textContent = `${state.config.currentLabel || "Current"} · #${padNumber(currentItem.number)}${isDone ? " · Done" : ""}`;
  currentPanel.innerHTML = `
    <div>
      <div class="material-meta">
        <span class="tag">${escapeHtml(currentItem.type)}</span>
        <span class="tag">Curriculum #${padNumber(currentItem.number)}</span>
        ${isDone ? '<span class="tag done-tag">Done</span>' : '<span class="tag current-tag">Next</span>'}
      </div>
      <p>${escapeHtml(currentItem.description)}</p>
    </div>
    <div class="current-actions">
      ${materials.length ? materials.map(renderCompactDownload).join("") : '<span class="tag">No download for this item yet</span>'}
      <button class="button secondary" type="button" data-mark-current="${currentItem.number}">${isDone ? "Mark Not Done" : "Mark Done"}</button>
      ${nextItem ? `<button class="button secondary" type="button" data-go-next="${nextItem.number}">Go To Next</button>` : ""}
      <button class="button secondary" type="button" data-filter-current="${currentItem.number}">Show This Week</button>
    </div>
  `;

  currentPanel.querySelector("[data-mark-current]")?.addEventListener("click", () => {
    toggleDone(currentItem.number);
  });

  currentPanel.querySelector("[data-go-next]")?.addEventListener("click", () => {
    setCurrentClass(nextItem.number);
    document.querySelector("#current").scrollIntoView({ behavior: "smooth" });
  });

  currentPanel.querySelector("[data-filter-current]")?.addEventListener("click", () => {
    const material = materials[0];
    if (!material) return;
    state.filters.week = material.week;
    weekFilter.value = material.week;
    render();
    document.querySelector("#library").scrollIntoView({ behavior: "smooth" });
  });
}

function renderCompactDownload(item) {
  return `<a class="button primary" href="${encodeURI(item.file)}" download>Download ${escapeHtml(item.title)}</a>`;
}

function renderSchedule() {
  scheduleCount.textContent = `${state.curriculum.items.length} items`;
  scheduleList.innerHTML = state.curriculum.items.map(renderScheduleItem).join("");
  scheduleList.querySelectorAll("[data-mark-done]").forEach((button) => {
    button.addEventListener("click", () => toggleDone(Number(button.dataset.markDone)));
  });
  scheduleList.querySelectorAll("[data-set-current]").forEach((button) => {
    button.addEventListener("click", () => {
      setCurrentClass(Number(button.dataset.setCurrent));
      document.querySelector("#current").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function renderScheduleItem(item) {
  const material = item.materialId ? getMaterialById(item.materialId) : null;
  const isCurrent = item.number === Number(state.config.currentScheduleNumber);
  const isDone = state.progress.done.includes(item.number);
  return `
    <article class="schedule-item ${isCurrent ? "is-current" : ""} ${isDone ? "is-done" : ""}">
      <div class="schedule-number">#${padNumber(item.number)}</div>
      <div class="schedule-type">${escapeHtml(item.type)}</div>
      <div>
        <div class="material-meta">
          ${isCurrent ? '<span class="tag current-tag">Current</span>' : ""}
          ${isDone ? '<span class="tag done-tag">Done</span>' : ""}
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
      </div>
      <div class="schedule-action">
        ${material ? `<a href="${encodeURI(material.file)}" download>Download</a>` : '<span class="tag">No file</span>'}
      </div>
      <div class="schedule-buttons">
        <button class="mini-button" type="button" data-mark-done="${item.number}">${isDone ? "Undo" : "Done"}</button>
        ${isCurrent ? '<span class="tag current-tag">Next</span>' : `<button class="mini-button" type="button" data-set-current="${item.number}">Next</button>`}
      </div>
    </article>
  `;
}

function renderMaterial(item) {
  const typeLabel = typeLabels[item.type] || item.type;
  const isCurrent = item.scheduleNumber === Number(state.config.currentScheduleNumber);
  return `
    <article class="material-card ${isCurrent ? "is-current" : ""}">
      <div class="material-meta">
        <span class="tag">${getChildName(item.childId)}</span>
        <span class="tag">${item.week}</span>
        <span class="tag">${typeLabel}</span>
        ${isCurrent ? '<span class="tag current-tag">Current</span>' : ""}
      </div>
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.topic)}</p>
      </div>
      <p>${escapeHtml(item.note)}</p>
      <div class="download-row">
        <a href="${encodeURI(item.file)}" download>Download</a>
        <span class="tag">${item.file.split(".").pop().toUpperCase()}</span>
      </div>
    </article>
  `;
}

function renderFlashcards(materials) {
  const cards = materials.flatMap((item) => {
    return (item.words || []).map((word) => ({
      ...word,
      childId: item.childId,
      week: item.week
    }));
  });

  flashcardDeck.innerHTML = cards.length
    ? cards.map(renderFlashcard).join("")
    : '<p class="empty">Choose a vocabulary or practice item to see flashcards.</p>';
}

function renderFlashcard(card) {
  return `
    <article class="flashcard">
      <span class="spanish-word">${escapeHtml(card.spanish)}</span>
      <span class="english-word">${escapeHtml(card.english)}</span>
      <p>${escapeHtml(getChildName(card.childId))} · ${escapeHtml(card.week)}</p>
    </article>
  `;
}

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey));
    return {
      done: Array.isArray(saved?.done) ? saved.done.map(Number) : []
    };
  } catch {
    return { done: [] };
  }
}

function saveProgress() {
  localStorage.setItem(progressKey, JSON.stringify(state.progress));
}

function toggleDone(scheduleNumber) {
  const number = Number(scheduleNumber);
  if (state.progress.done.includes(number)) {
    state.progress.done = state.progress.done.filter((item) => item !== number);
  } else {
    state.progress.done = [...new Set([...state.progress.done, number])].sort((a, b) => a - b);
  }
  saveProgress();
  render();
}

function getNextOpenItem(afterNumber) {
  return state.curriculum.items.find((item) => item.number > afterNumber && !state.progress.done.includes(item.number));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

[childFilter, weekFilter, topicFilter, typeFilter].forEach((filter) => {
  filter.addEventListener("change", (event) => {
    const key = event.target.id.replace("Filter", "");
    state.filters[key] = event.target.value;
    render();
  });
});

resetFilters.addEventListener("click", () => {
  state.filters = { child: "all", week: "all", topic: "all", type: "all" };
  childFilter.value = "all";
  weekFilter.value = "all";
  topicFilter.value = "all";
  typeFilter.value = "all";
  render();
});

shuffleCards.addEventListener("click", () => {
  state.data.materials.forEach((item) => {
    if (item.words) item.words.sort(() => Math.random() - 0.5);
  });
  render();
});

resetProgress.addEventListener("click", () => {
  state.progress = { done: [] };
  saveProgress();
  render();
});

loadSite();
