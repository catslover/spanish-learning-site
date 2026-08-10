const statusEl = document.querySelector("#speechStatus");
const utteranceOptions = { lang: "es" };
let activeAudio = null;

function getSpanishVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return voices.find((voice) => voice.lang?.toLowerCase().startsWith("es")) || null;
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    if (statusEl) statusEl.textContent = "This browser does not support website audio playback.";
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = utteranceOptions.lang;
  utterance.rate = 0.74;
  utterance.pitch = 1;
  const voice = getSpanishVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
  if (statusEl) statusEl.textContent = `Playing: ${text}`;
}

function setPlayingButton(button, isPlaying) {
  document.querySelectorAll(".is-playing").forEach((item) => {
    if (item !== button) item.classList.remove("is-playing");
  });
  button.classList.toggle("is-playing", isPlaying);
}

function playAudio(button) {
  const audioPath = button.dataset.audio;
  const fallbackText = button.dataset.say;

  if (!audioPath) {
    speak(fallbackText);
    return;
  }

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  window.speechSynthesis?.cancel?.();

  activeAudio = new Audio(audioPath);
  setPlayingButton(button, true);
  if (statusEl) statusEl.textContent = `Playing: ${fallbackText}`;

  activeAudio.addEventListener("ended", () => setPlayingButton(button, false), { once: true });
  activeAudio.addEventListener("error", () => {
    setPlayingButton(button, false);
    speak(fallbackText);
  }, { once: true });

  activeAudio.play().catch(() => {
    setPlayingButton(button, false);
    speak(fallbackText);
  });
}

document.querySelectorAll("[data-say], [data-audio]").forEach((button) => {
  button.addEventListener("click", () => playAudio(button));
});

window.speechSynthesis?.addEventListener?.("voiceschanged", () => {
  if (statusEl && getSpanishVoice()) {
    statusEl.textContent = "Spanish website audio is ready.";
  }
});
