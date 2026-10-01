/* 短時間練習の選択・復習日。UI / 通信から独立して点検できるロジック。 */
(function (root) {
  'use strict';
  var intervals = [1, 1, 3, 7, 14, 30, 90];
  var seeds = ['sign-01', 'trip-s12', 'me-61', 'tr-chat-4', 'med-intro-1', 'bs-25'];
  function topic(c) {
    if (['medical','visit','asthma','gut','nutri','sign'].includes(c.domain)) return 'clinic';
    if (c.domain === 'me') return 'me';
    if (c.domain === 'mine') {
      if (/診療|診察|親へ/.test(c.ja)) return 'clinic';
      if (/旅行|ホテル|空港/.test(c.ja)) return 'travel';
      return 'me';
    }
    return 'travel';
  }
  function stage(c, st) {
    st = st || {};
    if (st.paused) return 'paused';
    if (st.usedAt) return 'used';
    if (st.lastPracticeDay != null || st.box > 0 || st.practiced || (st.due != null && !st.plannedAt)) return 'learning';
    return 'want';
  }
  function eligible(c, focus) {
    if (!c.en || !c.ja || /___|\.\.\.|…/.test(c.en)) return false;
    if (/^trip-w/.test(c.id) || /（相手|（係官|（係員|（フロント|（表示/.test(c.ja)) return false;
    if (['clinic','travel','me'].includes(focus)) return topic(c) === focus;
    return !focus || focus === 'all' || c.domain === focus;
  }
  function select(cards, states, today, focus) {
    var pool = cards.filter(function (c) {
      var relevant = focus && focus !== 'all' || c.domain === 'mine' || !!states[c.id];
      return relevant && eligible(c, focus) && !(states[c.id] || {}).paused;
    });
    var due = pool.filter(function (c) { return states[c.id] && stage(c, states[c.id]) !== 'want' && states[c.id].due <= today; });
    due.sort(function (a, b) {
      return (states[a.id].box || 0) - (states[b.id].box || 0) || states[a.id].due - states[b.id].due;
    });
    var fresh = pool.filter(function (c) { return !states[c.id] || stage(c, states[c.id]) === 'want'; });
    fresh.sort(function (a,b) {
      var ap = (states[a.id] || {}).plannedAt || 0, bp = (states[b.id] || {}).plannedAt || 0;
      if (ap !== bp) return bp - ap;
      if ((a.domain === 'mine') !== (b.domain === 'mine')) return a.domain === 'mine' ? -1 : 1;
      if (a.domain === 'mine') return (b.ts || 0) - (a.ts || 0);
      var ai = seeds.indexOf(a.id), bi = seeds.indexOf(b.id);
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    });
    // 復習を優先しつつ、新しい「自分の一文」も一つ取り込む。
    var dueTake = fresh.length ? 2 : 3;
    var result = due.slice(0, dueTake);
    if (fresh.length) result.push(fresh.shift());
    return result.concat(due.slice(dueTake), fresh)
      .filter(function(c,i,a){return a.findIndex(function(x){return x.id===c.id;})===i;}).slice(0,3);
  }
  function grade(previous, outcome, today, now) {
    var st = Object.assign({}, previous || { box: 0, due: today });
    // 同日のやり直しや、期限より早い練習で箱を進めない。失敗は翌日へ戻す。
    if (outcome === 'again') { st.box = 0; st.due = today + 1; }
    else if (st.lastPracticeDay !== today && st.due <= today) {
      st.box = Math.min((st.box || 0) + 1, intervals.length - 1);
      st.due = today + intervals[st.box];
    }
    st.lastPracticeDay = today;
    st.practiceOutcome = outcome;
    st.updatedAt = now;
    return st;
  }
  function activityDays(state) {
    var days = new Set((state.practiceDays || []).filter(Number.isInteger));
    // 以前の「セッション完了の連続日数」を日付に移し、移行時に消さない。
    if (Number.isInteger(state.lastDone)) {
      for (var i=0; i<Math.max(1, Math.min(state.streak || 0, 10000)); i++) days.add(state.lastDone-i);
    }
    return Array.from(days).sort(function(a,b){return a-b;});
  }
  function activity(state, today) {
    var days=activityDays(state).filter(function(d){return d<=today;}), set=new Set(days);
    var done=set.has(today), anchor=done ? today : today-1, streak=0;
    while(set.has(anchor-streak)) streak++;
    return {days:days, done:done, streak:streak, week:days.filter(function(d){return d>=today-6;}).length};
  }
  var api = { select: select, grade: grade, stage: stage, topic: topic, eligible: eligible, activityDays:activityDays, activity:activity };
  root.HanaseruPracticeCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
