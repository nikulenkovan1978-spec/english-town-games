import "./styles.css";

const app = document.querySelector("#app");
const toastLayer = document.querySelector("#toast-layer");
const BASE = import.meta.env.BASE_URL;
const actionHero = (name) => `${BASE}assets/heroes/${name}-action.webp`;
const talkHero = (name) => `${BASE}assets/heroes-v3/${name}-talk.webp`;
const world = (name) => `${BASE}assets/worlds-v3/${name}.webp`;
const VOICE_VERSION = "5";

const ICONS = {
  spark: `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2l4.6 11.8L37 18.5l-11 6.7L24.8 38 16 28.7 3.4 31.5l6.2-11.2L3 9.4l12.7 2.5z" fill="currentColor"/></svg>`,
  heart: `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 35S4 26 4 14.5C4 7.3 13 4.4 20 12c7-7.6 16-4.7 16 2.5C36 26 20 35 20 35z" fill="currentColor"/></svg>`,
  sound: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 12h6l7-6v20l-7-6H5z" fill="currentColor"/><path d="M22 11c2.5 2.8 2.5 7.2 0 10M25.5 7.5c5 4.7 5 12.3 0 17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  back: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M18 7l-9 9 9 9M10 16h14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  play: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 5l18 11L9 27z" fill="currentColor"/></svg>`,
  profile: `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="11" r="6" fill="currentColor"/><path d="M5 28c.8-7 5-10 11-10s10.2 3 11 10" fill="currentColor"/></svg>`,
};

const GAME_META = {
  greeting: { title: "Hello City", color: "#ff65ac", total: 8 },
  runner: { title: "Number Rush", color: "#42d7ff", total: 6 },
  paint: { title: "Color Blaster", color: "#a969ff", total: 6 },
};

const GAME_HELP = {
  greeting: { icon: "💬", title: "Как играть в Hello City", steps: ["Послушай, что говорит герой.", "Выбери правильный ответ или собери фразу по порядку.", "Нажми на динамик, чтобы услышать реплику ещё раз."], tip: "Сначала дослушай всю фразу, затем отвечай." },
  runner: { icon: "🐾", title: "Как играть в Number Rush", steps: ["Послушай целое английское слово-число.", "Стрелками на экране или клавишами ← → выбери дорожку.", "Нажми «Начать забег» и проведи Penny через правильные ворота."], tip: "На последних этапах ориентируйся только на слух." },
  paint: { icon: "🎨", title: "Как играть в Colorworks", steps: ["Послушай название цвета целиком.", "Найди сферу нужного цвета.", "Наведи прицел и нажми на сферу, чтобы выстрелить."], tip: "Динамик повторяет слово сколько угодно раз." },
};

// V4 intentionally starts a fresh adventure once after the major voice/game
// update. Afterwards the newly created profile is saved normally again.
const oldProgress = null;
const savedProgress = JSON.parse(localStorage.getItem("englishTownV4") || "null");
const progress = savedProgress || {
  profile: { name: "", avatar: "leo", createdAt: null },
  sparks: oldProgress?.sparks || 0,
  hearts: 0,
  badges: oldProgress?.badges || [],
  sessions: [],
  sound: oldProgress?.sound ?? true,
};

const state = {
  screen: "start",
  greeting: null,
  runner: null,
  paint: null,
  activeSessionId: null,
  timer: null,
  raf: null,
};

function saveProgress() {
  localStorage.setItem("englishTownV4", JSON.stringify(progress));
}

function avatarSource(name = progress.profile.avatar) {
  if (name === "leo" || name === "mia" || name === "penny" || name === "archie") return talkHero(name);
  return talkHero("leo");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function beginSession(game) {
  const session = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    game,
    startedAt: new Date().toISOString(),
    completedAt: null,
    tasks: [],
    correct: 0,
    mistakes: 0,
    hearts: 0,
    sparks: 0,
  };
  progress.sessions.unshift(session);
  progress.sessions = progress.sessions.slice(0, 30);
  state.activeSessionId = session.id;
  saveProgress();
  return session;
}

function activeSession() {
  return progress.sessions.find((item) => item.id === state.activeSessionId);
}

function recordMistake() {
  const session = activeSession();
  if (session) session.mistakes += 1;
  saveProgress();
}

function recordTask(label, reward) {
  const session = activeSession();
  if (!session) return;
  session.tasks.push(label);
  session.correct += 1;
  session.sparks += reward;
  saveProgress();
}

function finishSession(score, total) {
  const session = activeSession();
  if (!session || session.completedAt) return session?.hearts || 0;
  const ratio = score / total;
  const hearts = ratio >= .92 && session.mistakes <= 1 ? 3 : ratio >= .65 ? 2 : 1;
  session.completedAt = new Date().toISOString();
  session.hearts = hearts;
  progress.hearts += hearts;
  saveProgress();
  return hearts;
}

class SoundStudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.music = null;
    this.effects = null;
    this.delay = null;
    this.timer = null;
    this.step = 0;
    this.scene = "hub";
    this.voices = [];
    this.voiceAudio = null;
    this.loadVoices();
  }

  loadVoices() {
    if (!("speechSynthesis" in window)) return;
    const load = () => { this.voices = speechSynthesis.getVoices(); };
    load();
    speechSynthesis.addEventListener?.("voiceschanged", load);
  }

  async unlock() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 14;
      compressor.ratio.value = 4;
      this.master = this.ctx.createGain();
      this.music = this.ctx.createGain();
      this.effects = this.ctx.createGain();
      this.delay = this.ctx.createDelay(.6);
      const feedback = this.ctx.createGain();
      this.delay.delayTime.value = .17;
      feedback.gain.value = .18;
      this.delay.connect(feedback).connect(this.delay);
      this.music.gain.value = .18;
      this.effects.gain.value = .72;
      this.music.connect(compressor);
      this.effects.connect(compressor);
      this.effects.connect(this.delay).connect(compressor);
      compressor.connect(this.master).connect(this.ctx.destination);
      this.master.gain.value = progress.sound ? .72 : 0;
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.startSequencer();
  }

  envelope(frequency, duration, type, volume, when = 0, destination = this.effects, detune = 0) {
    if (!this.ctx || !progress.sound) return;
    const time = this.ctx.currentTime + when;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.detune.value = detune;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(Math.max(700, frequency * 4), time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(260, frequency * 1.2), time + duration);
    gain.gain.setValueAtTime(.0001, time);
    gain.gain.exponentialRampToValueAtTime(volume, time + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    oscillator.connect(filter).connect(gain).connect(destination);
    oscillator.start(time);
    oscillator.stop(time + duration + .04);
  }

  sweep(from, to, duration = .18, volume = .08, type = "sine") {
    if (!this.ctx || !progress.sound) return;
    const now = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, now);
    oscillator.frequency.exponentialRampToValueAtTime(to, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain).connect(this.effects);
    oscillator.start();
    oscillator.stop(now + duration + .03);
  }

  noise(duration = .08, volume = .04, highpass = 1000) {
    if (!this.ctx || !progress.sound) return;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * duration), this.ctx.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < channel.length; i += 1) channel[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    filter.type = "highpass";
    filter.frequency.value = highpass;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, this.ctx.currentTime + duration);
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(this.effects);
    source.start();
  }

  setScene(scene) {
    this.scene = scene;
    this.step = 0;
  }

  startSequencer() {
    if (this.timer) return;
    const scenes = {
      hub: { beat: 250, melody: [523,659,784,659,587,698,880,698,523,659,784,1047,880,784,698,659], bass: 131 },
      greeting: { beat: 285, melody: [392,494,587,494,440,523,659,523,392,494,587,698,659,587,523,494], bass: 98 },
      runner: { beat: 190, melody: [440,554,659,880,659,554,494,659,740,988,740,659,554,740,880,1109], bass: 110 },
      paint: { beat: 215, melody: [466,622,740,932,740,622,523,698,831,1047,831,698,622,740,932,1245], bass: 117 },
    };
    const tick = () => {
      const config = scenes[this.scene] || scenes.hub;
      if (progress.sound && this.ctx) {
        const note = config.melody[this.step % config.melody.length];
        if (this.step % 2 === 0) this.envelope(note, .22, "triangle", .024, 0, this.music);
        if (this.step % 4 === 0) {
          this.envelope(config.bass, .28, "sine", .045, 0, this.music);
          this.sweep(125, 52, .1, .05, "sine");
        }
        if (this.step % 4 === 2) this.noise(.05, .012, 2200);
        if (this.step % 2 === 1 && this.scene !== "greeting") this.noise(.025, .006, 5000);
        this.step += 1;
      }
      clearTimeout(this.timer);
      this.timer = setTimeout(tick, config.beat);
    };
    tick();
  }

  sfx(name) {
    const sounds = {
      tap: () => { this.envelope(620, .07, "sine", .045); this.envelope(930, .08, "triangle", .025, .025); },
      profile: () => [523, 784, 1047].forEach((n, i) => this.envelope(n, .24, "triangle", .065, i * .07)),
      talk: () => { this.envelope(740, .11, "sine", .055); this.envelope(988, .13, "triangle", .04, .07); },
      lane: () => { this.sweep(260, 760, .16, .065, "triangle"); this.noise(.09, .025, 1800); },
      shot: () => { this.sweep(980, 220, .2, .085, "sawtooth"); this.noise(.13, .06, 900); this.envelope(1240, .12, "square", .03, .03); },
      wrong: () => { this.envelope(210, .2, "triangle", .045); this.envelope(165, .24, "sine", .04, .11); },
      correct: () => { [523,659,784,1047].forEach((n, i) => this.envelope(n, .34, i % 2 ? "sine" : "triangle", .075, i * .055)); this.noise(.18, .035, 3200); },
      finish: () => { [392,523,659,784,1047,1319].forEach((n, i) => this.envelope(n, .5, "triangle", .085, i * .075)); this.noise(.35, .04, 4000); },
    };
    sounds[name]?.();
  }

  chooseVoice(character) {
    const english = this.voices.filter((voice) => /^en[-_]/i.test(voice.lang));
    if (!english.length) return null;
    const preferences = {
      leo: ["Ryan", "Guy", "Andrew", "Christopher", "Daniel", "Male"],
      mia: ["Jenny", "Aria", "Ava", "Samantha", "Sonia", "Zira", "Female"],
      penny: ["Jenny", "Aria", "Ava", "Samantha", "Female"],
      archie: ["Ryan", "Guy", "Andrew", "Daniel", "Male"],
      narrator: ["Ava", "Aria", "Jenny", "Samantha", "Female"],
    };
    const wanted = preferences[character] || preferences.narrator;
    const score = (voice) => {
      const name = voice.name.toLowerCase();
      let points = voice.localService ? 2 : 0;
      if (name.includes("natural")) points += 45;
      if (name.includes("neural")) points += 40;
      if (name.includes("online")) points += 20;
      // Character/gender matches matter more than the generic "Natural" label.
      wanted.forEach((term, index) => { if (name.includes(term.toLowerCase())) points += 150 - index * 8; });
      return points;
    };
    return [...english].sort((a, b) => score(b) - score(a))[0];
  }

  speechSlug(text, character) {
    const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `${character}--${slug}`;
  }

  setSpeakingCharacter(character, speaking) {
    const selector = character === "leo" ? ".story-leo" : `.story-npc[alt="${character}"]`;
    document.querySelector(selector)?.classList.toggle("is-speaking", speaking);
  }

  stopVoice() {
    if (this.voiceAudio) {
      this.voiceAudio.onended = null;
      this.voiceAudio.onerror = null;
      this.voiceAudio.pause();
      this.voiceAudio = null;
    }
    window.speechSynthesis?.cancel();
    document.querySelectorAll(".story-character.is-speaking").forEach((el) => el.classList.remove("is-speaking"));
  }

  speak(text, character = "narrator", options = {}) {
    if (!progress.sound) return;
    this.stopVoice();
    const cleanText = text.replace(/[★]/g, "").trim();
    const clip = new Audio(`${BASE}assets/voices/${this.speechSlug(cleanText, character)}.mp3?v=${VOICE_VERSION}`);
    clip.preload = "auto";
    clip.volume = .96;
    this.voiceAudio = clip;
    let fallbackStarted = false;
    const fallback = () => {
      if (fallbackStarted || this.voiceAudio !== clip) return;
      fallbackStarted = true;
      this.voiceAudio = null;
      this.speakWithBrowser(cleanText, character, options);
    };
    clip.onplay = () => this.setSpeakingCharacter(character, true);
    clip.onended = () => {
      if (this.voiceAudio === clip) this.voiceAudio = null;
      this.setSpeakingCharacter(character, false);
      options.onend?.();
    };
    clip.onerror = fallback;
    clip.play().catch(fallback);
    return true;
  }

  speakWithBrowser(cleanText, character = "narrator", options = {}) {
    if (!("speechSynthesis" in window)) { options.onend?.(); return false; }
    // Some engines spell uppercase teaching cards as initialisms. Speech always
    // receives a normal English word while the card remains uppercase visually.
    const normalizedText = /^[A-Z]+(?:[ -][A-Z]+)*[.!?]?$/.test(cleanText) ? cleanText.toLocaleLowerCase("en-US") : cleanText;
    // Several Windows voices interpret the short name "Mia" as the initialism
    // M-I-A. The phonetic spelling is only sent to TTS; the screen still says Mia.
    const spokenText = normalizedText.replace(/\bMia\b/gi, "Mee-yah");
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = "en-US";
    utterance.voice = this.chooseVoice(character);
    const settings = {
      leo: { rate: .94, pitch: 1.12 }, mia: { rate: .92, pitch: 1.24 },
      penny: { rate: .9, pitch: 1.32 }, archie: { rate: .92, pitch: 1.24 }, narrator: { rate: .91, pitch: 1.03 },
    }[character] || { rate: .88, pitch: 1.08 };
    utterance.rate = options.rate || settings.rate;
    utterance.pitch = options.pitch || settings.pitch;
    utterance.volume = .95;
    utterance.onstart = () => this.setSpeakingCharacter(character, true);
    utterance.onend = () => {
      document.querySelectorAll(".story-character.is-speaking").forEach((el) => el.classList.remove("is-speaking"));
      options.onend?.();
    };
    utterance.onerror = () => document.querySelectorAll(".story-character.is-speaking").forEach((el) => el.classList.remove("is-speaking"));
    speechSynthesis.speak(utterance);
    return true;
  }

  toggle() {
    progress.sound = !progress.sound;
    saveProgress();
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(progress.sound ? .72 : 0, this.ctx.currentTime, .04);
    renderHeaderState();
    if (progress.sound) this.sfx("tap");
  }
}

const audio = new SoundStudio();

function clearGameLoops() {
  if (state.timer) clearTimeout(state.timer);
  if (state.raf) cancelAnimationFrame(state.raf);
  state.timer = null;
  state.raf = null;
  audio.stopVoice();
  document.querySelectorAll(".praise-pop").forEach((element) => element.remove());
}

function addSparks(amount) {
  progress.sparks += amount;
  saveProgress();
  renderHeaderState();
}

function awardBadge(id) {
  if (!progress.badges.includes(id)) progress.badges.push(id);
  saveProgress();
}

function toast(message, kind = "good") {
  const element = document.createElement("div");
  element.className = `game-toast ${kind}`;
  element.textContent = message;
  toastLayer.append(element);
  setTimeout(() => element.remove(), 1800);
}

function burst(x = 50, y = 50, color = "#ffd54a") {
  const layer = document.createElement("div");
  layer.className = "burst-layer";
  layer.style.setProperty("--x", `${x}%`);
  layer.style.setProperty("--y", `${y}%`);
  layer.style.setProperty("--burst", color);
  layer.innerHTML = Array.from({ length: 24 }, (_, i) => `<i style="--i:${i}"></i>`).join("");
  document.body.append(layer);
  setTimeout(() => layer.remove(), 1100);
}

const praises = ["Brilliant!", "Fantastic!", "Amazing!", "Great job!", "You did it!"];
function celebrate(detail, reward = 10, color = "#ffe04d", speaker = "narrator", speakPraise = true) {
  const praise = praises[Math.floor(Math.random() * praises.length)];
  audio.sfx("correct");
  const overlay = document.createElement("div");
  overlay.className = "praise-pop";
  overlay.style.setProperty("--praise-color", color);
  overlay.innerHTML = `<div class="praise-rays"></div><div class="praise-star">${ICONS.spark}</div><div><strong>${praise}</strong><span>${detail}</span><b>+${reward} ИСКР</b></div>`;
  document.body.append(overlay);
  burst(50, 45, color);
  if (speakPraise) setTimeout(() => audio.speak(praise, speaker, { rate: .95 }), 120);
  setTimeout(() => overlay.remove(), 1050);
}

function header(title = "ADVENTURES", showBack = true) {
  const profileName = progress.profile.name || "Ученик";
  return `<header class="game-header v3-header">
    ${showBack ? `<button class="round-button back-button" data-action="home" aria-label="На главную">${ICONS.back}</button>` : `<div class="header-mark">ET</div>`}
    <div class="mini-logo"><span>ENGLISH TOWN</span><strong>${title}</strong></div>
    ${GAME_HELP[state.screen] ? `<button class="how-button" data-action="instructions" aria-label="Как играть"><b>?</b><span>КАК ИГРАТЬ</span></button>` : ""}
    <button class="profile-chip" data-action="profile"><span><img src="${avatarSource()}" alt=""></span><b>${profileName}</b></button>
    <div class="hud-pill heart-hud">${ICONS.heart}<strong data-heart-count>${progress.hearts}</strong></div>
    <div class="hud-pill spark-hud">${ICONS.spark}<strong data-spark-count>${progress.sparks}</strong></div>
    <button class="round-button sound-button ${progress.sound ? "" : "is-muted"}" data-action="sound" aria-label="Звук">${ICONS.sound}</button>
  </header>`;
}

function showInstructions(game = state.screen) {
  const help = GAME_HELP[game];
  if (!help) return;
  const modal = document.createElement("div");
  modal.className = "help-layer";
  modal.innerHTML = `<section class="help-card" role="dialog" aria-modal="true" aria-labelledby="help-title"><button class="help-close" data-action="close-instructions" aria-label="Закрыть">×</button><div class="help-icon">${help.icon}</div><small>ИНСТРУКЦИЯ</small><h2 id="help-title">${help.title}</h2><ol>${help.steps.map((step, i) => `<li><b>${i + 1}</b><span>${step}</span></li>`).join("")}</ol><p>💡 ${help.tip}</p><button class="power-button compact" data-action="close-instructions"><span>ВСЁ ПОНЯТНО!</span>${ICONS.play}</button></section>`;
  app.append(modal);
}

function renderHeaderState() {
  document.querySelectorAll("[data-spark-count]").forEach((el) => { el.textContent = progress.sparks; });
  document.querySelectorAll("[data-heart-count]").forEach((el) => { el.textContent = progress.hearts; });
  document.querySelectorAll(".sound-button").forEach((el) => el.classList.toggle("is-muted", !progress.sound));
}

function renderStart() {
  clearGameLoops();
  state.screen = "start";
  audio.setScene("hub");
  const hasProfile = Boolean(progress.profile.name);
  const form = hasProfile ? `<div class="return-player">
      <span class="return-avatar"><img src="${avatarSource()}" alt=""></span>
      <div><small>С ВОЗВРАЩЕНИЕМ</small><strong>${progress.profile.name}!</strong><p>${progress.hearts} сердечек • ${progress.sparks} искр</p></div>
      <button class="power-button compact" data-action="enter-world"><span>ПРОДОЛЖИТЬ</span>${ICONS.play}</button>
    </div>` : `<form class="player-create" data-profile-form>
      <small>СОЗДАДИМ ТВОЙ ПРОФИЛЬ</small><h2>Как тебя зовут?</h2>
      <label><span>Имя ученика</span><input name="studentName" maxlength="18" autocomplete="given-name" placeholder="Напиши своё имя" required></label>
      <fieldset><legend>Выбери героя профиля</legend><div class="avatar-picker">${["leo","mia","penny","archie"].map((name, index) => `<label><input type="radio" name="avatar" value="${name}" ${index === 0 ? "checked" : ""}><span><img src="${talkHero(name)}" alt="${name}"></span><b>${name[0].toUpperCase() + name.slice(1)}</b></label>`).join("")}</div></fieldset>
      <button class="power-button" type="submit"><span class="power-icon">${ICONS.play}</span><span><b>СОЗДАТЬ ПРОФИЛЬ</b><small>и войти со звуком</small></span></button>
      <button class="gate-music-button" type="button" data-action="preview-music">♫ ВКЛЮЧИТЬ МУЗЫКУ</button>
    </form>`;
  app.innerHTML = `<main class="sound-gate v3-gate">
    <div class="gate-sky"><i></i><i></i><i></i></div>
    <div class="v3-gate-title"><div class="logo-chip">АНГЛИЙСКИЙ ПО ШАГАМ С НУЛЯ</div><h1><span>ENGLISH TOWN</span><strong>ADVENTURES</strong></h1><p>Твоя личная история английских приключений</p></div>
    <img class="gate-hero gate-leo" src="${actionHero("leo")}" alt="Leo"><img class="gate-hero gate-mia" src="${actionHero("mia")}" alt="Mia"><img class="gate-hero gate-penny" src="${actionHero("penny")}" alt="Penny"><img class="gate-hero gate-archie" src="${actionHero("archie")}" alt="Archie">
    <section class="profile-entry">${form}</section><div class="gate-floor"></div>
  </main>`;
}

function renderHome() {
  clearGameLoops();
  state.screen = "home";
  audio.setScene("hub");
  app.innerHTML = `<main class="hub-v3" style="--hub-bg:url('${world("adventure-hub")}')">
    ${header("ADVENTURES", false)}
    <div class="hub-light"></div>
    <section class="hub-title"><small>ДОБРО ПОЖАЛОВАТЬ, ${progress.profile.name.toUpperCase()}</small><h1>Выбери новое приключение</h1><p>Играй, говори и собирай сердечки в своём профиле</p></section>
    <div class="hub-portals">
      <button class="hub-portal portal-talk" data-game="greeting"><span class="portal-orbit"><i></i><i></i><b>01</b></span><span class="portal-copy"><small>ИНТЕРАКТИВНАЯ ИСТОРИЯ</small><strong>Hello City</strong><em>Живые ситуации общения</em><b>${progress.badges.includes("greeting") ? "ПРОЙДЕНО" : "ИГРАТЬ"}</b></span></button>
      <button class="hub-portal portal-number" data-game="runner"><span class="portal-orbit"><i></i><i></i><b>02</b></span><span class="portal-copy"><small>СКОРОСТНОЙ РАННЕР</small><strong>Number Rush</strong><em>Числа 1–6 на скорости</em><b>${progress.badges.includes("runner") ? "ПРОЙДЕНО" : "ИГРАТЬ"}</b></span></button>
      <button class="hub-portal portal-color" data-game="paint"><span class="portal-orbit"><i></i><i></i><b>03</b></span><span class="portal-copy"><small>ЦВЕТОВОЙ БЛАСТЕР</small><strong>Colorworks</strong><em>Верни миру краски</em><b>${progress.badges.includes("paint") ? "ПРОЙДЕНО" : "ИГРАТЬ"}</b></span></button>
    </div>
    <img class="hub-friend hub-penny" src="${talkHero("penny")}" alt="Penny"><img class="hub-friend hub-archie" src="${talkHero("archie")}" alt="Archie">
    <button class="session-shortcut" data-action="profile">${ICONS.profile}<span><small>МОЙ ПРОГРЕСС</small><strong>${progress.sessions.length} сессий • ${progress.hearts} сердечек</strong></span></button>
  </main>`;
}

function renderProfile() {
  clearGameLoops();
  state.screen = "profile";
  const sessions = progress.sessions;
  app.innerHTML = `<main class="profile-screen">
    ${header("МОЙ ПРОФИЛЬ")}
    <div class="profile-backdrop"></div>
    <section class="profile-board">
      <aside class="profile-card-main"><div class="profile-avatar-large"><img src="${avatarSource()}" alt="${progress.profile.avatar}"><i></i></div><small>УЧЕНИК ENGLISH TOWN</small><h1>${progress.profile.name}</h1><button data-action="edit-profile">ИЗМЕНИТЬ ИМЯ И ГЕРОЯ</button></aside>
      <div class="profile-data">
        <div class="profile-stats"><article class="heart-stat">${ICONS.heart}<span><b>${progress.hearts}</b><small>СЕРДЕЧЕК</small></span></article><article class="spark-stat">${ICONS.spark}<span><b>${progress.sparks}</b><small>ИСКР</small></span></article><article><span class="badge-mini">${progress.badges.length}</span><span><b>${progress.badges.length}/3</b><small>ЗНАЧКА МИРОВ</small></span></article></div>
        <section class="session-history"><header><div><small>ИСТОРИЯ ЗАНЯТИЙ</small><h2>Мои игровые сессии</h2></div><span>${sessions.length}</span></header>
          <div class="session-list">${sessions.length ? sessions.map((session) => sessionRow(session)).join("") : `<div class="empty-history"><span>${ICONS.spark}</span><h3>Здесь появятся твои занятия</h3><p>Выбери игру, и профиль запомнит выполненные задания и награды.</p><button data-action="home">ВЫБРАТЬ ИГРУ</button></div>`}</div>
        </section>
      </div>
    </section>
  </main>`;
}

function sessionRow(session) {
  const meta = GAME_META[session.game];
  const tasks = session.tasks.length ? session.tasks.join(" • ") : "Сессия начата, задания ещё не выполнены";
  return `<article class="session-row" style="--session-color:${meta.color}"><div class="session-symbol"><i></i><b>${session.game === "greeting" ? "Hi" : session.game === "runner" ? "1–6" : "RGB"}</b></div><div class="session-main"><small>${formatDate(session.startedAt)}</small><h3>${meta.title}</h3><p>${tasks}</p></div><div class="session-result"><span>${session.correct}/${meta.total}</span><div>${Array.from({ length: 3 }, (_, i) => `<i class="${i < session.hearts ? "won" : ""}">${ICONS.heart}</i>`).join("")}</div><small>${session.completedAt ? "ЗАВЕРШЕНО" : "НЕ ЗАВЕРШЕНО"}</small></div></article>`;
}

function showProfileEditor() {
  const modal = document.createElement("div");
  modal.className = "profile-editor-layer";
  modal.innerHTML = `<form class="player-create editor" data-profile-form><button type="button" class="editor-close" data-action="close-editor">×</button><small>НАСТРОЙКИ ПРОФИЛЯ</small><h2>Как тебя называть?</h2><label><span>Имя ученика</span><input name="studentName" maxlength="18" value="${progress.profile.name}" required></label><fieldset><legend>Герой профиля</legend><div class="avatar-picker">${["leo","mia","penny","archie"].map((name) => `<label><input type="radio" name="avatar" value="${name}" ${name === progress.profile.avatar ? "checked" : ""}><span><img src="${talkHero(name)}" alt="${name}"></span><b>${name[0].toUpperCase() + name.slice(1)}</b></label>`).join("")}</div></fieldset><button class="power-button compact" type="submit"><span>СОХРАНИТЬ</span>${ICONS.play}</button></form>`;
  app.append(modal);
}

const greetingMissions = [
  { location: "school", npc: "mia", speaker: "mia", line: "Good morning, Leo!", prompt: "Ты пришёл в школу утром. Ответь Mia.", target: "Good morning, Mia!", choices: ["Good morning, Mia!", "Goodbye, Mia!", "Good afternoon, Mia!"] },
  { location: "cafe", npc: "penny", speaker: "penny", line: "Hello! I'm Penny.", prompt: "Penny представилась. Поздоровайся коротко.", target: "Hi, Penny!", choices: ["Goodbye, Penny!", "Hi, Penny!", "Good afternoon, Penny!"] },
  { location: "fountain", npc: "archie", speaker: "archie", line: "Hi! What's your name?", prompt: "Новый друг спрашивает твоё имя.", target: "My name is Leo.", choices: ["What's your name?", "My name is Leo.", "Nice to meet you!"] },
  { location: "library", npc: "penny", speaker: "narrator", line: "You meet a new friend.", prompt: "Теперь сам спроси имя Penny.", target: "What's your name?", chunks: ["What's", "your", "name?"] },
  { location: "flowers", npc: "penny", speaker: "penny", line: "My name is Penny.", prompt: "Ответь вежливо после знакомства.", target: "Nice to meet you!", chunks: ["Nice", "to", "meet", "you!"] },
  { location: "cafe", npc: "mia", speaker: "mia", line: "Good afternoon, Leo!", prompt: "После обеда ты снова встретил Mia.", target: "Good afternoon, Mia!", chunks: ["Good", "afternoon,", "Mia!"] },
  { location: "fountain", npc: "archie", speaker: "archie", line: "Hello! I'm Archie.", prompt: "Представься так же коротко.", target: "I'm Leo.", choices: ["I'm Leo.", "My name?", "Goodbye!"] },
  { location: "school", npc: "mia", speaker: "mia", line: "See you tomorrow, Leo!", prompt: "Фестиваль закончился. Попрощайся.", target: "Goodbye, Mia!", choices: ["Hello, Mia!", "Good morning!", "Goodbye, Mia!"] },
];

function greetingLevel(index) {
  if (index < 3) return { n: 1, name: "Ответь в ситуации" };
  if (index < 6) return { n: 2, name: "Собери фразу" };
  return { n: 3, name: "Диалог без подсказки" };
}

function startGreeting() {
  beginSession("greeting");
  state.greeting = { mission: 0, build: [], score: 0, locked: false };
  audio.setScene("greeting");
  renderGreeting();
}

function renderGreeting() {
  clearGameLoops();
  state.screen = "greeting";
  const g = state.greeting;
  if (g.mission >= greetingMissions.length) return renderFinish("greeting", "МАСТЕР ОБЩЕНИЯ", "Ты прожил целый день в Hello City и уверенно поговорил со всеми героями!", g.score);
  const mission = greetingMissions[g.mission];
  const level = greetingLevel(g.mission);
  const answerArea = mission.chunks ? `<div class="scene-build"><div class="build-line" data-build-line><span>Нажимай на слова по порядку</span></div><div class="word-bank">${[...mission.chunks].sort(() => Math.random() - .5).map((word) => `<button data-word="${word}">${word}</button>`).join("")}</div></div>` : `<div class="scene-answers">${mission.choices.map((choice) => `<button data-answer="${choice}"><span>${choice}</span>${ICONS.play}</button>`).join("")}</div>`;
  app.innerHTML = `<main class="story-game location-${mission.location}" style="--story-bg:url('${world("hello-city")}')">
    ${header("HELLO CITY")}
    <div class="story-progress"><div><small>ЭПИЗОД ${g.mission + 1} ИЗ 8 • УРОВЕНЬ ${level.n}</small><strong>${level.name}</strong></div><div>${greetingMissions.map((_, i) => `<i class="${i < g.mission ? "done" : i === g.mission ? "now" : ""}"></i>`).join("")}</div></div>
    <section class="story-stage ${g.mission === 0 ? "scene-opening" : ""}">
      <div class="story-ambient"><i></i><i></i><i></i><i></i></div>
      <div class="scene-label"><small>МЕСТО ВСТРЕЧИ</small><b>${mission.location === "school" ? "У школы" : mission.location === "cafe" ? "В городском кафе" : mission.location === "library" ? "Возле библиотеки" : mission.location === "flowers" ? "У цветочной лавки" : "На городской площади"}</b></div>
      <img class="story-character story-leo" src="${talkHero("leo")}" alt="Leo"><img class="story-character story-npc" src="${talkHero(mission.npc)}" alt="${mission.npc}">
      <div class="speech-bubble ${mission.speaker === "narrator" ? "narration" : ""}"><span>${mission.speaker === "narrator" ? "СИТУАЦИЯ" : mission.speaker.toUpperCase()}</span><strong>${mission.line}</strong><button data-action="repeat-dialogue">${ICONS.sound}</button></div>
      <section class="story-console"><div class="story-prompt"><small>ТВОЯ РЕПЛИКА</small><h2>${mission.prompt}</h2></div>${answerArea}</section>
    </section>
  </main>`;
  if (g.mission === 0) setTimeout(() => document.querySelector(".story-stage.scene-opening")?.classList.remove("scene-opening"), 900);
  state.timer = setTimeout(() => audio.speak(mission.line, mission.speaker), g.mission === 0 ? 1050 : 380);
}

function greetingAnswer(answer, button) {
  if (state.greeting.locked) return;
  const mission = greetingMissions[state.greeting.mission];
  if (answer === mission.target) {
    button.classList.add("correct");
    completeGreetingMission();
  } else {
    recordMistake();
    button.classList.add("wrong");
    audio.sfx("wrong");
    toast("Попробуй ещё раз — послушай разговор", "try");
    audio.speak(mission.line, mission.speaker);
    setTimeout(() => button.classList.remove("wrong"), 500);
  }
}

function greetingWord(word, button) {
  if (state.greeting.locked) return;
  const g = state.greeting;
  const mission = greetingMissions[g.mission];
  if (word !== mission.chunks[g.build.length]) {
    recordMistake();
    button.classList.add("wrong");
    audio.sfx("wrong");
    setTimeout(() => button.classList.remove("wrong"), 450);
    return;
  }
  audio.sfx("tap");
  g.build.push(word);
  button.disabled = true;
  button.classList.add("used");
  document.querySelector("[data-build-line]").innerHTML = g.build.map((chunk) => `<b>${chunk}</b>`).join("");
  if (g.build.length === mission.chunks.length) completeGreetingMission();
}

function completeGreetingMission() {
  const g = state.greeting;
  const mission = greetingMissions[g.mission];
  g.locked = true;
  g.score += 1;
  addSparks(12);
  recordTask(mission.target, 12);
  document.querySelector(".story-leo")?.classList.add("is-speaking");
  celebrate(mission.target, 12, "#ffdb55", "mia", false);
  g.mission += 1;
  g.build = [];
  let movedOn = false;
  const nextMission = () => {
    if (movedOn) return;
    movedOn = true;
    clearTimeout(state.timer);
    g.locked = false;
    renderGreeting();
  };
  const speaking = audio.speak(mission.target, "leo", { onend: () => setTimeout(nextMission, 280) });
  // Fallback for muted sound or a speech engine that does not report completion.
  state.timer = setTimeout(nextMission, speaking ? 4200 : 1450);
}

const numberWords = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX"];
function runnerLevel(wave) {
  if (wave < 2) return { n: 1, name: "Цифра и слово" };
  if (wave < 4) return { n: 2, name: "Слово без цифры" };
  return { n: 3, name: "Только на слух" };
}

function startRunner() {
  beginSession("runner");
  state.runner = { wave: 0, lane: 1, progress: 0, last: 0, active: false, score: 0, combo: 0, sequence: [1,2,3,4,5,6].sort(() => Math.random() - .5), gates: [] };
  audio.setScene("runner");
  prepareRunnerWave();
}

function prepareRunnerWave() {
  clearGameLoops();
  state.screen = "runner";
  const r = state.runner;
  if (r.wave >= 6) return renderFinish("runner", "ЧЕМПИОН NUMBER RUSH", "Penny добежала до финиша и собрала все числа от 1 до 6!", r.score);
  const target = r.sequence[r.wave];
  const wrong = [1,2,3,4,5,6].filter((n) => n !== target).sort(() => Math.random() - .5).slice(0,2);
  // Put the correct gate on a different lane every round, so the player must
  // actively guide Penny instead of repeatedly staying on the same road.
  // Alternate between the centre and an unpredictable outer lane. This keeps
  // all three roads in play and still requires a move on every round.
  const targetLane = r.lane === 1 ? (Math.random() < .5 ? 0 : 2) : 1;
  r.gates = Array(3);
  r.gates[targetLane] = target;
  const decoyLanes = [0,1,2].filter((lane) => lane !== targetLane);
  decoyLanes.forEach((lane, index) => { r.gates[lane] = wrong[index]; });
  r.progress = 0;
  r.active = false;
  const level = runnerLevel(r.wave);
  const command = level.n === 1 ? `<strong>${target}</strong><b>${numberWords[target - 1]}</b>` : level.n === 2 ? `<b>${numberWords[target - 1]}</b>` : `<span>${ICONS.sound}</span><b>LISTEN!</b>`;
  app.innerHTML = `<main class="runner-v3" style="--runner-bg:url('${world("number-world")}')">
    ${header("NUMBER RUSH")}
    <div class="runner-v3-bar"><div><small>ЭТАП ${r.wave + 1}/6 • УРОВЕНЬ ${level.n}</small><strong>${level.name}</strong></div><div><span>СЕРИЯ</span><b>${r.combo}</b></div></div>
    <section class="race-stage">
      <div class="race-speed"><i></i><i></i><i></i><i></i></div>
      <div class="number-command"><small>НАЙДИ ДОРОЖКУ</small><div>${command}</div><button data-action="repeat-number">${ICONS.sound}</button></div>
      <div class="gate-layer">${r.gates.map((number, lane) => `<div class="race-gate race-lane-${lane}" data-gate><span>${number}</span><div>${Array.from({ length: number }, () => `<i></i>`).join("")}</div></div>`).join("")}</div>
      <div class="penny-runner lane-pos-${r.lane}"><span></span><img src="${BASE}assets/heroes-v3/penny-run.webp" alt="Penny"></div>
      <div class="runner-guide"><div class="guide-step"><b>1</b><span>Послушай число</span></div><i></i><div class="guide-step"><b>2</b><span>Выбери дорожку</span></div><i></i><div class="guide-step"><b>3</b><span>Пройди ворота</span></div><button data-action="runner-go">НАЧАТЬ ЗАБЕГ</button></div>
      <div class="race-countdown" aria-live="assertive"></div>
    </section>
    <div class="lane-controls v3-controls"><button data-lane-move="-1">${ICONS.back}<span>ВЛЕВО</span></button><div class="lane-lights"><i></i><i class="active"></i><i></i></div><button class="right" data-lane-move="1"><span>ВПРАВО</span>${ICONS.back}</button></div>
  </main>`;
  state.timer = setTimeout(() => audio.speak(numberWords[target - 1].toLowerCase(), "penny"), 350);
}

function moveLane(direction) {
  const r = state.runner;
  if (!r || state.screen !== "runner") return;
  const old = r.lane;
  r.lane = Math.max(0, Math.min(2, r.lane + direction));
  if (old === r.lane) return;
  audio.sfx("lane");
  const runner = document.querySelector(".penny-runner");
  if (runner) runner.className = `penny-runner lane-pos-${r.lane} is-switching`;
  document.querySelectorAll(".lane-lights i").forEach((item, i) => item.classList.toggle("active", i === r.lane));
}

function runRunner() {
  const r = state.runner;
  if (!r || r.active) return;
  document.querySelector(".runner-guide")?.classList.add("is-gone");
  document.querySelector(".race-stage")?.classList.add("is-counting");
  const count = document.querySelector(".race-countdown");
  let value = 3;
  count.textContent = value;
  count.classList.add("show");
  audio.sfx("tap");
  const countdown = () => {
    value -= 1;
    if (value > 0) { count.textContent = value; audio.sfx("tap"); state.timer = setTimeout(countdown, 470); return; }
    count.textContent = "GO!";
    audio.sfx("finish");
    document.querySelector(".race-stage")?.classList.remove("is-counting");
    document.querySelector(".race-stage")?.classList.add("is-running");
    state.timer = setTimeout(() => count.classList.remove("show"), 450);
    r.active = true;
    r.last = performance.now();
    state.raf = requestAnimationFrame(runnerFrame);
  };
  state.timer = setTimeout(countdown, 470);
}

function runnerFrame(now) {
  const r = state.runner;
  if (!r?.active || state.screen !== "runner") return;
  const delta = Math.min(35, now - r.last);
  r.last = now;
  r.progress += delta * .032;
  document.querySelectorAll("[data-gate]").forEach((gate) => gate.style.setProperty("--race-progress", Math.min(1, r.progress / 100)));
  document.querySelector(".race-stage")?.style.setProperty("--speed-progress", r.progress);
  if (r.progress >= 100) return collideRunner();
  state.raf = requestAnimationFrame(runnerFrame);
}

function collideRunner() {
  const r = state.runner;
  r.active = false;
  const chosen = r.gates[r.lane];
  const target = r.sequence[r.wave];
  const gate = document.querySelector(`.race-gate.race-lane-${r.lane}`);
  if (chosen === target) {
    r.score += 1;
    r.combo += 1;
    const reward = 14 + Math.min(8, r.combo * 2);
    addSparks(reward);
    recordTask(`${target} — ${numberWords[target - 1]}`, reward);
    gate?.classList.add("gate-correct");
    document.querySelector(".penny-runner")?.classList.add("is-jumping");
    celebrate(`${target} — ${numberWords[target - 1]}`, reward, "#63efff", "penny");
  } else {
    r.combo = 0;
    recordMistake();
    gate?.classList.add("gate-wrong");
    audio.sfx("wrong");
    toast(`Это ${numberWords[chosen - 1]}. Нужно ${numberWords[target - 1]}`, "try");
    audio.speak(numberWords[target - 1].toLowerCase(), "penny");
  }
  r.wave += 1;
  state.timer = setTimeout(prepareRunnerWave, 1300);
}

const colors = [
  { name: "RED", hex: "#ff416c" }, { name: "BLUE", hex: "#27b6ff" },
  { name: "YELLOW", hex: "#ffd63d" }, { name: "GREEN", hex: "#49d17d" },
  { name: "PURPLE", hex: "#9b5cff" }, { name: "ORANGE", hex: "#ff8a32" },
];

function paintLevel(round) {
  if (round < 2) return { n: 1, name: "Слово и цвет" };
  if (round < 4) return { n: 2, name: "Только слово" };
  return { n: 3, name: "Команда на слух" };
}

function startPaint() {
  beginSession("paint");
  state.paint = { round: 0, score: 0, combo: 0, order: [...colors].sort(() => Math.random() - .5), locked: false };
  audio.setScene("paint");
  preparePaintRound();
}

function preparePaintRound() {
  clearGameLoops();
  state.screen = "paint";
  const p = state.paint;
  if (p.round >= 6) return renderFinish("paint", "МАСТЕР COLORWORKS", "Mia вернула волшебному городу все шесть цветов!", p.score);
  p.locked = false;
  const target = p.order[p.round];
  const decoys = colors.filter((color) => color.name !== target.name).sort(() => Math.random() - .5).slice(0,2);
  const spirits = [target, ...decoys].sort(() => Math.random() - .5);
  const level = paintLevel(p.round);
  const command = level.n === 1 ? `<b style="--command-color:${target.hex}">${target.name}</b><i style="background:${target.hex}"></i>` : level.n === 2 ? `<b>${target.name}</b>` : `<span>${ICONS.sound}</span><b>LISTEN!</b>`;
  app.innerHTML = `<main class="paint-v3" style="--paint-bg:url('${world("color-world")}')">
    ${header("COLORWORKS")}
    <div class="paint-v3-bar"><div><small>СФЕРА ${p.round + 1}/6 • УРОВЕНЬ ${level.n}</small><strong>${level.name}</strong></div><div><span>СЕРИЯ</span><b>${p.combo}</b></div></div>
    <section class="color-arena" data-paint-arena>
      <div class="color-dust"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="color-command"><small>ЗАРЯДИ ЦВЕТ</small><div>${command}</div><button data-action="repeat-color">${ICONS.sound}</button></div>
      <div class="spirit-field">${spirits.map((color, index) => `<button class="color-spirit spirit-${index}" data-color-target="${color.name}" style="--spirit-color:${color.hex};--spirit-delay:${index * -.8}s" aria-label="${color.name}"><span class="spirit-ring r1"></span><span class="spirit-ring r2"></span><span class="spirit-shell"><i></i><b></b><em></em></span><span class="spirit-trail"></span></button>`).join("")}</div>
      <div class="mia-shooter"><span></span><img src="${actionHero("mia")}" alt="Mia"><i></i></div>
      <div class="v3-crosshair"><i></i></div>
      <div class="blaster-instruction"><small>МИССИЯ</small><b>Найди нужную цветовую сферу</b><span>Наведи прицел и нажми, чтобы выстрелить</span></div>
    </section>
    <div class="paint-rounds">${colors.map((_, i) => `<i class="${i < p.round ? "done" : i === p.round ? "now" : ""}"></i>`).join("")}</div>
  </main>`;
  const arena = document.querySelector("[data-paint-arena]");
  arena?.addEventListener("pointermove", (event) => {
    const rect = arena.getBoundingClientRect();
    arena.style.setProperty("--aim-x", `${event.clientX - rect.left}px`);
    arena.style.setProperty("--aim-y", `${event.clientY - rect.top}px`);
  });
  state.timer = setTimeout(() => audio.speak(target.name.toLowerCase(), "mia"), 350);
}

function shootColor(button) {
  const p = state.paint;
  if (!p || p.locked) return;
  const target = p.order[p.round];
  const chosen = button.dataset.colorTarget;
  audio.sfx("shot");
  const arena = document.querySelector("[data-paint-arena]");
  const arenaRect = arena.getBoundingClientRect();
  const targetRect = button.getBoundingClientRect();
  const shot = document.createElement("i");
  shot.className = "v3-paint-shot";
  shot.style.setProperty("--shot-color", colors.find((color) => color.name === chosen).hex);
  shot.style.setProperty("--tx", `${targetRect.left + targetRect.width / 2 - arenaRect.left}px`);
  shot.style.setProperty("--ty", `${targetRect.top + targetRect.height / 2 - arenaRect.top}px`);
  arena.append(shot);
  const paintTrail = document.createElement("div");
  paintTrail.className = "paint-trail";
  paintTrail.style.setProperty("--shot-color", colors.find((color) => color.name === chosen).hex);
  paintTrail.style.setProperty("--tx", `${targetRect.left + targetRect.width / 2 - arenaRect.left}px`);
  paintTrail.style.setProperty("--ty", `${targetRect.top + targetRect.height / 2 - arenaRect.top}px`);
  paintTrail.style.setProperty("--dx", `${targetRect.left + targetRect.width / 2 - arenaRect.left - arenaRect.width * .2}px`);
  paintTrail.style.setProperty("--dy", `${targetRect.top + targetRect.height / 2 - arenaRect.top - arenaRect.height * .68}px`);
  paintTrail.innerHTML = Array.from({ length: 8 }, (_, i) => `<i style="--drop:${i}"></i>`).join("");
  arena.append(paintTrail);
  document.querySelector(".mia-shooter img")?.classList.add("is-firing");
  setTimeout(() => { shot.remove(); paintTrail.classList.add("is-splash"); document.querySelector(".mia-shooter img")?.classList.remove("is-firing"); }, 520);
  setTimeout(() => paintTrail.remove(), 1000);
  if (chosen === target.name) {
    p.locked = true;
    p.score += 1;
    p.combo += 1;
    const reward = 14 + Math.min(8, p.combo * 2);
    addSparks(reward);
    recordTask(target.name, reward);
    button.classList.add("spirit-hit");
    celebrate(`${target.name}! Точное попадание!`, reward, target.hex, "mia");
    p.round += 1;
    state.timer = setTimeout(preparePaintRound, 1300);
  } else {
    p.combo = 0;
    recordMistake();
    button.classList.add("spirit-miss");
    audio.sfx("wrong");
    toast(`Это ${chosen}. Ищи ${target.name}`, "try");
    audio.speak(target.name.toLowerCase(), "mia");
    setTimeout(() => button.classList.remove("spirit-miss"), 650);
  }
}

function renderFinish(id, title, text, score) {
  clearGameLoops();
  state.screen = "finish";
  const total = GAME_META[id].total;
  const hearts = finishSession(score, total);
  awardBadge(id);
  addSparks(50);
  audio.setScene("hub");
  audio.sfx("finish");
  app.innerHTML = `<main class="finish-screen finish-${id}">${header("МИССИЯ ВЫПОЛНЕНА")}<div class="finish-rays"></div><section class="finish-card"><div class="badge-orbit"><i></i><i></i><i></i><span>${ICONS.spark}</span></div><small>НОВЫЙ РЕЗУЛЬТАТ В ПРОФИЛЕ</small><h1>${title}</h1><p>${text}</p><div class="finish-hearts">${[1,2,3].map((n) => `<span class="${n <= hearts ? "won" : ""}">${ICONS.heart}</span>`).join("")}</div><div class="finish-reward"><b>+50</b><span>бонусных искр</span></div><div class="finish-actions"><button class="ghost-button" data-action="profile">ПОСМОТРЕТЬ ПРОФИЛЬ</button><button class="power-button compact" data-action="home"><span>НА КАРТУ</span>${ICONS.play}</button></div></section><img class="finish-hero" src="${id === "runner" ? `${BASE}assets/heroes-v3/penny-run.webp` : id === "paint" ? actionHero("mia") : talkHero("archie")}" alt="Герой игры"></main>`;
  burst(50,45,id === "paint" ? "#ff55be" : "#65f4ff");
}

function routeGame(id) {
  audio.sfx("tap");
  if (id === "greeting") startGreeting();
  if (id === "runner") startRunner();
  if (id === "paint") startPaint();
}

app.addEventListener("submit", async (event) => {
  const form = event.target.closest("[data-profile-form]");
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);
  progress.profile.name = String(data.get("studentName") || "").trim().slice(0,18);
  progress.profile.avatar = String(data.get("avatar") || "leo");
  progress.profile.createdAt ||= new Date().toISOString();
  if (!progress.profile.name) return;
  saveProgress();
  document.querySelector(".profile-editor-layer")?.remove();
  await audio.unlock();
  audio.sfx("profile");
  renderHome();
});

app.addEventListener("click", async (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  const game = event.target.closest("[data-game]")?.dataset.game;
  const answer = event.target.closest("[data-answer]");
  const word = event.target.closest("[data-word]");
  const colorTarget = event.target.closest("[data-color-target]");
  const laneMove = event.target.closest("[data-lane-move]");
  if (action === "enter-world") { await audio.unlock(); audio.sfx("profile"); renderHome(); return; }
  if (action === "home") { renderHome(); return; }
  if (action === "profile") { audio.sfx("profile"); renderProfile(); return; }
  if (action === "edit-profile") { showProfileEditor(); return; }
  if (action === "close-editor") { event.target.closest(".profile-editor-layer")?.remove(); return; }
  if (action === "sound") { await audio.unlock(); audio.toggle(); return; }
  if (action === "preview-music") { await audio.unlock(); audio.sfx("profile"); event.target.textContent = "♫ МУЗЫКА ИГРАЕТ"; event.target.classList.add("is-playing"); return; }
  if (action === "instructions") { audio.sfx("tap"); showInstructions(); return; }
  if (action === "close-instructions") { event.target.closest(".help-layer")?.remove(); return; }
  if (action === "repeat-dialogue") { const mission = greetingMissions[state.greeting.mission]; audio.speak(mission.line, mission.speaker); return; }
  if (action === "runner-go") { runRunner(); return; }
  if (action === "repeat-number") { audio.speak(numberWords[state.runner.sequence[state.runner.wave] - 1].toLowerCase(), "penny"); return; }
  if (action === "repeat-color") { audio.speak(state.paint.order[state.paint.round].name.toLowerCase(), "mia"); return; }
  if (game) { routeGame(game); return; }
  if (answer) { greetingAnswer(answer.dataset.answer, answer); return; }
  if (word) { greetingWord(word.dataset.word, word); return; }
  if (laneMove) { moveLane(Number(laneMove.dataset.laneMove)); return; }
  if (colorTarget) shootColor(colorTarget);
});

window.addEventListener("keydown", (event) => {
  if (state.screen === "runner" && ["ArrowLeft","ArrowRight","a","d"].includes(event.key)) {
    event.preventDefault();
    moveLane(["ArrowLeft","a"].includes(event.key) ? -1 : 1);
  }
  if (state.screen === "runner" && [" ","Enter"].includes(event.key)) runRunner();
});

renderStart();
