/* Ask Dad — lived answers only. No AI auto-answers. Equal always. */
(() => {
  const STORE_KEY = 'askDad.questions.v1';
  const PIN_KEY = 'askDad.dadPin.v1';
  const DAD_SESSION = 'askDad.dadSession.v1';

  const SEED_TAGS = [
    'Mental health',
    'Abuse',
    'Recovery',
    'Loneliness',
    'Family',
    'Music',
    'Life',
    'Other'
  ];

  /** @typedef {{id:string,text:string,tag:string,askedAt:string,status:'open'|'answered',answer?:string,answeredAt?:string}} Question */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function uid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'q-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  function loadQuestions() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveQuestions(list) {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  }

  function isDad() {
    return sessionStorage.getItem(DAD_SESSION) === '1';
  }

  function setDad(on) {
    if (on) sessionStorage.setItem(DAD_SESSION, '1');
    else sessionStorage.removeItem(DAD_SESSION);
  }

  function getPin() {
    return localStorage.getItem(PIN_KEY) || '';
  }

  function setPin(pin) {
    localStorage.setItem(PIN_KEY, pin);
  }

  function formatWhen(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---- Views ----
  function showView(name) {
    $$('.tab').forEach((t) => {
      const on = t.dataset.view === name;
      t.classList.toggle('on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $$('.view').forEach((v) => {
      const on = v.id === 'view-' + name;
      v.classList.toggle('on', on);
      v.hidden = !on;
    });
    if (name === 'open') renderOpen();
    if (name === 'answers') renderAnswers();
  }

  $$('.tab').forEach((t) => {
    t.addEventListener('click', () => showView(t.dataset.view));
  });

  // ---- Ask form ----
  const tagSelect = $('#qTag');
  const tagCustom = $('#qTagCustom');
  tagSelect.addEventListener('change', () => {
    const custom = tagSelect.value === '__custom';
    tagCustom.classList.toggle('hidden', !custom);
    tagCustom.required = custom;
    if (custom) tagCustom.focus();
  });

  $('#askForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = $('#qText').value.trim();
    if (!text) return;
    let tag = tagSelect.value;
    if (tag === '__custom') {
      tag = tagCustom.value.trim() || 'Other';
    }
    /** @type {Question} */
    const q = {
      id: uid(),
      text,
      tag,
      askedAt: new Date().toISOString(),
      status: 'open'
    };
    const list = loadQuestions();
    list.unshift(q);
    saveQuestions(list);
    $('#qText').value = '';
    tagSelect.value = 'Life';
    tagCustom.value = '';
    tagCustom.classList.add('hidden');
    tagCustom.required = false;
    const thanks = $('#askThanks');
    thanks.classList.remove('hidden');
    setTimeout(() => thanks.classList.add('hidden'), 3200);
    updateOpenBadge();
  });

  // ---- Dad mode ----
  function renderDadBar() {
    const locked = $('#dadLocked');
    const unlocked = $('#dadUnlocked');
    if (isDad()) {
      locked.classList.add('hidden');
      unlocked.classList.remove('hidden');
    } else {
      locked.classList.remove('hidden');
      unlocked.classList.add('hidden');
    }
  }

  $('#dadUnlock').addEventListener('click', () => {
    const entered = $('#dadPin').value.trim();
    if (!entered) {
      $('#dadPin').focus();
      return;
    }
    const existing = getPin();
    if (!existing) {
      setPin(entered);
      setDad(true);
      $('#dadPin').value = '';
      renderDadBar();
      renderOpen();
      return;
    }
    if (entered === existing) {
      setDad(true);
      $('#dadPin').value = '';
      renderDadBar();
      renderOpen();
    } else {
      $('#dadPin').value = '';
      $('#dadPin').placeholder = 'Wrong PIN — try again';
      $('#dadPin').focus();
    }
  });

  $('#dadPin').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      $('#dadUnlock').click();
    }
  });

  $('#dadLock').addEventListener('click', () => {
    setDad(false);
    renderDadBar();
    renderOpen();
  });

  // ---- Open inbox ----
  function updateOpenBadge() {
    const n = loadQuestions().filter((q) => q.status === 'open').length;
    const badge = $('#openCount');
    if (n > 0) {
      badge.hidden = false;
      badge.textContent = String(n);
    } else {
      badge.hidden = true;
    }
  }

  function renderOpen() {
    renderDadBar();
    const list = loadQuestions().filter((q) => q.status === 'open');
    const host = $('#openList');
    const empty = $('#openEmpty');
    host.innerHTML = '';
    if (!list.length) {
      empty.classList.remove('hidden');
      updateOpenBadge();
      return;
    }
    empty.classList.add('hidden');
    list.forEach((q) => {
      const el = document.createElement('article');
      el.className = 'item';
      el.dataset.id = q.id;
      el.innerHTML = `
        <div class="item-meta">
          <span class="chip">${escapeHtml(q.tag)}</span>
          <span>Asked ${escapeHtml(formatWhen(q.askedAt))}</span>
        </div>
        <p class="q-text">${escapeHtml(q.text)}</p>
        <div class="answer-box ${isDad() ? '' : 'hidden'}">
          <label>Your answer (from what you’ve lived)</label>
          <textarea rows="4" placeholder="Write as Dad. Real life. No auto-fill."></textarea>
          <button type="button" class="btn primary small save-answer">Save answer</button>
        </div>
      `;
      host.appendChild(el);
    });
    host.querySelectorAll('.save-answer').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!isDad()) return;
        const item = btn.closest('.item');
        const id = item.dataset.id;
        const answer = item.querySelector('textarea').value.trim();
        if (!answer) {
          item.querySelector('textarea').focus();
          return;
        }
        const all = loadQuestions();
        const idx = all.findIndex((x) => x.id === id);
        if (idx < 0) return;
        all[idx] = {
          ...all[idx],
          status: 'answered',
          answer,
          answeredAt: new Date().toISOString()
        };
        saveQuestions(all);
        updateOpenBadge();
        renderOpen();
      });
    });
    updateOpenBadge();
  }

  // ---- Answers library ----
  function allTagsFromData() {
    const tags = new Set(SEED_TAGS);
    loadQuestions().forEach((q) => {
      if (q.tag) tags.add(q.tag);
    });
    return [...tags];
  }

  function fillFilter() {
    const sel = $('#filterTag');
    const current = sel.value;
    sel.innerHTML = '<option value="">All answers</option>';
    allTagsFromData().forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      sel.appendChild(opt);
    });
    if ([...sel.options].some((o) => o.value === current)) sel.value = current;
  }

  function renderAnswers() {
    fillFilter();
    const filter = $('#filterTag').value;
    let list = loadQuestions().filter((q) => q.status === 'answered');
    if (filter) list = list.filter((q) => q.tag === filter);
    list.sort((a, b) => String(b.answeredAt || '').localeCompare(String(a.answeredAt || '')));
    const host = $('#answerList');
    const empty = $('#answerEmpty');
    host.innerHTML = '';
    if (!list.length) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    list.forEach((q) => {
      const el = document.createElement('article');
      el.className = 'item';
      el.innerHTML = `
        <div class="item-meta">
          <span class="chip">${escapeHtml(q.tag)}</span>
          <span>Answered ${escapeHtml(formatWhen(q.answeredAt || q.askedAt))}</span>
        </div>
        <p class="q-text">${escapeHtml(q.text)}</p>
        <div class="a-block">
          <p class="a-label">Dad</p>
          <p class="a-text">${escapeHtml(q.answer || '')}</p>
        </div>
      `;
      host.appendChild(el);
    });
  }

  $('#filterTag').addEventListener('change', renderAnswers);

  // ---- Boot ----
  updateOpenBadge();
  renderDadBar();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
