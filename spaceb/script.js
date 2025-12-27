/* ===== 状態 ===== */
let score = Number(localStorage.getItem("score")) || 0;
let perClick = Number(localStorage.getItem("perClick")) || 1;
let autoClickers = Number(localStorage.getItem("autoClickers")) || 0;
let upgradeCost = Number(localStorage.getItem("upgradeCost")) || 10;
let autoCost = Number(localStorage.getItem("autoCost")) || 50;
let offlineUnlocked = localStorage.getItem("offlineUnlocked") === "true";

/* ===== 定数 ===== */
const OFFLINE_UNLOCK_SCORE = 7500;
const MAX_OFFLINE_SECONDS = 60 * 60 * 8;

/* ===== DOM ===== */
const scoreEl = document.getElementById("score");
const cpsEl = document.getElementById("cps");
const clickBtn = document.getElementById("click-upgrade");
const autoBtn = document.getElementById("auto-upgrade");

/* ===== 表記 ===== */
function format(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return Math.floor(n);
}

const feedbackEl = document.createElement("div");
feedbackEl.id = "click-feedback";
feedbackEl.textContent = "+0";
document.body.appendChild(feedbackEl);

let feedbackTimeout = null;

/* ===== CPS ===== */
let clickLog = [];

function autoGainPerSecond() {
  return autoClickers * perClick * (1 + autoClickers * 0.05);
}

function updateCPS() {
  const now = Date.now();
  let manual = 0;

  clickLog = clickLog.filter((e) => {
    const alive = now - e.time <= 1000;
    if (alive) manual += e.gain;
    return alive;
  });

  cpsEl.textContent = format(manual + autoGainPerSecond()) + " CPS";
}

/* ===== 描画 ===== */
function render() {
  scoreEl.textContent = format(score);
  clickBtn.textContent = `+1 / Click (Cost: ${format(upgradeCost)})`;
  autoBtn.textContent = `Auto Clicker (${autoClickers}) Cost: ${format(autoCost)}`;
}

/* ===== 入力 ===== */
function showClickFeedback(value) {
  const rect = scoreEl.getBoundingClientRect();

  feedbackEl.textContent = `+${value}`;

  feedbackEl.style.left = rect.left + rect.width / 2 + "px";
  feedbackEl.style.top = rect.top - 20 + "px";
  feedbackEl.style.transform = "translateX(-50%)";

  feedbackEl.classList.remove("show");
  void feedbackEl.offsetWidth; // 再トリガー
  feedbackEl.classList.add("show");

  clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(() => {
    feedbackEl.classList.remove("show");
  }, 150);
}

function handleClick() {
  score += perClick;
  clickLog.push({ time: Date.now(), gain: perClick });
  checkOfflineUnlock();
  showClickFeedback(perClick);
  render(); // ← これ追加
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !e.repeat) {
    handleClick();
  }
});

document.addEventListener("pointerdown", handleClick);

/* ===== アップグレード ===== */
clickBtn.onclick = () => {
  if (score < upgradeCost) return;
  score -= upgradeCost;
  perClick++;
  upgradeCost = Math.floor(upgradeCost * 1.5);
};

autoBtn.onclick = () => {
  if (score < autoCost) return;
  score -= autoCost;
  autoClickers++;
  autoCost = Math.floor(autoCost * 1.6);
};

/* ===== オフライン解禁 ===== */
function checkOfflineUnlock() {
  if (!offlineUnlocked && score >= OFFLINE_UNLOCK_SCORE) {
    offlineUnlocked = true;
    localStorage.setItem("offlineUnlocked", "true");
  }
}

/* ===== オフライン収益 ===== */
function applyOfflineEarnings() {
  if (!offlineUnlocked) return;
  const last = Number(localStorage.getItem("lastPlayed"));
  if (!last) return;

  let seconds = Math.floor((Date.now() - last) / 1000);
  seconds = Math.min(seconds, MAX_OFFLINE_SECONDS);

  const gain = Math.floor(seconds * autoGainPerSecond());
  if (gain <= 0) return;

  score += gain;

  document.getElementById("offline-time").textContent =
    `放置時間：${Math.floor(seconds / 60)}分`;
  document.getElementById("offline-gain").textContent =
    `+${format(gain)} 獲得！`;

  document.getElementById("offline-popup").classList.remove("hidden");
}

document.getElementById("offline-close").onclick = () => {
  document.getElementById("offline-popup").classList.add("hidden");
};

/* ===== セーブ初期化 ===== */
function resetSaveData() {
  // 必要なキーを完全削除
  const keys = [
    "score",
    "perClick",
    "autoClickers",
    "upgradeCost",
    "autoCost",
    "offlineUnlocked",
    "lastPlayed",
  ];
  keys.forEach((k) => localStorage.removeItem(k));

  // JS側の状態も完全リセット
  score = 0;
  perClick = 1;
  autoClickers = 0;
  upgradeCost = 10;
  autoCost = 50;
  offlineUnlocked = false;

  // 画面更新
  render();

  // 確実に初期化した感を出す
  alert("セーブデータを完全に初期化しました！");
}

document.getElementById("reset-btn").onclick = () => {
  if (confirm("セーブデータを完全に削除しますか？")) {
    resetSaveData();
  }
};

/* ===== ループ ===== */
setInterval(() => {
  score += autoGainPerSecond();
  updateCPS();
  render();
}, 1000);

/* ===== 保存 ===== */
setInterval(() => {
  localStorage.setItem("score", score);
  localStorage.setItem("perClick", perClick);
  localStorage.setItem("autoClickers", autoClickers);
  localStorage.setItem("upgradeCost", upgradeCost);
  localStorage.setItem("autoCost", autoCost);
}, 250);

window.addEventListener("beforeunload", () => {
  localStorage.setItem("lastPlayed", Date.now());
});

/* ===== 起動 ===== */
applyOfflineEarnings();
render();
