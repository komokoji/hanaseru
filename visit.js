/* Hanaseru 🩺 診察の流れ（風邪）— はじまりから「お大事に」まで、パートごとに順番どおり練習する
   院長 2026-09-27「一般的なやりとりをピースにしてパートにして英語で練習できるように」。
   親と子に共通して話しかけながら診察する想定。domain "visit" は並べた順に出題する（app.js の ORDERED）。
   part＝パート名（練習中の上に出る）。男の子なら her/she を his/he に。 */
(function () {
  var V = [
    // ① はじまり
    { id: "visit-01", domain: "visit", part: "① はじまり", ja: "どうぞ、おかけください。", en: "Please have a seat." },
    { id: "visit-02", domain: "visit", part: "① はじまり", ja: "今日は、どうされましたか？", en: "What brings you in today?", note: "受付でも診察室でも一番使う切り出し。" },
    { id: "visit-03", domain: "visit", part: "① はじまり", ja: "では、診察を始めていきますね。", en: "Okay, let's begin the checkup.", note: "親にも子にも同時に言える。子どもだけなら Let me take a look at you, okay?" },
    // ② 診断
    { id: "visit-04", domain: "visit", part: "② 診断", ja: "胸の音はきれいで、肺炎の心配はありません。", en: "Her chest sounds clear, so I'm not worried about pneumonia.", note: "pneumonia＝肺炎（p は読まない：ニューモウニア）。" },
    { id: "visit-05", domain: "visit", part: "② 診断", ja: "診察した結果、風邪だと思います。", en: "From what I can see, I think it's a common cold.", note: "From what I can see＝診た限りでは。断定しすぎない、やわらかい言い方。" },
    // ③ お薬
    { id: "visit-06", domain: "visit", part: "③ お薬", ja: "咳がひどいので、咳止めを出しておきます。", en: "Since the cough is quite bad, I'll give you some cough medicine." },
    { id: "visit-07", domain: "visit", part: "③ お薬", ja: "気管支を広げるテープも出しておきます。寝る前に、背中か胸に貼ってください。", en: "I'll also give you a patch that opens up the airways. Put it on her back or chest before bed.", note: "ツロブテロール貼付薬は日本では一般的だが、海外では珍しい。名前でなく『何をする薬か』で説明するのが伝わる。" },
    // ④ 吸入
    { id: "visit-08", domain: "visit", part: "④ 吸入", ja: "小さい子は、咳で夜眠れないことがあります。", en: "Little children sometimes can't sleep at night because of the cough." },
    { id: "visit-09", domain: "visit", part: "④ 吸入", ja: "なので、クリニックで吸入をしていきましょう。", en: "So let's do an inhalation treatment here at the clinic.", note: "inhalation＝吸入。子どもには breathing medicine と言うと伝わりやすい。" },
    // ⑤ 登園・登校
    { id: "visit-10", domain: "visit", part: "⑤ 登園・登校", ja: "保育園や学校は、行って大丈夫です。", en: "It's fine for her to go to daycare or school." },
    // ⑥ その後
    { id: "visit-11", domain: "visit", part: "⑥ その後", ja: "おうちでお薬を飲んで良くなれば、それでおしまいです。", en: "If she gets better with the medicine at home, that's it. No need to come back.", note: "that's it＝それでおしまい。" },
    { id: "visit-12", domain: "visit", part: "⑥ その後", ja: "熱が下がらなかったり、風邪の症状が続くときは、数日後にまた来てください。", en: "If the fever doesn't come down, or the cold symptoms keep going, please come back in a few days.", note: "keep going＝続く（keep ～ing＝～し続ける）。" },
    // ⑦ 特急券
    { id: "visit-13", domain: "visit", part: "⑦ 特急券", ja: "当院には「特急券」という仕組みがあります。", en: "We have something called an \"express ticket\" here.", note: "something called ～＝～というもの。独自の仕組みを紹介する王道の言い方。" },
    { id: "visit-14", domain: "visit", part: "⑦ 特急券", ja: "夜の咳き込みがひどくて眠れないときは、予約なしで来て大丈夫です。", en: "If she's coughing so much at night that she can't sleep, you can come in without an appointment.", note: "so much ～ that …＝～すぎて…だ。" },
    { id: "visit-15", domain: "visit", part: "⑦ 特急券", ja: "診察時間内に来てもらえれば、すぐに吸入ができます。", en: "Just come during our opening hours, and we'll give her an inhalation right away." },
    { id: "visit-16", domain: "visit", part: "⑦ 特急券", ja: "ぜひ、この仕組みを使ってください。", en: "Please feel free to use it.", note: "feel free to ～＝遠慮なく～してください。" },
    // ⑧ おわり
    { id: "visit-17", domain: "visit", part: "⑧ おわり", ja: "何か質問はありますか？", en: "Do you have any questions?" },
    { id: "visit-18", domain: "visit", part: "⑧ おわり", ja: "お大事にしてください。", en: "I hope she feels better soon.", note: "『お大事に』に1語で当たる英語はない。Take care. でも可。" }
  ];
  // 🫁 喘息の予防薬を再開する（ステップアップ）— 院長 2026-09-27
  var A = [
    { id: "asth-01", domain: "asthma", part: "① いまの状態", ja: "しばらくは、落ち着いていましたね。", en: "She was doing well for a while." },
    { id: "asth-02", domain: "asthma", part: "① いまの状態", ja: "でも、また咳き込みやゼーゼーが強くなってきました。", en: "But the coughing fits and wheezing have gotten worse again.", note: "coughing fits＝咳き込み（発作的な咳）。" },
    { id: "asth-03", domain: "asthma", part: "② 予防薬を再開", ja: "なので、喘息の予防薬を、もう一度始めましょう。", en: "So let's restart her asthma prevention medicine.", note: "英国では preventer（予防薬）とも言う。発作止めは reliever。" },
    { id: "asth-04", domain: "asthma", part: "② 予防薬を再開", ja: "まずは飲み薬を、毎日2週間続けてください。", en: "First, please give her the oral medicine every day for two weeks.", note: "oral medicine＝飲み薬。子どもの薬は give her ～ と言う（take ではなく）。" },
    { id: "asth-05", domain: "asthma", part: "② 予防薬を再開", ja: "2週間したら、様子を見せに来てください。", en: "Then come back in two weeks so I can check how she's doing." },
    { id: "asth-06", domain: "asthma", part: "③ 落ち着かないとき", ja: "それでも落ち着かないときは、ネブライザーの吸入を足します。", en: "If things still don't settle down, we'll add nebulizer treatments.", note: "settle down＝落ち着く。症状にも子どもにも使える。" },
    { id: "asth-07", domain: "asthma", part: "③ 落ち着かないとき", ja: "ステロイドと、気管支を広げる薬を、一緒に吸入します。", en: "She'll breathe in a steroid together with a medicine that opens the airways.", note: "ステロイドに不安そうなら：It's a very low dose, and it's safe to use for a long time.（ごく少量で、長く使っても安全です）" },
    { id: "asth-08", domain: "asthma", part: "③ 落ち着かないとき", ja: "少なくとも1日1回、夜寝る前にしてください。", en: "Please do it at least once a day, before bed." },
    { id: "asth-09", domain: "asthma", part: "③ 落ち着かないとき", ja: "それでも落ち着かないときは、朝と夜の1日2回にしてください。", en: "If that's still not enough, do it twice a day, in the morning and at night." },
    { id: "asth-10", domain: "asthma", part: "④ 安定したら", ja: "症状が安定したら、飲み薬だけに戻して大丈夫です。", en: "Once her symptoms are stable, you can go back to just the oral medicine." },
    { id: "asth-11", domain: "asthma", part: "⑤ これから", ja: "しばらくは、様子を見ていきましょう。", en: "Let's keep an eye on her for a while.", note: "keep an eye on ～＝～を見守る・様子を見る。" },
    { id: "asth-12", domain: "asthma", part: "⑤ これから", ja: "定期的にチェックしながら、お薬は続けていきましょう。", en: "We'll keep the medicine going and check on her regularly." }
  ];
  // 🚑 大きな病院（救急外来）へ紹介する — 院長 2026-09-27
  var R = [
    { id: "refer-01", domain: "refer", part: "① いまの状態", ja: "今の状態が、とても心配です。", en: "I'm really worried about how she's doing right now.", note: "『具合が悪い』を直接言うより、医師が心配していると伝える方が保護者に届く。" },
    { id: "refer-02", domain: "refer", part: "① いまの状態", ja: "（例）酸素の値が低く、呼吸がとても苦しそうです。", en: "Her oxygen level is low, and she's working hard to breathe.", note: "working hard to breathe＝呼吸がしんどそう（努力呼吸）。理由は場面に合わせて入れ替える。" },
    { id: "refer-03", domain: "refer", part: "② 紹介する", ja: "ここでできる治療では足りないので、大きな病院に紹介します。", en: "She needs more care than we can give here, so I'm going to refer her to a bigger hospital.", note: "refer＝紹介する（referral＝紹介）。三次医療機関は医師同士なら tertiary care hospital だが、保護者には a bigger hospital で十分。" },
    { id: "refer-04", domain: "refer", part: "② 紹介する", ja: "〇〇医療センターの救急外来です。", en: "It's the ER at ___ Medical Center.", note: "ER は米国の言い方。英国では A&E（Accident and Emergency）。" },
    { id: "refer-05", domain: "refer", part: "② 紹介する", ja: "重い病気の子どもを、24時間診られる病院です。", en: "It's a hospital that can take care of seriously ill children, 24 hours a day.", note: "『三次医療機関』を保護者向けに言い換えるとこれ。" },
    { id: "refer-06", domain: "refer", part: "③ 連絡済み", ja: "私から病院に電話して、もう伝えてあります。", en: "I've already called the hospital and let them know you're coming." },
    { id: "refer-07", domain: "refer", part: "③ 連絡済み", ja: "これが紹介状です。病院の受付で渡してください。", en: "Here's a referral letter. Please give it to the reception desk at the hospital." },
    { id: "refer-08", domain: "refer", part: "④ 向かい方", ja: "今すぐ向かってください。", en: "Please head there right away.", note: "head＝向かう。go より『今すぐ出発』の感じが出る。" },
    { id: "refer-09", domain: "refer", part: "④ 向かい方", ja: "救急車を呼びます。", en: "I'm going to call an ambulance." },
    { id: "refer-10", domain: "refer", part: "④ 向かい方", ja: "ご自分の車で連れて行けますか？", en: "Can you drive her there yourself?" },
    { id: "refer-11", domain: "refer", part: "④ 向かい方", ja: "途中で具合が悪くなったら、すぐ救急車を呼んでください。日本では119番です。", en: "If she gets worse on the way, call an ambulance right away. The number in Japan is 119.", note: "外国の方は 911（米）や 999（英）が頭にあるので、番号を必ず伝える。" },
    { id: "refer-12", domain: "refer", part: "⑤ 安心してもらう", ja: "急なことで、驚かれたと思います。", en: "I know this is sudden, and it must be scary." },
    { id: "refer-13", domain: "refer", part: "⑤ 安心してもらう", ja: "でも、早めに行くのが一番安全です。", en: "But getting there early is the safest thing to do." },
    { id: "refer-14", domain: "refer", part: "⑤ 安心してもらう", ja: "心配なことがあれば、いつでもクリニックに連絡してください。", en: "If you're worried about anything, please call us anytime." }
  ];
  window.HANASERU_CARDS = (window.HANASERU_CARDS || []).concat(V, A, R);

})();
