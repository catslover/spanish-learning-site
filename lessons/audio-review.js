const reviewStoreKey = "u1-1-audio-review-v1";
const problemStatuses = new Set(["wrong_text", "wrong_pronunciation", "wrong_placement", "replace_voice"]);
const statusLabels = {
  unchecked: "Unchecked",
  correct: "Correct",
  wrong_text: "Wrong text",
  wrong_pronunciation: "Wrong pronunciation",
  wrong_placement: "Wrong placement",
  replace_voice: "Replace voice"
};
const persistEndpoint = "http://127.0.0.1:4175/api/audio-review/submission";

let manifest = null;
let reviewItems = [];
let reviewState = {};

const listEl = document.querySelector("#audioReviewList");
const searchEl = document.querySelector("#audioSearch");
const groupFilter = document.querySelector("#groupFilter");
const statusFilter = document.querySelector("#statusFilter");
const machineFilter = document.querySelector("#machineFilter");
const priorityFilter = document.querySelector("#priorityFilter");
const reviewMeta = document.querySelector("#reviewMeta");
const machineSummary = document.querySelector("#machineSummary");
const saveSummary = document.querySelector("#saveSummary");
const submissionSummary = document.querySelector("#submissionSummary");
const fileSaveSummary = document.querySelector("#fileSaveSummary");
const dataSourceSummary = document.querySelector("#dataSourceSummary");
const audioReviewEmpty = document.querySelector("#audioReviewEmpty");
const resetFilters = document.querySelector("#resetFilters");
const resetFiltersEmpty = document.querySelector("#resetFiltersEmpty");
const statusJumpButtons = document.querySelectorAll("[data-status-jump]");
let qaReport = null;
let recheckRollup = null;
let persistedSubmission = null;
let browserChecks = {};
let hasUnsavedChanges = false;
let lastPersistedAt = null;

function setFileSaveSummary(message) {
  if (fileSaveSummary) fileSaveSummary.textContent = message;
}

function markUnsaved(message = "Unsaved changes in this page. Use Save Review Status to persist them.") {
  hasUnsavedChanges = true;
  setFileSaveSummary(message);
}

function countStatuses(sourceItems = reviewItems, sourceReviewFor = reviewFor) {
  return sourceItems.reduce((counts, item) => {
    const status = sourceReviewFor(item).status || "unchecked";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
}

function countFromStatusCounts(statusCounts = {}, total = reviewItems.length) {
  const correct = statusCounts.correct || 0;
  const needWork = Object.entries(statusCounts)
    .filter(([status]) => problemStatuses.has(status))
    .reduce((sum, [, count]) => sum + count, 0);
  const unchecked = statusCounts.unchecked ?? Math.max(0, total - correct - needWork);
  return { correct, needWork, unchecked };
}

function currentStatusSummary() {
  const counts = countStatuses();
  const { correct, needWork, unchecked } = countFromStatusCounts(counts);
  return { counts, correct, needWork, unchecked };
}

function updateDataSourceSummary() {
  if (!dataSourceSummary || !manifest) return;
  dataSourceSummary.textContent = `${manifest.items.length} manifest placements, ${reviewItems.length} unique checks, ${persistedSubmission?.items?.length || 0} persisted saved statuses.`;
}

function reviewFor(item) {
  return reviewState[item.reviewId] || reviewState[item.id] || { status: "unchecked", notes: "" };
}

function qaFor(item) {
  return qaReport?.items?.find((reportItem) => reportItem.id === item.primaryId || reportItem.id === item.id) || null;
}

function hasMachineFlag(item) {
  const qa = qaFor(item);
  return Boolean(qa?.flags?.length);
}

function recheckFor(item) {
  return recheckRollup?.items?.find((recheck) => normalizeReviewText(recheck.expectedText) === item.reviewId) || null;
}

function needsRecheck(item) {
  return Boolean(recheckFor(item));
}

function audioUrl(file) {
  return `../${file}`;
}

function vowelAidFor(item) {
  const vowelAids = {
    a: {
      target: "Open ah, like the a in father.",
      avoid: "Do not let it become the English letter name ay.",
      compareText: "casa",
      compareFile: "media/u1-1-pronunciation/vowel-words/casa.m4a"
    },
    e: {
      target: "Short clear eh, close to the e in met.",
      avoid: "Do not let it become ee or the English letter name ay.",
      compareText: "mesa",
      compareFile: "media/u1-1-pronunciation/vowel-words/mesa.m4a"
    },
    i: {
      target: "Clean ee, like see.",
      avoid: "Do not let it become the English letter name eye.",
      compareText: "sí",
      compareFile: "media/u1-1-pronunciation/vowel-words/si.m4a"
    },
    o: {
      target: "Round steady oh, with no English-style w ending.",
      avoid: "Do not let it become ow.",
      compareText: "dos",
      compareFile: "media/u1-1-pronunciation/vowel-words/dos.m4a"
    },
    u: {
      target: "Rounded oo, like food.",
      avoid: "Do not let it become the English word you.",
      compareText: "tú",
      compareFile: "media/u1-1-pronunciation/vowel-words/tu.m4a"
    }
  };
  return vowelAids[item.reviewId] || null;
}

function recheckGuidanceFor(item, recheck) {
  const guidance = {
    a: "This live review item now uses the regenerated vowel file. Compare it with casa before marking correct.",
    e: "This live review item now uses the regenerated vowel file. Compare it with mesa before marking correct.",
    i: "This live review item now uses the regenerated vowel file. Compare it with sí before marking correct.",
    o: "This live review item now uses the regenerated vowel file. Compare it with dos before marking correct.",
    u: "This live review item now uses the regenerated vowel file. Compare it with tú before marking correct.",
    nino: "niño should sound like NEE-nyo. The ñ is one smooth ny sound, not a plain n.",
    jose: "José should sound like ho-SEH in Latin American Spanish. The J is a breathy h sound, not an English j.",
    que: "que should sound like keh. In que and qui, the u is silent, so it should not sound like kway."
  };
  return guidance[item.reviewId] || recheck?.reason || "This item was rolled up for a focused human recheck.";
}

function normalizeReviewText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[¿?¡!.,;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function filteredItems() {
  if (!manifest) return [];
  const query = searchEl.value.trim().toLowerCase();
  return reviewItems.filter((item) => {
    const review = reviewFor(item);
    const statusMatch = statusFilter.value === "all"
      || statusFilter.value === review.status
      || (statusFilter.value === "problem" && problemStatuses.has(review.status));
    const groupMatch = groupFilter.value === "all" || item.groups.includes(groupFilter.value);
    const machineMatch = machineFilter.value === "all"
      || (machineFilter.value === "flagged" && hasMachineFlag(item))
      || (machineFilter.value === "clear" && !hasMachineFlag(item));
    const priorityMatch = priorityFilter.value === "all"
      || priorityFilter.value === item.reviewPriority
      || (priorityFilter.value === "recheck" && needsRecheck(item));
    const placementText = item.placements.map((placement) => `${placement.group} ${placement.placement} ${placement.source}`).join(" ");
    const queryHaystack = `${item.expectedText} ${item.displayText || ""} ${item.expectedEnglish || ""} ${item.file} ${placementText}`.toLowerCase();
    return statusMatch && groupMatch && machineMatch && priorityMatch && (!query || queryHaystack.includes(query));
  });
}

function renderSummary() {
  const items = reviewItems || [];
  const { correct, needWork: problem, unchecked } = currentStatusSummary();
  document.querySelector("#totalCount").textContent = items.length;
  document.querySelector("#correctCount").textContent = correct;
  document.querySelector("#problemCount").textContent = problem;
  document.querySelector("#uncheckedCount").textContent = unchecked;
  const savedCount = Object.values(reviewState).filter((item) => item?.status && item.status !== "unchecked").length;
  saveSummary.textContent = `${savedCount} marked in this page now: ${correct} correct, ${problem} need work, ${unchecked} unchecked.`;
  if (fileSaveSummary?.textContent === "File save status loading...") {
    setFileSaveSummary("Direct repository saving is available when using the local review server. Download remains a backup only.");
  }
  if (persistedSubmission?.status === "submitted") {
    const counts = persistedSubmission.statusCounts || buildStatusCountsFromSubmission(persistedSubmission);
    const summary = persistedSubmission.summary || {};
    const repoCounts = countFromStatusCounts(counts, summary.totalUniqueChecks || reviewItems.length);
    const correctSubmitted = repoCounts.correct;
    const needWorkSubmitted = repoCounts.needWork;
    const uncheckedSubmitted = repoCounts.unchecked;
    submissionSummary.textContent = `Repository status: ${correctSubmitted} correct, ${needWorkSubmitted} need work, ${uncheckedSubmitted} unchecked. Last persisted ${lastPersistedAt || persistedSubmission.updated || "date unknown"}.${hasUnsavedChanges ? " Current page has unsaved changes." : " Current page matches the loaded status unless you change a mark."}`;
  } else {
    submissionSummary.textContent = `Repository status: no persisted human review file was found yet.${hasUnsavedChanges ? " Current page has unsaved changes." : ""}`;
  }
  if (qaReport?.summary) {
    machineSummary.textContent = `Machine check: ${qaReport.summary.itemsChecked} clips, ${qaReport.summary.missingFiles} missing, ${qaReport.summary.durationWarnings} duration warnings, ${qaReport.summary.transcriptionWarnings} transcription warnings.`;
  } else {
    machineSummary.textContent = "Machine report unavailable; browser availability checks still work.";
  }
}

function buildStatusCountsFromSubmission(submission) {
  return (submission?.items || []).reduce((counts, item) => {
    const status = item.review?.status || "unchecked";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
}

function renderFilters() {
  const groups = [...new Set(manifest.items.map((item) => item.group))];
  groupFilter.innerHTML = '<option value="all">All groups</option>'
    + groups.map((group) => `<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`).join("");
}

function renderList() {
  const items = filteredItems();
  reviewMeta.textContent = `${items.length} unique checks showing from ${reviewItems.length} checks. The manifest has ${manifest.items.length} placement entries. Metadata source: ${manifest.version}.`;
  listEl.innerHTML = items.map(renderItem).join("");
  if (audioReviewEmpty) audioReviewEmpty.hidden = items.length !== 0;
  listEl.querySelectorAll("[data-review-status]").forEach((button) => {
    button.addEventListener("click", () => {
      const itemId = button.dataset.itemId;
      const status = button.dataset.reviewStatus;
      const current = reviewState[itemId] || {};
      const previousStatus = current.status || "unchecked";
      reviewState[itemId] = {
        ...current,
        status,
        approvedAt: status === "correct" ? new Date().toISOString() : current.approvedAt || null
      };
      if (previousStatus !== status) {
        markUnsaved();
      }
      renderSummary();
      renderList();
    });
  });
  listEl.querySelectorAll("[data-note-for]").forEach((input) => {
    input.addEventListener("input", () => {
      const itemId = input.dataset.noteFor;
      reviewState[itemId] = {
        ...reviewFor({ id: itemId }),
        notes: input.value
      };
      markUnsaved("Unsaved note change in this page. Use Save Review Status to persist it.");
      renderSummary();
    });
  });
  listEl.querySelectorAll("[data-audio]").forEach((button) => {
    button.addEventListener("click", () => playAudio(button));
  });
}

function resetAllFilters() {
  searchEl.value = "";
  groupFilter.value = "all";
  statusFilter.value = "all";
  machineFilter.value = "all";
  priorityFilter.value = "all";
  renderList();
}

function jumpToStatus(status) {
  statusFilter.value = status;
  groupFilter.value = "all";
  machineFilter.value = "all";
  priorityFilter.value = "all";
  searchEl.value = "";
  renderList();
  document.querySelector("#audioReviewList")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function importReviewData(data) {
  const importedItems = data.items || [];
  importedItems.forEach((item) => {
    if (!item.review) return;
    const key = item.reviewId || item.id || reviewKey(item);
    reviewState[key] = item.review;
  });
  markUnsaved("Imported review data is loaded in this page. Use Save Review Status to persist it.");
  renderSummary();
  renderList();
}

function mergePersistedSubmission(data, options = {}) {
  if (!data?.items?.length) return;
  const overwrite = Boolean(options.overwrite);
  let changed = false;
  data.items.forEach((item) => {
    if (!item.review) return;
    const key = item.reviewId || item.id || reviewKey(item);
    if (!overwrite && reviewState[key]) return;
    reviewState[key] = item.review;
    changed = true;
  });
  return changed;
}

function loadRepoStatus() {
  if (!persistedSubmission) {
    setFileSaveSummary("No persisted repository review file is available to load.");
    return;
  }
  mergePersistedSubmission(persistedSubmission, { overwrite: true });
  hasUnsavedChanges = false;
  lastPersistedAt = persistedSubmission.updated || null;
  renderSummary();
  renderList();
  setFileSaveSummary("Repository review status loaded into this browser.");
}

function renderItem(item) {
  const review = reviewFor(item);
  const qa = qaFor(item);
  const recheck = recheckFor(item);
  const vowelAid = vowelAidFor(item);
  const browserCheck = browserChecks[item.reviewId] || browserChecks[item.primaryId] || browserChecks[item.id];
  const statusClass = problemStatuses.has(review.status) ? "problem" : review.status;
  const titleText = item.displayText || item.expectedText;
  const flags = qa?.flags?.length ? qa.flags : [];
  const transcript = qa?.transcription?.text || "";
  const similarity = qa?.textComparison?.similarity;
  const duration = qa?.metadata?.durationSeconds;
  const availability = browserCheck
    ? `${browserCheck.ok ? "Browser loaded" : "Browser failed"}${browserCheck.checkedFiles ? ` · ${browserCheck.checkedFiles} file${browserCheck.checkedFiles === 1 ? "" : "s"}` : ""}${browserCheck.duration ? ` · ${formatSeconds(browserCheck.duration)}` : ""}`
    : "Not checked in browser";
  const statusSummary = statusLabels[review.status] || review.status;
  const machineSummary = flags.length ? flags.join(", ") : "Clear";
  const placementSummary = item.placements.length > 1
    ? `${item.placements.length} placements`
    : item.placements[0].placement;
  return `
    <article class="audio-review-item ${escapeHtml(statusClass)}">
      <div class="audio-review-main">
        <div class="audio-review-text">
          <h3>${escapeHtml(titleText)}</h3>
          <p>${item.expectedEnglish ? escapeHtml(item.expectedEnglish) : escapeHtml(placementSummary)}</p>
        </div>
        <div class="audio-review-status-line">
          <span class="compact-status ${escapeHtml(statusClass)}">${escapeHtml(statusSummary)}</span>
          ${recheck ? '<span class="compact-status recheck">Recheck</span>' : ""}
          <span class="compact-status">${escapeHtml(item.group)}</span>
          <span class="compact-status">${escapeHtml(machineSummary)}</span>
        </div>
        <button class="audio-button main-sound" type="button" data-audio="${escapeHtml(audioUrl(item.file))}" data-say="${escapeHtml(item.expectedText)}">Play</button>
      </div>
      <div class="audio-review-actions compact-actions" aria-label="Review status for ${escapeHtml(item.expectedText)}">
        ${statusButton(item, "correct", "OK")}
        ${statusButton(item, "wrong_pronunciation", "Pronunciation")}
        ${statusButton(item, "wrong_text", "Text")}
        ${statusButton(item, "wrong_placement", "Placement")}
        ${statusButton(item, "replace_voice", "Voice")}
      </div>
      <details class="audio-review-details">
        <summary>Details</summary>
        <div class="audio-detail-grid">
          <div>
            <span>Placement</span>
            <p>${escapeHtml(placementSummary)}</p>
            <code>${escapeHtml(item.files.join(" · "))}</code>
            ${item.placements.length > 1 || item.files.length > 1 ? `<details class="placement-list"><summary>All placements</summary><ul>${item.placements.map((placement) => `<li><strong>${escapeHtml(placement.group)}</strong>: ${escapeHtml(placement.placement)} <code>${escapeHtml(placement.file)}</code></li>`).join("")}</ul></details>` : ""}
          </div>
          <div>
            <span>Listen For</span>
            <ul>${(item.listenFor || []).map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>
          </div>
          ${vowelAid ? `
            <div class="vowel-check-card">
              <span>Vowel Target</span>
              <p>${escapeHtml(vowelAid.target)}</p>
              <p><strong>Avoid:</strong> ${escapeHtml(vowelAid.avoid)}</p>
              <div class="compare-buttons">
                <button class="mini-button" type="button" data-audio="${escapeHtml(audioUrl(item.file))}" data-say="${escapeHtml(item.expectedText)}">Play vowel</button>
                <button class="mini-button" type="button" data-audio="${escapeHtml(audioUrl(vowelAid.compareFile))}" data-say="${escapeHtml(vowelAid.compareText)}">Compare ${escapeHtml(vowelAid.compareText)}</button>
              </div>
            </div>
          ` : ""}
          ${recheck ? `
            <div class="recheck-card">
              <span>Recheck Status</span>
              <p>${escapeHtml(recheckGuidanceFor(item, recheck))}</p>
            </div>
          ` : ""}
          <div>
            <span>Machine QA</span>
            <p>${escapeHtml(availability)}</p>
            <p>${duration ? `Duration: ${formatSeconds(duration)}.` : "Duration unavailable."}</p>
            ${flags.length ? `<p class="machine-warning">${escapeHtml(flags.join(", "))}</p>` : "<p>No machine flags.</p>"}
            ${transcript ? `<details><summary>Transcription${similarity !== undefined ? ` · ${escapeHtml(String(similarity))}` : ""}</summary><p>${escapeHtml(transcript)}</p></details>` : ""}
          </div>
        </div>
      </details>
      <label class="review-note compact-note">
        Correction notes
        <textarea data-note-for="${escapeHtml(item.reviewId)}" placeholder="Only add notes when a clip needs work.">${escapeHtml(review.notes || "")}</textarea>
      </label>
    </article>
  `;
}

function formatSeconds(value) {
  return `${Number(value).toFixed(2)}s`;
}

function statusButton(item, status, label = statusLabels[status]) {
  const active = reviewFor(item).status === status ? " is-selected" : "";
  return `<button class="mini-button${active}" type="button" data-item-id="${escapeHtml(item.reviewId)}" data-review-status="${escapeHtml(status)}">${escapeHtml(label)}</button>`;
}

function buildSubmissionPayload() {
  const statusCounts = reviewItems.reduce((counts, item) => {
    const status = reviewFor(item).status || "unchecked";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  const correct = statusCounts.correct || 0;
  const needsWork = Object.entries(statusCounts)
    .filter(([status]) => problemStatuses.has(status))
    .reduce((total, [, count]) => total + count, 0);
  return {
    manifestVersion: manifest.version,
    status: "submitted",
    updated: new Date().toISOString().slice(0, 10),
    source: "website audio review tool",
    note: "Human review saved from the website audio review tool and persisted into the repository.",
    summary: {
      totalUniqueChecks: reviewItems.length,
      totalPlacements: manifest.items.length,
      correct,
      needsWork
    },
    statusCounts,
    items: reviewItems.map((item) => ({
      ...item,
      machineQa: qaFor(item),
      browserAvailability: browserChecks[item.reviewId] || browserChecks[item.primaryId] || null,
      review: reviewFor(item)
    }))
  };
}

function downloadReviewFile(payload = buildSubmissionPayload()) {
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "u1-1-audio-review-submission.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportReview() {
  downloadReviewFile(buildSubmissionPayload());
}

async function saveReviewFile() {
  const payload = buildSubmissionPayload();
  setFileSaveSummary("Saving review status...");
  const saved = await persistReviewToRepository(payload);
  if (saved) {
    persistedSubmission = payload;
    hasUnsavedChanges = false;
    lastPersistedAt = payload.updated;
    updateDataSourceSummary();
    renderSummary();
    renderList();
    return;
  }

  const json = `${JSON.stringify(payload, null, 2)}\n`;
  try {
    if (!window.showSaveFilePicker) {
      throw new Error("File picker unavailable.");
    }
    const handle = await window.showSaveFilePicker({
      suggestedName: "u1-1-audio-review-submission.json",
      types: [{
        description: "JSON review submission",
        accept: { "application/json": [".json"] }
      }]
    });
    const writable = await handle.createWritable();
    await writable.write(json);
    await writable.close();
    persistedSubmission = payload;
    mergePersistedSubmission(payload);
    hasUnsavedChanges = false;
    lastPersistedAt = payload.updated;
    updateDataSourceSummary();
    renderSummary();
    setFileSaveSummary("Review status saved through the browser file picker. Direct repository save was unavailable.");
  } catch (error) {
    if (error?.name === "AbortError") {
      setFileSaveSummary("Save canceled. Current marks remain in this page only until you save or refresh.");
      renderSummary();
      return;
    }
    downloadReviewFile(payload);
    setFileSaveSummary("Direct repository save was unavailable, so a repository-ready JSON file was downloaded instead.");
    console.error(error);
  }
}

async function persistReviewToRepository(payload) {
  try {
    const response = await fetch(persistEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return false;
    const result = await response.json();
    if (!result.ok) return false;
    setFileSaveSummary(`Review status persisted to ${result.path || "the repository JSON"}.`);
    return true;
  } catch {
    return false;
  }
}

function playNextUnchecked() {
  const next = reviewItems.find((item) => reviewFor(item).status === "unchecked");
  if (!next) return;
  const nextUrl = audioUrl(next.file);
  const button = [...document.querySelectorAll("[data-audio]")].find((item) => item.dataset.audio === nextUrl);
  if (button) {
    button.scrollIntoView({ behavior: "smooth", block: "center" });
    playAudio(button);
    return;
  }
  searchEl.value = "";
  groupFilter.value = "all";
  statusFilter.value = "all";
  renderList();
  requestAnimationFrame(() => playNextUnchecked());
}

async function loadManifest() {
  const [manifestResponse, qaResponse, recheckResponse, submissionResponse] = await Promise.all([
    fetch("../data/audio-manifest.json"),
    fetch("../data/media-qa/u1-1-audio-qa-report.json"),
    fetch("../data/media-qa/u1-1-audio-recheck-rollup.json"),
    fetch("../data/media-qa/u1-1-audio-review-submission.json")
  ]);
  if (!manifestResponse.ok) throw new Error("Audio manifest could not be loaded.");
  manifest = await manifestResponse.json();
  if (qaResponse.ok) {
    qaReport = await qaResponse.json();
  }
  if (recheckResponse.ok) {
    recheckRollup = await recheckResponse.json();
  }
  reviewItems = buildUniqueReviewItems(manifest.items);
  if (submissionResponse.ok) {
    persistedSubmission = await submissionResponse.json();
    mergePersistedSubmission(persistedSubmission);
    lastPersistedAt = persistedSubmission.updated || null;
  }
  migratePlacementReviews();
  updateDataSourceSummary();
  renderFilters();
  renderSummary();
  renderList();
}

function reviewKey(item) {
  return normalizeReviewText(item.expectedText);
}

function buildUniqueReviewItems(items) {
  const byKey = new Map();
  items.forEach((item) => {
    const key = reviewKey(item);
    if (!byKey.has(key)) {
      byKey.set(key, {
        ...item,
        id: key,
        reviewId: key,
        primaryId: item.id,
        groups: [item.group],
        files: [item.file],
        placements: [{
          id: item.id,
          group: item.group,
          placement: item.placement,
          file: item.file,
          source: item.source
        }]
      });
      return;
    }
    const existing = byKey.get(key);
    existing.groups = [...new Set([...existing.groups, item.group])];
    existing.files = [...new Set([...existing.files, item.file])];
    existing.placements.push({
      id: item.id,
      group: item.group,
      placement: item.placement,
      file: item.file,
      source: item.source
    });
    if (existing.reviewPriority !== "high" && item.reviewPriority === "high") {
      existing.reviewPriority = "high";
    }
  });
  return [...byKey.values()];
}

function migratePlacementReviews() {
  let changed = false;
  reviewItems.forEach((item) => {
    if (reviewState[item.reviewId]) return;
    const savedPlacementReview = item.placements.map((placement) => reviewState[placement.id]).find(Boolean);
    if (savedPlacementReview) {
      reviewState[item.reviewId] = savedPlacementReview;
      changed = true;
    }
  });
  return changed;
}

[searchEl, groupFilter, statusFilter, machineFilter, priorityFilter].forEach((control) => {
  control.addEventListener("input", renderList);
  control.addEventListener("change", renderList);
});
resetFilters?.addEventListener("click", resetAllFilters);
resetFiltersEmpty?.addEventListener("click", resetAllFilters);
statusJumpButtons.forEach((button) => {
  button.addEventListener("click", () => jumpToStatus(button.dataset.statusJump));
});

async function checkOneAudio(item) {
  const files = item.files || [item.file];
  const results = [];
  for (const file of files) {
    results.push(await checkAudioFile(file));
  }
  const failed = results.filter((result) => !result.ok);
  return {
    ok: failed.length === 0,
    checkedFiles: files.length,
    duration: results[0]?.duration || null,
    files: results,
    checkedAt: new Date().toISOString()
  };
}

async function checkAudioFile(file) {
  return new Promise((resolve) => {
    const audio = new Audio(audioUrl(file));
    const done = (result) => {
      audio.removeAttribute("src");
      resolve({
        ...result,
        file,
        checkedAt: new Date().toISOString()
      });
    };
    const timer = window.setTimeout(() => done({ ok: false, reason: "timeout" }), 8000);
    audio.addEventListener("loadedmetadata", () => {
      window.clearTimeout(timer);
      done({ ok: true, duration: Number.isFinite(audio.duration) ? audio.duration : null });
    }, { once: true });
    audio.addEventListener("error", () => {
      window.clearTimeout(timer);
      done({ ok: false, reason: "load_error" });
    }, { once: true });
  });
}

async function runBrowserCheck() {
  if (!manifest) return;
  const button = document.querySelector("#runBrowserCheck");
  button.disabled = true;
  button.textContent = "Checking...";
  for (const item of reviewItems) {
    browserChecks[item.reviewId] = await checkOneAudio(item);
    renderList();
  }
  button.disabled = false;
  button.textContent = "Check Availability";
  renderSummary();
}

document.querySelector("#exportReview").addEventListener("click", exportReview);
document.querySelector("#saveReviewFile").addEventListener("click", saveReviewFile);
document.querySelector("#loadRepoStatus").addEventListener("click", loadRepoStatus);
document.querySelector("#playUnchecked").addEventListener("click", playNextUnchecked);
document.querySelector("#runBrowserCheck").addEventListener("click", runBrowserCheck);
document.querySelector("#importReview").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  importReviewData(JSON.parse(await file.text()));
  event.target.value = "";
});
document.querySelector("#resetReview").addEventListener("click", () => {
  if (!confirm("Clear all local audio review marks for this browser?")) return;
  reviewState = {};
  markUnsaved("Marks cleared in this page. Use Save Review Status to persist the reset.");
  renderSummary();
  renderList();
});

loadManifest().catch((error) => {
  reviewMeta.textContent = "The audio review manifest could not be loaded. Check that the preview server is running from the repository root and that data/audio-manifest.json is reachable.";
  if (dataSourceSummary) dataSourceSummary.textContent = "Manifest load failed.";
  if (audioReviewEmpty) {
    audioReviewEmpty.hidden = false;
    audioReviewEmpty.querySelector("h3").textContent = "Audio data did not load";
    audioReviewEmpty.querySelector("p").textContent = "Open data/audio-manifest.json from the Data Source section. If it does not open, restart the local preview server from the repository folder.";
  }
  console.error(error);
});
