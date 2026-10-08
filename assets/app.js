/* ============================================================
   GenreLab — общая логика сайта
   ============================================================ */

/* Отключаем авто-восстановление скролла браузером —
   будем управлять им сами */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

/* ---------- Данные об играх ---------- */
const GAMES = [
  {
    id: 1,
    file: "1game.html",
    title: "Dungeon Maintenance",
    ru: "Служба ремонта подземелья",
    emoji: "🔧",
    color: "#f5a623",
    genre: "Top-Down Аркада / Менеджмент ресурсов",
    tags: ["Аркада", "Менеджмент", "Top-Down"],
    idea: "Вы — гоблин-механик. Пока авантюристы (NPC) пытаются пройти подземелье, вам нужно бегать по комнатам и вовремя чинить ловушки, перезаряжать арбалеты и чинить двери.",
    mechanics: [
      "Игрок перемещается по карте, берет с верстаков запчасти и зажимает «E» у ломающейся ловушки.",
      "Герои идут по фиксированным путям или с помощью Pathfinding.",
      "Таймеры поломок — поведение Timer, ~20–30 событий на цикл.",
    ],
    refs: "Overcooked, Orcs Must Die!, Dungeon Keeper",
  },
  {
    id: 2,
    file: "2game.html",
    title: "Shifted Core",
    ru: "Смена гравитации",
    emoji: "🛰️",
    color: "#00e0c6",
    genre: "Точный 2D-платформер с пазл-элементами",
    tags: ["Платформер", "Пазл", "Точность"],
    idea: "Игрок управляет небольшим дроном на заброшенной станции. Нажмите пробел — и гравитация меняется на 180°.",
    mechanics: [
      "Пройти 5–7 коротких комнат от старта до выхода.",
      "Избегать шипов и лазеров, вовремя переключать гравитацию в полете.",
      "Смена гравитации — 1 событие, ~15–20 событий всего.",
    ],
    refs: "VVVVVV, Gravity Duck, Celeste",
  },
  {
    id: 3,
    file: "3game.html",
    title: "Orbit Recovery",
    ru: "Космический мусорщик",
    emoji: "🧲",
    color: "#6c5ce7",
    genre: "Физическая аркада с видом сверху",
    tags: ["Аркада", "Физика", "Космос"],
    idea: "Управление космическим буксиром с магнитом. Собирайте мусор и буксируйте его к станции-переработчику, избегая астероидов.",
    mechanics: [
      "Инерционное управление кораблем.",
      "Кнопка активирует магнит — привязывает ближайший объект.",
      "Мусор имеет массу: чем больше прицепили, тем тяжелее управлять.",
      "Встроенное поведение Physics, ~20–25 событий.",
    ],
    refs: "Lunar Lander, Asteroids, Subspace",
  },
  {
    id: 4,
    file: "4game.html",
    title: "Shadow Protocol",
    ru: "Тень и Сервер",
    emoji: "🕶️",
    color: "#4dabf7",
    genre: "Top-Down Стелс-головоломка",
    tags: ["Стелс", "Головоломка", "Top-Down"],
    idea: "Вы — оперативник в корпоративном офисе. Нужно украсть данные с главного сервера и дойти до точки эвакуации, не попавшись на глаза.",
    mechanics: [
      "У врагов и камер есть видимые конусы обзора.",
      "Прячемся в тени и за укрытиями, бросаем отвлекалку, взламываем щитки.",
      "Заметили — тревога и перезапуск.",
      "Line of Sight + Pathfinding, ~20–25 событий.",
    ],
    refs: "Metal Gear Solid, Monaco, Party Hard",
  },
  {
    id: 5,
    file: "5game.html",
    title: "Core Override",
    ru: "Протокол 0: Главный Модуль",
    emoji: "💥",
    color: "#ff4d7d",
    genre: "Boss Rush / Top-Down Экшен-Арена",
    tags: ["Экшен", "Boss Rush", "Top-Down"],
    idea: "Вся игра — одна эпичная, проработанная битва против многофазового босса.",
    mechanics: [
      "У игрока: перемещение, атака и рывок для уклонения.",
      "Фаза 1 — веер снарядов. Фаза 2 — лазеры. Фаза 3 — арена сжимается, атаки ускоряются.",
      "Все 30–40 событий уходят на паттерны и баланс.",
    ],
    refs: "Furi, Titan Souls, Cuphead, Enter the Gungeon",
  },
  {
    id: 6,
    file: "6game.html",
    title: "Infection Vector",
    ru: "Внедрение",
    emoji: "🦠",
    color: "#51cf66",
    genre: "Реверс-Tower Defense / Тактическая стратегия",
    tags: ["Стратегия", "Tower Defense", "Тактика"],
    idea: "«Игра наоборот»: сеть застроена антивирусными турелями, а игрок — хакер-вирус, ведущий отряд данных к ядру.",
    mechanics: [
      "Фаза планирования: прокладываем маршрут точками и формируем отряд.",
      "Фаза прорыва: «Пуск» — отряд бежит по маршруту, турели стреляют.",
      "EMP-импульс оглушает турель на 3 секунды.",
      "Pathfinding, ~25–30 событий.",
    ],
    refs: "Anomaly: Warzone Earth, Rock of Ages, Irresistible Force",
  },
  {
    id: 7,
    file: "7game.html",
    title: "Flipper Knight",
    ru: "Рыцарь-Флиппер",
    emoji: "🛡️",
    color: "#ffd166",
    genre: "Пинбол-экшен / Физический данжн-кроулер",
    tags: ["Физика", "Пинбол", "Экшен"],
    idea: "Полный отказ от традиционного управления: герой — круглый рыцарь-шар, подземелье — пинбол-арена.",
    mechanics: [
      "Два флиппера внизу, управление A и D.",
      "Враги, ловушки и сундуки — запускаем героя-шар во врагов.",
      "Комбо: чем больше рикошетов без падения, тем выше множитель урона.",
      "Все на поведении Physics, ~20–25 событий.",
    ],
    refs: "Yoku's Island Express, Rollers of the Realm, Peggle",
  },
  {
    id: 8,
    file: "8game.html",
    title: "Luminous Pulse",
    ru: "Импульс Света",
    emoji: "💡",
    color: "#a78bfa",
    genre: "Ритм-платформер / Стелс-пазл",
    tags: ["Платформер", "Ритм", "Пазл", "Стелс"],
    idea: "Мир живет в ритме: уровни — черные комнаты. Окружение видно только в момент «пульсации» света по ритму музыки. Между пульсами — полная темнота.",
    mechanics: [
      "Пройти уровень от старта до финиша, избегая невидимых опасностей.",
      "Музыка задает темп: каждые 1,5 с вспышка на 0,5 с.",
      "Успех зависит от чувства ритма.",
      "Визуализация — прозрачность фона по таймеру, ~25–30 событий.",
    ],
    refs: "Thomas Was Alone, Bit.Trip Runner, Crypt of the NecroDancer",
  },
  {
    id: 9,
    file: "9game.html",
    title: "Wreck-Ball Golf",
    ru: "Гольф Рушитель",
    emoji: "💥",
    color: "#ff7a45",
    genre: "Физическая головоломка / Топ-Даун Аркада",
    tags: ["Физика", "Пазл", "Аркада"],
    idea: "Гольф, но мяч — разрушительное ядро. Главная цель — набрать максимум очков за разрушения по пути к лунке.",
    mechanics: [
      "Управление как в гольфе: направление + сила удара.",
      "Мяч — тяжелое ядро, отскакивает от стен и объектов.",
      "Разрушаемые объекты дают очки.",
      "Все на поведении Physics, ~30 событий.",
    ],
    refs: "The Incredible Machine, Angry Birds, Blast Corps",
  },
];

/* ---------- Хранилище ---------- */
const STORE_KEY = "genrelab_ratings_v1";
const PENDING_KEY = "genrelab_pending";
const ADMIN_FLAG = "genrelab_admin";

function getRatings() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function clearRatings() {
  localStorage.removeItem(STORE_KEY);
}
function gameById(id) {
  return GAMES.find((g) => String(g.id) === String(id));
}
function ratedCount() {
  const r = getRatings();
  return GAMES.filter((g) => r[g.id]).length;
}
function nextUnrated() {
  const r = getRatings();
  return GAMES.find((g) => !r[g.id]) || null;
}

/* ---------- Админ-режим ---------- */
function isAdmin() {
  const qs = new URLSearchParams(location.search);
  const byQS = qs.get("admin") === "1";
  const byHash = location.hash.toLowerCase() === "#admin";

  if (byQS || byHash) {
    localStorage.setItem(ADMIN_FLAG, "1");
    if (byQS) {
      const clean = location.pathname + location.hash.replace("#admin", "");
      history.replaceState(null, "", clean);
    }
    return true;
  }
  return localStorage.getItem(ADMIN_FLAG) === "1";
}
function logoutAdmin() {
  localStorage.removeItem(ADMIN_FLAG);
  location.reload();
}

/* ---------- Кука страницы ---------- */
function currentPage() {
  const p = location.pathname.split("/").pop();
  return p && p.length ? p : "index.html";
}

function renderChrome() {
  const cur = currentPage();
  const header = document.getElementById("site-header");
  if (header) {
    const isIndex =
      cur === "index.html" || cur === "" || GAMES.some((g) => g.file === cur);
    const link = (href, label, active) =>
      `<a class="nav-link${active ? " active" : ""}" href="${href}">${label}</a>`;
    header.innerHTML = `
      <div class="container header-inner">
        <a class="brand" href="index.html">
          <span class="brand-mark">🎮</span>
          <span class="brand-text"><b>GenreLab</b><small>командный проект · 2D игры</small></span>
        </a>
        <nav class="nav">
          ${link("index.html", "Игры", isIndex)}
          ${link("stats.html", "Статистика", cur === "stats.html")}
        </nav>
        <div class="header-progress" id="headerProgress"></div>
      </div>`;
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML = `
      <div class="container footer-inner">
        <div>© ${new Date().getFullYear()} GenreLab — учебный командный проект | 9 прототипов | Одна цель: Выбрать жанр игры для проекта.</div>
         <br>
        <div>by Maks</div>
        <div class="footer-links">
          <a href="index.html">Игры</a>
          <a href="stats.html">Статистика</a>
        </div>
      </div>`;
  }
  updateProgressUI();
}

function updateProgressUI() {
  const n = ratedCount(),
    total = GAMES.length;
  const hp = document.getElementById("headerProgress");
  if (hp) hp.textContent = `Оценено ${n}/${total}`;

  const fill = document.getElementById("progressFill");
  if (fill) fill.style.width = (n / total) * 100 + "%";

  const label = document.getElementById("progressLabel");
  if (label) label.textContent = `${n} / ${total}`;

  const hint = document.getElementById("progressHint");
  if (hint) {
    if (n === 0)
      hint.textContent = "Начните с любой карточки — порядок не важен.";
    else if (n < total) hint.textContent = `Осталось оценить еще ${total - n}.`;
    else
      hint.textContent =
        "Все прототипы оценены! Смотрите итоговый рейтинг на странице статистики.";
  }
}

/* ---------- Карточки ---------- */
const GAME_DIR = "game/";

function cardHTML(g, i) {
  const r = getRatings()[g.id];
  let badge = '<span class="badge">Не оценено</span>';
  if (r) {
    badge =
      r.vote === "like"
        ? '<span class="badge like">❤️ Нравится</span>'
        : '<span class="badge dislike">👎 Не зашло</span>';
  }
  return `
  <article class="card" style="--card-accent:${g.color}">
    <div class="card-top">
      <div class="card-emoji">${g.emoji}</div>
      <div class="card-num">ПРОТОТИП #${i + 1}</div>
    </div>
    <h3 class="card-title">«${g.title}»</h3>
    <div class="card-ru">${g.ru}</div>
    <div class="chip">${g.genre}</div>
    <p class="card-desc">${g.idea}</p>
    <ul class="card-list">${g.mechanics.map((m) => `<li>${m}</li>`).join("")}</ul>
    <div class="card-refs"><b>Референсы:</b> ${g.refs}</div>
    <div class="card-foot">
      <a class="btn btn-primary" href="${GAME_DIR}${g.file}">▶ Начать игру</a>
      <button class="btn btn-ghost" data-rate="${g.id}">Оценить</button>
    </div>
    <div class="card-status">${badge}</div>
  </article>`;
}

function renderGameGrid() {
  const grid = document.getElementById('gamesGrid');
  if (!grid) return;
  grid.innerHTML = GAMES.map(cardHTML).join('');

  grid.addEventListener('click', e => {
    // Клик по кнопке «Оценить» — открываем модалку
    const rateBtn = e.target.closest('[data-rate]');
    if (rateBtn) {
      openRateModal(rateBtn.dataset.rate);
      return;
    }

    // Клик по кнопке «▶ Начать игру» — сохраняем скролл и ID игры
    const playBtn = e.target.closest('a[href]');
    if (playBtn && playBtn.closest('.card')) {
      // Определяем ID игры по ссылке
      const href = playBtn.getAttribute('href');
      const match = href.match(/(\d+)game\.html/);
      if (match) {
        const gameId = match[1];
        // Сохраняем позицию скролла
        localStorage.setItem('genrelab_scroll_y', String(window.scrollY));
        // Сохраняем ID игры — чтобы после возврата проскроллить к нужной карточке
        localStorage.setItem('genrelab_last_game', gameId);
      }
    }
  });
}

/* ---------- Модальное окно оценки ---------- */
let modalEl = null;
let currentVote = null;
let currentGameId = null;

function ensureModal() {
  if (modalEl) return modalEl;

  modalEl = document.createElement("div");
  modalEl.className = "modal";
  modalEl.id = "rateModal";
  modalEl.innerHTML = `
    <div class="modal-backdrop" data-close></div>
    <div class="modal-card" role="dialog" aria-modal="true">
      <button class="modal-close" data-close aria-label="Закрыть">×</button>

      <div id="mVoteWrap">
        <div class="modal-head">
          <div class="card-emoji" id="mEmoji">🎮</div>
          <div>
            <div class="modal-step" id="mStep">Прототип</div>
            <h3 id="mTitle">Игра</h3>
            <div class="chip" id="mGenre">Жанр</div>
          </div>
        </div>

        <p class="modal-q">Понравился ли тебе такой жанр / геймплей?</p>

        <div class="name-field" id="mNameWrap">
          <label for="mName">Ваше имя (чисто формальность):</label>
          <input id="mName" type="text" maxlength="40" placeholder="Например, Алексей" autocomplete="off">
        </div>

        <div class="vote-row">
          <button class="vote-btn like" id="mLike">❤️<span>Нравится</span></button>
          <button class="vote-btn dislike" id="mDislike">👎<span>Не зашло</span></button>
        </div>

        <textarea id="mComment" placeholder="Комментарий для команды (необязательно)..."></textarea>

        <div class="modal-actions">
          <button class="btn btn-primary" id="mSubmit" disabled>Отправить оценку</button>
        </div>
      </div>

      <div class="modal-done" id="mDone" hidden>
        <div class="done-icon">✅</div>
        <p>Спасибо! Оценка сохранена.</p>
        <div class="modal-actions">
          <button class="btn btn-primary" id="mNext">Следующая игра →</button>
          <a class="btn btn-ghost" href="stats.html">📊 Смотреть статистику</a>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modalEl);

  modalEl.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  const likeBtn = modalEl.querySelector("#mLike");
  const dislikeBtn = modalEl.querySelector("#mDislike");
  const submit = modalEl.querySelector("#mSubmit");

  likeBtn.addEventListener("click", () => {
    currentVote = "like";
    likeBtn.classList.add("sel");
    dislikeBtn.classList.remove("sel");
    submit.disabled = false;
  });
  dislikeBtn.addEventListener("click", () => {
    currentVote = "dislike";
    dislikeBtn.classList.add("sel");
    likeBtn.classList.remove("sel");
    submit.disabled = false;
  });

  submit.addEventListener("click", async () => {
    if (!currentVote || !currentGameId) return;

    const nameInput = modalEl.querySelector("#mName");
    const nameVal = nameInput.value.trim();
    if (nameVal) setUserName(nameVal);
    else if (!getUserName()) setUserName("Аноним");

    submit.disabled = true;
    const oldText = submit.textContent;
    submit.textContent = "Отправка…";

    await saveRating(
      currentGameId,
      currentVote,
      modalEl.querySelector("#mComment").value,
    );

    submit.textContent = oldText;
    modalEl.querySelector("#mVoteWrap").hidden = true;
    modalEl.querySelector("#mDone").hidden = false;
    updateProgressUI();
    renderGameGridStatuses();
  });

  modalEl.querySelector("#mNext").addEventListener("click", () => {
    const nxt = nextUnrated();
    if (nxt) {
      closeModal();
      localStorage.setItem(PENDING_KEY, nxt.id);
      location.href = GAME_DIR + nxt.file;
    } else {
      closeModal();
      location.href = "stats.html";
    }
  });

  return modalEl;
}

function openRateModal(id) {
  const g = gameById(id);
  if (!g) return;
  ensureModal();

  currentGameId = String(id);
  currentVote = null;

  modalEl.querySelector("#mEmoji").textContent = g.emoji;
  modalEl.querySelector("#mStep").textContent =
    `Прототип #${g.id} из ${GAMES.length}`;
  modalEl.querySelector("#mTitle").textContent = `«${g.title}» — ${g.ru}`;
  modalEl.querySelector("#mGenre").textContent = g.genre;

  const existing = getRatings()[g.id];
  modalEl.querySelector("#mComment").value = existing
    ? existing.comment || ""
    : "";
  modalEl
    .querySelector("#mLike")
    .classList.toggle("sel", !!existing && existing.vote === "like");
  modalEl
    .querySelector("#mDislike")
    .classList.toggle("sel", !!existing && existing.vote === "dislike");
  modalEl.querySelector("#mSubmit").disabled = !existing;
  if (existing) currentVote = existing.vote;

  // Поле имени — скрываем, если имя уже сохранено
  const nameWrap = modalEl.querySelector("#mNameWrap");
  const nameInput = modalEl.querySelector("#mName");
  const savedName = getUserName();
  if (savedName) {
    nameWrap.style.display = "none";
    nameInput.value = savedName;
  } else {
    nameWrap.style.display = "";
    nameInput.value = "";
  }

  modalEl.querySelector("#mVoteWrap").hidden = false;
  modalEl.querySelector("#mDone").hidden = true;

  modalEl.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modalEl) return;
  modalEl.classList.remove("open");
  document.body.style.overflow = "";
}

function renderGameGridStatuses() {
  const grid = document.getElementById("gamesGrid");
  if (!grid) return;
  const r = getRatings();
  grid.querySelectorAll(".card").forEach((card, i) => {
    const g = GAMES[i];
    const st = card.querySelector(".card-status");
    if (!st) return;
    const rec = r[g.id];
    st.innerHTML = !rec
      ? '<span class="badge">Не оценено</span>'
      : rec.vote === "like"
        ? '<span class="badge like">❤️ Нравится</span>'
        : '<span class="badge dislike">👎 Не зашло</span>';
  });
}

/* ---------- Сохранение оценки (локально + на сервер) ---------- */
async function saveRating(id, vote, comment) {
  const r = getRatings();
  r[String(id)] = { vote, comment: (comment || "").trim(), ts: Date.now() };
  localStorage.setItem(STORE_KEY, JSON.stringify(r));

  if (
    typeof pushRating !== "function" ||
    typeof SUPABASE_READY === "undefined" ||
    !SUPABASE_READY
  ) {
    console.log("ℹ Локально сохранено (Supabase выключен)");
    return;
  }

  const g = gameById(id);
  try {
    await pushRating({
      gameId: id,
      gameTitle: g ? g.title : "",
      vote,
      comment,
    });
    console.log("✓ Отправлено на сервер");
  } catch (err) {
    console.warn("⚠ Не отправлено на сервер:", err.message);
  }
}

/* ---------- Логика игровой страницы ---------- */
function initGamePage() {
  const back = document.getElementById("backBtn");
  if (!back) return;

  back.addEventListener("click", (e) => {
    e.preventDefault();
    const id = document.body.dataset.game;
    if (id) localStorage.setItem(PENDING_KEY, id);
    location.href = "index.html";
  });
}

function checkPending() {
  const page = currentPage();
  const isIndex = page === 'index.html' || page === '';
  if (!isIndex) return;

  // 1. Восстанавливаем скролл
  const savedY = localStorage.getItem('genrelab_scroll_y');
  const lastGameId = localStorage.getItem('genrelab_last_game');

  if (savedY !== null) {
    const y = parseInt(savedY, 10);
    // Небольшая задержка — ждём, пока карточки отрисуются
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: 'auto' });
    });
  } else if (lastGameId) {
    // Если scroll_y нет, но есть ID — скроллим к нужной карточке
    requestAnimationFrame(() => {
      const cards = document.querySelectorAll('#gamesGrid .card');
      const idx = GAMES.findIndex(g => String(g.id) === String(lastGameId));
      if (idx >= 0 && cards[idx]) {
        cards[idx].scrollIntoView({ block: 'center', behavior: 'auto' });
      }
    });
  }

  // 2. Открываем модалку оценки
  const pending = localStorage.getItem(PENDING_KEY);
  if (pending) {
    localStorage.removeItem(PENDING_KEY);
    setTimeout(() => {
      openRateModal(pending);
      // Ещё раз подстрахуемся — восстановим скролл после открытия модалки
      if (savedY !== null) {
        window.scrollTo({ top: parseInt(savedY, 10), behavior: 'auto' });
      }
    }, 400);
  }

  // 3. Чистим сохранённую позицию, чтобы она не тянулась вечно
  setTimeout(() => {
    localStorage.removeItem('genrelab_scroll_y');
    localStorage.removeItem('genrelab_last_game');
  }, 2000);
}

/* ---------- Страница статистики ---------- */
async function renderStats() {
  const root = document.getElementById("statsRoot");
  if (!root) return;

  root.innerHTML = '<div class="empty">⏳ Загружаем статистику…</div>';

  let allRatings = [];
  let serverOk = false;

  if (
    typeof fetchAllRatings === "function" &&
    typeof SUPABASE_READY !== "undefined" &&
    SUPABASE_READY
  ) {
    try {
      allRatings = await fetchAllRatings();
      serverOk = true;
    } catch (err) {
      console.warn(
        "Supabase недоступен, показываю локальные данные:",
        err.message,
      );
    }
  }

  /* ---- данные для отображения ---- */
  let entries, likes, dislikes, uniqUsers, likeRate, sortedGames, tagRows;

  if (serverOk) {
    likes = allRatings.filter((r) => r.vote === "like").length;
    dislikes = allRatings.filter((r) => r.vote === "dislike").length;
    uniqUsers = new Set(allRatings.map((r) => r.user_id)).size;
    likeRate = allRatings.length
      ? Math.round((likes / allRatings.length) * 100)
      : 0;

    const agg = {};
    for (const row of allRatings) {
      const id = row.game_id;
      if (!agg[id]) agg[id] = { like: 0, dislike: 0 };
      agg[id][row.vote]++;
    }

    sortedGames = GAMES.map((g) => {
      const a = agg[g.id] || { like: 0, dislike: 0 };
      const total = a.like + a.dislike;
      return {
        game: g,
        like: a.like,
        dislike: a.dislike,
        total,
        rate: total ? a.like / total : 0,
      };
    }).sort((a, b) => b.rate - a.rate || b.total - a.total);

    const tagMap = {};
    for (const row of allRatings) {
      const g = gameById(row.game_id);
      if (!g) continue;
      for (const t of g.tags) {
        if (!tagMap[t]) tagMap[t] = { like: 0, dislike: 0 };
        tagMap[t][row.vote]++;
      }
    }
    tagRows = Object.entries(tagMap)
      .map(([tag, v]) => {
        const tot = v.like + v.dislike;
        return { tag, ...v, tot, rate: tot ? v.like / tot : 0 };
      })
      .sort((a, b) => b.rate - a.rate);

    entries = allRatings
      .map((row) => ({
        game: gameById(row.game_id),
        vote: row.vote,
        comment: row.comment || "",
        user_name: row.user_name || "Аноним",
        ts: new Date(row.created_at).getTime(),
      }))
      .filter((e) => e.game);
  } else {
    const ratings = getRatings();
    entries = GAMES.map((g) => {
      const r = ratings[g.id];
      return {
        game: g,
        vote: r ? r.vote : null,
        comment: r ? r.comment : "",
        user_name: r ? r.user_name || "Аноним" : "",
        ts: r ? r.ts : 0,
      };
    });
    const rated = entries.filter((e) => e.vote);
    likes = rated.filter((e) => e.vote === "like").length;
    dislikes = rated.filter((e) => e.vote === "dislike").length;
    uniqUsers = rated.length ? 1 : 0;
    likeRate = rated.length ? Math.round((likes / rated.length) * 100) : 0;

    sortedGames = [...entries]
      .sort((a, b) => {
        const sa = a.vote === "like" ? 1 : a.vote === "dislike" ? 0 : -1;
        const sb = b.vote === "like" ? 1 : b.vote === "dislike" ? 0 : -1;
        return sb - sa || a.game.id - b.game.id;
      })
      .map((e) => ({
        game: e.game,
        like: e.vote === "like" ? 1 : 0,
        dislike: e.vote === "dislike" ? 1 : 0,
        total: e.vote ? 1 : 0,
        rate: e.vote === "like" ? 1 : e.vote === "dislike" ? 0 : 0,
      }));

    const tagMap = {};
    entries.forEach((e) => {
      if (!e.vote) return;
      e.game.tags.forEach((t) => {
        if (!tagMap[t]) tagMap[t] = { like: 0, dislike: 0 };
        tagMap[t][e.vote]++;
      });
    });
    tagRows = Object.entries(tagMap)
      .map(([tag, v]) => {
        const tot = v.like + v.dislike;
        return { tag, ...v, tot, rate: tot ? v.like / tot : 0 };
      })
      .sort((a, b) => b.rate - a.rate);
  }

  /* ---- HTML ---- */
  let html = `
    <div class="tiles">
      <div class="tile"><div class="val">${uniqUsers}</div><div class="lbl">${serverOk ? "Участников" : "Своих оценок"}</div></div>
      <div class="tile like"><div class="val">${likes}</div><div class="lbl">❤️ Понравилось</div></div>
      <div class="tile dislike"><div class="val">${dislikes}</div><div class="lbl">👎 Не зашло</div></div>
      <div class="tile"><div class="val">${likeRate}%</div><div class="lbl">Индекс симпатии</div></div>
    </div>`;

  if (!serverOk && !entries.some((e) => e.vote)) {
    html += `
      <div class="empty">
        <div class="big">🗳️</div>
        <h3 style="margin:0 0 8px">Пока нет ни одной оценки</h3>
        <p style="margin:0 0 20px">Пройдите хотя бы один прототип и поставьте ❤️ или 👎.</p>
        <a class="btn btn-primary" href="index.html">Перейти к играм</a>
      </div>`;
    root.innerHTML = html;
    return;
  }

  html += `
    <div class="panel">
      <h3>🏆 Рейтинг прототипов</h3>
      <p class="sub">${serverOk ? `Голосов: ${allRatings.length}` : "Локальные данные вашего браузера."}</p>
      ${sortedGames
        .map((e, i) => {
          const pct = Math.round(e.rate * 100);
          return `
          <div class="bar-row${i === 0 && e.total ? " rank-1" : ""}">
            <div class="bar-name">
              <span>${e.game.emoji}</span>
              <span>«${e.game.title}»<small>${e.game.genre}</small></span>
            </div>
            <div class="bar-track">
              <div class="${e.rate >= 0.5 ? "bar-fill" : "bar-fill neg"}" style="width:${pct}%"></div>
            </div>
            <div class="bar-val"><b>${pct}%</b> · ${e.like}❤️ / ${e.dislike}👎</div>
          </div>`;
        })
        .join("")}
    </div>`;

  if (tagRows.length) {
    html += `
      <div class="panel">
        <h3>🎯 Рейтинг жанров</h3>
        <p class="sub">Агрегация по тегам. Чем выше процент — тем больше команде нравится направление.</p>
        ${tagRows
          .map(
            (t, i) => `
          <div class="bar-row${i === 0 ? " rank-1" : ""}">
            <div class="bar-name"><span>${t.tag}</span></div>
            <div class="bar-track">
              <div class="${t.rate >= 0.5 ? "bar-fill" : "bar-fill neg"}" style="width:${Math.round(t.rate * 100)}%"></div>
            </div>
            <div class="bar-val"><b>${Math.round(t.rate * 100)}%</b> · ${t.like}❤️ / ${t.dislike}👎</div>
          </div>`,
          )
          .join("")}
      </div>`;

    const best = tagRows[0];
    if (best) {
      html += `
        <div class="panel">
          <h3>🧭 Вывод для команды</h3>
          <p style="font-size:15px;color:#c2cce4;margin:0">
            Лидирующее направление — <b style="color:var(--accent-2)">${best.tag}</b>
            (${Math.round(best.rate * 100)}% положительных). Именно в эту сторону логично развивать основной проект.
          </p>
        </div>`;
    }
  }

  const withComments = entries.filter((e) => e.comment && e.comment.length);
  html += `
    <div class="panel">
      <h3>💬 Комментарии команды</h3>
      <p class="sub">${withComments.length ? `Всего: ${withComments.length}` : "Комментариев пока нет."}</p>
      ${withComments
        .map(
          (e) => `
        <div class="comment">
          <div class="comment-head">
            <span>${e.game.emoji} «${e.game.title}»</span>
            <span class="badge ${e.vote === "like" ? "like" : "dislike"}">${e.vote === "like" ? "❤️ Нравится" : "👎 Не зашло"}</span>
            ${e.user_name ? `<span class="comment-author">${escapeHTML(e.user_name)}</span>` : ""}
          </div>
          <p>${escapeHTML(e.comment)}</p>
        </div>`,
        )
        .join("")}
    </div>`;

  if (isAdmin()) {
    html += `
      <div class="panel admin-panel">
        <div class="admin-badge">🔐 Режим администратора</div>
        <h3>⚙️ Данные</h3>
        <p class="sub">Экспорт для отчета и сброс всех оценок.</p>
        <div class="stats-actions">
          <button class="btn btn-primary" id="exportCsv">⬇ Экспорт в CSV</button>
          <button class="btn btn-ghost" id="resetStats">🗑 Сбросить все оценки</button>
          <button class="btn btn-ghost" id="logoutAdmin">🚪 Выйти из режима админа</button>
        </div>
      </div>`;
  }

  root.innerHTML = html;

  /* ---- обработчики ---- */
  const exp = document.getElementById("exportCsv");
  if (exp) exp.addEventListener("click", () => exportCSV(entries));

  const rst = document.getElementById("resetStats");
  if (rst)
    rst.addEventListener("click", async () => {
      if (!confirm("Удалить ВСЕ оценки всех участников? Действие необратимо."))
        return;
      clearRatings();
      if (
        typeof deleteAllRatings === "function" &&
        typeof SUPABASE_READY !== "undefined" &&
        SUPABASE_READY
      ) {
        try {
          await deleteAllRatings();
          console.log("✓ Все оценки удалены на сервере");
        } catch (err) {
          alert("Локально очищено, но сервер вернул ошибку: " + err.message);
        }
      }
      renderStats();
    });

  const lo = document.getElementById("logoutAdmin");
  if (lo) lo.addEventListener("click", logoutAdmin);

  /* ---- автообновление раз в 30 секунд ---- */
  if (!window.__statsInterval) {
    window.__statsInterval = setInterval(() => {
      if (!document.hidden) renderStats();
    }, 30000);
  }
   initScrollReveal();
}



function escapeHTML(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

function exportCSV(entries) {
  const rows = [["ID", "Игра", "Жанр", "Оценка", "Имя", "Комментарий", "Дата"]];
  entries.forEach((e) => {
    rows.push([
      e.game.id,
      e.game.title,
      e.game.genre,
      e.vote === "like"
        ? "Нравится"
        : e.vote === "dislike"
          ? "Не зашло"
          : "Без оценки",
      e.user_name || "",
      e.comment || "",
      e.ts ? new Date(e.ts).toLocaleString("ru-RU") : "",
    ]);
  });
  const csv =
    "\uFEFF" +
    rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "genrelab_ratings.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Плавные переходы ---------- */
function initPageTransitions() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href) return;
    if (
      href.startsWith("#") ||
      href.startsWith("http") ||
      href.startsWith("mailto") ||
      href.startsWith("tel")
    )
      return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();
    document.body.classList.add("page-leaving");
    setTimeout(() => {
      window.location.href = a.href;
    }, 240);
  });

  window.addEventListener("pageshow", () => {
    document.body.classList.remove("page-leaving");
  });
}

function initScrollReveal() {
  const els = document.querySelectorAll(
    ".card, .concept-table, .tile, .panel, .howto",
  );
  if (!els.length || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  els.forEach((el) => io.observe(el));
}

/* ---------- Запуск ---------- */
(function init() {
  renderChrome();
  renderGameGrid();
  initGamePage();
  renderStats();
  checkPending();
  initPageTransitions();
  initScrollReveal();
})();
