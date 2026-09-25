/* Hanaseru — ☁️ クラウド同期（段階3・FR-13）
   ・Google ログイン（院長のアカウント）→ Firestore `hanaseru_users/{uid}` に進捗を保存
   ・PC と iPhone で同じ進捗（連続日数・箱・保存フレーズ・言いたいこと）を共有する
   ・`hanaseru_public/summary` に「連続◯日・身についた数」だけを書く＝Polaris（komori-secretary）が読む
   ・ログインしなくても従来どおり動く（localStorage が正、クラウドは写し） */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect,
  getRedirectResult, signOut, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// 院長の既存プロジェクト（clinic-ops と同じ）。
// authDomain は既定のまま（hanaseru.web.app にすると Google OAuth クライアント側に戻り先の登録が要り、
// 未登録だと redirect_uri_mismatch で止まる＝2026-09-26 に実際に起きた）。
const firebaseConfig = {
  apiKey: "AIzaSyDus7bf7ICiRwdCf8YzWhRHSfn7-5Mf3T0",
  authDomain: "komori-clinic-platform.firebaseapp.com",
  projectId: "komori-clinic-platform",
  storageBucket: "komori-clinic-platform.firebasestorage.app",
  messagingSenderId: "755736145972",
  appId: "1:755736145972:web:8f64a53d2dacceb9e71a61"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const H = window.Hanaseru;          // app.js が公開する { getState, applyRemote, onChange, summary }
let user = null;
let pushTimer = null;

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

async function login() {
  await setPersistence(auth, browserLocalPersistence);
  if (isStandalone()) return signInWithRedirect(auth, provider);   // ホーム画面アプリはポップアップ不可
  try { await signInWithPopup(auth, provider); }
  catch (e) {
    if (e && /popup/.test(String(e.code))) return signInWithRedirect(auth, provider);
    throw e;
  }
}

// ---- 進捗のマージ（端末ごとの差分を"良い方"で合わせる） ----
function mergeStates(local, remote) {
  if (!remote) return local;
  const out = JSON.parse(JSON.stringify(local));
  out.cards = out.cards || {};
  Object.keys(remote.cards || {}).forEach(function (id) {
    const r = remote.cards[id], l = out.cards[id];
    if (!l) { out.cards[id] = r; return; }
    if (r.box > l.box || (r.box === l.box && (r.due || 0) > (l.due || 0))) { l.box = r.box; l.due = r.due; }
    if (r.practiced) l.practiced = true;
  });
  // 連続日数＝より新しい完了日を持つ側を採用（同じ日なら大きい方）
  if ((remote.lastDone || 0) > (out.lastDone || 0)) { out.lastDone = remote.lastDone; out.streak = remote.streak; }
  else if (remote.lastDone === out.lastDone) out.streak = Math.max(out.streak || 0, remote.streak || 0);
  // 言いたいこと（捕獲）＝時刻で和集合
  const seen = {};
  out.captures = (out.captures || []).concat(remote.captures || []).filter(function (c) {
    const k = c.ts + "|" + c.ja; if (seen[k]) return false; seen[k] = true; return true;
  }).sort(function (a, b) { return a.ts - b.ts; });
  // 🔖 保存フレーズ（AI会話・英訳コーチから）＝id で和集合
  const ids = {};
  out.mine = (out.mine || []).concat(remote.mine || []).filter(function (m) {
    if (ids[m.id]) return false; ids[m.id] = true; return true;
  });
  return out;
}

async function pull() {
  const snap = await getDoc(doc(db, "hanaseru_users", user.uid));
  const remote = snap.exists() ? snap.data().state : null;
  const merged = mergeStates(H.getState(), remote);
  H.applyRemote(merged);
  await push(true);
}

function schedulePush() {
  if (!user) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(function () { push(false).catch(function () {}); }, 1500);
}

async function push(now) {
  if (!user) return;
  const state = H.getState();
  const sum = H.summary();
  await setDoc(doc(db, "hanaseru_users", user.uid), {
    state: state, email: user.email || null, updatedAt: serverTimestamp()
  }, { merge: true });
  // Polaris が読む要約（PII なし・数字だけ）
  await setDoc(doc(db, "hanaseru_public", "summary"), {
    streak: sum.streak, lastDone: sum.lastDone, mastered: sum.mastered, total: sum.total,
    lastDoneISO: sum.lastDoneISO, updatedAt: serverTimestamp()
  });
  setStatus("☁️ 同期中：" + (user.email || ""), true);
  if (now) setStatus("☁️ 同期しました：" + (user.email || ""), true);
}

// ---- 画面のフッター表示 ----
function setStatus(text, loggedIn) {
  const el = document.getElementById("cloudStatus");
  const btn = document.getElementById("cloudBtn");
  if (el) el.textContent = text;
  if (btn) btn.textContent = loggedIn ? "ログアウト" : "Google でログインして同期";
}

document.addEventListener("click", function (e) {
  const t = e.target.closest("[data-action='cloud']"); if (!t) return;
  if (user) signOut(auth).then(function () { setStatus("☁️ この端末だけに保存（ログアウト中）", false); });
  else login().catch(function (err) { setStatus("ログインできませんでした：" + (err && err.code || err), false); });
});

getRedirectResult(auth).catch(function (err) { setStatus("ログインできませんでした：" + (err && err.code || err), false); });

onAuthStateChanged(auth, function (u) {
  user = u;
  if (!u) { setStatus("☁️ この端末だけに保存（ログイン前）", false); return; }
  setStatus("☁️ 同期を確認中…", true);
  pull().catch(function (err) { setStatus("同期できませんでした：" + (err && err.code || err), true); });
});

H.onChange(schedulePush);
