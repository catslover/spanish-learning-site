const state = {
  data: { children: [], materials: [] },
  curriculum: { items: [] },
  reports: { reports: [] },
  config: { currentScheduleNumber: 1, currentLabel: "Current Week" },
  officialCurrentScheduleNumber: 1,
  previewCurrentScheduleNumber: null,
  filters: {
    child: "student",
    week: "all",
    topic: "all",
    type: "all"
  },
  profiles: {},
  activeProfileId: "victor"
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
const reportGrid = document.querySelector("#reportGrid");
const reportCount = document.querySelector("#reportCount");
const profileToggle = document.querySelector("#profileToggle");
const profilePanel = document.querySelector("#profilePanel");
const profileInitial = document.querySelector("#profileInitial");
const profileName = document.querySelector("#profileName");
const profileContext = document.querySelector("#profileContext");
const resetProfile = document.querySelector("#resetProfile");
const audienceFilterGroup = document.querySelector("#audienceFilterGroup");
const profilesKey = "spanishHub.profiles.v1";
const activeProfileKey = "spanishHub.activeProfileId.v1";
const currentPreviewKey = "spanishHub.currentPreview.v1";
const legacyProfileKey = "spanishHub.profile.v1";
const legacyProgressKeys = ["clairesSpanishHub.progress.v1", "spanishHub.progress.v1"];

const profileSeeds = [
  { profileId: "victor", role: "learner", learnerId: "victor", displayName: "Victor", viewMode: "learner" },
  { profileId: "spencer", role: "learner", learnerId: "spencer", displayName: "Spencer", viewMode: "learner" },
  { profileId: "parent", role: "parent", learnerId: null, displayName: "Parent", viewMode: "parent" }
];

const typeLabels = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  homework: "Homework",
  practice: "Supplemental practice"
};

function formatHsaLabel(scheduleNumber) {
  return `HSA High School Lv1 Lesson #${padNumber(scheduleNumber)}`;
}

function getMaterialAudience(item) {
  return item.audience || (item.childId === "parent" ? "parent" : "student");
}

function getAudienceName(item) {
  return getMaterialAudience(item) === "parent" ? "Parent" : "Student";
}

function createDefaultProfile(seed) {
  return {
    profileId: seed.profileId,
    role: seed.role,
    learnerId: seed.learnerId,
    displayName: seed.displayName,
    viewMode: seed.viewMode,
    themeDensity: "comfortable",
    progress: {
      doneScheduleNumbers: [],
      lessonProgress: {}
    },
    audioPreferences: {
      speed: 1,
      autoplay: false
    },
    updatedAt: new Date().toISOString(),
    syncMode: "local"
  };
}

function createDefaultProfiles() {
  return Object.fromEntries(profileSeeds.map((seed) => [seed.profileId, createDefaultProfile(seed)]));
}

function normalizeProfile(profile, fallback) {
  const progress = profile?.progress || {};
  return {
    ...fallback,
    ...profile,
    progress: {
      doneScheduleNumbers: Array.isArray(progress.doneScheduleNumbers)
        ? progress.doneScheduleNumbers.map(Number).filter(Number.isFinite)
        : [],
      lessonProgress: progress.lessonProgress && typeof progress.lessonProgress === "object" ? progress.lessonProgress : {}
    },
    audioPreferences: {
      ...fallback.audioPreferences,
      ...(profile?.audioPreferences || {})
    },
    syncMode: "local"
  };
}

function loadProfiles() {
  const defaults = createDefaultProfiles();
  let savedProfiles = {};

  try {
    const parsed = JSON.parse(localStorage.getItem(profilesKey));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      savedProfiles = parsed;
    }
  } catch {
    savedProfiles = {};
  }

  state.profiles = Object.fromEntries(
    profileSeeds.map((seed) => {
      const fallback = defaults[seed.profileId];
      return [seed.profileId, normalizeProfile(savedProfiles[seed.profileId], fallback)];
    })
  );

  migrateLegacyProgress(savedProfiles);
  state.activeProfileId = getSavedActiveProfileId();
  saveProfiles();
}

function getSavedActiveProfileId() {
  const explicitActive = localStorage.getItem(activeProfileKey);
  if (state.profiles[explicitActive]) return explicitActive;

  try {
    const legacyProfile = JSON.parse(localStorage.getItem(legacyProfileKey));
    if (state.profiles[legacyProfile?.profileId]) return legacyProfile.profileId;
  } catch {
    const legacyProfileId = localStorage.getItem(legacyProfileKey);
    if (state.profiles[legacyProfileId]) return legacyProfileId;
  }

  return "victor";
}

function migrateLegacyProgress(savedProfiles) {
  const alreadyHasProfiles = Object.keys(savedProfiles || {}).length > 0;
  if (alreadyHasProfiles) return;

  const legacyDone = legacyProgressKeys.flatMap((key) => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      return Array.isArray(saved?.done) ? saved.done.map(Number) : [];
    } catch {
      return [];
    }
  });

  const doneScheduleNumbers = [...new Set(legacyDone.filter(Number.isFinite))].sort((a, b) => a - b);
  if (!doneScheduleNumbers.length) return;

  ["victor", "spencer"].forEach((profileId) => {
    state.profiles[profileId].progress.doneScheduleNumbers = [...doneScheduleNumbers];
    state.profiles[profileId].updatedAt = new Date().toISOString();
  });
}

function saveProfiles() {
  localStorage.setItem(profilesKey, JSON.stringify(state.profiles));
  localStorage.setItem(activeProfileKey, state.activeProfileId);
}

function getActiveProfile() {
  return state.profiles[state.activeProfileId] || state.profiles.victor || createDefaultProfile(profileSeeds[0]);
}

function getDoneScheduleNumbers() {
  return getActiveProfile().progress.doneScheduleNumbers || [];
}

function updateActiveProfile(updater) {
  const profile = getActiveProfile();
  updater(profile);
  profile.updatedAt = new Date().toISOString();
  state.profiles[profile.profileId] = profile;
  saveProfiles();
}

async function loadSite() {
  try {
    const [materialsResponse, curriculumResponse, configResponse, reportsResponse] = await Promise.all([
      fetch("data/materials.json"),
      fetch("data/curriculum.json"),
      fetch("data/site-config.json"),
      fetch("data/report-cards.json")
    ]);

    if (!materialsResponse.ok) throw new Error("Unable to load materials.");
    if (!curriculumResponse.ok) throw new Error("Unable to load curriculum.");
    if (!configResponse.ok) throw new Error("Unable to load site settings.");
    if (!reportsResponse.ok) throw new Error("Unable to load report cards.");

    state.data = await materialsResponse.json();
    state.curriculum = await curriculumResponse.json();
    state.config = await configResponse.json();
    state.officialCurrentScheduleNumber = Number(state.config.currentScheduleNumber) || 1;
    state.previewCurrentScheduleNumber = loadCurrentPreview();
    state.reports = await reportsResponse.json();
    loadProfiles();
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
  const existingAudienceOptions = [...childFilter.options].map((option) => option.value);
  uniqueValues(state.data.materials.map(getMaterialAudience))
    .filter((audience) => !existingAudienceOptions.includes(audience))
    .forEach((audience) => {
      childFilter.append(new Option(audience === "parent" ? "Parent materials" : "Student materials", audience));
    });

  uniqueValues(state.data.materials.map((item) => String(item.scheduleNumber))).forEach((scheduleNumber) => {
    weekFilter.append(new Option(formatHsaLabel(scheduleNumber), String(scheduleNumber)));
  });

  uniqueValues(state.data.materials.map((item) => item.topic)).forEach((topic) => {
    topicFilter.append(new Option(topic, topic));
  });
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function getCurrentScheduleItem() {
  return state.curriculum.items.find((item) => item.number === getDisplayedCurrentScheduleNumber());
}

function getDisplayedCurrentScheduleNumber() {
  const profile = getActiveProfile();
  if (profile.viewMode === "parent" && Number.isFinite(state.previewCurrentScheduleNumber)) {
    return state.previewCurrentScheduleNumber;
  }
  return state.officialCurrentScheduleNumber;
}

function isCurrentPreviewActive() {
  return getActiveProfile().viewMode === "parent"
    && Number.isFinite(state.previewCurrentScheduleNumber)
    && state.previewCurrentScheduleNumber !== state.officialCurrentScheduleNumber;
}

function getMaterialById(materialId) {
  return state.data.materials.find((item) => item.id === materialId);
}

function getMaterialsForScheduleNumber(scheduleNumber) {
  return state.data.materials.filter((item) => item.scheduleNumber === scheduleNumber);
}

function loadCurrentPreview() {
  const saved = Number(localStorage.getItem(currentPreviewKey));
  return Number.isFinite(saved) && saved >= 1 ? saved : null;
}

function setCurrentPreview(scheduleNumber) {
  const number = Number(scheduleNumber);
  if (!Number.isFinite(number)) return;
  state.previewCurrentScheduleNumber = number;
  localStorage.setItem(currentPreviewKey, String(number));
  render();
}

function clearCurrentPreview() {
  state.previewCurrentScheduleNumber = null;
  localStorage.removeItem(currentPreviewKey);
  render();
}

window.setCurrentClass = setCurrentPreview;

function getFilteredMaterials() {
  const activeProfile = getActiveProfile();
  const audienceFilter = activeProfile.viewMode === "parent" ? state.filters.child : "student";
  return state.data.materials.filter((item) => {
    const itemAudience = getMaterialAudience(item);
    return (
      (audienceFilter === "all" || itemAudience === audienceFilter) &&
      (state.filters.week === "all" || item.scheduleNumber === Number(state.filters.week)) &&
      (state.filters.topic === "all" || item.topic === state.filters.topic) &&
      (state.filters.type === "all" || item.type === state.filters.type)
    );
  });
}

function renderProfile() {
  const profile = getActiveProfile();
  document.body.dataset.profile = profile.profileId;
  document.body.dataset.viewMode = profile.viewMode;
  document.body.dataset.density = profile.themeDensity;
  document.querySelectorAll("[data-parent-only]").forEach((item) => {
    item.hidden = profile.viewMode !== "parent";
  });
  audienceFilterGroup.hidden = profile.viewMode !== "parent";
  if (profile.viewMode !== "parent") {
    state.filters.child = "student";
    childFilter.value = "student";
  }

  profileInitial.textContent = profile.displayName.charAt(0);
  profileName.textContent = profile.displayName;
  profileContext.textContent = `${profile.displayName}'s progress is saved on this device.`;

  document.querySelectorAll("[data-profile-id]").forEach((button) => {
    const isSelected = button.dataset.profileId === profile.profileId;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  document.querySelectorAll("[data-view-mode]").forEach((button) => {
    const isSelected = button.dataset.viewMode === profile.viewMode;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  document.querySelectorAll("[data-density]").forEach((button) => {
    const isSelected = button.dataset.density === profile.themeDensity;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function render() {
  renderProfile();
  const materials = getFilteredMaterials();
  resultCount.textContent = `${materials.length} ${materials.length === 1 ? "file" : "files"}`;
  emptyState.hidden = materials.length > 0;
  materialsGrid.innerHTML = materials.map(renderMaterial).join("");
  renderCurrentWeek();
  renderSchedule();
  renderReports();
  renderFlashcards(materials);
}

function renderCurrentWeek() {
  const currentItem = getCurrentScheduleItem();
  const profile = getActiveProfile();
  const isParentView = profile.viewMode === "parent";
  const isPreview = isCurrentPreviewActive();
  if (!currentItem) {
    currentTitle.textContent = "Current week not set";
    currentBadge.textContent = "Check settings";
    currentPanel.innerHTML = '<p class="empty">Update <code>data/site-config.json</code> with a curriculum number from 1 to 30.</p>';
    return;
  }

  const materials = getMaterialsForScheduleNumber(currentItem.number);
  const isDone = getDoneScheduleNumbers().includes(currentItem.number);
  const nextItem = getNextOpenItem(currentItem.number);
  currentTitle.textContent = currentItem.title;
  currentBadge.textContent = `${isPreview ? "Parent Preview" : state.config.currentLabel || "Official Current"} · ${formatHsaLabel(currentItem.number)}${isDone ? " · Done" : ""}`;
  currentPanel.innerHTML = `
    <div>
      <div class="material-meta">
        <span class="tag">${escapeHtml(currentItem.type)}</span>
        <span class="tag">${formatHsaLabel(currentItem.number)}</span>
        ${isPreview ? '<span class="tag warning-tag">Local Preview</span>' : '<span class="tag current-tag">Official</span>'}
        ${isDone ? '<span class="tag done-tag">Done</span>' : '<span class="tag">Open</span>'}
      </div>
      <p>${escapeHtml(currentItem.description)}</p>
      ${isParentView ? renderCurrentSourceNote(isPreview) : ""}
    </div>
    <div class="current-actions">
      ${currentItem.lessonUrl ? `<a class="button primary" href="${encodeURI(currentItem.lessonUrl)}">${escapeHtml(currentItem.lessonLabel || "Open Website Lesson")}</a>` : ""}
      ${currentItem.flashcardsUrl ? `<a class="button secondary" href="${encodeURI(currentItem.flashcardsUrl)}">Review Flashcards</a>` : ""}
      ${materials.length ? materials.map(renderCompactDownload).join("") : '<span class="tag">No download for this item yet</span>'}
      <button class="button secondary" type="button" data-mark-current="${currentItem.number}">${isDone ? "Mark Not Done" : "Mark Done"}</button>
      ${isParentView && nextItem ? `<button class="button secondary" type="button" data-preview-next="${nextItem.number}">Preview Next HSA Item</button>` : ""}
      ${isPreview ? '<button class="button secondary" type="button" data-clear-preview>Return To Official Current</button>' : ""}
      <button class="button secondary" type="button" data-filter-current="${currentItem.number}">Show This Week</button>
    </div>
  `;

  currentPanel.querySelector("[data-mark-current]")?.addEventListener("click", () => {
    toggleDone(currentItem.number);
  });

  currentPanel.querySelector("[data-preview-next]")?.addEventListener("click", () => {
    setCurrentPreview(nextItem.number);
    document.querySelector("#current").scrollIntoView({ behavior: "smooth" });
  });

  currentPanel.querySelector("[data-clear-preview]")?.addEventListener("click", () => {
    clearCurrentPreview();
    document.querySelector("#current").scrollIntoView({ behavior: "smooth" });
  });

  currentPanel.querySelector("[data-filter-current]")?.addEventListener("click", () => {
    const material = materials[0];
    if (!material) return;
    state.filters.week = String(material.scheduleNumber);
    weekFilter.value = String(material.scheduleNumber);
    render();
    document.querySelector("#materials").scrollIntoView({ behavior: "smooth" });
  });
}

function renderCurrentSourceNote(isPreview) {
  if (isPreview) {
    return `<p class="current-source-note">Preview only. Students still use ${formatHsaLabel(state.officialCurrentScheduleNumber)} until Parent Tools saves a new <code>data/site-config.json</code>.</p>`;
  }
  return `<p class="current-source-note">Official current item comes from <code>data/site-config.json</code>. Parent preview controls do not change the website file.</p>`;
}

function renderCompactDownload(item) {
  return `<a class="button primary" href="${encodeURI(item.file)}" download>Download ${escapeHtml(item.title)}</a>`;
}

function renderSchedule() {
  scheduleCount.textContent = `${state.curriculum.items.length} HSA items`;
  scheduleList.innerHTML = state.curriculum.items.map(renderScheduleItem).join("");
  scheduleList.querySelectorAll("[data-mark-done]").forEach((button) => {
    button.addEventListener("click", () => toggleDone(Number(button.dataset.markDone)));
  });
  scheduleList.querySelectorAll("[data-set-current]").forEach((button) => {
    button.addEventListener("click", () => {
      setCurrentPreview(Number(button.dataset.setCurrent));
      document.querySelector("#current").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function renderScheduleItem(item) {
  const material = item.materialId ? getMaterialById(item.materialId) : null;
  const displayedCurrentNumber = getDisplayedCurrentScheduleNumber();
  const isCurrent = item.number === displayedCurrentNumber;
  const isOfficialCurrent = item.number === state.officialCurrentScheduleNumber;
  const isParentView = getActiveProfile().viewMode === "parent";
  const isDone = getDoneScheduleNumbers().includes(item.number);
  const supplements = item.supplements || [];
  return `
    <article class="schedule-item ${isCurrent ? "is-current" : ""} ${isDone ? "is-done" : ""}">
      <div class="schedule-number">#${padNumber(item.number)}</div>
      <div class="schedule-type">${escapeHtml(item.type)}</div>
      <div>
        <div class="material-meta">
          ${isCurrent ? '<span class="tag current-tag">Current</span>' : ""}
          ${isOfficialCurrent ? '<span class="tag">Official</span>' : ""}
          ${isDone ? '<span class="tag done-tag">Done</span>' : ""}
          ${item.unit ? `<span class="tag">${escapeHtml(item.unit)}</span>` : ""}
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
        ${supplements.length ? renderSupplements(supplements) : ""}
      </div>
      <div class="schedule-action">
        ${item.lessonUrl ? `<a href="${encodeURI(item.lessonUrl)}">Lesson</a>` : material ? `<a href="${encodeURI(material.file)}" download>Download</a>` : '<span class="tag">No file</span>'}
        ${item.flashcardsUrl ? `<a href="${encodeURI(item.flashcardsUrl)}">Cards</a>` : ""}
        ${item.lessonUrl && material ? `<a href="${encodeURI(material.file)}" download>Packet</a>` : ""}
      </div>
      <div class="schedule-buttons">
        <button class="mini-button" type="button" data-mark-done="${item.number}">${isDone ? "Undo" : "Done"}</button>
        ${isParentView && !isCurrent ? `<button class="mini-button" type="button" data-set-current="${item.number}">Preview Today</button>` : ""}
      </div>
    </article>
  `;
}

function renderSupplements(supplements) {
  return `
    <div class="supplement-list" aria-label="Unit supplements">
      ${supplements.map(renderSupplement).join("")}
    </div>
  `;
}

function renderSupplement(supplement) {
  const statusClass = supplement.status === "Ready" ? "current-tag" : "";
  const label = `
    <span class="supplement-id">${escapeHtml(supplement.id.toUpperCase())}</span>
    <strong>${escapeHtml(supplement.title)}</strong>
    <em>${escapeHtml(supplement.status)}</em>
  `;
  return `
    <div class="supplement-item">
      <div>
        ${supplement.url ? `<a href="${encodeURI(supplement.url)}">${label}</a>` : label}
        <p>${escapeHtml(supplement.note || "")}</p>
      </div>
      <span class="tag ${statusClass}">${escapeHtml(supplement.status)}</span>
    </div>
  `;
}

function renderMaterial(item) {
  const typeLabel = typeLabels[item.type] || item.type;
  const isCurrent = item.scheduleNumber === getDisplayedCurrentScheduleNumber();
  return `
    <article class="material-card ${isCurrent ? "is-current" : ""}">
      <div class="material-meta">
        <span class="tag">${getAudienceName(item)}</span>
        <span class="tag">${formatHsaLabel(item.scheduleNumber)}</span>
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

function renderReports() {
  const reports = dedupeReports(state.reports.reports || []);
  reportCount.textContent = `${reports.length} ${reports.length === 1 ? "report" : "reports"}`;
  reportGrid.innerHTML = reports.map(renderReportCard).join("");
}

function dedupeReports(reports) {
  const byStudentAndLabel = new Map();
  reports.forEach((report) => {
    byStudentAndLabel.set(`${report.studentId}:${report.label}`, report);
  });
  const activeLearnerId = getActiveProfile().learnerId;
  return [...byStudentAndLabel.values()].sort((a, b) => {
    if (a.studentId === activeLearnerId && b.studentId !== activeLearnerId) return -1;
    if (b.studentId === activeLearnerId && a.studentId !== activeLearnerId) return 1;
    return a.studentName.localeCompare(b.studentName);
  });
}

function renderReportCard(report) {
  const isSelectedLearner = report.studentId === getActiveProfile().learnerId;
  return `
    <article class="report-card ${isSelectedLearner ? "is-active-profile" : ""}">
      <div class="report-card-head">
        <div>
          <p class="eyebrow">${escapeHtml(report.label)}</p>
          <h3>${escapeHtml(report.studentName)}</h3>
        </div>
        ${isSelectedLearner ? '<span class="tag current-tag">Selected Profile</span>' : ""}
        <a class="button primary" href="${encodeURI(report.file)}" download>Download PDF</a>
      </div>
      <div class="report-summary">
        <span><strong>Course</strong>${escapeHtml(report.grades.course)}</span>
        <span><strong>Homework</strong>${escapeHtml(report.grades.homework)}</span>
        <span><strong>Quiz</strong>${escapeHtml(report.grades.quiz)}</span>
        <span><strong>Exam</strong>${escapeHtml(report.grades.exam)}</span>
      </div>
      <p class="report-meta">Run ${formatDate(report.runDate)} · Covers ${formatDate(report.startDate)} to ${formatDate(report.endDate)} · ${report.lessonsCovered} lessons · ${escapeHtml(report.creditsEarned)}</p>
      ${renderReportTable("Homework", report.homework, ["date", "status", "grade", "title"])}
      ${renderReportTable("Quizzes", report.quizzes, ["date", "title", "grade"])}
      ${renderReportTable("Exams", report.exams, ["date", "title", "grade"])}
    </article>
  `;
}

function renderReportTable(title, rows, columns) {
  if (!rows?.length) {
    return `
      <section class="report-table">
        <h4>${escapeHtml(title)}</h4>
        <p class="empty compact">No ${escapeHtml(title.toLowerCase())} posted yet.</p>
      </section>
    `;
  }

  return `
    <section class="report-table">
      <h4>${escapeHtml(title)}</h4>
      <table>
        <thead>
          <tr>${columns.map((column) => `<th>${escapeHtml(titleCase(column))}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(formatReportValue(column, row[column]))}</td>`).join("")}</tr>`)
            .join("")}
        </tbody>
      </table>
    </section>
  `;
}

function formatReportValue(column, value) {
  if (column === "date") return formatDate(value);
  return value || "";
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
}

function renderFlashcards(materials) {
  const cards = materials.flatMap((item) => {
    return (item.words || []).map((word) => ({
      ...word,
      childId: item.childId,
      hsaLabel: formatHsaLabel(item.scheduleNumber)
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
      <p>${escapeHtml(getAudienceName(card))} · ${escapeHtml(card.hsaLabel)}</p>
    </article>
  `;
}

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function toggleDone(scheduleNumber) {
  const number = Number(scheduleNumber);
  updateActiveProfile((profile) => {
    const doneScheduleNumbers = profile.progress.doneScheduleNumbers || [];
    if (doneScheduleNumbers.includes(number)) {
      profile.progress.doneScheduleNumbers = doneScheduleNumbers.filter((item) => item !== number);
    } else {
      profile.progress.doneScheduleNumbers = [...new Set([...doneScheduleNumbers, number])].sort((a, b) => a - b);
    }
  });
  render();
}

function getNextOpenItem(afterNumber) {
  const doneScheduleNumbers = getDoneScheduleNumbers();
  return state.curriculum.items.find((item) => item.number > afterNumber && !doneScheduleNumbers.includes(item.number));
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
  const defaultAudience = getActiveProfile().viewMode === "parent" ? "all" : "student";
  state.filters = { child: defaultAudience, week: "all", topic: "all", type: "all" };
  childFilter.value = defaultAudience;
  weekFilter.value = "all";
  topicFilter.value = "all";
  typeFilter.value = "all";
  render();
});

profileToggle.addEventListener("click", () => {
  const shouldOpen = profilePanel.hidden;
  profilePanel.hidden = !shouldOpen;
  profileToggle.setAttribute("aria-expanded", String(shouldOpen));
});

document.querySelectorAll("[data-profile-id]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!state.profiles[button.dataset.profileId]) return;
    state.activeProfileId = button.dataset.profileId;
    saveProfiles();
    render();
  });
});

document.querySelectorAll("[data-view-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    updateActiveProfile((profile) => {
      profile.viewMode = button.dataset.viewMode;
    });
    render();
  });
});

document.querySelectorAll("[data-density]").forEach((button) => {
  button.addEventListener("click", () => {
    updateActiveProfile((profile) => {
      profile.themeDensity = button.dataset.density;
    });
    render();
  });
});

shuffleCards.addEventListener("click", () => {
  state.data.materials.forEach((item) => {
    if (item.words) item.words.sort(() => Math.random() - 0.5);
  });
  render();
});

resetProgress.addEventListener("click", () => {
  updateActiveProfile((profile) => {
    profile.progress.doneScheduleNumbers = [];
    profile.progress.lessonProgress = {};
  });
  render();
});

resetProfile.addEventListener("click", () => {
  const seed = profileSeeds.find((item) => item.profileId === state.activeProfileId) || profileSeeds[0];
  state.profiles[seed.profileId] = createDefaultProfile(seed);
  saveProfiles();
  render();
});

loadSite();
