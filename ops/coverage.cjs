// 教材の量と、残りを数える（記憶で答えない）。  node ops/coverage.cjs [--all]（--all＝まだ使っていない説明文を全部出す）[--json]
'use strict';
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
process.chdir(path.join(__dirname, '..'));
const C = JSON.parse(fs.readFileSync('ops/curriculum.json', 'utf8')), ALL = process.argv.includes('--all'), JSONOUT = process.argv.includes('--json');
global.window = global; global.self = global;
['data', 'trip', 'visit', 'gutnutri', 'me', 'basics', 'conversation', 'patterns', 'parts', 'listen', 'practice-core', 'scenes-data', 'personal-scenes', 'listening-lessons', 'card-audio', 'listening-audio'].forEach((f) => require('../' + f + '.js'));
fs.readdirSync('packs').filter((f) => f.endsWith('.js')).sort().forEach((f) => require('../packs/' + f));
const scenes = global.HANASERU_SCENES, norm = (t) => String(t).trim();
const size = (p) => { try { return fs.statSync(p).size; } catch (_) { return 0; } };
const minutes = (bytes) => Math.round(bytes / 8000 / 60);   // 64kbps＝1秒8,000バイト
const dirBytes = (d) => fs.existsSync(d) ? fs.readdirSync(d).reduce((n, f) => n + size(path.join(d, f)), 0) : 0;
const bar = (n, t) => { const k = Math.max(0, Math.min(10, Math.round(n / t * 10))); return '█'.repeat(k) + '░'.repeat(10 - k); };
const out = { at: new Date().toISOString().slice(0, 10), rows: [], kits: [] };
const row = (name, n, target, unit) => out.rows.push({ name, n, target, unit: unit || '本' });

// 診察（分野ごと）
const consult = scenes.filter((s) => s.track === 'consult');
Object.keys(C.consultGroups).forEach((g) => row('🩺 診察：' + g, consult.filter((s) => s.group === g).length, C.consultGroups[g].target));
row('🔗 会話のつなぎ', scenes.filter((s) => s.track === 'links').length, C.targets.links, '場面');
row('🎤 ドバイ', scenes.filter((s) => s.track === 'dubai').length, C.targets.dubai);
row('🧩 熟語の耳トレ', (global.HANASERU_PHRASALS || []).length, C.targets.phrasals, '問');
row('👂 耳トレの会話', global.HANASERU_LISTENING_LESSONS.length, C.targets.listeningLessons);
row('📏 現在地チェックの版', ((global.HANASERU_ASSESS || {}).forms || []).length, C.targets.assessForms, '版');
// 通しで聞ける会話の長さ（耳トレ＋診察＋ドバイの「通し」の音声）
let dlg = 0;
global.HANASERU_LISTENING_LESSONS.forEach((l) => { dlg += size((global.HANASERU_LISTENING_AUDIO || {})[l.lines.map((x) => x[1]).join(' ')] || ''); });
scenes.filter((s) => s.voices && (s.track === 'consult' || s.track === 'dubai')).forEach((s) => { dlg += size((global.HANASERU_CARD_AUDIO || {})[norm(s.turns.map((t) => t.heard + ' ' + t.en).join(' '))] || ''); });
row('🎧 通しで聞ける会話', minutes(dlg), C.targets.dialogueMinutes, '分');
out.totals = { exchanges: scenes.reduce((n, s) => n + s.turns.length + (s.challenge ? 1 : 0), 0), cards: global.HANASERU_CARDS.length, audioFiles: Object.keys(global.HANASERU_CARD_AUDIO || {}).length + Object.keys(global.HANASERU_LISTENING_AUDIO || {}).length, audioMinutes: minutes(dirBytes('audio/cards') + dirBytes('audio/listening')), audioMB: Math.round((dirBytes('audio/cards') + dirBytes('audio/listening')) / 1e6) };

// 院長の説明文（既製品チャット）のうち、会話にしたもの・まだのもの
const root = C.kitsRoot.replace(/^~/, os.homedir()), used = new Set();
scenes.forEach((s) => String(s.source || '').split(/[／\s]+/).forEach((x) => { const m = x.match(/K-[^（）\s]+/); if (m) used.add(m[0]); }));
if (fs.existsSync(root)) C.kitFolders.forEach((d) => {
  const dir = path.join(root, d); if (!fs.existsSync(dir)) return;
  const kits = fs.readdirSync(dir).filter((f) => /^K-.*\.md$/.test(f)).map((f) => f.replace(/\.md$/, '').normalize('NFC'));
  const done = kits.filter((k) => used.has(k)), rest = kits.filter((k) => !used.has(k));
  out.kits.push({ folder: d, total: kits.length, used: done.length, rest });
}); else out.kitsNote = '院長の説明文のフォルダが見つからない（この Mac に Vault が無い）';

out.skills = ((C.skills || {}).items || []).map((x) => ({ name: x.name, have: x.have.length, plan: x.plan.length, planList: x.plan }));
if (JSONOUT) { console.log(JSON.stringify(out, null, 1)); process.exit(0); }
console.log('📚 Hanaseru 教材の量（' + out.at + '）　目標は AI の提案・院長の確認待ち');
out.rows.forEach((r) => console.log('  ' + bar(r.n, r.target) + ' ' + String(r.n).padStart(4) + ' / ' + String(r.target).padEnd(4) + r.unit + '　' + r.name));
console.log('  ―― 合計：往復 ' + out.totals.exchanges + '・カード ' + out.totals.cards + '・音声 ' + out.totals.audioFiles + ' 本（約 ' + out.totals.audioMinutes + ' 分・' + out.totals.audioMB + 'MB）');
if (out.kitsNote) console.log('  ' + out.kitsNote);
else {
  console.log('📝 院長の説明文（既製品チャット）のうち、会話にした数');
  out.kits.forEach((k) => console.log('  ' + bar(k.used, k.total || 1) + ' ' + String(k.used).padStart(3) + ' / ' + String(k.total).padEnd(3) + '本　' + k.folder + (k.rest.length ? '　次の候補：' + (ALL ? k.rest : k.rest.slice(0, 4)).map((x) => x.replace(/^K-[^-]+-[^-]+-/, '')).join('、') + (!ALL && k.rest.length > 4 ? ' ほか' + (k.rest.length - 4) : '') : '')));
}
if (out.skills.length) {
  console.log('🧭 院長の4つの課題と、練習の型（ある＝いま使える／これから＝未着手の案）');
  out.skills.forEach((k) => console.log('  ' + k.name + '　ある ' + k.have + '・これから ' + k.plan + (ALL ? '\n' + k.planList.map((x) => '      - ' + x).join('\n') : '')));
}
