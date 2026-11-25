/* 🎤 ドバイ：発表と質疑。学会や面談で、自分の仕事・便秘の診療・Clinical AI Core を話し、質問に返す練習。
   ・答えの中身は、院長の原稿（Vault 22_アプリ開発/Hanaseru 語学トレーニング/41_自己紹介と使命…）と、
     院長承認の便秘の説明文（既製品チャット）にあることだけ。source に出典。
   ・書籍の刊行・英訳・海外契約の状況、Clinical AI Core の効果は、確認されていないので言い切らない
     （「まだ測っていない」「いま取り組んでいる」と答える練習を入れてある）。
   ・質問する相手の言葉は創作。実在の人物・団体ではない。 */
(function (root) {
'use strict';
var ME = 'en-US-Neural2-D', F_GB = 'en-GB-Neural2-A', M_GB = 'en-GB-Neural2-B', F_US = 'en-US-Neural2-F', F_AU = 'en-AU-Neural2-A', M_AU = 'en-AU-Neural2-B';
function turn(heard, heardJa, intent, en, note) { return { heard: heard, heardJa: heardJa, intent: intent, en: en, note: note }; }
var SRC = '41_自己紹介と使命_診療・本・Clinical_AI_Core_練習案';
var list = [
{ id: 'dubai-pitch', group: '① 自分を語る', title: '60秒の自己紹介と使命', role: '司会・聞き手', source: SRC + '「最初に話す英語」', voices: { heard: F_GB, en: ME },
  context: '学会や面談の最初に、自分が誰で、何をしてきて、何を大切にしているかを60〜90秒で話す。相手の短い問いかけを合図に、原稿をひとかたまりずつ言う。',
  goal: '5つのかたまり（名乗る→経歴→本→大切にすること→海外）を、見ずに順に言える',
  turns: [
    turn("Thank you for joining us today. Could you start by telling us who you are?", '本日はありがとうございます。まず、自己紹介をお願いできますか？', '名乗る：小児外科医で、東京で子どものクリニックを運営している。',
      "Hello, I'm Koji Komori. I'm a pediatric surgeon, and I run a children's clinic in Tokyo.", '最初の一文は短く、はっきり。I\'m …, and I run …。'),
    turn("And what's your background?", 'ご経歴は？', '経歴：専門病院で複雑な手術が必要な子どもを診てきた。いまは地域で一般と専門の両方の診療。',
      "I used to work in specialist hospitals, caring for children who needed complex surgery. I now provide both general and specialist care in the community.", 'I used to … / I now …（以前と今を対にする）'),
    turn("I understand you've written a book. What led you to that?", '本を書かれたそうですね。きっかけは？', '本：2つの経験から、子どもの便秘の本を書いた。医学の知識を、家族が分かって毎日使える形にしたい。',
      "These two experiences led me to write a book about childhood constipation. I want to make medical knowledge easier for families to understand and use in everyday life.", 'led me to …＝…することになった。easier for families to understand and use。'),
    turn("What matters most to you in your work?", 'お仕事で、いちばん大切にしていることは何ですか？', '大切にすること：一人ひとりの子と、その後ろにいる家族を理解する。子どもの成長と、家族の自信を支えたい。',
      "What matters to me is understanding each child and the family behind them. I want to help children grow, and help families feel more confident about their child's care.", 'What matters to me is …。the family behind them＝その後ろにいる家族。'),
    turn("And what are you hoping to do next?", 'これから、何をしていきたいですか？', '海外：学んだことを日本の外の人と分かち合い、相手の経験からも学びたい。',
      "I'd like to share what I've learned with people outside Japan, and learn from their experience too.", 'share …, and learn from … too（一方通行にしない）')
  ],
  challenge: turn("We only have a moment. Could you sum that up in a sentence or two?", '時間がありません。1〜2文でまとめていただけますか？', '30秒版：小児外科医で東京のクリニック。一般の診療と便秘の専門。本を書き、海外の家族と医師に分かち合いたい。',
    "I'm a pediatric surgeon, and I run a children's clinic in Tokyo, where I also specialize in childhood constipation. I've written a book about it, and I'd like to share what I've learned with families and doctors outside Japan.", '短く求められたら、名乗る→専門→本→海外の4点に絞る。') },

{ id: 'dubai-qa-constipation', group: '② 便秘の診療について', title: '質疑：便秘の治療の考え方', role: '学会の参加者（小児科医）', source: 'K-便秘-退室時-初診内服コース／K-便秘-再診-なぜ長丁場なのか／K-便秘-再診-浣腸は癖にならない／K-便秘-退室時-食事と水分／K-便秘-再診-便が漏れる', voices: { heard: M_GB, en: ME },
  context: '便秘の話をしたあとの質疑。同業の医師から、治療の目標・長くかかる理由・浣腸・食事・家族の続け方を聞かれる。患者さんの家族に話している中身を、同業者向けに短く答える。',
  goal: '質問を一言で受けてから（That\'s a good question. / Right.）、結論→理由の順で答えられる',
  turns: [
    turn("Thanks for your talk. What's the first thing you aim for when a child comes to you with constipation?", 'ご発表ありがとうございました。便秘の子が来たとき、最初に目指すことは何ですか？', '最初の目標は「痛くない、スムーズに出る」流れを作ること。',
      "Thank you. Our first goal is simple: no pain, and stools that come out smoothly. Everything else is built on that.", '結論を先に。Everything else is built on that.＝それが土台です。'),
    turn("In my experience, families get tired because it takes so long. How do you explain that to them?", '私の経験では、長くかかるので家族が疲れてしまいます。どう説明していますか？', '腸が「出ない記憶」を「出る記憶」に書き換えている。体の記憶を変えるには時間がかかる。薬や浣腸は補助輪。',
      "That's a very real problem. I tell them the bowel is rewriting its memory, from \"I can't go\" to \"I can go\", and that takes time. The medicine and the enemas are like training wheels.", '受ける一言（That\'s a very real problem.）→ I tell them …。training wheels＝補助輪。'),
    turn("Don't parents worry that their child will become dependent on enemas?", '親御さんは、浣腸に頼りきりになると心配しませんか？', 'よく聞かれる。浣腸は癖にならない。もともと出せない状態だから必要。目的は直腸を元に戻すことと、リズムを覚えさせること。',
      "They do, almost every time. I explain that enemas are not habit-forming. The child couldn't go in the first place, and that's why they're needed. The aim is to let the stretched rectum recover, and to teach the body a regular rhythm.", 'They do, almost every time.（相手の指摘を認めてから説明）in the first place＝もともと。'),
    turn("And what about diet? Parents always ask me about fibre and water.", '食事はどうですか？ 食物繊維や水分のことを、いつも聞かれます。', '薬を始めた子は、まず薬で「楽に出せる状態」をつくることが中心。食事と水分は無理のない範囲で、できそうなことを1つ選ぶ。',
      "For a child who has started medicine, the centre of the treatment is making it easy to go, with the medicine first. For food and water, I ask families to choose just one thing they can manage.", 'the centre of the treatment is …。choose just one thing。'),
    turn("How do you handle children who soil their underwear? Parents often think it's a behaviour problem.", '下着を汚す子には、どう対応していますか？ 親はしつけの問題だと思いがちです。', 'しつけの問題ではなく、溜まった便があふれている体のサイン。毎日決まった時間に先に出し切る。最初の目標は、漏れたら教えてもらえること。',
      "I tell them it's not a discipline problem. It's a sign from the body: stool has built up and is overflowing. So we help the child empty out at a fixed time every day. The first goal is simply that the child can tell the parent when it has leaked.", 'It\'s a sign from the body: …。So we …（結論→行動）'),
    turn("One last question: how do you decide when to stop treatment?", '最後に一つ。治療をやめる時期は、どう決めていますか？', 'やめる時期は診察で家族と一緒に決める。大切なのは、痛がらずに自信を持って出せていること。',
      "We decide that together with the family, at the visits. What matters most is that the child can go without pain, and with confidence.", 'What matters most is that …。')
  ],
  challenge: turn("Do you have outcome data comparing your approach with standard care?", 'ご自身のやり方と標準治療を比べた、成績のデータはありますか？', '測っていないことは言い切らない。日々の診療での経験として話していると答え、相手の経験を聞き返す。',
    "That's a fair question. What I've shared today comes from my daily practice, not from a comparative study. I'd be interested to hear how you measure outcomes in your clinic.", 'That\'s a fair question.＝もっともな質問です。持っていないデータを持っているように言わない。最後に聞き返す。') },

{ id: 'dubai-qa-cac', group: '③ Clinical AI Core について', title: '質疑：Clinical AI Core とは', role: '医療AIに関心のある参加者', source: SRC + '「Clinical AI Coreを聞かれた時の追加」「相手別の出口」', voices: { heard: F_US, en: ME },
  context: 'Clinical AI Core に関心を持った相手からの質問。何であるか、目的、どこで使っているかを短く答える。効果は実証済みと言わない。最後は相手に質問を返す。',
  goal: '分かっていること・まだのことを言い分け、相手に質問を返して会話を続けられる',
  turns: [
    turn("You mentioned something called Clinical AI Core. What is it, exactly?", 'Clinical AI Core というものに触れていましたね。具体的には何ですか？', 'プロジェクトの名前。自分のクリニックで育ててきた実用的な道具と働き方をまとめたもの。',
      "It's a project I'm working on. It brings together practical tools and ways of working that we developed in my clinic.", 'It brings together A and B that …。'),
    turn("And what's the goal? What problem are you trying to solve?", '目的は何ですか？ どんな問題を解こうとしているんですか？', '医師やスタッフが、患者さんの話を聞き、診療に集中する時間を増やすこと。',
      "The goal is to give doctors and staff more time to listen to patients, and to focus on clinical care.", 'The goal is to give A more time to …。'),
    turn("Is it being used in other hospitals yet?", 'もう、ほかの病院でも使われていますか？', 'まず自分たちのクリニックで使い、毎日の使用を通じて道具を磨いている。',
      "We start in our own clinic, and improve the tools through daily use. That's where we are now.", 'That\'s where we are now.＝いまはその段階です（先のことを言い切らない）。'),
    turn("Do you have data showing that it improves outcomes for patients?", '患者さんの結果がよくなるというデータはありますか？', '効果は実証済みと言わない。まだ測っていない、と正直に答える。',
      "Not yet. At this stage, we're using it in our own clinic and improving it day by day. I'd rather not claim results we haven't measured.", 'Not yet.（短く正直に）I\'d rather not claim …＝…と言い切るのは控えたい。'),
    turn("That's honest. What kind of tools are we talking about?", '正直ですね。どんな道具のことですか？', '細部を足さず、原稿の範囲で言い直す：診療の中で育てた実用的な道具と働き方。',
      "Practical ones. Tools and ways of working that grew out of our everyday clinical work.", 'grow out of＝…から生まれる。知らないこと・決まっていないことを足さない。'),
    turn("Interesting. We're struggling with paperwork ourselves.", '面白いですね。うちも書類仕事に苦しんでいます。', '相手に質問を返す：あなたのクリニックでは、何が患者さんの時間を奪っていますか。',
      "I can imagine. What takes time away from patient care in your clinic?", 'I can imagine. で受けて、質問を返す（会話を相手に渡す）。')
  ],
  challenge: turn("So is this a product we could buy?", 'それは、私たちが買える製品なんですか？', '決まっていないことは言い切らない。いまは自院で使って磨いている段階だと答え、関心を聞く。',
    "At the moment, it's something we use and improve in our own clinic. I'd be glad to hear what you would need in yours.", 'At the moment, …＝いまのところは。販売や提供の約束をしない。') },

{ id: 'dubai-book', group: '① 自分を語る', title: '本について聞かれたら', role: '出版関係者・参加者', source: SRC + '「Why did you write the book?」「相手別の出口」', voices: { heard: F_AU, en: ME },
  context: '本について聞かれたときの受け答え。なぜ書いたか、誰のための本か、海外への展開はどの段階か。刊行・英訳・契約の状況は言い切らない。',
  goal: '「まだ取り組んでいる途中」を、前向きな言い方で伝えられる',
  turns: [
    turn("I heard you've written a book. What's it about?", '本を書かれたと聞きました。何についての本ですか？', '子どもの便秘の本。小児外科と地域医療の経験をまとめた。',
      "I've written a book about childhood constipation. It brings together my experience in pediatric surgery and community care.", 'It brings together my experience in A and B。'),
    turn("Why did you decide to write it?", 'なぜ、書こうと思ったんですか？', '以前は子ども病院で手術が必要な子を診ていた。いまは地域で家族に近いところにいる。その2つを、家族が毎日使える本にしたかった。',
      "I used to work in a children's hospital, where I treated children who needed surgery. Now I work more closely with families in the community. I wanted to bring those two experiences together in a book that families could use in everyday life.", 'I used to … / Now I … / I wanted to …（3文でつなぐ）'),
    turn("Who is it for? Doctors, or parents?", '誰のための本ですか？ 医師ですか、親ですか？', '家族のための本。医学の知識を、家族が使いやすい形にしたかった。',
      "It's for families. I wanted to make this knowledge easier for families to use.", '短い質問には、短く答えてから一文足す。'),
    turn("Is it available in English?", '英語版はありますか？', '日本の外の人とどう分かち合うかは、まだ取り組んでいる途中。',
      "I'm still working on how to share the book with people outside Japan.", 'I\'m still working on how to …（まだ途中、を前向きに）'),
    turn("I work with a publisher here. Families in this region have the same worries, you know.", '私はこちらの出版社と仕事をしています。この地域の家族も、同じ悩みを持っていますよ。', '相手に質問を返す：こちらの家族は、子どもの便秘について何を知りたいと思うか。',
      "That's good to hear. What would families here want to know about childhood constipation?", 'That\'s good to hear. で受けて、相手の地域の事情を聞く。')
  ],
  challenge: turn("So when can we expect an English edition?", 'では、英語版はいつごろになりそうですか？', '時期を約束しない。まだ決まっていないと答え、関心へのお礼を言う。',
    "I can't give you a date yet. But I'm glad you're interested, and I'd like to keep in touch.", 'I can\'t give you a date yet.（約束しない）keep in touch＝連絡を取り合う。') }
];
list.forEach(function (s) { s.track = 'dubai'; });
root.HANASERU_DUBAI_SCENES = list;
if (root.HANASERU_SCENES) Array.prototype.push.apply(root.HANASERU_SCENES, list);
}(typeof window !== 'undefined' ? window : globalThis));
