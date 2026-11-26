/* Selected existing turns; responses remain in their original SSOT. Alternate prompts are fictional practice wording. */
(function(root){root.HANASERU_PRIORITY = [
  {
    "id": "p01",
    "title": "名前と今の仕事を伝える",
    "scene": "dubai-pitch",
    "turn": 0,
    "alternate": {
      "heard": "Could you introduce yourself?",
      "ja": "自己紹介をお願いできますか。"
    }
  },
  {
    "id": "p02",
    "title": "小児外科の経験を伝える",
    "scene": "personal-now",
    "turn": 1,
    "alternate": {
      "heard": "What field of medicine did you train in?",
      "ja": "どの分野の医療を学んだのですか。"
    }
  },
  {
    "id": "p03",
    "title": "自分から会話を始める",
    "scene": "personal-flight",
    "turn": 0,
    "alternate": {
      "heard": "Hello. Nice to meet you.",
      "ja": "こんにちは。お会いできてうれしいです。"
    }
  },
  {
    "id": "p04",
    "title": "聞き取れなかった所を聞き返す",
    "scene": "links-check",
    "turn": 1,
    "alternate": {
      "heard": "You can have breakfast on the mezzanine from six thirty until ten. Bring your room key.",
      "ja": "朝食は中二階で6時半から10時です。お部屋の鍵をお持ちください。"
    }
  },
  {
    "id": "p05",
    "title": "理解が合っているか確かめる",
    "scene": "links-check",
    "turn": 4,
    "alternate": {
      "heard": "Our nurses talk to the family first. The doctor comes in for just the final ten minutes.",
      "ja": "最初は看護師が家族と話し、最後の10分だけ医師が加わります。"
    }
  },
  {
    "id": "p06",
    "title": "考える間を作って希望を言う",
    "scene": "links-time",
    "turn": 2,
    "alternate": {
      "heard": "Would you like to go anywhere before I take you to your hotel?",
      "ja": "ホテルへお送りする前に、どこか寄りたい所はありますか。"
    }
  },
  {
    "id": "p07",
    "title": "大切にしていることを言う",
    "scene": "personal-purpose",
    "turn": 1,
    "alternate": {
      "heard": "What is important to you as a doctor?",
      "ja": "医師として何を大切にしていますか。"
    }
  },
  {
    "id": "p08",
    "title": "理由を一言添える",
    "scene": "personal-book",
    "turn": 1,
    "alternate": {
      "heard": "What made you decide to write your book?",
      "ja": "本を書くことにしたきっかけは何ですか。"
    }
  },
  {
    "id": "p09",
    "title": "具体例を挙げる",
    "scene": "personal-connect",
    "turn": 0,
    "alternate": {
      "heard": "Could you give me an example of the specialist care you offer?",
      "ja": "専門診療の具体例を教えていただけますか。"
    }
  },
  {
    "id": "p10",
    "title": "相手の話を受けて質問を返す",
    "scene": "links-receive",
    "turn": 2,
    "alternate": {
      "heard": "My sister is getting married in Dubai. I'm flying there for the wedding, and getting ready has kept me up all week.",
      "ja": "妹の結婚式でドバイへ行きます。準備で今週はずっと寝不足です。"
    }
  },
  {
    "id": "p11",
    "title": "問診の入口と排便の回数",
    "scene": "consult-const-history",
    "turn": 0,
    "alternate": {
      "heard": "Hello, Doctor. My son has had constipation for a long time. That's why we've come today.",
      "ja": "こんにちは、先生。息子の便秘が長く続いているので来ました。"
    }
  },
  {
    "id": "p12",
    "title": "答えを受けて便の状態を聞く",
    "scene": "consult-const-history",
    "turn": 1,
    "alternate": {
      "heard": "Usually twice a week, but some weeks even less.",
      "ja": "普通は週2回ですが、それより少ない週もあります。"
    }
  },
  {
    "id": "p13",
    "title": "痛みと出血を聞く",
    "scene": "consult-const-history",
    "turn": 2,
    "alternate": {
      "heard": "His stools are usually very big. They sometimes block the toilet.",
      "ja": "便はたいていとても大きく、ときどきトイレが詰まります。"
    }
  },
  {
    "id": "p14",
    "title": "心配を受け止め、我慢を聞く",
    "scene": "consult-const-history",
    "turn": 3,
    "alternate": {
      "heard": "He sometimes cries when he goes. Last month I noticed a small streak of blood.",
      "ja": "排便するときに泣くことがあります。先月、血が筋のように少し付いていました。"
    }
  },
  {
    "id": "p15",
    "title": "もう一つ質問を足す",
    "scene": "consult-const-history",
    "turn": 4,
    "alternate": {
      "heard": "Yes, he stands behind the sofa on his toes, with his body all stiff.",
      "ja": "はい、ソファの後ろで体を硬くして、つま先立ちをしています。"
    }
  },
  {
    "id": "p16",
    "title": "これまでの薬を確認する",
    "scene": "consult-const-history",
    "turn": 5,
    "alternate": {
      "heard": "His underwear does get a little dirty sometimes. I assumed he hadn't wiped properly.",
      "ja": "下着が少し汚れることはあります。拭き方が悪いのだと思っていました。"
    }
  },
  {
    "id": "p17",
    "title": "いちばんの心配を聞く",
    "scene": "consult-const-history",
    "turn": 6,
    "alternate": {
      "heard": "We tried a medicine from the pharmacy for a few days, but it didn't really help.",
      "ja": "薬局の薬を数日試しましたが、あまり効きませんでした。"
    }
  },
  {
    "id": "p18",
    "title": "良い変化を受け止める",
    "scene": "clinic-bowel",
    "turn": 0,
    "alternate": {
      "heard": "He's having fewer accidents than before.",
      "ja": "以前より漏らす回数が減りました。"
    }
  },
  {
    "id": "p19",
    "title": "続けられる方法を一緒に考える",
    "scene": "clinic-bowel",
    "turn": 3,
    "alternate": {
      "heard": "I find it difficult to keep a detailed record every day.",
      "ja": "毎日細かく記録するのは難しいです。"
    }
  },
  {
    "id": "p20",
    "title": "診察を締めて次につなげる",
    "scene": "links-shift",
    "turn": 1,
    "alternate": {
      "heard": "Thank you. I feel clear about what we need to do at home.",
      "ja": "ありがとうございます。家で何をするか分かりました。"
    }
  },
  {
    "id": "p21",
    "title": "便秘の本を紹介する",
    "scene": "personal-book",
    "turn": 0,
    "alternate": {
      "heard": "Could you tell me a little about your book?",
      "ja": "ご著書について少し教えてください。"
    }
  },
  {
    "id": "p22",
    "title": "本で家族に届けたいこと",
    "scene": "personal-book",
    "turn": 2,
    "alternate": {
      "heard": "How would you like families to use your book?",
      "ja": "家族に本をどのように使ってほしいですか。"
    }
  },
  {
    "id": "p23",
    "title": "過去の経験と今の診療をつなぐ",
    "scene": "personal-now",
    "turn": 2,
    "alternate": {
      "heard": "How does your surgical experience help in your clinic?",
      "ja": "外科の経験はクリニックの診療にどう役立っていますか。"
    }
  },
  {
    "id": "p24",
    "title": "地域の診療で学んだこと",
    "scene": "personal-purpose",
    "turn": 0,
    "alternate": {
      "heard": "What has community care taught you?",
      "ja": "地域の診療から何を学びましたか。"
    }
  },
  {
    "id": "p25",
    "title": "取り組んでいる仕事を紹介する",
    "scene": "personal-world",
    "turn": 1,
    "alternate": {
      "heard": "Do you have a project you are working on at the moment?",
      "ja": "いま取り組んでいるプロジェクトはありますか。"
    }
  },
  {
    "id": "p26",
    "title": "未確認の成果は言い切らない",
    "scene": "dubai-qa-cac",
    "turn": 3,
    "alternate": {
      "heard": "Have you measured any benefits for patients yet?",
      "ja": "患者さんへの効果はもう測定しましたか。"
    }
  },
  {
    "id": "p27",
    "title": "相手の仕事の課題を聞く",
    "scene": "dubai-qa-cac",
    "turn": 5,
    "alternate": {
      "heard": "We spend so much time on paperwork at our clinic, too.",
      "ja": "私たちのクリニックも書類仕事にとても時間がかかります。"
    }
  },
  {
    "id": "p28",
    "title": "仕事の喜びを雑談で話す",
    "scene": "personal-flight",
    "turn": 2,
    "alternate": {
      "heard": "What do you like best about your job?",
      "ja": "お仕事でいちばん好きなところは何ですか。"
    }
  },
  {
    "id": "p29",
    "title": "会う日時を確かめる",
    "scene": "links-check",
    "turn": 2,
    "alternate": {
      "heard": "Let's talk more after the afternoon session. Could we meet by the posters?",
      "ja": "午後のセッションのあとにもう少し話しましょう。ポスターの所で会えますか。"
    }
  },
  {
    "id": "p30",
    "title": "お礼を伝えて会話を締める",
    "scene": "links-shift",
    "turn": 3,
    "alternate": {
      "heard": "I've enjoyed our conversation. I'd better get to the next session now.",
      "ja": "お話しできて楽しかったです。次のセッションに行かないと。"
    }
  }
];}(typeof window!=="undefined"?window:globalThis));
