/* 今日の耳トレ：旅先と学会で「ベラベラと話しかけられる」場面の創作会話（実在の録音ではない）。
   2026-11-25 院長「骨太の会話に。空港・機内・ホテル・外国人から話しかけられた時に耳が鍛えられる文章に」
   ・1本＝7〜8往復。自然な速さ、つなぎ言葉（Right, / Actually, / To be honest, …）と
     簡単な言葉の熟語（get through / held up / sort out …）を意識して入れてある。
   ・who＝話し手の役、voices＝合成音声（男女・英米豪）。音声は ops/build-listening-audio.cjs で作る。
   ・chunks の英文は、必ずどれかの行にそのまま含まれること（その話し手の声で作るため）。 */
(function (root) {
'use strict';
var M_GB = 'en-GB-Neural2-B', F_GB = 'en-GB-Neural2-A', M_US = 'en-US-Neural2-D', F_US = 'en-US-Neural2-F', M_AU = 'en-AU-Neural2-B', F_AU = 'en-AU-Neural2-A';
root.HANASERU_LISTENING_LESSONS = [
{
  title: '乗り継ぎがぎりぎり', place: '空港・乗り継ぎカウンター',
  who: { A: '地上係員（男性・英国）', B: '旅行者（女性）' }, voices: { A: M_GB, B: F_US },
  lines: [
    ['A', "Hi there. Can I see your boarding pass? Right, so your flight from Frankfurt came in about forty minutes late."],
    ['B', "Yeah, we got held up on the runway. Do you think I'll still make the connection to Dubai?"],
    ['A', "It's going to be tight, to be honest. Boarding closes in twenty-five minutes, and you've still got to get through security."],
    ['B', "Is there any way to speed that up? I really can't afford to miss this one."],
    ['A', "What I can do is put you in the fast track lane. Just show them this sticker and they'll wave you through."],
    ['B', "That would be great. And if I don't make it, what happens then?"],
    ['A', "Then come straight back to this desk and we'll get you on the next one. It leaves at six, so you wouldn't be stuck here overnight."],
    ['B', "OK, that's a relief. Thanks so much. I'd better run."]
  ],
  gist: '前の便が40分遅れて乗り継ぎがぎりぎり。係員が優先レーンに通してくれる。間に合わなければ、このカウンターに戻れば6時発の次の便に乗せてもらえる。',
  chunks: [
    ["we got held up on the runway.", '滑走路で足止めされた。get held up＝（予定外に）遅らされる。'],
    ["It's going to be tight, to be honest.", '正直、ぎりぎりです。tight＝時間に余裕がない。to be honest は言いにくいことの前置き。'],
    ["you've still got to get through security.", 'まだ保安検査を通らないといけない。have got to＝have to。get through＝通り抜ける。'],
    ["What I can do is put you in the fast track lane.", '私にできるのは、優先レーンに入れることです。What I can do is … は提案の定番の出だし。'],
    ["they'll wave you through.", '（手で合図して）そのまま通してくれる。'],
    ["we'll get you on the next one.", '次の便に乗せます。get 人 on …＝人を…に乗せる。one は flight。'],
    ["you wouldn't be stuck here overnight.", 'ここで一晩足止め、とはなりません。be stuck＝身動きが取れない。']
  ],
  sound: "got to は「ガラ」、going to be は「ゴナビ」、wave you through は一息で聞こえる。単語ではなく、まとまりで待つ。",
  pattern: "What I can do is … / It's going to be tight.",
  reply: '「乗り継ぎに間に合いそうか」を聞き、だめな場合どうなるかを続けて聞いてみる。',
  scenario: "You are airline ground staff at a transfer desk. The learner's incoming flight was late and the connection is tight. Speak at a natural pace, give one piece of information at a time, and mention one complication. Let the learner ask what happens if they miss it."
},
{
  title: '機内の隣席で雑談', place: '機内・隣の席',
  who: { A: '隣の乗客（女性・米国）', B: '旅行者（男性）' }, voices: { A: F_US, B: M_GB },
  lines: [
    ['A', "Sorry, is this yours? I think it slipped under my seat. So, are you heading home, or is this a holiday?"],
    ['B', "Oh, thanks. A bit of both, actually. I'm visiting family, but I'm hoping to spend a couple of days exploring as well."],
    ['A', "Nice. Have you been to Dubai before, or is this your first time?"],
    ['B', "First time, so I haven't really figured out what to see yet. Is there anything you'd recommend?"],
    ['A', "Well, it depends what you're into. If you like food, I'd skip the big malls and head down to the old town by the creek."],
    ['B', "That sounds more like my kind of thing. Is it easy to get around without a car?"],
    ['A', "Pretty easy, yeah. The metro's cheap and it runs every few minutes, but taxis aren't bad either if you're short on time."],
    ['B', "Good to know. I'll probably end up doing a bit of both."]
  ],
  gist: '隣の乗客が落とし物を拾って話しかけてくる。帰省と観光の両方。食べ歩きなら大きなモールより川沿いの旧市街がおすすめ。移動は地下鉄が安くて本数が多く、急ぐならタクシー。',
  chunks: [
    ["I think it slipped under my seat.", '私の席の下に滑り込んだみたい。slip＝するっと入る。'],
    ["A bit of both, actually.", '実は、両方少しずつ。二択で聞かれたときの定番の返し。'],
    ["I haven't really figured out what to see yet.", 'まだ何を見るか、ちゃんと決めていない。figure out＝考えて答えを出す。'],
    ["it depends what you're into.", '何が好きかによります。be into …＝…が好き、はまっている。'],
    ["I'd skip the big malls and head down to the old town by the creek.", '大きなモールは飛ばして、川沿いの旧市街に行きますね。I\'d …＝私なら…する（やわらかい助言）。head down to＝…へ向かう。'],
    ["Is it easy to get around without a car?", '車なしで動き回りやすい？ get around＝あちこち移動する。'],
    ["if you're short on time.", '時間が足りないなら。be short on …＝…が足りない。'],
    ["I'll probably end up doing a bit of both.", '結局、両方少しずつやることになりそう。end up …ing＝結局…することになる。']
  ],
  sound: "what you're into / end up doing / a bit of both は、短い語がつながって一語のように聞こえる。",
  pattern: "It depends what you're into. / I'd skip … and head to …",
  reply: '「初めてなので、おすすめはありますか」と聞き、返ってきた答えにもう一つ質問を足す。',
  scenario: "You are a friendly, talkative fellow passenger on a flight to Dubai. Start with small talk, ask about the learner's trip, give a recommendation using everyday phrasal verbs, and keep the conversation moving at a natural pace."
},
{
  title: 'ホテルで部屋を替えてもらう', place: 'ホテル・フロント',
  who: { A: 'フロント係（男性・豪州）', B: '宿泊客（女性）' }, voices: { A: M_AU, B: F_GB },
  lines: [
    ['A', "Good morning. How was your first night? Did you sleep all right?"],
    ['B', "Not really, to be honest. The room itself is lovely, but it was a lot noisier than I expected."],
    ['A', "Oh, I'm sorry to hear that. Was it coming from the street, or from next door?"],
    ['B', "The street, mostly. There's a bar right underneath, and it didn't quieten down until about two."],
    ['A', "Right, that side can get a bit lively at the weekend. Let me see what I can do. I could move you to the back of the building, on the fifth floor."],
    ['B', "That would be perfect. Would I have to pack everything up now, or can it wait until this afternoon?"],
    ['A', "No rush at all. Just leave your bags in the room, and we'll bring them up while you're out."],
    ['B', "Brilliant. Thanks for sorting that out so quickly."]
  ],
  gist: '最初の夜は、下のバーの音で2時ごろまでうるさかった。フロントが建物の裏側の5階に部屋を替えてくれる。荷物は部屋に置いたままでよく、外出中に運んでくれる。',
  chunks: [
    ["Did you sleep all right?", 'よく眠れましたか。all right＝問題なく。'],
    ["it was a lot noisier than I expected.", '思っていたより、ずっとうるさかった。a lot＋比較級。'],
    ["it didn't quieten down until about two.", '2時ごろまで静かにならなかった。quieten down＝静まる。not … until …＝…まで…しない。'],
    ["that side can get a bit lively at the weekend.", 'そちら側は、週末は少しにぎやかになることがあります。get lively＝にぎやかになる（うるさい、のやわらかい言い方）。'],
    ["Let me see what I can do.", 'できることを確認します。頼まれごとを引き受けるときの定番。'],
    ["Would I have to pack everything up now, or can it wait until this afternoon?", '今すぐ全部荷造りが必要？ それとも午後まで待てる？ pack up＝荷物をまとめる。'],
    ["we'll bring them up while you're out.", '外出中に上の階へ運んでおきます。bring up＝上へ運ぶ。'],
    ["Thanks for sorting that out so quickly.", 'こんなに早く片づけてくれてありがとう。sort out＝（問題を）解決する。']
  ],
  sound: "quieten down / sort that out / pack everything up の、動詞のあとの短い語（down・out・up）まで聞く。",
  pattern: "The room itself is lovely, but … / Let me see what I can do.",
  reply: '良い点を一つ言ってから、困っていることを伝え、「替えてもらえますか」と頼む。',
  scenario: "You are a hotel receptionist. The learner has a problem with the room (noise, temperature, or a broken shower). Ask one clarifying question, offer a realistic option with one condition, and speak at a natural pace."
},
{
  title: 'カフェで注文する', place: 'ホテルの朝食・カフェ',
  who: { A: '店員（女性・豪州）', B: '客（男性）' }, voices: { A: F_AU, B: M_US },
  lines: [
    ['A', "Morning! Are you ready to order, or do you need another minute?"],
    ['B', "I think I'm ready. What would you recommend if I don't want anything too sweet?"],
    ['A', "Then I'd go for the plain yogurt. It comes with honey on the side, so you can add as much or as little as you like."],
    ['B', "That sounds good. Could I get some fruit with that as well?"],
    ['A', "Sure. We've run out of berries, I'm afraid, but we've got mango and melon. Would either of those work?"],
    ['B', "Mango's fine. And a flat white, please. Actually, could you make that a large?"],
    ['A', "No problem. Is that to have here, or to take away?"],
    ['B', "To have here. I'm not in any hurry this morning."]
  ],
  gist: '甘すぎないものを聞くと、はちみつが別添えのプレーンヨーグルトをすすめられる。ベリーは品切れで、マンゴーにする。フラットホワイトを大きいサイズで、店内で。',
  chunks: [
    ["do you need another minute?", 'もう少しお時間が要りますか。'],
    ["I'd go for the plain yogurt.", '私ならプレーンヨーグルトを選びます。go for＝…を選ぶ。'],
    ["It comes with honey on the side,", 'はちみつは別添えで付いてきます。come with＝付いてくる。on the side＝別添えで。'],
    ["so you can add as much or as little as you like.", '好きなだけ多くも少なくも足せます。'],
    ["We've run out of berries, I'm afraid,", 'あいにくベリーは切らしています。run out of＝切らす。I\'m afraid＝残念ながら。'],
    ["Would either of those work?", 'どちらかで大丈夫ですか。work＝都合が合う。'],
    ["Actually, could you make that a large?", 'やっぱり、大きいサイズにしてもらえますか。Actually は言い直しの合図。'],
    ["Is that to have here, or to take away?", '店内ですか、持ち帰りですか（英・豪。米国は for here or to go）。']
  ],
  sound: "run out of は「ラナウタ」、as much or as little as は弱い as が続く。Would either of those も一息。",
  pattern: "I'd go for … / Actually, could you make that …?",
  reply: '好みを一つ伝えておすすめを聞き、途中で一つ注文を変えてみる。',
  scenario: "You are a friendly cafe server speaking quickly and naturally. Take the learner's order, say that one item has run out, offer two alternatives, and ask whether it is to have here or to take away."
},
{
  title: '道を聞いたら早口で返ってきた', place: '街なか・駅へ向かう道',
  who: { A: '地元の人（男性・英国）', B: '旅行者（女性）' }, voices: { A: M_GB, B: F_AU },
  lines: [
    ['B', "Excuse me, sorry to bother you. Is the station within walking distance from here?"],
    ['A', "It is, yeah, but the route that comes up on your phone takes you up a really steep hill. I'd take the road along the river instead."],
    ['B', "OK. So I go down to the river first, and then which way?"],
    ['A', "Turn left at the bridge, don't cross it, and just keep going until you come to a big roundabout. You can't miss it."],
    ['B', "Left at the bridge, then straight on to the roundabout. And the station's right there?"],
    ['A', "More or less. It's tucked away behind the supermarket, so look out for the blue sign."],
    ['B', "Got it. Roughly how long would that take on foot?"],
    ['A', "Fifteen minutes or so, if you're not dragging a suitcase. Twenty, tops."]
  ],
  gist: '駅は歩ける距離。スマホの道順は急な坂なので、川沿いの道がよい。橋は渡らずに左、大きなロータリーまで直進。駅はスーパーの裏で、青い看板が目印。歩いて15分、長くて20分。',
  chunks: [
    ["Is the station within walking distance from here?", '駅はここから歩ける距離ですか。'],
    ["the route that comes up on your phone takes you up a really steep hill.", 'スマホに出てくる道順は、すごく急な坂を登ることになります。come up＝表示される。'],
    ["I'd take the road along the river instead.", '私なら、代わりに川沿いの道を行きます。'],
    ["just keep going until you come to a big roundabout.", '大きなロータリーに出るまで、そのまま進んでください。come to＝…に行き着く。'],
    ["You can't miss it.", '見落としようがありません（すぐ分かります）。'],
    ["It's tucked away behind the supermarket,", 'スーパーの裏に隠れるようにあります。tucked away＝目立たない所にある。'],
    ["so look out for the blue sign.", 'だから青い看板を探してください。look out for＝…に気をつけて探す。'],
    ["Fifteen minutes or so, if you're not dragging a suitcase. Twenty, tops.", '15分くらい、スーツケースを引いていなければ。長くて20分。tops＝最大でも。']
  ],
  sound: "don't cross it / keep going until / look out for は、切れ目なく流れる。聞こえた道順を自分の言葉で言い直すと確かめられる。",
  pattern: "So I …, and then which way? / Left at …, then straight on to …",
  reply: '聞いた道順を短く言い直して確かめ、かかる時間を聞く。',
  scenario: "You are a local giving directions quickly and casually, with one detour and one landmark. Let the learner repeat the directions back and correct one detail if needed."
},
{
  title: '昨日どうだった？（宿の朝の雑談）', place: 'ホテルの朝食・相席',
  who: { A: '同じ宿の客（女性・英国）', B: '同じ宿の客（男性・豪州）' }, voices: { A: F_GB, B: M_AU },
  lines: [
    ['A', "Morning. Did you manage to get out on the boat yesterday?"],
    ['B', "We were going to, but it got cancelled because of the wind. They only let us know about an hour before."],
    ['A', "Oh no, that's a shame. So what did you end up doing instead?"],
    ['B', "We just wandered around the old town, which turned out to be really nice, actually. We came across this tiny place that does grilled fish."],
    ['A', "Oh, I think I know the one you mean. Is it the one with the blue door, down by the harbour?"],
    ['B', "That's it. We didn't have a booking, but they squeezed us in at the back."],
    ['A', "Lucky you. We tried on Monday and got turned away. Are you going to give the boat another go?"],
    ['B', "If the weather holds, yeah. They've put us down for tomorrow morning."]
  ],
  gist: '昨日の船は風で中止。連絡は1時間前。代わりに旧市街を歩いたら良くて、港のそばの青い扉の魚の店に、予約なしで入れてもらえた。相手は月曜に断られた。天気がもてば、明日の朝に船に再挑戦。',
  chunks: [
    ["Did you manage to get out on the boat yesterday?", '昨日、船には出られましたか。manage to＝なんとか…できる。'],
    ["We were going to, but it got cancelled because of the wind.", 'そのつもりだったけれど、風で中止になった。were going to＝…するはずだった。'],
    ["So what did you end up doing instead?", 'それで、代わりに結局何をしたの？'],
    ["which turned out to be really nice, actually.", 'それが実は、とても良かった。turn out＝結果として…だと分かる。'],
    ["We came across this tiny place that does grilled fish.", '焼き魚を出す小さな店を偶然見つけた。come across＝偶然出会う。'],
    ["they squeezed us in at the back.", '奥の席に、なんとか入れてくれた。squeeze in＝無理に入れる。'],
    ["We tried on Monday and got turned away.", '月曜に行ったら断られた。turn away＝追い返す。'],
    ["Are you going to give the boat another go?", '船にもう一度挑戦しますか。give … another go＝もう一度やってみる。'],
    ["They've put us down for tomorrow morning.", '明日の朝で予約を入れてくれた。put 人 down for＝名前を書き入れる。']
  ],
  sound: "end up doing / turned out to be / came across は、過去の話で何度も出る。前後の語とつながる音に慣れる。",
  pattern: "We were going to, but … / It turned out to be …",
  reply: '「…するつもりだったが、結局…した。それが意外と良かった」と、自分の昨日に置き換えて話す。',
  scenario: "You are a friendly guest at the same hotel, chatting at breakfast. Ask what the learner did yesterday, react with short comments (Oh no, Lucky you), share a small story of your own, and ask a follow-up question."
},
{
  title: '入国審査で質問が続く', place: '空港・入国審査',
  who: { A: '入国審査官（女性・米国）', B: '旅行者（男性）' }, voices: { A: F_US, B: M_GB },
  lines: [
    ['A', "Next, please. Passport. Thank you. Where are you flying in from today?"],
    ['B', "From Tokyo, via Frankfurt."],
    ['A', "And what brings you here? Is it business or pleasure?"],
    ['B', "Business, mainly. I'm giving a talk at a medical conference, and then I'm staying on for a few days."],
    ['A', "A medical conference. So you're a doctor? What field are you in?"],
    ['B', "I'm a pediatrician. I run a children's clinic back in Japan."],
    ['A', "OK. And how long are you planning to stay altogether? Have you got a return ticket?"],
    ['B', "Eight days in total. I fly back on the twelfth. I can pull up the booking if you need it."],
    ['A', "That won't be necessary. Look into the camera for me, please. All right, you're all set. Enjoy your stay."]
  ],
  gist: '東京からフランクフルト経由。目的は主に仕事で、医学の学会で発表し、数日延ばして滞在。小児科医で日本で子どものクリニックを運営。滞在は全部で8日、12日に帰国。',
  chunks: [
    ["Where are you flying in from today?", '今日はどこから飛んで来ましたか。fly in from＝…から到着する。'],
    ["And what brings you here?", 'こちらへは何の用で？（目的を聞く定番の言い方）'],
    ["Is it business or pleasure?", '仕事ですか、観光ですか。'],
    ["I'm giving a talk at a medical conference, and then I'm staying on for a few days.", '医学の学会で発表して、そのあと数日延ばして滞在します。stay on＝そのまま残る。'],
    ["What field are you in?", 'ご専門は何ですか。'],
    ["how long are you planning to stay altogether?", '全部でどのくらい滞在する予定ですか。altogether＝合計で。'],
    ["I can pull up the booking if you need it.", '必要なら予約を画面に出せます。pull up＝（画面に）出す。'],
    ["you're all set.", 'これで完了です。all set＝準備・手続きが済んだ。']
  ],
  sound: "質問は短く速い。flying in from / what brings you / are you in の、文末の前置詞まで聞く。",
  pattern: "I'm giving a talk at …, and then I'm staying on for …",
  reply: '目的・職業・滞在日数を、聞かれた順に短く答える。',
  scenario: "You are an immigration officer asking short, quick questions one at a time: where from, purpose, occupation, length of stay, return ticket. Stay neutral and brisk. Do not explain; just ask the next question."
},
{
  title: '機内で客室乗務員とやり取り', place: '機内・食事と着陸前',
  who: { A: '客室乗務員（男性・豪州）', B: '乗客（女性）' }, voices: { A: M_AU, B: F_US },
  lines: [
    ['A', "Excuse me, we've got chicken with rice or the pasta today. Which would you like?"],
    ['B', "The chicken, please. Oh, and is there any chance of some more water?"],
    ['A', "Of course. I'll bring a bottle round in a minute. Would you like anything else to drink with that?"],
    ['B', "Just a coffee later on, if that's OK. By the way, do you know if we're going to land on time?"],
    ['A', "We've made up most of the delay, so we should be about ten minutes behind. We may hit a bit of turbulence on the way down, though."],
    ['B', "Right. And will I need to fill in a landing card before we arrive?"],
    ['A', "Not any more. It's all done at the machines now, so just have your passport ready when you get off."],
    ['B', "Oh, that's handy. Thanks for letting me know."]
  ],
  gist: '食事は鶏肉とご飯かパスタ。水を追加で頼む。遅れはほとんど取り戻し、約10分遅れで到着の見込み。降下中に少し揺れるかもしれない。入国カードはもう不要で、機械で手続きするのでパスポートを用意。',
  chunks: [
    ["is there any chance of some more water?", 'お水をもう少しもらえますか。any chance of …＝控えめな頼み方。'],
    ["I'll bring a bottle round in a minute.", 'すぐに1本お持ちします。bring round＝（席まで）持ってくる。'],
    ["Just a coffee later on, if that's OK.", 'あとでコーヒーだけ、よければ。later on＝あとで。'],
    ["By the way, do you know if we're going to land on time?", 'ところで、定刻に着陸するか分かりますか。By the way＝話題を変える合図。'],
    ["We've made up most of the delay,", '遅れの大部分を取り戻しました。make up＝埋め合わせる。'],
    ["so we should be about ten minutes behind.", 'なので10分ほどの遅れになるはずです。behind＝遅れて。'],
    ["We may hit a bit of turbulence on the way down, though.", 'ただ、降下中に少し揺れるかもしれません。文末の though＝「ただし」。'],
    ["will I need to fill in a landing card before we arrive?", '到着前に入国カードを書く必要がありますか。fill in＝記入する。'],
    ["just have your passport ready when you get off.", '降りるときにパスポートを用意しておいてください。get off＝降りる。']
  ],
  sound: "bring a bottle round / made up most of / on the way down は一息。文末に付く though を聞き逃さない。",
  pattern: "Is there any chance of …? / By the way, do you know if …?",
  reply: '頼みごとを一つして、By the way で別の質問（到着時刻・手続き）につなげる。',
  scenario: "You are a cabin crew member during meal service. Offer two meal choices, respond to a request, and answer a question about arrival time with one extra detail (delay, turbulence, or landing procedure). Speak naturally and briskly."
},
{
  title: 'タクシーで話しかけられる', place: '空港からホテルへのタクシー',
  who: { A: '運転手（男性・英国）', B: '乗客（女性）' }, voices: { A: M_GB, B: F_US },
  lines: [
    ['A', "Where are we off to, then? The Marina, was it?"],
    ['B', "That's right, the hotel on the corner of Palm Street. Do you know roughly how long it'll take?"],
    ['A', "This time of day, about forty minutes. There's been a bit of a hold-up on the main road, so I'll cut through the back streets if that's all right with you."],
    ['B', "Sure, whatever's quickest. Is the traffic always this bad?"],
    ['A', "It's not usually too bad, but there's a big conference on this week, so the whole place is packed. Is that what you're here for?"],
    ['B', "It is, actually. I'm speaking on Thursday, so I wanted a day to get over the jet lag first."],
    ['A', "Very sensible. First time over here? You'll want to stay out of the sun around midday. It really catches people out."],
    ['B', "I'll keep that in mind. Could you drop me off right at the entrance? I've got quite a bit of luggage."]
  ],
  gist: 'マリーナのホテルまで約40分。大通りが渋滞なので裏道を抜ける。今週は大きな学会があって街中が混んでいる。乗客は木曜に発表で、時差ぼけを取るため1日早く着いた。昼の日差しは避けるよう助言。荷物が多いので玄関前で降ろしてもらう。',
  chunks: [
    ["Where are we off to, then?", 'さて、どちらまで？ be off to＝…へ出かける。'],
    ["Do you know roughly how long it'll take?", 'だいたいどのくらいかかるか分かりますか。roughly＝おおよそ。'],
    ["There's been a bit of a hold-up on the main road,", '大通りでちょっとした渋滞が起きています。hold-up＝遅れ、渋滞。'],
    ["so I'll cut through the back streets if that's all right with you.", 'よろしければ裏道を抜けます。cut through＝通り抜けて近道する。'],
    ["there's a big conference on this week, so the whole place is packed.", '今週は大きな学会があるので、街中が混んでいます。be on＝開催中。packed＝ぎっしり。'],
    ["I wanted a day to get over the jet lag first.", 'まず時差ぼけを治す1日が欲しかった。get over＝回復する。'],
    ["You'll want to stay out of the sun around midday.", '昼ごろは日差しを避けたほうがいいですよ。You\'ll want to …＝やわらかい助言。'],
    ["It really catches people out.", '本当に、みんな不意を突かれます。catch out＝油断している所を突く。'],
    ["Could you drop me off right at the entrance?", '玄関のすぐ前で降ろしてもらえますか。drop off＝降ろす。']
  ],
  sound: "off to / cut through / get over / drop me off。動詞＋短い語の組み合わせが続く。it'll は「イトゥ」と弱い。",
  pattern: "Do you know roughly how long …? / Could you drop me off at …?",
  reply: '行き先と所要時間を確かめ、聞かれたら来た目的を一文で答える。',
  scenario: "You are a chatty taxi driver taking the learner from the airport to a hotel. Confirm the destination, mention traffic and a shortcut, ask why they are visiting, and give one piece of local advice using natural phrasal verbs."
},
{
  title: '学会の休憩で話しかけられる', place: '学会会場・コーヒー休憩',
  who: { A: '参加者（女性・英国）', B: '発表者（男性・日本から）' }, voices: { A: F_GB, B: M_US },
  lines: [
    ['A', "Hi, sorry to jump in. I caught the end of your talk just now. I'm Sarah, by the way. I work in pediatric nutrition in Manchester."],
    ['B', "Oh, nice to meet you. Thanks for coming along. What did you make of it?"],
    ['A', "I thought it was really interesting, especially the part about constipation and diet. I hadn't come across that approach before. How did you get into it in the first place?"],
    ['B', "Well, I trained as a pediatric surgeon, and I kept seeing children who didn't actually need surgery. So I started looking into what was going on underneath."],
    ['A', "That makes sense. And does it work for most families, or do some of them find it hard to stick to?"],
    ['B', "Some do struggle at first, to be honest. That's why we break it down into small steps and check in with them every few weeks."],
    ['A', "I'd love to hear more about how you set that up. Are you around this afternoon, or are you rushing off?"],
    ['B', "I'm here until five. Why don't we grab a coffee after the next session?"]
  ],
  gist: '発表の終わりを聞いた参加者（英国・小児栄養）が話しかけてくる。便秘と食事の話が面白かった。もとは小児外科医で、手術が要らない子を多く診て、背景を調べ始めた。続けにくい家族には小さな段階に分け、数週間ごとに確認する。午後5時までいるので、次のセッションのあとにコーヒーを。',
  chunks: [
    ["Hi, sorry to jump in.", 'すみません、割り込んで。jump in＝会話に入る。'],
    ["I caught the end of your talk just now.", 'さっき、発表の終わりのほうを聞きました。catch＝（途中から）聞く、間に合う。'],
    ["What did you make of it?", 'どう思いましたか。make of＝…をどう受け取る。'],
    ["I hadn't come across that approach before.", 'その方法には、これまで出会ったことがありませんでした。'],
    ["How did you get into it in the first place?", 'そもそも、どうしてその分野に入ったのですか。get into＝関わり始める。in the first place＝そもそも。'],
    ["So I started looking into what was going on underneath.", 'それで、その下で何が起きているのかを調べ始めました。look into＝調べる。'],
    ["do some of them find it hard to stick to?", '続けるのが難しいと感じる家族もいますか。stick to＝続ける、守る。'],
    ["we break it down into small steps and check in with them every few weeks.", '小さな段階に分けて、数週間ごとに様子を確かめます。break down＝分ける。check in with＝連絡して確かめる。'],
    ["Are you around this afternoon, or are you rushing off?", '午後はいらっしゃいますか、それともすぐ出ますか。be around＝近くにいる。rush off＝急いで去る。'],
    ["Why don't we grab a coffee after the next session?", '次のセッションのあとで、コーヒーでもどうですか。grab＝さっと取る。']
  ],
  sound: "make of it / come across / get into it / looking into / stick to。発表のあとの雑談は、こうした短い熟語が続く。",
  pattern: "Well, I trained as …, and I kept seeing … So I started …",
  reply: '「なぜその分野に？」に、Well, で始めて、経歴→気づいたこと→始めたこと、の3文でつなぐ。',
  scenario: "You are a pediatric nutrition specialist who just heard the learner's conference talk on childhood constipation and nutrition. Introduce yourself, say what interested you, and ask how they got into the field and how families cope. Ask one question at a time at a natural pace. Do not supply the learner's answers or add medical claims of your own."
}
];
}(typeof window !== 'undefined' ? window : globalThis));
