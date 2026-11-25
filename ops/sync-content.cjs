// 教材の骨格：packs/ に置いた教材ファイルを、点検して、アプリに登録する。
//   node ops/sync-content.cjs            点検 → index.html と content-files.js を書き直す
//   node ops/sync-content.cjs --check    点検だけ（書き直さない）。登録や音声が欠けていたら exit 1（bin/check が使う）
//   node ops/sync-content.cjs --bump     上に加えて、版（sw.js の CACHE とメニューの表示）を1つ上げる
// 教材を足すとき：packs/ にファイルを1つ置く → bin/content（このスクリプト＋音声づくり）。3か所を手で直す必要はない。
// 教材ファイルの型は4つ（どれか、または複数を1ファイルに入れてよい）：
//   場面（HANASERU_SCENES に push）／熟語（HANASERU_PHRASALS）／現在地チェック（HANASERU_ASSESS）／耳トレの会話（HANASERU_LISTENING_LESSONS）
'use strict';
const fs = require('node:fs'), path = require('node:path');
process.chdir(path.join(__dirname, '..'));
const CHECK = process.argv.includes('--check'), BUMP = process.argv.includes('--bump');
const VOICES = ['en-US-Neural2-D', 'en-US-Neural2-F', 'en-GB-Neural2-B', 'en-GB-Neural2-A', 'en-AU-Neural2-B', 'en-AU-Neural2-A'];
const TRACKS = { consult: '🩺 診察', links: '🔗 会話のつなぎ', dubai: '🎤 ドバイ', clinic: '診療で話す', travel: '旅先', personal: '自分を語る' };
const GROUPS = Object.keys(JSON.parse(fs.readFileSync('ops/curriculum.json', 'utf8')).consultGroups);   // 診察の分野は ops/curriculum.json が正
const errors = [], warns = [];
const err = (file, msg) => errors.push(file + '：' + msg), warn = (file, msg) => warns.push(file + '：' + msg);
const words = (t) => String(t).trim().split(/\s+/).length;
const norm = (t) => String(t == null ? '' : t).replace(/___/g, '…').trim();

global.window = global; global.self = global;
['practice-core', 'scenes-data', 'personal-scenes', 'listening-lessons'].forEach((f) => require('../' + f + '.js'));
const baseScenes = new Set(global.HANASERU_SCENES.map((s) => s.id)), baseLessons = global.HANASERU_LISTENING_LESSONS.length;
const packs = fs.readdirSync('packs').filter((f) => f.endsWith('.js')).sort();
const count = () => ({ numbers: (global.HANASERU_NUMBERS || []).length, talks: (global.HANASERU_TALKS || []).length, sounds: (global.HANASERU_SOUNDS || []).length, builds: (global.HANASERU_BUILDS || []).length, scenes: global.HANASERU_SCENES.length, pv: (global.HANASERU_PHRASALS || []).length, assess: ((global.HANASERU_ASSESS || {}).forms || []).length, lessons: global.HANASERU_LISTENING_LESSONS.length });
const owner = {};   // 教材の id → どのファイルのものか
const report = [];
packs.forEach((file) => {
  const before = count();
  try { require('../packs/' + file); } catch (e) { err(file, '読み込めない（' + e.message + '）'); return; }
  const after = count();
  const added = { numbers: after.numbers - before.numbers, talks: after.talks - before.talks, sounds: after.sounds - before.sounds, builds: after.builds - before.builds, scenes: after.scenes - before.scenes, pv: after.pv - before.pv, assess: after.assess - before.assess, lessons: after.lessons - before.lessons };
  if (!added.scenes && !added.pv && !added.assess && !added.lessons && !added.sounds && !added.builds && !added.talks && !added.numbers) err(file, '教材が1つも足されていない（HANASERU_SCENES への push などを確かめる）');
  global.HANASERU_SCENES.slice(before.scenes).forEach((s) => { s.__file = file; });
  (global.HANASERU_PHRASALS || []).slice(before.pv).forEach((p) => { p.__file = file; });
  global.HANASERU_LISTENING_LESSONS.slice(before.lessons).forEach((l) => { l.__file = file; });
  report.push({ file, added });
});

// ---- 点検：場面 ----
const ids = new Set(baseScenes);
global.HANASERU_SCENES.filter((s) => s.__file).forEach((s) => {
  const f = s.__file, at = (m) => err(f, (s.id || '(idなし)') + ' ' + m);
  if (!s.id || !/^[a-z0-9-]+$/.test(s.id)) at('id は英小文字・数字・ハイフンだけ');
  if (ids.has(s.id)) at('id が重なっている'); ids.add(s.id);
  if (!TRACKS[s.track]) at('track が未知（' + s.track + '）。使えるのは ' + Object.keys(TRACKS).join(' / '));
  ['title', 'role', 'context', 'goal'].forEach((k) => { if (!s[k]) at(k + ' が無い'); });
  if (!Array.isArray(s.turns) || s.turns.length < 3 || s.turns.length > 9) at('turns は3〜9往復');
  if (!s.challenge) at('challenge（最後の1往復）が無い');
  if (!s.voices || VOICES.indexOf(s.voices.heard) < 0 || VOICES.indexOf(s.voices.en) < 0) at('voices.heard / voices.en は決まった6つの声から');
  if ((s.track === 'consult' || s.track === 'dubai') && !s.source) at('source（元にした院長の説明文・原稿）が無い');
  if (s.track === 'consult' && GROUPS.indexOf(s.group) < 0) at('group が未知（' + s.group + '）。使えるのは ' + GROUPS.join(' / ') + '。新しい分野は ops/curriculum.json と scenes.js の並び順に足す');
  (s.turns || []).concat(s.challenge ? [s.challenge] : []).forEach((t, n) => {
    ['heard', 'heardJa', 'intent', 'en', 'note'].forEach((k) => { if (!t[k]) at((n + 1) + '往復目の ' + k + ' が無い'); });
    if (t.en && words(t.en) > 70) at((n + 1) + '往復目の手本が長い（' + words(t.en) + '語）。2〜3文に分けて70語以内に');
    if (t.en && /\b(guarantee|definitely will|100%|cure[sd]? completely)\b/i.test(t.en)) warn(f, s.id + ' ' + (n + 1) + '往復目：言い切りに近い表現がある（効果を約束しない）');
  });
});
// ---- 点検：熟語 ----
const pvIds = new Set(), pvJa = new Set();
(global.HANASERU_PHRASALS || []).forEach((p) => {
  const f = p.__file || 'packs', at = (m) => err(f, (p.id || '(idなし)') + ' ' + m);
  ['id', 'base', 'pv', 'ja', 'en', 'enJa', 'scene', 'voice'].forEach((k) => { if (typeof p[k] !== 'string' || !p[k]) at(k + ' が無い'); });
  if (pvIds.has(p.id)) at('id が重なっている'); pvIds.add(p.id);
  if (pvJa.has(p.ja)) at('ja（' + p.ja + '）がほかの問題と同じ。4択の選択肢になるので、見分けがつく訳にする'); pvJa.add(p.ja);
  if (VOICES.indexOf(p.voice) < 0) at('voice は決まった6つの声から');
  if (p.en && (words(p.en) < 6 || words(p.en) > 20)) at('en は6〜20語');
});
// ---- 点検：音の変化・文にする ----
const sndIds = new Set();
(global.HANASERU_SOUNDS || []).forEach((x) => {
  const at = (m) => err('packs/sound', (x.id || '(idなし)') + ' ' + m);
  ['id', 'kind', 'focus', 'en', 'ja', 'note', 'voice'].forEach((k) => { if (typeof x[k] !== 'string' || !x[k]) at(k + ' が無い'); });
  if (sndIds.has(x.id)) at('id が重なっている'); sndIds.add(x.id);
  if (VOICES.indexOf(x.voice) < 0) at('voice は決まった6つの声から');
  if (!Array.isArray(x.options) || x.options.length < 2 || new Set(x.options).size !== x.options.length || !(x.answer >= 0 && x.answer < x.options.length)) at('options / answer の形が違う');
  if (x.kind === 'reduce' && (!x.slow || x.slow === x.en)) at('reduce には slow（省略のない形）が要る');
  if (x.kind === 'contrast' && x.options[x.answer] !== x.en) at('contrast は、en が正解の選択肢と同じ文');
});
const bldIds = new Set();
(global.HANASERU_BUILDS || []).forEach((x) => {
  const at = (m) => err('packs/build', (x.id || '(idなし)') + ' ' + m);
  ['id', 'scene', 'frame', 'ja', 'model', 'add', 'addJa', 'longer', 'longerJa', 'note'].forEach((k) => { if (typeof x[k] !== 'string' || !x[k]) at(k + ' が無い'); });
  if (bldIds.has(x.id)) at('id が重なっている'); bldIds.add(x.id);
  if (!Array.isArray(x.keys) || x.keys.length !== 3) at('keys は3つ');
  if (x.model && x.longer && !x.longer.startsWith(x.model.replace(/[.!?]$/, ''))) at('longer は model から始める');
  if (x.longer && words(x.longer) > 40) at('longer が長い（40語以内）');
});
// ---- 点検：数字 ----
const numIds = new Set();
(global.HANASERU_NUMBERS || []).forEach((x) => {
  const at = (m) => err('packs/number', (x.id || '(idなし)') + ' ' + m);
  ['id', 'scene', 'unit', 'en', 'ja', 'image', 'note', 'voice'].forEach((k) => { if (typeof x[k] !== 'string' || !x[k]) at(k + ' が無い'); });
  if (numIds.has(x.id)) at('id が重なっている'); numIds.add(x.id);
  if (VOICES.indexOf(x.voice) < 0) at('voice は決まった6つの声から');
  if (!Array.isArray(x.options) || x.options.length !== 4 || new Set(x.options).size !== 4 || !(x.answer >= 0 && x.answer <= 3)) at('options×4 / answer の形が違う');
  if (x.en && /[0-9]/.test(x.en)) at('en の数字は、話すとおりに単語で書く（数字を使わない）');
});
// ---- 点検：長い話 ----
const talkIds = new Set();
(global.HANASERU_TALKS || []).forEach((t) => {
  const at = (m) => err('packs/talks', (t.id || '(idなし)') + ' ' + m);
  ['id', 'topic', 'title', 'speaker', 'voice'].forEach((k) => { if (typeof t[k] !== 'string' || !t[k]) at(k + ' が無い'); });
  if (talkIds.has(t.id)) at('id が重なっている'); talkIds.add(t.id);
  if (VOICES.indexOf(t.voice) < 0) at('voice は決まった6つの声から');
  if (!Array.isArray(t.parts) || t.parts.length < 2 || t.parts.length > 5) at('parts は2〜5区切り');
  (t.parts || []).forEach((p, i) => {
    if (!p.en || !p.ja || !p.q || !Array.isArray(p.options) || p.options.length !== 3 || !(p.answer >= 0 && p.answer <= 2)) at((i + 1) + '区切り目の形が違う（en・ja・q・options×3・answer）');
    if (p.en && (words(p.en) < 25 || words(p.en) > 80)) at((i + 1) + '区切り目は25〜80語');
  });
});
// ---- 点検：現在地チェック ----
((global.HANASERU_ASSESS || {}).forms || []).forEach((form) => {
  const f = 'packs/assess', at = (m) => err(f, '版 ' + form.id + ' ' + m);
  if (!Array.isArray(form.listening) || form.listening.length !== 10) at('聞く問題は10問');
  if (!Array.isArray(form.speaking) || form.speaking.length !== 3) at('話す問題は3問');
  (form.listening || []).forEach((x) => {
    if (!x.en || !x.ja || !x.q || !Array.isArray(x.options) || x.options.length !== 4 || !(x.answer >= 0 && x.answer <= 3)) at(x.id + ' の形が違う（en・ja・q・options×4・answer）');
    if (VOICES.indexOf(x.voice) < 0) at(x.id + ' の voice');
  });
  (form.speaking || []).forEach((x, i) => { if (x.kind !== ['opinion', 'respond', 'rephrase'][i] || !x.promptEn || !x.promptJa || !x.hintJa) at(x.id + ' の形が違う（意見・その場で返す・言い換える の順）'); });
});
// ---- 点検：耳トレの会話 ----
global.HANASERU_LISTENING_LESSONS.forEach((l, i) => {
  const f = l.__file || 'listening-lessons.js', at = (m) => err(f, (l.title || i) + ' ' + m);
  ['title', 'place', 'gist', 'sound', 'pattern', 'reply', 'scenario'].forEach((k) => { if (!l[k]) at(k + ' が無い'); });
  if (!l.who || !l.voices || VOICES.indexOf(l.voices.A) < 0 || VOICES.indexOf(l.voices.B) < 0) at('who / voices（A・B）');
  if (!Array.isArray(l.lines) || l.lines.length < 4) at('lines は4行以上');
  (l.chunks || []).forEach((c) => { if (!(l.lines || []).some((x) => x[1].includes(c[0]))) at('区切り「' + c[0] + '」が、どの行にも無い'); });
  if (!l.chunks || l.chunks.length < 2) at('chunks は2つ以上（前日の復習に使う）');
});

// ---- 登録：index.html と content-files.js ----
const tags = packs.map((f) => '<script src="packs/' + f + '"></script>').join('\n');
const block = '<!-- content:start（ops/sync-content.cjs が書く。手で直さない） -->\n' + tags + '\n<!-- content:end -->';
let html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<!-- content:start[\s\S]*?<!-- content:end -->/);
if (!m) err('index.html', '<!-- content:start --> 〜 <!-- content:end --> の枠が無い');
const filesJs = '/* ops/sync-content.cjs が書く。手で直さない。service worker が端末に保存する教材ファイル。 */\nself.HANASERU_CONTENT_FILES=' + JSON.stringify(packs.map((f) => './packs/' + f), null, 1) + ';\n';
const filesNow = fs.existsSync('content-files.js') ? fs.readFileSync('content-files.js', 'utf8') : '';
const inSync = m && m[0] === block && filesNow === filesJs;
if (CHECK && !inSync) err('登録', 'packs/ の中身と、index.html・content-files.js が合っていない → node ops/sync-content.cjs');

// ---- 点検：音声（--check のときだけ。作るのは node ops/build-card-audio.cjs / build-listening-audio.cjs） ----
if (CHECK) {
  let cards = {}, listening = {};
  try { require('../card-audio.js'); cards = global.HANASERU_CARD_AUDIO || {}; require('../listening-audio.js'); listening = global.HANASERU_LISTENING_AUDIO || {}; } catch (e) { err('音声', '対応表を読めない'); }
  const need = (map, text, label, file) => { const p = map[norm(text)]; if (!p) err(file, '音声が無い：' + label); else if (!fs.existsSync(p)) err(file, '音声ファイルが無い：' + p); };
  global.HANASERU_SCENES.filter((s) => s.__file).forEach((s) => {
    s.turns.concat([s.challenge]).forEach((t) => { need(cards, t.heard, s.id, s.__file); need(cards, t.en, s.id, s.__file); });
    if (s.track === 'consult' || s.track === 'dubai') need(cards, s.turns.map((t) => t.heard + ' ' + t.en).join(' '), s.id + '（通し）', s.__file);
  });
  (global.HANASERU_PHRASALS || []).forEach((p) => need(cards, p.en, p.id, p.__file || 'packs'));
  (global.HANASERU_TALKS || []).forEach((t) => t.parts.forEach((p, i) => need(cards, p.en, t.id + '（' + (i + 1) + '）', 'packs/talks')));
  (global.HANASERU_NUMBERS || []).forEach((x) => need(cards, x.en, x.id, 'packs/number'));
  (global.HANASERU_SOUNDS || []).forEach((x) => { need(cards, x.en, x.id, 'packs/sound'); if (x.slow) need(cards, x.slow, x.id + '（ゆっくり）', 'packs/sound'); });
  (global.HANASERU_BUILDS || []).forEach((x) => { need(cards, x.model, x.id, 'packs/build'); need(cards, x.longer, x.id + '（伸ばした文）', 'packs/build'); });
  ((global.HANASERU_ASSESS || {}).forms || []).forEach((f) => { f.listening.forEach((x) => need(cards, x.en, x.id, 'packs/assess')); f.speaking.forEach((x) => need(cards, x.promptEn, x.id, 'packs/assess')); });
  global.HANASERU_LISTENING_LESSONS.forEach((l) => { need(listening, l.lines.map((x) => x[1]).join(' '), l.title, l.__file || 'listening-lessons.js'); l.chunks.forEach((c) => need(listening, c[0], l.title, l.__file || 'listening-lessons.js')); });
}

if (errors.length) { console.log('❌ 教材の点検で ' + errors.length + ' 件\n' + [...new Set(errors)].slice(0, 40).map((e) => '  - ' + e).join('\n')); process.exit(1); }
if (!CHECK) {
  if (!inSync) { fs.writeFileSync('index.html', html.replace(m[0], block)); fs.writeFileSync('content-files.js', filesJs); }
  if (BUMP) {
    let sw = fs.readFileSync('sw.js', 'utf8'); const v = +sw.match(/hanaseru-v(\d+)/)[1], next = v + 1;
    fs.writeFileSync('sw.js', sw.replace('hanaseru-v' + v, 'hanaseru-v' + next));
    html = fs.readFileSync('index.html', 'utf8'); fs.writeFileSync('index.html', html.replace('最新版を読み込む（v' + v + '）', '最新版を読み込む（v' + next + '）'));
    console.log('版を上げました：v' + v + ' → v' + next);
  }
  report.forEach((r) => console.log('  ' + r.file + '：' + [['数字', r.added.numbers], ['長い話', r.added.talks], ['音', r.added.sounds], ['文にする', r.added.builds], ['場面', r.added.scenes], ['熟語', r.added.pv], ['現在地の版', r.added.assess], ['耳トレ', r.added.lessons]].filter((x) => x[1]).map((x) => x[0] + ' ' + x[1]).join('・')));
  console.log(inSync ? '登録は最新です（' + packs.length + ' ファイル）' : '登録を書き直しました（' + packs.length + ' ファイル）');
}
warns.forEach((w) => console.log('  ⚠ ' + w));
if (CHECK) console.log('OK 教材 ' + packs.length + ' ファイル');
