/* Personal speaking material approved for inclusion and publication, 2026-11-24.
   Career facts come from the user; intentions are practice wording, not proven outcomes. */
(function () {
  'use strict';
  function t(heard, ja, intent, en, chunks, transfer) {
    return {heard:heard, heardJa:ja, intent:intent, en:en, chunks:chunks,
      note:'区切りごとにまねる → 一文を3〜5回 → 手本を閉じて返す。回数は目安です。言い換えもOK。', transfer:transfer};
  }
  function scene(id,title,goal,turns,challenge) {
    return {id:id,track:'personal',title:title,role:'初めて会う相手',
      context:'自分の仕事・本・考えを話す練習。まず返答し、詰まる表現だけ手本で練習します。',goal:goal,turns:turns,challenge:challenge};
  }
  window.HANASERU_SCENES.push(
    scene('personal-now','まずここから：現在の診療と小児外科の経験','今の仕事 → 専門の背景 → 経験の生かし方を話す',[
      t('What do you do now?','今はどんなお仕事ですか？','東京のクリニックで一般診療と専門診療を行っている。',
        'I run a children’s clinic in Tokyo, where I provide both general and specialist care.',
        ['I run a children’s clinic','in Tokyo','where I provide both','general and specialist care'],
        'I provide both … and … を使い、二つの診療を説明する。'),
      t('What is your medical background?','専門的な背景を教えてください。','小児外科の経験を短く話す。',
        'My background is in pediatric surgery. I spent many years caring for children who needed surgery.',
        ['My background is in pediatric surgery.','I spent many years','caring for children','who needed surgery'],
        '今の仕事を1文足す。資格を手放した、現在も手術中心、とは付け加えない。'),
      t('How do you use that experience today?','その経験を今どう生かしていますか？','現在の地域診療につなげる。',
        'These days, I use that experience to care for children and families in the community.',
        ['These days','I use that experience','to care for children and families','in the community'],
        'I use … to … の中身を変え、英語の練習に使う道具についても言ってみる。')
    ],t('Are you mainly doing surgery these days?','今も主に手術をしているのですか？','現在は地域診療が中心と伝え、背景を添える。',
      'These days, my main work is in a community clinic. I provide both general and specialist care, drawing on my experience in pediatric surgery.',
      ['These days, my main work is in a community clinic.','I provide both general and specialist care','drawing on my experience in pediatric surgery'],
      '短く2文で返す。一字一句同じでなくてよい。')),
    scene('personal-book','本を書いた理由を話す','本の紹介から、理由と目的を1文足す',[
      t('What is your book about?','どんな本ですか？','子どもの便秘について書いた本。',
        'I’ve written a book about childhood constipation. It brings together my experience in pediatric surgery and community care.',
        ['I’ve written a book','about childhood constipation','It brings together my experience','in pediatric surgery and community care'],
        '本の対象を、自分の考えに合う言葉で1文足す。'),
      t('Why did you write it?','なぜ書いたのですか？','知識を使いやすくしたい、だから本を書いた。',
        'I wanted to make this knowledge easier for families to use. That’s why I wrote the book.',
        ['I wanted to make this knowledge','easier for families to use','That’s why I wrote the book.'],
        '理由を先に述べてから That’s why …。別の「始めた理由」でも使う。'),
      t('What do you hope families will get from it?','家族に何を届けたいですか？','知識を日々の生活で役立ててほしい。',
        'The idea is to make medical knowledge useful for families in everyday life.',
        ['The idea is to','make medical knowledge useful','for families in everyday life'],
        'The idea is to … でクリニックや別の取り組みの狙いを話す。')
    ],t('How has your experience shaped the book?','経験が本にどう生きていますか？','専門診療と地域の経験の両方をまとめたと説明する。',
      'The book brings together what I’ve learned in pediatric surgery and community care.',
      ['The book brings together','what I’ve learned','in pediatric surgery and community care'],
      '刊行・英訳・海外契約の状況を創作せず、分かる内容で答える。')),
    scene('personal-connect','接続表現：具体例・両立・言い換え','For example / At the same time / What I mean is を使う',[
      t('What kind of specialist care do you provide?','どんな専門診療ですか？','専門診療の具体例を一つ挙げる。',
        'I provide specialist care for children. For example, I see children with constipation.',
        ['I provide specialist care for children.','For example','I see children with constipation.'],
        'For example のあとを、自分が実際に行う別の診療に変える。'),
      t('Do you also see children with everyday health problems?','日常的な健康の問題も診ますか？','専門診療と一般診療の両方を伝える。',
        'Yes. I offer specialist care. At the same time, I see children with everyday health problems.',
        ['Yes. I offer specialist care.','At the same time','I see children with everyday health problems.'],
        'At the same time の前後を入れ替え、両方を大切にしていることを話す。'),
      t('What do you mean by bringing your background into your work?','背景を仕事に生かすとは、どういう意味ですか？','別の言い方で短く説明する。',
        'What I mean is, I bring my surgical experience into everyday care.',
        ['What I mean is','I bring my surgical experience','into everyday care'],
        'What I mean is のあとを、もっと短い自分の言葉に変える。')
    ],t('Could you give me an example of your work?','仕事の具体例を教えてください。','一般的な説明と具体例を2文でつなぐ。',
      'I care for children in the community. For example, I help families who are worried about childhood constipation.',
      ['I care for children in the community.','For example','I help families who are worried about childhood constipation.'],
      '患者の実話を使わず、自分の診療分野を例にする。')),
    scene('personal-purpose','接続表現：学び・大切にすること・目的','One thing I’ve learned / What matters to me / so that を使う',[
      t('What have you learned from working in the community?','地域の診療で何を学びましたか？','家族ごとの事情を理解することの大切さを話す。',
        'One thing I’ve learned is how important it is to understand each family’s situation.',
        ['One thing I’ve learned is','how important it is','to understand each family’s situation'],
        '学んだ内容は自分の実感に合う言葉に変えてよい。'),
      t('What matters most to you in your work?','仕事で何を大切にしていますか？','それぞれの家族に合う方法を見つける。',
        'What matters to me is finding an approach that works for each family.',
        ['What matters to me is','finding an approach','that works for each family'],
        'What matters to me is のあとを、日常生活で大切にすることに変える。'),
      t('Why is a clear explanation important?','分かりやすい説明が大切なのはなぜですか？','次にすることが分かるように説明したい。',
        'I want to explain things clearly so that families know what to do next.',
        ['I want to explain things clearly','so that families know','what to do next'],
        'so that の前後で「すること」と「目的」をつなぐ。')
    ],t('Could you put that another way?','別の言い方で説明できますか？','家族が使える知識にしたいと要約する。',
      'I want the book to be practical. In other words, I want families to be able to use it.',
      ['I want the book to be practical.','In other words','I want families to be able to use it.'],
      'In other words を使い、同じ意味をもっと簡単に言う。')),
    scene('personal-world','海外・Clinical AI Coreについて話す','取り組みと希望を述べ、相手にも質問する',[
      t('What would you like to do outside Japan?','海外で何をしたいですか？','経験を家族と医師へ伝えたい。',
        'I’d like to share what I’ve learned with families and doctors outside Japan.',
        ['I’d like to share','what I’ve learned','with families and doctors','outside Japan'],
        'I’d like to で、海外の相手から学びたいことも話す。'),
      t('What are you working on now?','今、何に取り組んでいますか？','Clinical AI Coreの目標を説明する。',
        'I’m working on a project called Clinical AI Core. The goal is to give doctors and staff more time for patients.',
        ['I’m working on a project','called Clinical AI Core','The goal is to give doctors and staff','more time for patients'],
        '目標として話す。実証済みの効果とは言わない。'),
      t('Are you ready to share the book internationally?','海外に本を届ける準備はできていますか？','取り組みの途中と伝える。',
        'I’m still working on how to share the book with people outside Japan.',
        ['I’m still working on','how to share the book','with people outside Japan'],
        '現在の実際の進捗に合わせて言い換える。海外出版済みとはしない。')
    ],t('I work at a children’s clinic too.','私も子どものクリニックで働いています。','相手へ質問を返して会話を続ける。',
      'How about your clinic? What kinds of patients do you see?',
      ['How about your clinic?','What kinds of patients do you see?'],
      '相手の返答を待つ。さらに Could you tell me more about that? と続けてもよい。')),
    scene('personal-flight','飛行機で、会話に入って自分の話へ','出だし → 相手の話を受ける → 自分の経験 → 質問を返す',[
      t('Hi there.','隣の人から挨拶されたところから。','挨拶し、旅の目的を尋ねる。',
        'Hi. Are you traveling for work or for a holiday?',
        ['Hi.','Are you traveling for work','or for a holiday?'],
        '相手が会話を続ける様子なら質問を一つ。忙しい乗務員や休んでいる人には間を置く。'),
      t('For work. I’m visiting a few clinics. How about you?','仕事です。いくつかクリニックを訪問します。あなたは？（練習上の設定）','相手の話を受けて自分との接点を伝える。',
        'Oh, that’s interesting. I actually run a children’s clinic in Tokyo, where I see children with a wide range of health problems.',
        ['Oh, that’s interesting.','I actually run a children’s clinic in Tokyo','where I see children','with a wide range of health problems'],
        'I actually … は意外な接点を添える時に。毎回答へ機械的に付けない。旅の目的は自分の事実で答える。'),
      t('What do you enjoy about your work?','仕事のどんなところが好きですか？','出だしを置き、家族との関わりについて広げる。',
        'I’d say what I enjoy most is working with families and finding ways to make medical information useful in everyday life.',
        ['I’d say','what I enjoy most is','working with families','and finding ways to make medical information useful','in everyday life'],
        '好きな点は自分の実感に合わせる。I’d say … は考えを述べる出だしとして使う。')
    ],t('That sounds interesting. Could you tell me a bit more?','面白そうですね。もう少し教えてください。','自分の話を一段広げ、相手へ戻す。',
      'One thing I’ve been working on is a book about childhood constipation, which brings together my surgical experience and my work in the community. What kind of work do you do with clinics?',
      ['One thing I’ve been working on is','a book about childhood constipation','which brings together my surgical experience','and my work in the community','What kind of work do you do with clinics?'],
      'which で本の説明を足す。長ければ一度切って The book brings together … と続けてもよい。相手の答えを待つ。'))
  );
}());
