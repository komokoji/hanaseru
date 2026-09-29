/* Hanaseru 🧑‍⚕️ 小森を語る英語 — 診察室の外で「小森が何者か」を伝える（院長 2026-09-29）
   短い文・1文1情報。日本人らしい英語のまま、自分の考えと気持ちをはっきり伝える。
   部品（パート）と流れ・症例は parts.js。domain "me" は並べた順に出る。 */
(function () {
  var M = [
    // ① なぜ小児外科
    { id: "me-01", domain: "me", part: "① なぜ小児外科", ja: "子どもの頃から、手先が器用でした。", en: "As a child, I was good with my hands." },
    { id: "me-02", domain: "me", part: "① なぜ小児外科", ja: "機械いじりが好きで、何かを作るのが好きでした。", en: "I loved taking machines apart. I loved making things." },
    { id: "me-03", domain: "me", part: "① なぜ小児外科", ja: "医学部のとき、小児外科に「作る未来」を感じました。", en: "In medical school, I felt pediatric surgery had a creative future." },
    { id: "me-04", domain: "me", part: "① なぜ小児外科", ja: "だから小児外科に進みました。", en: "So I chose pediatric surgery." },
    { id: "me-05", domain: "me", part: "① なぜ小児外科", ja: "手術という技術で、小さな赤ちゃんの命を助ける仕事です。", en: "We use surgery to save the lives of tiny babies." },
    // ② 病気の手前へ
    { id: "me-06", domain: "me", part: "② 病気の手前へ", ja: "でも、長くやっているうちに、悩みが出てきました。", en: "But over the years, something started to bother me." },
    { id: "me-07", domain: "me", part: "② 病気の手前へ", ja: "手術で診る病気は、いわば「なれの果て」です。", en: "The diseases we operate on are the end of a long road." },
    { id: "me-08", domain: "me", part: "② 病気の手前へ", ja: "もっと手前で、できることがあるのではないか。", en: "I thought, there must be something we can do earlier." },
    { id: "me-09", domain: "me", part: "② 病気の手前へ", ja: "地域の中で子どもを診るうちに、その目線が育ちました。", en: "Working with children in the community, that feeling grew." },
    { id: "me-10", domain: "me", part: "② 病気の手前へ", ja: "その答えが、栄養でした。", en: "The answer was nutrition." },
    // ③ 栄養という答え
    { id: "me-11", domain: "me", part: "③ 栄養という答え", ja: "細胞も、元気も、栄養から作られます。", en: "Our cells are made from nutrition. So is our energy." },
    { id: "me-12", domain: "me", part: "③ 栄養という答え", ja: "病気の治りやすさも、風邪のひきにくさも、心の健康も、栄養と関係しています。", en: "How fast we recover, how often we catch colds, even our mood. Nutrition is behind all of them." },
    { id: "me-13", domain: "me", part: "③ 栄養という答え", ja: "「病気ではないけれど元気がない」子の多くが、栄養の視点で説明できるようになりました。", en: "Many children are not sick, but not well either. Nutrition explains a lot of that." },
    { id: "me-14", domain: "me", part: "③ 栄養という答え", ja: "今は、この学問に魅了されて、夢中です。", en: "Now I'm fascinated by this field. I'm hooked." },
    { id: "me-15", domain: "me", part: "③ 栄養という答え", ja: "現場で手応えを感じています。", en: "And I can see it working in my clinic." },
    { id: "me-16", domain: "me", part: "③ 栄養という答え", ja: "これを日本中に広めていきたいと思っています。", en: "I want to spread this across Japan." },
    // ④ 私のミッション
    { id: "me-17", domain: "me", part: "④ ミッション", ja: "一番大事なのは、何が本質で、本当で、本物なのかです。", en: "What matters most to me is what is real, true, and genuine." },
    { id: "me-18", domain: "me", part: "④ ミッション", ja: "原則に沿って生きること。感謝すること。", en: "Living by principles. Being grateful." },
    { id: "me-19", domain: "me", part: "④ ミッション", ja: "助け合い、分かち合うこと。", en: "Helping each other. Sharing." },
    { id: "me-20", domain: "me", part: "④ ミッション", ja: "そして、成長や感動の喜びを世界に伝えること。それが私のミッションです。", en: "And sharing the joy of growing and being moved. That's my mission." },
    // ⑤ これから
    { id: "me-21", domain: "me", part: "⑤ これから", ja: "人生のほとんどを、医療の中で過ごしてきました。", en: "I've spent most of my life in medicine." },
    { id: "me-22", domain: "me", part: "⑤ これから", ja: "その視点を広げて、もっと多くの人の心と体を支えたいです。", en: "I want to use that to support more people, in body and mind." },
    { id: "me-23", domain: "me", part: "⑤ これから", ja: "正直に言うと、これまで働きすぎました。", en: "To be honest, I've worked too much." },
    { id: "me-24", domain: "me", part: "⑤ これから", ja: "だから今は、いろいろな場所に行って、刺激を受けることも大事にしています。", en: "So now, I also want to travel more, and see new things." },
    { id: "me-25", domain: "me", part: "⑤ これから", ja: "今回のスペイン旅行も、その一つです。", en: "This trip to Spain is part of that." },
    // ⑥ 大事にしていること（気持ちの描写）
    { id: "me-26", domain: "me", part: "⑥ 大事にしていること", ja: "不器用でもいい。要領が悪くてもいい。", en: "It's okay to be clumsy. It's okay to be slow." },
    { id: "me-27", domain: "me", part: "⑥ 大事にしていること", ja: "でも、正直に、誠実に生きることが大事です。", en: "But be honest. Live with integrity. That's what matters." },
    { id: "me-28", domain: "me", part: "⑥ 大事にしていること", ja: "そして、本物を見分ける目を持つこと。", en: "And know what is real when you see it." },
    { id: "me-29", domain: "me", part: "⑥ 大事にしていること", ja: "私が一番大事にしているのは、そこです。", en: "That's what I care about most." },
    // ⑦ 気持ちを描写する言い回し
    { id: "me-30", domain: "me", part: "⑦ 気持ちの言い回し", ja: "正直に言うと、", en: "To be honest," },
    { id: "me-31", domain: "me", part: "⑦ 気持ちの言い回し", ja: "あれが転機でした。", en: "That was the turning point for me." },
    { id: "me-32", domain: "me", part: "⑦ 気持ちの言い回し", ja: "一番うれしいのは、〜のときです。", en: "The happiest moment for me is when ___." },
    { id: "me-33", domain: "me", part: "⑦ 気持ちの言い回し", ja: "あの瞬間、心を動かされました。", en: "That moment really moved me." },
    { id: "me-34", domain: "me", part: "⑦ 気持ちの言い回し", ja: "うまく言えないのですが、", en: "It's hard to put into words, but" },
    { id: "me-35", domain: "me", part: "⑦ 気持ちの言い回し", ja: "それが、この仕事を続ける理由です。", en: "That's why I keep doing this work." }
  ];
  // ⑧〜⑩ よく言うこと（2026-09-29：Vault 全体で繰り返し出てくる言い方を数えて、上位から）
  M.push(
    // ⑧ 自分をひとことで（来歴の柱）
    { id: "me-36", domain: "me", part: "⑧ 自分をひとことで", ja: "お腹と栄養の、子ども専門のクリニックです。", en: "My clinic is for children. We focus on gut health and nutrition." },
    { id: "me-37", domain: "me", part: "⑧ 自分をひとことで", ja: "便秘の子どもを、年間5,000組ほど診ています。", en: "I see about 5,000 children a year for constipation." },
    { id: "me-38", domain: "me", part: "⑧ 自分をひとことで", ja: "手術台で、病気の一番下流を見てきました。だから、上流に持ち場を移しました。", en: "In surgery, I saw the end of the road. So I moved upstream." },
    { id: "me-39", domain: "me", part: "⑧ 自分をひとことで", ja: "メスを置いて、スプーンを持ちました。", en: "I put down the scalpel and picked up a spoon." },
    { id: "me-40", domain: "me", part: "⑧ 自分をひとことで", ja: "腕はそのままに、持ち場を上流に移した外科医です。", en: "I'm still a surgeon. I just moved my work upstream." },
    // ⑨ 親に繰り返し言うこと（診療の口癖）
    { id: "me-41", domain: "me", part: "⑨ 親によく言うこと", ja: "栄養は、心と体の土台です。", en: "Nutrition is the foundation of the body and the mind." },
    { id: "me-42", domain: "me", part: "⑨ 親によく言うこと", ja: "焦らず、今のペースで大丈夫です。", en: "No rush. Your pace is fine." },
    { id: "me-43", domain: "me", part: "⑨ 親によく言うこと", ja: "引き続き、一緒に見ていきましょう。", en: "Let's keep watching her together." },
    { id: "me-44", domain: "me", part: "⑨ 親によく言うこと", ja: "ゴールは、医療に頼らなくていい状態＝卒業です。", en: "The goal is to graduate. To not need us anymore." },
    { id: "me-45", domain: "me", part: "⑨ 親によく言うこと", ja: "農場と同じです。今日タネをまいても、明日には実りません。", en: "It's like a farm. You plant a seed today. It doesn't grow by tomorrow." },
    { id: "me-46", domain: "me", part: "⑨ 親によく言うこと", ja: "一進一退でいいんです。根気よく続けることが大事です。", en: "Two steps forward, one step back is fine. Just keep going." },
    { id: "me-47", domain: "me", part: "⑨ 親によく言うこと", ja: "今の食事を否定しません。土台に足し算していきましょう。", en: "I won't take anything away. We just add to what you have." },
    { id: "me-48", domain: "me", part: "⑨ 親によく言うこと", ja: "お薬はメガネと同じです。見えるようになるための道具です。", en: "Medicine is like glasses. It's a tool that helps her function." },
    { id: "me-49", domain: "me", part: "⑨ 親によく言うこと", ja: "病気ではなく体質です。意志や根性の問題ではありません。", en: "It's not an illness. It's how her body works. It's not about willpower." },
    { id: "me-50", domain: "me", part: "⑨ 親によく言うこと", ja: "ご自分を責めないでください。治療で良くなっていきます。", en: "Please don't blame yourself. With treatment, she will get better." },
    { id: "me-51", domain: "me", part: "⑨ 親によく言うこと", ja: "大事なのは、本人が困っているかどうかです。", en: "What matters is whether she is struggling." },
    // ⑩ 価値観の決まり文句
    { id: "me-52", domain: "me", part: "⑩ 価値観のことば", ja: "本当の健康を土台に、一人ひとりが自分らしく人生を楽しめるように。", en: "Real health is the base. Then each person can enjoy life in their own way." },
    { id: "me-53", domain: "me", part: "⑩ 価値観のことば", ja: "本来持っている生命力を取り戻すことを支える。それが中心軸です。", en: "I help children get back the strength they were born with. That's my center." },
    { id: "me-54", domain: "me", part: "⑩ 価値観のことば", ja: "座右の銘は「天を相手に仕事をする」です。", en: "My motto is: work as if heaven is watching, not people." },
    { id: "me-55", domain: "me", part: "⑩ 価値観のことば", ja: "人の心に、灯りをともしたい。", en: "I want to light a small lamp in people's hearts." },
    { id: "me-56", domain: "me", part: "⑩ 価値観のことば", ja: "可能性は見捨てない。信頼は行動で見る。", en: "I never give up on someone's potential. And I judge trust by actions." },
    { id: "me-57", domain: "me", part: "⑩ 価値観のことば", ja: "まず、みんなが喜ぶ世界がある。そこから始めます。", en: "First, imagine a world where everyone is happy. I start from there." },
    { id: "me-58", domain: "me", part: "⑩ 価値観のことば", ja: "原則には厳しく、人にはやさしく。", en: "Strict with principles. Kind to people." },
    { id: "me-59", domain: "me", part: "⑩ 価値観のことば", ja: "作品で導く。生き方は強いない。", en: "I lead by what I make. I don't tell people how to live." },
    { id: "me-60", domain: "me", part: "⑩ 価値観のことば", ja: "静かでいい。短い言葉に、思想と熱を乗せる。", en: "Quiet is fine. I put my ideas and my passion into a few words." },
    { id: "me-61", domain: "me", part: "⑩ 価値観のことば", ja: "私は、楽をしたい人ではありません。挑みたい人です。", en: "I'm not looking for an easy life. I want a challenge." },
    { id: "me-62", domain: "me", part: "⑩ 価値観のことば", ja: "使命は突然湧くものではなく、ご縁と経験の中で見つかるものです。", en: "A mission doesn't just appear. You find it through people and experience." },
    { id: "me-63", domain: "me", part: "⑩ 価値観のことば", ja: "1ミリでも成長があれば、それでいい。", en: "Even one millimeter of growth is enough." }
  );
  window.HANASERU_CARDS = (window.HANASERU_CARDS || []).concat(M);
})();
