import "./styles.css";

(() => {
  "use strict";

  const APP_KEY = "englishTownProfileV1";
  const app = document.querySelector("#app");
  const toastLayer = document.querySelector("#toast-layer");

  const HEROES = {
    archie: "assets/characters/archie.png",
    leo: "assets/characters/leo.png",
    penny: "assets/characters/penny.png",
    mia: "assets/characters/mia.png",
  };

  const COLORS = {
    red: "#EF4444",
    blue: "#2878E3",
    yellow: "#F7C928",
    green: "#2EAD62",
    orange: "#F28C28",
    purple: "#8B5BD6",
  };

  const GAME_META = {
    greeting: {
      title: "First Meeting",
      fullTitle: "English Town: First Meeting",
      subtitle: "Познакомься с героями и сам веди разговор",
      icon: "💬",
      hero: "leo",
      className: "meet",
      badge: "friendship",
      badgeName: "Friendship Badge",
      reward: "Праздничная эмоция Mia",
      levels: [
        ["Choose a Greeting", "Приветствия по ситуации и времени суток"],
        ["Names & Introductions", "Вопрос об имени и ответы"],
        ["Build the Conversation", "Собери английские фразы"],
        ["Mystery Guest", "Полный разговор без подсказок"],
      ],
    },
    number: {
      title: "Number Dash",
      fullTitle: "Penny’s Number Dash",
      subtitle: "Беги, слушай и собирай числа от 1 до 6",
      icon: "🔢",
      hero: "penny",
      className: "number",
      badge: "number",
      badgeName: "Number Badge",
      reward: "Новый бантик для Penny",
      levels: [
        ["Hear & Choose", "Услышь число и выбери ворота"],
        ["Count & Collect", "Собери точное количество предметов"],
        ["Listen, Count, Decide", "Считай и отвечай без текста"],
        ["Number Dash", "Большая финальная трасса"],
      ],
    },
    color: {
      title: "Color Lab",
      fullTitle: "Archie’s Color Lab",
      subtitle: "Раскрашивай, сортируй и создавай новые цвета",
      icon: "🎨",
      hero: "archie",
      className: "color",
      badge: "rainbow",
      badgeName: "Rainbow Badge",
      reward: "Новая футболка для Archie",
      levels: [
        ["Find the Color", "Узнай шесть цветов"],
        ["Paint the Object", "Раскрась предмет по команде"],
        ["Sort & Mix", "Сортируй и смешивай краски"],
        ["Save the Rainbow", "Оформи сцену для фестиваля"],
      ],
    },
  };

  const praise = ["Great!", "Well done!", "Excellent!"];

  const SHOP_ITEMS = [
    { id: "penny-bow", icon: "🎀", name: "Бантик Penny", cost: 15 },
    { id: "archie-scarf", icon: "🧣", name: "Шарф Archie", cost: 20 },
    { id: "leo-cap", icon: "🧢", name: "Кепка Leo", cost: 25 },
    { id: "mia-clip", icon: "🌸", name: "Заколка Mia", cost: 25 },
    { id: "sky-frame", icon: "☁️", name: "Небесный фон профиля", cost: 30 },
    { id: "town-lights", icon: "🏮", name: "Фонарики English Town", cost: 35 },
  ];

  const greetingTasks = [
    [
      choice("G1-01", "Choose a morning greeting.", ["Good morning", "Goodbye", "Good afternoon"], "Good morning", "09:00 · У школы", "Посмотри на часы: сейчас утро.", "Первая часть ответа — Good...", "mia"),
      choice("G1-02", "Choose an afternoon greeting.", ["Hi", "Good morning", "Good afternoon"], "Good afternoon", "14:00 · В парке", "Сейчас уже после полудня.", "Выбери фразу со словом afternoon.", "leo"),
      choice("G1-03", "Choose a short friendly greeting.", ["Hi", "Goodbye", "Good afternoon"], "Hi", "Archie радостно встречает друга", "Нужна очень короткая дружеская фраза.", "Она начинается на H.", "archie"),
      choice("G1-04", "Choose a greeting.", ["Hello", "Bye", "Nice to meet you"], "Hello", "Penny впервые подходит к Leo", "Penny только пришла.", "Выбери универсальное приветствие.", "penny"),
      choice("G1-05", "Good ...", ["afternoon", "morning", "bye"], "morning", "08:30 · Mia встречает Penny", "На часах утро.", "Good morning.", "mia"),
      choice("G1-06", "Good ...", ["name", "afternoon", "morning"], "afternoon", "15:00 · Leo встречает Archie", "Это дневная встреча.", "Good afternoon.", "leo"),
      choice("G1-07", "What does Archie say?", ["Hi!", "Bye!", "Goodbye!"], "Hi!", "Archie приходит, а не уходит", "Нужно поздороваться.", "Короткое приветствие — Hi!", "archie"),
      choice("G1-08", "Tap the greeting.", ["Hello!", "Goodbye!", "My name is Penny."], "Hello!", "Penny машет лапой при встрече", "Это начало встречи.", "Универсальное приветствие — Hello!", "penny"),
    ],
    [
      choice("G2-01", "Mia: “What’s your name?”", ["I’m Leo.", "Good afternoon.", "Goodbye."], "I’m Leo.", "Ответь за Leo", "Mia спрашивает имя.", "Короткий ответ начинается с I’m...", "mia"),
      choice("G2-02", "Leo wants to know Mia’s name.", ["What’s your name?", "My name is Leo.", "Nice to meet you."], "What’s your name?", "Задай вопрос", "Нужно спросить, а не представиться.", "Вопрос начинается с What’s...", "leo"),
      choice("G2-03", "Answer for Penny.", ["My name is Penny.", "Hi, Leo.", "Good morning."], "My name is Penny.", "What’s your name?", "Penny должна назвать себя.", "My name is...", "penny"),
      choice("G2-04", "Introduce Archie.", ["I’m Archie.", "What’s your name?", "Bye, Archie."], "I’m Archie.", "Короткое представление", "Archie называет своё имя.", "I’m...", "archie"),
      choice("G2-05", "Mia: “I’m Mia.”", ["Nice to meet you!", "What’s your name?", "Good afternoon."], "Nice to meet you!", "Ответь после знакомства", "Вы уже узнали имя Mia.", "Скажи, что рад знакомству.", "mia"),
      choice("G2-06", "Choose the same meaning: “My name is Leo.”", ["I’m Leo.", "Hi, Leo.", "What’s your name?"], "I’m Leo.", "Найди равную по смыслу фразу", "Leo должен назвать себя.", "Короткая форма начинается с I’m.", "leo"),
      choice("G2-07", "Penny wants to introduce herself.", ["My name is Penny.", "Your name is Penny.", "What’s Penny?"], "My name is Penny.", "Выбери правильную реплику", "Говорящий использует слово My.", "My name is Penny.", "penny"),
      choice("G2-08", "Archie: “What’s your name?”", ["I’m Mia.", "I’m Archie.", "Nice to Mia."], "I’m Mia.", "Ответь за Mia", "Посмотри, кто отвечает.", "Mia говорит I’m Mia.", "archie"),
    ],
    [
      build("G3-01", "Build a greeting.", ["Hello"], ["Hello"], "Leo приветствует Mia", "Начни с приветствия.", "Нажми Hello.", "leo"),
      build("G3-02", "Build a morning greeting.", ["morning", "Good"], ["Good", "morning"], "09:00", "Первым идёт Good.", "Good morning.", "mia"),
      build("G3-03", "Build an afternoon greeting.", ["afternoon", "Good"], ["Good", "afternoon"], "14:00", "Первым идёт Good.", "Good afternoon.", "leo"),
      build("G3-04", "Ask the name.", ["your", "What’s", "name"], ["What’s", "your", "name"], "Leo знакомится с Mia", "Вопрос начинается с What’s.", "What’s your name?", "leo"),
      build("G3-05", "Mia says her name.", ["is", "My", "Mia", "name"], ["My", "name", "is", "Mia"], "Собери полную фразу", "Первое слово — My.", "My name is Mia.", "mia"),
      build("G3-06", "Penny says her name.", ["Penny", "I’m", "My"], ["I’m", "Penny"], "Одна карточка лишняя", "Начни с I’m.", "I’m Penny. Слово My лишнее.", "penny"),
      build("G3-07", "Finish the introduction.", ["meet", "to", "you", "Nice", "name"], ["Nice", "to", "meet", "you"], "Одна карточка лишняя", "Начни с Nice.", "Nice to meet you. Слово name лишнее.", "archie"),
      build("G3-08", "Say goodbye informally.", ["Bye", "Hello", "name"], ["Bye"], "Две карточки лишние", "Нужна одна короткая фраза.", "Нажми Bye.", "mia"),
    ],
    [
      choice("GF-01", "Choose a morning greeting.", ["Good afternoon!", "Good morning!", "Goodbye!"], "Good morning!", "09:00 · Mia появляется у школы", "Посмотри на время.", "Morning — утро.", "mia"),
      choice("GF-02", "Mia: “I’m Mia.”", ["Nice to meet you!", "Bye!", "What’s your name?"], "Nice to meet you!", "Продолжи знакомство", "Имя уже названо.", "Скажи, что рад знакомству.", "mia"),
      build("GF-03", "Ask Leo’s name.", ["name", "your", "What’s"], ["What’s", "your", "name"], "Появляется незнакомый Leo", "Это вопрос.", "What’s your name?", "leo"),
      choice("GF-04", "Leo: “What’s your name?”", ["My name is {name}.", "Good afternoon.", "Nice to name you."], "My name is {name}.", "Ответь от своего имени", "Назови себя.", "My name is...", "leo"),
      choice("GF-05", "Choose an afternoon greeting.", ["Good morning!", "Good afternoon!", "Goodbye!"], "Good afternoon!", "14:00 · Появляется Penny", "Посмотри на время.", "Afternoon — день после полудня.", "penny"),
      choice("GF-06", "Everyone is leaving. What do you say?", ["Hello!", "Goodbye!", "What’s your name?"], ["Goodbye!", "Bye!"], "Фестиваль заканчивается", "Герои уходят.", "Нужно попрощаться.", "archie"),
    ],
  ];

  const numberTasks = [
    [
      gate("N1-01", "One", ["1", "2", "4"], "1"),
      gate("N1-02", "Two", ["5", "2", "3"], "2"),
      gate("N1-03", "Three", ["3", "6", "1"], "3"),
      gate("N1-04", "Four", ["2", "4", "5"], "4"),
      gate("N1-05", "Five", ["6", "3", "5"], "5"),
      gate("N1-06", "Six", ["4", "1", "6"], "6"),
      gate("N1-07", "Two", ["TWO", "FIVE", "SIX"], "TWO"),
      gate("N1-08", "Five", ["FOUR", "ONE", "FIVE"], "FIVE"),
    ],
    [
      collect("N2-01", "Collect one ball.", "⚽", 1, 3),
      collect("N2-02", "Collect two bones.", "🦴", 2, 4),
      collect("N2-03", "Collect three stars.", "⭐", 3, 5),
      collect("N2-04", "Collect four apples.", "🍎", 4, 6),
      collect("N2-05", "Collect five tickets.", "🎟️", 5, 6),
      collect("N2-06", "Collect six balloons.", "🎈", 6, 6),
      collect("N2-07", "Collect two balls.", "⚽", 2, 4, ["🦴", "🦴"]),
      collect("N2-08", "Collect five stars.", "⭐", 5, 6, ["🎟️", "🎟️"]),
    ],
    [
      visualChoice("N3-01", "Find three.", ["🦴 🦴", "🦴 🦴 🦴", "🦴 🦴 🦴 🦴 🦴"], "🦴 🦴 🦴", "Посчитай косточки.", "В правильной группе три предмета."),
      visualChoice("N3-02", "Find six.", ["⭐ ⭐ ⭐ ⭐", "⭐", "⭐ ⭐ ⭐ ⭐ ⭐ ⭐"], "⭐ ⭐ ⭐ ⭐ ⭐ ⭐", "Посчитай звёзды.", "Выбери группу из шести."),
      visualChoice("N3-03", "How many?", ["3", "4", "6"], "4", "На поляне четыре яблока.", "Ответ — four.", "🍎 🍎 🍎 🍎"),
      visualChoice("N3-04", "How many?", ["TWO", "FIVE", "ONE"], "TWO", "На поляне два мяча.", "Ответ — two.", "⚽ ⚽"),
      visualChoice("N3-05", "Four", ["🎟️ 🎟️ 🎟️ 🎟️", "⭐ ⭐ ⭐ ⭐ ⭐", "⚽ ⚽"], "🎟️ 🎟️ 🎟️ 🎟️", "Считай по одному.", "Найди четыре предмета."),
      visualChoice("N3-06", "How many balloons?", ["4", "5", "6"], "6", "Посчитай все шары.", "Ответ — six.", "🎈 🎈 🎈 🎈 🎈 🎈"),
      visualChoice("N3-07", "1, 2, _, 4", ["5", "3", "6"], "3", "Какое число стоит между 2 и 4?", "Ответ — three."),
      visualChoice("N3-08", "3, 4, 5, _", ["2", "6", "1"], "6", "Продолжи счёт.", "После five идёт six."),
    ],
    [
      gate("NF-01", "Three", ["5", "3", "1"], "3"),
      collect("NF-02", "Collect five stars.", "⭐", 5, 6, ["🎈"]),
      visualChoice("NF-03", "How many balloons?", ["FOUR", "TWO", "SIX"], "FOUR", "Посчитай шары.", "Ответ — four.", "🎈 🎈 🎈 🎈"),
      visualChoice("NF-04", "1, 2, 3, _, 5, 6", ["2", "4", "6"], "4", "Найди пропущенное число.", "Между 3 и 5 стоит 4."),
      visualChoice("NF-05", "Six", ["🦴 🦴 🦴", "🦴 🦴 🦴 🦴 🦴 🦴", "🦴 🦴"], "🦴 🦴 🦴 🦴 🦴 🦴", "Посчитай косточки.", "Выбери шесть."),
      { id: "NF-06", kind: "order", prompt: "Build the Number Train.", audio: "One, two, three, four, five, six.", items: ["4", "1", "6", "2", "5", "3"], correct: ["1", "2", "3", "4", "5", "6"], hint1: "Начни с 1.", hint2: "Порядок: 1, 2, 3, 4, 5, 6." },
    ],
  ];

  const colorTasks = [
    [
      colorChoice("C1-01", "Find red.", ["red", "blue", "yellow"], "red"),
      colorChoice("C1-02", "Find blue.", ["green", "blue", "orange"], "blue"),
      colorChoice("C1-03", "Find yellow.", ["purple", "red", "yellow"], "yellow"),
      colorChoice("C1-04", "Find green.", ["orange", "green", "blue"], "green"),
      colorChoice("C1-05", "Find orange.", ["yellow", "purple", "orange"], "orange"),
      colorChoice("C1-06", "Find purple.", ["purple", "green", "red"], "purple"),
      colorSequence("C1-07", "Tap blue, then yellow.", ["blue", "yellow"]),
      colorSequence("C1-08", "Tap red, then green.", ["red", "green"]),
    ],
    [
      paint("C2-01", "Make the balloon red.", [{ id: "balloon", label: "balloon", emoji: "🎈", target: "red" }]),
      paint("C2-02", "Make the car blue.", [{ id: "car", label: "car", emoji: "🚗", target: "blue" }]),
      paint("C2-03", "Make the star yellow.", [{ id: "star", label: "star", emoji: "⭐", target: "yellow" }]),
      paint("C2-04", "Make the tree green.", [{ id: "tree", label: "tree", emoji: "🌳", target: "green" }]),
      paint("C2-05", "Make the kite orange.", [{ id: "kite", label: "kite", emoji: "🪁", target: "orange" }]),
      paint("C2-06", "Make the hat purple.", [{ id: "hat", label: "hat", emoji: "🎩", target: "purple" }]),
      paint("C2-07", "Make the ball red and the star yellow.", [{ id: "ball", label: "ball", emoji: "⚽", target: "red" }, { id: "star", label: "star", emoji: "⭐", target: "yellow" }]),
      paint("C2-08", "Make the car blue and the kite orange.", [{ id: "car", label: "car", emoji: "🚗", target: "blue" }, { id: "kite", label: "kite", emoji: "🪁", target: "orange" }]),
    ],
    [
      sortTask("C3-01", "Put the red apples in the red box.", "red", [item("🍎", "red"), item("🍏", "green"), item("🍎", "red"), item("⭐", "yellow"), item("🍎", "red")]),
      sortTask("C3-02", "Put the blue balls in the blue box.", "blue", [item("⚽", "blue"), item("⚽", "red"), item("⭐", "yellow"), item("⚽", "blue")], "⚽"),
      sortTask("C3-03", "Find three yellow stars.", "yellow", [item("⭐", "yellow"), item("⭐", "blue"), item("⭐", "yellow"), item("🎈", "yellow"), item("⭐", "yellow")], "⭐"),
      sortTask("C3-04", "Find two green balloons.", "green", [item("🎈", "green"), item("🎈", "red"), item("🎈", "green"), item("⭐", "green")], "🎈"),
      mix("C3-05", "Mix red and yellow.", ["red", "yellow"], "orange"),
      mix("C3-06", "Mix blue and yellow.", ["blue", "yellow"], "green"),
      mix("C3-07", "Mix red and blue.", ["red", "blue"], "purple"),
      pattern("C3-08", "red, blue, red, blue, _", ["green", "red", "yellow"], "red"),
    ],
    [
      paint("CF-01", "Make the star yellow.", [{ id: "star", label: "star", emoji: "⭐", target: "yellow" }]),
      paint("CF-02", "Make the balloons red and blue.", [{ id: "balloon1", label: "balloon", emoji: "🎈", target: "red" }, { id: "balloon2", label: "balloon", emoji: "🎈", target: "blue" }]),
      sortTask("CF-03", "Put the green balls in the green box.", "green", [item("⚽", "green"), item("⭐", "green"), item("⚽", "red"), item("⚽", "green")], "⚽"),
      mix("CF-04", "Mix red and yellow.", ["red", "yellow"], "orange"),
      pattern("CF-05", "purple, yellow, purple, yellow, _", ["purple", "blue", "orange"], "purple"),
      { id: "CF-06", kind: "colorOrder", prompt: "Restore the rainbow bridge.", audio: "Red, orange, yellow, green, blue, purple.", items: ["blue", "yellow", "red", "purple", "green", "orange"], correct: ["red", "orange", "yellow", "green", "blue", "purple"], hint1: "Начни с red.", hint2: "Red, orange, yellow, green, blue, purple." },
    ],
  ];

  function choice(id, prompt, options, correct, context, hint1, hint2, hero) {
    return { id, kind: "choice", prompt, audio: prompt, options, correct, context, hint1, hint2, hero };
  }

  function build(id, prompt, words, correct, context, hint1, hint2, hero) {
    return { id, kind: "build", prompt, audio: correct.join(" "), words, correct, context, hint1, hint2, hero };
  }

  function gate(id, audio, options, correct) {
    return { id, kind: "gate", prompt: "Listen and choose!", audio, options, correct, hint1: "Послушай число ещё раз.", hint2: `Найди ${correct}.` };
  }

  function collect(id, prompt, symbol, targetCount, available, distractors = []) {
    return { id, kind: "collect", prompt, audio: prompt, symbol, targetCount, available, distractors, hint1: "Нажимай только на нужные предметы.", hint2: `Нужно выбрать ровно ${targetCount}.` };
  }

  function visualChoice(id, prompt, options, correct, hint1, hint2, visual = "") {
    return { id, kind: "visualChoice", prompt, audio: prompt, options, correct, visual, hint1, hint2 };
  }

  function colorChoice(id, prompt, options, correct) {
    return { id, kind: "colorChoice", prompt, audio: prompt, options, correct, hint1: "Послушай название ещё раз.", hint2: `Выбери ${correct}.` };
  }

  function colorSequence(id, prompt, correct) {
    return { id, kind: "colorSequence", prompt, audio: prompt, correct, hint1: `Первый цвет — ${correct[0]}.`, hint2: `Порядок: ${correct.join(", ")}.` };
  }

  function paint(id, prompt, objects) {
    return { id, kind: "paint", prompt, audio: prompt, objects, hint1: "Сначала выбери краску, затем предмет.", hint2: `Нужные цвета: ${objects.map((o) => o.target).join(", ")}.` };
  }

  function item(emoji, color) {
    return { emoji, color };
  }

  function sortTask(id, prompt, targetColor, items, targetEmoji = "🍎") {
    return { id, kind: "sort", prompt, audio: prompt, targetColor, targetEmoji, items, hint1: `Ищи только ${targetColor}.`, hint2: "Нажми на все подходящие предметы." };
  }

  function mix(id, prompt, ingredients, result) {
    return { id, kind: "mix", prompt, audio: prompt, ingredients, result, hint1: `Первый цвет — ${ingredients[0]}.`, hint2: `${ingredients.join(" + ")} = ${result}.` };
  }

  function pattern(id, prompt, options, correct) {
    return { id, kind: "pattern", prompt, audio: prompt.replaceAll(",", ", "), options, correct, hint1: "Посмотри, как повторяется узор.", hint2: `Следующий цвет — ${correct}.` };
  }

  let profile = loadProfile();
  let view = profile ? { name: "home" } : { name: "onboarding" };
  let session = null;
  let taskState = {};
  let inputLocked = false;

  function createProfile(name) {
    return {
      name,
      hearts: 0,
      coins: 0,
      muted: false,
      levels: { greeting: 0, number: 0, color: 0 },
      best: {},
      badges: [],
      inventory: [],
      mistakes: {},
      history: [],
      festivalSeen: false,
      createdAt: new Date().toISOString(),
    };
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem(APP_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      return {
        ...createProfile(saved.name || "Player"),
        ...saved,
        levels: { greeting: 0, number: 0, color: 0, ...(saved.levels || {}) },
        best: saved.best || {},
        badges: saved.badges || [],
        inventory: saved.inventory || [],
        mistakes: saved.mistakes || {},
        history: saved.history || [],
      };
    } catch (error) {
      console.warn("Could not load profile", error);
      return null;
    }
  }

  function saveProfile() {
    if (!profile) return;
    localStorage.setItem(APP_KEY, JSON.stringify(profile));
  }

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function personalize(value) {
    return String(value).replaceAll("{name}", profile?.name || "Player");
  }

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function topbar() {
    if (!profile) return "";
    return `
      <header class="topbar">
        <button class="profile-pill" id="open-profile" aria-label="Открыть профиль ${esc(profile.name)}">
          <span class="profile-avatar ${avatarTier(profile.hearts)}">${esc(profile.name.slice(0, 1).toUpperCase())}</span>
          <span class="profile-name">${esc(profile.name)}</span>
        </button>
        <button class="brand-mark" id="go-home" aria-label="На главную">
          <strong>English Town</strong><span>Speak English!</span>
        </button>
        <div class="top-stats">
          <span class="stat-pill" title="Сердца"><span>💗</span><span>${profile.hearts}</span><span class="stat-label">сердец</span></span>
          <span class="stat-pill" title="English Coins"><span>🪙</span><span>${profile.coins}</span></span>
          <button class="icon-button" id="toggle-sound" aria-label="${profile.muted ? "Включить звук" : "Выключить звук"}">${profile.muted ? "🔇" : "🔊"}</button>
        </div>
      </header>`;
  }

  function bindTopbar() {
    document.querySelector("#open-profile")?.addEventListener("click", () => navigate("profile"));
    document.querySelector("#go-home")?.addEventListener("click", () => navigate("home"));
    document.querySelector("#toggle-sound")?.addEventListener("click", () => {
      profile.muted = !profile.muted;
      window.speechSynthesis?.cancel();
      saveProfile();
      render();
    });
  }

  function navigate(name, params = {}) {
    window.speechSynthesis?.cancel();
    inputLocked = false;
    view = { name, ...params };
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function render() {
    if (view.name === "onboarding") return renderOnboarding();
    if (view.name === "home") return renderHome();
    if (view.name === "levels") return renderLevels(view.game);
    if (view.name === "play") return renderPlay();
    if (view.name === "profile") return renderProfile();
    if (view.name === "freepaint") return renderFreePaint();
    return renderHome();
  }

  function renderOnboarding() {
    app.innerHTML = `
      <main class="onboarding">
        <section class="onboarding-card">
          <div class="onboarding-copy">
            <span class="logo-kicker">✨ Английский по шагам с нуля</span>
            <p class="eyebrow">Добро пожаловать</p>
            <h1>Welcome to<br>English Town!</h1>
            <p class="lead">Три приключения, четыре друга и твой первый уверенный английский.</p>
            <form class="name-form" id="name-form">
              <label for="student-name">Как тебя зовут?</label>
              <div class="name-row">
                <input id="student-name" maxlength="24" autocomplete="nickname" placeholder="Напиши имя" required />
                <button class="primary-button" type="submit">Начать →</button>
              </div>
            </form>
          </div>
          <div class="hero-collage" aria-label="Penny, Archie, Leo и Mia">
            <img class="collage-penny" src="${HEROES.penny}" alt="Penny" />
            <img class="collage-archie" src="${HEROES.archie}" alt="Archie" />
            <img class="collage-mia" src="${HEROES.mia}" alt="Mia" />
            <img class="collage-leo" src="${HEROES.leo}" alt="Leo" />
          </div>
        </section>
      </main>`;

    document.querySelector("#name-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.querySelector("#student-name").value.trim();
      if (!name) return;
      profile = createProfile(name);
      saveProfile();
      showToast(`Hello, ${name}!`);
      navigate("home");
    });
  }

  function renderHome() {
    const cards = Object.entries(GAME_META).map(([key, meta], index) => {
      const hearts = totalBestHearts(key);
      return `
        <article class="game-card ${meta.className}">
          <div class="game-card-content">
            <span class="game-number">${index + 1}</span>
            <h3>${esc(meta.fullTitle)}</h3>
            <p>${esc(meta.subtitle)}</p>
            <span class="card-score">💗 ${hearts}/12</span>
          </div>
          <img class="game-card-hero" src="${HEROES[meta.hero]}" alt="${esc(meta.title)}" />
          <button class="primary-button open-game" data-game="${key}">Играть →</button>
        </article>`;
    }).join("");

    app.innerHTML = `
      <div class="app-shell">
        ${topbar()}
        <main class="page">
          <header class="home-heading">
            <div>
              <p class="eyebrow">Твоя карта приключений</p>
              <h1>Hello, ${esc(profile.name)}!</h1>
              <p class="lead">Выбирай локацию — каждый герой приготовил свою игру.</p>
            </div>
            ${allBadgesEarned() ? '<button class="secondary-button" id="open-festival">🌈 Rainbow Festival</button>' : ""}
          </header>
          <section class="map-grid" aria-label="Игры English Town">${cards}</section>
        </main>
      </div>`;
    bindTopbar();
    document.querySelectorAll(".open-game").forEach((button) => button.addEventListener("click", () => navigate("levels", { game: button.dataset.game })));
    document.querySelector("#open-festival")?.addEventListener("click", showFestival);
  }

  function totalBestHearts(game) {
    return [0, 1, 2, 3].reduce((sum, level) => sum + (profile.best[`${game}-${level}`] || 0), 0);
  }

  function renderLevels(game) {
    const meta = GAME_META[game];
    const unlocked = profile.levels[game] || 0;
    const cards = meta.levels.map(([title, description], index) => {
      const locked = index > unlocked;
      const hearts = profile.best[`${game}-${index}`] || 0;
      return `
        <article class="level-card ${locked ? "locked" : ""}">
          <span class="level-node">${locked ? "🔒" : index + 1}</span>
          <h3>${esc(title)}</h3>
          <p>${esc(description)}</p>
          <div class="level-hearts" aria-label="${hearts} из 3 сердец">${"💗".repeat(hearts)}${"♡".repeat(3 - hearts)}</div>
          <button class="${locked ? "secondary-button" : "primary-button"} start-level" data-level="${index}" ${locked ? "disabled" : ""}>
            ${locked ? "Сначала прошлый уровень" : hearts ? "Играть снова" : "Начать"}
          </button>
        </article>`;
    }).join("");

    app.innerHTML = `
      <div class="app-shell">
        ${topbar()}
        <main class="page">
          <header class="level-header">
            <button class="back-button" id="back-home" aria-label="Назад">←</button>
            <div><p class="eyebrow">${esc(meta.icon)} ${esc(meta.title)}</p><h2>${esc(meta.fullTitle)}</h2><p class="lead">${esc(meta.subtitle)}</p></div>
          </header>
          <section class="levels-path">${cards}</section>
          ${game === "color" && profile.badges.includes("rainbow") ? '<div style="margin-top:24px;text-align:center"><button class="secondary-button" id="free-paint">🎨 Открыть свободную мастерскую</button></div>' : ""}
        </main>
      </div>`;
    bindTopbar();
    document.querySelector("#back-home").addEventListener("click", () => navigate("home"));
    document.querySelectorAll(".start-level:not(:disabled)").forEach((button) => button.addEventListener("click", () => startSession(game, Number(button.dataset.level))));
    document.querySelector("#free-paint")?.addEventListener("click", () => navigate("freepaint"));
  }

  function startSession(game, level) {
    const banks = game === "greeting" ? greetingTasks : game === "number" ? numberTasks : colorTasks;
    const difficult = banks[level].filter((task) => (profile.mistakes[task.id] || 0) > 0);
    const priority = level < 3 && difficult.length ? [shuffle(difficult)[0]] : [];
    const rest = banks[level].filter((task) => !priority.includes(task));
    const tasks = level === 3 ? [...banks[level]] : [...priority, ...shuffle(rest).slice(0, 6 - priority.length)];
    session = {
      game,
      level,
      tasks,
      index: 0,
      attempts: 0,
      firstTry: 0,
      hintsUsed: 0,
      coins: 0,
      taskAttempts: 0,
      hintStage: 0,
      streak: 0,
    };
    resetTaskState();
    navigate("play");
  }

  function resetTaskState() {
    taskState = {
      selected: new Set(),
      words: [],
      order: [],
      colorSequence: [],
      chosenColor: null,
      paints: {},
      mix: [],
    };
    if (session) {
      session.taskAttempts = 0;
      session.hintStage = 0;
    }
  }

  function currentTask() {
    return session.tasks[session.index];
  }

  function renderPlay() {
    const task = currentTask();
    const meta = GAME_META[session.game];
    const progress = (session.index / session.tasks.length) * 100;
    const stageClass = session.game === "greeting" ? "meet-stage" : session.game === "number" ? "runner-stage" : "lab-stage";

    app.innerHTML = `
      <div class="app-shell">
        ${topbar()}
        <main class="page play-page">
          <div class="game-hud">
            <button class="back-button" id="exit-session" aria-label="Выйти из задания">←</button>
            <div class="progress-wrap">
              <span class="progress-label">${session.index + 1} / ${session.tasks.length}</span>
              <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
            </div>
            <span class="session-coins">🪙 +${session.coins}</span>
          </div>
          <section class="game-stage ${stageClass} ${String(task.context || "").includes("14:") || String(task.context || "").includes("15:") ? "afternoon" : ""}">
            ${renderTask(task)}
          </section>
        </main>
      </div>`;

    bindTopbar();
    bindTask(task);
    document.querySelector("#exit-session").addEventListener("click", () => {
      if (window.confirm("Выйти на экран уровней? Текущая сессия не сохранится.")) navigate("levels", { game: session.game });
    });
    setTimeout(() => speak(task.audio || task.prompt), 260);
  }

  function renderTask(task) {
    if (session.game === "greeting") return renderGreetingTask(task);
    if (session.game === "number") return renderNumberTask(task);
    return renderColorTask(task);
  }

  function characterBlock(heroName = "leo") {
    const hintStage = session?.hintStage || 0;
    const activeTask = session ? currentTask() : null;
    const line = hintStage && activeTask ? (hintStage === 1 ? activeTask.hint1 : activeTask.hint2) : "You can do it!";
    return `<div class="stage-character"><img src="${HEROES[heroName]}" alt="${heroName}"><div class="speech-bubble">${esc(line)}</div></div>`;
  }

  function taskHeading(task, label) {
    const listeningMode = session.streak >= 2 && session.level >= 1 && session.hintStage === 0;
    return `
      <div class="task-topline">
        <div><div class="task-kicker">${esc(label)}</div><div class="task-prompt">${listeningMode ? "Listen carefully!" : esc(personalize(task.prompt))}</div>${listeningMode ? '<small>Задание звучит без текстовой подсказки</small>' : ""}</div>
        <button class="icon-button replay-audio" aria-label="Повторить английскую фразу">🔊</button>
      </div>
      ${task.context ? `<div class="scene-context"><span class="time-chip">🕒 ${esc(task.context)}</span></div>` : ""}`;
  }

  function hintMarkup() {
    if (!session.hintStage) return "";
    const text = session.hintStage === 1 ? currentTask().hint1 : currentTask().hint2;
    return `<div class="hint-box">💡 <span>${esc(text)}</span></div>`;
  }

  function renderGreetingTask(task) {
    const hero = task.hero || GAME_META.greeting.hero;
    let interaction = "";
    if (task.kind === "choice") interaction = answerButtons(task.options);
    if (task.kind === "build") {
      interaction = `
        <div class="build-zone" aria-label="Собранная фраза">${taskState.words.length ? taskState.words.map((word, index) => `<button class="word-chip remove-word" data-index="${index}">${esc(word)}</button>`).join("") : "<span class='lead'>Нажимай на слова по порядку…</span>"}</div>
        <div class="word-bank">${task.words.map((word, index) => `<button class="word-chip add-word ${taskState.selected.has(index) ? "used" : ""}" data-index="${index}">${esc(word)}</button>`).join("")}</div>
        <div class="button-row"><button class="primary-button check-action">Проверить</button><button class="ghost-button clear-action">Очистить</button></div>`;
    }
    return `${characterBlock(hero)}<div class="task-panel">${taskHeading(task, session.level === 3 ? "Final conversation" : "Speak English")}${interaction}${hintMarkup()}</div>`;
  }

  function answerButtons(options, swatches = false) {
    if (!taskState.optionOrder) taskState.optionOrder = shuffle(options);
    return `<div class="answer-grid">${taskState.optionOrder.map((value) => {
      const clean = personalize(value);
      const swatch = swatches ? `style="border-left:16px solid ${COLORS[value]}"` : "";
      return `<button class="answer-card choose-answer" data-answer="${esc(clean)}" ${swatch}>${esc(clean)}</button>`;
    }).join("")}</div>`;
  }

  function renderNumberTask(task) {
    if (task.kind === "gate") {
      return `<div class="runner-wrap">
        <div class="runner-sky">${taskHeading(task, "Number Dash")}${hintMarkup()}</div>
        <div class="road"><div class="lanes">${task.options.map((option, index) => `<button class="gate choose-gate" data-answer="${esc(option)}" data-lane="${index}">${esc(option)}</button>`).join("")}</div><img class="runner-character" id="runner-character" src="${HEROES.penny}" alt="Penny"></div>
      </div>`;
    }

    let interaction = "";
    if (task.kind === "collect") {
      const items = [...Array(task.available).fill(task.symbol), ...task.distractors];
      if (!taskState.items) taskState.items = shuffle(items);
      interaction = `<div class="collect-field">${taskState.items.map((symbol, index) => `<button class="collectible toggle-item ${taskState.selected.has(index) ? "selected" : ""}" data-index="${index}" aria-pressed="${taskState.selected.has(index)}">${symbol}</button>`).join("")}</div><div class="button-row"><button class="primary-button check-action">Проверить</button><button class="ghost-button clear-action">Очистить</button></div>`;
    } else if (task.kind === "visualChoice") {
      interaction = `${task.visual ? `<div class="count-scene">${task.visual}</div>` : ""}${answerButtons(task.options)}`;
    } else if (task.kind === "order") {
      interaction = `<div class="order-zone">${taskState.order.length ? taskState.order.map((value, index) => `<button class="train-car remove-order" data-index="${index}">${value}</button>`).join("") : "Собери поезд 1–6"}</div><div class="word-bank">${task.items.map((value, index) => `<button class="train-car add-order ${taskState.selected.has(index) ? "used" : ""}" data-index="${index}">${value}</button>`).join("")}</div><div class="button-row"><button class="primary-button check-action">Запустить поезд</button><button class="ghost-button clear-action">Очистить</button></div>`;
    }
    return `${characterBlock("penny")}<div class="task-panel">${taskHeading(task, session.level === 3 ? "Final track" : "Count in English")}${interaction}${hintMarkup()}</div>`;
  }

  function renderColorTask(task) {
    let interaction = "";
    if (task.kind === "colorChoice") interaction = answerButtons(task.options, true);
    if (task.kind === "colorSequence") {
      interaction = `<div class="rainbow-zone">${taskState.colorSequence.map((color) => `<span class="rainbow-piece" style="--piece-color:${COLORS[color]}">${color}</span>`).join("")}</div>${colorPalette()}<div class="button-row"><button class="primary-button check-action">Проверить</button><button class="ghost-button clear-action">Очистить</button></div>`;
    }
    if (task.kind === "paint") {
      interaction = `<div class="lab-workbench"><div class="paint-objects">${task.objects.map((object) => `<button class="paint-object apply-paint" data-object="${object.id}" style="background:${taskState.paints[object.id] ? COLORS[taskState.paints[object.id]] : "#e8edf0"}"><span>${object.emoji}<small class="paint-label">${object.label}</small></span></button>`).join("")}</div></div>${colorPalette()}<div class="button-row"><button class="primary-button check-action">Проверить заказ</button></div>`;
    }
    if (task.kind === "sort") {
      interaction = `<div class="lab-workbench"><div class="sort-items">${task.items.map((object, index) => `<button class="sort-item toggle-sort ${taskState.selected.has(index) ? "selected" : ""}" data-index="${index}" style="--item-color:${COLORS[object.color]}" aria-pressed="${taskState.selected.has(index)}">${object.emoji}</button>`).join("")}</div><div class="sort-box" style="--box-color:${COLORS[task.targetColor]}">${task.targetColor} box · ${taskState.selected.size}</div></div><div class="button-row"><button class="primary-button check-action">Проверить сортировку</button><button class="ghost-button clear-action">Очистить</button></div>`;
    }
    if (task.kind === "mix") {
      interaction = `<div class="lab-workbench"><div class="mix-bowl"><div class="mix-slot" style="--slot-color:${taskState.mix[0] ? COLORS[taskState.mix[0]] : "#f1eef7"}">${taskState.mix[0] || "color 1"}</div><span class="mix-plus">+</span><div class="mix-slot" style="--slot-color:${taskState.mix[1] ? COLORS[taskState.mix[1]] : "#f1eef7"}">${taskState.mix[1] || "color 2"}</div></div></div>${colorPalette()}<div class="button-row"><button class="primary-button check-action">Смешать</button><button class="ghost-button clear-action">Очистить</button></div>`;
    }
    if (task.kind === "pattern") interaction = `<div class="rainbow-zone">${task.prompt.split(",").map((color) => color.trim() === "_" ? `<span class="rainbow-piece">?</span>` : `<span class="rainbow-piece" style="--piece-color:${COLORS[color.trim()]}">${color.trim()}</span>`).join("")}</div>${answerButtons(task.options, true)}`;
    if (task.kind === "colorOrder") {
      interaction = `<div class="rainbow-zone">${taskState.order.map((color, index) => `<button class="rainbow-piece remove-order" data-index="${index}" style="--piece-color:${COLORS[color]}">${color}</button>`).join("")}</div><div class="palette">${task.items.map((color, index) => `<button class="paint-pot add-order ${taskState.selected.has(index) ? "used" : ""}" data-index="${index}" style="--pot-color:${COLORS[color]}"><span>${color}</span></button>`).join("")}</div><div class="button-row"><button class="primary-button check-action">Зажечь радугу</button><button class="ghost-button clear-action">Очистить</button></div>`;
    }
    return `${characterBlock("archie")}<div class="task-panel">${taskHeading(task, session.level === 3 ? "Festival order" : "Color magic")}${interaction}${hintMarkup()}</div>`;
  }

  function colorPalette() {
    return `<div class="palette">${Object.keys(COLORS).map((color) => `<button class="paint-pot select-color ${taskState.chosenColor === color ? "selected" : ""}" data-color="${color}" style="--pot-color:${COLORS[color]}"><span>${color}</span></button>`).join("")}</div>`;
  }

  function bindTask(task) {
    document.querySelector(".replay-audio")?.addEventListener("click", () => speak(task.audio || task.prompt));
    document.querySelectorAll(".choose-answer").forEach((button) => button.addEventListener("click", () => checkDirect(button.dataset.answer, button)));
    document.querySelectorAll(".choose-gate").forEach((button) => button.addEventListener("click", () => {
      const runner = document.querySelector("#runner-character");
      if (runner) runner.style.left = `${[30, 50, 70][Number(button.dataset.lane)]}%`;
      setTimeout(() => checkDirect(button.dataset.answer, button), 240);
    }));
    if (task.kind === "gate") {
      taskState.runnerLane = Number.isInteger(taskState.runnerLane) ? taskState.runnerLane : 1;
      app.onkeydown = (event) => {
        if (!["ArrowLeft", "ArrowRight", "Enter"].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "ArrowLeft") taskState.runnerLane = Math.max(0, taskState.runnerLane - 1);
        if (event.key === "ArrowRight") taskState.runnerLane = Math.min(2, taskState.runnerLane + 1);
        const gates = [...document.querySelectorAll(".choose-gate")];
        const runner = document.querySelector("#runner-character");
        if (runner) runner.style.left = `${[30, 50, 70][taskState.runnerLane]}%`;
        gates[taskState.runnerLane]?.focus();
        if (event.key === "Enter") gates[taskState.runnerLane]?.click();
      };
      const road = document.querySelector(".road");
      let touchStart = 0;
      road?.addEventListener("touchstart", (event) => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
      road?.addEventListener("touchend", (event) => {
        const distance = event.changedTouches[0].clientX - touchStart;
        if (Math.abs(distance) < 35) return;
        taskState.runnerLane = Math.max(0, Math.min(2, taskState.runnerLane + (distance > 0 ? 1 : -1)));
        const gates = [...document.querySelectorAll(".choose-gate")];
        const runner = document.querySelector("#runner-character");
        if (runner) runner.style.left = `${[30, 50, 70][taskState.runnerLane]}%`;
        gates[taskState.runnerLane]?.focus();
      }, { passive: true });
    } else {
      app.onkeydown = null;
    }
    document.querySelectorAll(".add-word").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      taskState.selected.add(index);
      taskState.words.push(task.words[index]);
      renderPlay();
    }));
    document.querySelectorAll(".remove-word").forEach((button) => button.addEventListener("click", () => {
      const position = Number(button.dataset.index);
      const word = taskState.words[position];
      const sourceIndex = task.words.findIndex((entry, index) => entry === word && taskState.selected.has(index));
      if (sourceIndex >= 0) taskState.selected.delete(sourceIndex);
      taskState.words.splice(position, 1);
      renderPlay();
    }));
    document.querySelectorAll(".toggle-item, .toggle-sort").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      if (taskState.selected.has(index)) taskState.selected.delete(index); else taskState.selected.add(index);
      renderPlay();
    }));
    document.querySelectorAll(".select-color").forEach((button) => button.addEventListener("click", () => {
      const color = button.dataset.color;
      if (task.kind === "colorSequence") taskState.colorSequence.push(color);
      else if (task.kind === "mix") { if (taskState.mix.length < 2) taskState.mix.push(color); }
      else taskState.chosenColor = color;
      renderPlay();
    }));
    document.querySelectorAll(".apply-paint").forEach((button) => button.addEventListener("click", () => {
      if (!taskState.chosenColor) { showToast("Сначала выбери краску 🎨"); return; }
      taskState.paints[button.dataset.object] = taskState.chosenColor;
      renderPlay();
    }));
    document.querySelectorAll(".add-order").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      taskState.selected.add(index);
      taskState.order.push(task.items[index]);
      renderPlay();
    }));
    document.querySelectorAll(".remove-order").forEach((button) => button.addEventListener("click", () => {
      const position = Number(button.dataset.index);
      const value = taskState.order[position];
      const sourceIndex = task.items.findIndex((entry, index) => entry === value && taskState.selected.has(index));
      if (sourceIndex >= 0) taskState.selected.delete(sourceIndex);
      taskState.order.splice(position, 1);
      renderPlay();
    }));
    document.querySelector(".check-action")?.addEventListener("click", () => checkConstructed(task));
    document.querySelector(".clear-action")?.addEventListener("click", () => {
      taskState.selected.clear();
      taskState.words = [];
      taskState.order = [];
      taskState.colorSequence = [];
      taskState.mix = [];
      renderPlay();
    });
  }

  function checkDirect(value, element) {
    if (inputLocked) return;
    const task = currentTask();
    const valid = Array.isArray(task.correct)
      ? task.correct.map(personalize).includes(value)
      : personalize(task.correct) === value;
    if (valid) {
      element?.classList.add("correct");
      successTask();
    } else {
      element?.classList.add("try-again");
      failTask();
    }
  }

  function checkConstructed(task) {
    let valid = false;
    if (task.kind === "build") valid = arraysEqual(taskState.words, task.correct);
    if (task.kind === "collect") {
      const picked = [...taskState.selected].map((index) => taskState.items[index]);
      valid = picked.length === task.targetCount && picked.every((symbol) => symbol === task.symbol);
    }
    if (task.kind === "order" || task.kind === "colorOrder") valid = arraysEqual(taskState.order, task.correct);
    if (task.kind === "colorSequence") valid = arraysEqual(taskState.colorSequence, task.correct);
    if (task.kind === "paint") valid = task.objects.every((object) => taskState.paints[object.id] === object.target);
    if (task.kind === "sort") {
      const correctIndexes = task.items.map((object, index) => ({ object, index })).filter(({ object }) => object.color === task.targetColor && object.emoji === task.targetEmoji).map(({ index }) => index);
      valid = arraysEqual([...taskState.selected].sort((a, b) => a - b), correctIndexes);
    }
    if (task.kind === "mix") valid = [...taskState.mix].sort().join("|") === [...task.ingredients].sort().join("|");
    valid ? successTask() : failTask();
  }

  function arraysEqual(a, b) {
    return a.length === b.length && a.every((value, index) => value === b[index]);
  }

  function successTask() {
    if (inputLocked) return;
    inputLocked = true;
    const first = session.taskAttempts === 0;
    if (first) session.firstTry += 1;
    session.streak = first ? session.streak + 1 : 0;
    const solvedId = currentTask().id;
    if (first && profile.mistakes[solvedId]) {
      profile.mistakes[solvedId] -= 1;
      if (profile.mistakes[solvedId] <= 0) delete profile.mistakes[solvedId];
    }
    let earned = 1 + (first ? 1 : 0) + (session.level >= 2 && session.hintStage === 0 ? 1 : 0);
    session.coins += earned;
    profile.coins += earned;
    saveProfile();
    const line = praise[Math.floor(Math.random() * praise.length)];
    speak(line);
    showToast(`${line}  +${earned} 🪙`);
    setTimeout(() => {
      session.index += 1;
      inputLocked = false;
      if (session.index >= session.tasks.length) completeSession();
      else { resetTaskState(); renderPlay(); }
    }, 720);
  }

  function failTask() {
    if (inputLocked) return;
    session.attempts += 1;
    session.taskAttempts += 1;
    session.streak = 0;
    profile.mistakes[currentTask().id] = (profile.mistakes[currentTask().id] || 0) + 1;
    saveProfile();
    session.hintStage = Math.min(2, session.hintStage + 1);
    session.hintsUsed += 1;
    speak("Try again!");
    showToast("Try again! 💡");
    setTimeout(renderPlay, 420);
  }

  function completeSession() {
    const total = session.tasks.length;
    const percentage = Math.round((session.firstTry / total) * 100);
    const hearts = percentage === 100 && session.hintsUsed === 0 ? 3 : percentage >= 75 ? 2 : 1;
    const key = `${session.game}-${session.level}`;
    profile.hearts += hearts;
    profile.best[key] = Math.max(profile.best[key] || 0, hearts);
    profile.levels[session.game] = Math.min(3, Math.max(profile.levels[session.game], session.level + 1));

    let newBadge = false;
    const meta = GAME_META[session.game];
    if (session.level === 3 && !profile.badges.includes(meta.badge)) {
      profile.badges.push(meta.badge);
      newBadge = true;
    }
    profile.history.unshift({
      date: new Date().toISOString(),
      game: session.game,
      level: session.level,
      percentage,
      hearts,
      coins: session.coins,
      tasks: session.tasks.map((task) => task.id),
    });
    profile.history = profile.history.slice(0, 40);
    saveProfile();
    renderResult({ hearts, percentage, newBadge });
  }

  function renderResult(result) {
    const meta = GAME_META[session.game];
    const allDone = allBadgesEarned();
    app.insertAdjacentHTML("beforeend", `
      <div class="result-overlay" role="dialog" aria-modal="true" aria-labelledby="result-title">
        <section class="result-card">
          <img class="result-hero" src="${HEROES[meta.hero]}" alt="${meta.title}">
          <p class="eyebrow">Уровень завершён</p>
          <h2 id="result-title">${result.percentage === 100 ? "Excellent!" : result.percentage >= 75 ? "Well done!" : "Great try!"}</h2>
          <div class="earned-hearts" aria-label="Получено ${result.hearts} сердца">${"💗".repeat(result.hearts)}</div>
          <p class="lead">С первой попытки выполнено ${result.percentage}% заданий.</p>
          <div class="reward-strip">
            <span class="reward-chip">🪙 +${session.coins} English Coins</span>
            ${result.newBadge ? `<span class="reward-chip">🏅 ${meta.badgeName}</span><span class="reward-chip">🎁 ${meta.reward}</span>` : ""}
          </div>
          <div class="button-row" style="justify-content:center">
            <button class="primary-button" id="result-continue">Продолжить</button>
            <button class="secondary-button" id="result-replay">Повторить</button>
            ${allDone ? '<button class="secondary-button" id="result-festival">🌈 Фестиваль</button>' : ""}
          </div>
        </section>
      </div>`);
    if (result.hearts === 3 || result.newBadge) confetti();
    document.querySelector("#result-continue").addEventListener("click", () => navigate("levels", { game: session.game }));
    document.querySelector("#result-replay").addEventListener("click", () => startSession(session.game, session.level));
    document.querySelector("#result-festival")?.addEventListener("click", showFestival);
  }

  function renderProfile() {
    const tier = Math.min(20, Math.floor(profile.hearts / 5));
    const nextAt = tier < 20 ? (tier + 1) * 5 : null;
    const history = profile.history.length ? profile.history.map((entry) => {
      const meta = GAME_META[entry.game];
      return `<article class="history-item"><span class="history-icon">${meta.icon}</span><div><strong>${esc(meta.title)} · уровень ${entry.level + 1}</strong><br><small>${new Date(entry.date).toLocaleDateString("ru-RU")} · ${entry.percentage}%</small></div><div>💗 ${entry.hearts}<br>🪙 ${entry.coins}</div></article>`;
    }).join("") : '<div class="empty-state">Здесь появятся твои игровые сессии.</div>';
    const shop = SHOP_ITEMS.map((item) => {
      const owned = profile.inventory.includes(item.id);
      const canBuy = profile.coins >= item.cost;
      return `<article class="shop-item"><span>${item.icon}</span><div><strong>${esc(item.name)}</strong><small>${owned ? "В коллекции" : `🪙 ${item.cost}`}</small></div><button class="${owned ? "ghost-button" : "secondary-button"} buy-item" data-item="${item.id}" ${owned || !canBuy ? "disabled" : ""}>${owned ? "Получено" : canBuy ? "Купить" : "Нужно больше монет"}</button></article>`;
    }).join("");

    app.innerHTML = `
      <div class="app-shell">${topbar()}<main class="page">
        <header class="level-header"><button class="back-button" id="profile-back">←</button><div><p class="eyebrow">Твои достижения</p><h2>Профиль игрока</h2></div></header>
        <section class="profile-page">
          <article class="profile-card">
            <div class="big-avatar ${avatarTier(profile.hearts)}">${esc(profile.name.slice(0,1).toUpperCase())}</div>
            <h2>${esc(profile.name)}</h2><p>${profileTitle(profile.hearts)}</p><p><strong>${frameNames[tier]}</strong>${nextAt ? `<br><small>Следующее оформление через ${nextAt - profile.hearts} 💗</small>` : ""}</p>
            <div class="profile-stats-grid"><div class="profile-stat"><strong>${profile.hearts}</strong>💗 сердец</div><div class="profile-stat"><strong>${profile.coins}</strong>🪙 монет</div></div>
            <h3>Значки</h3><div class="badges-row">
              <span class="badge-medal ${profile.badges.includes("friendship") ? "earned" : ""}" title="Friendship Badge">🤝</span>
              <span class="badge-medal ${profile.badges.includes("number") ? "earned" : ""}" title="Number Badge">🔢</span>
              <span class="badge-medal ${profile.badges.includes("rainbow") ? "earned" : ""}" title="Rainbow Badge">🌈</span>
            </div>
          </article>
          <article class="history-card"><h2>История занятий</h2><div class="history-list">${history}</div></article>
          <article class="history-card shop-card"><div class="shop-heading"><div><p class="eyebrow">Без реальных денег</p><h2>Магазин наград</h2></div><span class="stat-pill">🪙 ${profile.coins}</span></div><div class="shop-grid">${shop}</div></article>
        </section>
      </main></div>`;
    bindTopbar();
    document.querySelector("#profile-back").addEventListener("click", () => navigate("home"));
    document.querySelectorAll(".buy-item:not(:disabled)").forEach((button) => button.addEventListener("click", () => {
      const item = SHOP_ITEMS.find((entry) => entry.id === button.dataset.item);
      if (!item || profile.coins < item.cost || profile.inventory.includes(item.id)) return;
      profile.coins -= item.cost;
      profile.inventory.push(item.id);
      saveProfile();
      showToast(`${item.icon} ${item.name} — получено!`);
      renderProfile();
    }));
  }

  function avatarTier(hearts) {
    return `tier-${Math.min(20, Math.floor(hearts / 5))}`;
  }

  const frameNames = [
    "Розовая рамка", "Серебряный кант", "Золотой кант", "Объёмное имя", "Сияние имени",
    "Звёздные уголки", "Бирюзовые кристаллы", "Световой блик", "Корона", "Радужный кант",
    "Серебряные частицы", "Золотые частицы", "Анимированные звёзды", "Крылья рамки", "Сияющая корона",
    "Радужные частицы", "Кристаллическая рамка", "Пульсирующее сияние", "English Champion", "Корона и кристаллы", "English Star",
  ];

  function profileTitle(hearts) {
    if (hearts >= 100) return "English Star ✨";
    if (hearts >= 75) return "Rainbow Champion 🌈";
    if (hearts >= 50) return "English Explorer 🧭";
    if (hearts >= 25) return "Word Adventurer 🚀";
    if (hearts >= 10) return "Brave Speaker 💬";
    return "English Beginner 🌱";
  }

  function allBadgesEarned() {
    return ["friendship", "number", "rainbow"].every((badge) => profile.badges.includes(badge));
  }

  function showFestival() {
    document.querySelector(".result-overlay")?.remove();
    document.body.insertAdjacentHTML("beforeend", `
      <div class="festival-overlay" role="dialog" aria-modal="true" aria-labelledby="festival-title">
        <section class="festival-card">
          <p class="eyebrow">Rainbow Festival</p><h2 id="festival-title">Excellent, ${esc(profile.name)}!</h2>
          <p class="lead">You are an English Star!</p>
          <div class="festival-heroes"><img src="${HEROES.penny}" alt="Penny"><img src="${HEROES.archie}" alt="Archie"><img src="${HEROES.leo}" alt="Leo"><img src="${HEROES.mia}" alt="Mia"></div>
          <div class="reward-strip"><span class="reward-chip">🏆 English Star</span><span class="reward-chip">🤝 Friendship</span><span class="reward-chip">🔢 Numbers</span><span class="reward-chip">🌈 Colors</span></div>
          <div class="button-row" style="justify-content:center"><button class="primary-button" id="close-festival">Вернуться в город</button><button class="secondary-button" id="download-certificate">Скачать сертификат</button></div>
        </section>
      </div>`);
    profile.festivalSeen = true;
    saveProfile();
    confetti();
    speak("Excellent! You are an English Star!");
    document.querySelector("#close-festival").addEventListener("click", () => { document.querySelector(".festival-overlay")?.remove(); navigate("home"); });
    document.querySelector("#download-certificate").addEventListener("click", downloadCertificate);
  }

  function downloadCertificate() {
    const safeName = esc(profile.name);
    const date = new Date().toLocaleDateString("ru-RU");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="990"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#fff9ef"/><stop offset="1" stop-color="#dff8f4"/></linearGradient></defs><rect width="1400" height="990" fill="url(#bg)"/><rect x="45" y="45" width="1310" height="900" rx="48" fill="none" stroke="#16a6a1" stroke-width="12"/><text x="700" y="180" text-anchor="middle" font-family="Arial" font-size="72" font-weight="700" fill="#123c4a">English Town</text><text x="700" y="285" text-anchor="middle" font-family="Arial" font-size="48" fill="#16a6a1">CERTIFICATE</text><text x="700" y="400" text-anchor="middle" font-family="Arial" font-size="34" fill="#64748b">This certificate is proudly presented to</text><text x="700" y="520" text-anchor="middle" font-family="Arial" font-size="76" font-weight="700" fill="#17324d">${safeName}</text><text x="700" y="620" text-anchor="middle" font-family="Arial" font-size="40" fill="#17324d">You are an English Star!</text><text x="700" y="725" text-anchor="middle" font-size="72">🤝　🔢　🌈</text><text x="700" y="850" text-anchor="middle" font-family="Arial" font-size="28" fill="#64748b">${date} · Английский по шагам с нуля</text></svg>`;
    downloadSvg(svg, "english-town-certificate.svg");
    showToast("Сертификат сохранён 🏆");
  }

  function renderFreePaint() {
    if (!taskState.freeColors) taskState.freeColors = { star: "yellow", heart: "red", balloon: "blue" };
    app.innerHTML = `
      <div class="app-shell">${topbar()}<main class="page">
        <header class="level-header"><button class="back-button" id="free-back">←</button><div><p class="eyebrow">Без оценок и ошибок</p><h2>Моя открытка</h2><p class="lead">Выбери цвет и раскрась праздничные элементы.</p></div></header>
        <section class="game-stage lab-stage">${characterBlock("archie")}<div class="task-panel">
          <div class="lab-workbench"><div class="paint-objects">
            <button class="paint-object free-object" data-object="star" style="background:${COLORS[taskState.freeColors.star]}">⭐</button>
            <button class="paint-object free-object" data-object="heart" style="background:${COLORS[taskState.freeColors.heart]}">♥</button>
            <button class="paint-object free-object" data-object="balloon" style="background:${COLORS[taskState.freeColors.balloon]}">🎈</button>
          </div><h3 style="text-align:center;margin:20px 0 0">${esc(profile.name)}’s English Town</h3></div>
          ${colorPalette()}<div class="button-row"><button class="primary-button" id="download-card">Скачать открытку</button></div>
        </div></section>
      </main></div>`;
    bindTopbar();
    document.querySelector("#free-back").addEventListener("click", () => navigate("levels", { game: "color" }));
    document.querySelectorAll(".select-color").forEach((button) => button.addEventListener("click", () => { taskState.chosenColor = button.dataset.color; renderFreePaint(); }));
    document.querySelectorAll(".free-object").forEach((button) => button.addEventListener("click", () => {
      if (!taskState.chosenColor) return showToast("Сначала выбери краску 🎨");
      taskState.freeColors[button.dataset.object] = taskState.chosenColor;
      renderFreePaint();
    }));
    document.querySelector("#download-card").addEventListener("click", downloadCard);
  }

  function downloadCard() {
    const c = taskState.freeColors;
    const safeName = esc(profile.name);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#bfeaff"/><stop offset="1" stop-color="#fff0cc"/></linearGradient></defs><rect width="1200" height="800" rx="60" fill="url(#bg)"/><text x="600" y="130" text-anchor="middle" font-family="Arial" font-size="64" font-weight="700" fill="#17324d">${safeName}’s English Town</text><circle cx="300" cy="390" r="120" fill="${COLORS[c.star]}"/><text x="300" y="425" text-anchor="middle" font-size="110">★</text><circle cx="600" cy="390" r="120" fill="${COLORS[c.heart]}"/><text x="600" y="425" text-anchor="middle" font-size="110">♥</text><circle cx="900" cy="390" r="120" fill="${COLORS[c.balloon]}"/><text x="900" y="425" text-anchor="middle" font-size="110">●</text><text x="600" y="680" text-anchor="middle" font-family="Arial" font-size="52" font-weight="700" fill="#16a6a1">Speak English!</text></svg>`;
    downloadSvg(svg, "english-town-card.svg");
    showToast("Открытка сохранена ✨");
  }

  function downloadSvg(svg, filename) {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function speak(text) {
    if (!profile || profile.muted || !text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(personalize(text).replaceAll("_", "blank"));
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    utterance.pitch = 1.04;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((candidate) => candidate.lang?.toLowerCase().startsWith("en"));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toastLayer.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
  }

  function confetti() {
    const colors = ["#16A6A1", "#FFC94A", "#FF6F61", "#7657D5", "#22A96E"];
    const layer = document.createElement("div");
    layer.className = "confetti";
    layer.innerHTML = Array.from({ length: 45 }, (_, index) => `<i style="--x:${Math.random() * 100}%;--c:${colors[index % colors.length]};--d:${1.8 + Math.random() * 1.6}s;--delay:${Math.random() * 0.35}s;--drift:${-80 + Math.random() * 160}px"></i>`).join("");
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 3800);
  }

  render();
})();
