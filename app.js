/* Saydana practice app. Data comes from items.js (window.SAYDANA), so the app runs from a web
   server or straight from disk. All text is inserted with textContent; nothing is fetched. */
(() => {
  'use strict';
  const DATA = window.SAYDANA || { items: [], domains: [], config: {} };
  const root = document.getElementById('app');
  const STORE = 'saydana.v1';
  const SECONDS_PER_ITEM = 72; // the SPLE allows 120 minutes per 100 questions
  const LETTERS = ['A', 'B', 'C', 'D'];
  const domainName = code => (DATA.domains.find(d => d.code === code) || { name: 'Domain ' + code }).name;

  const save = s => { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (e) { /* private mode: run without saving */ } };
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { return null; } };
  const saved = load() || { history: [], session: null };
  const byIdEarly = id => DATA.items.some(i => i.id === id);
  // a saved session is only resumable if every question in it still exists in this build
  let S = saved.session && Array.isArray(saved.session.ids) && saved.session.ids.every(byIdEarly) ? saved.session : null;
  const localDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  let timerId = null;

  function el(tag, attrs, ...kids) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'text') node.textContent = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(Infinity)) if (kid !== null && kid !== undefined && kid !== false) node.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    return node;
  }
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const persist = () => { saved.session = S; save(saved); };
  const byId = id => DATA.items.find(i => i.id === id);

  function start(mode, domain) {
    let pool = DATA.items.filter(i => !domain || i.domain === domain);
    // keep the blueprint's order of domains, shuffle within each, so a set reads like the exam's spread
    const ids = shuffle(pool).sort((a, b) => a.domain.localeCompare(b.domain)).map(i => i.id);
    S = { mode, domain: domain || null, ids, idx: 0, answers: {}, checked: {}, started: Date.now(),
          deadline: mode === 'timed' ? Date.now() + ids.length * SECONDS_PER_ITEM * 1000 : null };
    persist();
    render();
  }

  // ---------- screens ---------------------------------------------------------
  function home() {
    const n = DATA.items.length;
    const resume = S && S.idx < S.ids.length
      ? el('p', {}, el('button', { class: 'btn btn-primary', type: 'button', onclick: render, text: `Resume where you left off (question ${S.idx + 1} of ${S.ids.length})` }))
      : null;
    const domainButtons = DATA.domains.filter(d => DATA.items.some(i => i.domain === d.code)).map(d =>
      el('button', { class: 'mode', type: 'button', onclick: () => start('practice', d.code) },
        el('b', { text: d.name }), el('span', { text: `${DATA.items.filter(i => i.domain === d.code).length} questions, feedback after each` })));
    const last = saved.history[saved.history.length - 1];
    return el('div', { class: 'panel' },
      el('p', { class: 'eyebrow', text: DATA.config.preview ? 'Preview build' : 'Free diagnostic' }),
      el('h1', { style: 'font-size:clamp(28px,5vw,40px)', text: 'Where do you stand on the SPLE blueprint?' }),
      el('p', { class: 'lede', style: 'margin-bottom:12px', text: `${n} original questions spread across the four SCFHS blueprint domains. Every answer is explained, including why each wrong option is wrong.` }),
      last ? el('p', { class: 'note', text: `Your last result: ${last.correct} of ${last.total} (${Math.round(100 * last.correct / last.total)}%) on ${last.date}.` }) : null,
      resume,
      el('div', { class: 'modes' },
        el('button', { class: 'mode', type: 'button', onclick: () => start('diagnostic') },
          el('b', { text: 'Diagnostic' }), el('span', { text: `All ${n} questions, feedback after each one` })),
        el('button', { class: 'mode', type: 'button', onclick: () => start('timed') },
          el('b', { text: 'Timed, exam conditions' }), el('span', { text: `All ${n} questions in ${Math.round(n * SECONDS_PER_ITEM / 60)} minutes, answers at the end` }))),
      domainButtons.length > 1 ? el('h3', { style: 'margin-top:24px', text: 'Or practise one domain' }) : null,
      domainButtons.length > 1 ? el('div', { class: 'modes' }, domainButtons) : null,
      el('p', { class: 'note', style: 'margin-top:20px', text: 'Your answers stay on this device and are never sent anywhere.' }));
  }

  function question() {
    const id = S.ids[S.idx], item = byId(id), chosen = S.answers[id], checked = !!S.checked[id];
    const timed = S.mode === 'timed';
    const opts = LETTERS.map(L => {
      const cls = ['option'];
      if (checked && L === item.answer) cls.push('correct');
      if (checked && L === chosen && chosen !== item.answer) cls.push('wrong');
      return el('li', {}, el('button', { class: cls.join(' '), type: 'button', 'aria-pressed': String(chosen === L), disabled: checked,
        onclick: () => { S.answers[id] = L; persist(); render(); } },
        el('span', { class: 'letter', text: L }), el('span', { text: item.options[L] })));
    });
    const panel = el('div', { class: 'panel' },
      el('div', { class: 'meta' }, el('span', { text: `Question ${S.idx + 1} of ${S.ids.length}` }),
        el('span', { text: `${domainName(item.domain)} · ${item.competency}` }),
        timed ? el('span', { id: 'clock', 'aria-live': 'off', text: '' }) : null),
      el('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': S.ids.length, 'aria-valuenow': S.idx + 1 },
        el('span', { style: `width:${(100 * (S.idx + 1) / S.ids.length).toFixed(1)}%` })),
      el('p', { class: 'stem', text: item.stem }),
      el('ul', { class: 'options', role: 'list' }, opts),
      checked ? feedback(item, chosen) : null,
      el('div', { class: 'bar' },
        el('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { stopTimer(); S = null; persist(); render(); }, text: 'Quit' }),
        timed || checked
          ? el('button', { class: 'btn btn-primary', type: 'button', disabled: timed && !chosen, onclick: next, text: S.idx + 1 < S.ids.length ? 'Next question' : 'See results' })
          : el('button', { class: 'btn btn-primary', type: 'button', disabled: !chosen, onclick: () => { S.checked[id] = true; persist(); render(); }, text: 'Check answer' })));
    return panel;
  }

  function feedback(item, chosen) {
    const ok = chosen === item.answer;
    return el('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' },
      el('p', { class: 'verdict ' + (ok ? 'ok' : 'no'), text: ok ? `Correct. The answer is ${item.answer}.` : `Not quite. You chose ${chosen}; the answer is ${item.answer}.` }),
      el('p', { style: 'margin:0', text: item.explanation }),
      el('h4', { text: 'Why the other options are wrong' }),
      el('ul', {}, LETTERS.filter(L => L !== item.answer).map(L => el('li', {}, el('b', { text: L + ': ' }), item.why_not[L]))),
      el('p', { class: 'ref', text: 'Reference: ' + item.refs.map(r => [r.title, r.locator].filter(Boolean).join(', ')).join('; ') }));
  }

  function next() {
    if (S.idx + 1 < S.ids.length) { S.idx += 1; persist(); render(); window.scrollTo(0, 0); return; }
    finish();
  }

  function finish() {
    stopTimer();
    const total = S.ids.length, correct = S.ids.filter(id => S.answers[id] === byId(id).answer).length;
    saved.history.push({ date: localDate(new Date()), mode: S.mode, correct, total });
    saved.history = saved.history.slice(-20);
    S.finished = true; S.idx = S.ids.length;
    persist(); render();
  }

  function results() {
    const total = S.ids.length;
    const correct = S.ids.filter(id => S.answers[id] === byId(id).answer).length;
    const pct = Math.round(100 * correct / total);
    const byDomain = DATA.domains.map(d => {
      const ids = S.ids.filter(id => byId(id).domain === d.code);
      return { d, n: ids.length, ok: ids.filter(id => S.answers[id] === byId(id).answer).length };
    }).filter(x => x.n);
    const weakest = byDomain.slice().sort((a, b) => a.ok / a.n - b.ok / b.n)[0];
    const missed = S.ids.filter(id => S.answers[id] !== byId(id).answer);
    const waitlist = DATA.config.waitlist_url;
    return el('div', { class: 'panel' },
      el('p', { class: 'eyebrow', text: 'Your result' }),
      el('p', { class: 'score', text: pct + '%' }),
      el('p', { class: 'note', text: `${correct} of ${total} correct. Practice scores are a guide to where to study, not a prediction of your SPLE score.` }),
      el('h3', { style: 'margin-top:20px', text: 'By blueprint domain' }),
      byDomain.map(x => [el('div', { class: 'drow' }, el('span', { text: `${x.d.name} (${Math.round(x.d.weight * 100)}% of the exam)` }), el('b', { text: `${x.ok} of ${x.n}` })),
        el('div', { class: 'meter' }, el('span', { style: `width:${(100 * x.ok / x.n).toFixed(1)}%` }))]),
      weakest && weakest.ok < weakest.n ? el('p', { text: `Start with ${weakest.d.name}: it is your weakest area here, and it carries ${Math.round(weakest.d.weight * 100)}% of the exam.` }) : null,
      missedCompetencies(),
      missed.length ? el('details', {}, el('summary', { text: `Review the ${missed.length} question(s) you missed` }),
        missed.map(id => { const it = byId(id); return el('div', { class: 'feedback' },
          el('p', { class: 'stem', style: 'font-size:17px', text: it.stem }),
          el('p', { text: `You answered ${S.answers[id] || 'nothing'}. Correct: ${it.answer}. ${it.options[it.answer]}` }),
          el('p', { style: 'color:var(--ink-2)', text: it.explanation })); })) : null,
      el('div', { class: 'bar' },
        el('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { S = null; persist(); render(); }, text: 'Back to start' }),
        shareButton(pct, correct, total),
        waitlist ? el('a', { class: 'btn btn-primary', href: waitlist, target: '_blank', rel: 'noopener', text: 'Get the full bank first: join the waitlist' }) : null));
  }

  function shareButton(pct, correct, total) {
    const url = DATA.config.site_url || '';
    if (!url) return null;
    const line = `I scored ${pct}% (${correct} of ${total}) on the free Saydana SPLE diagnostic: original questions, every option explained. ${url}/`;
    const box = el('input', { class: 'sharebox hidden', type: 'text', readonly: true, value: line,
                              'aria-label': 'Your result, ready to copy' });
    const btn = el('button', { class: 'btn btn-ghost', type: 'button', text: 'Copy my result to share' });
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(line);
        btn.textContent = 'Copied, paste it anywhere';
      } catch (e) {
        // clipboard blocked (private mode, permissions): show the text already selected instead
        box.classList.remove('hidden');
        box.focus();
        box.select();
        btn.textContent = 'Copy it from here';
      }
    });
    return el('div', { style: 'display:flex;gap:10px;flex-wrap:wrap;align-items:center' }, btn, box);
  }

  function missedCompetencies() {
    const counts = new Map();
    for (const id of S.ids) {
      const item = byId(id);
      if (S.answers[id] !== item.answer) counts.set(item.competency, (counts.get(item.competency) || 0) + 1);
    }
    if (!counts.size) return null;
    const rows = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return el('div', {},
      el('h3', { style: 'margin-top:22px', text: 'Competencies to revisit' }),
      el('p', { class: 'note', style: 'margin:0 0 8px', text: 'The blueprint codes you missed, most-missed first. Study these by name in the SCFHS blueprint.' }),
      el('ul', { class: 'missed' }, rows.map(([code, n]) => el('li', {},
        el('b', { text: code }), ' ', domainName(code.split('.')[0]), n > 1 ? ` (${n} questions)` : ''))));
  }

  // ---------- timer ---------------------------------------------------------------
  function tick() {
    const clock = document.getElementById('clock');
    if (!S || !S.deadline) return;
    const left = Math.max(0, Math.round((S.deadline - Date.now()) / 1000));
    if (clock) clock.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} left`;
    if (left === 0) finish();
  }
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

  let lastScreen = null;
  function render() {
    stopTimer();
    let screen;
    if (!DATA.items.length) screen = el('div', { class: 'panel' }, el('p', { text: 'No questions are published yet.' }));
    else if (!S) screen = home();
    else if (S.finished || S.idx >= S.ids.length) screen = results();
    else screen = question();
    // A re-render on the same screen (picking an option) destroys the focused button, so remember
    // which one it was and put focus back on its replacement.
    const activeLetter = document.activeElement && document.activeElement.closest
      ? (document.activeElement.closest('.option') || {}).textContent : null;
    root.replaceChildren(screen);
    // Move focus only when the screen itself changes, so a keyboard or screen-reader user lands on
    // the new question instead of the top of the page, and does not get yanked back when they
    // simply pick an option.
    const key = !S ? 'home' : S.finished || S.idx >= S.ids.length ? 'results'
      : 'q' + S.idx + (S.checked[S.ids[S.idx]] ? '-checked' : '');
    const first = lastScreen === null;
    if (key !== lastScreen) {
      lastScreen = key;
      // after checking an answer, the explanation is the thing to read, not the question again
      // One selector per line, tried in order: a comma list would hand back whichever matched
      // first in the document, which is the eyebrow, not the heading a reader wants.
      const target = (key.endsWith('-checked') && screen.querySelector('.feedback'))
        || ['.stem', 'h1', '.eyebrow'].reduce((found, sel) => found || screen.querySelector(sel), null)
        || screen;
      // Not on the first paint: nobody has asked for anything yet, so moving focus on arrival
      // only takes it away from where the reader put it.
      if (!first) {
        target.setAttribute('tabindex', '-1');
        try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
      }
    } else if (activeLetter) {
      const same = [...screen.querySelectorAll('.option')].find(b => b.textContent === activeLetter);
      if (same) { try { same.focus({ preventScroll: true }); } catch (e) { same.focus(); } }
    }
    if (S && S.deadline && !S.finished) { tick(); timerId = setInterval(tick, 1000); }
  }

  document.addEventListener('keydown', e => {
    if (!S || S.finished || e.metaKey || e.ctrlKey || e.altKey) return;
    const id = S.ids[S.idx]; if (!id) return;
    const key = e.key.toUpperCase();
    const pick = LETTERS.includes(key) ? key : ['1', '2', '3', '4'].includes(key) ? LETTERS[Number(key) - 1] : null;
    if (pick && !S.checked[id]) { S.answers[id] = pick; persist(); render(); }
    if ((e.key === 'Enter' || e.keyCode === 13) && S.answers[id] && document.activeElement.tagName !== 'A') {
      e.preventDefault();
      if (S.mode === 'timed' || S.checked[id]) next(); else { S.checked[id] = true; persist(); render(); }
    }
  });

  render();
})();
