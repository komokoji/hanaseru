/* 📻 長い話：一人の人が1分ほど話し続ける英語を、区切って聞いて要点をつかむ練習。
   2026-11-25 院長「こういう長い文章が理解できる練習もしたい」「自分が好きなサイトの英語がまず理解できる」
   ・院長の好きな話題（航空・旅・医療の現場まわり）で書いた創作の話。実在の人物・動画・サイトの文章を写していない。
   ・数字や仕様は説明のための架空の例で、実在の機体や製品のデータではない。
   ・1本＝3つの区切り。区切りごとに「要点」を日本語の3択で確かめる（保持の練習）。最後に通しで聞く。 */
(function (root) {
'use strict';
root.HANASERU_TALKS = (root.HANASERU_TALKS || []).concat([
{ id: 'talk-jet-load', topic: '航空', title: '小さなジェット機に、どれだけ積めるか', speaker: '自家用機のパイロット（女性・米国）', voice: 'en-US-Neural2-F',
  parts: [
    { en: "People often ask me how much we can actually carry in a small jet like this. The honest answer is, it depends on how far we're going. Every airplane has a maximum weight for takeoff, and everything on board counts toward it: the people, the bags, and the fuel.",
      ja: '小さなジェット機にどれだけ積めるかとよく聞かれる。正直な答えは「どこまで飛ぶかによる」。離陸できる重さには上限があり、人も荷物も燃料も、全部その中に数える。',
      q: 'どれだけ積めるかは、何によって決まると言っていますか。', options: ['どこまで飛ぶか（燃料も重さに数えるから）', '座席の数と荷物室の大きさ', 'その日の天気と風向き'], answer: 0 },
    { en: "So here's the trade-off. If I fill the tanks all the way up, I can fly a long way, but I can only take two or three people with light bags. If I've got a full cabin, I have to leave some fuel behind, which means we'll need to stop somewhere along the way.",
      ja: 'ここが兼ね合い。燃料を満タンにすれば遠くまで飛べるが、乗せられるのは軽い荷物の2〜3人だけ。満席なら燃料を減らす必要があり、途中でどこかに降りることになる。',
      q: '満席で飛ぶときは、どうなると言っていますか。', options: ['荷物を別の便で送ることになる', '燃料を減らすので、途中で一度降りることになる', '速度を落として、ゆっくり飛ぶことになる'], answer: 1 },
    { en: "What I do before every trip is add it all up. I ask everyone what they weigh, I weigh the bags, and then I work out how much fuel that leaves me. It's not the most exciting part of flying, but honestly, it's the part that keeps us safe.",
      ja: '毎回、出発前に全部を足し算する。全員の体重を聞き、荷物を量り、それで燃料をどれだけ積めるかを出す。いちばん楽しい作業ではないが、安全を守っているのはここ。',
      q: '出発前に、いつもすることは何ですか。', options: ['天気を見て、行き先を決め直す', '乗る人に、荷物を減らすよう頼む', '人と荷物の重さを足して、積める燃料を出す'], answer: 2 }
  ],
  note: 'it depends on … / here\'s the trade-off / which means … / What I do is … が、長い話の道しるべ。聞こえたら「次は理由か、まとめが来る」と構える。' },
{ id: 'talk-preflight', topic: '航空', title: '離陸の前に、機体のまわりを歩く理由', speaker: '飛行教官（男性・英国）', voice: 'en-GB-Neural2-B',
  parts: [
    { en: "Before I get into the airplane, I always walk around it. It only takes about ten minutes, and I do it in the same order every single time. That way, I don't have to remember what comes next. My feet just take me there.",
      ja: '乗り込む前に、必ず機体のまわりを歩く。10分ほどで、毎回同じ順番。そうすれば次が何かを思い出す必要がなく、足が勝手に連れていってくれる。',
      q: 'なぜ、毎回同じ順番で歩くのですか。', options: ['早く終わらせて、出発を急ぐため', '次に何を見るかを、思い出さなくて済むため', '同乗者に、手順を見せるため'], answer: 1 },
    { en: "I'm looking for anything that's different from yesterday. A drop of oil on the ground, a tyre that looks a bit flat, a bird's nest where there shouldn't be one. Most days, I find nothing at all. And that's exactly the point.",
      ja: '昨日と違うものを探している。地面の油の一滴、少し空気が抜けたタイヤ、あるはずのない鳥の巣。ほとんどの日は、何も見つからない。そして、それこそが大事な点。',
      q: '歩きながら、何を探していると言っていますか。', options: ['昨日と違っている所', '汚れていて、掃除が要る所', '新しく取り付けた部品'], answer: 0 },
    { en: "The one day I found something, it was a fuel cap that hadn't been put back on properly. It would've been easy to miss. So when a student tells me the walk-around is boring, I tell them boring is good. Boring means nothing is wrong.",
      ja: '一度だけ見つけたのは、きちんと閉まっていなかった燃料のふた。見落としやすいものだった。だから、生徒が「点検は退屈だ」と言うと、「退屈はいいことだ。何も問題が無いということだから」と答える。',
      q: '生徒が「退屈だ」と言ったとき、何と答えますか。', options: ['慣れれば、もっと速くできるようになる', '退屈なら、ほかの人に代わってもらえばいい', '退屈はいいこと。何も問題が無いということ'], answer: 2 }
  ],
  note: 'That way, … / And that\'s exactly the point. / So when … は、話し手が「ここが言いたいこと」と示す合図。would\'ve は「ウダヴ」と短い。' },
{ id: 'talk-carry-on', topic: '旅', title: '1週間の旅を、機内持ち込みだけで', speaker: '旅の動画を作っている人（女性・豪州）', voice: 'en-AU-Neural2-A',
  parts: [
    { en: "I used to check a big suitcase every time I flew. Then one trip, my bag didn't turn up for three days, and I ended up buying everything again. Since then, I've only ever travelled with a carry-on, even for a week or more.",
      ja: '以前は、飛ぶたびに大きなスーツケースを預けていた。ある旅で荷物が3日間届かず、結局すべて買い直すことになった。それ以来、1週間以上の旅でも機内持ち込みだけにしている。',
      q: '機内持ち込みだけにした、きっかけは何ですか。', options: ['預ける料金が、高くなったから', '預けた荷物が、3日間届かなかったから', '空港で、長く並ぶのが嫌だったから'], answer: 1 },
    { en: "The trick is to pack for three days, not for seven. I take three tops and two pairs of trousers that all go together, and I wash things in the sink halfway through. It sounds like a hassle, but it takes about ten minutes.",
      ja: 'こつは、7日分ではなく3日分を詰めること。どれとも合わせられる上を3枚と、ズボンを2本。途中で洗面台で洗う。面倒に聞こえるが、10分ほどで済む。',
      q: '荷造りのこつは何だと言っていますか。', options: ['3日分だけ詰めて、途中で洗う', '現地で、必要なものを買い足す', '重いものを、いちばん下に入れる'], answer: 0 },
    { en: "The other thing is shoes. Shoes take up more room than anything else, so I wear the heavy pair on the plane and pack one light pair. And honestly, once you've walked straight out of the airport while everyone else is waiting at the belt, you'll never go back.",
      ja: 'もう一つは靴。靴はほかの何よりも場所を取るので、重いほうを機内で履き、軽いのを1足だけ詰める。そして正直、みんなが荷物を待っている横を、そのまま空港から出ていく経験を一度したら、もう元には戻れない。',
      q: '靴は、どうしていると言っていますか。', options: ['現地で、安い靴を買う', '2足とも、かばんの外に結びつける', '重いほうを履いて乗り、軽い1足だけ詰める'], answer: 2 }
  ],
  note: 'I used to … / Since then, … で昔と今を分ける。The trick is … / The other thing is … は「要点が来る」合図。turn up＝届く、end up …ing＝結局…する。' }
]);
}(typeof window !== 'undefined' ? window : globalThis));
