# Hanaseru — AI で直すときのきまり（Claude・Codex 共通）

このリポは **Claude Code と Codex の両方** が直す。あとで「どちらが書いたか」が必ず分かるように、次の3つを守る。
（2026-10-03 院長指示。きっかけ＝10/1 の Codex の改修が、作者の印なしで「定期バックアップ」コミットに混ざった）

## 1. 自分の変更は、自分ですぐコミットする（バックアップに拾わせない）
- 作業の区切りごとにコミットする。未コミットのまま置くと、夜の定期バックアップ（backup-all）が
  作者不明の `chore: 定期バックアップ` としてまとめてしまう。
- `git add -A` は使わず、自分が触ったファイルだけをパスで指定する。

## 2. コミットの末尾に「誰が書いたか」を1行入れる
```
AI-Agent: Claude (claude-opus-5-5)
AI-Agent: Codex (gpt-6-astra)
```
- `AI-Agent:` 行は必須。モデル名はそのとき使っているものを書く。
  ほかの帰属行（Co-Authored-By など）は、それぞれのツールの作法どおりに書いてよい。
- 院長が自分の手で書いたコミットには入れない（印がない＝院長の手）。

## 3. 開発ログの見出しに【Claude】【Codex】を付ける
- Vault `22_アプリ開発/Hanaseru 語学トレーニング/04_開発ログ.md` に、公開ごとに1節を書く。
  見出しの例：`## 2026-10-03 【Codex】v46 ことば帳の分類`
- 院長の言葉（何を頼まれたか）と、何を変えたかを書く。

## あとから印を付けるとき（履歴は書き換えない）
作者の印なしで入ってしまったコミットは、rebase や amend で直さない。git notes で注記する。
```
git notes add -m "AI-Agent: Codex (gpt-6-astra) — Codex session <id>" <commit>
git push origin refs/notes/commits
```

## 機械で確かめる
`bin/check` の「作者の印」の行が、2026-10-03 以降のコミットに `AI-Agent:` 行か git notes があるかを確かめる。
定期バックアップのコミットにコードが入っていたら ❌ を出す。

## 公開手順
コミット → push → `firebase deploy --only hosting`（AI 部分を変えたら `--only functions` も）→ `bin/check`。
`sw.js` の CACHE 番号を上げないと、iPhone に古い画面が残る。
