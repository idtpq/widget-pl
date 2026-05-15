/**
 * Elastyczne Szkło — Chat Widget
 * Підключення на сайт (перед </body>):
 *
 *   <script src="https://plain-bush-fa6chatbotfilmfy.gavreliuk54.workers.dev/widget.js" defer></script>
 *
 * АБО якщо файл лежить окремо:
 *   <script src="/widget.js" defer></script>
 *
 * WORKER_URL нижче — замінити на свій Cloudflare Worker
 */
(function () {
  'use strict';

  const WORKER_URL = 'https://plain-bush-fa6chatbotfilmfy.gavreliuk54.workers.dev';

  // Telegram (необов'язково — залиш порожнім якщо не налаштовано)
  const TG_TOKEN   = '';
  const TG_CHAT_ID = '';

  // ── UTM ────────────────────────────────────────────────────────────────────
  function getUTM() {
    const p = new URLSearchParams(window.location.search);
    return {
      source:   p.get('utm_source')   || sessionStorage.getItem('sg_utm_source')   || '',
      medium:   p.get('utm_medium')   || sessionStorage.getItem('sg_utm_medium')   || '',
      campaign: p.get('utm_campaign') || sessionStorage.getItem('sg_utm_campaign') || '',
    };
  }
  ['source','medium','campaign'].forEach(k => {
    const v = new URLSearchParams(window.location.search).get('utm_'+k);
    if (v) sessionStorage.setItem('sg_utm_'+k, v);
  });

  // ── CSS ────────────────────────────────────────────────────────────────────
  const CSS = `
    #sg-wrap * { box-sizing: border-box; margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; }

    /* Бульбашка */
    #sg-bubble {
      position: fixed; bottom: 28px; right: 28px; z-index: 99999;
      width: 62px; height: 62px; border-radius: 50%;
      background: #1a3a2a; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,.25);
      transition: transform .2s, box-shadow .2s;
    }
    #sg-bubble:hover { transform: scale(1.07); box-shadow: 0 6px 28px rgba(0,0,0,.3); }
    #sg-bubble svg { width: 28px; height: 28px; color: #fff; }
    #sg-bubble .sg-notif {
      position: absolute; top: -3px; right: -3px;
      width: 20px; height: 20px; background: #c0392b;
      border-radius: 50%; border: 2px solid #fff;
      display: none; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #fff;
      font-family: Arial, sans-serif;
    }

    /* Вікно */
    #sg-win {
      position: fixed; bottom: 104px; right: 28px; z-index: 99998;
      width: 360px; max-width: calc(100vw - 40px);
      height: 540px; max-height: calc(100vh - 130px);
      background: #faf9f7;
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0,0,0,.18);
      display: flex; flex-direction: column; overflow: hidden;
      transition: opacity .25s, transform .25s;
      transform-origin: bottom right;
    }
    #sg-win.sg-closed {
      opacity: 0; transform: scale(.92) translateY(12px); pointer-events: none;
    }

    /* Header */
    #sg-head {
      background: #1a3a2a;
      padding: 16px 18px;
      display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    }
    .sg-av {
      width: 42px; height: 42px; border-radius: 50%;
      background: rgba(255,255,255,.15);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
    }
    .sg-hinfo { flex: 1; }
    .sg-hname { color: #fff; font-size: 15px; font-weight: 700; letter-spacing: .02em; }
    .sg-hsub  { color: rgba(255,255,255,.65); font-size: 12px; margin-top: 3px; font-family: Arial, sans-serif; }
    .sg-dot { display: inline-block; width: 7px; height: 7px; background: #5cb85c; border-radius: 50%; margin-right: 5px; animation: sg-pulse 2s infinite; }
    @keyframes sg-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    #sg-close-btn { background: none; border: none; cursor: pointer; color: rgba(255,255,255,.6); line-height: 1; font-size: 22px; transition: color .15s; padding: 0; font-family: Arial, sans-serif; }
    #sg-close-btn:hover { color: #fff; }

    /* Messages */
    #sg-msgs {
      flex: 1; overflow-y: auto; padding: 18px 14px;
      display: flex; flex-direction: column; gap: 12px;
      background: #f5f3ef;
      scroll-behavior: smooth;
    }
    #sg-msgs::-webkit-scrollbar { width: 4px; }
    #sg-msgs::-webkit-scrollbar-thumb { background: #c8c0b0; border-radius: 2px; }

    .sg-row { display: flex; gap: 8px; align-items: flex-end; }
    .sg-row.sg-u { flex-direction: row-reverse; }

    .sg-av-sm {
      width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
      background: #d9d4cc; display: flex; align-items: center; justify-content: center; font-size: 15px;
    }

    .sg-bbl {
      max-width: 80%; padding: 11px 15px; border-radius: 16px;
      font-size: 15px; line-height: 1.6; word-break: break-word;
      white-space: pre-wrap;
    }
    .sg-row.sg-b .sg-bbl {
      background: #fff; color: #2c2416;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,.07);
    }
    .sg-row.sg-u .sg-bbl {
      background: #1a3a2a; color: #fff;
      border-bottom-right-radius: 4px;
    }

    /* Typing */
    .sg-typing .sg-bbl { padding: 13px 16px; }
    .sg-dots span {
      display: inline-block; width: 7px; height: 7px;
      background: #a09580; border-radius: 50%; margin: 0 2px;
      animation: sg-bounce 1.3s infinite;
    }
    .sg-dots span:nth-child(2) { animation-delay: .2s; }
    .sg-dots span:nth-child(3) { animation-delay: .4s; }
    @keyframes sg-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

    /* Time */
    .sg-time { font-size: 11px; color: #b0a898; text-align: center; margin: 4px 0; font-family: Arial, sans-serif; }

    /* Footer */
    #sg-foot {
      padding: 12px 14px; border-top: 1px solid #e8e2d8;
      background: #fff; display: flex; gap: 8px; flex-shrink: 0;
    }
    #sg-inp {
      flex: 1; border: 1.5px solid #d8d0c4; border-radius: 10px;
      padding: 10px 14px; font-size: 15px; outline: none;
      resize: none; line-height: 1.45; max-height: 90px;
      font-family: Georgia, serif; color: #2c2416;
      background: #faf9f7; transition: border-color .15s;
    }
    #sg-inp:focus { border-color: #1a3a2a; background: #fff; }
    #sg-inp::placeholder { color: #b0a898; font-style: italic; }
    #sg-send {
      width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
      background: #1a3a2a; color: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      align-self: flex-end; transition: background .15s;
    }
    #sg-send:hover { background: #0f2518; }
    #sg-send:disabled { background: #b0a898; cursor: not-allowed; }
    #sg-send svg { width: 18px; height: 18px; }

    /* Powered by */
    #sg-powered {
      text-align: center; padding: 6px; font-size: 11px;
      color: #b0a898; background: #fff; border-top: 1px solid #f0ebe2;
      font-family: Arial, sans-serif; flex-shrink: 0;
    }

    @media (max-width: 420px) {
      #sg-win { right: 8px; left: 8px; width: auto; bottom: 90px; }
      #sg-bubble { right: 16px; bottom: 16px; }
    }
  `;

  // ── Стан ───────────────────────────────────────────────────────────────────
  let isOpen   = false;
  let history  = [];
  let typing   = false;
  let leadSent = false;
  let session  = { name: null, contact: null, price: null };

  // ── Будуємо UI ─────────────────────────────────────────────────────────────
  function build() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.id = 'sg-wrap';

    // Бульбашка
    wrap.innerHTML += `
      <button id="sg-bubble" aria-label="Otwórz czat z doradcą">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="sg-notif" id="sg-notif">1</span>
      </button>

      <div id="sg-win" class="sg-closed" role="dialog" aria-label="Czat z doradcą">
        <div id="sg-head">
          <div class="sg-av">🪴</div>
          <div class="sg-hinfo">
            <div class="sg-hname">Marta — Doradca</div>
            <div class="sg-hsub"><span class="sg-dot"></span>Elastyczne-szklo.com</div>
          </div>
          <button id="sg-close-btn" aria-label="Zamknij">✕</button>
        </div>
        <div id="sg-msgs" role="log" aria-live="polite"></div>
        <div id="sg-foot">
          <textarea id="sg-inp" rows="1" placeholder="Napisz wiadomość…" aria-label="Wiadomość"></textarea>
          <button id="sg-send" aria-label="Wyślij">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div id="sg-powered">elastyczne-szklo.com</div>
      </div>
    `;

    document.body.appendChild(wrap);
  }

  // ── Утиліти ────────────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  function scrollDown() {
    const m = $('sg-msgs');
    m.scrollTop = m.scrollHeight;
  }

  function nowTime() {
    return new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  }

  function addTime() {
    const t = document.createElement('div');
    t.className = 'sg-time';
    t.textContent = nowTime();
    $('sg-msgs').appendChild(t);
  }

  function addBotMsg(text) {
    $('sg-msgs').querySelector('.sg-typing')?.remove();
    const row = document.createElement('div');
    row.className = 'sg-row sg-b';
    row.innerHTML = `
      <div class="sg-av-sm">🪴</div>
      <div class="sg-bbl">${text.replace(/\n/g, '<br>')}</div>
    `;
    $('sg-msgs').appendChild(row);
    scrollDown();
  }

  function addUserMsg(text) {
    const row = document.createElement('div');
    row.className = 'sg-row sg-u';
    row.innerHTML = `<div class="sg-bbl">${text.replace(/</g,'&lt;')}</div>`;
    $('sg-msgs').appendChild(row);
    scrollDown();
  }

  function showTyping() {
    const row = document.createElement('div');
    row.className = 'sg-row sg-b sg-typing';
    row.innerHTML = `
      <div class="sg-av-sm">🪴</div>
      <div class="sg-bbl"><span class="sg-dots"><span></span><span></span><span></span></span></div>
    `;
    $('sg-msgs').appendChild(row);
    scrollDown();
  }

  function setDisabled(v) {
    $('sg-inp').disabled  = v;
    $('sg-send').disabled = v;
  }

  // ── Відкрити / закрити ─────────────────────────────────────────────────────
  async function openChat() {
    isOpen = true;
    $('sg-win').classList.remove('sg-closed');
    $('sg-notif').style.display = 'none';
    if (!history.length) {
      showTyping();
      await new Promise(r => setTimeout(r, 700));
      $('sg-msgs').querySelector('.sg-typing')?.remove();
      addBotMsg('Dzień dobry! 😊 Jestem Marta — doradca w elastyczne-szklo.com.\n\nCzy chce Pan/Pani dobrać szkło ochronne do stołu, czy ma pytanie o produkt?');
      addTime();
    }
    $('sg-inp').focus();
  }

  function closeChat() {
    isOpen = false;
    $('sg-win').classList.add('sg-closed');
  }

  // ── Витягуємо дані ─────────────────────────────────────────────────────────
  function extractContact(text) {
    const phone = text.match(/(\+48[\s-]?)?([4-9]\d{2}[\s-]?\d{3}[\s-]?\d{3})/);
    if (phone) return phone[0].replace(/[\s-]/g,'');
    const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return email ? email[0] : null;
  }
  function extractName(text) {
    const m = text.match(/[A-ZŻŹĆĄŚĘŁÓŃ][a-zżźćąśęłóń]+\s+[A-ZŻŹĆĄŚĘŁÓŃ][a-zżźćąśęłóń]+/);
    if (m) return m[0];
    const m2 = text.match(/(?:jestem|nazywam się|mam na imię)\s+([A-ZŻŹĆĄŚĘŁÓŃ][a-zżźćąśęłóń]+)/i);
    return m2 ? m2[1] : null;
  }
  function extractPrice(text) {
    const m = text.match(/(\d+)\s*zł/);
    return m ? m[1] : null;
  }

  // ── Telegram ───────────────────────────────────────────────────────────────
  async function tgSend(text) {
    if (!TG_TOKEN || !TG_CHAT_ID) return;
    fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'HTML' }),
    }).catch(() => {});
  }

  // ── Відправка повідомлення ─────────────────────────────────────────────────
  async function send() {
    const inp  = $('sg-inp');
    const text = inp.value.trim();
    if (!text || typing) return;

    inp.value = ''; inp.style.height = 'auto';
    typing = true;
    setDisabled(true);
    addUserMsg(text);
    showTyping();

    // Дані з повідомлення клієнта
    const contact = extractContact(text);
    const name    = extractName(text);
    if (contact && !session.contact) session.contact = contact;
    if (name    && !session.name)    session.name    = name;

    history.push({ role: 'user', content: text });

    try {
      const res  = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data  = await res.json();
      const reply = data.content?.[0]?.text || 'Przepraszamy, spróbuj ponownie.';

      history.push({ role: 'assistant', content: reply });

      const price = extractPrice(reply);
      if (price) session.price = price;

      addBotMsg(reply);
      addTime();

      // Telegram — відправляємо ліда при першому контакті
      if (session.contact && !leadSent) {
        leadSent = true;
        const utm = getUTM();
        const utmStr = [utm.source, utm.medium, utm.campaign].filter(Boolean).join(' / ') || 'прямий';
        const conv = history.slice(-8).map(m => `${m.role === 'user' ? '👤' : '🤖'} ${m.content.slice(0, 150)}`).join('\n');
        tgSend(
          `🔥 <b>Новий лід — Elastyczne Szkło</b>\n\n` +
          `👤 ${session.name || '—'}\n📞 ${session.contact}\n💰 ${session.price || '—'} zł\n📣 UTM: ${utmStr}\n\n📝 Розмова:\n${conv}`
        );
      }

    } catch (e) {
      $('sg-msgs').querySelector('.sg-typing')?.remove();
      addBotMsg('Przepraszamy, brak połączenia. Proszę odświeżyć stronę.');
    } finally {
      typing = false;
      setDisabled(false);
      $('sg-inp').focus();
    }
  }

  // ── Авто-відкриття ─────────────────────────────────────────────────────────
  function scheduleAutoOpen() {
    if (sessionStorage.getItem('sg_opened')) return;
    setTimeout(() => {
      if (!isOpen) $('sg-notif').style.display = 'flex';
    }, 8000);
    setTimeout(() => {
      if (!isOpen) {
        sessionStorage.setItem('sg_opened', '1');
        openChat();
      }
    }, 20000);
  }

  // ── Ініціалізація ──────────────────────────────────────────────────────────
  function init() {
    build();

    $('sg-bubble').addEventListener('click', () => isOpen ? closeChat() : openChat());
    $('sg-close-btn').addEventListener('click', closeChat);
    $('sg-send').addEventListener('click', send);

    const inp = $('sg-inp');
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    inp.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 90) + 'px';
    });

    scheduleAutoOpen();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
