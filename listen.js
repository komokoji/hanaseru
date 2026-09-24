/* Hanaseru 🎧 聞き取り教材（インプット側）
   院長が実際に耳にした英語をそのまま教材にする。作った例文ではなく、その場の音。
   1ユニット = { id, title, scene, voice, passages:[{en, ja}], phrases:[{id, ja, en}] }
   ・passages … 聞く→意味を考える→英文と要点を見る（全文を訳さない・太字級の定型句だけ拾う）
   ・phrases  … 口に出す定型句。domain "listen" のカードとして瞬発トレ／シャドーイング／チェックリストにも載る
   正本＝Vault 22_アプリ開発/Hanaseru 語学トレーニング/30_聞き取り教材_BA機内アナウンス_ヒースロー→羽田_2026-09-21.md */
window.HANASERU_LISTEN = [
  {
    id: "ba-lhr-hnd-2026-09-21",
    title: "BA 機内アナウンス（ヒースロー→羽田）",
    scene: "2026-09-21 着陸前後・英国訛り・定型で速い。ここが「考えずに分かる」になれば、空港・機内・ホテルの案内はほぼ通る。",
    voice: "en-GB",
    passages: [
      {
        title: "① 着陸前 — 募金案内",
        en: "In First or Club World, please take care of your personal electronic device when adjusting your seat. If your device does get lost, please do not move the seat. Instead, please let a member of the crew know and we will be happy to assist you. Here at British Airways, our BA Better World Community Fund creates life-changing opportunities while supporting amazing projects and charities that align with our sustainability programme. Shortly, we will pause the in-flight entertainment to share a short video with you. If you would like to get involved, you can, right now, by simply donating any spare change in any currency into our charity collection bag, which a member of the crew will bring through the cabin soon. On behalf of all of our partners, we thank you in advance for your continued support and generosity.",
        ja: "座席を動かす時は機器を落とさないように／落としたら座席を動かさず乗務員へ／募金袋が回る（どの通貨の小銭でも可）。",
        pick: ["let a member of the crew know（乗務員に知らせる）", "spare change（小銭）", "thank you in advance"]
      },
      {
        title: "② 着陸前 — 入国手続きと着席案内",
        en: "Japan recommends the use of the Visit Japan Web service for immigration and customs procedures. Please note that paper forms are no longer distributed on board the aircraft, so we kindly ask that you complete the necessary procedures online via the Visit Japan web page, or fill in the required forms upon arrival at Haneda Airport. In addition to this, the Asian Games are currently being held in Japan, so please note that the BA customer service team in Haneda has advised us that quarantine and customs inspections may be more stringent than usual during this period. Also, we will be switching the seat belt signs on in under 20 minutes, so the toilets will no longer be available after this point, because the cabin crew will need to come through and secure the cabin ready for landing. So if you do need to use the bathroom now, please make your way to the lavatory before we do switch on the seat belt signs. Thank you, and we hope you've had a good flight with us today.",
        ja: "入国カードは紙で配らない（Visit Japan Web か到着後に記入）／アジア大会中で検疫・税関が厳しめ／20分以内にベルトサイン点灯＝トイレは今のうち。",
        pick: ["no longer（もう〜ない）", "more stringent than usual", "in under 20 minutes", "make your way to（〜へ向かう）"]
      },
      {
        title: "③ 着陸準備",
        en: "Customers sitting in a front row seat or in an emergency exit row should place all items in the overhead lockers, leaving the floor area around your seat completely clear for landing. Please check that your table is folded away, your seat is in the landing position with the armrest down, your footrest has been stowed, and your seatbelt is securely fastened. If you are seated by a window and have lowered the blind, please return this to the open position for landing. Our Wi-Fi service will shortly be switched off; however, you may continue to use any handheld electronic devices for landing. Larger items, including laptops, must now be switched off and stowed away safely.",
        ja: "前列・非常口席は床に物を置かない／テーブル・座席・フットレスト・ベルト／窓のブラインドを開ける／ラップトップは電源オフで収納。",
        pick: ["overhead lockers（英：頭上の荷物棚。米は overhead bins）", "stowed（収納した）", "securely fastened"]
      },
      {
        title: "④ 着陸後 — 降機前",
        en: "Please remain seated with your seatbelt securely fastened until the fasten seatbelt signs have been switched off. And when it is safe to do so, please take care when opening the overhead lockers, as items may have moved and could fall out, causing injury. You can now make calls as well as use all data services on your handheld electronic devices. Before leaving the aircraft today, please check that you have all of your personal belongings with you, and do check your seat pocket and any other storages before leaving us. For those customers who pre-ordered special assistance to leave the aircraft today, do remain seated until the aisle around you is clear, and one of our crew will be on hand to assist you. On behalf of the cabin crew and British Airways, I'd like to thank you for choosing to fly with us today, and we do hope you have a great morning. Thank you.",
        ja: "ベルトサインが消えるまで着席／荷物棚は物が動いているので注意／忘れ物・座席ポケット／介助希望者は通路が空くまで着席。",
        pick: ["英国的な do の強調（do check / do remain seated / we do hope）＝丁寧で温かい念押し", "on hand（そばに控えている）"]
      },
      {
        title: "⑤ 到着の挨拶",
        en: "Welcome to Haneda Airport. We've just arrived here just over 15 minutes early, and very shortly we'll have you disembarking through the forward left-hand doors into Terminal 3. We do hope you've enjoyed your flight with us. As always, it's a pleasure flying you around the world. We do hope that you'll offer us the opportunity to welcome you on board British Airways again soon. Thank you very much, and have a very pleasant day.",
        ja: "15分ほど早く到着／前方左側ドアから第3ターミナルへ降機。",
        pick: ["just over 15 minutes early", "disembark（降機する）", "forward left-hand doors（前方左側ドア）"]
      }
    ],
    phrases: [
      { id: "ls-ba-01", domain: "listen", ja: "乗務員にお知らせください。", en: "Please let a member of the crew know." },
      { id: "ls-ba-02", domain: "listen", ja: "紙の用紙は機内では配られません。", en: "Paper forms are no longer distributed on board." },
      { id: "ls-ba-03", domain: "listen", ja: "検査が通常より厳しいことがあります。", en: "Inspections may be more stringent than usual." },
      { id: "ls-ba-04", domain: "listen", ja: "20分以内にシートベルトサインを点灯します。", en: "We'll be switching the seat belt signs on in under 20 minutes." },
      { id: "ls-ba-05", domain: "listen", ja: "お手洗いへどうぞ（今のうちに向かってください）。", en: "Please make your way to the lavatory." },
      { id: "ls-ba-06", domain: "listen", ja: "荷物はすべて頭上の棚へ。", en: "Place all items in the overhead lockers." },
      { id: "ls-ba-07", domain: "listen", ja: "シートベルトをしっかり締めてください。", en: "Make sure your seatbelt is securely fastened." },
      { id: "ls-ba-08", domain: "listen", ja: "荷物棚を開ける時はご注意を。中の物が動いているかもしれません。", en: "Please take care when opening the overhead lockers, as items may have moved." },
      { id: "ls-ba-09", domain: "listen", ja: "通路が空くまで、そのまま座っていてください。", en: "Do remain seated until the aisle around you is clear." },
      { id: "ls-ba-10", domain: "listen", ja: "良い朝をお過ごしください。", en: "We do hope you have a great morning." }
    ]
  }
];
