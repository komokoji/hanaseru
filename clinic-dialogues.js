/* 🩺 診察を英語で：病気ごとに、診察1回分を通しで練習する会話。
   2026-11-25 院長「私の診察の対話がいっぱいあるので、そこから引っ張り出してきて、徹底的にまず診察が英語でできるように」
   ・医師の言葉の中身は、院長が承認した患者さん向けの説明文（Vault「既製品チャット」・source にキットID）から取る。
     そこに無い医学的な内容（量・薬の名前・見通し）を足さない。問診の質問と受けの一言は一般的な言い方。
   ・保護者の言葉は創作（実在の患者さんの会話ではない）。耳を鍛えるため、自然な速さで少し長めに話す。
   ・症例の設定（年齢・診察の所見）は練習用の前提で、一般的な治療の指示ではない。
   ・voices＝合成音声。heard＝保護者、en＝医師（男性）。音声は ops/build-card-audio.cjs で作る。 */
(function (root) {
'use strict';
var DOC = 'en-US-Neural2-D', MOM_US = 'en-US-Neural2-F', MOM_GB = 'en-GB-Neural2-A', MOM_AU = 'en-AU-Neural2-A', DAD_GB = 'en-GB-Neural2-B', DAD_AU = 'en-AU-Neural2-B';
function turn(heard, heardJa, intent, en, note) { return { heard: heard, heardJa: heardJa, intent: intent, en: en, note: note }; }
var list = [
{ id: 'consult-flu', group: '熱・かぜ', title: 'インフルエンザと診断した日', role: '母親', source: 'K-一般-退室時-インフルエンザ', voices: { heard: MOM_US, en: DOC },
  context: '小学生の男の子。昨夜から高熱。検査でインフルエンザA型。結果・薬・家での見守り・登校の目安・再受診の目安を、順に伝える。',
  goal: '結果→薬→見守り→登校→再受診を、短い文でつないで言える',
  turns: [
    turn("So, is it the flu? He's had a high fever since last night, and half his class is off sick.", 'インフルエンザですか？ 昨夜から高熱で、クラスの半分が休んでいます。', '検査の結果（A型）を伝える。',
      "Yes, the test came back positive for influenza A. So that explains the high fever.", 'come back positive＝陽性と出る。So that explains …＝それで…の説明がつく。'),
    turn("I thought so. Are you going to give him something for it?", 'やっぱり。何か薬は出ますか？', '治療薬を出す。今日から。飲めない日があっても、通常4〜5日で自分の力で治る。',
      "Yes, I'm prescribing an antiviral medicine. Please start it today. But even if he misses a dose, the flu usually gets better on its own in four or five days. So there's no need to worry about that.", 'miss a dose＝1回飲み損ねる。on its own＝自然に。But even if … で先回りして安心を足す。'),
    turn("OK. And what can I give him when the fever's really high? We've got some fever medicine left over at home.", '熱がとても高いときは何を使えますか？ 家に解熱剤の残りがあります。', '解熱剤はアセトアミノフェンだけ。家に残っている他の種類は使わない。',
      "For the fever, please use only acetaminophen. If you have other kinds of fever medicine at home, please don't use them this time.", 'only の位置に注意。left over＝残っている（保護者の言葉）。'),
    turn("Got it. Is there anything else I should watch out for at home?", '分かりました。家でほかに気をつけることは？', '熱が出てから2日間は一人にしない。急に走り出す・窓から出ようとすることが、薬の有無に関係なくある。鍵をかける。',
      "Yes, one important thing. For the first two days of the fever, please don't leave him alone. Some children suddenly run off, or try to go out of a window. This can happen whether or not they're taking the medicine. So please lock the windows and the front door, and keep him where you can see him.", 'one important thing で注意を集める。whether or not …＝…かどうかに関係なく。'),
    turn("Oh, I didn't know that. And when can he go back to school? I need to let his teacher know.", '知りませんでした。学校はいつから行けますか？ 先生に知らせないと。', '登校の目安：発症から5日を過ぎ、かつ熱が下がってから2日を過ぎるまで休む。長引いたら下がった日から数え直す。',
      "He needs to stay home until five days have passed since the fever started, and also two days after the fever has gone. If the fever lasts longer, we count again from the day it goes down.", 'until … have passed＝…が過ぎるまで。and also で2つ目の条件を足す。'),
    turn("All right. And when should I bring him back in?", '分かりました。次はいつ連れてくればいいですか？', '再受診の目安と、救急の目安。治っていれば受診は要らない。',
      "Please come back if the fever lasts three days or more, or if he starts coughing hard or wheezing. If he has trouble breathing, looks pale, or is too drowsy to respond, please go to the emergency room, even at night. Otherwise, if he's getting better, you don't need to come back.", 'Otherwise＝それ以外は。even at night＝夜でも。')
  ],
  challenge: turn("Sorry, could you say that again about not leaving him alone? I didn't quite catch it.", 'すみません、一人にしない話をもう一度お願いします。聞き取れませんでした。', '同じ内容を、もっと短く言い直す。',
    "Of course. For the first two days, please stay close to him. Children with the flu sometimes act strangely all of a sudden, like running outside. So it's safer to keep the doors and windows locked.", '聞き返されたら、同じ文をくり返さず、短く言い換える。') },

{ id: 'consult-strep', group: '熱・かぜ', title: '溶連菌：10日間飲みきる理由', role: '母親', source: 'K-一般-退室時-溶連菌', voices: { heard: MOM_GB, en: DOC },
  context: '5歳の女の子。昨日からのどが痛く、食べたがらない。検査で溶連菌。抗生物質を10日間飲みきる理由と、登園・家族・その後の注意を伝える。',
  goal: '「楽になっても飲みきる」理由を、because を使わずに自然につなげて言える',
  turns: [
    turn("Her throat's been really sore since yesterday and she doesn't want to eat anything. Is it just a cold?", '昨日からのどがとても痛くて、何も食べたがりません。ただの風邪ですか？', 'のどが赤いこと、検査が陽性だったことを伝える。',
      "Her throat is quite red, and the test came back positive for strep. So this is strep throat, not just a cold.", 'strep＝溶連菌（strep throat＝溶連菌の咽頭炎）。not just …＝ただの…ではない。'),
    turn("Strep? Is that serious? Does she need antibiotics?", '溶連菌？ 重い病気ですか？ 抗生物質は要りますか？', '子どもによくある感染症で、抗生物質がよく効く。10日分を出す。',
      "It's a common infection in children, and antibiotics work well for it. I'm prescribing an antibiotic for ten days.", 'work well for …＝…によく効く。'),
    turn("Ten days? She usually feels fine after a couple of days. Can we stop then?", '10日も？ いつも2日くらいで元気になります。そこでやめてもいいですか？', '2〜3日で楽になっても10日間飲みきる。残りの日数が、まれな心臓や腎臓の合併症を防ぐ。',
      "She'll probably feel better in two or three days, but please finish all ten days. The rest of the course helps prevent rare problems with the heart and the kidneys.", 'finish all ten days＝10日分を飲みきる。the rest of the course＝残りの分。'),
    turn("I see. When can she go back to daycare?", 'なるほど。保育園はいつから行けますか？', '薬を始めて24時間たち、元気なら登園できる。',
      "She can go back once she's had the medicine for twenty-four hours and she's feeling well.", 'once …＝…したら。'),
    turn("Her little brother's fine so far. Should I be worried about him?", '弟は今のところ元気です。心配したほうがいいですか？', '家族にうつりやすい。のどの痛みや熱が出たら受診して検査する。',
      "It does spread easily in the family. If he gets a sore throat or a fever, please bring him in and we'll test him too.", 'It does spread …＝do で「確かに」と強める。'),
    turn("OK. Is there anything I should look out for after this?", '分かりました。このあと気をつけることはありますか？', '2〜3日たっても熱やのどの痛みが引かないときは受診。数週間のうちに赤茶色の尿、まぶた・手足のむくみが出たら受診。',
      "Yes. If the fever or the sore throat doesn't improve after two or three days of the medicine, please come back. Also, in the next few weeks, if her urine looks reddish-brown, or her eyelids or legs look puffy, please bring her in.", 'Also, で2つ目を足す。puffy＝むくんだ。')
  ],
  challenge: turn("So, just to check, she can stop the medicine once the fever's gone?", '確認ですが、熱が下がったら薬をやめていいんですね？', '誤解をやさしく直す。熱が下がっても10日間続ける。',
    "No, please keep going for the full ten days, even if she feels fine. That's the important part.", '相手の誤解は No, please … で短く、はっきり直す。') },

{ id: 'consult-cold', group: '熱・かぜ', title: 'かぜ：抗生物質が要らない理由', role: '父親', source: 'K-一般-退室時-ウイルス感染症', voices: { heard: DAD_GB, en: DOC },
  context: '2歳の男の子。熱と鼻水が2日。父親は念のため抗生物質を希望。かぜと考える理由、治療、3日目の受診、救急の目安を伝える。',
  goal: '希望を受け止めてから、理由と次の一手を伝えられる',
  turns: [
    turn("He's had a fever and a runny nose for two days now. I was hoping to get some antibiotics, just to be safe.", '熱と鼻水が2日続いています。念のため抗生物質をもらえればと思って。', '希望を受け止める。診察の結果、かぜと考える。ウイルスが多く、抗生物質は効かない。',
      "I understand. I've checked his throat, ears and chest, and this looks like a common cold. Most colds are caused by viruses, so antibiotics don't work for them.", 'I understand. で受けてから説明に入る。this looks like …＝…と考えます（言い切らない）。'),
    turn("Oh. So there's nothing we can do?", 'そうですか。じゃあ、できることは無いんですか？', '症状をやわらげる薬が治療の基本。',
      "There is. We treat the symptoms, so he can rest and drink more easily. I'll prescribe something for that.", 'There is.＝ありますよ（短く言い切ってから続ける）。'),
    turn("How long is the fever going to last? It keeps going up and down.", '熱はどのくらい続きますか？ 上がったり下がったりしています。', '熱は上がり下がりしながら少しずつよくなる。続くときは、元気そうでも3日目に受診。',
      "That's how it usually goes. The fever goes up and down, and little by little he gets better. But if the fever is still there on the third day, please bring him back, even if he seems well.", 'That\'s how it usually goes.＝よくある経過です。little by little＝少しずつ。'),
    turn("And when can he go back to daycare?", '保育園はいつから行けますか？', '熱が下がって体調がよくなれば登園できる。',
      "Once the fever has gone and he's feeling well again, he can go back.", 'Once A and B, …。'),
    turn("What should make me worried? When do I need to rush him in?", 'どうなったら心配すべきですか？ 急いで連れてくるのはどんなとき？', '救急の目安：呼吸が苦しそう／顔色・唇の色が悪い／ぐったりして反応が鈍い／水分がとれず半日おしっこが出ない／けいれん。',
      "Please go to the emergency room, even at night, if he has trouble breathing, or if his face or lips look pale. Also if he's very drowsy and hard to wake, or if he can't drink and hasn't peed for half a day. And of course if he has a seizure.", '長い一覧は、2〜3文に分けて言う。Also if … / And of course if …。'),
    turn("That's a lot to remember.", '覚えることが多いですね。', '家での過ごし方のページを送る。いつでも見返せる。',
      "It is, so I'll send you a page about caring for a fever at home. You can check it any time.", 'It is, so …＝そうですね、なので…（共感してから提案）。')
  ],
  challenge: turn("My mother says he needs antibiotics or it'll turn into something worse. What should I tell her?", '母が「抗生物質を飲まないと悪くなる」と言うんです。何と伝えればいいですか？', '同じ説明を、家族に伝えやすい短い形で言い直す。',
    "That's a common worry. You can tell her that antibiotics don't work on viruses, and that we'll check him again if the fever lasts three days.", 'You can tell her that …, and that …＝伝える内容を2つ並べる。') },

{ id: 'consult-wheeze', group: '咳・ゼーゼー', title: '初めてのゼーゼー：喘息ですか？', role: '母親', source: 'K-一般-退室時-初めてのゼーゼー', voices: { heard: MOM_AU, en: DOC },
  context: '2歳の男の子。かぜのあと、昨夜から初めてゼーゼー。「喘息発作」と伝えたが、病名が決まったわけではないこと、薬の続け方、今夜の目安を伝える。',
  goal: '「発作の形」と「病気の名前」の違いを、短い2文で説明できる',
  turns: [
    turn("He started wheezing last night and it really scared me. Does this mean he's got asthma?", '昨夜からゼーゼーし始めて、とても怖かったです。喘息ということですか？', '怖かった気持ちを受ける。かぜで気管支が敏感になり、空気の通り道が狭くなった。',
      "I can see why that was scary. His airways became sensitive because of the cold, and they got narrow. That's what caused the wheezing.", 'I can see why …＝…なのも無理はありません。That\'s what caused …＝それが原因です。'),
    turn("But you said 'asthma attack' just now.", 'でも、さっき「喘息発作」と言いましたよね。', '喘息と同じ形の発作。今日の1回で「気管支喘息」という病気が決まったわけではない。',
      "Yes, because it's the same kind of attack as in asthma. But one episode today doesn't mean he has asthma as a disease.", 'the same kind of … as …。doesn\'t mean …＝…という意味ではない。'),
    turn("So it might not happen again?", 'じゃあ、もう起きないかもしれない？', '秋はかぜのウイルスとダニが重なり、ゼーゼーする子が増える。その季節だけで落ち着く子も多い。',
      "It might not. In autumn, cold viruses and dust mites come together, and more children wheeze. For many of them, it settles down after the season.", 'It might not.＝起きないかもしれません（相手の言葉をそのまま受ける）。settle down＝落ち着く。'),
    turn("OK. How long does he need to take the medicine? Can I stop when the wheezing's gone?", '薬はいつまで飲ませますか？ ゼーゼーが消えたらやめていいですか？', 'ゼーゼーが落ち着いても、伝えた日までは続ける。',
      "Please keep giving it until the day I told you, even if the wheezing settles down.", 'keep giving it＝続けて飲ませる。even if …＝たとえ…でも。'),
    turn("What should I watch for tonight?", '今夜は何を見ていればいいですか？', '横になって眠れていれば安心の目安。縦抱きでないと落ち着かない／肩で息／胸やのどの下がへこむ／唇の色が悪い→夜でも救急。',
      "If he can lie down and sleep, that's a reassuring sign. But please go to the emergency room, even at night, if he can only settle when you hold him upright, or if he's breathing with his shoulders. Also if the skin under his throat or between his ribs pulls in, or if his lips look pale.", 'a reassuring sign＝安心できる目安。hold him upright＝縦に抱く。pull in＝へこむ。'),
    turn("And if it's not that bad, but he's just not getting better?", 'そこまでひどくはないけれど、よくならないときは？', 'ゼーゼーが強くなる／薬で楽にならない／熱が出てきた→予約を待たずに受診。それ以外は、伝えた日にもう一度診察。',
      "If the wheezing gets stronger, if the medicine doesn't help, or if he gets a fever, please come in without waiting for your next appointment. Otherwise, I'd like to see him again on the day we booked.", 'without waiting for …＝…を待たずに。I\'d like to see him again＝もう一度診せてください。')
  ],
  challenge: turn("Sorry, what do you mean by 'pulls in'?", 'すみません、"pulls in" とはどういう意味ですか？', '言葉をやさしく言い換える。',
    "I mean the skin goes in between the ribs, or just under the throat, each time he breathes in. It shows he's working hard to breathe.", 'I mean … で言い換える。each time …＝…するたびに。') },

{ id: 'consult-gastro', group: 'お腹', title: '吐いて下痢：水分のとらせ方', role: '父親', source: 'K-一般-退室時-胃腸炎ホームケア', voices: { heard: DAD_AU, en: DOC },
  context: '3歳の女の子。今朝から吐いて、下痢も始まった。胃腸炎と考え、少しずつ・回数を分けた水分補給と、救急の目安を伝える。',
  goal: '大変さを受け止め、「少しずつ、何回も」を具体的に伝えられる',
  turns: [
    turn("She's been throwing up since this morning, and now she's got diarrhea as well. She can't keep anything down.", '今朝から吐いていて、下痢も始まりました。何を飲んでも戻してしまいます。', '大変さを受け止め、最後のおしっこと、水分がとれるかを聞く。',
      "That sounds hard for both of you. When did she last pee? And is she able to drink at all?", 'keep … down＝吐かずにいる（保護者の言葉）。at all＝少しでも。'),
    turn("She peed about three hours ago. She drinks, but then it all comes back up.", '3時間くらい前におしっこが出ました。飲むけれど、全部戻します。', '診察の結果、胃腸炎と考える。いま一番大事なのは水分。',
      "I see. I've examined her tummy, and this looks like a stomach bug. The most important thing now is fluids.", 'stomach bug＝胃腸炎（口語）。fluids＝水分。'),
    turn("But she throws up every time she drinks.", 'でも、飲むたびに吐くんです。', '一度にたくさん飲むと吐きやすい。少しずつ、回数を分けて。',
      "That often happens when children drink a lot at once. So give her a small amount at a time, and do it many times. Little and often is the key.", 'at once＝一度に。little and often＝少しずつ何回も。is the key＝がこつです。'),
    turn("What about food? She hasn't eaten since yesterday.", '食事はどうですか？ 昨日から食べていません。', 'まず水分。食事の進め方は、送るページにまとめてある。',
      "Fluids come first. The page I'll send you explains how to start food again, step by step.", 'come first＝が先です。step by step＝段階を追って。'),
    turn("And when do I need to worry?", 'どうなったら心配すべきですか？', '救急の目安：水分がとれず半日おしっこが出ない／ぐったりして反応が鈍い／顔色・唇の色が悪い／けいれん。',
      "Please go to the emergency room, even at night, if she can't drink and hasn't peed for half a day. Also if she's very drowsy and hard to wake, if her face or lips look pale, or if she has a seizure.", 'hasn\'t peed for half a day＝半日おしっこが出ていない。'),
    turn("OK. Thank you. I was really panicking this morning.", '分かりました。ありがとうございます。今朝は本当に慌てていました。', '気持ちを受け、要点をもう一度短く言う。',
      "That's completely understandable. Small sips, many times. And please come back if you're worried.", 'That\'s completely understandable.＝無理もありません。最後に要点を一言でくり返す。')
  ],
  challenge: turn("Could you write that down for me? I'm afraid I'll forget.", '書いてもらえますか？ 忘れそうで。', '資料を送ると伝える。',
    "Of course. I'll send it to your phone, so you can read it again at home.", 'Of course. で受けて、so you can … で相手の得を足す。') },

{ id: 'consult-seizure', group: '熱・かぜ', title: '熱性けいれんのあと', role: '母親', source: 'K-一般-退室時-熱性けいれん_起きたあと', voices: { heard: MOM_US, en: DOC },
  context: '1歳半の女の子。熱が出た日にけいれん。いまは目を覚まして反応がよい。熱性けいれんと判断し、見通しと、次に起きたときの対応を伝える。',
  goal: '強い不安を受け止めてから、数字と行動を落ち着いて伝えられる',
  turns: [
    turn("She suddenly went stiff and started shaking, and her eyes rolled back. I honestly thought she was going to die.", '急に体が硬くなって震え出し、白目をむきました。本当に死んでしまうと思いました。', '怖さを受け止める。いまは反応がよいと伝え、何分続いたかを聞く。',
      "That must have been terrifying. She's awake and responding well now. How long did the shaking last?", 'That must have been …＝さぞ…だったでしょう。'),
    turn("Maybe two minutes? It felt like forever.", '2分くらいでしょうか。永遠のように感じました。', '話と診察から、熱性けいれんと判断したと伝える。',
      "Thank you. From what you've told me, and from examining her, this was a febrile seizure. It's a seizure that comes with a fever.", 'From what you\'ve told me＝伺ったお話から。専門用語のあとに、1文でやさしく言い直す。'),
    turn("Is her brain going to be OK?", '脳は大丈夫でしょうか？', '10〜20人に1人に起こる。ほとんどは数分で自然に治まり、脳に後遺症を残すことはまずない。',
      "It happens to about one in ten to twenty children. Most seizures stop on their own within a few minutes, and they almost never leave any damage to the brain.", 'one in ten to twenty＝10〜20人に1人。almost never＝まず…ない（「絶対」と言わない）。'),
    turn("Will it happen again? Does she need medicine to stop it?", 'また起きますか？ 防ぐ薬は要りますか？', '約7割は生涯1回だけ。1回目なら、予防の薬は通常要らない。',
      "For about seven in ten children, it happens only once in their life. After a first seizure, we don't usually need preventive medicine.", 'we don\'t usually …＝通常は…しません。'),
    turn("What do I do if it does happen again?", 'もしまた起きたら、どうすればいいですか？', '口に物を入れない。ゆすらない・おさえつけない。体を横向きにして、何分続くか確認。できれば動画。',
      "Don't put anything in her mouth, and don't shake her or hold her down. Turn her on her side, and check how many minutes it lasts. If you can, take a video.", 'hold … down＝おさえつける。on her side＝横向きに。'),
    turn("And then? Do I call an ambulance?", 'そのあとは？ 救急車を呼びますか？', '数分で治まったら早めに受診（夜間・休日は救急へ）。5分たっても治まらない／治まっても反応が戻らない→救急車。',
      "If it stops within a few minutes, please bring her in as soon as you can. At night or on a holiday, go to the emergency room. If it goes on for more than five minutes, or if she doesn't respond after it stops, please call an ambulance.", 'go on for …＝…続く。条件ごとに1文ずつ言う。')
  ],
  challenge: turn("So I shouldn't put a spoon in her mouth? My mother told me to.", 'スプーンを口に入れてはいけないんですね？ 母にそうするよう言われました。', '短く、はっきり言い直す。',
    "Please don't. Nothing in the mouth. Just turn her on her side and watch the time.", 'Please don\'t.＝それはしないでください（短く止める）。') },

{ id: 'consult-constipation-first', group: 'お腹', title: '便秘の初診：次回までの3つ', role: '母親', source: 'K-便秘-退室時-初診内服コース', voices: { heard: MOM_GB, en: DOC },
  context: '4歳の男の子。週に1回ほどしか出ず、出すときに痛がって泣く。飲み薬で始める。目標と、次回までにやってほしい3つを伝える。',
  goal: 'First / Second / Third で、3つの宿題を順に伝えられる',
  turns: [
    turn("He only goes about once a week, and when he does, he cries because it hurts. We've tried more water and more vegetables, but nothing's changed.", '週に1回くらいしか出なくて、出すときは痛くて泣きます。水分や野菜を増やしましたが、変わりません。', '大変さを受け止め、最初の目標「痛くない・スムーズに出る」を伝える。',
      "Thank you for telling me. That sounds hard for him, and for you. Our first goal is simple: no pain, and stools that come out smoothly.", 'he goes＝うんちが出る（保護者の言い方）。Our first goal is simple: で目標を一言に。'),
    turn("So what do we actually do?", '具体的には、何をするんですか？', '次回までに3つ。1つ目＝飲み薬を毎日。少し緩いくらいでよい。',
      "There are three things I'd like you to do until the next visit. First, give him the medicine every day. It's fine if his stools are a little loose.", 'There are three things I\'d like you to do＝お願いしたいことが3つあります（数を先に言う）。'),
    turn("Every day? Even on days when he's already been?", '毎日ですか？ もう出た日も？', '毎日続ける。「痛くない」流れを体に作るため。',
      "Yes, every day. We want his body to learn that going to the toilet doesn't hurt.", 'he\'s already been＝もう出た。We want his body to learn that …。'),
    turn("OK. What's the second thing?", '分かりました。2つ目は？', 'お腹がゴロゴロするなどのサインがあれば、出ても出なくてもトイレに座る。「出た？」「出そうとした？」の声かけが習慣を育てる。',
      "Second, when his tummy is rumbling, or he looks like he needs to go, let him sit on the toilet, whether anything comes out or not. Asking \"Did you go?\" or \"Did you try?\" helps build the habit.", 'rumble＝ゴロゴロ鳴る。whether … or not＝…でもそうでなくても。'),
    turn("And the third?", '3つ目は？', '無理のない範囲で排便日記をつける。',
      "Third, keep a simple poo diary, as far as you can manage. It doesn't have to be perfect.", 'as far as you can manage＝できる範囲で。'),
    turn("Is there anything that means I should bring him in sooner?", '早めに連れてきたほうがいいのは、どんなときですか？', '激しい腹痛が続く／くり返し吐く／便に血が多く混じる／ぐったり→夜間・休日でも救急。分からないことは次回の診察で。',
      "Yes. If he has strong tummy pain that doesn't go away, or if he keeps vomiting, please go to the emergency room, even at night or on a holiday. The same if there's a lot of blood in his stool, or if he's very drowsy. Anything else, we can talk about at the next visit.", 'The same if …＝…のときも同じです。')
  ],
  challenge: turn("Sorry, what was the second one again?", 'すみません、2つ目は何でしたっけ？', '2つ目を、もっと短く言い直す。',
    "When he feels like going, let him sit on the toilet. It's fine even if nothing comes out.", '聞き返されたら、条件を1つに絞って短く。') },

{ id: 'consult-enema', group: 'お腹', title: '便秘の再診：浣腸は癖になりますか', role: '父親', source: 'K-便秘-再診-浣腸は癖にならない／K-便秘-再診-なぜ長丁場なのか', voices: { heard: DAD_GB, en: DOC },
  context: '6歳の男の子。浣腸を2か月続けている。父親は「癖になるのでは」「なぜ長いのか」と不安。浣腸の目的、時間がかかる理由、ペースのゆるめ方を伝える。',
  goal: 'よくある不安に、たとえ（補助輪）を使って答えられる',
  turns: [
    turn("We've been doing the enemas for two months now. Honestly, I'm worried he's getting dependent on them.", '浣腸を2か月続けています。正直、癖になっていないか心配です。', '不安を受け止め、浣腸は癖にならないと伝える。',
      "I understand that worry. Many parents ask me the same thing. Enemas are not habit-forming.", 'get dependent on＝頼りきりになる。habit-forming＝癖になる。'),
    turn("But he can't go without them any more.", 'でも、もう浣腸なしでは出せないんです。', '浣腸のせいで出せなくなるのではない。もともと出せない状態だから必要。',
      "It's not that the enemas stopped him from going. He couldn't go in the first place, and that's why he needs them.", 'It\'s not that …＝…というわけではありません。in the first place＝もともと。'),
    turn("So what are they actually for?", 'じゃあ、何のためなんですか？', '目的は2つ。太くなった直腸を元に戻すこと、排便のリズムを体に覚えさせること。',
      "Two things. One is to let his stretched rectum go back to its normal size. The other is to teach his body the rhythm of going regularly.", 'Two things. One is …. The other is ….（数を先に言って2つ並べる）'),
    turn("Why is it taking so long, though?", 'それにしても、なぜこんなに長くかかるんですか？', '腸は「出ない記憶」を「出る記憶」に書き換えている。時間がかかる。薬や浣腸は補助輪。',
      "His bowel is rewriting its memory, from \"I can't go\" to \"I can go\". Changing the body's memory takes time. The medicine and the enemas are like training wheels on a bicycle.", 'though（文末）＝それにしても。training wheels＝補助輪（院長のたとえ）。'),
    turn("Some days we just can't manage it. We're both working.", 'どうしてもできない日があります。共働きなので。', '長い治療には波があって当然。完璧な日を続けなくてよい。疲れているならペースを1段ゆるめる。',
      "That's all right. In a long treatment, there are always ups and downs. You don't need a perfect day every day. If you're tired, we can slow the pace down by one step.", 'ups and downs＝波。slow … down＝ゆるめる。'),
    turn("And when can we stop?", 'いつやめられますか？', 'やめるタイミングは診察で一緒に決める。大切なのは、痛がらずに自信を持って出せていること。',
      "We'll decide that together at your visits. What matters most is that he can go without pain, and with confidence.", 'What matters most is that …＝いちばん大切なのは…。')
  ],
  challenge: turn("What do you mean by 'training wheels'?", '「補助輪」とは、どういう意味ですか？', 'たとえを、ふつうの言葉で言い直す。',
    "I mean they support him while his bowel learns to work by itself. Later, we take them off, step by step.", 'I mean … while …。by itself＝自分の力で。') },

{ id: 'consult-eczema', group: '皮ふ・けが', title: '乳児湿疹：塗り方と洗い方', role: '母親', source: 'K-皮膚-退室時-乳児湿疹', voices: { heard: MOM_AU, en: DOC },
  context: '4か月の女の子。頬が赤くがさがさして2週間。軟膏の塗り方、保湿、洗い方、次の受診の目安を伝える。',
  goal: '回数・場所・やり方を、短い命令文でやさしく伝えられる',
  turns: [
    turn("Her cheeks have been red and rough for two weeks, and she keeps rubbing her face on my shoulder.", '頬が赤くがさがさして2週間になります。顔を私の肩にこすりつけてばかりです。', '診て、炎症でバリアが弱っていると伝える。まず薬で炎症をリセットする。',
      "I see. Let me have a look. The skin here is inflamed, so its barrier is weak right now. First, we'll calm the inflammation with medicine.", 'Let me have a look.＝診せてください。First, … で順番を示す。'),
    turn("Is that a steroid? I've heard they're strong.", 'それはステロイドですか？ 強いと聞きましたが。', '軟膏はステロイドと抗生剤入り。朝と晩の1日2回、湿疹のところに塗る。',
      "Yes, the ointment contains a steroid and an antibiotic. We use it to reset the inflammation first. Please put it on the rash twice a day, in the morning and in the evening.", 'ointment＝軟膏。put it on the rash＝湿疹のところに塗る。'),
    turn("And what about the rest of her skin?", 'ほかの部分の肌はどうすればいいですか？', '湿疹のないところは保湿剤（プロペト）をたっぷり。テカテカを保つ。',
      "Where there's no rash, put on plenty of the moisturizing ointment. Keep the skin shiny.", 'plenty of＝たっぷり。shiny＝テカテカ。'),
    turn("How should I wash her? I've been using a gauze cloth.", '洗い方は？ ガーゼを使っていました。', 'お風呂は夜1回。ガーゼでこすらない。よく泡立てた石けんで、手でやさしく洗う。',
      "Once a day, in the evening bath, is enough. Please don't rub with gauze. Make a good foam with soap, and wash gently with your hands.", 'is enough＝で十分です。rub＝こする。'),
    turn("How soon should it get better?", 'どのくらいでよくなりますか？', '薬を使って4〜5日たっても改善しないときは、早めに受診。',
      "If it isn't better after four or five days of the medicine, please come back early.", '期待の日数ではなく、「この日数でよくならなければ来てください」と伝える。'),
    turn("And if it does get better, do I just stop?", 'よくなったら、そのままやめていいんですか？', '順調なら1〜2週間後にもう一度診察。次の段は一緒に決める。',
      "Let's decide that together. If things go well, please come back in one to two weeks.", 'Let\'s decide that together.＝一緒に決めましょう。')
  ],
  challenge: turn("Sorry, how many times a day was the ointment?", 'すみません、軟膏は1日何回でしたっけ？', '回数と場所を、短く言い直す。',
    "Twice a day. Once in the morning and once in the evening, on the rash only.", '数字を先に。on the rash only＝湿疹のところだけ。') },

{ id: 'consult-head', group: '皮ふ・けが', title: '頭をぶつけた：24時間の見守り', role: '父親', source: 'K-外科-退室時-頭部打撲', voices: { heard: DAD_AU, en: DOC },
  context: '2歳の男の子。1時間前にソファから落ちて後頭部を打った。すぐ泣き、いまは元気。診察で気になる所見はない。24時間の見守りと、受診の合図を伝える。',
  goal: '「いまは大丈夫そう。でも…」を、言いすぎずに伝えられる',
  turns: [
    turn("He fell off the sofa and hit the back of his head on the floor about an hour ago. He cried straight away, but now he seems fine.", '1時間ほど前にソファから落ちて、後頭部を床にぶつけました。すぐ泣きましたが、いまは元気そうです。', '来てくれたことを受け、吐いたか、いつもより眠そうかを聞く。',
      "I'm glad you brought him in. Has he vomited, or has he been unusually sleepy since then?", 'straight away＝すぐに（保護者の言葉）。unusually sleepy＝いつもと違って眠そう。'),
    turn("No, nothing like that. So he's OK?", 'いいえ、そういうことはありません。じゃあ大丈夫ですね？', '診察でいま気になる所見はない。ただ、まれに後から変化が出るので、24時間ほど家で様子を見る。',
      "I've examined him, and I don't see anything worrying right now. But very occasionally, changes show up later. So please watch him at home for about twenty-four hours.", 'I don\'t see anything worrying right now＝いまは気になる所見はありません（「大丈夫」と言い切らない）。show up＝現れる。'),
    turn("Do I need to keep him awake? Or keep him lying down?", '起こしておいたほうがいいですか？ それとも寝かせておく？', '過ごし方はいつもどおり。安静は不要、食事も普段どおり。眠ってもよいが、ときどき声をかけて反応を確かめる。',
      "No. He can spend the day as usual. He doesn't need to stay in bed, and he can eat normally. It's fine if he falls asleep, but please speak to him now and then, and check that he responds.", 'as usual＝いつもどおり。now and then＝ときどき。'),
    turn("What exactly am I watching for?", '具体的には、何を見ていればいいですか？', '受診の合図：何度も吐く／ぐったりして反応が鈍い／けいれん／手足の動きが左右で違う・ふらつく／目の動きがおかしい／頭痛が強くなる／たんこぶが大きくなる。',
      "Please bring him back if he vomits again and again, or if he's drowsy and slow to respond. Also if he has a seizure, if he moves one side differently from the other, or if he can't walk steadily. And if his eyes move strangely, or if the headache or the bump keeps getting worse.", 'again and again＝何度も。keep getting worse＝どんどん悪くなる。3文に分けて言う。'),
    turn("And if that happens at night?", 'それが夜に起きたら？', '夜間や休日は救急へ。',
      "Then go to the emergency room. Don't wait until morning.", '短い2文で、迷わせない。'),
    turn("OK. And after twenty-four hours?", '分かりました。24時間たったら？', '24時間たって変わりなければ、ふだんの生活に戻してよい。',
      "If nothing has changed after twenty-four hours, he can go back to his normal life.", 'If nothing has changed＝何も変わりがなければ。')
  ],
  challenge: turn("He's got football practice tomorrow afternoon. Can he go?", '明日の午後、サッカーの練習があります。行ってもいいですか？', '24時間の目安に当てはめて答える。',
    "Please wait until twenty-four hours have passed. If he's the same as usual by then, he can go.", 'by then＝そのときまでに。目安をそのまま当てはめて答える。') }
];
list.forEach(function (s) { s.track = 'consult'; });
root.HANASERU_CONSULT_SCENES = list;
if (root.HANASERU_SCENES) Array.prototype.push.apply(root.HANASERU_SCENES, list);
}(typeof window !== 'undefined' ? window : globalThis));
