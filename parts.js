/* Hanaseru 🧩 診察の会話＝部品（パート）の棚 × 流れ（並べ方）× 症例（組み立て練習）
   院長 2026-09-27「パートに分けると良い。実際は話さない部品もあるし、他の流れから持ってくることもある」。
   ・PARTS … 部品。カードの中身は data.js / visit.js にあり、ここは id で指すだけ（同じ札を二重に持たない＝進捗も1つ）
   ・FLOWS … よくある並べ方（お手本）。共通の部品（はじまり・おわり・特急券…）は何度でも使い回す
   ・CASES … 症例カード。院長が部品を選んで並べ、声に出して通し、お手本（model）と比べる。AI会話の親役の設定にも使う
   部品を足す＝カードを作って PARTS に id を並べるだけ。流れ・症例は部品の id を並べるだけ。 */
(function () {
  var PARTS = [
    { id: "open",         title: "はじまり",               ids: ["visit-01", "visit-02", "visit-03"] },
    { id: "exam-kid",     title: "診察中の子への声かけ",     ids: ["med-exam-1", "med-exam-2", "med-exam-3", "med-exam-4", "med-exam-5", "med-exam-6", "med-exam-7"] },
    { id: "test-flu",     title: "検査の説明（インフル・コロナ）", ids: ["med-flu-1", "med-flu-2", "med-flu-3"] },
    { id: "swab-kid",     title: "鼻の検査の声かけ（子へ）",  ids: ["med-swab-1", "med-swab-2", "med-swab-3", "med-swab-4", "med-swab-5", "med-swab-6", "med-swab-7"] },
    { id: "dx-cold",      title: "診断（風邪）",             ids: ["visit-04", "visit-05"] },
    { id: "dx-clear",     title: "結果を伝える（問題なし）",  ids: ["med-exp-1", "med-exp-2", "med-exp-3", "med-exp-5"] },
    { id: "wheeze",       title: "ゼーゼーと喘息の説明",      ids: ["med-ast-12", "med-ast-13", "med-ast-4", "med-ast-14", "med-ast-15", "med-ast-16", "med-ast-17", "med-ast-18"] },
    { id: "state-worse",  title: "いまの状態（悪化）",        ids: ["asth-01", "asth-02"] },
    { id: "rx-cold",      title: "お薬（咳止め・テープ）",    ids: ["visit-06", "visit-07"] },
    { id: "rx-flu",       title: "陽性なら（抗ウイルス薬）",  ids: ["med-flu-4"] },
    { id: "rx-fever",     title: "お薬（風邪薬・解熱剤）",    ids: ["med-flu-5"] },
    { id: "asthma-rx",    title: "喘息の予防薬を再開",        ids: ["asth-03", "asth-04", "asth-05"] },
    { id: "asthma-step",  title: "落ち着かないとき（ネブライザー）", ids: ["asth-06", "asth-07", "asth-08", "asth-09"] },
    { id: "asthma-stable",title: "安定したら",               ids: ["asth-10"] },
    { id: "inhale",       title: "クリニックで吸入",          ids: ["visit-08", "visit-09"] },
    { id: "school-ok",    title: "登園・登校してよい",        ids: ["visit-10"] },
    { id: "home-rest",    title: "家で休む・登園の基準",      ids: ["med-flu-6", "med-flu-7", "med-flu-8"] },
    { id: "followup",     title: "再受診の目安",             ids: ["visit-11", "visit-12"] },
    { id: "redflag",      title: "危ないサイン（すぐ受診）",  ids: ["med-flu-9", "med-rev-3", "med-rev-4"] },
    { id: "watch",        title: "これから（経過を見る）",     ids: ["asth-11", "asth-12"] },
    { id: "express",      title: "特急券",                   ids: ["visit-13", "visit-14", "visit-15", "visit-16"] },
    { id: "worry",        title: "いまの状態（重い）",        ids: ["refer-01", "refer-02"] },
    { id: "refer",        title: "大きな病院へ紹介",          ids: ["refer-03", "refer-04", "refer-05"] },
    { id: "refer-done",   title: "連絡済み・紹介状",          ids: ["refer-06", "refer-07"] },
    { id: "refer-go",     title: "向かい方（救急車・119）",   ids: ["refer-08", "refer-09", "refer-10", "refer-11"] },
    { id: "reassure",     title: "安心してもらう",            ids: ["refer-12", "refer-13", "refer-14"] },
    { id: "close",        title: "おわり",                   ids: ["visit-17", "visit-18"] },
    // 🟤 便秘外来
    { id: "con-reassure", title: "便秘：安心させる入口",       ids: ["gut-01", "gut-02"] },
    { id: "con-exam",     title: "便秘：エコーの見立て",       ids: ["gut-03", "gut-04", "gut-05"] },
    { id: "con-yellow",   title: "便秘：黄色信号",             ids: ["gut-06"] },
    { id: "con-soiling",  title: "便秘：パンツの汚れ",         ids: ["gut-07"] },
    { id: "con-plan",     title: "便秘：方針（出し切る・リズム）", ids: ["med-con-2", "gut-08", "gut-09"] },
    { id: "con-enema",    title: "便秘：浣腸",                ids: ["med-con-3", "med-con-4", "gut-10", "gut-11"] },
    { id: "con-meds",     title: "便秘：飲み薬",               ids: ["gut-12", "gut-13", "gut-14", "gut-15"] },
    { id: "con-home",     title: "便秘：家でやること",         ids: ["gut-16", "gut-17", "gut-18"] },
    { id: "con-next",     title: "便秘：次回の受診",           ids: ["gut-19", "gut-20"] },
    { id: "con-redflag",  title: "便秘：すぐ受診するサイン",    ids: ["gut-21"] },
    { id: "con-longrun",  title: "便秘：長期戦・励まし",        ids: ["gut-22", "med-con-8", "gut-23", "gut-24"] },
    { id: "con-faq",      title: "便秘：よくある質問への答え",  ids: ["gut-25", "gut-26", "gut-27", "gut-28"] },
    // 🟢 栄養外来
    { id: "nut-listen",   title: "栄養：受け止め",             ids: ["nut-01", "nut-02"] },
    { id: "nut-view",     title: "栄養：見立て",               ids: ["nut-03", "nut-04", "nut-05"] },
    { id: "nut-test",     title: "栄養：検査の位置づけ",        ids: ["nut-06", "nut-07"] },
    { id: "nut-result",   title: "栄養：結果説明（フェリチン）", ids: ["nut-08", "nut-09", "nut-10", "nut-11", "nut-12"] },
    { id: "nut-food",     title: "栄養：食事の工夫",           ids: ["nut-13", "nut-14", "nut-15", "nut-16"] },
    { id: "nut-supp",     title: "栄養：サプリ",               ids: ["nut-17", "nut-18", "nut-19"] },
    { id: "nut-first-next", title: "栄養：結果説明の予約",      ids: ["nut-20"] },
    { id: "nut-recheck",  title: "栄養：再検査と変化の目安",    ids: ["nut-21", "nut-22"] },
    { id: "nut-close",    title: "栄養：前向きな結び",          ids: ["nut-23", "nut-24"] },
    // 2026-09-28 追加：実際の患者パターン（便秘6型・栄養6型・一般小児科）
    { id: "con-c1",       title: "便秘：巨大貯留（まず出す）",  ids: ["gut-29", "gut-30"] },
    { id: "con-pain",     title: "便秘：切れ痔・痛みのループ",  ids: ["gut-31", "med-con-9", "gut-32", "gut-33", "gut-34"] },
    { id: "con-school",   title: "便秘：学校で出せない",        ids: ["gut-35", "gut-36", "gut-37"] },
    { id: "con-baby",     title: "便秘：赤ちゃん（いきみが下手）", ids: ["gut-38", "gut-39", "gut-40"] },
    { id: "nut-night",    title: "栄養：夜間の低血糖（朝起きられない）", ids: ["nut-25", "nut-26", "nut-27"] },
    { id: "nut-insur",    title: "栄養：保険の採血から",        ids: ["nut-28"] },
    { id: "nut-headache", title: "栄養：頭痛と鉄",             ids: ["nut-29"] },
    { id: "gi-dehyd",     title: "胃腸炎：脱水と飲ませ方",      ids: ["med-gi-1", "med-gi-2", "med-gi-3", "med-gi-4", "med-gi-9"] },
    { id: "gi-food",      title: "胃腸炎：食事",               ids: ["med-gi-5", "med-gi-6", "med-gi-7"] },
    { id: "gi-care",      title: "胃腸炎：お尻のケア",          ids: ["med-gi-8"] },
    { id: "gi-redflag",   title: "胃腸炎：すぐ救急へ",          ids: ["med-gi-10"] },
    { id: "fever-calm",   title: "発熱：熱はこわくない",        ids: ["med-hf-1", "med-hf-2", "med-hf-10"] },
    { id: "fever-med",    title: "発熱：解熱剤の使い方",        ids: ["med-hf-3", "med-hf-4", "med-hf-5", "med-hf-6", "med-hf-7", "med-hf-8"] },
    { id: "fever-baby",   title: "発熱：生後3か月未満",         ids: ["med-hf-9"] },
    { id: "sz-calm",      title: "けいれん：熱性けいれんの見通し", ids: ["gen-01", "gen-02"] },
    { id: "sz-first",     title: "けいれん：その場の対応",       ids: ["med-sz-1", "med-sz-2", "med-sz-3", "med-sz-4", "med-sz-8"] },
    { id: "sz-call",      title: "けいれん：救急車・受診の目安", ids: ["med-sz-5", "med-sz-6", "med-sz-7"] },
    { id: "dc-colds",     title: "保育園と繰り返す風邪",        ids: ["med-fev-1", "med-fev-2", "med-fev-3", "med-fev-4"] },
    { id: "dc-visit",     title: "熱が続くときの受診",          ids: ["med-fev-5", "med-fev-6"] },
    { id: "dc-back",      title: "登園の目安（風邪）",          ids: ["med-fev-7"] },
    { id: "dc-cough",     title: "長引く咳",                   ids: ["med-fev-8"] },
    { id: "dc-parent",    title: "親をねぎらう",               ids: ["med-fev-9", "med-fev-10"] }
  ];

  var FLOWS = [
    { id: "cold",   title: "🩺 風邪の診察",                 parts: ["open", "dx-cold", "rx-cold", "inhale", "school-ok", "followup", "express", "close"] },
    { id: "flu",    title: "🧪 鼻の検査（インフル・コロナ）", parts: ["open", "test-flu", "swab-kid", "rx-flu", "rx-fever", "home-rest", "redflag", "close"] },
    { id: "wheeze", title: "🌬 ゼーゼーと喘息の説明",        parts: ["open", "wheeze", "inhale", "followup", "express", "close"] },
    { id: "asthma", title: "🫁 喘息の予防薬を再開",          parts: ["open", "state-worse", "asthma-rx", "asthma-step", "asthma-stable", "watch", "express", "close"] },
    { id: "refer",  title: "🚑 大きな病院へ紹介",            parts: ["worry", "refer", "refer-done", "refer-go", "reassure"] },
    { id: "con1",   title: "🟤 便秘の初診（浣腸で始める）",   parts: ["open", "con-reassure", "con-exam", "con-plan", "con-enema", "con-home", "con-next", "con-redflag", "close"] },
    { id: "con2",   title: "🟤 便秘の再診（黄色信号・続ける）", parts: ["open", "con-yellow", "con-meds", "con-longrun", "con-next", "close"] },
    { id: "nut1",   title: "🟢 栄養の初診（採血まで）",       parts: ["open", "nut-listen", "nut-view", "nut-test", "nut-first-next", "nut-close", "close"] },
    { id: "nut2",   title: "🟢 栄養の結果説明",              parts: ["open", "nut-result", "nut-food", "nut-supp", "nut-recheck", "nut-close", "close"] },
    { id: "gi",     title: "🤢 胃腸炎（吐く・下痢）",         parts: ["open", "gi-dehyd", "gi-food", "gi-care", "gi-redflag", "close"] },
    { id: "fever",  title: "🌡 熱のホームケア",              parts: ["open", "fever-calm", "fever-med", "dc-visit", "fever-baby", "close"] },
    { id: "seizure",title: "⚡️ 熱性けいれんのあと",          parts: ["open", "sz-calm", "sz-first", "sz-call", "fever-med", "close"] },
    { id: "daycare",title: "🏫 保育園と繰り返す風邪",         parts: ["open", "dc-colds", "dc-visit", "dc-back", "dc-cough", "dc-parent", "close"] }
  ];

  // 症例：facts は院長が見る情報（日本語）。model はお手本の並べ方（これが唯一の正解ではない）。parent は AI 親役の設定（英語）
  var CASES = [
    { id: "c-cold", cat: "一般", title: "3歳・熱2日・咳で眠れない",
      facts: ["3歳の女の子。熱が2日、咳がひどく夜眠れない", "胸の音はきれい。呼吸も楽そう", "保育園に通っている。母親は仕事を休みにくい"],
      model: ["open", "dx-cold", "rx-cold", "inhale", "school-ok", "followup", "express", "close"],
      tip: "登園を聞かれる前に言うと安心が早い。夜の咳には特急券までつなげる。",
      parent: "a mother of a 3-year-old girl with a 2-day fever and a bad cough that keeps her up at night. The girl goes to daycare and the mother is worried about missing work." },
    { id: "c-flu", cat: "一般", title: "5歳・熱3日・インフル流行中",
      facts: ["5歳の男の子。熱が3日続いている", "元気はあり、呼吸も問題ない", "クラスでインフルエンザが流行中"],
      model: ["open", "test-flu", "swab-kid", "rx-flu", "rx-fever", "home-rest", "redflag", "close"],
      tip: "検査の前に親へ理由を言い、検査中は子どもへ話しかける。陽性でも陰性でも『帰ってからの目安』で締める。",
      parent: "a father of a 5-year-old boy with a fever for 3 days. Flu is going around in his class. The father wonders if they need a test and when the boy can go back to school." },
    { id: "c-wheeze", cat: "一般", title: "2歳・風邪のたびにゼーゼー（3回目）",
      facts: ["2歳の女の子。風邪をひくたびにゼーゼーする。今回3回目", "クリニックの吸入で楽になった", "母親は『喘息ですか？』と心配している"],
      model: ["open", "wheeze", "inhale", "followup", "express", "close"],
      tip: "『喘息ですか？』には、いったん小児喘息と呼ぶこと→でも多くは成長とともに治る、の順で。",
      parent: "a worried mother of a 2-year-old girl who wheezes every time she catches a cold. This is the third time. She keeps asking whether her daughter has asthma." },
    { id: "c-asthma", cat: "一般", title: "6歳・喘息の予防薬を中止中に悪化",
      facts: ["6歳の男の子。喘息の予防薬を中止して落ち着いていた", "この1週間で咳き込みとゼーゼーが増えた", "今は呼吸は落ち着いている"],
      model: ["open", "state-worse", "asthma-rx", "asthma-step", "asthma-stable", "watch", "close"],
      tip: "いきなり薬の話をせず、まず『落ち着いていた→また悪くなった』を共有してから再開を提案する。",
      parent: "a mother of a 6-year-old boy with asthma. They stopped his preventer medicine a while ago, but this week his coughing fits and wheezing came back. She is a little worried about steroids." },
    { id: "c-refer", cat: "一般", title: "1歳・呼吸が苦しそう（酸素が低い）",
      facts: ["1歳の男の子。咳と熱、呼吸が速く苦しそう", "酸素の値が低い", "近くの医療センターの救急外来に紹介が必要"],
      model: ["worry", "refer", "refer-done", "refer-go", "reassure"],
      tip: "理由→どこへ→もう連絡済み→どうやって行く→安心、の順。番号（119）を必ず言う。",
      parent: "a frightened father of a 1-year-old boy who is breathing fast. He did not expect to be sent to another hospital and asks many anxious questions." },
    // 🟤 便秘
    { id: "c-con1", cat: "便秘", title: "4歳・週1回しか出ない（初診）",
      facts: ["4歳の女の子。うんちが週に1回しか出ない", "前の病院の飲み薬は効かず、自分でやめてしまった", "エコーで直腸にうんちがたまり、太さ3cm"],
      model: ["open", "con-reassure", "con-exam", "con-plan", "con-enema", "con-home", "con-next", "close"],
      tip: "まず『お母さんのせいではない』から。浣腸は『癖にならない』を先に言うと、受け入れてもらいやすい。",
      parent: "a tired mother of a 4-year-old girl who only poops about once a week. The medicine from another doctor didn't work, so they stopped it. She feels guilty and is scared that enemas will become a habit." },
    { id: "c-con2", cat: "便秘", title: "3歳・2〜3日に1回ちょびちょび（再診）",
      facts: ["3歳の男の子。飲み薬を続けていて、2〜3日に1回ちょびちょび出る", "エコーでは、出たあとも直腸にまだ残っている", "母親は『もう薬をやめてもいいですか？』と聞きたい"],
      model: ["open", "con-yellow", "con-meds", "con-longrun", "con-next", "close"],
      tip: "黄色信号＝悪くはないがもったいない。やめたい気持ちを受け止めてから、急にやめない理由を言う。",
      parent: "a mother of a 3-year-old boy on constipation medicine. He poops a little every 2 or 3 days. She thinks he is doing okay and wants to know if they can stop the medicine." },
    { id: "c-con3", cat: "便秘", title: "6歳・パンツが汚れる",
      facts: ["6歳の女の子。毎日パンツが少し汚れる", "飲み薬で便がゆるくなり、もれてしまう", "本人は恥ずかしがっている"],
      model: ["open", "con-soiling", "con-reassure", "con-enema", "con-meds", "con-home", "con-next", "close"],
      tip: "『病気ではない・体が慣れてしまっただけ』を最初に。本人の前では恥ずかしさに触れすぎない。",
      parent: "a worried father of a 6-year-old girl who soils her underwear a little every day. Her medicine makes her stool loose. He wonders if something is wrong with her and whether she is doing it on purpose." },
    // 🟢 栄養
    { id: "c-nut1", cat: "栄養", title: "14歳・朝起きられない・頭痛（初診）",
      facts: ["14歳の女の子。朝起きられず、頭痛と疲れやすさが続く", "ほかの病院では『異常なし』と言われた", "甘いものが多く、朝ごはんはほとんど食べない"],
      model: ["open", "nut-listen", "nut-view", "nut-test", "nut-first-next", "nut-close", "close"],
      tip: "『異常なし＝元気』ではない、を受け止めの直後に。検査は『病気探し』より『栄養の地図』だと伝える。",
      parent: "a mother of a 14-year-old girl who can't get up in the morning and often has headaches. Another doctor said her tests were normal. The mother wants to know what is really going on." },
    { id: "c-nut2", cat: "栄養", title: "14歳・結果説明（フェリチンが低い）",
      facts: ["同じ14歳の女の子。採血の結果を説明する日", "フェリチン（貯めてある鉄）が低く、タンパク質も足りない", "サプリと食事の工夫を始めたい"],
      model: ["open", "nut-result", "nut-food", "nut-supp", "nut-recheck", "nut-close", "close"],
      tip: "フェリチンは必ず『体に貯めてある鉄』と言い添える。サプリは『補助輪』＝いずれ要らなくなる、で締める。",
      parent: "the same mother, back for her daughter's blood test results. She was told before that her daughter was not anemic, so she is surprised to hear about low iron. She asks about supplements and cost." },
    { id: "c-nut3", cat: "栄養", title: "6歳・癇癪・甘いものがやめられない",
      facts: ["6歳の男の子。癇癪が多く、集中が続かない", "甘いものが大好きで、やめさせると怒る", "母親は『甘いものを禁止すべき？』と悩んでいる"],
      model: ["open", "nut-listen", "nut-view", "nut-food", "nut-test", "nut-first-next", "close"],
      tip: "『引き算ではなく足し算』。禁止しなくていい、と先に言うと母親の肩の力が抜ける。",
      parent: "a stressed mother of a 6-year-old boy who has frequent tantrums and loves sweets. She wonders if she should ban sugar completely and whether his diet affects his mood." },
    // ── 2026-09-28 追加：実際の患者パターン ──
    { id: "c-gi", cat: "一般", title: "2歳・吐いて下痢（胃腸炎）",
      facts: ["2歳の女の子。今朝から何度も吐いて、下痢もある", "ぐったりはしておらず、おしっこも出ている", "母親は『何を飲ませたらいいか』が分からない"],
      model: ["open", "gi-dehyd", "gi-food", "gi-care", "gi-redflag", "close"],
      tip: "一番こわいのは脱水、を先に。飲ませ方（スプーン1杯ずつ）が伝われば、あとは食事と救急の目安。",
      parent: "a mother of a 2-year-old girl who has been throwing up since this morning and has diarrhea. She is not sure what to give her to drink or when she can eat again." },
    { id: "c-fever", cat: "一般", title: "8か月・初めての高熱",
      facts: ["8か月の男の子。昨夜から39度の熱、初めての高熱", "機嫌はまあまあで、ミルクも飲めている", "父親は『脳に影響しないか』『解熱剤はいつ使う？』と不安"],
      model: ["open", "fever-calm", "fever-med", "dc-visit", "close"],
      tip: "『高い熱だけで脳はダメにならない』を最初に。解熱剤は『何度か』より『つらそうか』。",
      parent: "a nervous father of an 8-month-old boy with his first high fever, 39 degrees. He is afraid the fever could hurt his brain and doesn't know when to use fever medicine." },
    { id: "c-sz", cat: "一般", title: "1歳半・熱性けいれんのあと",
      facts: ["1歳半の女の子。昨夜、熱が上がるときに1〜2分けいれんした", "今は熱があるが、元気で反応も良い", "母親は動揺していて『また起きたら？』と聞きたい"],
      model: ["open", "sz-calm", "sz-first", "sz-call", "fever-med", "close"],
      tip: "まず『多くは数分で止まり、後に残らない』。次に起きたときの『すること・しないこと・救急車の目安』を具体的に。",
      parent: "a shaken mother of an 18-month-old girl who had a short seizure last night when her fever went up. She is scared it will happen again and wants to know what to do." },
    { id: "c-dc", cat: "一般", title: "1歳・保育園に入って毎週風邪",
      facts: ["1歳の男の子。4月に保育園に入ってから、毎週のように熱や鼻水", "咳だけがずっと残っている", "母親は仕事を休み続けて疲れ、自分を責めている"],
      model: ["open", "dc-colds", "dc-visit", "dc-back", "dc-cough", "dc-parent", "close"],
      tip: "『異常ではない・免疫を学んでいる最中』で安心させ、最後は必ず親をねぎらう。",
      parent: "an exhausted working mother of a 1-year-old boy who has caught a cold almost every week since starting daycare. She blames herself and wonders if something is wrong with his immune system." },
    { id: "c-con-c1", cat: "便秘", title: "7歳・1週間出ていない・お腹が張る",
      facts: ["7歳の男の子。1週間出ていない。お腹が張って食欲がない", "他院で飲み薬をもらったが効いていない", "エコーで直腸からその奥まで便がたまっている"],
      model: ["open", "con-c1", "con-exam", "con-enema", "con-home", "con-next", "con-redflag", "close"],
      tip: "まず頑張りを認め、今日のうちに出す。浣腸は『癖にならない』とセットで。",
      parent: "a worn-out mother of a 7-year-old boy who hasn't pooped for a week. His belly is bloated and he isn't eating. The medicine from another clinic didn't help." },
    { id: "c-con-pain", cat: "便秘", title: "3歳・うんちで血が出る・痛がる",
      facts: ["3歳の女の子。うんちのときに血が出て、痛がって泣く", "痛いので我慢するようになった", "お尻に小さな切れた傷がある"],
      model: ["open", "con-pain", "con-plan", "con-home", "con-next", "close"],
      tip: "『我慢は怠けではない』を最初に。痛みを取る→柔らかく出す、でループを断つ。",
      parent: "a worried mother of a 3-year-old girl who cries when she poops because it hurts and there is blood. Now she holds it in. The mother is scared about the blood." },
    { id: "c-con-school", cat: "便秘", title: "8歳・学校でうんちができない",
      facts: ["8歳の女の子。学校ではうんちができず、家でも我慢しがち", "以前、学校のトイレでからかわれたことがある", "エコーで中くらいの便のたまり"],
      model: ["open", "con-school", "con-exam", "con-home", "con-next", "close"],
      tip: "本人に直接『勇気がいるよね』と話しかける。学校より先に、家を安心して出せる場所に。",
      parent: "a mother of an 8-year-old girl who won't poop at school and often holds it in at home too. She was teased once in the school bathroom. The mother wonders if she should talk to the school." },
    { id: "c-con-baby", cat: "便秘", title: "10か月・いきんでも出ない",
      facts: ["10か月の女の子。顔を真っ赤にしていきむのに出ない", "うんちは硬めで、2〜3日に1回", "母親は『便秘の病気では？』と心配"],
      model: ["open", "con-baby", "con-reassure", "con-next", "close"],
      tip: "『いきむのが下手なだけ・病気ではない』。綿棒で出す練習を、手順まで具体的に。",
      parent: "a first-time mother of a 10-month-old girl who strains and turns red but can't poop. She is worried it might be a disease." },
    { id: "c-nut-night", cat: "栄養", title: "10歳・朝起きられない・夜にジュース",
      facts: ["10歳の男の子。この数か月、朝どうしても起きられない", "学校に行けば元気で、帰宅後も元気", "寝る前にジュースやゼリーをよく飲む"],
      model: ["open", "nut-listen", "nut-night", "nut-insur", "nut-first-next", "nut-close", "close"],
      tip: "『病気ではないけれど起きられない』＝夜間の低血糖、をやさしく。採血は押しつけず、保険からで良い。",
      parent: "a mother of a 10-year-old boy who can't get up in the morning anymore, though he is fine once he is at school. He often has juice or jelly before bed. She wonders if he is just being lazy." },
    { id: "c-nut-headache", cat: "栄養", title: "12歳・頭痛・検査は異常なし",
      facts: ["12歳の女の子。頭痛が続き、ほかの病院の検査（MRI）は異常なし", "甘いものが多く、疲れやすい", "母親は『原因が分からない』ともどかしい"],
      model: ["open", "nut-listen", "nut-headache", "nut-view", "nut-test", "nut-first-next", "close"],
      tip: "『異常なし＝元気ではない』を受け止めてから、鉄との関係を『可能性』として伝える。",
      parent: "a frustrated mother of a 12-year-old girl with ongoing headaches. Her MRI was normal and nobody can tell her why. She eats a lot of sweets and gets tired easily." }
  ];

  var byId = {};
  PARTS.forEach(function (p) { byId[p.id] = p; });

  // 聞き取り：流れごとに、部品＝1パッセージで通して聞けるようにする
  function cardsIndex() {
    var m = {}; (window.HANASERU_CARDS || []).forEach(function (c) { m[c.id] = c; }); return m;
  }
  function flowUnit(f) {
    var ix = cardsIndex();
    return {
      id: "flow-" + f.id, title: "診察室：" + f.title.replace(/^\S+\s/, ""), voice: "en-US", phrases: [],
      scene: "部品（パート）ごとに通して聞く。カードは 🧩 診察の会話 → 流れ・部品 に同じ順番で入っている。",
      passages: f.parts.map(function (pid) {
        var p = byId[pid], cs = p.ids.map(function (id) { return ix[id]; }).filter(Boolean);
        return { title: p.title, en: cs.map(function (c) { return c.en; }).join(" "), ja: cs.map(function (c) { return c.ja; }).join(" "), pick: [] };
      })
    };
  }

  window.HANASERU_PARTS = PARTS;
  window.HANASERU_PART_BY_ID = byId;
  window.HANASERU_FLOWS = FLOWS;
  window.HANASERU_CASES = CASES;
  window.HANASERU_VISIT_UNITS = FLOWS.map(flowUnit);
})();
