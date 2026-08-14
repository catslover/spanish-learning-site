const form = document.querySelector("#entryForm");
const output = document.querySelector("#jsonOutput");
const folderOutput = document.querySelector("#folderOutput");
const adminAudioManifestCount = document.querySelector("#adminAudioManifestCount");
const adminAudioMissingCount = document.querySelector("#adminAudioMissingCount");
const adminAudioRecheckCount = document.querySelector("#adminAudioRecheckCount");
const adminAudioSummary = document.querySelector("#adminAudioSummary");
const currentScheduleSelect = document.querySelector("#currentScheduleSelect");
const currentLabelInput = document.querySelector("#currentLabelInput");
const currentConfigOutput = document.querySelector("#currentConfigOutput");
const currentConfigStatus = document.querySelector("#currentConfigStatus");
const saveCurrentConfig = document.querySelector("#saveCurrentConfig");
const downloadCurrentConfig = document.querySelector("#downloadCurrentConfig");

let currentSiteConfig = {
  programTitle: "Homeschool Spanish Academy High School Level 1",
  currentScheduleNumber: 1,
  currentLabel: "Current Week"
};
let currentCurriculum = { items: [] };

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseWords(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [spanish, english] = line.split("=").map((part) => part?.trim());
      return {
        spanish: spanish || line,
        english: english || ""
      };
    });
}

function updateFolderPreview() {
  const audienceId = form.audience.value === "parent" ? "parent" : "all-kids";
  const scheduleNumber = String(form.scheduleNumber.value || "1").padStart(2, "0");
  folderOutput.textContent = `materials/${audienceId}/curriculum-${scheduleNumber}/`;
}

form.addEventListener("input", updateFolderPreview);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const audience = form.audience.value === "parent" ? "parent" : "student";
  const childId = audience === "parent" ? "parent" : "all-kids";
  const scheduleNumber = Number(form.scheduleNumber.value);
  const scheduleFolder = `curriculum-${String(scheduleNumber).padStart(2, "0")}`;
  const fileName = form.fileName.value.trim();
  const entry = {
    id: `${childId}-${scheduleFolder}-${slugify(form.materialType.value)}-${slugify(fileName.replace(/\.[^.]+$/, ""))}`,
    childId,
    audience,
    scheduleNumber,
    week: form.weekLabel.value.trim(),
    topic: form.topic.value.trim(),
    type: form.materialType.value,
    title: fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
    note: form.note.value.trim(),
    file: `materials/${childId}/${scheduleFolder}/${fileName}`,
    words: parseWords(form.words.value)
  };

  output.textContent = `${JSON.stringify(entry, null, 2)},`;
  updateFolderPreview();
});

updateFolderPreview();

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function buildCurrentConfig() {
  return {
    ...currentSiteConfig,
    currentScheduleNumber: Number(currentScheduleSelect.value || currentSiteConfig.currentScheduleNumber || 1),
    currentLabel: currentLabelInput.value.trim() || "Current Week"
  };
}

function renderCurrentConfig() {
  const config = buildCurrentConfig();
  const item = currentCurriculum.items.find((entry) => entry.number === config.currentScheduleNumber);
  currentConfigOutput.textContent = `${JSON.stringify(config, null, 2)}\n`;
  currentConfigStatus.textContent = item
    ? `Official current will be ${config.currentLabel}: HSA High School Lv1 Lesson #${padNumber(item.number)} · ${item.title}. Save this as data/site-config.json.`
    : "Choose an HSA item to update the official current-week config.";
}

function downloadConfigFile(config = buildCurrentConfig()) {
  const blob = new Blob([`${JSON.stringify(config, null, 2)}\n`], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "site-config.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

async function saveConfigFile() {
  const config = buildCurrentConfig();
  if (!window.showSaveFilePicker) {
    downloadConfigFile(config);
    currentConfigStatus.textContent = "Direct save is not available in this browser. A site-config.json backup was downloaded instead.";
    return;
  }
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: "site-config.json",
      types: [{
        description: "Site config JSON",
        accept: { "application/json": [".json"] }
      }]
    });
    const writable = await handle.createWritable();
    await writable.write(`${JSON.stringify(config, null, 2)}\n`);
    await writable.close();
    currentSiteConfig = config;
    currentConfigStatus.textContent = "Saved. Choose the repository file data/site-config.json when the browser asks where to save.";
  } catch (error) {
    if (error?.name === "AbortError") {
      currentConfigStatus.textContent = "Save canceled. No file was changed.";
      return;
    }
    downloadConfigFile(config);
    currentConfigStatus.textContent = "Direct save failed. A site-config.json backup was downloaded instead.";
    console.error(error);
  }
}

async function loadCurrentConfigEditor() {
  if (!currentScheduleSelect) return;
  try {
    const [configResponse, curriculumResponse] = await Promise.all([
      fetch("data/site-config.json"),
      fetch("data/curriculum.json")
    ]);
    if (!configResponse.ok) throw new Error("Site config unavailable.");
    if (!curriculumResponse.ok) throw new Error("Curriculum unavailable.");
    currentSiteConfig = await configResponse.json();
    currentCurriculum = await curriculumResponse.json();
    currentScheduleSelect.innerHTML = currentCurriculum.items.map((item) => {
      return `<option value="${item.number}">#${padNumber(item.number)} · ${item.type} · ${item.title}</option>`;
    }).join("");
    currentScheduleSelect.value = String(currentSiteConfig.currentScheduleNumber || 1);
    currentLabelInput.value = currentSiteConfig.currentLabel || "Current Week";
    renderCurrentConfig();
  } catch (error) {
    currentConfigStatus.textContent = "Current-week settings could not be loaded.";
    currentConfigOutput.textContent = "Check that data/site-config.json and data/curriculum.json are available.";
    console.error(error);
  }
}

currentScheduleSelect?.addEventListener("change", renderCurrentConfig);
currentLabelInput?.addEventListener("input", renderCurrentConfig);
saveCurrentConfig?.addEventListener("click", saveConfigFile);
downloadCurrentConfig?.addEventListener("click", () => downloadConfigFile());

loadCurrentConfigEditor();

async function loadAdminAudioStatus() {
  if (!adminAudioSummary) return;
  try {
    const [manifestResponse, qaResponse, recheckResponse] = await Promise.all([
      fetch("data/audio-manifest.json"),
      fetch("data/media-qa/u1-1-audio-qa-report.json"),
      fetch("data/media-qa/u1-1-audio-recheck-rollup.json")
    ]);
    if (!manifestResponse.ok) throw new Error("Audio manifest unavailable.");
    const manifest = await manifestResponse.json();
    const qa = qaResponse.ok ? await qaResponse.json() : null;
    const recheck = recheckResponse.ok ? await recheckResponse.json() : null;
    const missing = qa?.summary?.missingFiles ?? "-";
    const recheckCount = recheck?.summary?.totalRecheckItems ?? 0;
    adminAudioManifestCount.textContent = manifest.items?.length ?? "-";
    adminAudioMissingCount.textContent = missing;
    adminAudioRecheckCount.textContent = recheckCount;
    adminAudioSummary.textContent = qa?.summary
      ? `Last machine check: ${qa.summary.itemsChecked} clips checked, ${qa.summary.durationWarnings} duration warnings, ${qa.summary.transcriptionWarnings} transcription warnings.`
      : "Machine report is not available yet; use the review tool for browser checks.";
  } catch (error) {
    adminAudioSummary.textContent = "Audio review metadata could not be loaded. Open the review tool to check clips in the browser.";
    console.error(error);
  }
}

loadAdminAudioStatus();
