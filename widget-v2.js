(function () {
  'use strict';

  const WORKER_URL = 'https://plain-bush-fa6chatbotfilmfy.gavreliuk54.workers.dev';
  // Telegram тепер у Cloudflare Worker — ключі не видно в браузері

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

  const CSS = `
    #sg-root {
      position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #sg-btn {
      width: 58px; height: 58px; border-radius: 50%;
      background: #1c3d2e; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,.22);
      transition: transform .2s, box-shadow .2s; position: relative;
    }
    #sg-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.28); }
    #sg-btn svg { width: 26px; height: 26px; stroke: #fff; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    #sg-badge {
      position: absolute; top: -2px; right: -2px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #e53e3e; border: 2px solid #fff;
      display: none; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; color: #fff;
    }
    #sg-box {
      position: absolute; bottom: 70px; right: 0; width: 340px;
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,.15), 0 2px 8px rgba(0,0,0,.08);
      display: flex; flex-direction: column; overflow: hidden;
      max-height: calc(100vh - 120px);
      transition: opacity .2s ease, transform .2s ease;
      transform-origin: bottom right;
    }
    #sg-box.hidden { opacity: 0; transform: scale(.95) translateY(8px); pointer-events: none; }
    #sg-hd {
      background: #1c3d2e; padding: 14px 16px;
      display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    .sg-hav {
      width: 38px; height: 38px; border-radius: 50%;
      background: rgba(255,255,255,.18);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .sg-htxt { flex: 1; min-width: 0; }
    .sg-hname { color: #fff; font-size: 14px; font-weight: 600; line-height: 1.2; }
    .sg-hsub { color: rgba(255,255,255,.6); font-size: 11px; margin-top: 2px; display: flex; align-items: center; gap: 5px; }
    .sg-online { width: 6px; height: 6px; background: #68d391; border-radius: 50%; flex-shrink: 0; }
    #sg-x {
      background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,.5); font-size: 18px; line-height: 1;
      padding: 2px 4px; transition: color .15s; flex-shrink: 0;
    }
    #sg-x:hover { color: #fff; }
    #sg-log {
      flex: 1; overflow-y: auto; padding: 14px 12px;
      display: flex; flex-direction: column; gap: 10px;
      background: #f7f6f3; min-height: 280px; max-height: 360px;
    }
    #sg-log::-webkit-scrollbar { width: 3px; }
    #sg-log::-webkit-scrollbar-thumb { background: #d0c8bc; border-radius: 2px; }
    .sg-row { display: flex; align-items: flex-end; gap: 7px; }
    .sg-row.u { flex-direction: row-reverse; }
    .sg-ava {
      width: 26px; height: 26px; border-radius: 50%; background: #1c3d2e;
      flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #fff;
    }
    .sg-bubble {
      max-width: 76%; padding: 9px 13px; font-size: 14px; line-height: 1.55;
      word-break: break-word; white-space: pre-wrap; border-radius: 14px;
    }
    .sg-row.b .sg-bubble {
      background: #fff; color: #1a1a1a; border-bottom-left-radius: 3px;
      box-shadow: 0 1px 3px rgba(0,0,0,.08);
    }
    .sg-row.u .sg-bubble { background: #1c3d2e; color: #fff; border-bottom-right-radius: 3px; }
    .sg-typing .sg-bubble { padding: 11px 14px; }
    .sg-dots span {
      display: inline-block; width: 6px; height: 6px;
      background: #b0a898; border-radius: 50%; margin: 0 2px;
      animation: sg-b 1.2s infinite;
    }
    .sg-dots span:nth-child(2) { animation-delay: .2s; }
    .sg-dots span:nth-child(3) { animation-delay: .4s; }
    @keyframes sg-b { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
    .sg-ts { text-align: center; font-size: 11px; color: #b8b0a4; margin: 2px 0; }
    #sg-ft {
      display: flex; gap: 8px; padding: 10px 12px;
      border-top: 1px solid #ede8e0; background: #fff;
      flex-shrink: 0; align-items: flex-end;
    }
    #sg-ta {
      flex: 1; border: 1.5px solid #ddd7ce; border-radius: 10px;
      padding: 9px 12px; font-size: 14px; line-height: 1.4;
      resize: none; outline: none; max-height: 80px;
      font-family: inherit; color: #1a1a1a;
      background: #faf8f5; transition: border-color .15s;
    }
    #sg-ta:focus { border-color: #1c3d2e; background: #fff; }
    #sg-ta::placeholder { color: #b8b0a4; }
    #sg-go {
      width: 38px; height: 38px; border-radius: 10px;
      background: #1c3d2e; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background .15s; padding: 0;
    }
    #sg-go:hover { background: #142d21; }
    #sg-go:disabled { background: #c5bdb4; cursor: not-allowed; }
    #sg-go svg { width: 17px; height: 17px; stroke: #fff; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    #sg-pw {
      text-align: center; font-size: 10px; color: #c5bdb4;
      padding: 5px; background: #fff; flex-shrink: 0;
      border-top: 1px solid #f0ebe2; letter-spacing: .02em;
    }
    @media (max-width: 400px) {
      #sg-root { bottom: 16px; right: 16px; }
      #sg-box  { width: calc(100vw - 32px); right: 0; }
    }
  `;

  let open = false, busy = false, started = false;
  let hist = [];
  let ses  = { name: null, contact: null, price: null, product: null, address: null, addressSent: false };

  function inject() {
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
    const r = document.createElement('div');
    r.id = 'sg-root';
    r.innerHTML = `
      <div id="sg-box" class="hidden">
        <div id="sg-hd">
          <div class="sg-hav">M</div>
          <div class="sg-htxt">
            <div class="sg-hname">Marta — Doradca</div>
            <div class="sg-hsub"><span class="sg-online"></span>elastyczne-szklo.com</div>
          </div>
          <button id="sg-x" aria-label="Zamknij">✕</button>
        </div>
        <div id="sg-log" role="log" aria-live="polite"></div>
        <div id="sg-ft">
          <textarea id="sg-ta" rows="1" placeholder="Napisz wiadomość…"></textarea>
          <button id="sg-go" aria-label="Wyślij">
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <div id="sg-pw">elastyczne-szklo.com</div>
      </div>
      <button id="sg-btn" aria-label="Otwórz czat">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span id="sg-badge"></span>
      </button>
    `;
    document.body.appendChild(r);
  }

  const el = id => document.getElementById(id);
  function scroll() { const l = el('sg-log'); l.scrollTop = l.scrollHeight; }

  function addTime() {
    const d = new Date(), t = document.createElement('div');
    t.className = 'sg-ts';
    t.textContent = d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
    el('sg-log').appendChild(t);
  }
  function addBot(text) {
    el('sg-log').querySelector('.sg-typing')?.remove();
    const row = document.createElement('div');
    row.className = 'sg-row b';
    row.innerHTML = `<div class="sg-ava">M</div><div class="sg-bubble">${text.replace(/\n/g,'<br>')}</div>`;
    el('sg-log').appendChild(row); scroll();
  }
  function addUser(text) {
    const row = document.createElement('div');
    row.className = 'sg-row u';
    row.innerHTML = `<div class="sg-bubble">${text.replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</div>`;
    el('sg-log').appendChild(row); scroll();
  }
  function showTyping() {
    const row = document.createElement('div');
    row.className = 'sg-row b sg-typing';
    row.innerHTML = `<div class="sg-ava">M</div><div class="sg-bubble"><span class="sg-dots"><span></span><span></span><span></span></span></div>`;
    el('sg-log').appendChild(row); scroll();
  }
  function lock(v) { el('sg-ta').disabled = v; el('sg-go').disabled = v; }

  async function openChat() {
    open = true;
    el('sg-box').classList.remove('hidden');
    el('sg-badge').style.display = 'none';
    if (!started) {
      started = true;
      showTyping();
      await new Promise(r => setTimeout(r, 600));
      el('sg-log').querySelector('.sg-typing')?.remove();
      addBot('Dzień dobry!\n\nJestem Marta — doradca w elastyczne-szklo.com. Pomogę dobrać odpowiednie szkło do Pana/Pani stołu.\n\nCzy chce Pan/Pani złożyć zamówienie, czy ma pytanie o produkt?');
      addTime();
    }
    el('sg-ta').focus();
  }
  function closeChat() { open = false; el('sg-box').classList.add('hidden'); }

  // ── Витягуємо дані ──────────────────────────────────────────────────────────
  function getPhone(t) {
    const m = t.match(/(\+48[\s-]?)?([4-9]\d{2}[\s-]?\d{3}[\s-]?\d{3})/);
    return m ? m[0].replace(/[\s-]/g,'') : null;
  }
  function getEmail(t) {
    const m = t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return m ? m[0] : null;
  }
  function getName(t) {
    // Ім'я + прізвище
    const m1 = t.match(/[A-ZŻŹĆĄŚĘŁÓŃ][a-zżźćąśęłóń]{1,}\s+[A-ZŻŹĆĄŚĘŁÓŃ][a-zżźćąśęłóń]{1,}/);
    if (m1) return m1[0];
    // Після "jestem/nazywam się/imię:"
    const m2 = t.match(/(?:jestem|nazywam się|imię[:\s]+)\s*([A-Za-zżźćąśęłóńŻŹĆĄŚĘŁÓŃ]{2,})/i);
    if (m2) return m2[1];
    // Одне слово з великої літери (якщо вже є контакт)
    const m3 = t.match(/^([A-ZŻŹĆĄŚĘŁÓŃ][a-zżźćąśęłóń]{2,})$/m);
    if (m3) return m3[1];
    return null;
  }
  function getNameFromBotReply(botText) {
    // Бот каже "Dziękuję Pavlo!" або "Dziękuję, Pavlo"
    const m = botText.match(/Dziękuję[,!\s]+([A-ZŻŹĆĄŚĘŁÓŃ][a-zżźćąśęłóń]{2,})/);
    return m ? m[1] : null;
  }
  function getPrice(t) {
    // Остання ціна в тексті (найбільш конкретна)
    const all = [...t.matchAll(/(\d+)\s*zł/g)];
    return all.length ? all[all.length-1][1] : null;
  }
  function getProduct(userText, botText) {
    const allText = hist.map(m => m.content).join(' ');
    // Розміри
    const dimMatches = [...allText.matchAll(/(\d{2,3})\s*[xX×]\s*(\d{2,3})\s*cm/g)];
    const dims = [...new Set(dimMatches.map(m => `${m[1]}×${m[2]} cm`))];
    // Товщина
    const thickMatch = allText.match(/[Bb]łyszczące\s*(1\.5|2)mm|[Mm]atowe\s*1\.5mm|[Ww]yprzedaż/);
    const thick = thickMatch ? thickMatch[0].replace(/[Bb]łyszczące/,'Błyszczące').replace(/[Mm]atowe/,'Matowe') : '';
    // Коло
    const circleMatch = allText.match(/śr(?:ednica)?[\.:\s]*(\d{2,3})\s*cm|okrąg[\s:]+?(\d{2,3})|kolo[\s:]+?(\d{2,3})/i);
    const circle = circleMatch ? `okrąg ⌀${circleMatch[1]||circleMatch[2]||circleMatch[3]} cm` : '';
    const parts = [thick, ...dims, circle].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  }
  function getAddress(t) {
    // Витягуємо тільки адресну частину — без email та телефону
    let clean = t
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
      .replace(/(\+48[\s-]?)?[4-9]\d{2}[\s-]?\d{3}[\s-]?\d{3}/g, '')
      .replace(/\s+/g, ' ').trim();

    // Поштовий індекс — сильний сигнал
    if (/\d{2}-\d{3}/.test(clean)) {
      // Беремо частину від вулиці або міста до кінця
      const m = clean.match(/([A-Za-zżźćąśęłóńŻŹĆĄŚĘŁÓŃ][\w\s.,\/\-]+\d{2}-\d{3}[\w\s]*)/);
      return m ? m[0].trim() : clean;
    }
    if (/ul\.|ulica|al\.|aleja/i.test(clean)) return clean;
    if (/\b(warszawa|kraków|gdańsk|wrocław|poznań|łódź|katowice|lublin|białystok|szczecin|rzeszów|bydgoszcz|toruń|olsztyn|gdynia|częstochowa|radom|sosnowiec|kielce|gliwice|zabrze|bytom|bielsko)\b/i.test(clean)) return clean;
    return null;
  }
  function buildSummary() {
    // Останні 3 повідомлення клієнта
    const userMsgs = hist.filter(m => m.role === 'user').slice(-3);
    return userMsgs.map(m => m.content.slice(0, 80)).join(' | ');
  }

  // ── Telegram ────────────────────────────────────────────────────────────────
  async function sendLead() {
    const utm = getUTM();
    const priceNum = parseFloat(ses.price) || 0;
    const delivery = priceNum >= 500 ? 'gratis' : '18';
    const total    = priceNum >= 500 ? priceNum : priceNum + 18;
    try {
      const r = await fetch(WORKER_URL + '/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         ses.name    || '',
          contact:      ses.contact || '',
          product:      ses.product || '',
          price:        ses.price   || '',
          delivery:     delivery,
          total:        total ? String(total) : '',
          address:      ses.address || '',
          summary:      buildSummary(),
          full_chat:    hist.map(m => (m.role==='user'?'👤 ':'🤖 ') + m.content).join('\n---\n'),
          utm_source:   utm.source,
          utm_medium:   utm.medium,
          utm_campaign: utm.campaign,
        }),
      });
      const d = await r.json();
      if (d.ok) console.log('[SG] Лід відправлено в Telegram');
      else console.error('[SG] Telegram error:', d.error);
    } catch(e) { console.error('[SG] Lead send error:', e); }
  }



  // ── Відправка повідомлення ──────────────────────────────────────────────────
  async function send() {
    const ta   = el('sg-ta');
    const text = ta.value.trim();
    if (!text || busy) return;
    ta.value = ''; ta.style.height = 'auto';
    busy = true; lock(true);
    addUser(text); showTyping();

    const contact = getPhone(text) || getEmail(text);
    const name    = getName(text);
    const addr    = getAddress(text);
    if (contact && !ses.contact) ses.contact = contact;
    if (name    && !ses.name)    ses.name    = name;
    if (addr    && !ses.address) ses.address = addr;

    hist.push({ role: 'user', content: text });

    try {
      const res   = await fetch(WORKER_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: hist }),
      });
      const data  = await res.json();
      const reply = data.content?.[0]?.text || 'Przepraszamy, spróbuj ponownie.';
      hist.push({ role: 'assistant', content: reply });

      const price      = getPrice(reply);
      const product    = getProduct(text, reply);
      const nameInBot  = getNameFromBotReply(reply);
      if (price)                    ses.price   = price;
      if (product && !ses.product)  ses.product = product;
      if (nameInBot && !ses.name)   ses.name    = nameInBot;

      addBot(reply); addTime();

      // Дебаунс 3 сек — скільки б даних не прийшло в одному/кількох повідомленнях,
      // відправляємо ОДИН раз після паузи
      if (ses.contact && !ses.leadSent) {
        ses.leadSent = true;
      }
      if (ses.leadSent) {
        if (ses._leadTimer) clearTimeout(ses._leadTimer);
        ses._leadTimer = setTimeout(() => {
          ses._leadTimer = null;
          sendLead();
        }, 3000);
      }

    } catch {
      el('sg-log').querySelector('.sg-typing')?.remove();
      addBot('Brak połączenia. Proszę odświeżyć stronę.');
    } finally {
      busy = false; lock(false); el('sg-ta').focus();
    }
  }

  function autoOpen() {
    if (sessionStorage.getItem('sg_v')) return;
    setTimeout(() => { if (!open) el('sg-badge').style.display = 'flex'; }, 10000);
    setTimeout(() => { if (!open) { sessionStorage.setItem('sg_v','1'); openChat(); } }, 25000);
  }

  function init() {
    inject();
    el('sg-btn').addEventListener('click', () => open ? closeChat() : openChat());
    el('sg-x').addEventListener('click', closeChat);
    el('sg-go').addEventListener('click', send);
    el('sg-ta').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    el('sg-ta').addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });
    autoOpen();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
