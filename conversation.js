/* 会話を続けるための補助表現。必要な場面から本人が選ぶ。 */
(function () {
  var cards = [
    ['bridge-01','clinic','いちばん心配されているのは、どんなことですか？',"What worries you most?",'I have so many worries. Where should I start?','You look worried. What is on your mind?'],
    ['bridge-02','clinic','ご自宅で気づいたことを教えてください。',"Could you tell me what you've noticed at home?",'What would you like to know?','What information would help you?'],
    ['bridge-03','clinic','まだはっきりしない点もあります。一緒に経過を見ていきましょう。',"There are still some things we don't know. Let's keep an eye on how things develop together.",'Are you sure what is causing this?','Do we know everything we need to know yet?'],
    ['bridge-04','clinic','私の説明が分かりやすかったか確認したいので、家ですることを教えてもらえますか？',"Just to check that I've explained it clearly, could you tell me what you'll do at home?",'I think I understand the plan.','Is there anything else we should go over?'],
    ['bridge-05','clinic','この方法は、ご家庭で無理なく続けられそうですか？',"Do you think this plan will work for your family?",'Our mornings are very busy.','I am not sure we can manage all of this.'],
    ['bridge-06','clinic','説明が分かりにくくてすみません。言い方を変えますね。',"Sorry, I wasn't clear. Let me explain it another way.","I don't understand what you mean.",'Could you explain that more simply?'],
    ['bridge-07','clinic','大事な説明なので、必要なら通訳をお願いしましょう。',"This is important. Let's get an interpreter if we need one.","I'm having trouble following the explanation.",'Can we get some help understanding each other?'],
    ['bridge-08','clinic','どの薬を、いつ、どのくらい使ったか教えてください。',"Which medicine did you give, when did you give it, and how much did you give?",'I gave some medicine at home.','We tried a medicine before coming here.'],
    ['bridge-09','travel','静かな場所の方が好きです。ゆっくり話したいので。',"I'd prefer somewhere quiet because I'd like to talk and relax.",'Would you prefer a lively place or a quiet one?','What kind of restaurant would you like?'],
    ['bridge-10','travel','私の理解が合っていれば、ここで荷物を受け取るのですね？',"If I've understood correctly, we need to collect our bags here. Is that right?",'Your bags will be unloaded here.','You will need to collect your bags before your next flight.'],
    ['bridge-11','travel','その方法が難しければ、ほかにどんな選択肢がありますか？',"If that isn't possible, what other options do we have?",'Sorry, that flight is fully booked.','Unfortunately, we cannot offer a late checkout.'],
    ['bridge-12','travel','予約した内容と違うようです。一緒に確認してもらえますか？',"This seems different from what I booked. Could we check it together?",'Your reservation is for one night.','Your room has one single bed.'],
    ['bridge-13','me','そう考えるようになったきっかけは何ですか？',"What led you to think that way?",'My view has changed over the years.','I see things differently now.'],
    ['bridge-14','me','なるほど。私の経験では少し違いますが、お話はよく分かります。',"I see what you mean. My experience has been a little different, though.",'Everyone seems to have the same experience.','I think there is only one way to approach this.'],
    ['bridge-15','me','一つ例を挙げてもいいですか？その方が伝わりやすいと思います。',"Could I give you an example? I think that might make it clearer.",'What do you mean by that?','Could you tell me a little more?'],
    ['bridge-16','me','ぴったりの英語が出てこないので、どんなものか説明しますね。',"I can't find the right word in English. Let me describe it.",'What is it called?','What kind of thing do you mean?'],
    ['bridge-17','me','そこは同じ気持ちです。特に、家族の時間は大切ですね。',"I feel the same way, especially about making time for family.",'I try to make more time for my family now.','Spending time with family matters more to me these days.'],
    ['bridge-18','me','今のところはそう考えていますが、ほかの見方も聞いてみたいです。',"That's how I see it for now, but I'd like to hear other points of view.",'Are you certain about that?','Would you consider a different approach?'],
    // 一歩進んだ、普段よく使う言い方（2026-11-18 院長「普段からよく使われる、一歩進んだセンテンスも欲しい」）
    // ① 考えに理由を添える
    ['bridge-19','me','正直に言うと、ゆっくり回る方が好きなんです。その方がよく見えるので。',"To be honest, I'd rather take my time. I notice more that way.",'Do you like to see as much as possible when you travel?','Shall we try to fit in a few more places today?'],
    ['bridge-20','me','私の見方では、大事なのはどれだけやるかより、続けることです。',"The way I see it, it's not about how much you do. It's about keeping it up.",'How do you stay healthy with such a busy job?','I tried running every day, but I quit after a week.'],
    ['bridge-21','me','日によりますが、たいていは家で簡単なものを作ります。',"It depends on the day, but usually I cook something simple at home.",'Do you usually eat out?','What do you normally have for dinner?'],
    ['bridge-22','travel','気に入っているのは、歩いて回りやすいところです。',"What I like about it is that it's so easy to walk around.",'How do you like Barcelona?','What do you think of this area?'],
    ['bridge-23','me','それも、私が旅を好きな理由の一つです。',"That's one of the reasons I love traveling.",'Meeting new people is the best part of a trip, isn\'t it?','You learn so much when you see how other people live.'],
    // ② その場で返す
    ['bridge-24','me','いい質問ですね。少し考えさせてください。',"That's a good question. Let me think about that for a second.","What's the biggest difference between Japan and Europe?",'If you could live anywhere, where would it be?'],
    ['bridge-25','travel','本当ですか？どうしてそうしようと思ったんですか？',"Really? What made you decide to do that?",'I quit my job last year and opened my own café.','We moved here from London two years ago.'],
    ['bridge-26','travel','わかります。私も同じことがありました。',"I know what you mean. The same thing happened to me.",'Jet lag hit me on the second day.','I packed far too much for this trip.'],
    ['bridge-27','me','なるほど、それはそうですね。そういう見方はしていませんでした。',"That's fair. I hadn't thought of it that way.","For short trips, I think trains are better than planes. You don't have to wait at the airport.",'I prefer to leave some days unplanned so I can explore.'],
    ['bridge-28','travel','私はそれで大丈夫です。',"That works for me.",'Shall we meet at the station at ten?','How about dinner at seven?'],
    // ③ 言い換えて進む
    ['bridge-29','me','私が言いたいのは、小さな習慣の方が大きな変化より大事だということです。',"What I'm trying to say is, small habits matter more than big changes.","Sorry, I'm not sure I follow.",'So you think people should change everything at once?'],
    ['bridge-30','me','言い換えると、完璧でなくていいんです。',"In other words, we don't have to be perfect.",'So it\'s okay to miss a day sometimes?','That sounds like a lot of pressure.'],
    ['bridge-31','travel','なんと言えばいいか…少し、家に帰ってきたような感じです。',"How can I put this? It feels a bit like coming home.","What's it like to come back to a place you've visited before?",'How does it feel to be back here?'],
    // ④ ていねいに頼む・ぼかす・気持ちを言う
    ['bridge-32','travel','ここに座ってもかまいませんか？',"Would you mind if I sat here?",'This seat is free, by the way.',"It's busy in here today, isn't it?"],
    ['bridge-33','travel','夕食においしいお店を教えていただけないかと思いまして。',"I was wondering if you could recommend a good place for dinner.",'Is there anything else I can help you with?','Let me know if you need anything during your stay.'],
    ['bridge-34','travel','よくわからないのですが、たぶん次の駅だと思います。',"I'm not sure, but I think it's the next stop.",'Excuse me, do you know where to get off for the museum?','Which stop should we get off at for the old town?'],
    ['bridge-35','travel','とても楽しみにしています。',"I'm really looking forward to it.",'You\'re going to Frankfurt next? The Christmas markets are lovely.','Are you excited about the trip?']
  ];
  window.HANASERU_CARDS = window.HANASERU_CARDS.concat(cards.map(function(c){
    return {id:c[0],domain:'bridge',topic:c[1],ja:c[2],en:c[3],prompts:[c[4],c[5]]};
  }));
  // 同じ意図を、少し異なる問いへの返事として使う。診断・処方の条件は追加しない。
  window.HANASERU_RESPONSE_CUES = {
    'med-intro-1':["What kind of doctor are you?","What do you focus on in your practice?"],
    'med-intro-2':["What will we do during today's visit?","Could you explain the plan for today?"],
    'sign-01':["I'm really worried about my child.","This has been worrying me all week."],
    'sign-07':["Will you keep checking how she's doing?","What happens next?"],
    'med-hf-3':["Will this medicine cure the illness?","What is the fever medicine for?"],
    'med-hf-4':["Should I just look at the temperature?","How should I decide when to give it?"],
    'gut-29':["We've been trying so hard.","It has been a difficult few weeks."],
    'gut-31':["Is she just being lazy?","Why does she keep holding it in?"],
    'nut-24':["I'm worried I can't do everything perfectly.","I don't know where to start."],
    'me-01':["What were you like as a child?","Were you good at making things when you were young?"],
    'me-03':["Why did you choose pediatric surgery?","What interested you about pediatric surgery?"],
    'me-10':["What answer did you find?","What helped you see another way forward?"],
    'me-23':["How do you feel about your work-life balance?","Have you had enough time for yourself?"],
    'me-24':["What do you want to make more time for now?","Why is travel important to you now?"],
    'me-64':["What do you do?","What kind of work do you do back in Japan?"],
    'me-65':["What do you focus on at your clinic?","Do you have a specialty?"],
    'me-66':["Constipation? Is that a big problem for children?","What made you focus on constipation?"],
    'me-67':["Have you written anything about it?","How do you share your ideas with parents?"],
    'me-68':["Are you working on any technology for your clinic?","Are you working on anything with AI?"],
    'me-69':["What do you hope to achieve with AI?","How do you hope AI will help your clinic?"],
    'me-71':["Sorry, what do you mean?","I'm not sure I follow."],
    'me-36':["What is your clinic like?","What does your clinic focus on?"],
    'me-38':["Why did you change the focus of your work?","What do you mean by moving upstream?"],
    'me-41':["Why does nutrition matter to you?","How do you see the role of nutrition?"],
    'me-61':["Would you prefer an easier life?","Are you looking for a quieter life now?"],
    'tr-hotel-1':["Hello. How can I help you?","Welcome. Do you have a reservation?"],
    'tr-hotel-8':["What kind of room would you prefer?","Do you have any preferences for your room?"],
    'tr-imm-4':["What's the purpose of your visit?","Why are you visiting, and for how long?"],
    'tr-chat-4':["Where are you from, and what do you do?","Could you tell me a little about yourself?"],
    'trip-s06':["How long are you staying in Germany?","How many nights will you spend in Germany?"],
    'trip-s12':["The connection is through that corridor, past the next checkpoint.","You'll need to go downstairs and then follow the signs to the other terminal."],
    'trip-t09':["How are you finding it here?","Are you enjoying your stay?"],
    'trip-t17':["What brings you here?","Why are you visiting Spain?"],
    'bs-06':["What do you do, and where are you from?","Could you introduce yourself?"],
    'bs-15':["I hope that was useful.","Did that help?"],
    'bs-31':["It's been a really difficult week.","Things haven't been easy lately."]
  };
})();
