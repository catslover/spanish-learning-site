const hockeyItems = {
  casco: {
    spanish: "Oye, bro, ¿trajiste tu casco hoy?",
    english: "Hey bro, did you bring your helmet today?",
    audio: "../media/u1-1-pronunciation/hockey/casco.m4a"
  },
  guantes: {
    spanish: "Oye, bro, ¿trajiste tus guantes hoy?",
    english: "Hey bro, did you bring your gloves today?",
    audio: "../media/u1-1-pronunciation/hockey/guantes.m4a"
  },
  botella: {
    spanish: "Oye, bro, ¿trajiste tu botella de agua hoy?",
    english: "Hey bro, did you bring your water bottle today?",
    audio: "../media/u1-1-pronunciation/hockey/botella-agua.m4a"
  },
  ropa: {
    spanish: "Oye, bro, ¿trajiste tu ropa térmica hoy?",
    english: "Hey bro, did you bring your base layers today?",
    audio: "../media/u1-1-pronunciation/hockey/ropa-termica.m4a"
  },
  patines: {
    spanish: "Oye, bro, ¿trajiste tus patines hoy?",
    english: "Hey bro, did you bring your skates today?",
    audio: "../media/u1-1-pronunciation/hockey/patines.m4a"
  },
  corazon: {
    spanish: "Oye, bro, ¿trajiste hoy tu corazón de hierro?",
    english: "Hey bro, did you bring your iron heart today?",
    note: "El corazón de hierro significa tener fortaleza mental, resiliencia y estar listo para competir.",
    noteEnglish: "The iron heart means having mental toughness, resilience, and being ready to compete.",
    noteAudio: "../media/u1-1-pronunciation/hockey/corazon-definicion.m4a",
    audio: "../media/u1-1-pronunciation/hockey/corazon-hierro.m4a",
    followup: "¿Estás listo para competir?",
    followupEnglish: "Are you ready to compete?",
    followupAudio: "../media/u1-1-pronunciation/hockey/listo-competir.m4a"
  }
};

document.querySelectorAll(".choice-grid button").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".question-card");
    const correct = card?.dataset.answer === button.dataset.choice;
    card?.querySelectorAll(".choice-grid button").forEach((choice) => choice.classList.remove("is-correct", "is-incorrect"));
    button.classList.add(correct ? "is-correct" : "is-incorrect");
    const feedback = card?.querySelector(".feedback");
    if (feedback) feedback.textContent = correct ? "Correct. Nice close reading." : "Not quite. Listen again and check the story.";
  });
});

const hockeyResult = document.querySelector("#hockeyResult");
document.querySelectorAll("[data-hockey]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-hockey]").forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    const item = hockeyItems[button.dataset.hockey];
    hockeyResult.innerHTML = `
      <p class="eyebrow">Selected Sentence</p>
      <h3>${escapeHtml(item.spanish)}</h3>
      <p>${escapeHtml(item.english)}</p>
      ${item.note ? `<p><strong>${escapeHtml(item.note)}</strong><br>${escapeHtml(item.noteEnglish)}</p>` : ""}
      <div class="lesson-actions">
        <button class="button primary" type="button" data-audio="${escapeHtml(item.audio)}" data-say="${escapeHtml(item.spanish)}">Play Sentence</button>
        ${item.noteAudio ? `<button class="button secondary" type="button" data-audio="${escapeHtml(item.noteAudio)}" data-say="${escapeHtml(item.note)}">Play Meaning</button>` : ""}
        ${item.followup ? `<button class="button secondary" type="button" data-audio="${escapeHtml(item.followupAudio)}" data-say="${escapeHtml(item.followup)}">${escapeHtml(item.followup)}</button>` : ""}
      </div>
    `;
    hockeyResult.querySelectorAll("[data-audio]").forEach((audioButton) => {
      audioButton.addEventListener("click", () => playAudio(audioButton));
    });
    playAudio(hockeyResult.querySelector("[data-audio]"));
  });
});

const identityForm = document.querySelector("#identityForm");
const identityPreview = document.querySelector("#identityPreview");
let selectedTemplate = "passport";

function valueFor(name, fallback) {
  return identityForm?.elements[name]?.value?.trim() || fallback;
}

function renderIdentityPreview() {
  if (!identityForm || !identityPreview) return;
  const accent = valueFor("accent", "green");
  const detail = valueFor("detail", "solid");
  identityPreview.className = `identity-preview ${selectedTemplate} accent-${accent} detail-${detail}`;
  identityPreview.innerHTML = `
    <span class="id-label">${templateLabel(selectedTemplate)}</span>
    <span class="id-icon" aria-hidden="true">${identityIcon(valueFor("icon", "hockey"))}</span>
    <h3>Me llamo ${escapeHtml(valueFor("name", "Victor"))}.</h3>
    <p>Mi nombre se escribe ${escapeHtml(valueFor("spelling", "V-I-C-T-O-R"))}.</p>
    <p>Tengo ${escapeHtml(valueFor("age", "13"))} años.</p>
    <p>Vivo en ${escapeHtml(valueFor("home", "Washington"))}.</p>
    <p>Me gusta ${escapeHtml(valueFor("likes", "el hockey"))}.</p>
    <p>Mi número favorito es ${escapeHtml(valueFor("number", "13"))}.</p>
    <p>Mi deporte favorito es ${escapeHtml(valueFor("sport", "el hockey"))}.</p>
  `;
}

function identityIcon(icon) {
  return {
    hockey: "H",
    book: "LIBRO",
    star: "*",
    mountain: "MONTE"
  }[icon] || "H";
}

function templateLabel(template) {
  return {
    passport: "Pasaporte",
    sports: "Tarjeta deportiva",
    notebook: "Cuaderno",
    minimal: "Así soy yo"
  }[template] || "Así soy yo";
}

identityForm?.addEventListener("input", renderIdentityPreview);
document.querySelector("#printIdentityCard")?.addEventListener("click", () => {
  window.print();
});
document.querySelectorAll("[data-template]").forEach((button) => {
  button.addEventListener("click", () => {
    selectedTemplate = button.dataset.template;
    document.querySelectorAll("[data-template]").forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    renderIdentityPreview();
  });
});

renderIdentityPreview();
