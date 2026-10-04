# 2026-10-04 【Codex】英文と会話練習の全体見直し

対象：共通教材542件＋聞き取りフレーズ10件＝既存552件。聞き取り本文11本も読み、診療本文の変更を対応カードと合わせた。BA機内アナウンス5本は聞き取り原文として保持。

個人クラウド保存文（state.mine）はFirebase再認証待ちで取得できていないため、この「全件」に含まない。前日の発熱説明の個別修正は保持。本番公開・個人保存文確認は認証後に続ける。

## 方針

- 小森先生の言いたい意味、比喩、温かさを保つ。感情を受け止め、理由を伝え、一緒に次を決める。
- 一息で言えるまとまりを基本に、and / but / because / so / if で関係を残す。機械的な短文化はしない。
- 既に自然で明快な文は保持。旅行の定型表現・表示語・相手の質問を無理に医師の話し方にしない。
- 文法の難しさでB2を演出しない。意見＋理由、質問への応答、言い換えを実際に使う練習を足す。
- 診断・処方は言語編集で決定しない。下の「臨床文脈の確認」は承認済みの臨床情報という意味ではない。

## 変更

既存108件を改訂、18件を追加。全件の対照データは `english-review-2026-10-04.json`。idを変更せず学習記録を保持。

- 「会話をつなぐ18表現」：心配を聞く、家庭で実行できるか確認、理解を確認、通訳、理由、丁寧な異論、具体例、別案、言い直し。
- 音をまねる画面に一文ごとの再生。必要な箇所だけ繰り返したあと全文へ戻る。
- 4段階目に相手の英語の問いを表示・再生。返答の手がかりは任意。見た場合は自力で返せた扱いにしない。
- 終了後「質問からもう一度」で問いを変え、すぐに再挑戦。同日反復で記憶の評価を水増ししない。
- 紹介状・救急紹介の語句を診療に正しく分類。「（相手に）」の質問は発話対象に、「（相手）」の返事や乗務員のアナウンスは自動発話対象から外す。
- AI生成の方針も、短さだけでなく温かさと意味のつながりを優先。文体の例から治療選択を切り離す。

## 使い方

忙しい日：1文だけ、聞く→まねる→見ずに言う。1回の行動で継続記録。
普段：自分の使いたい3文で、最後に問いに答える。時間があれば質問から再挑戦。
週に一度：同じ表現をAIとのやりとりで使い、予想していない問いにも理由・言い換えで返す。実生活で使えたら自分のことば帳に記録する。
空いた日は取り戻す課題を積まない。録音はその場で聞き比べる用途で、発音の自動採点は実装していない。

## 根拠と限界

シャドテン自身はリスニング向上を主目的と説明している。音を聞き比べる手順を参考にしつつ、発話の目標には想起・応答・変化をつけた反復を組み合わせた。人による音声添削を再現した機能ではない。
- https://shadoten.com/faq.html
- https://shadoten.com/shadowing-method.html
- CEFRのB2は範囲・正確さ・流暢さ・対話・つながり等で見る。カード数や継続日数からB2を認定しない。https://www.coe.int/en/web/common-european-framework-reference-languages/table-3-cefr-3.3-common-reference-levels-qualitative-aspects-of-spoken-language-use
- 同じ課題の反復と間を空けた練習の研究は設計の参考。個人の最短到達期間を保証しない。https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/effects-of-distributed-practice-on-second-language-fluency-development/4F6787916C198376CAD222934D3B37E4

## 臨床文脈・事実の確認候補

ここでは日本語原文の診療内容を自動的に書き換えていない。特に喘息の見通し、胃腸炎の補水、薬剤の間隔・量、数値の解釈は個別症例に合わせて確認したい。
参考：喘息診断は症状の経過・鑑別・治療反応等を総合する（[GINA 2026](https://ginasthma.org/wp-content/uploads/2026/05/GINA-2026-Strategy-Report-WMS.pdf)）。小児胃腸炎の経口補水は少量頻回が基本で、通常のミルク再開も含む（[NICE CG84](https://www.nice.org.uk/guidance/cg84/chapter/Recommendations)）。解熱薬の投与方法は薬剤・体重等に合わせる（[AAP](https://www.healthychildren.org/English/health-issues/conditions/fever/Pages/Medications-Used-To-Treat-Fever.aspx)）。

- `med-ast-4`：「本当の喘息ではない」の対象・年齢・診断条件を明示したい。
- `med-ast-14`：3回以上＋吸入反応だけで診断が完結するように聞こえる。適用条件の確認が必要。
- `med-ast-15`：「ごくわずか」の対象集団と根拠を確認したい。
- `med-ast-17`：炎症治療と成長による改善の因果関係が強く聞こえる。
- `med-ast-18`：長期治療が必要な割合を一般化しない。
- `med-gi-2`：「半日」は飲水中断と誤解され得る。少量頻回の経口補水との整合を院長確認。
- `med-gi-6`：乳製品を控える対象条件を確認。NICEは通常のミルク再開を含めて推奨。
- `med-gi-7`：数日食べられない場合の安全性は脱水・全身状態などに依存する。
- `med-hf-7`：薬剤名・処方量がない。投与間隔や回数は薬ごとに確認する。
- `med-sz-1`：「大丈夫」の保証が強い。救急受診条件の説明と一緒に用いる。
- `visit-04`：聴診だけで肺炎を否定する趣旨に聞こえないよう、症例の文脈を確認する。
- `gut-01`：食事が無関係という断定は症例による。本人を責めない意図と医学的断定を分ける。
- `gut-02`：病気でない・生まれつきという説明の適用対象を確認する。
- `gut-07`：便失禁を一律に病気でないと説明しない。
- `gut-10`：5分以内という効き方の保証と処方対象を確認する。
- `gut-11`：例示された30mlは処方例。体重・年齢等を伴わず実用しない。
- `gut-13`：薬剤名・対象がないので、長期間使用できる薬全般と読まれないようにする。
- `gut-14`：便量や排便時間の目標は個別の計画を確認する。
- `gut-25`：腎機能だけで安全性を判断できるという保証、採血不要の範囲、薬剤名を確認。
- `gut-27`：直後に元気ならトラウマにならない、という保証は見直し候補。
- `gut-38`：乳児の排便困難すべてに使わず、診断した状態に合わせる。
- `gut-39`：綿棒刺激の適応と方法を伴う説明が必要。
- `nut-08`：フェリチンが最重要となる対象を確認。栄養評価全般の断定にしない。
- `nut-09`：フェリチン・ヘモグロビンの解釈には病態の文脈が必要。
- `nut-11`：症状が改善するまで数値を上げる、という目標設定の条件を確認。
- `nut-12`：「8割」は何の8割か、根拠と対象の確認が必要。
- `nut-15`：両手のひらサイズはたんぱく質そのものの重量ではなく食品の量。年齢・対象を確認。
- `nut-19`：中止する対象サプリと判断者を明示したい。
- `nut-25`：夜間低血糖は未確認の可能性として保った。診断された事実には変えない。
- `me-37`：5,000組が実人数・延べ受診数のどちらかは今回確認していない。

## 改訂した英文の対照

### sign-07

一緒に様子を見ていきましょう。

旧：Let's watch how she does. We'll do it together.

新：Let's keep an eye on how she's doing together.

### sign-10

焦らず、少しずつ良くしていきましょう。

旧：No rush. Let's get her better step by step.

新：There's no rush. Let's help her get better, step by step.

### med-intro-1

私は小児外科医です。子どものお腹と栄養を診ています。

旧：I'm a pediatric surgeon. I take care of children's tummy problems and nutrition.

新：I'm a pediatric surgeon. I look after children with tummy problems and help with their nutrition.

### med-intro-2

今日はお子さんの状態を説明して、一緒に方針を決めましょう。

旧：Today, I'll explain how she is doing. Then we'll decide the plan together.

新：Today, I'll explain how she's doing. Then we'll make a plan together.

### med-ast-1

熱と咳、ゼーゼーが続いて、ご心配ですよね。

旧：She has had fever, cough, and wheezing. You must be worried.

新：She's had a fever, a cough, and wheezing. I can understand why you're worried.

### med-ast-6

クリニックで吸入をしました。気道を広げて楽にする薬です。

旧：We did a nebulizer treatment here. It opens the airways. It makes breathing easier.

新：We gave her a nebulizer treatment here. The medicine opens her airways and helps her breathe more easily.

### med-ast-10

炎症をしっかり取ってリセットすると、本人も楽になり、次のゼーゼーの予防にもなります。

旧：Once we clear the inflammation, her airways get a reset. She feels better. And it helps prevent the next wheezing.

新：Treating the inflammation gives her airways a chance to recover. It helps her feel better and helps prevent another episode of wheezing.

### med-ast-16

その都度、風邪の治療と、敏感になった気道の治療をしっかり行います。

旧：Each time, we treat the cold. And we treat the sensitive airways.

新：Each time, we treat her cold and help calm her sensitive airways.

### med-med-1

今の風邪薬は続けてください。今日、追加でお出しします。

旧：Please keep giving the current cold medicine. I'll give you more today.

新：Please keep giving her the cold medicine she's taking now. I'll prescribe some more today.

### med-med-4

まずは熱が下がるか、鼻や胸の症状が良くなるかを見ていきましょう。

旧：First, let's see if the fever comes down. And let's see if her nose and chest get better.

新：First, let's see if her fever comes down and her nose and chest symptoms improve.

### med-fev-2

今は、体が初めてのウイルスに出会って、免疫を一つずつ学んでいる最中です。

旧：Right now, her body is meeting new viruses for the first time. It's building immunity one by one.

新：Her body is meeting these viruses for the first time. It's learning to fight them, one by one.

### med-fev-4

完治を狙わなくて大丈夫。つらい症状を楽にしながら、根気よく付き合いましょう。

旧：We don't need a perfect cure. Let's ease the hard symptoms. And let's be patient together.

新：We don't have to get rid of every symptom. Let's help her feel more comfortable and take it one step at a time.

### med-gi-4

一気に飲ませると、また吐きやすいので、少しずつ。

旧：If she drinks a lot at once, she will throw up again. So, little by little.

新：If she drinks a lot at once, she may throw up again. So give her a little at a time.

### med-gi-5

水分が取れたら、お粥やうどんなど消化のいいものから。

旧：When she can keep fluids down, start with easy foods. Rice porridge or noodles are good.

新：Once she can keep fluids down, start with foods that are easy to digest, like rice porridge or noodles.

### med-con-1

便が硬いこと＝便秘、とは限りません。大事なのは、すっきり出し切れているかです。

旧：Hard stool does not always mean constipation. The important thing is, can she empty out completely?

新：Hard stools don't always mean constipation. What matters is whether she can empty her bowels fully.

### med-con-2

まず、直腸にたまったうんちを、しっかり出し切ることから始めます。

旧：First, we empty the stool that has built up in the rectum.

新：First, let's clear out the stool that's built up in her rectum.

### med-con-6

毎日しっかり出すことで、腸のセンサーと押し出す力を取り戻します。

旧：By emptying every day, her bowel gets back its sensation and its pushing power.

新：Emptying her bowels every day helps her regain the feeling that she needs to go, and the strength to push the stool out.

### med-con-9

硬い便で切れると、痛くて我慢して、もっと便秘になります。その悪循環を断ちます。

旧：Hard stool can cause a tear. It hurts, so she holds it in. Then it gets worse. We break that cycle.

新：Hard stools can cause a small tear. Because it hurts, she holds her stool in, which makes the constipation worse. Let's break that cycle.

### med-con-10

今、お子さんがどのステップにいるかを見ながら進めます。

旧：We check which step she is at now. Then we move forward.

新：We'll check where she is in her treatment and decide the next step together.

### med-hf-4

何度で使うかより、「つらそうかどうか」で決めてください。

旧：Don't go by the number. Go by how she looks.

新：Decide by how uncomfortable she seems, not just the temperature.

### med-hf-5

水分が取れないくらいつらい時、眠れない時に使ってください。

旧：Use it when she is too uncomfortable to drink. Or when she can't sleep.

新：Give it if she's too uncomfortable to drink or sleep.

### med-sz-3

吐いたら、窒息しないよう、体ごと顔を横向きに。

旧：If she vomits, turn her whole body to the side. So she doesn't choke.

新：If she vomits, turn her whole body onto her side so she doesn't choke.

### med-exam-6

（子へ）今度はお耳を見るね。じっとしててね。

旧：Now let me look in your ears. Hold still.

新：Now I'll look in your ears. Can you stay still for me?

### med-exp-3

（親へ）診断は、いわゆる風邪です。

旧：The diagnosis is a common cold.

新：She has a common cold.

### med-swab-3

（子へ）力を抜いて、リラックスしてね。

旧：Just relax your body.

新：Try to relax for me.

### med-swab-4

（子へ）細い綿棒が、ゆっくり入るよ。

旧：A thin swab is going in slowly.

新：I'll gently put this thin swab into your nose.

### med-flu-2

（親へ）全身の状態も、呼吸も問題ありません。

旧：Her overall condition is fine. Her breathing is fine too.

新：She looks well overall, and she's breathing comfortably.

### med-flu-3

（親へ）ただ、熱が続いているのと、流行もあるので、念のため検査しておきましょう。

旧：But the fever has continued, and these are going around. So let's test, just to be safe.

新：But she still has a fever, and flu and COVID are going around. Let's do the tests to be safe.

### med-flu-4

（親へ）インフルエンザが陽性なら、抗インフルエンザ薬を出します。

旧：If the flu test is positive, I'll prescribe anti-flu medicine.

新：If the flu test is positive, I'll prescribe medicine to treat the flu.

### med-flu-7

（親へ）おうちで、しっかり良くなるまで様子を見てください。

旧：Please watch how she's doing at home until she's fully better.

新：Please keep an eye on her at home until she's fully better.

### med-flu-8

（親へ）登園・登校は、園や学校の基準に従えば大丈夫です。

旧：For daycare or school, please follow their rules.

新：She can go back to daycare or school when she meets their return requirements.

### med-flu-9

（親へ）熱が下がらない、ぐったりしている、息が苦しそうなときは、また受診してください。

旧：Please come back if the fever doesn't come down, she is very weak, or she has trouble breathing.

新：Please bring her back if the fever doesn't come down, she seems very weak, or she's having trouble breathing.

### tr-axis-2

英語まだ勉強中で。少しゆっくり話してもらえますか？

旧：I'm still learning English — could you slow down a little?

新：I'm still learning English. Could you speak a little more slowly?

### tr-axis-3

うまく聞き取れなくて。もう一回いいですか？

旧：Sorry, I didn't quite catch that — could you say it again?

新：Sorry, I didn't quite catch that. Could you say it again?

### tr-axis-4

念のため、もう一つだけ確認させて。

旧：Just to be sure — one more thing.

新：Could I check one more thing, just to be sure?

### tr-hotel-1

チェックインお願いします。小森で予約してます。

旧：Hi, I'd like to check in — it's under Komori.

新：Hi, I'd like to check in. The reservation is under Komori.

### tr-hotel-2

エレベーターでカードキーが反応しないんです。直してもらえますか？

旧：My key card isn't working in the elevator — could you sort it out for me?

新：My key card isn't working in the elevator. Could you help me with it?

### tr-hotel-3

朝食って何時からですか？

旧：What time's breakfast?

新：What time does breakfast start?

### tr-beer-1

ビールは何がありますか？軽めのと、しっかりめのと。

旧：What beers do you have? Anything light, or something a bit stronger?

新：What beers do you have? I'd like to hear about a light one and a fuller-bodied one.

### tr-chat-5

また連絡取れたら。番号交換しません？

旧：Let's keep in touch — want to swap numbers?

新：I'd like to keep in touch. Shall we exchange numbers?

### tr-chat-6

会えてよかった。良い旅を！

旧：Really nice meeting you — safe travels!

新：It was really nice meeting you. Have a great trip!

### tr-rec-1

ごめん、もう一回いい？

旧：Sorry, say that again?

新：Sorry, could you say that again?

### tr-trn-3

〜へは、何番線ですか？

旧：Which platform is it for ___?

新：Which platform does the train to ___ leave from?

### tr-dir-2

ただ、快速と各駅停車があります。早く行きたいなら快速に乗ってください。

旧：There are rapid and local trains, though — if you want to get there faster, take the rapid one.

新：There are express trains and local trains. If you want to get there faster, take an express train.

### tr-dir-7

乗り換えを減らしたいなら、京急線の直通電車もあります（本数は少なめです）。

旧：If you'd rather have fewer transfers, some Keikyu trains go straight through to Narita.

新：If you'd like fewer transfers, some Keikyu trains go straight through to Narita. They don't run as often, though.

### mine-2

今日は一日曇りだけど、今日も含めて今週は雨が降りやすいみたいだよ。

旧：It's going to be cloudy all day today, but it looks like we're in for a rainy week — today included.

新：It'll be cloudy all day today. It looks like there's a good chance of rain throughout the week, including today.

### mine-3

この荷物はいったんフランクフルトで受け取りたいので、フランクフルトまで預けてください。

旧：We'd like to collect our baggage in Frankfurt first. So, please check our baggage only to Frankfurt.

新：We'd like to collect our bags in Frankfurt first. Please check them only as far as Frankfurt.

### trip-s03

乗り継ぎはどちらですか？

旧：Where are the Flight Connections?

新：Which way is it for connecting flights?

### trip-c13

観光と、息子を迎えに来ました。

旧：I'm here for tourism and to pick up my son.

新：I'm here to do some sightseeing and pick up my son.

### trip-t02

来て2日目です。全部で1週間滞在します。

旧：I've been here for two days. I'm here for a week in total.

新：This is our second day here. We're staying for a week in total.

### visit-09

なので、クリニックで吸入をしていきましょう。

旧：So, let's do nebulizer treatments here at the clinic.

新：Let's give her a nebulizer treatment here at the clinic.

### visit-11

おうちでお薬を飲んで良くなれば、それでおしまいです。

旧：If she gets better with the medicine at home, that's it. You don't need to come back.

新：If she gets better with the medicine at home, she won't need another visit.

### asth-03

なので、喘息の予防薬を、もう一度始めましょう。

旧：So, let's start her asthma prevention medicine again.

新：Let's restart the medicine that helps prevent her asthma symptoms.

### asth-06

それでも落ち着かないときは、ネブライザーの吸入を足します。

旧：If it still doesn't settle, we'll add nebulizer treatments.

新：If her symptoms still don't settle, we'll add nebulizer treatments.

### asth-07

ステロイドと、気管支を広げる薬を、一緒に吸入します。

旧：She breathes in a steroid and a medicine that opens the airways, together.

新：The nebulizer gives her two medicines together: a steroid and a medicine that opens her airways.

### asth-11

しばらくは、様子を見ていきましょう。

旧：Let's watch how she does for a while.

新：Let's keep an eye on how she's doing for a while.

### asth-12

定期的にチェックしながら、お薬は続けていきましょう。

旧：Let's keep the medicine going. And I'll check her regularly.

新：Let's continue her medicine and check on her regularly.

### refer-03

ここでできる治療では足りないので、大きな病院に紹介します。

旧：She needs more treatment than we can do here. So I'm referring her to a big hospital.

新：She needs treatment we can't provide here. I'm referring her to a larger hospital.

### refer-07

これが紹介状です。病院の受付で渡してください。

旧：This is the referral letter. Please give it to the front desk.

新：Here's the referral letter. Please give it to the staff at reception.

### refer-13

でも、早めに行くのが一番安全です。

旧：But going early is the safest.

新：Getting her there promptly is the safest option.

### gut-04

直腸が、ふくらませ続けた風船のように伸びてしまっています。

旧：The rectum is stretched. Like a balloon that was blown up again and again.

新：Her rectum has stretched, like a balloon that's been kept inflated.

### gut-05

それで便意のセンサーが鈍くなって、気づかないうちにたまっていくんです。

旧：So the sensor that tells her to go is dull. Stool builds up, and she doesn't notice.

新：That makes it harder for her to feel when she needs to go. Stool builds up without her noticing.

### gut-06

今は黄色信号です。悪くはないけれど、もったいない状態です。

旧：Right now, it's a yellow light. It's not bad. But it could be much better.

新：It's like a yellow traffic light. Things aren't bad, but there's room for improvement.

### gut-08

最優先は、毎日出すリズムを作ることです。

旧：First, we build a daily rhythm. Poop every day.

新：Our first priority is to help her get into a routine of having a bowel movement every day.

### gut-15

急にやめると、また出なくなります。安定してから、少しずつ減らしましょう。

旧：If you stop suddenly, it will build up again. Once she's stable, we reduce it slowly.

新：If we stop suddenly, the stool will build up again. Once things are stable, we'll reduce the treatment gradually.

### gut-18

嫌がる時間を短くするのが、一番のやさしさです。

旧：Keep the unpleasant part short. That is the kindest thing.

新：Keeping the uncomfortable part short is the kindest thing we can do.

### gut-20

次回も、エコーで一緒に確認しましょう。

旧：Next time, let's check again with the ultrasound together.

新：Next time, let's look at the ultrasound together and see how things are going.

### gut-24

本当に大きな前進です。これからも一緒に見ていきましょう。

旧：This is real progress. Let's keep watching her together.

新：That's a big step forward. Let's keep following her progress together.

### gut-26

（Q 食事で治せない？）食事や水分だけでは、頑張ったほどの効果は出ません。無理はしなくていいですよ。

旧：Food and water alone don't help as much as you hope. You don't need to push too hard.

新：Changing her diet and giving more fluids may not help as much as you'd hope on their own. You don't have to push yourself too hard.

### gut-33

まずは、痛くなく出る体験を作りましょう。

旧：First, let's give her a poop that doesn't hurt.

新：First, let's help her have a bowel movement without pain.

### gut-37

毎日、家で必ず出せる時間を作りましょう。

旧：Let's make a time every day when she can poop at home.

新：Let's set aside time every day for her to use the toilet at home.

### nut-01

病気ではないけれど、本来の力が出せない。もどかしいですよね。

旧：It's not an illness. But she can't do her best. That must be frustrating.

新：She's not ill, but she isn't feeling her best. I can understand how frustrating that is.

### nut-03

細胞がエネルギーを作る「バッテリー」が足りていないのかもしれません。

旧：Her cells may not have enough battery to make energy.

新：Her cells may not have what they need to make energy. It's a bit like running low on battery power.

### nut-04

血糖値が急に上がって一気に下がる、ジェットコースターのような動きです。

旧：Her blood sugar goes up fast and drops fast. Like a roller coaster.

新：Her blood sugar rises quickly and then drops sharply, like a roller coaster.

### nut-07

「基準範囲内」は、「ちょうど良い」という意味ではありません。

旧：Within the normal range does not mean just right.

新：Being within the normal range doesn't always mean it's the right level for her.

### nut-15

毎食、その子の両手のひらに乗るくらいのタンパク質が目安です。

旧：At every meal, aim for protein about the size of her two palms.

新：At each meal, aim for a portion of protein-rich food about the size of her two palms.

### nut-17

サプリは、自分の食事で足りるようになるまでの、一時的な補助輪です。

旧：Supplements are temporary training wheels. Until she gets enough from food.

新：Supplements are like training wheels. They're temporary support until she can get enough from food.

### nut-20

2〜3週間後に結果が出たら、一緒に方針を決めましょう。

旧：The results come in two to three weeks. Then let's decide the plan together.

新：When the results come back in two or three weeks, we'll make a plan together.

### nut-22

3か月から半年で、「変わってきた」と感じられるのが目標です。

旧：The goal is that you notice a change in three to six months.

新：Our goal is for you to notice a change in three to six months.

### nut-24

完璧を目指さず、できそうなことを一つ試してみましょう。

旧：Don't aim for perfect. Let's try one thing you can do.

新：It doesn't have to be perfect. Let's try one thing that feels manageable.

### nut-25

夜中に血糖が下がって、朝起きる力が出ないのかもしれません。

旧：Her blood sugar may drop during the night. So she has no energy in the morning.

新：Her blood sugar may be dropping during the night. That could be why she has so little energy in the morning.

### nut-26

寝る前のジュースやゼリーは、やめてみましょう。

旧：Let's stop juice and jelly before bed.

新：Let's try avoiding juice and jelly before bed.

### me-02

機械いじりが好きで、何かを作るのが好きでした。

旧：I loved taking machines apart. I loved making things.

新：I loved tinkering with machines and making things.

### me-03

医学部のとき、小児外科に「作る未来」を感じました。

旧：In medical school, I felt pediatric surgery had a creative future.

新：In medical school, I saw pediatric surgery as a way to help build a child's future.

### me-08

もっと手前で、できることがあるのではないか。

旧：I thought, there must be something we can do earlier.

新：I began to wonder if there was more we could do before children got to that point.

### me-11

細胞も、元気も、栄養から作られます。

旧：Our cells are made from nutrition. So is our energy.

新：The food we eat provides what our bodies need to build cells and make energy.

### me-12

病気の治りやすさも、風邪のひきにくさも、心の健康も、栄養と関係しています。

旧：How fast we recover, how often we catch colds, even our mood. Nutrition is behind all of them.

新：Nutrition is linked to how well we recover, how often we catch colds, and our mental health.

### me-13

「病気ではないけれど元気がない」子の多くが、栄養の視点で説明できるようになりました。

旧：Many children are not sick, but not well either. Nutrition explains a lot of that.

新：Looking at nutrition helped me understand many children who weren't ill but still didn't feel well.

### me-16

これを日本中に広めていきたいと思っています。

旧：I want to spread this across Japan.

新：I'd like to share this approach with people across Japan.

### me-18

原則に沿って生きること。感謝すること。

旧：Living by principles. Being grateful.

新：I try to live by my principles and remember to be grateful.

### me-19

助け合い、分かち合うこと。

旧：Helping each other. Sharing.

新：I believe in helping each other and sharing what we have.

### me-20

そして、成長や感動の喜びを世界に伝えること。それが私のミッションです。

旧：And sharing the joy of growing and being moved. That's my mission.

新：My mission is to share the joy of growth and the experiences that move us, with people around the world.

### me-22

その視点を広げて、もっと多くの人の心と体を支えたいです。

旧：I want to use that to support more people, in body and mind.

新：I'd like to broaden my perspective and help more people care for both their body and mind.

### me-24

だから今は、いろいろな場所に行って、刺激を受けることも大事にしています。

旧：So now, I also want to travel more, and see new things.

新：So now I also make time to travel, see new places, and find inspiration.

### me-26

不器用でもいい。要領が悪くてもいい。

旧：It's okay to be clumsy. It's okay to be slow.

新：It's okay if things don't come easily. It's okay to take the long way round.

### me-27

でも、正直に、誠実に生きることが大事です。

旧：But be honest. Live with integrity. That's what matters.

新：What matters to me is living honestly and treating people with sincerity.

### me-28

そして、本物を見分ける目を持つこと。

旧：And know what is real when you see it.

新：And I want to be able to recognize what's real and worthwhile.

### me-37

便秘の子どもを、年間5,000組ほど診ています。

旧：I see about 5,000 children a year for constipation.

新：I see about 5,000 children and their families a year for constipation.

### me-42

焦らず、今のペースで大丈夫です。

旧：No rush. Your pace is fine.

新：There's no rush. We can go at your pace.

### me-43

引き続き、一緒に見ていきましょう。

旧：Let's keep watching her together.

新：Let's keep following her progress together.

### me-44

ゴールは、医療に頼らなくていい状態＝卒業です。

旧：The goal is to graduate. To not need us anymore.

新：The goal is for her to graduate from our care, so she no longer needs medical support.

### me-45

農場と同じです。今日タネをまいても、明日には実りません。

旧：It's like a farm. You plant a seed today. It doesn't grow by tomorrow.

新：It's like farming. You can't plant seeds today and expect a harvest tomorrow.

### me-52

本当の健康を土台に、一人ひとりが自分らしく人生を楽しめるように。

旧：Real health is the base. Then each person can enjoy life in their own way.

新：Good health is the foundation. I want each person to enjoy life in their own way.

### me-56

可能性は見捨てない。信頼は行動で見る。

旧：I never give up on someone's potential. And I judge trust by actions.

新：I don't give up on people's potential. But I look at what they do to decide whether I can trust them.

### me-58

原則には厳しく、人にはやさしく。

旧：Strict with principles. Kind to people.

新：I hold firmly to my principles, but I try to treat people with kindness.

### me-59

作品で導く。生き方は強いない。

旧：I lead by what I make. I don't tell people how to live.

新：I try to lead through my work. I don't force my way of life on others.

### me-62

使命は突然湧くものではなく、ご縁と経験の中で見つかるものです。

旧：A mission doesn't just appear. You find it through people and experience.

新：You don't find your purpose overnight. You find it through the people you meet and the things you experience.

### me-63

1ミリでも成長があれば、それでいい。

旧：Even one millimeter of growth is enough.

新：Even a millimeter of growth matters to me.

