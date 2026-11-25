/* 🩺 診察を英語で：栄養外来（2026-11-25 院長「栄養外来の結果説明を足す」）。
   決まりは clinic-dialogues.js と同じ：医師の言葉の中身は院長承認の説明文（source のキットID）と、
   結果説明の5分の型（Vault 22_アプリ開発/13_栄養解析アプリ/13_🎬結果説明の型…：答え→先回り→数字は3つ→今日から→2段構え→決める）から取る。
   そこに無い量・製品名・見通しは足さない。効果を約束する言い方をしない（「変化を見ていく」と言う）。
   保護者の言葉、症例の設定、検査の項目の組み合わせは練習用の創作。問診の質問は診察の型（Sの箱）に沿った一般的な言い方。 */
(function (root) {
'use strict';
var DOC = 'en-US-Neural2-D', MOM_US = 'en-US-Neural2-F', MOM_GB = 'en-GB-Neural2-A', MOM_AU = 'en-AU-Neural2-A', DAD_GB = 'en-GB-Neural2-B', DAD_AU = 'en-AU-Neural2-B';
function turn(heard, heardJa, intent, en, note) { return { heard: heard, heardJa: heardJa, intent: intent, en: en, note: note }; }
var list = [
{ id: 'consult-nutri-history', title: '栄養外来の初診：自分から聞く（問診）', role: '母親', source: '診察の型（Sの箱：経過・いま困っていること・食事と生活・不安と期待・飲んでいるもの）＋一般的な問診の質問', voices: { heard: MOM_GB, en: DOC },
  context: '13歳の女の子の初診。朝起きられず、疲れやすい。院長が質問を重ねて、いちばん困っていること・いつから・朝の様子・食事・甘いもの・お腹・飲んでいるもの・今日への期待を聞き取る。答えを一言で受けてから次の質問へつなぐ練習。',
  goal: '開いた質問（What … / How …）と、受ける一言（I see. / That helps.）で、相手に多く話してもらえる',
  turns: [
    turn("Thanks for seeing us. She's just exhausted all the time, and we don't know where to start.", '診ていただいてありがとうございます。娘はいつも疲れ切っていて、どこから手をつけていいか分かりません。', '受けて、いま一番困っていることを聞く。',
      "Thank you for coming in. Let's start from here: what is the hardest thing for her right now?", 'Let\'s start from here: で入口を一つに絞る。開いた質問（What is …?）。'),
    turn("Mornings, really. She just can't get out of bed, and she's missing a lot of school.", '朝ですね。どうしても起きられなくて、学校をずいぶん休んでいます。', '受けて、いつごろからかを聞く。',
      "I see, the mornings. When did that start?", '相手の言葉をくり返して受ける（I see, the mornings.）。'),
    turn("Around last spring, I think. After she started junior high.", '去年の春ごろだと思います。中学に入ってからです。', '受けて、ふだんの食事（朝・昼・夜）を聞く。',
      "Around last spring, right. Tell me about her meals. What does she usually eat in a day?", 'Tell me about …＝…について聞かせてください（相手に長く話してもらう形）。'),
    turn("She skips breakfast most days. Lunch is whatever's at school, and dinner's mostly rice or pasta. She's not keen on meat.", 'ほとんど朝は抜きです。昼は給食で、夜はたいていご飯かパスタ。お肉はあまり好きではありません。', '助かると受け、甘いものやおやつを聞く。',
      "That helps a lot. What about sweet things and snacks? Does she want them often?", 'be keen on＝好き（保護者の言葉）。What about …? で話題を移す。'),
    turn("All the time. Especially after school. She gets really irritable if she doesn't have something.", 'しょっちゅうです。特に放課後。何か食べないと、とてもイライラします。', '受けて、お腹とうんちの様子を聞く。',
      "I see. And how is her tummy? Does she go regularly?", 'irritable＝イライラしやすい。How is her tummy?。'),
    turn("Not really. Every three days or so, and she often says she feels bloated.", 'あまり。3日に1回くらいで、お腹が張るとよく言います。', '受けて、飲んでいる薬やサプリを聞く。',
      "Thank you. Is she taking any medicine or supplements at the moment?", 'feel bloated＝お腹が張る。at the moment＝いま。'),
    turn("Just a multivitamin I bought online. I'm not sure it's doing anything.", 'ネットで買ったマルチビタミンだけです。効いているのかどうか。', '最後に、今日いちばん期待していることを聞く。',
      "OK. One last question: what are you hoping to get from today's visit?", 'One last question: で終わりを知らせ、期待を聞いて締める。')
  ],
  challenge: turn("Sorry, do you mean what she eats, or how much?", 'すみません、何を食べるかですか、それとも量ですか？', '質問を言い直す。',
    "Both, if you can. But let's start with what she eats at each meal.", 'Both, if you can. But let\'s start with …（広げすぎず、入口を一つに）') },

{ id: 'consult-nutri-result', title: '血液検査の結果説明：5分の型', role: '母親', source: '結果説明の5分の型（13_🎬結果説明の型…）／K-栄養-前日-結果説明のレポート／K-栄養-再診-方向性が決まった後の通い方', voices: { heard: MOM_US, en: DOC },
  context: '13歳の女の子。事前にレポートを送ってある。結果説明を5分の型で：答え → 先回り（気にしなくてよい数字）→ 数字は3つ → 今日から（サプリ1つ＋食事1つ）→ 2段構え → 決める。検査の中身は練習用の設定（鉄の蓄え・ビタミンD・ビタミンB6）。',
  goal: '答えを最初の20秒で言い、数字を3つに絞って話せる',
  turns: [
    turn("We read the report last night, but honestly, I'm not sure what it all means. Is something wrong with her?", '昨夜レポートを読みましたが、正直、全体の意味がよく分かりません。どこか悪いんでしょうか？', '答えを先に：病気はなかった。栄養の目では2つ足りていない。',
      "Let me give you the answer first. We found no disease. From a nutrition point of view, two things are low: her iron stores and her vitamin D.", 'Let me give you the answer first.＝まず答えからお伝えします。from a nutrition point of view＝栄養の目では。'),
    turn("There's a section at the end with numbers that are slightly off. Should I be worried about those?", '最後に、少し外れている数字の欄がありました。あれは心配したほうがいいですか？', '先回り：最後の「気にしなくてよい数字」は診断ではない。',
      "That last section is the list of numbers you don't need to worry about. It is not a diagnosis.", '短く言い切って、先に不安をほどく。'),
    turn("OK, that's a relief. So which numbers actually matter?", 'それなら安心です。じゃあ、大事な数字はどれですか？', '数字は3つだけ、大事な順に。',
      "Just three, in order of importance. First, her iron stores, called ferritin. Second, vitamin D. And third, a marker that tells us about vitamin B6.", 'Just three, in order of importance.（数を先に言い、First / Second / And third）'),
    turn("And what do we do about it? Where do we start?", 'それで、どうすればいいですか？ 何から始めますか？', '今日から：サプリ1つ＋食事1つ。印をつけてきた方を確かめる。',
      "We start with two things today: one supplement, and one change in her meals. You marked the one she could probably take on the sheet. Let's check that together.", 'one supplement, and one change＝1つずつに絞る。Let\'s check that together.'),
    turn("How soon will she feel different? She's desperate to get back to school properly.", 'どのくらいで変わりますか？ 本人は、ちゃんと学校に戻りたくて必死です。', '2段構え：目先は分かりやすい変化を見る（朝の動きなど）。長い目では年単位で体に貯金する。',
      "I think about it in two stages. In the short term, we watch for changes that are easy to notice, like how she gets going in the morning. In the long term, over years, she's building up savings in her body.", 'in two stages＝2段構えで。効果を約束せず、「変化を見る」と言う。build up savings＝貯金する（院長のたとえ）。'),
    turn("All right. So what's the plan from here?", '分かりました。それで、これからの予定は？', '決める：では◯◯にしましょうか。次回と、3か月目ごろの血液検査。',
      "Then shall we go with this supplement? For the first month, please watch the small daily changes, and tell me at the next visit. Around the third month, we'll check the changes inside her body with another blood test.", 'Then shall we go with …?＝では…にしましょうか（決める一言）。')
  ],
  challenge: turn("Sorry, what does 'iron stores' mean? Is that the same as anemia?", 'すみません、「鉄の蓄え」とは何ですか？ 貧血と同じですか？', '言葉をやさしく言い換える（貧血とまではいかなくても、鉄が足りないことがある）。',
    "Iron stores are the iron her body keeps in reserve. She can be low in stored iron even when she isn't anemic.", 'keep in reserve＝蓄えておく。even when …＝…でなくても。') },

{ id: 'consult-nutri-supplement', title: 'サプリを始める日：飲み方と不安', role: '父親', source: 'K-栄養-退室時-サプリ開始_飲み方と注意点／K-栄養-退室時-結果説明後フォロー', voices: { heard: DAD_GB, en: DOC },
  context: '9歳の男の子。結果説明のあと、サプリを始める。父親は「食事だけで何とかならないか」「薬のようなものか」と迷っている。当院の考え方、始め方、量の合わせ方、受診の目安を伝える。',
  goal: '迷いを受け、「食事が一番。ただ…」と考え方を続けて言える',
  turns: [
    turn("To be honest, I'd rather fix this with food than with pills. Is that not possible?", '正直、錠剤より食事で治したいんです。それは無理ですか？', '当院も食事で改善できるのが一番と考えている。ただ、大きく不足した栄養を食事だけで満たすのは、小さな胃腸に負担が大きすぎる。',
      "We think the same: improving through food is the best way. But when a nutrient is very low, filling the gap with food alone is too heavy a load for a small stomach.", 'We think the same: で相手の考えに並ぶ。fill the gap＝不足を埋める。'),
    turn("So are supplements basically medicine?", 'じゃあ、サプリは要するに薬ですか？', 'サプリは、自分の力で食べられるようになるまでの一時的な補助輪。薬のように症状を抑え込むものではない。',
      "They're different from medicine. A supplement is a temporary support, like training wheels, until he can eat enough by himself. It doesn't hold symptoms down the way a drug does.", 'training wheels＝補助輪（院長のたとえ）。the way a drug does＝薬がするようには。'),
    turn("He's fussy. What if he won't take it?", '好き嫌いが激しい子です。飲まなかったら？', '伝えた量から始め、最初は「少し飲めた」で十分。',
      "Start with the amount I told you. At first, \"he took a little today\" is enough.", 'fussy＝好き嫌いが多い。引用の形で目標を下げる。'),
    turn("How do I know if the amount is right?", '量が合っているかは、どうやって分かりますか？', 'ビタミンB群は、おしっこの黄色が保たれる量がちょうどよい。',
      "For the B vitamins, look at his pee. The right amount is the amount that keeps it yellow.", 'The right amount is the amount that …。'),
    turn("His stools went dark after the iron last time he tried it. Is that a problem?", '前に鉄を試したとき、便が黒っぽくなりました。問題ですか？', 'ヘム鉄で便が黒っぽくなるのは心配いらない。',
      "With heme iron, dark stools are expected. You don't need to worry about that.", 'heme iron＝ヘム鉄。be expected＝よくあること。'),
    turn("And is there anything that should make me stop?", 'やめたほうがいいのは、どんなときですか？', '飲んだあとに吐く・発疹が出る・ぐったりする→受診。',
      "If he vomits after taking it, gets a rash, or becomes very drowsy, please bring him in.", '3つ並べて、最後に行動。')
  ],
  challenge: turn("So he won't be on these forever?", 'じゃあ、ずっと飲み続けるわけではないんですね？', '補助輪のたとえで、短く言い直す。',
    "No. They're training wheels. We use them until he can eat enough by himself.", '同じたとえを短く。') },

{ id: 'consult-nutri-first-day', title: '採血した日：結果までの過ごし方', role: '母親', source: 'K-栄養-退室時-初診採血後の共通案内／K-栄養-退室時-A消化力低下', voices: { heard: MOM_AU, en: DOC },
  context: '8歳の男の子。初診で採血した。すぐお腹いっぱいになり、お肉が苦手。結果は次回。それまでの食事の方向（タンパク質と良質な脂質・ちょこちょこ食べ）を伝える。',
  goal: '「結果は次回。それまでにできること」を、具体的な食べ物の例で言える',
  turns: [
    turn("So when do we get the results?", '結果はいつ分かりますか？', '血液検査の結果は、次回の診察で伝える。',
      "I'll go through the blood test results with you at the next visit.", 'go through … with you＝一緒に見ていく。'),
    turn("Is there anything we can do in the meantime?", 'それまでの間に、できることはありますか？', 'それまでは、食事をタンパク質と良質な脂質を中心に。',
      "Yes. Until then, build his meals around protein and good-quality fats.", 'build his meals around …＝…を中心に食事を組む。'),
    turn("He gets full after about three bites, though.", 'でも、3口くらいでお腹いっぱいになるんです。', 'すぐお腹いっぱいになる・お肉が苦手なのは、消化する力が落ちているサイン。',
      "Getting full quickly, and not liking meat, are signs that his digestion is a little weak right now.", 'A and B are signs that …。'),
    turn("So how do I get protein into him?", 'じゃあ、どうやってタンパク質をとらせれば？', 'お肉は、ひき肉・スープ・卵など消化しやすい形から。',
      "Start with forms that are easy to digest: minced meat, soup, eggs.", 'コロンのあとに例を3つ。minced meat＝ひき肉。'),
    turn("And three proper meals a day? That's a battle.", '1日3食きちんと、ですか？ それが戦いなんです。', '1日3食にこだわらず、少量をこまめに（ちょこちょこ食べ）。',
      "You don't have to stick to three meals. Small amounts, often, is fine. We call it little-and-often eating.", 'stick to＝こだわる。little and often＝少しずつ何回も。'),
    turn("That I can do. Where can I find ideas for snacks?", 'それならできます。補食の案は、どこで見られますか？', '始め方と、忙しい日の補食のページを送る。',
      "I'll send you two pages: how to get started, and snack ideas for busy days, including what to choose at a convenience store.", 'two pages: A, and B。')
  ],
  challenge: turn("Sorry, what kind of fats do you mean by 'good-quality'?", 'すみません、「良質な脂質」とは、どんな脂のことですか？', '答えを足しすぎず、資料につなぐ。',
    "The page I'm sending you has examples. Please have a look, and ask me anything at the next visit.", '量や品目を口頭で足さず、資料と次回の診察につなぐ。') },

{ id: 'consult-nutri-sweets', title: '甘いものがやめられない', role: '母親', source: 'K-栄養-退室時-B糖質依存／K-栄養-退室時-学童期の偏食', voices: { heard: MOM_US, en: DOC },
  context: '6歳の男の子。癇癪があり、甘いものをしつこく欲しがる。母親は禁止すべきか悩んでいる。甘いものを欲しがる意味と、最初の一手（お菓子の前に・朝にタンパク質）を伝える。',
  goal: '「禁止しない。その前に足す」を、具体的な食べ物で言える',
  turns: [
    turn("He's obsessed with sweets. If I say no, he has a complete meltdown. Should I just ban them?", '甘いものに取りつかれています。だめと言うと、大爆発です。もう禁止にしたほうがいいですか？', '甘いものを欲しがるのは、体のエネルギーが足りないサイン。最初から禁止にはしない。',
      "Wanting sweet things is a sign that his body is short of energy. So we don't start by banning them.", 'be short of＝足りない。meltdown＝癇癪の大爆発（保護者の言葉）。'),
    turn("Then what do I do when he asks?", 'じゃあ、欲しがったらどうすれば？', 'お菓子の前に、チーズ・ゆで卵・小魚などを少し。',
      "Before the sweets, give him a little of something like cheese, a boiled egg, or small dried fish.", 'Before the sweets, … で順番を変える。'),
    turn("And mornings? He only wants toast with jam.", '朝は？ ジャムを塗ったトーストしか欲しがりません。', '朝ごはんにタンパク質を1品足す。',
      "Keep the toast, and add one protein food to his breakfast.", 'Keep A, and add B.（取り上げずに足す）'),
    turn("He's so picky, though. I worry about balance.", 'でも、すごく偏食で。バランスが心配です。', 'バランスより先に、いま食べられているものにタンパク質をひとつ足す。脂は落とさなくてよい。',
      "Before balance, add one protein to what he already eats: egg, tofu, small fish, cheese, or meat. And you don't need to cut the fat.", 'Before balance, …（優先順位を言う）'),
    turn("He can't eat much in one go.", '一度にたくさんは食べられないんです。', '一度に入らないときは、回数を分ける。',
      "Then split it into more, smaller meals.", 'in one go＝一度に（保護者の言葉）。短く答える。'),
    turn("OK. I'll try the cheese before sweets. That feels doable.", '分かりました。お菓子の前にチーズ、やってみます。それならできそうです。', '受けて、資料を送り、次回に様子を聞く。',
      "That's a good place to start. I'll send you a page about this. Tell me how it goes at the next visit.", 'a good place to start＝いい出発点。')
  ],
  challenge: turn("So I don't have to take the sweets away?", 'じゃあ、お菓子を取り上げなくていいんですね？', '短く言い直す。',
    "That's right. We don't begin with a ban. We put some protein in first.", 'That\'s right. で受け、順番を一文で。') },

{ id: 'consult-nutri-morning', title: '朝起きられない：夜を越える補食', role: '父親', source: 'K-栄養-再診-朝の低血糖', voices: { heard: DAD_AU, en: DOC },
  context: '10歳の女の子の再診。朝どうしても起きられない。夜を越える燃料が保てていないと考え、寝る前の補食と、夕食後の5分の運動を伝える。',
  goal: 'たとえ（燃料）で理由を言い、今夜からの行動を2つ伝えられる',
  turns: [
    turn("We've sorted out bedtime, but she still can't get up. It's like trying to wake a log.", '寝る時間は整えたのに、まだ起きられません。丸太を起こすみたいです。', '朝起きられないのは、体が夜を越える燃料を保てていないサイン。',
      "Not being able to get up in the morning is a sign that her body can't hold enough fuel to get through the night.", 'get through the night＝夜を越える。fuel＝燃料（院長のたとえ）。'),
    turn("Fuel? But she eats a decent dinner.", '燃料？ でも、夕食はちゃんと食べています。', '寝る前に「夜を越える補食」をとる。',
      "Even so, I'd like her to have a small snack before bed. I call it a snack to carry her through the night.", 'Even so, …＝それでも。carry her through＝持ちこたえさせる。'),
    turn("What kind of snack?", 'どんな補食ですか？', '小さなおにぎりと卵、さつまいもと豆乳など。',
      "For example, a small rice ball and an egg. Or some sweet potato and soy milk.", 'For example, A. Or B.'),
    turn("Is there anything else we can do in the evening?", '夜にほかにできることは？', '夕食後に5分だけ体を動かす。',
      "Yes. After dinner, have her move her body for just five minutes.", 'for just five minutes＝5分だけ。'),
    turn("That's it? It sounds almost too simple.", 'それだけですか？ 簡単すぎるくらいですね。', '資料（1か月の始め方）を送る。次回に朝の様子を聞く。',
      "It's a simple start, and that's the point. I'll send you a one-month starter page. At the next visit, tell me how her mornings have been.", 'that\'s the point＝そこが大事な所です。')
  ],
  challenge: turn("Won't a snack before bed be bad for her teeth, or make her gain weight?", '寝る前に食べるのは、歯に悪かったり、太ったりしませんか？', '足しすぎず、次回の診察で相談すると伝える。',
    "That's a fair question. Let's keep the snack small, as I said, and talk about how it's going at the next visit.", 'That\'s a fair question.＝もっともな質問です。説明文に無い答えは足さない。') },

{ id: 'consult-nutri-orthostatic', title: '朝の起き方：水分・塩分・立ち方', role: '母親', source: 'K-栄養-退室時-起立性調節_朝の起き方', voices: { heard: MOM_GB, en: DOC },
  context: '14歳の男の子。朝起きると気分が悪く、立ちくらみがある。水分と塩分の増やし方、朝の起き方の段階、薬が効くまでの期間、受診の目安を伝える。',
  goal: '量（コップ1〜2杯・味噌汁1杯）と手順（座る→足を下ろす→立つ）を、順に言える',
  turns: [
    turn("He feels sick and dizzy as soon as he gets up. He says the room goes dark.", '起きたとたんに気持ちが悪くなって、めまいがします。部屋が暗くなると言います。', '受けて、まず水分：いまよりコップ1〜2杯多く。',
      "That sounds unpleasant for him. Let's start with fluids: one or two more glasses a day than he drinks now.", 'the room goes dark＝目の前が暗くなる（本人の言葉）。than he drinks now＝いまより。'),
    turn("And food? Is there anything he should eat more of?", '食べ物は？ 多めにとったほうがいいものは？', '塩分はふだん＋3gほど。味噌汁1杯くらい。',
      "A little more salt. About three grams on top of his usual food. That's roughly one bowl of miso soup.", 'on top of …＝…に加えて。roughly＝おおよそ。'),
    turn("How should he get up in the morning? I've been pulling the covers off.", '朝はどう起こせばいいですか？ 布団をはがしていました。', '横になったまま水分を飲み、座る→足を下ろす→立つ、と段階を踏む。',
      "In steps. First, he drinks something while still lying down. Then he sits up. Then he puts his feet down. And then he stands.", 'In steps. ＋ First / Then / Then / And then。'),
    turn("And the tablets you prescribed? Will he feel better tomorrow?", '処方された薬は？ 明日には楽になりますか？', '薬は1〜2週間かけて効いてくる。',
      "The medicine takes one to two weeks to start working.", '期待の日数を正直に。'),
    turn("Is there anything that would be a red flag?", '危険なサインはありますか？', '倒れて頭を打った／胸の痛みや動悸が続く／急な強い頭痛や嘔吐→次回を待たずに受診。',
      "Yes. If he falls and hits his head, if chest pain or a racing heart continues, or if he has a sudden strong headache or vomiting, please come in without waiting for the next visit.", 'a racing heart＝動悸。red flag＝危険なサイン（保護者の言葉）。')
  ],
  challenge: turn("Sorry, how much extra water was it?", 'すみません、水分はどのくらい増やすんでしたっけ？', '数字で短く言い直す。',
    "One or two more glasses a day than now.", '数字だけで短く。') },

{ id: 'consult-nutri-continue', title: '方向が決まったあとの通い方', role: '母親', source: 'K-栄養-再診-方向性が決まった後の通い方', voices: { heard: MOM_AU, en: DOC },
  context: '11歳の女の子。食事とサプリの方向が決まった。ここからは続ける時期。1か月の間に見てほしい小さな変化、3か月目の血液検査、通い方を伝える。',
  goal: '「何を見て、いつ確かめるか」を、時期の順に言える',
  turns: [
    turn("So now that we've got a plan, what happens next? Do we need to come in every month?", '方針が決まったので、次はどうなりますか？ 毎月来る必要がありますか？', 'ここからは、決めた食事とサプリを続けていく時期。',
      "From here, it's a time for continuing: the meals and the supplements we decided on.", 'it\'s a time for …＝…の時期です。'),
    turn("What should I be looking out for at home?", '家では、何を見ていればいいですか？', '始めて1か月ほどは、朝の起きやすさ・うんち・機嫌や集中・食べられる量などの小さな変化を見て、次の診察で教えてもらう。',
      "For the first month or so, watch the small daily changes: how easily she gets up, her stools, her mood and concentration, and how much she can eat. Then tell me at the next visit.", 'コロンのあとに4つ並べる。'),
    turn("And when do we know if it's actually working inside?", '体の中で本当に効いているかは、いつ分かりますか？', '3か月目ごろに、血液検査で体の中の変化を確かめる。',
      "Around the third month, we'll check the changes inside her body with a blood test.", 'Around the third month＝3か月目ごろ。'),
    turn("What about the months in between? Do we need an appointment just to get more supplements?", 'その間の月は？ サプリをもらうだけでも予約が要りますか？', 'いまのサプリで続ける月は、診察なしでクリニックの窓口で求められる。',
      "In the months when she continues with the same supplements, you can get them at the clinic's front desk, without a consultation.", 'front desk＝窓口。without a consultation＝診察なしで。'),
    turn("That's much easier. And how do we book the next one?", 'それは助かります。次の予約は、どう取ればいいですか？', '予約はアプリ（デジスマ）から。資料も送る。',
      "Please book through the clinic app. I'll also send you a page about how to continue.", '短く、手段を一つ。')
  ],
  challenge: turn("Sorry, when was the blood test again?", 'すみません、血液検査はいつでしたっけ？', '時期を短く言い直す。',
    "Around the third month after starting.", '数字で短く。') },

{ id: 'consult-nutri-wheat-dairy', title: '小麦と乳製品を減らしてみる', role: '父親', source: 'K-栄養-退室時-小麦と乳製品を減らしてみる', voices: { heard: DAD_GB, en: DOC },
  context: '7歳の男の子。お腹の不調と、集中の続かなさ。診察で、小麦と乳製品をしばらく減らしてみることにした。理由、どこまで、変化の見方を伝える。言い切らず、「分かっている／考えられている」を区別する。',
  goal: '確かなことと、考えられていることを、言い分けられる',
  turns: [
    turn("Cutting out wheat and dairy sounds a bit extreme. What's the thinking behind it?", '小麦と乳製品を抜くのは、少し極端に聞こえます。どういう考えですか？', '小麦（グルテン）と乳製品（カゼイン）は消化されにくいタンパク質で、腸のバリアに負担をかけやすいことが分かっている。',
      "Wheat and dairy contain proteins, gluten and casein, that are hard to digest. We know they can put a strain on the barrier of the gut.", 'the thinking behind it＝その考え方（保護者の言葉）。put a strain on＝負担をかける。'),
    turn("And what's that got to do with his concentration?", 'それが、集中力と何の関係があるんですか？', '腸の状態は、集中や気持ちの落ち着きにも影響すると考えられている。',
      "The state of the gut is thought to affect concentration and how settled a child feels, too.", 'is thought to …＝…と考えられている（言い切らない）。'),
    turn("So how strict do we have to be? Is soy sauce out as well?", 'どのくらい厳しくやるんですか？ しょうゆもだめですか？', '調味料に少し入っている分までは気にしなくてよい。どこまで・どのくらいの期間かは、診察で話した内容を優先。',
      "You don't need to worry about the small amounts in seasonings. For how far to go, and for how long, please follow what we agreed in today's visit.", 'seasonings＝調味料。what we agreed＝決めたこと。'),
    turn("And how do we know if it's making any difference?", '違いが出ているかは、どうやって分かりますか？', 'お腹や機嫌、集中の変化を見る。',
      "Watch for changes in his tummy, his mood, and his concentration, and tell me what you notice.", '3つ並べて、次回につなぐ。'),
    turn("OK. We'll give it a go.", '分かりました。やってみます。', '受けて、理由をまとめたページを送る。',
      "Thank you. I'll send you a page that explains the reasons, so you can share it at home.", 'give it a go＝やってみる（保護者の言葉）。so you can share it at home。')
  ],
  challenge: turn("So is it proven that this helps concentration?", 'じゃあ、これで集中がよくなると証明されているんですか？', '確かなことと、考えられていることを分けて言い直す。',
    "What we know is that these proteins can strain the gut. The link with concentration is what is thought, so we'll watch how he does.", 'What we know is … / … is what is thought.（確かさを言い分ける）') },

{ id: 'consult-nutri-graduate', title: '見直しと卒業', role: '母親', source: 'K-栄養-再診-見直しと卒業', voices: { heard: MOM_US, en: DOC },
  context: '12歳の女の子。検査と毎日の様子から、次の段階へ進むことにした。サプリを少しずつ減らす、通院の間隔を空ける、困りごとが戻ったときの対応を伝える。',
  goal: 'よい知らせを伝え、「戻ったら相談」を念押しできる',
  turns: [
    turn("She's like a different child these days. Up at seven, eating breakfast. Where do we go from here?", '最近は別人のようです。7時に起きて、朝ごはんも食べています。これからどうなりますか？', '検査と毎日の様子から、次の段階に進むことにした。',
      "That's wonderful to hear. From her tests and from how her days are going, we're moving on to the next stage.", 'From A and from B, …（根拠を2つ言ってから結論）'),
    turn("Does that mean she can stop the supplements?", 'サプリをやめられる、ということですか？', 'サプリは、診察で伝えた形で少しずつ減らす。',
      "We'll reduce them little by little, in the way I explained today.", 'little by little＝少しずつ。'),
    turn("And the visits?", '通院は？', '通院は、少し間隔を空けて様子を見る。',
      "We'll leave a little more time between visits, and see how she goes.", '短い質問には、短く答える。'),
    turn("What keeps her well once the supplements are gone?", 'サプリがなくなったあと、何が体を支えるんですか？', 'これからは、身につけた食べ方と生活のリズムが体の土台になる。',
      "From now on, the way of eating she has learned, and her daily rhythm, become the foundation of her body.", 'become the foundation＝土台になる。'),
    turn("And if the tiredness creeps back?", 'もし、疲れがじわじわ戻ってきたら？', '元の困りごとが戻るときは、自己判断で量を戻したりやめたりせず、診察で相談。',
      "If the old problems come back, like trouble getting up, tiredness, or tummy trouble, please talk to me at a visit, rather than changing the amount or stopping on your own.", 'creep back＝じわじわ戻る（保護者の言葉）。rather than …＝…するのではなく。')
  ],
  challenge: turn("So I shouldn't just put her back on the full dose myself?", 'じゃあ、自分で元の量に戻してはいけないんですね？', '短く言い直す。',
    "Please come and talk to me first. We'll decide the amount together.", 'first＝まず。We\'ll decide … together.') }
];
list.forEach(function (s) { s.track = 'consult'; s.group = '栄養外来'; });
root.HANASERU_CONSULT_SCENES = (root.HANASERU_CONSULT_SCENES || []).concat(list);
if (root.HANASERU_SCENES) Array.prototype.push.apply(root.HANASERU_SCENES, list);
}(typeof window !== 'undefined' ? window : globalThis));
