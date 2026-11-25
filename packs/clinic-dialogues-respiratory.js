/* 🩺 診察を英語で：かぜ・咳・喘息（2026-11-25 院長「かぜと喘息を足す」）。
   決まりは clinic-dialogues.js と同じ：医師の言葉の中身は院長承認の説明文（source のキットID）から取り、
   そこに無い量・薬の名前・見通しは足さない。保護者の言葉と症例の設定は創作。問診の質問は一般的な言い方。
   言葉：特急券＝express pass（予約なしで吸入に来られる券）／吸入＝inhaler, inhalation／予防の薬＝preventive medicine。 */
(function (root) {
'use strict';
var DOC = 'en-US-Neural2-D', MOM_US = 'en-US-Neural2-F', MOM_GB = 'en-GB-Neural2-A', MOM_AU = 'en-AU-Neural2-A', DAD_GB = 'en-GB-Neural2-B', DAD_AU = 'en-AU-Neural2-B';
function turn(heard, heardJa, intent, en, note) { return { heard: heard, heardJa: heardJa, intent: intent, en: en, note: note }; }
var FEVER = '熱・かぜ', COUGH = '咳・ゼーゼー';
var list = [
{ id: 'consult-cough-history', group: COUGH, title: '咳の診察：自分から聞く（問診）', role: '母親', source: 'K-一般-退室時-長引く咳と鼻水_喘息の手前（見る4点）＋一般的な問診の質問', voices: { heard: MOM_GB, en: DOC },
  context: '3歳の女の子。咳が続いて来院。院長が質問を重ねて、期間・時間帯・夜の眠り・ゼーゼー・吐くか・熱・食事と水分・これまでのゼーゼーを聞き取る。答えを一言で受けてから、次の質問へつなぐ練習。',
  goal: '答えを受ける一言＋ And / What about … / One more thing で、質問を止めずにつなげられる',
  turns: [
    turn("Hello. She's had this cough for a while now and it's just not going away.", 'こんにちは。しばらく咳が続いていて、なかなか治らないんです。', '受けて、いつから続いているかを聞く。',
      "I see. Let me ask you a few things. How long has she had the cough?", 'Let me ask you a few things.＝いくつか聞かせてください。How long has she had …?（現在完了）'),
    turn("About two weeks, I think. It started with a cold at nursery.", '2週間くらいだと思います。保育園でもらった風邪から始まりました。', 'くり返して受け、咳が出やすい時間帯を聞く。',
      "About two weeks, right. And when is it worse? At night, early in the morning, or during the day?", '相手の答えをくり返す（About two weeks, right.）。When is it worse?＝いつひどくなりますか。'),
    turn("Definitely at night. And first thing in the morning.", '断然、夜です。あとは朝いちばん。', '受けて、夜眠れているか、咳で起きるかを聞く。',
      "At night and in the morning. Is she sleeping all right? Or does the cough wake her up?", 'wake her up＝目を覚まさせる。Or … で選択肢を足す。'),
    turn("She wakes up two or three times most nights. So do we, to be honest.", 'ほとんど毎晩、2〜3回起きます。正直、私たちもです。', '大変さを受け、ゼーゼー・ヒューヒューの音を聞く。',
      "That must be tiring for all of you. When she breathes, do you ever hear a wheezing or whistling sound?", 'That must be tiring for all of you.＝皆さんお疲れでしょう。wheezing＝ゼーゼー、whistling＝ヒューヒュー。'),
    turn("Sometimes, when she's been running around. I wasn't sure if that counted.", 'ときどき、走り回ったあとに。それが当てはまるのか分かりませんでした。', '役に立つと受け、咳き込んで吐くことがあるかを聞く。',
      "That's helpful, thank you. What about vomiting? Does she ever cough so hard that she throws up?", 'What about …?＝…はどうですか（話題を移す）。so hard that …＝…するほど強く。'),
    turn("Once or twice, after dinner. And she's had a bit of a temperature, on and off.", '1〜2回、夕食のあとに。熱も、出たり引いたりで少しあります。', '受けて、食事と水分がとれているかを聞く。',
      "I see, on and off. And is she eating and drinking as usual?", 'on and off＝出たり引いたり（相手の言葉をそのまま受ける）。as usual＝いつもどおり。'),
    turn("She's drinking fine, but she's off her food.", '飲むのは大丈夫ですが、食欲がありません。', '最後の質問として、これまでにゼーゼーしたことがあるかを聞く。',
      "OK. One last question: has she ever wheezed like this before, with other colds?", 'One last question: で終わりを知らせる。has she ever … before?。be off her food＝食欲がない（保護者の言葉）。')
  ],
  challenge: turn("Sorry, what exactly is a 'wheezing' sound?", 'すみません、"wheezing" とは、具体的にどんな音ですか？', '音を、やさしい言葉で言い換える。',
    "It's a high, whistling sound when she breathes out. A bit like air going through a narrow straw.", 'when she breathes out＝息を吐くとき。A bit like … でたとえる。') },

{ id: 'consult-cold-repeat', group: FEVER, title: '保育園に入って、風邪ばかり', role: '父親', source: 'K-一般-退室時-繰り返す風邪', voices: { heard: DAD_AU, en: DOC },
  context: '1歳の男の子。保育園に入ってから毎週のように熱と鼻水。父親は「体が弱いのか」と心配。理由、見通し、その都度治す意味、受診の目安を伝える。',
  goal: '責める気持ちを先にほどき、理由と見通しを2〜3文でつなげて言える',
  turns: [
    turn("Since he started daycare in April, he's been sick pretty much every week. Is there something wrong with his immune system?", '4月に保育園に入ってから、ほぼ毎週具合が悪いんです。免疫に問題があるんでしょうか？', '子どもが弱いからでも、家庭のケアが足りないからでもないと伝える。',
      "At this stage, catching one cold after another is not because he's weak, and it's not because of anything you're doing at home.", 'one cold after another＝次々に風邪を。It\'s not because A, and it\'s not because B.'),
    turn("Then why does it never seem to clear up?", 'じゃあ、なぜ全然治りきらないんですか？', '集団生活でいろいろなウイルスを次々にもらう。長引いているのではなく、別の風邪が上書きされている。',
      "In a group, children pick up many different viruses, one after another. So just when one cold is getting better, the next one arrives. It's usually not one long cold. It's a new cold on top of the last one.", 'pick up＝もらう。on top of …＝…の上に重なって。'),
    turn("How long is this going to go on?", 'これは、いつまで続くんですか？', '多くの子は、通いはじめて1年ほどで、この波が目に見えて減る。',
      "For most children, these waves clearly become fewer about a year after they start.", 'clearly become fewer＝目に見えて減る。'),
    turn("So should we just wait it out, without coming in each time?", 'じゃあ、毎回来なくても、過ぎるのを待てばいいですか？', '症状が出たときは、その都度きちんと治す。鼻の炎症が続くと中耳炎などにつながることがある。',
      "When he has symptoms, it's better to treat them properly each time. If the inflammation in the nose goes on, it can lead to problems like an ear infection.", 'wait it out＝過ぎるのを待つ（保護者の言葉）。lead to＝…につながる。'),
    turn("OK. What are the signs that I shouldn't wait?", 'どんなサインがあったら、待たずに来るべきですか？', '熱が3〜4日以上／耳を痛がる・夜に何度も起きる／咳で眠れない・呼吸が苦しそう／食事や水分がとれない・ぐったり。',
      "Please bring him in if the fever lasts three or four days or more, or if his ear hurts and he keeps waking at night. Also if he can't sleep because of the cough, or his breathing looks hard. And if he can't eat or drink, or he's very drowsy.", '一覧は3文に分ける。Also if … / And if …。'),
    turn("That helps. I was starting to think we'd chosen the wrong daycare.", '助かります。保育園の選び方を間違えたのかと思い始めていました。', '受けて、次回に様子を聞かせてもらう。',
      "I understand. Many parents feel that way in the first year. At the next visit, tell me how he's been.", 'feel that way＝そう感じる。')
  ],
  challenge: turn("So it's a different cold each time, not the same one?", '毎回、同じ風邪ではなく、別の風邪なんですね？', '短く言い直す。',
    "Yes, in most cases. A new cold arrives before the last one has fully gone.", 'in most cases＝ほとんどの場合。before … has fully gone＝…が治りきる前に。') },

{ id: 'consult-test-negative', group: FEVER, title: '検査は陰性でした', role: '母親', source: 'K-一般-退室時-迅速検査が陰性のとき', voices: { heard: MOM_US, en: DOC },
  context: '6歳の男の子。昨夜から発熱。インフルエンザなどの迅速検査は陰性。結果の意味、早い時期は陰性に出ることがあること、次に受診する目安を伝える。',
  goal: '「いまは陰性。ただし…」を、言いすぎずに伝えられる',
  turns: [
    turn("So what did the tests say? Is it flu or COVID?", '検査はどうでしたか？ インフルエンザですか、コロナですか？', '検査はどれも陰性。ひとまず、何らかの風邪として様子を見る。',
      "The tests were all negative. So for now, we'll treat this as some kind of cold, a viral infection, and see how it goes.", 'for now＝ひとまず。see how it goes＝様子を見る。'),
    turn("Negative? But he's burning up. Are you sure it's not the flu?", '陰性？ でも、すごい熱です。本当にインフルエンザじゃないんですか？', '発症から間もない時期は、感染していても陰性に出ることがある。',
      "I can't be completely sure yet. Early in an illness, a test can come back negative even if he does have the infection.", 'I can\'t be completely sure yet.＝まだ言い切れません（正直に限界を言う）。'),
    turn("So what do we do in the meantime?", 'それまでの間、どうすればいいですか？', '渡した解熱剤などを指示どおりに使う。',
      "Please use the fever medicine and the other medicines I gave you, as directed.", 'in the meantime＝それまでの間（保護者の言葉）。as directed＝指示どおりに。'),
    turn("And if he's not getting better?", 'よくならなかったら？', '熱や症状が2〜3日続くときは改めて受診。その時点でまた方向性を判断する。',
      "If the fever or the symptoms are still there after two or three days, please come back. At that point, we'll decide the next step again.", 'At that point＝その時点で。'),
    turn("Is there anything that means I shouldn't wait two or three days?", '2〜3日待たないほうがいいのは、どんなときですか？', '日数にかかわらず受診：水分が取れない・おしっこが半日出ない／呼吸が苦しそう・ぐったり。',
      "Yes. Whatever the number of days, please bring him in if he can't drink, or hasn't peed for half a day. The same if his breathing looks hard, or he's very drowsy.", 'Whatever the number of days＝日数にかかわらず。'),
    turn("And school?", '学校は？', '熱が下がって体調がよくなれば登校できる。',
      "Once the fever has gone and he's feeling well, he can go back to school.", '短い質問には、短く答える。')
  ],
  challenge: turn("So should we do the test again tomorrow?", 'じゃあ、明日もう一度検査したほうがいいですか？', '2〜3日続くなら受診、その時点で判断、と言い直す。',
    "If the fever is still there in two or three days, please come back, and we'll decide then.", 'we\'ll decide then＝そのとき決めましょう。') },

{ id: 'consult-runny-nose', group: FEVER, title: '長引く鼻水：1週間を区切りに', role: '母親', source: 'K-一般-退室時-長引く鼻水_①区切りの1週間', voices: { heard: MOM_AU, en: DOC },
  context: '2歳の女の子。鼻水が3週間。風邪とアレルギーの気が重なった鼻水と考える。薬は1週間を区切りにし、目指すのは「眠れて、食べられる毎日」と伝える。',
  goal: '「完全に止める」ではなく「眠れて食べられる」を目標として言える',
  turns: [
    turn("Her nose has been running for three weeks now. Is it a cold, or is it an allergy?", '鼻水が3週間続いています。風邪ですか、アレルギーですか？', 'いまは、風邪とアレルギーの気が重なった鼻水。',
      "Right now, it's a mix of the two: a cold, with a touch of allergy on top.", 'a mix of the two＝2つが混ざったもの。a touch of＝少しの。'),
    turn("So how long does she need the medicine?", '薬はどのくらい必要ですか？', '薬は1週間ほどを区切りにする。',
      "We'll use the medicine for about a week, and then stop and look.", 'stop and look＝区切って確かめる。'),
    turn("And if her nose is still a bit runny after a week?", '1週間たっても、少し鼻水が残っていたら？', '眠れて、食べられて、ふだんどおり過ごせていれば、少し残っていても、そこでおしまいにしてよい。',
      "If she's sleeping, eating, and spending her days as usual, it's fine to finish there, even if her nose is still a little runny.", 'it\'s fine to finish there＝そこで終わりにして構いません。even if …。'),
    turn("Really? I thought we had to get rid of it completely.", '本当に？ 完全に止めないといけないと思っていました。', '目指すのは「眠れて、食べられる毎日」。',
      "What we're aiming for is not a perfectly dry nose. It's days when she can sleep and eat well.", 'What we\'re aiming for is not A. It\'s B.'),
    turn("OK. When should I bring her back?", '次はどんなときに連れてくればいいですか？', '鼻づまりで眠れない・苦しそう／口で息をしていることが多い／熱が出てきた／耳を痛がる。',
      "Please bring her in if she can't sleep because her nose is blocked, or if she's often breathing through her mouth. Also if she gets a fever, or if her ear hurts.", 'blocked＝詰まっている。breathe through her mouth＝口で息をする。')
  ],
  challenge: turn("So a slightly runny nose is OK?", '少しの鼻水なら、大丈夫なんですね？', '条件をつけて、短く言い直す。',
    "Yes, as long as she's sleeping and eating well.", 'as long as …＝…である限り。') },

{ id: 'consult-cough-long', group: COUGH, title: '長引く咳：喘息ですか？', role: '父親', source: 'K-一般-退室時-長引く咳とゼーゼー／K-一般-退室時-長引く咳と鼻水_喘息の手前', voices: { heard: DAD_GB, en: DOC },
  context: '4歳の男の子。風邪のたびに咳が長引く。父親は喘息を心配。気管支が敏感になっている状態、白黒で分かれないこと、治療の目標2つ、家でできること、受診の目安を伝える。',
  goal: '「白か黒かではない」を、やさしい言葉で説明できる',
  turns: [
    turn("Every time he gets a cold, the cough drags on for weeks. Is this asthma?", '風邪をひくたびに、咳が何週間も長引きます。喘息ですか？', 'いまは、気管支が少し敏感になっている状態。',
      "Right now, his airways are a little sensitive. That's the state he's in.", 'drag on＝長引く（保護者の言葉）。airways＝気管支・気道。'),
    turn("Why does it keep happening?", 'なぜ、何度も起きるんですか？', '幼児は風邪をくり返すのがふつう。炎症が引ききらないまま残り、わずかな刺激でも咳が出やすくなる。',
      "Young children catch colds again and again. That's normal. Each time, a little inflammation stays in the airways, so even a small trigger sets off a cough.", 'set off＝引き起こす。a small trigger＝わずかな刺激。'),
    turn("So is it asthma or not? I'd like a straight answer.", 'それで、喘息なんですか、違うんですか？ はっきり教えてください。', '子どもの咳と喘息は、白か黒かで分かれるものではない。多くはその手前で、その都度炎症を取っていけば落ち着く。',
      "I understand. But in children, cough and asthma are not black and white. Most children are at the stage just before asthma. If we clear the inflammation properly each time, it settles down.", 'not black and white＝白黒で分かれない。the stage just before …＝…の手前。'),
    turn("What are we aiming for, then?", 'じゃあ、何を目標にするんですか？', '治療の目標は2つ：夜しっかり眠れること、運動しても咳き込まないこと。',
      "Two things. He sleeps well at night, and he doesn't cough when he runs around.", 'Two things. ＋ 短い2文。'),
    turn("Is there anything we can do at home?", '家でできることはありますか？', '寝室の加湿、寝る前に鼻をかむ、こまめな水分。',
      "Yes. Keep the bedroom air moist, have him blow his nose before bed, and give him drinks often.", 'have him blow his nose＝鼻をかませる。'),
    turn("And when should we come back sooner?", '早めに来たほうがいいのは、どんなときですか？', '夜中に咳で何度も起きる／咳き込んで吐く／息が苦しそう・肩で息→早めに受診。横になって眠れない・顔色や唇の色が悪い・ぐったり→夜間でも救急。',
      "Please come in early if the cough wakes him many times at night, if he coughs until he vomits, or if he's breathing with his shoulders. And if he can't lie down to sleep, looks pale, or is very drowsy, go to the emergency room, even at night.", 'cough until he vomits＝吐くまで咳き込む。')
  ],
  challenge: turn("What do you mean, 'not black and white'?", '「白黒ではない」とは、どういう意味ですか？', 'たとえを、ふつうの言葉で言い直す。',
    "I mean there isn't a clear line between a long cough and asthma. Many children are somewhere in between.", 'a clear line between A and B。somewhere in between＝その間のどこか。') },

{ id: 'consult-wheeze-after', group: COUGH, title: '風邪のあとに残るゼーゼー', role: '母親', source: 'K-一般-退室時-風邪のあとに残るゼーゼー', voices: { heard: MOM_US, en: DOC },
  context: '1歳半の男の子。風邪は治ったのに、咳とゼーゼーが残る。炎症が残っている状態で、喘息とはまだ言わない。吸入と飲み薬、特急券、1週間後の確認を伝える。',
  goal: 'いまの状態→今回の治療→次の確認、の順で言える',
  turns: [
    turn("The cold's gone, but he's still coughing and wheezing. Why isn't it clearing up?", '風邪は治ったのに、まだ咳とゼーゼーが続いています。なぜ治らないんでしょう？', '風邪のあとに気道の炎症が残って、咳やゼーゼーが続いている状態。',
      "After the cold, some inflammation has stayed in his airways. That's why the cough and the wheezing are continuing.", 'That\'s why …＝だから…。'),
    turn("Does that mean it's asthma?", 'それは、喘息ということですか？', '喘息とはまだ言わない。一時的なもの。',
      "We don't call it asthma yet. This is temporary.", 'We don\'t call it … yet.＝まだ…とは言いません。'),
    turn("So how do we treat it?", 'どうやって治しますか？', '今回は、吸入と飲み薬で、炎症をまず1回しっかり取る。',
      "This time, we'll use inhalation and medicine by mouth, and clear the inflammation properly once.", 'medicine by mouth＝飲み薬。'),
    turn("Do we need an appointment every time for the inhalation?", '吸入のたびに、予約が要りますか？', '特急券を出す。伝えた期間、診療時間内なら予約なしで吸入に来られる。',
      "No. I'm giving you an express pass. During the period I told you, you can come for inhalation without an appointment, any time during clinic hours.", 'express pass＝特急券。without an appointment＝予約なしで。'),
    turn("And how long will the treatment go on?", '治療はどのくらい続きますか？', '1週間ほどで経過を確かめる。くり返さなければ、治療はそこでおしまい。',
      "We'll check how he's doing in about a week. If it doesn't come back, the treatment ends there.", 'ends there＝そこで終わりです。'),
    turn("What should I watch for until then?", 'それまで、何に気をつければいいですか？', '咳がひどくなる・ミルクや食事がとれない→早めに受診。眠れないほど苦しそう・顔色や唇の色が悪い・ぐったり→夜間でも救急。',
      "If the cough gets worse, or he can't take milk or food, please come in early. If he can't lie down to sleep, if his face or lips look pale, or if he's very drowsy, go to the emergency room, even at night.", '2つの段（早めに受診／救急）を、文を分けて言う。')
  ],
  challenge: turn("Sorry, how does the express pass work again?", 'すみません、特急券はどう使うんでしたっけ？', '使い方を短く言い直す。',
    "During the period I told you, just come in during clinic hours. You don't need to book.", 'You don\'t need to book.＝予約は要りません。') },

{ id: 'consult-asthma-prevent', group: COUGH, title: '発作が続いた：予防の飲み薬を始める', role: '父親', source: 'K-一般-退室時-喘息発作を繰り返す子の予防と対応', voices: { heard: DAD_AU, en: DOC },
  context: '3歳の女の子。短いあいだに強めの発作が続いた。喘息と決めるには早いが、予防の飲み薬を始める。続け方、発作時の薬、自宅吸入を考える条件を伝える。',
  goal: '「まだ決まっていない。でも始める理由がある」を、続けて言える',
  turns: [
    turn("That's the third bad attack in two months. Is it time to call this asthma?", '2か月で3回目のひどい発作です。もう喘息と言うべきですか？', '喘息と決めるにはまだ早い段階。ただ、次の発作を起こしにくくするため、予防の飲み薬を始める。',
      "It's still too early to decide that it's asthma. But she's had strong attacks close together. So to make the next one less likely, we're starting a preventive medicine by mouth.", 'too early to decide＝決めるには早い。close together＝短い間隔で。less likely＝起こりにくく。'),
    turn("What does the medicine actually do?", 'その薬は、実際に何をするんですか？', '炎症そのものをしずめる薬。咳がない日も、指示の期間は続ける。効き目は数週間かけて見る。',
      "It calms the inflammation itself. So please keep giving it for the period I told you, even on days with no cough. We'll watch how it works over several weeks.", 'calm＝しずめる。over several weeks＝数週間かけて。'),
    turn("And if she has another attack in the meantime?", 'その間に、また発作が起きたら？', '発作のときの薬も処方している。指示どおりに使い、楽にならなければ受診。',
      "I've also prescribed medicine for attacks. Use it as directed. If she doesn't get better with it, please bring her in.", 'as directed＝指示どおりに。'),
    turn("Should we get an inhaler machine for home?", '家用の吸入器を買ったほうがいいですか？', 'まずは飲み薬と、発作時のクリニックでの吸入から。自宅吸入は、飲み薬で発作がおさまらないとき、または飲み薬が苦手なときに考える。',
      "Not yet. We'll start with the medicine by mouth, and inhalation here at the clinic when she has an attack. We'll think about home inhalation if the medicine doesn't control the attacks, or if she can't take it well.", 'Not yet.＝まだです。control the attacks＝発作をおさえる。'),
    turn("When is it an emergency?", '救急に行くのは、どんなときですか？', '横になって眠れないほど苦しそう／肩で息／顔色や唇の色が悪い→夜間でも救急。',
      "If she can't lie down to sleep because of her breathing, if she's breathing with her shoulders, or if her face or lips look pale, go to the emergency room, even at night.", '条件を3つ、同じ形（if she …）で並べる。'),
    turn("OK. What do you want us to tell you next time?", '次回は、何をお伝えすればいいですか？', '次回、発作の回数と夜の様子を聞かせてもらう。',
      "Next time, tell me how many attacks she's had, and how her nights have been.", 'how many …, and how …。')
  ],
  challenge: turn("So I give it even on days when she's completely fine?", 'まったく元気な日にも、飲ませるんですね？', '短く、理由つきで言い直す。',
    "Yes, every day for that period. It works by calming the inflammation, not by stopping a cough on the day.", 'not by … on the day＝その日の咳を止める薬ではない。') },

{ id: 'consult-inhaler-step', group: COUGH, title: '吸入の減らし方：1週間ごとに1段', role: '母親', source: 'K-一般-退室時-吸入の減らし方_1週間ルール', voices: { heard: MOM_GB, en: DOC },
  context: '5歳の男の子。吸入を朝2・夜2で続けて落ち着いた。減らし方（1週間ごとに1段）、飲み薬は続けること、咳が戻ったときの対応を伝える。',
  goal: '段階（朝2夜2→朝1夜1→夜1→休み）を、順に数字で言える',
  turns: [
    turn("He's been so much better these past few weeks. Can we start cutting down the inhaler?", 'ここ数週間、ずっと調子がいいんです。吸入を減らし始めてもいいですか？', '減らせる。1週間ごとに1段ずつ。',
      "Yes, we can. We reduce the inhaler one step at a time, one step each week.", 'cut down＝減らす（保護者の言葉）。one step at a time＝1段ずつ。'),
    turn("What are the steps, exactly?", '具体的には、どんな段階ですか？', '朝2・夜2 → 朝1・夜1 → 夜1だけ → お休み。',
      "Two puffs in the morning and two at night. Then one in the morning and one at night. Then one at night only. And then a break.", 'puff＝1吸入。Then … / Then … / And then … で順に言う。'),
    turn("And the tablet he takes at night? Do we stop that too?", '夜に飲んでいる薬は？ それもやめますか？', '飲み薬は続ける。',
      "No, please keep the medicine by mouth going.", 'keep … going＝続ける。'),
    turn("What if the cough comes back halfway through?", '途中で咳が戻ってきたら？', '元の量に戻して早めに受診。戻すのは失敗ではない。',
      "Then go back to the previous amount, and come in early. Going back is not a failure.", 'go back to the previous amount＝元の量に戻す。'),
    turn("And if it's worse than just a cough?", 'ただの咳よりひどかったら？', '息が苦しそう・横になって眠れない→夜間でも救急。',
      "If his breathing looks hard, or he can't lie down to sleep, go to the emergency room, even at night.", '短く、迷わせない。'),
    turn("OK. When do you want to see him again?", '次は、いつ診せればいいですか？', '1か月ほどあとの診察で、様子を聞かせてもらう。',
      "In about a month. Tell me then how he's been.", '数字で短く答える。')
  ],
  challenge: turn("Sorry, could you go through the steps one more time?", 'すみません、段階をもう一度お願いします。', '数字だけで、短く言い直す。',
    "Of course. Two and two, then one and one, then one at night, then stop. One week for each step.", 'go through＝順に説明する（保護者の言葉）。数字だけで言い直す。') },

{ id: 'consult-prevent-stop', group: COUGH, title: '予防の薬は、いつまで？', role: '父親', source: 'K-一般-退室時-予防薬はいつまで飲むのか', voices: { heard: DAD_GB, en: DOC },
  context: '7歳の女の子。予防の薬で半年落ち着いている。やめどきの決め方、減らし方の2つの道、症状が戻っても失敗ではないこと、家で見る2点を伝える。',
  goal: '選べる道を2つ示し、家族が選んでよいと伝えられる',
  turns: [
    turn("She's been on the preventive medicine for six months and she's been fine. How much longer does she need it?", '予防の薬を半年続けていて、ずっと元気です。あとどのくらい必要ですか？', 'やめどきは、落ち着いた状態がどれくらい続いているかで決める。',
      "We decide when to stop by how long she has stayed well.", 'by how long …＝どのくらい…かで。'),
    turn("Is there a rough guide?", 'おおよその目安はありますか？', '長く管理している子は1〜3か月、発作をくり返してきた子は季節をまたいで1年ほど。',
      "Yes. For children who have been stable for a long time, one to three months. For children who have had repeated attacks, about a year, so that it covers every season.", 'a rough guide＝おおよその目安（保護者の言葉）。so that it covers every season＝季節をまたぐように。'),
    turn("And when the time comes, do we just stop?", 'そのときが来たら、すぱっとやめるんですか？', '安定していれば、ゆっくり減らすか、一度やめて様子を見るか。子どもの状態と家庭の安心感で選んでよい。',
      "If she's stable, there are two ways. We can reduce the amount slowly, or stop once and see how she goes. You can choose, based on how she is, and on what feels safe for your family.", 'there are two ways＝道は2つあります。based on …＝…をもとに。'),
    turn("What if the cough comes back after we cut down?", '減らしたあとに、咳が戻ってきたら？', '失敗ではない。また戻して、しばらくしてからもう一度試す。',
      "That's not a failure. We go back to the earlier amount, and try again after a while.", 'after a while＝しばらくしてから。'),
    turn("What should we be watching at home?", '家では、何を見ていればいいですか？', '夜しっかり眠れているか、日中の生活に支障がないか、の2点。',
      "Two points. Is she sleeping well at night? And is her daytime life going on without trouble?", 'Two points. のあと、質問の形で2つ言う。'),
    turn("And if it does get worse?", 'もし悪くなったら？', '咳やゼーゼーが戻ってきた・夜に眠れない日が続く→予約を待たずに受診。',
      "If the cough or the wheezing comes back, or if she has several nights when she can't sleep, please come in without waiting for your next appointment.", 'without waiting for …。')
  ],
  challenge: turn("So it's really up to us which way we go?", '本当に、どちらにするかは私たちが決めていいんですね？', '選んでよいことを、短く言い直す。',
    "Yes. Both ways are fine. We'll choose together, and you can tell me what feels right for you.", 'be up to us＝私たちしだい（保護者の言葉）。Both ways are fine.') },

{ id: 'consult-home-inhaler', group: COUGH, title: '家での吸入を始める', role: '母親', source: 'K-一般-退室時-自宅吸入を加えるとき', voices: { heard: MOM_AU, en: DOC },
  context: '4歳の男の子。予防の飲み薬だけでは発作をおさえきれない。今回から自宅吸入を加える。理由、器具の2つの選択肢、回数と量、やめるときは診察で、と伝える。',
  goal: '理由→道具の選び方→続け方を、順に言える',
  turns: [
    turn("So the tablets aren't enough? What happens now?", '飲み薬だけでは足りないんですね？ これからどうなりますか？', '予防の飲み薬だけでは発作をおさえきれていないため、今回から自宅での吸入を加える。',
      "The medicine by mouth alone isn't controlling the attacks. So from today, we're adding inhalation at home.", 'alone＝だけでは。from today＝今日から。'),
    turn("What's the inhalation for?", '吸入は、何のためですか？', '気道の炎症をしずめる吸入を、家でも行う。',
      "It calms the inflammation in his airways. We'll do it at home as well as here.", 'as well as here＝ここだけでなく（家でも）。'),
    turn("Do we need to buy special equipment?", '特別な器具を買う必要がありますか？', 'スペーサー（薬局で4,000円ほど）か、電動ネブライザー（通販で1万円ほど）のどちらかでよい。',
      "Yes, one of two. A spacer, which costs about four thousand yen at a pharmacy. Or an electric nebulizer, about ten thousand yen online. Either one is fine.", 'one of two＝2つのうち1つ。Either one is fine.＝どちらでも大丈夫です。'),
    turn("How often does he need it, and how much?", '回数と量は、どのくらいですか？', '回数と量は、別に送る指示書のとおりに。',
      "Please follow the instruction sheet I'll send you separately. It shows how many times and how much.", 'instruction sheet＝指示書。separately＝別に。'),
    turn("And once he's better, can I stop it myself?", 'よくなったら、自分でやめてもいいですか？', '症状が落ち着いても、やめるときは診察で相談。',
      "Even when he's better, please talk to me at a visit before you stop.", 'Even when …, please … before you stop.'),
    turn("What if it doesn't seem to be working?", '効いていないようだったら？', '吸入をしても咳やゼーゼーが続くときは、薬がなくなる前でも受診。救急の目安も。',
      "If the cough or the wheezing goes on even with the inhalation, please come in, even before the medicine runs out. And if he can't lie down to sleep, is breathing with his shoulders, or looks pale, go to the emergency room, even at night.", 'run out＝なくなる。even before …＝…の前でも。')
  ],
  challenge: turn("Sorry, which one was cheaper?", 'すみません、安いほうはどちらでしたっけ？', '2つを値段つきで、短く言い直す。',
    "The spacer. It's about four thousand yen. The nebulizer is about ten thousand.", '答え→数字、の順で短く。') },

{ id: 'consult-croup', group: COUGH, title: 'クループの咳：薬の飲み方', role: '父親', source: 'K-一般-退室時-クループの咳', voices: { heard: DAD_AU, en: DOC },
  context: '2歳の男の子。昨夜から犬が吠えるような咳。薬を2回分出す。1回目は帰ったらすぐ、2回目の条件、残りの使い方、様子を見てよい状態、救急の目安を伝える。',
  goal: '「いつ・何回・どんなとき」を、短い文で順に言える',
  turns: [
    turn("He woke up last night with this awful barking cough. It sounded like a seal.", '昨夜、ひどい吠えるような咳で目を覚ましました。アシカみたいな音でした。', '咳の音を受ける。薬を2回分出す。1回目は帰ったらすぐ飲ませる。',
      "A barking cough, yes. I'm giving you two doses of medicine. Give him the first dose as soon as you get home.", 'a barking cough＝犬が吠えるような咳。dose＝1回分。as soon as …＝…したらすぐ。'),
    turn("The bag says 'when the cough is bad'. Do I wait until then?", '袋には「咳こみが強い時」と書いてあります。それまで待つんですか？', '1回目は、咳の強さにかかわらず、帰ったらすぐ。',
      "No. Please give the first dose straight away when you get home, however strong the cough is.", 'however strong the cough is＝咳の強さにかかわらず。'),
    turn("And the second one?", '2回目は？', '夕方か寝る前に、まだクループの咳が出ていれば2回目。',
      "Give the second dose in the evening or before bed, if he still has the barking cough.", '条件（if …）を後ろに置く。'),
    turn("What if he throws up the first dose?", '1回目を吐いてしまったら？', '飲んで30分以内に吐いた、またはこぼして飲めなかったときは、残りの1回分を使える。',
      "If he vomits within thirty minutes of taking it, or spills it and doesn't take it properly, you can use the other dose.", 'within thirty minutes of …＝…から30分以内に。spill＝こぼす。'),
    turn("And if we don't need the second dose tonight, can I keep it for his next cold?", '今夜2回目が要らなかったら、次の風邪のために取っておいていいですか？', '翌日またクループの咳が出て、息が楽で元気なときには使える。2回分までにして、別の風邪のときには使わない。',
      "You can use it if the barking cough comes back the next day, and he's breathing easily and seems well. But only these two doses. Please don't use what's left for a different cold.", 'what\'s left＝残った分。'),
    turn("When do I need to take him to hospital?", '病院に連れていくのは、どんなときですか？', '吠える咳だけで息が楽なら家で様子を見てよい。眠れない／静かなときもヒューヒュー／肩で息・胸やのどの下がへこむ／顔色や唇の色が悪い・ぐったり→夜間でも救急。',
      "If it's only the barking cough and his breathing is easy, you can watch him at home. But go to the emergency room, even at night, if he can't lie down to sleep, or if you hear a whistling sound even when he's quiet. Also if he's breathing with his shoulders, if his chest pulls in, or if he looks pale or very drowsy.", '「家で見てよい状態」を先に言い、But で救急の条件へ。')
  ],
  challenge: turn("Sorry, when do I give the first dose again?", 'すみません、1回目はいつ飲ませるんでしたっけ？', '短く言い直す。',
    "As soon as you get home. Don't wait for the cough to get worse.", '答え→念押し、の2文。') }
];
list.forEach(function (s) { s.track = 'consult'; });
root.HANASERU_CONSULT_SCENES = (root.HANASERU_CONSULT_SCENES || []).concat(list);
if (root.HANASERU_SCENES) Array.prototype.push.apply(root.HANASERU_SCENES, list);
}(typeof window !== 'undefined' ? window : globalThis));
