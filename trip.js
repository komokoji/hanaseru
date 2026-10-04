/* Hanaseru ✈️ 12月ヨーロッパ旅行（日本→ヒースロー→スペイン／スペイン→ドイツ2泊→日本）
   院長の「完全ノート」（2026-09-27）をアプリの順番に落としたもの。正本＝Vault
   22_アプリ開発/Hanaseru 語学トレーニング/40_12月ヨーロッパ旅行_英会話・空港会話ノート_2026-09-27.md
   ・trip  … ① 最優先35（単語20＋15文）＝まずここだけ
   ・trip2 … ② 場面別の会話と、会話を広げる雑談＝最優先が回り始めたら足す
   note は答え合わせの画面に出る一言解説（「誰が・何を確認しているか」まで） */
(function () {
  var T = [
    // ── ① 最優先単語20（表示が読める・相手が何の話をしているか分かる） ──
    { id: "trip-w01", domain: "trip", ja: "（表示）出発／出発便", en: "Departures", note: "Departure の複数形で「出発便の案内」。International Departures＝国際線出発。" },
    { id: "trip-w02", domain: "trip", ja: "（表示）到着／到着便", en: "Arrivals", note: "International Arrivals＝国際線到着。迎えの人が待つ場所もここ。" },
    { id: "trip-w03", domain: "trip", ja: "（表示）搭乗手続き", en: "Check-in", note: "Check-in＝搭乗手続き（本人確認・座席・荷物の預け）。ホテルの check-in と同じ語。" },
    { id: "trip-w04", domain: "trip", ja: "（表示）荷物を預ける場所", en: "Bag drop", note: "オンラインでチェックイン済みの人が、荷物だけ渡すカウンター。" },
    { id: "trip-w05", domain: "trip", ja: "荷物（空港でよく使う言い方）", en: "Baggage", note: "luggage とほぼ同じ。数えない名詞なので a baggage / two baggages とは言わない。個数は one bag / two bags。" },
    { id: "trip-w06", domain: "trip", ja: "預け入れ荷物", en: "Checked baggage", note: "check（預ける）＋ed。機内に持ち込まない方。" },
    { id: "trip-w07", domain: "trip", ja: "機内持ち込みの手荷物", en: "Carry-on baggage", note: "英国では hand luggage とも言う（ヒースローの表示はこちらが多い）。" },
    { id: "trip-w08", domain: "trip", ja: "（表示）手荷物受取所", en: "Baggage Claim", note: "claim＝「自分のものだと言って受け取る」。英国では Baggage Reclaim。" },
    { id: "trip-w09", domain: "trip", ja: "乗り継ぎ便", en: "Connecting flight", note: "connect＝つながる。乗り継ぎ全般は connection。" },
    { id: "trip-w10", domain: "trip", ja: "（表示）乗り継ぎはこちら", en: "Flight Connections", note: "ヒースローで一番大事な表示。紫の看板。入国せずに次の便へ行く道。" },
    { id: "trip-w11", domain: "trip", ja: "乗り継ぎ・移動", en: "Transfer", note: "Transfer desk＝乗り継ぎの案内カウンター。transit もほぼ同じ意味。" },
    { id: "trip-w12", domain: "trip", ja: "（表示）保安検査", en: "Security", note: "危険物を持っていないかの検査。人の出入国（immigration）とは別。" },
    { id: "trip-w13", domain: "trip", ja: "（表示）出入国審査", en: "Passport Control", note: "英国・欧州の表示はこちら。確認しているのは「人」。" },
    { id: "trip-w14", domain: "trip", ja: "入国審査", en: "Immigration", note: "Passport Control とほぼ同じ場所。係官が目的・期間・宿を聞く。" },
    { id: "trip-w15", domain: "trip", ja: "（表示）税関", en: "Customs", note: "確認しているのは「物」。Nothing to declare（緑）／Goods to declare（赤）。" },
    { id: "trip-w16", domain: "trip", ja: "搭乗口", en: "Gate", note: "Gate closes＝搭乗口の締切。この時刻を過ぎると乗れない。" },
    { id: "trip-w17", domain: "trip", ja: "搭乗（開始）", en: "Boarding", note: "Boarding pass＝搭乗券、Boarding time＝搭乗開始時刻。" },
    { id: "trip-w18", domain: "trip", ja: "遅延", en: "Delayed", note: "表示の三択：On time（定刻）／Delayed（遅延）／Cancelled（欠航）。" },
    { id: "trip-w19", domain: "trip", ja: "最終目的地", en: "Final destination", note: "荷物をどこまで預けるかの話で出る。" },
    { id: "trip-w20", domain: "trip", ja: "途中の都市での滞在（1泊以上）", en: "Stopover", note: "帰りのドイツ2泊がこれ。荷物は途中で受け取る。" },

    // ── ① 最優先15文 ──
    { id: "trip-s01", domain: "trip", ja: "すみません、助けてもらえますか？", en: "Excuse me, could you help me?", note: "困ったら最初の一言はこれ。相手が止まってくれる。" },
    { id: "trip-s02", domain: "trip", ja: "どこへ行けばいいですか？", en: "Where should we go?", note: "should＝「〜すべき」より軽く「〜したらいい？」。" },
    { id: "trip-s03", domain: "trip", ja: "乗り継ぎはどちらですか？", en: "Which way is it for connecting flights?", note: "Which way is it for ～?＝～へはどちらですか。Flight Connections の表示を探すときの質問。" },
    { id: "trip-s04", domain: "trip", ja: "私たちの荷物は、バルセロナまでそのまま行きますか？", en: "Is our baggage checked through to Barcelona?", note: "checked through to ～＝「～まで通しで預けてある」。行きのヒースロー乗り継ぎで確認。" },
    { id: "trip-s05", domain: "trip", ja: "ここで荷物を受け取る必要がありますか？", en: "Do we need to collect our baggage here?", note: "collect＝受け取る（pick up でも可）。" },
    { id: "trip-s06", domain: "trip", ja: "ドイツに2泊します。", en: "We're staying in Germany for two nights.", note: "予定は進行形（We're staying）で言うのが自然。" },
    { id: "trip-s07", domain: "trip", ja: "ドイツで荷物を受け取る必要があります。", en: "We need to collect our baggage in Germany.", note: "「ドイツに2泊します」とセットで言うと、なぜ受け取りたいかが一度で伝わる。" },
    { id: "trip-s08", domain: "trip", ja: "荷物はフランクフルトまででお願いします。", en: "Please check our baggage only to Frankfurt.", note: "only to＝「そこまでで止めて」。スペインのチェックインで言う。" },
    { id: "trip-s09", domain: "trip", ja: "もう一度、保安検査を受けますか？", en: "Do we need to go through security again?", note: "go through＝（検査を）通る。乗り継ぎでよくある。" },
    { id: "trip-s10", domain: "trip", ja: "どのゲートへ行けばいいですか？", en: "Which gate should we go to?", note: "最後の to を忘れない（go to the gate）。" },
    { id: "trip-s11", domain: "trip", ja: "もう少しゆっくり話してもらえますか？", en: "Could you speak more slowly, please?", note: "恥ずかしくない一言。聞き取れないまま進むより100倍いい。" },
    { id: "trip-s12", domain: "trip", ja: "もう一度言ってもらえますか？", en: "Could you say that again?", note: "もっと短く言うなら Sorry?（語尾を上げる）。" },
    { id: "trip-s13", domain: "trip", ja: "（相手に）ここに来てどのくらいですか？", en: "How long have you been here?", note: "「今まで」の長さ。雑談の入口として一番よく聞かれる。" },
    { id: "trip-s14", domain: "trip", ja: "昨日着いたばかりです。1週間くらいいます。", en: "I just got here yesterday. I'm here for about a week.", note: "How long have you been here? への答え。got here＝着いた。for about a week＝全体で。" },
    { id: "trip-s15", domain: "trip", ja: "何かおすすめはありますか？", en: "Do you have any recommendations?", note: "会話を広げる最強の一言。相手が話してくれる。" },

    // ── ② 場面別：チェックイン・荷物 ──
    { id: "trip-c01", domain: "trip2", ja: "この荷物を預けたいです。", en: "I'd like to check this bag." },
    { id: "trip-c02", domain: "trip2", ja: "この2個の荷物を預けたいです。", en: "We'd like to check these two bags." },
    { id: "trip-c03", domain: "trip2", ja: "荷物は日本までスルーですか？", en: "Is our baggage checked through to Japan?" },
    { id: "trip-c04", domain: "trip2", ja: "フランクフルトで荷物を受け取れますか？", en: "Can we collect our baggage in Frankfurt?" },
    { id: "trip-c05", domain: "trip2", ja: "私たちの荷物の最終目的地はフランクフルトですか？", en: "Is Frankfurt the final destination for our baggage?", note: "タグの空港コードも見る：FRA＝フランクフルト、MUC＝ミュンヘン、LHR＝ヒースロー、BCN＝バルセロナ、HND＝羽田。" },
    // ヒースロー乗り継ぎ
    { id: "trip-c06", domain: "trip2", ja: "スペイン行きの便に乗り継ぎます。", en: "I'm connecting to a flight to Spain." },
    { id: "trip-c07", domain: "trip2", ja: "乗り継ぎ便には、どこへ行けばいいですか？", en: "Where should we go for our connecting flight?" },
    { id: "trip-c08", domain: "trip2", ja: "私たちの便は、どのターミナルから出ますか？", en: "Which terminal does our flight leave from?" },
    // 保安検査（言われること）
    { id: "trip-c09", domain: "trip2", ja: "（係員）パソコンを出してください。", en: "Please take out your laptop." },
    { id: "trip-c10", domain: "trip2", ja: "（係員）上着を脱いでください。", en: "Please remove your jacket." },
    { id: "trip-c11", domain: "trip2", ja: "（係員）液体はお持ちですか？", en: "Do you have any liquids?" },
    { id: "trip-c12", domain: "trip2", ja: "（係員）ご自分で荷造りしましたか？", en: "Did you pack this bag yourself?", note: "答えは Yes, I did.（はい）。" },
    // 入国審査（この旅の答え）
    { id: "trip-c13", domain: "trip2", ja: "観光と、息子を迎えに来ました。", en: "I'm here to do some sightseeing and pick up my son." },
    { id: "trip-c14", domain: "trip2", ja: "5日間滞在します。", en: "We're staying for five days." },
    { id: "trip-c15", domain: "trip2", ja: "バルセロナのホテルに泊まります。", en: "We're staying at a hotel in Barcelona." },
    { id: "trip-c16", domain: "trip2", ja: "はい、ドイツ経由で日本へ帰ります。", en: "Yes, we're returning to Japan via Germany.", note: "via＝～経由で（ヴァイア）。" },
    // 乗り継ぎが短い・遅れた
    { id: "trip-c17", domain: "trip2", ja: "乗り継ぎ時間が短いんです。", en: "We have a tight connection.", note: "tight＝きつい・余裕がない。" },
    { id: "trip-c18", domain: "trip2", ja: "ゲートまで一番早い行き方を教えてもらえますか？", en: "Could you tell us the fastest way to the gate?" },
    { id: "trip-c19", domain: "trip2", ja: "乗り継ぎ便に間に合いますか？", en: "Will we make our connecting flight?", note: "make a flight＝飛行機に間に合う。" },
    { id: "trip-c20", domain: "trip2", ja: "乗り継ぎ便に間に合わないかもしれません。", en: "We might miss our connecting flight." },
    { id: "trip-c21", domain: "trip2", ja: "別の便に変えてもらえますか？", en: "Can you rebook us on another flight?", note: "rebook＝予約を取り直す。" },
    // 荷物が出てこない
    { id: "trip-c22", domain: "trip2", ja: "2個のうち1個が出てきません。", en: "One of our bags is missing." },
    { id: "trip-c23", domain: "trip2", ja: "手荷物サービスのカウンターはどこですか？", en: "Where is the baggage service desk?" },
    { id: "trip-c24", domain: "trip2", ja: "（係員）手荷物の預かり証はありますか？", en: "Do you have your baggage claim tag?", note: "答えは Yes, here it is.（はい、これです）。搭乗券の裏に貼られることが多い。" },
    // 困ったとき
    { id: "trip-c25", domain: "trip2", ja: "この方向で合っていますか？", en: "Is this the right way?" },
    { id: "trip-c26", domain: "trip2", ja: "地図で教えてもらえますか？", en: "Could you show me on the map?" },
    { id: "trip-c27", domain: "trip2", ja: "つまり、ここで荷物を受け取る必要があるということですか？", en: "Do you mean I need to collect my baggage here?", note: "Do you mean ～?＝「つまり～ということ？」。聞き取った内容を確認する万能の型。" },

    // ── ② 会話を広げる雑談 ──
    { id: "trip-t01", domain: "trip2", ja: "まだ2日しかいません。", en: "I've only been here for two days." },
    { id: "trip-t02", domain: "trip2", ja: "来て2日目です。全部で1週間滞在します。", en: "This is our second day here. We're staying for a week in total.", note: "in total＝全部で。「今まで」と「全体」を1回で言える便利な型。" },
    { id: "trip-t03", domain: "trip2", ja: "（相手に）どのくらい滞在する予定ですか？", en: "How long are you staying?", note: "滞在全体の長さを聞く。How long are you here for? もほぼ同じ意味。今までの長さは How long have you been here?" },
    { id: "trip-t04", domain: "trip2", ja: "（相手に）全体でどのくらいいるんですか？", en: "How long are you here for?", note: "How long are you staying? とほぼ同じ意味の、くだけた言い方。" },
    { id: "trip-t05", domain: "trip2", ja: "（相手に）スペインは初めてですか？", en: "Is this your first time in Spain?" },
    { id: "trip-t06", domain: "trip2", ja: "はい、初めてです。", en: "Yes, this is my first time." },
    { id: "trip-t07", domain: "trip2", ja: "いいえ、前にも来たことがあります。", en: "No, I've been here before." },
    { id: "trip-t08", domain: "trip2", ja: "（相手に）今のところ、スペインはどうですか？", en: "How do you like Spain so far?", note: "so far＝今までのところ。旅の会話で非常によく使う。" },
    { id: "trip-t09", domain: "trip2", ja: "とても気に入っています。食事がおいしいです。", en: "I really like it. The food is great." },
    { id: "trip-t10", domain: "trip2", ja: "（相手に）今までどこを見ましたか？", en: "What have you seen so far?" },
    { id: "trip-t11", domain: "trip2", ja: "今のところ、街の中心しか見ていません。", en: "We've only seen the city center so far." },
    { id: "trip-t12", domain: "trip2", ja: "今のところ最高です。", en: "So far, it's been great." },
    { id: "trip-t13", domain: "trip2", ja: "（相手）じゃあ、まだ始まったばかりですね！", en: "So you're just getting started!", note: "答えは Yes, exactly.（そうなんです）。" },
    { id: "trip-t14", domain: "trip2", ja: "（相手）旧市街に行ってみるといいですよ。", en: "You should check out the old town.", note: "check out＝（場所を）見てみる。空港の check とは別の使い方。" },
    { id: "trip-t15", domain: "trip2", ja: "どこか、おすすめの場所はありますか？", en: "Is there anywhere you recommend?" },
    { id: "trip-t16", domain: "trip2", ja: "東京から来ました。", en: "We're from Tokyo." },
    { id: "trip-t17", domain: "trip2", ja: "息子を迎えに来ているんです。", en: "We're here to pick up our son." },
    { id: "trip-t18", domain: "trip2", ja: "息子はスペインに3か月いるんです。", en: "He's been staying in Spain for three months.", note: "have been ～ing＝（今まで）ずっと～している。" },
    { id: "trip-t19", domain: "trip2", ja: "一緒に日本へ帰ります。", en: "We're traveling back to Japan together." }
  ];
  window.HANASERU_CARDS = (window.HANASERU_CARDS || []).concat(T);
})();
