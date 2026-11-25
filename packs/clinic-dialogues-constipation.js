/* 🩺 診察を英語で：便秘外来（2026-11-25 院長「便秘外来を厚く」）。
   決まりは clinic-dialogues.js と同じ：医師の言葉の中身は院長承認の説明文（source のキットID）から取り、
   そこに無い量・見通しは足さない。保護者の言葉と症例の設定は創作。
   薬の名前：ラキソベロン＝Laxoberon drops／酸化マグネシウム＝magnesium oxide／モビコール＝Movicol。 */
(function (root) {
'use strict';
var DOC = 'en-US-Neural2-D', MOM_US = 'en-US-Neural2-F', MOM_GB = 'en-GB-Neural2-A', MOM_AU = 'en-AU-Neural2-A', DAD_GB = 'en-GB-Neural2-B', DAD_AU = 'en-AU-Neural2-B';
function turn(heard, heardJa, intent, en, note) { return { heard: heard, heardJa: heardJa, intent: intent, en: en, note: note }; }
var EMERGENCY = "Please go to the emergency room, even at night or on a holiday, if he has strong tummy pain that doesn't go away, or if he keeps vomiting. The same if there's a lot of blood in his stool, or if he's very drowsy.";
var list = [
// 院長が「聞く側」に回る回（2026-11-25 院長「私自身が質問したり、会話をつないだり」）。
// 保護者の答えを受けて、一言で受け止め → 次の質問、とつないでいく。質問は一般的な問診の言い方。
{ id: 'consult-const-history', title: '便秘の初診：自分から聞く（問診）', role: '母親', source: 'K-便秘-予約時-共通（回数・硬さ・いまのお薬）＋一般的な問診の質問', voices: { heard: MOM_US, en: DOC },
  context: '5歳の男の子の初診。院長が質問を重ねて、回数・硬さ・痛みと出血・我慢・下着の汚れ・これまでの薬・いちばんの心配を聞き取る。相手の答えを一言で受けてから、次の質問へつなぐ練習。',
  goal: '答えを受ける一言（I see, … / That helps.）＋ And / One more thing で、質問を止めずにつなげられる',
  turns: [
    turn("Hi, Doctor. We're here because of his constipation. It's been going on for ages.", 'こんにちは、先生。便秘のことで来ました。ずいぶん長く続いています。', '来てくれたことを受け、「先にいくつか聞きます」と前置きして、回数を聞く。',
      "Thank you for coming in. I'd like to ask a few questions first. How often does he go, in a normal week?", 'I\'d like to ask a few questions first.＝質問に入る前置き。for ages＝ずいぶん長く（保護者の言葉）。'),
    turn("Um, maybe twice a week? Sometimes less. It depends.", 'ええと、週に2回くらい？ もっと少ないことも。まちまちです。', '答えをくり返して受け、硬さと形を聞く。',
      "I see, about twice a week. And when it comes out, what's it like? Small and hard like pebbles, or big and hard to pass?", '相手の答えを短くくり返す（I see, about twice a week.）→ And で次へ。pebbles＝小石。hard to pass＝出しにくい。'),
    turn("Big, mostly. And sometimes it blocks the toilet, to be honest.", 'たいてい大きいです。正直、トイレが詰まることもあります。', '役に立つ情報だと受け、痛みと出血を聞く。',
      "That's useful to know. Does it hurt when he goes? And have you ever seen blood on the paper?", 'That\'s useful to know.＝助かります。have you ever seen …?＝…を見たことはありますか。'),
    turn("He cries sometimes, yeah. And there was a bit of blood last month. Just a streak.", 'ときどき泣きますね。先月、少し血が付いていました。筋のように少しだけ。', '心配を受け、我慢するしぐさを、例を挙げて聞く。',
      "That must be worrying. Does he ever hold it in? For example, crossing his legs, or hiding in a corner?", 'hold it in＝我慢する。For example, … で例を2つ出すと、相手が答えやすい。a streak＝筋。'),
    turn("Now that you mention it, he does go stiff and stand on tiptoe behind the sofa.", '言われてみれば、ソファの後ろで体を硬くして、つま先立ちになります。', '受けて、もう一つ（下着の汚れ）を聞く。',
      "Thank you, that helps. One more thing: does his underwear ever get dirty between toilet visits?", 'One more thing: で質問を足す。Now that you mention it＝言われてみれば（保護者の言葉）。'),
    turn("Sometimes, a little. I thought he just wasn't wiping properly.", 'ときどき、少し。ちゃんと拭けていないだけだと思っていました。', '受けて、これまでの薬と、お薬手帳を聞く。',
      "I understand. And has he taken any medicine for this so far? Did you bring his medicine notebook?", 'so far＝これまでに。medicine notebook＝お薬手帳（海外には無いので、見せながら言う）。'),
    turn("Just something from the pharmacy for a few days. It didn't do much.", '薬局の薬を数日だけ。あまり効きませんでした。', '最後の質問として、いちばんの心配を聞く。',
      "OK. Last question: what worries you most at the moment?", 'Last question: で終わりを知らせる。最後は開いた質問で、相手に話してもらう。')
  ],
  challenge: turn("Sorry, what do you mean by 'hold it in'?", 'すみません、"hold it in" とはどういう意味ですか？', '言葉をやさしく言い換える。',
    "I mean he feels that he needs to go, but he tries not to. Some children squeeze their bottom, or stand very still.", 'I mean … で言い換え、具体的なしぐさを足す。') },

{ id: 'consult-const-medicine', title: '飲み薬の選び方と飲ませ方', role: '母親', source: 'K-便秘-退室時-飲み薬の選び方／K-便秘-退室時-3つの飲み薬の違い／K-便秘-再診-飲み薬を嫌がる／K-便秘-再診-飲み薬の続け方', voices: { heard: MOM_US, en: DOC },
  context: '5歳の女の子。今日から飲み薬を始める。3つの薬の違い、選び方、飲ませ方、合わないときのサインを伝える。',
  goal: '薬の名前を3つ並べ、選ぶ理由を一文で言える',
  turns: [
    turn("So she's going to need medicine every day? What kind are you thinking of?", '毎日薬が要るんですね？ どんな薬を考えていますか？', 'よく使う飲み薬は3つ。味・回数・効き方が違い、合う薬は子どもによって違う。',
      "There are three medicines we often use for constipation in children: Laxoberon drops, magnesium oxide powder, and Movicol. They differ in taste, in how often you take them, and in how they work. The best one is different for each child.", 'There are three … : A, B, and C.（数を先に言って並べる）differ in …＝…が違う。'),
    turn("How do you choose, then?", 'じゃあ、どうやって選ぶんですか？', '長く続けることが多いので、毎日無理なく飲めることを大切にして選ぶ。',
      "Children usually take these medicines for a long time. So I choose the one she can take every day without a struggle.", 'without a struggle＝無理なく（もめずに）。'),
    turn("Which one do we start with?", 'どれから始めますか？', '当院ではラキソベロンから始めることが多い。においが少なく、ごく少量で飲める。',
      "In our clinic, we often start with Laxoberon. It has very little smell, and she only needs a tiny amount.", 'we often start with …。a tiny amount＝ごく少しの量。'),
    turn("How do I give it to her?", 'どうやって飲ませますか？', '1日1回、飲み物に数滴。朝でも夜でも、飲み忘れの少ない時間で。はじめはスプーンに少し飲み物を入れてたらすと確実。',
      "Once a day, put a few drops in a drink. Morning or evening is fine. Choose a time when you're unlikely to forget. At first, put a little drink on a spoon and add the drops there. That way, you can be sure she takes it all.", 'That way, …＝そうすれば…。be unlikely to …＝…しにくい。'),
    turn("What if she hates it, or it gives her a tummy ache?", '嫌がったり、お腹が痛くなったりしたら？', '毎日の服薬がつらいなら別の薬に変えられる。しぶり腹も合っていないサイン。強く痛がる・吐くときは控えて受診。',
      "If taking it becomes a daily battle, we can change to another medicine. Tummy cramps are also a sign that it doesn't suit her, so please tell me at the next visit. If she has strong tummy pain or vomits, stop the medicine and bring her in.", 'a daily battle＝毎日の戦い。suit＝合う。'),
    turn("And how do we know if the dose is right?", '量が合っているかは、どうやって分かりますか？', '決めた量を1週間ほど続けると判断できる。調子がよいのは量が合っているサイン。途中でやめない。',
      "Keep the same dose for about a week. Then we can judge whether it's right. If she's doing well, that means the dose suits her, so please don't stop halfway.", 'dose＝量。halfway＝途中で。')
  ],
  challenge: turn("Can I just give her a few more drops if she doesn't go?", '出なかったら、数滴増やしてもいいですか？', '量は処方どおり。足りないようなら診察で一緒に調整する。',
    "Please keep to the amount I prescribed. If it doesn't seem enough, tell me, and we'll adjust it together at the visit.", 'keep to …＝…を守る。adjust＝調整する。') },

{ id: 'consult-const-magnesium', title: '薬を長く飲んで大丈夫ですか', role: '父親', source: 'K-便秘-退室時-カマの中毒が心配／K-便秘-再診-飲み薬の続け方', voices: { heard: DAD_GB, en: DOC },
  context: '6歳の男の子。酸化マグネシウムを半年続けている。父親はネットで読んだ「体にたまる」が心配。長く飲むことの安全性、効きが変わる理由、減らし方を伝える。',
  goal: '心配を受けてから、条件つきで安心を伝えられる（If his kidneys …）',
  turns: [
    turn("He's been on magnesium oxide for six months now. I read online that it can build up in the body. Is that really safe?", '酸化マグネシウムを半年飲んでいます。体にたまるとネットで読みました。本当に安全ですか？', 'よくある心配。腎臓のはたらきに問題がなければ、長く飲み続けても心配ない。',
      "That's a very common worry. If a child's kidneys work normally, it's safe to keep taking it for a long time.", 'be on …＝…を飲んでいる。build up＝たまる。条件（If …）を先に言う。'),
    turn("So there's no risk of poisoning? Doesn't he need blood tests?", '中毒の心配は無いんですか？ 採血は要りませんか？', '中毒の心配はなく、定期的な採血も要らない。',
      "No. There's no worry about poisoning, and he doesn't need regular blood tests.", '否定疑問には、中身で答える（No. ＋ 文）。'),
    turn("Lately it doesn't seem to work as well. Has his body got used to it?", '最近、前ほど効かない気がします。体が慣れてしまったんでしょうか？', '体が慣れて効かなくなる薬ではない。成長や生活の変化で量が合わなくなってきた。',
      "It's not a medicine that the body gets used to. When it seems to work less, it usually means the dose no longer fits, because he has grown or his daily life has changed.", 'get used to＝慣れる。no longer fits＝もう合わない。'),
    turn("So should I give him more?", 'じゃあ、増やしたほうがいいですか？', '量は診察で調整する。',
      "Let's adjust the dose together, here at the visit.", 'Let\'s … together で、家で変えずに診察で決める流れにする。'),
    turn("When can he come off it? He's doing really well at the moment.", 'いつやめられますか？ いまはとても調子がいいんです。', '調子がよいのは量が合っているサイン。途中でやめない。減らすのは、リズムや出し方が身についてから、診察でゆっくり。',
      "Doing well is a sign that the dose suits him, so please don't stop halfway. We reduce it slowly, at the visits, after his rhythm and his way of going have become a habit.", 'come off …＝…をやめる。become a habit＝身につく。'),
    turn("I see. So what's the most important thing right now?", 'なるほど。いま一番大事なことは何ですか？', 'いま大事なのは、毎日のリズムを続けること。次回、様子を聞かせてもらう。',
      "Keeping the daily rhythm. That's what matters most now. At the next visit, tell me how he's been doing.", '名詞句で答えてから、That\'s what matters most. で強める。')
  ],
  challenge: turn("Sorry, you said blood tests aren't needed?", 'すみません、採血は要らないとおっしゃいましたか？', '条件をつけて、短く言い直す。',
    "That's right. If his kidneys are healthy, regular blood tests aren't necessary.", 'That\'s right. で受けて、条件つきでくり返す。') },

{ id: 'consult-enema-start', title: '浣腸を始める日', role: '母親', source: 'K-便秘-退室時-浣腸導入_動画で見る', voices: { heard: MOM_AU, en: DOC },
  context: '3歳の男の子。今日から自宅で浣腸を始める。母親は自信がない。次回までの3つ、最初の目標、中止と救急の目安を伝える。',
  goal: 'ためらう気持ちを受けてから、やることを3つに絞って伝えられる',
  turns: [
    turn("An enema? At home? I'm honestly not sure I can do that to him.", '浣腸？ 家で？ 正直、自分にできる気がしません。', '最初はみんなそう感じる。今日から始め、やり方を見せる。家で見られる動画もある。',
      "I understand. Most parents feel that way at first. We're starting enemas today, and I'll show you how. There are also two short videos you can watch at home.", 'feel that way＝そう感じる。I\'ll show you how.＝やり方をお見せします。'),
    turn("What exactly do I have to do?", '具体的には、何をすればいいですか？', '次回までに3つ。1つ目＝決めたタイミングで定期的に。明るい雰囲気で、5分以内にさっと。',
      "Three things until the next visit. First, do the enema regularly, at the time we decided. Keep the mood bright, and finish quickly, within five minutes. That's the trick.", 'Keep the mood bright＝明るい雰囲気で。That\'s the trick.＝それがコツです。'),
    turn("And the other two?", '残りの2つは？', '2つ目＝便意のサインがあればトイレに座る（出なくてもよい）。3つ目＝無理のない範囲で排便日記。',
      "Second, when he shows signs that he needs to go, let him sit on the toilet. It's fine if nothing comes out. Third, keep a poo diary, as far as you can manage.", 'show signs＝サインを見せる。'),
    turn("He's going to scream. He hates anything near his bottom.", '泣き叫ぶと思います。おしりの近くは何でも嫌がるので。', '嫌がるのは当たり前の反応。最初の2〜3か月は、浣腸に慣れることが目標。',
      "Not liking it is a completely normal reaction. For the first two or three months, the goal is simply to get used to the enemas.", 'a completely normal reaction＝まったく当たり前の反応。'),
    turn("What if something goes wrong?", '何かあったら、どうすればいいですか？', '出血がある・強く痛がるときは、その回は中止して受診。',
      "If there's bleeding, or if he's in strong pain, stop that time and bring him in.", 'stop that time＝その回はやめる。'),
    turn("And when would it be an emergency?", '救急に行くのは、どんなときですか？', '激しい腹痛が続く／くり返し吐く／便に血が多く混じる／ぐったり→夜間・休日でも救急。',
      EMERGENCY, 'The same if …＝…のときも同じです。')
  ],
  challenge: turn("What if I do the enema and nothing comes out?", '浣腸をしても、何も出なかったら？', 'そういう日のためのページを送る。次回の診察で話す。',
    "That does happen sometimes. I'll send you a page about exactly that. And we can talk about it at the next visit.", 'That does happen sometimes.＝そういうことは実際あります。') },

{ id: 'consult-enema-resist', title: '浣腸を嫌がる・いつ使うか', role: '父親', source: 'K-便秘-再診-浣腸を嫌がる／K-便秘-再診-浣腸のタイミングを決める', voices: { heard: DAD_AU, en: DOC },
  context: '4歳の女の子。浣腸を見ると泣いて逃げる。父親は毎晩の攻防に疲れている。短く終える理由、姿勢、我慢の時間、使うタイミングの決め方を伝える。',
  goal: '疲れを受けてから、短い指示（姿勢・時間・タイミング）を言える',
  turns: [
    turn("Every evening it's a fight. She cries and runs away as soon as she sees the enema.", '毎晩、戦いです。浣腸を見たとたんに泣いて逃げます。', '大変さを受ける。嫌がっている時間も浣腸の時間。準備ができたらためらわず、短く終えるのがいちばんの優しさ。',
      "That sounds exhausting. The time she spends resisting is all part of the enema time. So once you're ready, don't hesitate. Finishing quickly is the kindest way.", 'as soon as …＝…したとたん。the kindest way＝いちばんの優しさ。'),
    turn("Is there a best position? We've been laying her on her back.", 'いい姿勢はありますか？ 仰向けに寝かせていました。', '落ち着ける姿勢なら何でもよい。おすすめは膝の上でうつ伏せ。',
      "Any position where she feels calm is fine. What I'd suggest is lying face down across your lap.", 'What I\'d suggest is …＝私のおすすめは…。face down＝うつ伏せ。'),
    turn("And how long does she have to hold it in?", 'どのくらい我慢させればいいですか？', '我慢は30秒から1分で十分。',
      "Thirty seconds to a minute is enough.", 'hold it in＝我慢する（保護者の言葉）。数字だけで短く答える。'),
    turn("When should we do it? Some days she goes by herself, some days she doesn't.", 'いつすればいいですか？ 自分で出る日もあれば、出ない日もあります。', '時刻を決めておく（例：お風呂の前までに出なければ浣腸）。自分でしっかり出せた日は不要。',
      "Decide on a time in advance. For example, \"If nothing has come by bath time, we do the enema.\" On days when she goes properly by herself, you don't need it.", 'in advance＝前もって。by bath time＝お風呂の時間までに。'),
    turn("What about days when only a little comes out?", '少ししか出ない日は？', '量が少ない日や、いきみが長く続く日は、待ちすぎずその日のうちに出し切る。',
      "On days when there's only a little, or when she strains for a long time, don't wait too long. Use the enema that same day, and let her empty out completely.", 'strain＝いきむ。empty out＝出し切る。'),
    turn("It feels like we're giving up when we use it.", '使うと、負けたような気がするんです。', '浣腸は最終手段ではなく、リズムを守るためのサポート。',
      "It's not a last resort. It's a support that protects her rhythm.", 'a last resort＝最終手段。短い2文で言い切る。')
  ],
  challenge: turn("Face down across my lap? Could you explain that again?", '膝の上でうつ伏せ？ もう一度説明してもらえますか？', '姿勢を、動きの順に言い直す。',
    "Of course. You sit down, and she lies on her tummy over your knees. That's the position I recommend.", '動きを順に：You sit down, and she lies …。') },

{ id: 'consult-toilet', title: 'トイレでできない：あせらなくて大丈夫', role: '母親', source: 'K-便秘-再診-トイレでできない', voices: { heard: MOM_GB, en: DOC },
  context: 'もうすぐ4歳の男の子。うんちのときだけおむつを欲しがる。母親は自分を責めている。大事なのは「痛がらずに出し切れているか」と伝える。',
  goal: '比べて焦る気持ちを受け、大事な物差しを一つに絞って伝えられる',
  turns: [
    turn("He's nearly four and he still won't poo on the toilet. He asks for a nappy every time. Am I doing something wrong?", 'もうすぐ4歳なのに、トイレでうんちをしません。毎回おむつを欲しがります。私のやり方が悪いんでしょうか？', '大事なのは、トイレでできるかより、痛がらずに出し切れているか。',
      "What matters is not whether he can go on the toilet. It's whether he can empty out without pain.", 'What matters is not A. It\'s B.（物差しを置き換える）nappy＝おむつ（英）。'),
    turn("But all his friends are out of nappies.", 'でも、お友だちはみんなおむつが外れています。', 'おむつの中でも5分くらいですっきり出せていれば、心配いらない。',
      "I know that's hard to watch. But if he can finish in about five minutes, comfortably, even in a nappy, there's nothing to worry about.", 'be out of nappies＝おむつが外れている。even in a nappy＝おむつの中でも。'),
    turn("So we shouldn't push him to sit on the toilet?", 'じゃあ、無理にトイレに座らせないほうがいい？', 'あせらず、溜めずに出せるリズムを続けながら、本人のタイミングを待つ。',
      "There's no need to rush. Keep the rhythm of going without holding it in, and wait for his own timing.", 'There\'s no need to …＝…する必要はありません。'),
    turn("How will I know when he's ready?", '準備ができたかは、どうやって分かりますか？', 'トイレでの排便についてのページを送る。',
      "I'll send you a page about toilet training. Please have a look at it at home.", '答えを足しすぎず、資料につなぐ。'),
    turn("And the medicine? Do we keep going with it?", '薬は？ このまま続けますか？', 'リズムはこのまま続ける。溜めないことが先。',
      "Yes. Please keep the rhythm going as it is. Not holding it in comes first.", 'as it is＝このまま。… comes first＝…が先です。')
  ],
  challenge: turn("My mother-in-law says he's just being stubborn.", '義母は「ただの頑固よ」と言うんです。', '同じ物差しで、短く言い直す。',
    "For him, going without pain comes first. The toilet can come later.", 'A comes first. B can come later.（順番で答える）') },

{ id: 'consult-soiling', title: '便が漏れる：しつけの問題ではない', role: '父親', source: 'K-便秘-再診-便が漏れる', voices: { heard: DAD_GB, en: DOC },
  context: '7歳の男の子。学校で下着を汚す。叱っても変わらない。漏れは体のサインであること、毎日先に出し切ること、最初の目標を伝える。',
  goal: '言いにくい相談を受け止め、「しつけではなく体のサイン」と言い切れる',
  turns: [
    turn("This is a bit embarrassing, but he keeps soiling his underwear at school. He's seven. We've told him off, but it doesn't help.", '少し恥ずかしいのですが、学校で下着を汚してばかりです。7歳です。叱っても変わりません。', '話してくれたことを受ける。しつけの問題ではなく体のサイン。溜まった便があふれている。',
      "Thank you for telling me. This is not a discipline problem. It's a sign from his body. Stool has built up inside, and it's overflowing.", 'tell … off＝叱る（保護者の言葉）。built up＝たまった。overflow＝あふれる。'),
    turn("Overflowing? But it's runny. I thought he had diarrhea.", 'あふれている？ でも、ゆるいんです。下痢だと思っていました。', 'ゆるい便が漏れるときに、自己判断で下痢止めは使わない。',
      "It can look like diarrhea, but it's the built-up stool overflowing. So please don't use anti-diarrhea medicine on your own.", 'runny＝ゆるい。on your own＝自己判断で。'),
    turn("So what do we do about it?", 'じゃあ、どうすればいいですか？', '便意任せにしない。毎日決まった時間に、先に出し切ることが鍵。',
      "Don't wait for him to feel the urge. Every day, at a fixed time, help him empty out first. That's the key.", 'the urge＝便意。at a fixed time＝決まった時間に。'),
    turn("He doesn't even tell us when it happens.", '漏れても、教えてもくれないんです。', '最初の目標は「漏れたら教えてもらえること」。',
      "Then that's our first goal: that he can tell you when it has leaked.", 'Then that\'s our first goal: …（相手の言葉を目標に変える）'),
    turn("Should we stop telling him off, then?", 'じゃあ、叱るのはやめたほうがいいですか？', 'しつけの問題ではないので、叱らない。',
      "Yes, please. It's not a discipline problem, so scolding won't help.", 'scold＝叱る。Yes, please. で短く受ける。')
  ],
  challenge: turn("So it's not because he's lazy?", '怠けているからではないんですね？', '同じ内容を、短く言い直す。',
    "No. It's not laziness, and it's not about discipline. His body is telling us that stool has built up.", 'It\'s not A, and it\'s not about B.') },

{ id: 'consult-const-sick', title: '熱やお腹の風邪のとき：薬と浣腸', role: '母親', source: 'K-便秘-再診-熱やお腹の風邪のとき', voices: { heard: MOM_US, en: DOC },
  context: '5歳の女の子。便秘の治療中に、お腹の風邪で下痢になった。下痢のあいだの薬、戻し方、熱のときの決め方、浣腸、受診の目安を伝える。',
  goal: '「いつ止めて、いつ・どのくらいで戻すか」を数字つきで言える',
  turns: [
    turn("She's caught a tummy bug and she's got diarrhea. Do I keep giving her the constipation medicine?", 'お腹の風邪で下痢をしています。便秘の薬は続けますか？', 'お腹の風邪で下痢のあいだは、飲み薬をいったん止めてよい。',
      "While she has diarrhea from a tummy bug, it's fine to stop the medicine for now.", 'While …＝…のあいだは。for now＝いったん。'),
    turn("When do I start it again?", 'いつ再開しますか？', '便が硬くなってきたら、いつもの3分の1から半分くらいで、早めに戻す。',
      "When her stools start to get firm again, restart early, with about a third to a half of the usual amount.", 'a third to a half＝3分の1から半分。firm＝硬い。'),
    turn("And what about when she has a fever? Last month I wasn't sure what to do.", '熱のときはどうですか？ 先月は迷いました。', '熱の高さではなく、活気と水分で決める。',
      "With a fever, don't decide by how high it is. Decide by how lively she is, and whether she's drinking.", 'decide by …＝…で決める。lively＝活気がある。'),
    turn("So if she's really miserable?", 'じゃあ、とてもつらそうなときは？', '初日につらそうなら1日休む。翌日、熱に慣れてきた様子があれば戻す。',
      "If she seems to be struggling on the first day, take one day off. The next day, if she seems to be coping with the fever, go back to it.", 'take one day off＝1日休む。cope with＝慣れて対処できている。'),
    turn("And the enema? Even if she's been sick or isn't eating much?", '浣腸は？ 吐いたり、あまり食べていなくても？', '水分が取れて表情がよければ、吐いていても食事が少なくても、できる範囲で行う。',
      "If she can drink and her face looks all right, do the enema as far as you can, even if she has vomited or isn't eating much.", 'be sick＝吐く（英）。as far as you can＝できる範囲で。'),
    turn("When should I bring her in?", 'どんなときに連れてくればいいですか？', '水分が取れない／ぐったり／おしっこが減っている→早めに受診。',
      "If she can't drink, if she's very drowsy, or if she's peeing less, please bring her in early.", '条件を3つ並べて、最後に行動。')
  ],
  challenge: turn("Sorry, how much do I restart with?", 'すみません、どのくらいの量で再開するんでしたっけ？', '量と時期を、短く言い直す。',
    "About a third to a half of her usual amount, once her stools begin to get firm.", '数字を先に、条件を後に。') },

{ id: 'consult-const-trip', title: '宿泊行事の前に', role: '母親', source: 'K-便秘-再診-宿泊行事の対策', voices: { heard: MOM_AU, en: DOC },
  context: '10歳の男の子。来月、2泊3日の宿泊学習。トイレが不安。治療は変えないこと、バックアップを1つ決めること、出なくても振り出しに戻らないことを伝える。',
  goal: 'For example, … を使って、選べる案をいくつか並べられる',
  turns: [
    turn("He's got a three-day school trip next month, and he's really anxious about the toilet. Should we change his treatment before he goes?", '来月、2泊3日の宿泊学習があって、トイレをとても不安がっています。行く前に治療を変えたほうがいいですか？', '行事のために治療は変えない。普段どおりのリズムを続ける。',
      "No, we won't change the treatment for the trip. Keep the usual rhythm.", '短く結論から。'),
    turn("But what if he can't go while he's away?", 'でも、向こうで出なかったら？', 'バックアップを1つ決めておけば十分（自分で浣腸／保健の先生に1回見守り／食事を控えめ／普段の薬をお守りに）。',
      "It's enough to decide on one backup plan. For example, he could do the enema himself, or the school nurse could watch over him just once. He could eat a little less, or carry his usual medicine as a lucky charm.", 'It\'s enough to …＝…すれば十分。as a lucky charm＝お守りとして。'),
    turn("Is there anything we can do before he leaves?", '出発前にできることはありますか？', '前日から当日の朝までに、いつもどおり出しておくだけで、負担はかなり軽くなる。',
      "Yes. If he empties out as usual between the day before and the morning he leaves, that alone makes things much easier.", 'that alone＝それだけで。'),
    turn("And if he doesn't go at all for three days?", '3日間まったく出なかったら？', '出ないまま帰ってきても、治療が振り出しに戻ることはない。帰った日から、いつものリズムに戻す。',
      "Even then, the treatment doesn't go back to the start. From the day he gets home, just return to the usual rhythm.", 'Even then, …＝その場合でも。go back to the start＝振り出しに戻る。'),
    turn("OK. When should we talk about the details?", '分かりました。細かいことは、いつ相談すればいいですか？', '日程が決まったら、診察で相談する。',
      "Once the dates are fixed, let's talk it through at a visit.", 'talk it through＝じっくり相談する。')
  ],
  challenge: turn("He's embarrassed about the school nurse knowing.", '保健の先生に知られるのを恥ずかしがっています。', '別の案を選べると伝える。1つあれば十分。',
    "That's understandable. Then we can choose a different backup, like carrying his usual medicine. One backup is enough.", 'Then we can choose …（相手の事情に合わせて案を替える）') },

{ id: 'consult-const-restart', title: '治療をもう一度始める日', role: '父親', source: 'K-便秘-再診-治療を再開する日', voices: { heard: DAD_AU, en: DOC },
  context: '8歳の男の子。春に治療を終えたが、また4〜5日に1回になった。再開はよくあること、続け方、間隔のあけ方、受診の目安を伝える。',
  goal: '「よくあること」と受けてから、これからの流れを順に言える',
  turns: [
    turn("We stopped the treatment in the spring because he was doing so well. But now he's only going every four or five days again. Did we stop too soon?", '調子がよかったので春に治療をやめました。でも、また4〜5日に1回になっています。やめるのが早すぎましたか？', '治療を終えたあとに間隔があくのはよくある。早めに戻すと整えやすい。',
      "It's common for the gap to get longer again after treatment ends. Starting again early makes it easier to get back on track.", 'It\'s common for … to …＝…はよくあります。get back on track＝元の調子に戻る。'),
    turn("So what do we do now?", 'じゃあ、これからどうしますか？', '今日から治療を再開する。しばらくは伝えた間隔で続けて、出しやすいリズムを取り戻す。',
      "We're starting the treatment again today. For a while, please continue at the interval I told you, and we'll bring back an easy rhythm.", 'For a while＝しばらくは。interval＝間隔。'),
    turn("For how long?", 'どのくらいの期間ですか？', '自分で出せる日が続いてきたら、少しずつ間隔をあける。',
      "When the days he can go by himself continue, we'll widen the interval, little by little.", 'widen＝あける。期間ではなく「何がそろったら」で答える。'),
    turn("Is there anything I should watch for?", '気をつけることはありますか？', '強く痛がる・吐くとき、浣腸をしても液しか出ないときは受診。',
      "If he has strong tummy pain or vomits, or if only liquid comes out after an enema, please bring him in.", 'only liquid comes out＝液しか出ない。'),
    turn("All right. What do you need from us next time?", '分かりました。次回は何をお伝えすればいいですか？', '次回の診察で、うんちのリズムを聞かせてもらう。',
      "At the next visit, tell me about his rhythm: how often he goes.", 'コロンのあとに具体例を一つ。')
  ],
  challenge: turn("So it's normal for this to come back?", 'ぶり返すのは、普通のことなんですね？', '同じ内容を短く言い直す。',
    "Yes, it often happens. That's why starting again early helps.", 'That\'s why …＝だから…。') },

{ id: 'consult-const-food', title: '食事と水分：まず1つだけ', role: '母親', source: 'K-便秘-退室時-食事と水分', voices: { heard: MOM_GB, en: DOC },
  context: '4歳の女の子。薬を始めた日。母親は「野菜や水分が足りないせい」と自分を責めている。治療の中心は薬で楽に出せる状態をつくること、食事は1つ選ぶことを伝える。',
  goal: '責める気持ちを受け、やることを「1つ」に絞って伝えられる',
  turns: [
    turn("I feel like it's my fault. Maybe I'm not giving her enough vegetables or water.", '私のせいだと感じています。野菜や水分が足りないのかもしれません。', '食事と水分は無理のない範囲でよい。薬を始めた子は、まず薬で「楽に出せる状態」をつくることが治療の中心。',
      "Food and water are fine within what you can manage. For a child who has started medicine, the centre of the treatment is to make going easy, with the medicine first.", 'within what you can manage＝無理のない範囲で。'),
    turn("So the medicine matters more than the diet?", 'じゃあ、食事より薬のほうが大事なんですか？', 'いまは薬が中心。決めた量を毎日続ける。',
      "For now, yes. Please give the amount we decided, every day.", 'For now, yes.（「いまは」と限定して答える）'),
    turn("Still, is there anything I can do with her meals?", 'それでも、食事でできることはありますか？', '渡した冊子に食生活と食物繊維の多い食品の表がある。できそうなことを1つ選ぶ。',
      "The booklet I gave you has a page on food, and a table of foods that are high in fibre. Choose just one thing that looks possible.", 'high in fibre＝食物繊維が多い。Choose just one thing …。'),
    turn("Just one?", '1つだけですか？', '1つで十分。次回、便の様子と、食事で続けられたことを1つ教えてもらう。',
      "Yes, one is enough. At the next visit, tell me how her stools have been, and one thing you managed to keep up with her food.", 'keep up＝続ける。'),
    turn("And you'll check the medicine then?", 'そのときに薬も見直すんですね？', '量が合っているかを確かめ、必要なら見直す。',
      "Yes. We'll check whether the dose fits, and change it if we need to.", 'whether the dose fits＝量が合っているか。'),
    turn("Is there anything that would be an emergency?", '救急に行くのは、どんなときですか？', '激しい腹痛が続く／くり返し吐く／便に血が多く混じる／ぐったり→夜間・休日でも救急。',
      "Please go to the emergency room, even at night or on a holiday, if she has strong tummy pain that doesn't go away, or if she keeps vomiting. The same if there's a lot of blood in her stool, or if she's very drowsy.", 'The same if …＝…のときも同じです。')
  ],
  challenge: turn("Sorry, what was I supposed to tell you next time?", 'すみません、次回は何をお伝えするんでしたっけ？', '2つに絞って言い直す。',
    "Two things: how her stools have been, and one thing you kept up with food.", 'Two things: A, and B.') }
];
list.forEach(function (s) { s.track = 'consult'; s.group = '便秘外来'; });
root.HANASERU_CONSULT_SCENES = (root.HANASERU_CONSULT_SCENES || []).concat(list);
if (root.HANASERU_SCENES) Array.prototype.push.apply(root.HANASERU_SCENES, list);
}(typeof window !== 'undefined' ? window : globalThis));
