const statusEl = document.querySelector("#speechStatus");
const utteranceOptions = { lang: "es" };

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

document.querySelectorAll("[data-say]").forEach((button) => {
  button.addEventListener("click", () => speak(button.dataset.say));
});

window.speechSynthesis?.addEventListener?.("voiceschanged", () => {
  if (statusEl && getSpanishVoice()) {
    statusEl.textContent = "Spanish website audio is ready.";
  }
});
