/* External voice practice entry. No account data, storage or automatic transmission. */
(function () {
  'use strict';
  var track = document.getElementById('lpTrack');
  var topic = document.getElementById('lpTopic');
  var prompt = document.getElementById('lpPrompt');
  var status = document.getElementById('lpStatus');
  if (!track || !topic || !prompt || !status) return;
  function update() {
    var clinic = track.value === 'clinic';
    var travel = track.value === 'travel';
    var lines = [
      '私は日本人の小児外科医です。英語の目標はCEFR B2を安定させ、その上側へ進むことです。',
      travel ? '今日は旅先で出会った相手役として自然な雑談をしてください。相手の言葉を受けて、自分の話を広げる練習です。' : clinic ? '今日は架空の初診の保護者役として、英語で会話してください。まず挨拶し、私から質問するのを待ってください。' : '今日は便秘の本に関心のある出版社の担当者役として、英語で会話してください。私の自己紹介から始め、本について質問してください。',
      '一度に一問、私が答える前に模範回答を出さず、考える間を待ってください。まず私の今の英語で話させてください。',
      '意味が伝わらないときは会話の中で聞き返してください。質問を変え、理由や具体例も尋ねてください。',
      '短く明確に伝わる英語を尊重し、ネイティブらしさだけの書き換えは避けてください。',
      '私が振り返りを頼んだら、改善点を3つまで日本語で示してください。短い言い方を確認した後、違う質問で使い直させてください。',
      '最後に「言えなかったこと／短い言い方／次回の質問」を3件までまとめてください。前回の記録が見えなければ、覚えているふりをせず確認してください。',
      '30分の目安は復習5分・会話15分・修正5分・使い直し5分です。時間は私が区切ります。',
      clinic ? '患者個人の情報は扱いません。医学内容は私が確認した説明を使います。診療方針を代わりに決めず、理解の確認や言い換えの練習をしてください。' : '本の内容や実績、海外での出版予定を創作しないでください。分からない点は私に質問してください。'
    ];
    if (topic.value.trim()) lines.push('今日伝えたいこと：' + topic.value.trim());
    prompt.value = lines.join('\n\n');
    status.textContent = '';
  }
  track.addEventListener('change', update);
  topic.addEventListener('input', update);
  document.getElementById('lpCopy').addEventListener('click', async function () {
    update();
    var text = prompt.value;
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = 'コピーしました。ChatGPTに貼り付けて、音声で始めてください。';
    } catch (_) {
      prompt.closest('details').open = true;
      prompt.focus(); prompt.select();
      status.textContent = '自動コピーできませんでした。選択された指示を手動でコピーしてください。';
    }
  });
  update();
}());
