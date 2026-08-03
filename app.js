const state = {
  data: { children: [], materials: [] },
  filters: {
    child: "all",
    week: "all",
    topic: "all",
    type: "all"
  }
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

const typeLabels = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  homework: "Homework",
  practice: "Supplemental practice"
};

async function loadMaterials() {
  try {
    const response = await fetch("data/materials.json");
    if (!response.ok) throw new Error("Unable to load materials.");
    state.data = await response.json();
    populateFilters();
    render();
  } catch (error) {
    materialsGrid.innerHTML = "";
    emptyState.hidden = false;
    emptyState.textContent = "The materials list could not be loaded.";
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
  renderFlashcards(materials);
}

function renderMaterial(item) {
  const typeLabel = typeLabels[item.type] || item.type;
  return `
    <article class="material-card">
      <div class="material-meta">
        <span class="tag">${getChildName(item.childId)}</span>
        <span class="tag">${item.week}</span>
        <span class="tag">${typeLabel}</span>
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
    : '<p class="empty">Choose a vocabulary or practice week to see flashcards.</p>';
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

loadMaterials();
