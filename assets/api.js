/* ============================================================
   Supabase API — синхронизация оценок между устройствами
   ============================================================ */

// ⚙️ ЗАМЕНИТЕ на свои значения из Project Settings → API
const SUPABASE_URL = "https://biazqrmtlgfyqgkyzjsu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_iSR1ITauCLu-zWhBeZHaDw_osYAgkTm";

const SUPABASE_READY =
  !SUPABASE_URL.includes("ВАШ-ПРОЕКТ") && SUPABASE_URL.startsWith("https://");

/* --- низкоуровневый запрос --- */
async function sbFetch(path, options = {}) {
  if (!SUPABASE_READY) throw new Error("Supabase не настроен");

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase ${res.status}: ${txt}`);
  }
  return res.json();
}

/* --- локальный ID пользователя (генерируется один раз) --- */
function getUserId() {
  let id = localStorage.getItem("genrelab_user_id");
  if (!id) {
    id =
      (crypto.randomUUID && crypto.randomUUID()) ||
      "u_" + Date.now() + "_" + Math.random().toString(36).slice(2);
    localStorage.setItem("genrelab_user_id", id);
  }
  return id;
}

function getUserName() {
  return localStorage.getItem("genrelab_user_name") || "";
}

function setUserName(name) {
  localStorage.setItem("genrelab_user_name", (name || "").trim().slice(0, 60));
}

/* --- upsert: вставка или обновление по (user_id, game_id) --- */
async function pushRating({ gameId, gameTitle, vote, comment }) {
  const body = [
    {
      game_id: Number(gameId),
      game_title: gameTitle || "",
      vote,
      comment: comment || "",
      user_id: getUserId(),
      user_name: getUserName() || "Аноним",
    },
  ];

  return sbFetch("ratings?on_conflict=user_id,game_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(body),
  });
}

/* --- получить все оценки --- */
async function fetchAllRatings() {
  return sbFetch("ratings?select=*&order=created_at.desc");
}

/* --- агрегированная статистика по всем пользователям --- */
async function fetchStats() {
  return sbFetch("ratings?select=game_id,game_title,vote");
}
