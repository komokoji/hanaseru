/* Hanaseru 辞書データ（Vault 20_診療英語 / 21_旅行日常 から抽出）
   1カード = { id, domain, ja, en, note }
   domain: sign(署名フレーズ) / medical(診療) / travel(旅行・日常)
   ※ 辞書を育てたら、この配列に足す（または Vault からの変換で再生成）。 */
window.HANASERU_CARDS = [
  // ── 署名フレーズ（辞書の背骨・軸）────────────────
  { id: "sign-01", domain: "sign", ja: "ご心配ですよね。お気持ちわかります。", en: "I understand you must be worried." },
  { id: "sign-02", domain: "sign", ja: "まず、安心してください。", en: "First, I want to reassure you." },
  { id: "sign-03", domain: "sign", ja: "これは子どもによくあることです。", en: "This is very common in children." },
  { id: "sign-04", domain: "sign", ja: "本当の◯◯ではありません。むしろ△△です。", en: "It isn't true ___. Rather, it's ___." },
  { id: "sign-05", domain: "sign", ja: "一番大事なのは、〜です。", en: "The most important thing is that ___." },
  { id: "sign-06", domain: "sign", ja: "その都度、しっかり治していきましょう。", en: "Let's treat it properly each time." },
  { id: "sign-07", domain: "sign", ja: "一緒に様子を見ていきましょう。", en: "Let's see how she's doing — together." },
  { id: "sign-08", domain: "sign", ja: "ですから、心配いりません。", en: "So, there's no need to worry." },
  { id: "sign-09", domain: "sign", ja: "何かあれば、いつでも来てください。", en: "If anything comes up, please come back anytime." },
  { id: "sign-10", domain: "sign", ja: "焦らず、少しずつ良くしていきましょう。", en: "Let's take it step by step and get her better." },

  // ── 診療英語 ───────────────────────────────
  { id: "med-intro-1", domain: "medical", ja: "私は小児外科医です。子どものお腹と栄養を診ています。", en: "I'm a pediatric surgeon. I look after children's gut health and nutrition." },
  { id: "med-intro-2", domain: "medical", ja: "今日はお子さんの状態を説明して、一緒に方針を決めましょう。", en: "Today I'll explain how your child is doing, and we'll decide the plan together." },
  { id: "med-ast-1", domain: "medical", ja: "熱と咳、ゼーゼーが続いて、ご心配ですよね。", en: "The fever, the cough, the wheezing — I know this is worrying." },
  { id: "med-ast-2", domain: "medical", ja: "まず安心してください。RSウイルスの検査は陰性でした。", en: "First, some reassurance: the RS virus test came back negative." },
  { id: "med-ast-3", domain: "medical", ja: "子どもは風邪をひくと、気道が敏感になってゼーゼーします。", en: "When children catch a cold, their airways get sensitive and they wheeze." },
  { id: "med-ast-4", domain: "medical", ja: "喘息のように聞こえますが、本当の喘息ではありません。", en: "It sounds like asthma, but it isn't true asthma." },
  { id: "med-ast-5", domain: "medical", ja: "酸素の値は問題ありません。ただ、ゼーゼーで夜眠りにくくなります。", en: "Her oxygen levels are fine, but the wheezing can make it hard to sleep at night." },
  { id: "med-ast-6", domain: "medical", ja: "クリニックで吸入をしました。気道を広げて楽にする薬です。", en: "We gave her an inhalation here — it opens the airways and makes breathing easier." },
  { id: "med-ast-7", domain: "medical", ja: "長く続く治療は要りません。風邪のたびにしっかり治すことが大事です。", en: "She doesn't need long-term treatment. What matters is treating each cold thoroughly." },
  { id: "med-med-1", domain: "medical", ja: "今の風邪薬は続けてください。今日、追加でお出しします。", en: "Please keep giving the current cold medicine — I'll refill it today." },
  { id: "med-med-2", domain: "medical", ja: "熱が数日続いて、中耳炎と軽い気管支炎が出ています。", en: "The fever has lasted a few days, so she's developed an ear infection and mild bronchitis." },
  { id: "med-med-3", domain: "medical", ja: "なので抗生物質を新しく足します。両方きちんと飲ませてください。", en: "So I'm adding an antibiotic. Please give both as prescribed." },
  { id: "med-med-4", domain: "medical", ja: "まずは熱が下がるか、鼻や胸の症状が良くなるかを見ていきましょう。", en: "First, let's see the fever come down and the runny nose and congestion improve." },
  { id: "med-rev-1", domain: "medical", ja: "熱が下がらなければ、木曜か金曜にまた来てください。", en: "If the fever doesn't come down, please come back this Thursday or Friday." },
  { id: "med-rev-2", domain: "medical", ja: "夜、咳がひどい時は、予約なしで吸入に来られます。この特急券をどうぞ。", en: "If the cough is bad at night, you can come for an inhalation without an appointment — here's an express ticket." },
  { id: "med-rev-3", domain: "medical", ja: "これだけは救急へ：横になって全く眠れない。", en: "Go straight to the ER if she simply can't sleep lying down." },
  { id: "med-rev-4", domain: "medical", ja: "肩やお腹を使って息をしている。目がうつろ。", en: "…or she's using her shoulders or belly to breathe, or her eyes look dazed." },

  // ── 旅行・日常（口語・テンポ重視）──────────────
  // つなぎ言葉（口語のリズムを作る）
  { id: "tr-fill-1", domain: "travel", ja: "（切り出し）で、〜なんですけど。", en: "So, ..." },
  { id: "tr-fill-2", domain: "travel", ja: "へえ、いいですね！", en: "Oh, nice!" },
  { id: "tr-fill-3", domain: "travel", ja: "えーと、そうですね…", en: "Well, let me think..." },
  { id: "tr-fill-4", domain: "travel", ja: "ですよね？（同意をうながす）", en: "You know what I mean?" },
  // 軸（強がらない・深掘り）
  { id: "tr-axis-1", domain: "travel", ja: "ちょっと助けてもらえますか？", en: "Could you help me out real quick?" },
  { id: "tr-axis-2", domain: "travel", ja: "英語まだ勉強中で。少しゆっくり話してもらえますか？", en: "I'm still learning English — could you slow down a little?" },
  { id: "tr-axis-3", domain: "travel", ja: "うまく聞き取れなくて。もう一回いいですか？", en: "Sorry, I didn't quite catch that — could you say it again?" },
  { id: "tr-axis-4", domain: "travel", ja: "念のため、もう一つだけ確認させて。", en: "Just to be sure — one more thing." },
  // 入国審査
  { id: "tr-imm-1", domain: "travel", ja: "観光で来ました。10日くらいです。", en: "I'm here as a tourist, for about ten days." },
  { id: "tr-imm-2", domain: "travel", ja: "家族と一緒です。", en: "I'm with my family." },
  { id: "tr-imm-3", domain: "travel", ja: "日本で子どもの医者をしています。", en: "I'm a children's doctor back in Japan." },
  // ホテル
  { id: "tr-hotel-1", domain: "travel", ja: "チェックインお願いします。小森で予約してます。", en: "Hi, I'd like to check in — it's under Komori." },
  { id: "tr-hotel-2", domain: "travel", ja: "エレベーターでカードキーが反応しないんです。直してもらえますか？", en: "My key card isn't working in the elevator — could you sort it out for me?" },
  { id: "tr-hotel-3", domain: "travel", ja: "朝食って何時からですか？", en: "What time's breakfast?" },
  // 空港
  { id: "tr-air-1", domain: "travel", ja: "この便のゲートはどこですか？", en: "Which gate does this flight leave from?" },
  { id: "tr-air-2", domain: "travel", ja: "乗り継ぎなんですが、間に合いますか？", en: "I've got a connecting flight — will I make it?" },
  // 荷物（深く確認）
  { id: "tr-bag-1", domain: "travel", ja: "荷物は羽田までスルーですか？それともここで受け取り？", en: "Is my bag checked through to Haneda, or do I grab it here?" },
  { id: "tr-bag-2", domain: "travel", ja: "乗り継ぎの間、荷物は勝手に運ばれます？何かやることは？", en: "Does my bag get transferred automatically, or do I need to do anything?" },
  { id: "tr-bag-3", domain: "travel", ja: "もし間に合わなくても、羽田で受け取れますか？", en: "If it doesn't make it, can I still pick it up at Haneda?" },
  // 支払い・買い物・食事
  { id: "tr-pay-1", domain: "travel", ja: "カードで払えますか？", en: "Can I pay by card?" },
  { id: "tr-pay-2", domain: "travel", ja: "おすすめは？", en: "What do you recommend?" },
  { id: "tr-pay-3", domain: "travel", ja: "お会計お願いします。", en: "Can we get the check?" },
  { id: "tr-beer-1", domain: "travel", ja: "ビール何がありますか？軽めのと、しっかりめ、どっちがいい？", en: "What beers do you have? Something light, or something stronger?" },
  { id: "tr-beer-2", domain: "travel", ja: "地元のビールってあります？何が違うんですか？", en: "Got any local beers? What's the difference?" },
  // 旅仲間との雑談
  { id: "tr-chat-1", domain: "travel", ja: "どちらから来たんですか？", en: "So, where are you from?" },
  { id: "tr-chat-2", domain: "travel", ja: "何しに来たんですか？（旅の目的）", en: "What brings you here?" },
  { id: "tr-chat-3", domain: "travel", ja: "へえ、面白い！もっと聞かせて。", en: "Oh nice — tell me more!" },
  { id: "tr-chat-4", domain: "travel", ja: "日本から来ました。子どもの医者で、お腹と栄養が専門です。", en: "I'm from Japan — a kids' doctor, I focus on gut health and nutrition." },
  { id: "tr-chat-5", domain: "travel", ja: "また連絡取れたら。番号交換しません？", en: "Let's keep in touch — want to swap numbers?" },
  { id: "tr-chat-6", domain: "travel", ja: "会えてよかった。良い旅を！", en: "Really nice meeting you — safe travels!" },
  // 聞き取れない時
  { id: "tr-rec-1", domain: "travel", ja: "ごめん、もう一回いい？", en: "Sorry, say that again?" },
  { id: "tr-rec-2", domain: "travel", ja: "つまり、〜ってこと？", en: "So you mean ___, right?" },
  { id: "tr-rec-3", domain: "travel", ja: "それ、どういう意味ですか？", en: "What does that mean?" }
];
