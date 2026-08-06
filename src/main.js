import "./styles.css";

const app = document.querySelector("#app");
const toastLayer = document.querySelector("#toast-layer");
const BASE = import.meta.env.BASE_URL;
const hero = (name) => `${BASE}assets/heroes/${name}-action.webp`;

const ICONS = {
  spark: `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2l4.6 11.8L37 18.5l-11 6.7L24.8 38 16 28.7 3.4 31.5l6.2-11.2L3 9.4l12.7 2.5z" fill="currentColor"/></svg>`,
  sound: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 12h6l7-6v20l-7-6H5z" fill="currentColor"/><path d="M22 11c2.5 2.8 2.5 7.2 0 10M25.5 7.5c5 4.7 5 12.3 0 17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  back: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M18 7l-9 9 9 9M10 16h14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  play: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 5l18 11L9 27z" fill="currentColor"/></svg>`,
};

const progress = JSON.parse(localStorage.getItem("englishTownV2") || "null") || {
  sparks: 0,
  badges: [],
  sound: true,
};

const state = {
  screen: "start",
  greeting: null,
  runner: null,
  paint: null,
  timer: null,
  raf: null,
};

function saveProgress() {
  localStorage.setItem("englishTownV2", JSON.stringify(progress));
}

class SoundStudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicTimer = null;
    this.step = 0;
  }

  async unlock() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = progress.sound ? 0.62 : 0;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.startMusic();
  }

  tone(frequency, duration = 0.12, type = "sine", volume = 0.09, delay = 0) {
    if (!this.ctx || !progress.sound) return;
    const now = this.ctx.currentTime + delay;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  noise(duration = 0.08, volume = 0.035) {
    if (!this.ctx || !progress.sound) return;
    const length = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) channel[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1200;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(this.master);
    source.start();
  }

  sfx(name) {
    const sets = {
      tap: () => this.tone(520, 0.07, "sine", 0.05),
      move: () => this.tone(190, 0.055, "triangle", 0.025),
      talk: () => [660, 820].forEach((n, i) => this.tone(n, 0.1, "sine", 0.07, i * 0.07)),
      correct: () => [523, 659, 784, 1047].forEach((n, i) => this.tone(n, 0.2, "triangle", 0.1, i * 0.07)),
      wrong: () => [190, 145].forEach((n, i) => this.tone(n, 0.18, "sawtooth", 0.055, i * 0.11)),
      whoosh: () => { this.noise(0.18, 0.06); this.tone(340, 0.17, "sine", 0.05); },
      shot: () => { this.tone(760, 0.09, "square", 0.055); this.noise(0.09, 0.045); },
      finish: () => [523, 659, 784, 1047, 1319].forEach((n, i) => this.tone(n, 0.3, "triangle", 0.11, i * 0.09)),
    };
    sets[name]?.();
  }

  speak(text) {
    if (!progress.sound || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[!.?]/g, ""));
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    utterance.pitch = 1.08;
    speechSynthesis.speak(utterance);
  }

  startMusic() {
    if (this.musicTimer) return;
    const melody = [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 1047, 880, 784, 659, 587];
    this.musicTimer = window.setInterval(() => {
      if (!progress.sound || !this.ctx) return;
      const note = melody[this.step % melody.length];
      this.tone(note, 0.2, "triangle", 0.027);
      if (this.step % 2 === 0) this.tone(note / 2, 0.22, "sine", 0.025);
      if (this.step % 4 === 0) this.tone(82, 0.08, "sine", 0.065);
      if (this.step % 4 === 2) this.noise(0.045, 0.013);
      this.step += 1;
    }, 245);
  }

  toggle() {
    progress.sound = !progress.sound;
    saveProgress();
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(progress.sound ? 0.62 : 0, this.ctx.currentTime + 0.08);
    }
    if (progress.sound) this.sfx("tap");
    renderHeaderState();
  }
}

const audio = new SoundStudio();

function clearGameLoops() {
  if (state.timer) window.clearTimeout(state.timer);
  if (state.raf) cancelAnimationFrame(state.raf);
  state.timer = null;
  state.raf = null;
  speechSynthesis?.cancel?.();
}

function toast(message, kind = "good") {
  const el = document.createElement("div");
  el.className = `game-toast ${kind}`;
  el.textContent = message;
  toastLayer.append(el);
  setTimeout(() => el.remove(), 1700);
}

function burst(x = 50, y = 50, color = "#ffd54a") {
  const layer = document.createElement("div");
  layer.className = "burst-layer";
  layer.style.setProperty("--x", `${x}%`);
  layer.style.setProperty("--y", `${y}%`);
  layer.style.setProperty("--burst", color);
  layer.innerHTML = Array.from({ length: 18 }, (_, i) => `<i style="--i:${i}"></i>`).join("");
  document.body.append(layer);
  setTimeout(() => layer.remove(), 900);
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

function header(title = "English Town") {
  return `<header class="game-header">
    <button class="round-button back-button" data-action="home" aria-label="На главную">${ICONS.back}</button>
    <div class="mini-logo"><span>ENGLISH</span><strong>${title}</strong></div>
    <div class="hud-pill spark-hud">${ICONS.spark}<strong data-spark-count>${progress.sparks}</strong></div>
    <button class="round-button sound-button ${progress.sound ? "" : "is-muted"}" data-action="sound" aria-label="Включить или выключить звук">${ICONS.sound}</button>
  </header>`;
}

function renderHeaderState() {
  document.querySelectorAll("[data-spark-count]").forEach((el) => { el.textContent = progress.sparks; });
  document.querySelectorAll(".sound-button").forEach((el) => el.classList.toggle("is-muted", !progress.sound));
}

function renderStart() {
  clearGameLoops();
  state.screen = "start";
  app.innerHTML = `<main class="sound-gate">
    <div class="gate-sky"><i></i><i></i><i></i></div>
    <div class="gate-copy">
      <div class="logo-chip">АНГЛИЙСКИЙ ПО ШАГАМ С НУЛЯ</div>
      <h1><span>ENGLISH TOWN</span><strong>ADVENTURES</strong></h1>
      <p>Три мира. Три приключения. Английский, в который хочется играть.</p>
      <button class="power-button" data-action="enter-world">
        <span class="power-icon">${ICONS.play}</span>
        <span><b>ВОЙТИ В ИГРУ</b><small>со звуком и музыкой</small></span>
      </button>
    </div>
    <div class="gate-portal" aria-hidden="true"><i></i><i></i><i></i></div>
    <img class="gate-hero gate-leo" src="${hero("leo")}" alt="Leo">
    <img class="gate-hero gate-mia" src="${hero("mia")}" alt="Mia">
    <img class="gate-hero gate-penny" src="${hero("penny")}" alt="Penny">
    <img class="gate-hero gate-archie" src="${hero("archie")}" alt="Archie">
    <div class="gate-floor"></div>
  </main>`;
}

function sceneArt(type) {
  if (type === "greeting") return `<div class="mini-scene greeting-art"><span class="house h1"></span><span class="house h2"></span><span class="street-lamp"></span><span class="speech-orb">HELLO!</span></div>`;
  if (type === "runner") return `<div class="mini-scene runner-art"><span class="speed-line s1"></span><span class="speed-line s2"></span><span class="number-token n1">2</span><span class="number-token n2">5</span><span class="number-token n3">6</span></div>`;
  return `<div class="mini-scene paint-art"><span class="paint-cloud c1"></span><span class="paint-cloud c2"></span><span class="paint-cloud c3"></span><span class="blaster-beam"></span></div>`;
}

function renderHome() {
  clearGameLoops();
  state.screen = "home";
  app.innerHTML = `<main class="world-home">
    ${header("ADVENTURES")}
    <div class="world-sky"><span class="cloud cloud-a"></span><span class="cloud cloud-b"></span><span class="cloud cloud-c"></span></div>
    <section class="world-intro">
      <p class="eyebrow">ВЫБЕРИ ПРИКЛЮЧЕНИЕ</p>
      <h1>Куда отправимся?</h1>
      <p>Каждый мир — новая игровая механика и новый уровень сложности.</p>
    </section>
    <div class="adventure-map">
      <svg class="map-path" viewBox="0 0 1000 540" preserveAspectRatio="none" aria-hidden="true"><path d="M85 390 C220 210 300 465 470 295 S710 110 905 250"/><path class="path-glow" d="M85 390 C220 210 300 465 470 295 S710 110 905 250"/></svg>
      <button class="world-stop stop-greeting" data-game="greeting">
        <span class="stop-number">01</span>${sceneArt("greeting")}
        <span class="stop-copy"><small>БРОДИЛКА • 3 УРОВНЯ</small><strong>Hello City</strong><em>Знакомься с героями</em></span>
        <span class="stop-status">${progress.badges.includes("greeting") ? "МИССИЯ ПРОЙДЕНА" : "НАЧАТЬ МИССИЮ"}</span>
      </button>
      <button class="world-stop stop-runner" data-game="runner">
        <span class="stop-number">02</span>${sceneArt("runner")}
        <span class="stop-copy"><small>ЭКШЕН-РАННЕР • 3 УРОВНЯ</small><strong>Number Rush</strong><em>Лови цифры 1–6</em></span>
        <span class="stop-status">${progress.badges.includes("runner") ? "МИССИЯ ПРОЙДЕНА" : "НАЧАТЬ МИССИЮ"}</span>
      </button>
      <button class="world-stop stop-paint" data-game="paint">
        <span class="stop-number">03</span>${sceneArt("paint")}
        <span class="stop-copy"><small>МЕТКИЙ БЛАСТЕР • 3 УРОВНЯ</small><strong>Color Blaster</strong><em>Верни городу цвета</em></span>
        <span class="stop-status">${progress.badges.includes("paint") ? "МИССИЯ ПРОЙДЕНА" : "НАЧАТЬ МИССИЮ"}</span>
      </button>
      <img class="map-hero map-archie" src="${hero("archie")}" alt="Archie">
      <img class="map-hero map-penny" src="${hero("penny")}" alt="Penny">
      <img class="map-hero map-mia" src="${hero("mia")}" alt="Mia">
    </div>
    <div class="reward-dock"><span class="reward-crystal">${ICONS.spark}</span><div><small>НАГРАДА ЗА ИГРЫ</small><strong>Искры, серии и значки миров</strong></div></div>
  </main>`;
}

const greetingMissions = [
  { npc: "mia", x: 27, scene: "morning", prompt: "Ты встретил Mia утром", phrase: "Good morning!", choices: ["Good night!", "Good morning!", "Goodbye!"] },
  { npc: "penny", x: 67, scene: "day", prompt: "Penny машет тебе лапой", phrase: "Hello!", choices: ["Hello!", "Goodbye!", "My name is Penny."] },
  { npc: "archie", x: 88, scene: "day", prompt: "Поздоровайся коротко и дружелюбно", phrase: "Hi!", choices: ["Nice to meet you!", "Hi!", "Good afternoon!"] },
  { npc: "mia", x: 53, scene: "afternoon", prompt: "Уже день. Поприветствуй Mia", phrase: "Good afternoon!", choices: ["Good morning!", "Good afternoon!", "Goodbye!"] },
  { npc: "penny", x: 19, scene: "afternoon", prompt: "Спроси, как зовут нового друга", phrase: "What's your name?", chunks: ["What's", "your", "name?"] },
  { npc: "archie", x: 78, scene: "sunset", prompt: "Archie отвечает полным предложением", phrase: "My name is Archie.", chunks: ["My", "name", "is", "Archie."] },
  { npc: "mia", x: 35, scene: "sunset", prompt: "Представься коротко", phrase: "I'm Leo.", chunks: ["I'm", "Leo."] },
  { npc: "penny", x: 73, scene: "night", prompt: "Скажи: «Приятно познакомиться»", phrase: "Nice to meet you!", chunks: ["Nice", "to", "meet", "you!"] },
  { npc: "archie", x: 45, scene: "night", prompt: "Пора уходить. Попрощайся", phrase: "Goodbye!", chunks: ["Goodbye!"] },
];

function greetingLevel(index) {
  if (index < 3) return { n: 1, name: "Узнай фразу" };
  if (index < 6) return { n: 2, name: "Ответь в диалоге" };
  return { n: 3, name: "Собери сам" };
}

function startGreeting() {
  state.greeting = { mission: 0, x: 8, build: [], score: 0, moving: false };
  renderGreeting();
}

function renderGreeting() {
  clearGameLoops();
  state.screen = "greeting";
  const g = state.greeting;
  if (g.mission >= greetingMissions.length) return renderFinish("greeting", "МАСТЕР ОБЩЕНИЯ", "Ты открыл все фразы Hello City!", g.score);
  const mission = greetingMissions[g.mission];
  const level = greetingLevel(g.mission);
  app.innerHTML = `<main class="game-shell greeting-game ${mission.scene}">
    ${header("HELLO CITY")}
    <div class="mission-bar">
      <div><small>УРОВЕНЬ ${level.n}</small><strong>${level.name}</strong></div>
      <div class="mission-progress">${greetingMissions.map((_, i) => `<i class="${i < g.mission ? "done" : i === g.mission ? "now" : ""}"></i>`).join("")}</div>
    </div>
    <section class="walk-world" style="--player-x:${g.x};--target-x:${mission.x};--camera:${Math.max(0, g.x - 48)}">
      <div class="city-layer city-back"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="city-layer city-front"><span class="shop shop-a"><b>HELLO CAFE</b></span><span class="shop shop-b"><b>WORD LAB</b></span><span class="park-tree t1"></span><span class="park-tree t2"></span></div>
      <div class="street"><span></span></div>
      <div class="quest-beacon"><i></i><b>TALK</b></div>
      <img class="npc-character" src="${hero(mission.npc)}" alt="${mission.npc}">
      <div class="npc-name">${mission.npc.toUpperCase()}</div>
      <img class="player-character" src="${hero("leo")}" alt="Leo">
      <div class="player-shadow"></div>
      <button class="talk-button" data-action="talk" disabled>${ICONS.sound}<span>ПОГОВОРИТЬ</span></button>
    </section>
    <div class="walk-controls">
      <button data-move="-1" aria-label="Идти влево">${ICONS.back}</button>
      <div class="walk-hint"><b>Дойди до героя</b><span>Стрелки ← → или кнопки</span></div>
      <button class="right" data-move="1" aria-label="Идти вправо">${ICONS.back}</button>
    </div>
  </main>`;
  bindWalkControls();
  updateWalkPosition();
}

function bindWalkControls() {
  document.querySelectorAll("[data-move]").forEach((button) => {
    let interval;
    const stop = () => { clearInterval(interval); state.greeting.moving = false; document.querySelector(".player-character")?.classList.remove("is-running"); };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      stepWalk(Number(button.dataset.move));
      interval = setInterval(() => stepWalk(Number(button.dataset.move)), 90);
    });
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointerleave", stop);
    button.addEventListener("pointercancel", stop);
  });
}

function stepWalk(direction) {
  if (state.screen !== "greeting" || document.querySelector(".dialogue-panel")) return;
  state.greeting.x = Math.max(4, Math.min(94, state.greeting.x + direction * 2.3));
  const player = document.querySelector(".player-character");
  player?.classList.add("is-running");
  player?.classList.toggle("face-left", direction < 0);
  if (Math.round(state.greeting.x) % 6 === 0) audio.sfx("move");
  updateWalkPosition();
}

function updateWalkPosition() {
  const world = document.querySelector(".walk-world");
  if (!world || !state.greeting) return;
  const mission = greetingMissions[state.greeting.mission];
  world.style.setProperty("--player-x", state.greeting.x);
  world.style.setProperty("--camera", Math.max(0, state.greeting.x - 48));
  const near = Math.abs(state.greeting.x - mission.x) < 7;
  const talk = document.querySelector(".talk-button");
  if (talk) talk.disabled = !near;
  world.classList.toggle("is-near", near);
}

function openDialogue() {
  const g = state.greeting;
  const mission = greetingMissions[g.mission];
  audio.sfx("talk");
  audio.speak(mission.phrase);
  const panel = document.createElement("div");
  panel.className = "dialogue-panel";
  const level = greetingLevel(g.mission);
  const answerArea = mission.chunks
    ? `<div class="phrase-build"><div class="build-line" data-build-line><span>Собери фразу</span></div><div class="word-bank">${[...mission.chunks].sort(() => Math.random() - 0.5).map((word) => `<button data-word="${word}">${word}</button>`).join("")}</div></div>`
    : `<div class="dialogue-choices">${mission.choices.map((choice) => `<button data-answer="${choice}">${choice}<span>${ICONS.play}</span></button>`).join("")}</div>`;
  panel.innerHTML = `<div class="dialogue-card"><button class="listen-phrase" data-speak="${mission.phrase}" aria-label="Послушать">${ICONS.sound}</button><small>МИССИЯ ${g.mission + 1} • УРОВЕНЬ ${level.n}</small><h2>${mission.prompt}</h2>${answerArea}</div>`;
  document.querySelector(".greeting-game").append(panel);
}

function greetingAnswer(answer, button) {
  const mission = greetingMissions[state.greeting.mission];
  if (answer === mission.phrase) {
    button.classList.add("correct");
    completeGreetingMission();
  } else {
    button.classList.add("wrong");
    audio.sfx("wrong");
    toast("Почти! Послушай фразу ещё раз", "try");
    audio.speak(mission.phrase);
    setTimeout(() => button.classList.remove("wrong"), 550);
  }
}

function greetingWord(word, button) {
  const g = state.greeting;
  const mission = greetingMissions[g.mission];
  const expected = mission.chunks[g.build.length];
  if (word !== expected) {
    audio.sfx("wrong");
    button.classList.add("wrong");
    setTimeout(() => button.classList.remove("wrong"), 450);
    return;
  }
  audio.sfx("tap");
  g.build.push(word);
  button.disabled = true;
  button.classList.add("used");
  const line = document.querySelector("[data-build-line]");
  line.innerHTML = g.build.map((chunk) => `<b>${chunk}</b>`).join("");
  if (g.build.length === mission.chunks.length) completeGreetingMission();
}

function completeGreetingMission() {
  const g = state.greeting;
  const phrase = greetingMissions[g.mission].phrase;
  g.score += 1;
  addSparks(10);
  audio.sfx("correct");
  audio.speak(phrase);
  burst(50, 44);
  toast(`+10 искр • ${phrase}`);
  g.mission += 1;
  g.build = [];
  state.timer = setTimeout(renderGreeting, 1050);
}

const numberWords = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX"];

function startRunner() {
  clearGameLoops();
  state.runner = { wave: 0, lane: 1, distance: 0, last: 0, active: false, score: 0, combo: 0, sequence: [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5), gates: [] };
  prepareRunnerWave();
}

function runnerLevel(wave) {
  if (wave < 2) return { n: 1, name: "Цифра + слово", hint: "Смотри и слушай" };
  if (wave < 4) return { n: 2, name: "Только слово", hint: "Вспомни цифру" };
  return { n: 3, name: "На слух", hint: "Слушай команду" };
}

function prepareRunnerWave() {
  clearGameLoops();
  const r = state.runner;
  state.screen = "runner";
  if (r.wave >= 6) return renderFinish("runner", "КОРОЛЕВА СКОРОСТИ", "Penny собрала все числа от 1 до 6!", r.score);
  const target = r.sequence[r.wave];
  const wrong = [1, 2, 3, 4, 5, 6].filter((n) => n !== target).sort(() => Math.random() - 0.5).slice(0, 2);
  r.gates = [target, ...wrong].sort(() => Math.random() - 0.5);
  r.distance = -2;
  r.active = false;
  const level = runnerLevel(r.wave);
  const targetDisplay = level.n === 1 ? `<strong>${target}</strong><b>${numberWords[target - 1]}</b>` : level.n === 2 ? `<b>${numberWords[target - 1]}</b>` : `<span class="listen-waves">${ICONS.sound}</span><b>LISTEN!</b>`;
  app.innerHTML = `<main class="game-shell runner-game">
    ${header("NUMBER RUSH")}
    <div class="mission-bar runner-mission"><div><small>УРОВЕНЬ ${level.n}</small><strong>${level.name}</strong></div><div class="runner-score"><span>СЕРИЯ</span><b>${r.combo}</b></div></div>
    <section class="runner-world">
      <div class="runner-sky"><span></span><span></span><span></span></div>
      <div class="runner-city"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="target-command"><small>ПОЙМАЙ</small>${targetDisplay}<button data-action="repeat-number" aria-label="Повторить">${ICONS.sound}</button></div>
      <div class="speed-road"><div class="road-lines"></div>
        ${r.gates.map((number, lane) => `<div class="number-gate lane-${lane}" data-gate><span>${number}</span><div class="gate-pips">${Array.from({ length: number }, () => "<i></i>").join("")}</div></div>`).join("")}
        <div class="runner-avatar lane-pos-${r.lane}"><span class="runner-aura"></span><img src="${hero("penny")}" alt="Penny"></div>
      </div>
      <div class="runner-start-panel"><span>${ICONS.play}</span><h2>${level.hint}</h2><p>Перестраивай Penny между тремя дорожками</p><button data-action="runner-go">СТАРТ!</button></div>
    </section>
    <div class="lane-controls"><button data-lane-move="-1">${ICONS.back}<span>ВЛЕВО</span></button><div>${r.wave + 1}<small>/ 6</small></div><button class="right" data-lane-move="1"><span>ВПРАВО</span>${ICONS.back}</button></div>
  </main>`;
  state.timer = setTimeout(() => audio.speak(numberWords[target - 1]), 250);
}

function moveLane(direction) {
  const r = state.runner;
  if (!r || state.screen !== "runner") return;
  const old = r.lane;
  r.lane = Math.max(0, Math.min(2, r.lane + direction));
  if (old === r.lane) return;
  audio.sfx("whoosh");
  const avatar = document.querySelector(".runner-avatar");
  if (avatar) avatar.className = `runner-avatar lane-pos-${r.lane} is-dodging`;
}

function runRunner() {
  const r = state.runner;
  if (!r || r.active) return;
  audio.sfx("correct");
  r.active = true;
  r.last = performance.now();
  document.querySelector(".runner-start-panel")?.classList.add("is-gone");
  document.querySelector(".runner-world")?.classList.add("is-running");
  const target = r.sequence[r.wave];
  audio.speak(numberWords[target - 1]);
  state.raf = requestAnimationFrame(runnerFrame);
}

function runnerFrame(now) {
  const r = state.runner;
  if (!r?.active || state.screen !== "runner") return;
  const dt = Math.min(32, now - r.last);
  r.last = now;
  r.distance += dt * 0.032;
  const scale = 0.5 + Math.max(0, r.distance) / 100 * 0.95;
  document.querySelectorAll("[data-gate]").forEach((gate) => {
    gate.style.setProperty("--gate-y", `${r.distance}%`);
    gate.style.setProperty("--gate-scale", scale);
  });
  if (r.distance >= 83) return collideRunner();
  state.raf = requestAnimationFrame(runnerFrame);
}

function collideRunner() {
  const r = state.runner;
  r.active = false;
  const chosen = r.gates[r.lane];
  const target = r.sequence[r.wave];
  const gate = document.querySelector(`.number-gate.lane-${r.lane}`);
  if (chosen === target) {
    r.score += 1;
    r.combo += 1;
    addSparks(12 + Math.min(8, r.combo * 2));
    gate?.classList.add("gate-correct");
    document.querySelector(".runner-avatar")?.classList.add("is-jumping");
    audio.sfx("correct");
    burst(50, 66, "#67f5ff");
    toast(`Верно: ${target} — ${numberWords[target - 1]}!`);
  } else {
    r.combo = 0;
    gate?.classList.add("gate-wrong");
    audio.sfx("wrong");
    toast(`Это ${numberWords[chosen - 1]}. Нужна ${numberWords[target - 1]}`, "try");
  }
  r.wave += 1;
  state.timer = setTimeout(prepareRunnerWave, 1200);
}

const colors = [
  { name: "RED", hex: "#ff416c" }, { name: "BLUE", hex: "#27b6ff" },
  { name: "YELLOW", hex: "#ffd63d" }, { name: "GREEN", hex: "#49d17d" },
  { name: "PURPLE", hex: "#9b5cff" }, { name: "ORANGE", hex: "#ff8a32" },
];

function startPaint() {
  state.paint = { round: 0, score: 0, combo: 0, order: [...colors].sort(() => Math.random() - 0.5), locked: false };
  preparePaintRound();
}

function paintLevel(round) {
  if (round < 2) return { n: 1, name: "Слово + цвет" };
  if (round < 4) return { n: 2, name: "Только слово" };
  return { n: 3, name: "Команда на слух" };
}

function preparePaintRound() {
  clearGameLoops();
  const p = state.paint;
  state.screen = "paint";
  if (p.round >= 6) return renderFinish("paint", "ПОВЕЛИТЕЛЬ ЦВЕТА", "Mia вернула English Town все краски!", p.score);
  p.locked = false;
  const target = p.order[p.round];
  const decoys = colors.filter((c) => c.name !== target.name).sort(() => Math.random() - 0.5).slice(0, 2);
  const drones = [target, ...decoys].sort(() => Math.random() - 0.5);
  const level = paintLevel(p.round);
  const command = level.n === 1
    ? `<b style="--command-color:${target.hex}">${target.name}</b><i style="background:${target.hex}"></i>`
    : level.n === 2 ? `<b>${target.name}</b>` : `<span>${ICONS.sound}</span><b>LISTEN!</b>`;
  app.innerHTML = `<main class="game-shell paint-game">
    ${header("COLOR BLASTER")}
    <div class="mission-bar paint-mission"><div><small>УРОВЕНЬ ${level.n}</small><strong>${level.name}</strong></div><div class="runner-score"><span>СЕРИЯ</span><b>${p.combo}</b></div></div>
    <section class="paint-arena" data-paint-arena>
      <div class="paint-space"><i></i><i></i><i></i><i></i></div>
      <div class="paint-command"><small>НАЙДИ ЦВЕТ</small><div>${command}</div><button data-action="repeat-color">${ICONS.sound}</button></div>
      <div class="drone-field">
        ${drones.map((color, index) => `<button class="color-drone drone-${index}" data-color-target="${color.name}" style="--drone-color:${color.hex};--delay:${index * -0.7}s" aria-label="${color.name}"><span class="drone-wing left"></span><span class="drone-body"><i></i><b></b></span><span class="drone-wing right"></span><em></em></button>`).join("")}
      </div>
      <div class="mia-platform"><span class="platform-ring"></span><img src="${hero("mia")}" alt="Mia"><div class="blaster-glow"></div></div>
      <div class="crosshair" aria-hidden="true"><i></i></div>
      <div class="paint-tip"><b>НАВЕДИ И ВЫСТРЕЛИ</b><span>Нажми на правильную цветовую сферу</span></div>
    </section>
    <div class="paint-rounds">${colors.map((_, i) => `<i class="${i < p.round ? "done" : i === p.round ? "now" : ""}"></i>`).join("")}</div>
  </main>`;
  const arena = document.querySelector("[data-paint-arena]");
  arena?.addEventListener("pointermove", (event) => {
    const rect = arena.getBoundingClientRect();
    arena.style.setProperty("--aim-x", `${event.clientX - rect.left}px`);
    arena.style.setProperty("--aim-y", `${event.clientY - rect.top}px`);
  });
  state.timer = setTimeout(() => audio.speak(target.name), 300);
}

function shootColor(button) {
  const p = state.paint;
  if (!p || p.locked) return;
  const target = p.order[p.round];
  const chosen = button.dataset.colorTarget;
  audio.sfx("shot");
  const arena = document.querySelector("[data-paint-arena]");
  const a = arena.getBoundingClientRect();
  const b = button.getBoundingClientRect();
  const shot = document.createElement("i");
  shot.className = "paint-shot";
  shot.style.setProperty("--shot-color", colors.find((c) => c.name === chosen).hex);
  shot.style.setProperty("--sx", "20%");
  shot.style.setProperty("--sy", "72%");
  shot.style.setProperty("--tx", `${b.left + b.width / 2 - a.left}px`);
  shot.style.setProperty("--ty", `${b.top + b.height / 2 - a.top}px`);
  arena.append(shot);
  setTimeout(() => shot.remove(), 520);
  document.querySelector(".mia-platform img")?.classList.add("is-firing");
  setTimeout(() => document.querySelector(".mia-platform img")?.classList.remove("is-firing"), 350);
  if (chosen === target.name) {
    p.locked = true;
    p.score += 1;
    p.combo += 1;
    addSparks(12 + Math.min(8, p.combo * 2));
    button.classList.add("drone-hit");
    audio.sfx("correct");
    burst(50, 38, target.hex);
    toast(`${target.name}! Точное попадание!`);
    p.round += 1;
    state.timer = setTimeout(preparePaintRound, 1150);
  } else {
    p.combo = 0;
    button.classList.add("drone-miss");
    audio.sfx("wrong");
    toast(`Это ${chosen}. Ищи ${target.name}`, "try");
    audio.speak(target.name);
    setTimeout(() => button.classList.remove("drone-miss"), 600);
  }
}

function renderFinish(id, title, text, score) {
  clearGameLoops();
  state.screen = "finish";
  awardBadge(id);
  addSparks(50);
  audio.sfx("finish");
  const stars = score >= 6 ? 3 : score >= 4 ? 2 : 1;
  app.innerHTML = `<main class="finish-screen finish-${id}">
    ${header("MISSION COMPLETE")}
    <div class="finish-rays"></div>
    <section class="finish-card">
      <div class="badge-orbit"><i></i><i></i><i></i><span>${ICONS.spark}</span></div>
      <small>НОВЫЙ ЗНАЧОК МИРА</small>
      <h1>${title}</h1>
      <p>${text}</p>
      <div class="finish-stars">${[1, 2, 3].map((n) => `<span class="${n <= stars ? "won" : ""}">${ICONS.spark}</span>`).join("")}</div>
      <div class="finish-reward"><b>+50</b><span>бонусных искр</span></div>
      <div class="finish-actions"><button class="ghost-button" data-action="replay" data-game="${id}">ЕЩЁ РАЗ</button><button class="power-button compact" data-action="home"><span>НА КАРТУ</span>${ICONS.play}</button></div>
    </section>
    <img class="finish-hero" src="${hero(id === "runner" ? "penny" : id === "paint" ? "mia" : "archie")}" alt="Герой игры">
  </main>`;
  burst(50, 45, id === "paint" ? "#ff55be" : "#65f4ff");
}

function routeGame(id) {
  audio.sfx("tap");
  if (id === "greeting") startGreeting();
  if (id === "runner") startRunner();
  if (id === "paint") startPaint();
}

app.addEventListener("click", async (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  const game = event.target.closest("[data-game]")?.dataset.game;
  const answer = event.target.closest("[data-answer]");
  const word = event.target.closest("[data-word]");
  const speak = event.target.closest("[data-speak]");
  const colorTarget = event.target.closest("[data-color-target]");
  const laneMove = event.target.closest("[data-lane-move]");

  if (action === "enter-world") { await audio.unlock(); audio.sfx("finish"); renderHome(); return; }
  if (action === "home") { audio.sfx("tap"); renderHome(); return; }
  if (action === "sound") { await audio.unlock(); audio.toggle(); return; }
  if (action === "talk") { openDialogue(); return; }
  if (action === "runner-go") { runRunner(); return; }
  if (action === "repeat-number") { audio.speak(numberWords[state.runner.sequence[state.runner.wave] - 1]); return; }
  if (action === "repeat-color") { audio.speak(state.paint.order[state.paint.round].name); return; }
  if (action === "replay") { routeGame(event.target.closest("[data-game]").dataset.game); return; }
  if (game) { routeGame(game); return; }
  if (answer) { greetingAnswer(answer.dataset.answer, answer); return; }
  if (word) { greetingWord(word.dataset.word, word); return; }
  if (speak) { audio.speak(speak.dataset.speak); audio.sfx("talk"); return; }
  if (laneMove) { moveLane(Number(laneMove.dataset.laneMove)); return; }
  if (colorTarget) shootColor(colorTarget);
});

window.addEventListener("keydown", (event) => {
  if (state.screen === "greeting" && ["ArrowLeft", "ArrowRight", "a", "d"].includes(event.key)) {
    event.preventDefault();
    stepWalk(["ArrowLeft", "a"].includes(event.key) ? -1 : 1);
  }
  if (state.screen === "runner" && ["ArrowLeft", "ArrowRight", "a", "d"].includes(event.key)) {
    event.preventDefault();
    moveLane(["ArrowLeft", "a"].includes(event.key) ? -1 : 1);
  }
  if (state.screen === "runner" && (event.key === " " || event.key === "Enter")) runRunner();
  if (state.screen === "greeting" && event.key === "Enter" && !document.querySelector(".talk-button")?.disabled) openDialogue();
});

renderStart();
