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
// authDomain＝本サイト（hanaseru.web.app）。iPhone の Safari／ホーム画面アプリは、別ドメイン経由の
// ログイン（firebaseapp.com）を Safari が遮る（2026-09-29 に実際に起きた）ため、同じドメインで認証する。
// 前提：Google Cloud の OAuth クライアントに https://hanaseru.web.app/__/auth/handler を登録済みであること
// （未登録だと redirect_uri_mismatch＝2026-09-26 に起きた）。
const firebaseConfig = {
  apiKey: "AIzaSyDus7bf7ICiRwdCf8YzWhRHSfn7-5Mf3T0",
  authDomain: "hanaseru.web.app",
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

function isIOS() { return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
async function login() {
  await setPersistence(auth, browserLocalPersistence);
  setStatus("Google のログイン画面へ移ります…", false);
  if (isStandalone() || isIOS()) return signInWithRedirect(auth, provider);   // iPhone はポップアップが不安定なので、同じ画面で行って戻る
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
    // 新しい「まだ」を古い高い箱で上書きしない。旧データは従来の比較に対応。
    if ((r.updatedAt || 0) > (l.updatedAt || 0) ||
        (!r.updatedAt && !l.updatedAt && (r.box > l.box || (r.box === l.box && (r.due || 0) > (l.due || 0))))) {
      Object.assign(l, r);
    }
    if (r.practiced) l.practiced = true;
  });
  // 会話の途中経過は場面ごとに新しい記録を採用。再挑戦の index=0 も尊重する。
  out.scenes = out.scenes || {};
  Object.keys(remote.scenes || {}).forEach(function (id) {
    const r = remote.scenes[id], l = out.scenes[id];
    if (!l || (r.updatedAt || 0) > (l.updatedAt || 0)) out.scenes[id] = r;
  });
  // 連続日数＝より新しい完了日を持つ側を採用（同じ日なら大きい方）
  if ((remote.lastDone || 0) > (out.lastDone || 0)) { out.lastDone = remote.lastDone; out.streak = remote.streak || 0; }
  else if (remote.lastDone === out.lastDone) out.streak = Math.max(out.streak || 0, remote.streak || 0);
  if (out.streak == null) out.streak = 0;
  if (out.lastDone === undefined) out.lastDone = null;
  if (!out.rate) out.rate = "slow";
  // 言いたいこと（捕獲）＝時刻で和集合
  const seen = new Map();
  (out.captures || []).concat(remote.captures || []).forEach(function (c) {
    const k = c.ts + "|" + c.ja, previous = seen.get(k);
    if (!previous || (c.updatedAt || 0) > (previous.updatedAt || 0)) seen.set(k, c);
  });
  out.captures = Array.from(seen.values()).sort(function (a, b) { return a.ts - b.ts; });
  // 🗣 話した記録＝日ごとに大きい方
  var tk = {}; (out.talks || []).concat(remote.talks || []).forEach(function (t) { tk[t.d] = Math.max(tk[t.d] || 0, t.n); });
  out.talks = Object.keys(tk).sort().map(function (d) { return { d: +d, n: tk[d] }; }).slice(-60);
  // 🎤 お題の節目＝箱が進んでいる方
  var mo = {}; [out.mono || {}, remote.mono || {}].forEach(function (m) { Object.keys(m).forEach(function (t) { if (!mo[t] || m[t].box > mo[t].box) mo[t] = m[t]; }); });
  out.mono = mo;
  out.practiceDays = Array.from(new Set(window.HanaseruPracticeCore.activityDays(local)
    .concat(window.HanaseruPracticeCore.activityDays(remote)))).sort((a,b)=>a-b);
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
    streak: sum.streak, lastDone: sum.lastDone, mastered: sum.mastered, total: sum.total, talks7d: sum.talks7d || 0,
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

getRedirectResult(auth).then(function (r) { if (r && r.user) setStatus("☁️ ログインしました。同期を確認中…", true); })
  .catch(function (err) { setStatus("ログインできませんでした：" + (err && (err.code + " " + err.message) || err), false); });

onAuthStateChanged(auth, function (u) {
  user = u;
  if (!u) { setStatus("☁️ この端末だけに保存（ログイン前）", false); return; }
  setStatus("☁️ 同期を確認中…", true);
  pull().catch(function (err) { setStatus("同期できませんでした：" + (err && err.code || err), true); });
});

H.onChange(schedulePush);
