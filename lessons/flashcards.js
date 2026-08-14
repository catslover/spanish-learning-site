const deckTitle = document.querySelector("#deckTitle");
const deckSummary = document.querySelector("#deckSummary");
const flashcardStudyGrid = document.querySelector("#flashcardStudyGrid");
const deckStats = document.querySelector("#deckStats");
const shuffleDeck = document.querySelector("#shuffleDeck");
const showIllustrated = document.querySelector("#showIllustrated");
const resetDeck = document.querySelector("#resetDeck");

let activeDeck = null;
let visibleCards = [];
let illustratedOnly = false;

function renderDeck(deck) {
  activeDeck = deck;
  visibleCards = [...deck.cards];
  illustratedOnly = false;
  renderVisibleCards();
}

function renderVisibleCards() {
  if (!activeDeck) return;
  const illustratedCount = activeDeck.cards.filter((card) => card.image?.src).length;
  deckTitle.textContent = activeDeck.title;
  deckSummary.textContent = `${activeDeck.cards.length} cards from the approved U1.1 deck. Every card has Spanish audio; selected cards use illustrations for memory support.`;
  deckStats.innerHTML = `
    <span><strong>${visibleCards.length}</strong> showing</span>
    <span><strong>${activeDeck.cards.length}</strong> total</span>
    <span><strong>${illustratedCount}</strong> illustrated</span>
  `;
  showIllustrated.setAttribute("aria-pressed", String(illustratedOnly));
  showIllustrated.classList.toggle("is-active", illustratedOnly);
  flashcardStudyGrid.innerHTML = visibleCards.map(renderStudyCard).join("");

  flashcardStudyGrid.querySelectorAll("[data-audio], [data-say]").forEach((button) => {
    button.addEventListener("click", () => playAudio(button));
  });

  flashcardStudyGrid.querySelectorAll("[data-flip-card]").forEach((button) => {
    button.addEventListener("click", () => {
      button.closest(".study-card")?.classList.toggle("is-flipped");
    });
  });
}

function renderStudyCard(card) {
  const image = card.image
    ? card.image.src
      ? `<img class="card-illustration" src="../${escapeHtml(card.image.src)}" alt="${escapeHtml(card.image.alt || "")}">`
      : `<div class="image-brief"><strong>Image</strong><span>${escapeHtml(card.image.brief)}</span></div>`
    : "";
  const audio = card.front.audio
    ? `<button class="play-icon" type="button" data-audio="../${escapeHtml(card.front.audio)}" data-say="${escapeHtml(card.front.audioText || card.front.spanish)}" aria-label="Play ${escapeHtml(card.front.audioText || card.front.spanish)}">Play</button>`
    : '<span class="tag">Audio planned</span>';
  const examples = card.back.examples
    ? `<ul>${card.back.examples.map((example) => `<li><strong>${escapeHtml(example.spanish)}</strong>${example.audio ? ` <button class="play-icon" type="button" data-audio="../${escapeHtml(example.audio)}" data-say="${escapeHtml(example.spanish)}" aria-label="Play ${escapeHtml(example.spanish)}">Play</button>` : ""}<span>${escapeHtml(example.english)}</span></li>`).join("")}</ul>`
    : "";
  const example = card.back.example
    ? `<p><strong>${escapeHtml(card.back.example.spanish)}</strong>${card.back.exampleAudio ? ` <button class="play-icon" type="button" data-audio="../${escapeHtml(card.back.exampleAudio)}" data-say="${escapeHtml(card.back.example.spanish)}" aria-label="Play example">Play</button>` : ""}<br>${escapeHtml(card.back.example.english)}</p>`
    : "";

  return `
    <article class="study-card">
      <div class="study-card-face study-card-front">
        <div class="material-meta">
          <span class="tag">${formatCardType(card.type)}</span>
          ${card.image?.src ? '<span class="tag current-tag">Illustrated</span>' : ""}
        </div>
        <h3>${escapeHtml(card.front.spanish)}</h3>
        ${audio}
        <button class="mini-button" type="button" data-flip-card>Flip</button>
      </div>
      <div class="study-card-face study-card-back">
        <h3>${escapeHtml(card.back.english || card.front.spanish)}</h3>
        ${examples}
        ${example}
        ${card.back.note ? `<p>${escapeHtml(card.back.note)}</p>` : ""}
        ${image}
        <button class="mini-button" type="button" data-flip-card>Back</button>
      </div>
    </article>
  `;
}

function formatCardType(type) {
  return String(type)
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

shuffleDeck?.addEventListener("click", () => {
  visibleCards = [...visibleCards].sort(() => Math.random() - 0.5);
  renderVisibleCards();
});

showIllustrated?.addEventListener("click", () => {
  if (!activeDeck) return;
  illustratedOnly = !illustratedOnly;
  visibleCards = illustratedOnly ? activeDeck.cards.filter((card) => card.image?.src) : [...activeDeck.cards];
  renderVisibleCards();
});

resetDeck?.addEventListener("click", () => {
  if (!activeDeck) return;
  illustratedOnly = false;
  visibleCards = [...activeDeck.cards];
  renderVisibleCards();
});

async function loadFlashcards() {
  try {
    const response = await fetch("../data/flashcards.json");
    if (!response.ok) throw new Error("Unable to load flashcards.");
    const data = await response.json();
    const deck = data.decks.find((item) => item.id === "u1-1-pronunciation");
    if (!deck) throw new Error("U1.1 deck not found.");
    renderDeck(deck);
  } catch (error) {
    deckTitle.textContent = "Flashcards unavailable";
    deckSummary.textContent = "The flashcard data could not be loaded.";
    flashcardStudyGrid.innerHTML = "";
    console.error(error);
  }
}

loadFlashcards();
