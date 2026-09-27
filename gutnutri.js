/* Hanaseru 🧩 便秘外来・栄養外来の部品（カード）— 院長 2026-09-27「便秘・栄養もシナリオを」
   日本語は院長が実際に使う言い回し（Vault：KarteAI チャットサンプル集・既製品チャット・患者説明シナリオ・
   Notion 配布物・栄養再診の文字起こし）から。数字は出典のあるものだけ（直腸径・浣腸30ml/5分・再診1〜2週・
   最短3か月／結果説明2〜3週・再検査3か月・変化の目安3〜6か月）。部品と流れ・症例は parts.js。
   患者の個人情報は含めない（症例は要素だけを抽象化）。男の子なら her/she を his/he に。 */
(function () {
  var G = [
    // 便秘：安心させる入口
    { id: "gut-01", domain: "gut", ja: "お母さんのせいではありません。食事のせいでもありません。", en: "This isn't your fault, and it isn't about her diet." },
    { id: "gut-02", domain: "gut", ja: "病気ではなく、もともと便が出にくい体質なんです。", en: "It's not an illness. Some children are just born with a tendency to get constipated.", note: "a tendency to ～＝～しやすい体質・傾向。" },
    // 便秘：エコーの見立て
    { id: "gut-03", domain: "gut", ja: "エコーで、直腸にうんちがたまっているのが見えます。", en: "On the ultrasound, I can see stool building up in the rectum.", note: "rectum＝直腸（レクタム）。stool＝便（医療の場で使う丁寧な語）。子どもには poop。" },
    { id: "gut-04", domain: "gut", ja: "直腸が、ふくらませ続けた風船のように伸びてしまっています。", en: "The rectum has stretched, like a balloon that's been blown up again and again." },
    { id: "gut-05", domain: "gut", ja: "それで便意のセンサーが鈍くなって、気づかないうちにたまっていくんです。", en: "That dulls the sensor that tells her she needs to go, so stool keeps building up without her noticing.", note: "need to go＝トイレに行きたい（便意・尿意）。" },
    { id: "gut-06", domain: "gut", ja: "今は黄色信号です。悪くはないけれど、もったいない状態です。", en: "Right now, it's a yellow light. It's not bad, but it's not where it could be." },
    { id: "gut-07", domain: "gut", ja: "パンツが汚れるのは病気ではありません。伸びた直腸に、体が慣れてしまっている状態です。", en: "The soiling isn't a disease. Her body has just gotten used to a stretched rectum.", note: "soiling＝便もれでパンツが汚れること。" },
    // 便秘：方針
    { id: "gut-08", domain: "gut", ja: "最優先は、毎日出すリズムを作ることです。", en: "Our first priority is to build a daily rhythm." },
    { id: "gut-09", domain: "gut", ja: "出すことと、治すことは、別のものです。", en: "Getting the stool out and fixing the problem are two different things." },
    // 便秘：浣腸
    { id: "gut-10", domain: "gut", ja: "浣腸なら5分以内に出ます。飲み薬は、いつ出るか分かりません。", en: "An enema works within five minutes. With medicine by mouth, you never know when it'll come." },
    { id: "gut-11", domain: "gut", ja: "毎日同じ時間に、30mlの浣腸をしてください。", en: "Please give her a 30 ml enema at the same time every day." },
    // 便秘：飲み薬
    { id: "gut-12", domain: "gut", ja: "お薬と浣腸は、メガネや補助輪のようなものです。", en: "The medicine and the enemas are like glasses or training wheels.", note: "training wheels＝（自転車の）補助輪。『今は助けを借りる時期』を伝える比喩。" },
    { id: "gut-13", domain: "gut", ja: "このお薬は、年単位で飲むように作られています。", en: "This medicine is designed to be taken for years.", note: "モビコール（英国でも Movicol）の説明。" },
    { id: "gut-14", domain: "gut", ja: "ゆるめになっても気にしないでください。短い時間でたっぷり出るのが目標です。", en: "Don't worry if it gets a bit loose. The goal is to get a good amount out quickly." },
    { id: "gut-15", domain: "gut", ja: "急にやめると、また出なくなります。安定してから、少しずつ減らしましょう。", en: "If you stop suddenly, it'll back up again. Once things are stable, we'll reduce it slowly.", note: "back up＝（便が）たまって詰まる。" },
    // 便秘：家でやること
    { id: "gut-16", domain: "gut", ja: "歯みがきと同じように、明るくサッと、5分以内に終わらせましょう。", en: "Just like brushing teeth, keep it positive and quick. Done in five minutes." },
    { id: "gut-17", domain: "gut", ja: "ごはんのあと5〜10分、トイレに座ってみましょう。出なくても大丈夫です。", en: "After meals, have her sit on the toilet for five to ten minutes. It's fine if nothing comes out." },
    { id: "gut-18", domain: "gut", ja: "嫌がる時間を短くするのが、一番のやさしさです。", en: "Keeping the unpleasant part short is the kindest thing you can do." },
    // 便秘：次回・受診の目安
    { id: "gut-19", domain: "gut", ja: "効いている感じがなければ1週間以内に、順調なら2週間後に来てください。", en: "If it doesn't seem to be working, come back within a week. If it's going smoothly, come back in two weeks." },
    { id: "gut-20", domain: "gut", ja: "次回も、エコーで一緒に確認しましょう。", en: "Next time, we'll check again together on the ultrasound." },
    { id: "gut-21", domain: "gut", ja: "お腹の強い痛みが続く、何度も吐く、血がたくさん混じる、ぐったりしているときは、すぐ受診してください。", en: "If she has bad stomach pain that won't go away, keeps throwing up, has a lot of blood in her stool, or seems very weak, come in right away." },
    // 便秘：長期戦・励まし
    { id: "gut-22", domain: "gut", ja: "最短でも3か月は、正しい量で続けましょう。", en: "Let's keep the right dose going for at least three months." },
    { id: "gut-23", domain: "gut", ja: "波があって当然です。淡々と続けるのが、一番の近道です。", en: "Ups and downs are normal. Just keep going steadily. That's the fastest way there." },
    { id: "gut-24", domain: "gut", ja: "本当に大きな前進です。これからも一緒に見ていきましょう。", en: "That's real progress. Let's keep working on it together." },
    // 便秘：よくある質問への答え
    { id: "gut-25", domain: "gut", ja: "（Q 長く飲んで大丈夫？）腎臓に問題がなければ心配いりません。効かなくなることもなく、採血も要りません。", en: "As long as her kidneys are fine, there's nothing to worry about. It won't stop working, and she doesn't need blood tests.", note: "酸化マグネシウムの長期内服への質問。" },
    { id: "gut-26", domain: "gut", ja: "（Q 食事で治せない？）食事や水分だけでは、頑張ったほどの効果は出ません。無理はしなくていいですよ。", en: "Food and fluids alone won't help as much as you'd hope. You don't need to push yourself." },
    { id: "gut-27", domain: "gut", ja: "（Q かわいそう）終わったあとにケロッとしていれば、トラウマにはなりません。", en: "If she's fine right afterwards, it won't be traumatic for her." },
    { id: "gut-28", domain: "gut", ja: "（Q トイトレ）うんちは焦らなくて大丈夫。今はおむつで全く問題ありません。", en: "There's no rush with poop. Diapers are completely fine for now." }
  ];

  var N = [
    // 栄養：受け止め
    { id: "nut-01", domain: "nutri", ja: "病気ではないけれど、本来の力が出せない。もどかしいですよね。", en: "It's not an illness, but she can't be her best self. That must be frustrating." },
    { id: "nut-02", domain: "nutri", ja: "根性や気持ちの問題ではなく、体の仕組みによるものです。", en: "It's not about willpower. It's about how the body works." },
    // 栄養：見立て
    { id: "nut-03", domain: "nutri", ja: "細胞がエネルギーを作る「バッテリー」が足りていないのかもしれません。", en: "Her cells may be running low on the \"battery\" that makes energy." },
    { id: "nut-04", domain: "nutri", ja: "血糖値が急に上がって一気に下がる、ジェットコースターのような動きです。", en: "Her blood sugar may be shooting up and crashing down, like a roller coaster.", note: "crash＝急に下がる（血糖が落ちてぐったりする感じ）。" },
    { id: "nut-05", domain: "nutri", ja: "薬は「流す・動かす」はできても、体を「作る」ことはできません。", en: "Medicine can help things move, but it can't build the body." },
    // 栄養：検査の位置づけ
    { id: "nut-06", domain: "nutri", ja: "病気がないかも確かめますが、主に栄養の状態を詳しく見ます。", en: "We'll check for illness, but mainly we'll look closely at her nutrition." },
    { id: "nut-07", domain: "nutri", ja: "「基準範囲内」は、「ちょうど良い」という意味ではありません。", en: "\"Within the normal range\" doesn't always mean \"at the best level.\"" },
    // 栄養：結果説明
    { id: "nut-08", domain: "nutri", ja: "一番大事なのは、フェリチン（体に貯めてある鉄）です。", en: "The most important number is ferritin, the iron stored in the body.", note: "ferritin（フェリティン）。保護者には必ず the iron stored in the body と言い添える。" },
    { id: "nut-09", domain: "nutri", ja: "貧血の値が下がるのは、鉄不足の一番最後です。だからフェリチンを見ます。", en: "Hemoglobin is the last thing to drop when iron runs low. That's why we look at ferritin." },
    { id: "nut-10", domain: "nutri", ja: "（例）17から35へ、倍くらいになりました。", en: "It went from 17 to 35. It's nearly doubled.", note: "数字は例。サプリを飲んでいないと、まずこうはなりません＝This rarely happens without supplements." },
    { id: "nut-11", domain: "nutri", ja: "まずは、悩みが取れるところまで上げるのが第一ステップです。", en: "The first step is to raise it to where her symptoms get better." },
    { id: "nut-12", domain: "nutri", ja: "フェリチンとタンパク質、この2つで8割は分かります。", en: "Ferritin and protein tell us about eighty percent of the story." },
    // 栄養：食事の工夫
    { id: "nut-13", domain: "nutri", ja: "減らすのではなく、タンパク質を足していきましょう。", en: "Instead of cutting things out, let's add more protein." },
    { id: "nut-14", domain: "nutri", ja: "朝ごはんに、卵やチーズを一品足すだけでも違います。", en: "Just adding an egg or some cheese to breakfast makes a difference." },
    { id: "nut-15", domain: "nutri", ja: "毎食、その子の両手のひらに乗るくらいのタンパク質が目安です。", en: "At every meal, aim for about as much protein as fits in her two palms." },
    { id: "nut-16", domain: "nutri", ja: "甘いものは、完全に禁止しなくていいです。食べたあとに少し体を動かしましょう。", en: "You don't have to ban sweets completely. Just have her move around a bit after eating them." },
    // 栄養：サプリ
    { id: "nut-17", domain: "nutri", ja: "サプリは、自分の食事で足りるようになるまでの、一時的な補助輪です。", en: "Supplements are temporary training wheels, until she can get enough from food." },
    { id: "nut-18", domain: "nutri", ja: "鉄を飲むと便が黒っぽくなることがありますが、心配いりません。", en: "Iron can make her stool look dark. That's normal, so don't worry." },
    { id: "nut-19", domain: "nutri", ja: "良くなったらやめて大丈夫です。要らなくなることが目標です。", en: "Once she's better, she can stop. The goal is to not need them anymore." },
    // 栄養：次回
    { id: "nut-20", domain: "nutri", ja: "2〜3週間後に結果が出たら、一緒に方針を決めましょう。", en: "When the results come back in two to three weeks, let's decide on a plan together." },
    { id: "nut-21", domain: "nutri", ja: "3か月後に、もう一度採血しましょう。", en: "Let's recheck her blood in three months." },
    { id: "nut-22", domain: "nutri", ja: "3か月から半年で、「変わってきた」と感じられるのが目標です。", en: "Our goal is for you to notice a change in three to six months." },
    // 栄養：前向きな結び
    { id: "nut-23", domain: "nutri", ja: "いつから始めても、遅すぎることはありません。", en: "It's never too late to start." },
    { id: "nut-24", domain: "nutri", ja: "完璧を目指さず、できそうなことを一つ試してみましょう。", en: "Don't aim for perfect. Let's just try one thing you can do." }
  ];
  window.HANASERU_CARDS = (window.HANASERU_CARDS || []).concat(G, N);
})();
