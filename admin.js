const form = document.querySelector("#entryForm");
const output = document.querySelector("#jsonOutput");
const folderOutput = document.querySelector("#folderOutput");

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
  const child = slugify(form.childName.value || "child");
  const scheduleNumber = String(form.scheduleNumber.value || "1").padStart(2, "0");
  folderOutput.textContent = `materials/${child}/curriculum-${scheduleNumber}/`;
}

form.addEventListener("input", updateFolderPreview);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const childId = slugify(form.childName.value);
  const scheduleNumber = Number(form.scheduleNumber.value);
  const scheduleFolder = `curriculum-${String(scheduleNumber).padStart(2, "0")}`;
  const fileName = form.fileName.value.trim();
  const entry = {
    id: `${childId}-${scheduleFolder}-${slugify(form.materialType.value)}-${slugify(fileName.replace(/\.[^.]+$/, ""))}`,
    childId,
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
