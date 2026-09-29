/* Hanaseru 🔰 日常の基本 — 取り違えやすい・忘れやすい日常の型（院長 2026-09-29「日常的なことをだいぶ忘れてしまった」）
   短い文・1文1情報。（相手）＝相手が言うこと＝先に耳に入れておく。答えはその直後。
   domain "basics"。順番どおり出る（parts.js の流れ "basics"）。 */
(function () {
  var B = [
    // ① はじめまして・調子どう
    { id: "bs-01", domain: "basics", part: "① はじめまして", ja: "はじめまして。", en: "Nice to meet you." },
    { id: "bs-02", domain: "basics", part: "① はじめまして", ja: "（別れ際に）お会いできてよかったです。", en: "It was nice meeting you." },
    { id: "bs-03", domain: "basics", part: "① はじめまして", ja: "（相手）調子はどう？", en: "How are you doing?" },
    { id: "bs-04", domain: "basics", part: "① はじめまして", ja: "いいですよ、ありがとう。そちらは？", en: "Good, thanks. How about you?" },
    { id: "bs-05", domain: "basics", part: "① はじめまして", ja: "（相手）お仕事は何ですか？", en: "What do you do?" },
    { id: "bs-06", domain: "basics", part: "① はじめまして", ja: "子どもの医者です。東京から来ました。", en: "I'm a children's doctor. I'm from Tokyo." },
    { id: "bs-07", domain: "basics", part: "① はじめまして", ja: "（相手）どちらから？", en: "Where are you from?" },
    { id: "bs-08", domain: "basics", part: "① はじめまして", ja: "日本です。東京です。", en: "Japan. Tokyo." },
    // ② 声をかける・あやまる（Excuse me と Sorry）
    { id: "bs-09", domain: "basics", part: "② 声をかける・あやまる", ja: "（人に声をかける・通してもらう）すみません。", en: "Excuse me." },
    { id: "bs-10", domain: "basics", part: "② 声をかける・あやまる", ja: "（ぶつかった・迷惑をかけた）すみません。", en: "Sorry." },
    { id: "bs-11", domain: "basics", part: "② 声をかける・あやまる", ja: "（聞き取れなかった）すみません、もう一度？", en: "Sorry?" },
    { id: "bs-12", domain: "basics", part: "② 声をかける・あやまる", ja: "遅れてすみません。", en: "Sorry I'm late." },
    { id: "bs-13", domain: "basics", part: "② 声をかける・あやまる", ja: "（相手が謝ったら）大丈夫ですよ。", en: "No problem." },
    // ③ ありがとう・どういたしまして
    { id: "bs-14", domain: "basics", part: "③ ありがとう", ja: "ありがとうございます。", en: "Thank you." },
    { id: "bs-15", domain: "basics", part: "③ ありがとう", ja: "本当に助かりました。", en: "Thank you so much. That really helped." },
    { id: "bs-16", domain: "basics", part: "③ ありがとう", ja: "（相手）どういたしまして。", en: "You're welcome." },
    { id: "bs-17", domain: "basics", part: "③ ありがとう", ja: "（軽く）いえいえ。", en: "No worries." },
    // ④ 頼む・断る
    { id: "bs-18", domain: "basics", part: "④ 頼む・断る", ja: "お願いします。／はい、ぜひ。", en: "Yes, please." },
    { id: "bs-19", domain: "basics", part: "④ 頼む・断る", ja: "いいえ、結構です。ありがとう。", en: "No, thank you." },
    { id: "bs-20", domain: "basics", part: "④ 頼む・断る", ja: "（勧められて）はい、いただきます。", en: "Sure, I'd love some." },
    { id: "bs-21", domain: "basics", part: "④ 頼む・断る", ja: "（相手）どうぞ。", en: "Go ahead." },
    { id: "bs-22", domain: "basics", part: "④ 頼む・断る", ja: "（席・順番を譲る）お先にどうぞ。", en: "After you." },
    // ⑤ 分からない・確かめる
    { id: "bs-23", domain: "basics", part: "⑤ 分からない・確かめる", ja: "分かりません。", en: "I'm not sure." },
    { id: "bs-24", domain: "basics", part: "⑤ 分からない・確かめる", ja: "（相手の言葉が）分かりませんでした。", en: "Sorry, I didn't get that." },
    { id: "bs-25", domain: "basics", part: "⑤ 分からない・確かめる", ja: "つまり、〜ということですか？", en: "So you mean ___?" },
    { id: "bs-26", domain: "basics", part: "⑤ 分からない・確かめる", ja: "ちょっと考えさせてください。", en: "Let me think." },
    { id: "bs-27", domain: "basics", part: "⑤ 分からない・確かめる", ja: "英語でなんと言うか分からないのですが、", en: "I don't know how to say it in English, but" },
    // ⑥ あいづち・返し
    { id: "bs-28", domain: "basics", part: "⑥ あいづち", ja: "なるほど。", en: "I see." },
    { id: "bs-29", domain: "basics", part: "⑥ あいづち", ja: "本当ですか？", en: "Really?" },
    { id: "bs-30", domain: "basics", part: "⑥ あいづち", ja: "それはいいですね。", en: "That's great." },
    { id: "bs-31", domain: "basics", part: "⑥ あいづち", ja: "それは大変でしたね。", en: "That sounds tough." },
    { id: "bs-32", domain: "basics", part: "⑥ あいづち", ja: "私もです。", en: "Me too." },
    { id: "bs-33", domain: "basics", part: "⑥ あいづち", ja: "そうですね、そう思います。", en: "Yes, I think so too." },
    // ⑦ 別れ際
    { id: "bs-34", domain: "basics", part: "⑦ 別れ際", ja: "そろそろ行きますね。", en: "I should get going." },
    { id: "bs-35", domain: "basics", part: "⑦ 別れ際", ja: "良い一日を。", en: "Have a good one." },
    { id: "bs-36", domain: "basics", part: "⑦ 別れ際", ja: "気をつけて。", en: "Take care." },
    { id: "bs-37", domain: "basics", part: "⑦ 別れ際", ja: "また会いましょう。", en: "See you." }
  ];
  window.HANASERU_CARDS = (window.HANASERU_CARDS || []).concat(B);
})();
