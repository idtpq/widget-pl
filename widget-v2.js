(function () {
  'use strict';

  const WORKER_URL = 'https://bot.gavreliuk54.workers.dev';

  function getUTM() {
    return {
      source:   new URLSearchParams(location.search).get('utm_source')   || sessionStorage.getItem('sg_utm_source')   || '',
      medium:   new URLSearchParams(location.search).get('utm_medium')   || sessionStorage.getItem('sg_utm_medium')   || '',
      campaign: new URLSearchParams(location.search).get('utm_campaign') || sessionStorage.getItem('sg_utm_campaign') || '',
    };
  }
  ['source','medium','campaign'].forEach(k => {
    const v = new URLSearchParams(location.search).get('utm_'+k);
    if (v) sessionStorage.setItem('sg_utm_'+k, v);
  });

  function genSID() {
    // Короткий номер: № + 6 цифр
    return '№ ' + String(Math.floor(100000 + Math.random() * 900000));
  }

  const CSS = `
    #sg-root{position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}
    #sg-btn{width:58px;height:58px;border-radius:50%;background:#1c3d2e;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.22);transition:transform .2s,box-shadow .2s;position:relative;}
    #sg-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.28);}
    #sg-btn svg{width:26px;height:26px;stroke:#fff;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
    #sg-badge{position:absolute;top:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:#e53e3e;border:2px solid #fff;display:none;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;}
    #sg-tooltip{position:absolute;bottom:68px;right:0;background:#1c3d2e;color:#fff;font-size:13px;padding:10px 14px;border-radius:12px 12px 0 12px;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,.2);display:none;cursor:pointer;line-height:1.4;}
    #sg-tooltip:after{content:'';position:absolute;bottom:-6px;right:16px;border:6px solid transparent;border-top-color:#1c3d2e;border-bottom:none;}
    #sg-box{position:absolute;bottom:70px;right:0;width:340px;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.15);display:flex;flex-direction:column;overflow:hidden;max-height:calc(100vh - 120px);transition:opacity .2s,transform .2s;transform-origin:bottom right;}
    #sg-box.hidden{opacity:0;transform:scale(.95) translateY(8px);pointer-events:none;}
    #sg-hd{background:#1c3d2e;padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}
    .sg-hav{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0;}
    .sg-htxt{flex:1;min-width:0;}
    .sg-hname{color:#fff;font-size:14px;font-weight:600;}
    .sg-hsub{color:rgba(255,255,255,.6);font-size:11px;margin-top:2px;display:flex;align-items:center;gap:5px;}
    .sg-online{width:6px;height:6px;background:#68d391;border-radius:50%;animation:sg-pulse 2s infinite;}
    @keyframes sg-pulse{0%,100%{opacity:1}50%{opacity:.4}}
    #sg-x{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.5);font-size:18px;line-height:1;padding:2px 4px;transition:color .15s;flex-shrink:0;}
    #sg-x:hover{color:#fff;}
    #sg-sid{text-align:center;font-size:10px;color:#b8b0a4;padding:3px 0;background:#f7f6f3;font-family:monospace;flex-shrink:0;}
    #sg-log{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:10px;background:#f7f6f3;min-height:220px;max-height:300px;}
    #sg-log::-webkit-scrollbar{width:3px;}
    #sg-log::-webkit-scrollbar-thumb{background:#d0c8bc;border-radius:2px;}
    .sg-row{display:flex;align-items:flex-end;gap:7px;}
    .sg-row.u{flex-direction:row-reverse;}
    .sg-ava{width:26px;height:26px;border-radius:50%;background:#1c3d2e;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;}
    .sg-bubble{max-width:78%;padding:9px 13px;font-size:14px;line-height:1.55;word-break:break-word;white-space:pre-wrap;border-radius:14px;}
    .sg-row.b .sg-bubble{background:#fff;color:#1a1a1a;border-bottom-left-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.08);}
    .sg-row.u .sg-bubble{background:#1c3d2e;color:#fff;border-bottom-right-radius:3px;}
    .sg-typing .sg-bubble{padding:11px 14px;}
    .sg-dots span{display:inline-block;width:6px;height:6px;background:#b0a898;border-radius:50%;margin:0 2px;animation:sg-b 1.2s infinite;}
    .sg-dots span:nth-child(2){animation-delay:.2s}.sg-dots span:nth-child(3){animation-delay:.4s}
    @keyframes sg-b{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
    .sg-ts{text-align:center;font-size:11px;color:#b8b0a4;margin:2px 0;}
    #sg-qr{padding:6px 10px 4px;display:flex;flex-wrap:wrap;gap:6px;background:#f7f6f3;flex-shrink:0;min-height:0;}
    .sg-qbtn{background:#fff;border:1.5px solid #1c3d2e;color:#1c3d2e;border-radius:20px;padding:6px 13px;font-size:13px;cursor:pointer;transition:all .15s;font-family:inherit;line-height:1.3;}
    .sg-qbtn:hover{background:#1c3d2e;color:#fff;}
    .sg-pay-wrap{display:flex;justify-content:center;padding:8px 0;}
    .sg-pay-btn{display:inline-flex;align-items:center;gap:8px;background:#16a34a;color:#fff;text-decoration:none;padding:13px 22px;border-radius:12px;font-size:15px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,.15);transition:background .15s;}
    .sg-pay-btn:hover{background:#15803d;}
    .sg-cod-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 14px;font-size:13px;color:#15803d;text-align:center;margin:4px 12px;}
    #sg-ft{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #ede8e0;background:#fff;flex-shrink:0;align-items:flex-end;}
    #sg-ta{flex:1;border:1.5px solid #ddd7ce;border-radius:10px;padding:9px 12px;font-size:14px;line-height:1.4;resize:none;outline:none;max-height:80px;font-family:inherit;color:#1a1a1a;background:#faf8f5;transition:border-color .15s;}
    #sg-ta:focus{border-color:#1c3d2e;background:#fff;}
    #sg-ta::placeholder{color:#b8b0a4;}
    #sg-go{width:38px;height:38px;border-radius:10px;background:#1c3d2e;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s;padding:0;align-self:flex-end;}
    #sg-go:hover{background:#142d21;}
    #sg-go:disabled{background:#c5bdb4;cursor:not-allowed;}
    #sg-go svg{width:17px;height:17px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
    #sg-pw{text-align:center;font-size:10px;color:#c5bdb4;padding:5px;background:#fff;flex-shrink:0;border-top:1px solid #f0ebe2;}
    @media(max-width:400px){#sg-root{bottom:16px;right:16px;}#sg-box{width:calc(100vw - 32px);right:0;}}
  `;

  const SID = genSID();
  let open=false, busy=false, started=false;
  let hist=[];
  let ses={
    name:null,phone:null,email:null,contact:null,circleSize:null,
    price:null,product:null,address:null,
    paymentMethod:null,total:null,stripeUrl:null,
    // Стан відправки
    leadFired:false,        // лід відправлено в TG один раз
    paymentLinkSent:false,  // Stripe link згенеровано
    pendingAddressParts:[], // частини адреси, якщо клієнт пише її кількома повідомленнями
    sessionSavedOnce:false, // чи вже була створена/оновлена сесія в Sheets
    _saveTimer:null,        // таймер для відкладеного збереження сесії
  };

  function build(){
    const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);
    const r=document.createElement('div');r.id='sg-root';
    r.innerHTML=`
      <div id="sg-box" class="hidden">
        <div id="sg-hd">
          <div class="sg-hav">M</div>
          <div class="sg-htxt">
            <div class="sg-hname">Marta — Doradca</div>
            <div class="sg-hsub"><span class="sg-online"></span>elastyczne-szklo.com</div>
          </div>
          <button id="sg-x">✕</button>
        </div>
        <div id="sg-sid">ID czatu: ${SID}</div>
        <div id="sg-log" role="log" aria-live="polite"></div>
        <div id="sg-qr"></div>
        <div id="sg-ft">
          <textarea id="sg-ta" rows="1" placeholder="Napisz wiadomość…"></textarea>
          <button id="sg-go">
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <div id="sg-pw">elastyczne-szklo.com</div>
      </div>
      <div id="sg-tooltip">💬 Możemy pomóc — zapytaj!</div>
      <button id="sg-btn">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span id="sg-badge"></span>
      </button>
    `;
    document.body.appendChild(r);
  }

  const el=id=>document.getElementById(id);
  function scroll(){const l=el('sg-log');l.scrollTop=l.scrollHeight;}
  function addTime(){
    const d=new Date(),t=document.createElement('div');
    t.className='sg-ts';
    t.textContent=d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
    el('sg-log').appendChild(t);
  }
  function addBot(text){
    el('sg-log').querySelector('.sg-typing')?.remove();
    const row=document.createElement('div');row.className='sg-row b';
    row.innerHTML=`<div class="sg-ava">M</div><div class="sg-bubble">${text.replace(/\n/g,'<br>')}</div>`;
    el('sg-log').appendChild(row);scroll();
  }
  function addUser(text){
    const row=document.createElement('div');row.className='sg-row u';
    row.innerHTML=`<div class="sg-bubble">${text.replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</div>`;
    el('sg-log').appendChild(row);clearQR();scroll();
  }
  function showTyping(){
    const row=document.createElement('div');row.className='sg-row b sg-typing';
    row.innerHTML=`<div class="sg-ava">M</div><div class="sg-bubble"><span class="sg-dots"><span></span><span></span><span></span></span></div>`;
    el('sg-log').appendChild(row);scroll();
  }
  function lock(v){el('sg-ta').disabled=v;el('sg-go').disabled=v;}

  function setQR(buttons){
    const qr=el('sg-qr');qr.innerHTML='';
    buttons.forEach(label=>{
      const btn=document.createElement('button');
      btn.className='sg-qbtn';btn.textContent=label;
      btn.onclick=()=>send(label);
      qr.appendChild(btn);
    });
  }
  function clearQR(){el('sg-qr').innerHTML='';}

  function detectQR(botText){
    // Показуємо кнопки ТІЛЬКИ якщо в повідомленні є РІВНО ОДНЕ питання
    const questionCount = (botText.match(/[?]/g)||[]).length;
    if(questionCount > 1) return; // Два питання = не показуємо кнопки

    const t = botText.toLowerCase();

    // Не показуємо кнопки після підтвердження замовлення або платежу
    if(ses.paymentLinkSent) return;
    if(t.includes('przyjęłam zamówienie')) return;

    if(t.includes('złożyć zamówienie')||t.includes('pytanie o produkt')){
      setQR(['🛒 Chcę zamówić','❓ Mam pytanie']);
    } else if((t.includes('rodzaj blatu')||t.includes('jaki rodzaj blatu'))){
      setQR(['Drewno matowe','Szkło / lakier / połysk','Laminat']);
    } else if(t.includes('intensywnie')&&!t.includes('wymiary')){
      setQR(['Intensywnie (kuchnia/dzieci)','Rzadziej (biurko/salon)']);
    } else if(t.includes('1.5mm')&&t.includes('2mm')&&!t.includes('wymiary')){
      setQR(['1.5mm — tańsze','2mm — mocniejsze']);
    } else if((t.includes('okrągły')||t.includes('jest okrągły'))&&!t.includes('wymiary')){
      setQR(['Tak, okrągły','Nie, prostokątny']);
    } else if(t.includes('inne stoły')||t.includes('inne blaty')||t.includes('jeszcze inne')){
      setQR(['Tak, mam jeszcze','Nie, to wszystko']);
    } else if((t.includes('jak woli')&&t.includes('zapłaci'))||(t.includes('metod')&&t.includes('płat'))){
      setQR(['💳 Online (karta/BLIK)','🚚 Za pobraniem']);
    }
  }

  function showPayBtn(url, total){
    clearQR();
    // Змінюємо заголовок на "ID zamówienia"
    const sidEl = el('sg-sid');
    if(sidEl) sidEl.textContent = 'Nr zamówienia: ' + SID;

    const w = document.createElement('div');
    w.style.cssText = 'padding:8px 12px;';
    w.innerHTML = `
      <div style="font-size:13px;color:#374151;margin-bottom:8px;line-height:1.4;">
        Zamówienie <strong>${SID}</strong> zostanie przekazane do realizacji po opłaceniu.
      </div>
      <div style="display:flex;justify-content:center;margin-bottom:8px;">
        <a href="${url}" target="_blank" rel="noopener" class="sg-pay-btn">💳 Zapłać ${total} zł</a>
      </div>
      <div style="font-size:11px;color:#9ca3af;text-align:center;cursor:pointer;" onclick="window.__sgChangeToCOD&&window.__sgChangeToCOD(${total})">
        Zmienić na płatność za pobraniem →
      </div>`;
    el('sg-log').appendChild(w);scroll();

    // Register COD change handler
    window.__sgChangeToCOD = function(t) {
      ses.paymentMethod = 'cod';
      clearQR();
      showCOD(t);
      // Зміна методу — окреме повідомлення, не новий лід
      fireUpdate('payment_changed_to_cod', {payment_method:'cod', total:t});
      savePostPaymentUpdate('payment_changed_to_cod_button');
    };
  }
  function showCOD(total){
    clearQR();
    const sidEl = el('sg-sid');
    if(sidEl) sidEl.textContent = 'Nr zamówienia: ' + SID;
    const d=document.createElement('div');d.className='sg-cod-box';
    d.innerHTML='✅ Zamówienie przyjęte!<br>Nr zamówienia: <strong>'+SID+'</strong><br>Płatność za pobraniem: <strong>'+total+' zł</strong><br>Skontaktujemy się wkrótce.';
    el('sg-log').appendChild(d);scroll();
  }

  async function openChat(){
    open=true;el('sg-box').classList.remove('hidden');
    el('sg-badge').style.display='none';el('sg-tooltip').style.display='none';
    if(!started){
      started=true;showTyping();
      await new Promise(r=>setTimeout(r,600));
      el('sg-log').querySelector('.sg-typing')?.remove();
      addBot('Dzień dobry!\n\nJestem Marta — doradca w elastyczne-szklo.com. Pomogę dobrać odpowiednie szkło ochronne do Pana/Pani stołu.\n\nCzy chce Pan/Pani złożyć zamówienie, czy ma pytanie o produkt?');
      addTime();setQR(['🛒 Chcę zamówić','❓ Mam pytanie']);
    }
    el('sg-ta').focus();
  }
  function closeChat(){
    open=false;el('sg-box').classList.add('hidden');
    // Якщо клієнт не залишив контакт і закрив чат — зберігаємо покинутий діалог без очікування.
    // Якщо контакт уже є — не дублюємо Google Sheets, лід піде окремо після підтвердження замовлення.
    if(!hasContactData() && hist.length > 1){
      saveSessionNow('close_no_contact');
    }
  }

  // Data extraction
  function getPhone(t){const m=t.match(/(\+48[\s-]?)?([4-9]\d{2}[\s-]?\d{3}[\s-]?\d{3})/);return m?m[0].replace(/[\s-]/g,''):null;}
  function getEmail(t){const m=t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);return m?m[0]:null;}
  // Слова які НЕ є іменами
  const NOT_NAMES = new Set(['chcę','mam','tak','nie','intensywnie','rzadziej','drewno','szkło','laminat','online','pobraniem','zamówienie','okrągły','prostokątny','mocniejsze','tańsze','oblicz','inne','jeszcze','czy','jak','jaki','jakie','które','gdzie','kiedy','proszę','dziękuję','świetnie','dobrze','rozumiem','oczywiście','pewnie']);
  // Тексти кнопок / короткі відповіді, які не мають потрапляти в адресу
  const ADDR_EXCLUDE = /^(?:🛒\s*)?Chcę zamówić$|^(?:❓\s*)?Mam pytanie$|^Drewno matowe$|^Szkło\s*\/\s*lakier\s*\/\s*połysk$|^Laminat$|^Intensywnie\s*\(kuchnia\/dzieci\)$|^Rzadziej\s*\(biurko\/salon\)$|^1\.5mm\s*—\s*tańsze$|^2mm\s*—\s*mocniejsze$|^Tak,\s*okrągły$|^Nie,\s*prostokątny$|^Tak,\s*mam jeszcze$|^Nie,\s*to wszystko$|^(?:💳\s*)?Online\s*\(karta\/BLIK\)$|^(?:🚚\s*)?Za pobraniem$/i;


  function normalizeAddressPart(t){
    return String(t||'')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,'')
      .replace(/(\+48[\s-]?)?[4-9]\d{2}[\s-]?\d{3}[\s-]?\d{3}/g,'')
      .replace(/^[,;\s]+|[,;\s]+$/g,'')
      .replace(/\s+/g,' ')
      .trim();
  }

  function looksLikeAddressPart(t){
    const v = String(t||'').trim();
    if(!v || ADDR_EXCLUDE.test(v)) return false;
    if(getEmail(v) && normalizeAddressPart(v).length < 3) return false;
    if(/^[+\d\s-]{7,}$/.test(v)) return false; // сам номер телефону не є адресою
    if(/\d{2,3}\s*[xX×]\s*\d{2,3}/.test(v)) return false; // розміри товару не є адресою
    return /\d{2}-\d{3}|\b(ul\.?|ulica|al\.?|aleja)\b/i.test(v) || /\d/.test(v);
  }

  function rememberAddressPart(t){
    const part = normalizeAddressPart(t);
    if(!part || part.length < 3 || ADDR_EXCLUDE.test(part)) return;
    if(!looksLikeAddressPart(part)) return;

    if(!ses.pendingAddressParts.includes(part)){
      ses.pendingAddressParts.push(part);
    }

    // Якщо адреса приходить частинами: вулиця окремо, місто+індекс окремо — склеюємо все в одну адресу
    ses.address = ses.pendingAddressParts.join(', ');
  }

  function getAddressFromBot(t){
    const m = String(t||'').match(/Adres:\s*([\s\S]*?)(?:\n\s*\n|Link do płatności|Skontaktujemy|$)/i);
    if(!m) return null;
    const addr = m[1]
      .split('\n')
      .map(x=>x.trim())
      .filter(Boolean)
      .join(', ')
      .replace(/^[,;\s]+|[,;\s]+$/g,'')
      .trim();
    return addr || null;
  }

  function cleanMoney(v){
    return String(v||'').replace(/\s+/g,'').replace(',', '.');
  }

  function getPrice(t){
    // Найбезпечніше брати саме суму за товар, а не "Łącznie", щоб не додати доставку двічі
    let m = t.match(/Razem\s+szk[łl]o[:\s]+([\d\s]+(?:[,.]\d+)?)\s*z[łl]/i);
    if(m) return cleanMoney(m[1]);

    m = t.match(/Cena\s+produktu[:\s]+([\d\s]+(?:[,.]\d+)?)\s*z[łl]/i);
    if(m) return cleanMoney(m[1]);

    const productLines = t.split('\n').filter(line =>
      /cm|mm|okrąg|prostokąt|błyszczące|ryflowane/i.test(line) &&
      /([\d\s]+(?:[,.]\d+)?)\s*z[łl]/i.test(line) &&
      !/dostawa|łącznie|razem/i.test(line)
    );
    if(productLines.length){
      const mm = productLines[productLines.length-1].match(/([\d\s]+(?:[,.]\d+)?)\s*z[łl]/i);
      if(mm) return cleanMoney(mm[1]);
    }

    return null;
  }

  function getProduct(t){
    const lines = t.split('\n').map(l=>l.trim()).filter(Boolean);
    const productLines = lines.filter(l =>
      /^[-—]/.test(l) &&
      /cm|mm|okrąg|prostokąt|błyszczące|ryflowane|wyprzedaż/i.test(l) &&
      !/adres|dostawa|razem|łącznie|czas/i.test(l)
    );
    return productLines.length ? productLines.map(l=>l.replace(/^[-—]\s*/, '')).join(' | ') : null;
  }

  function getName(t){
    const words = t.trim().split(/\s+/);
    // Тільки якщо перші два слова схожі на ім'я + прізвище
    if(words.length >= 2){
      const w1 = words[0].replace(/[,;]/g,'');
      const w2 = words[1].replace(/[,;]/g,'');
      // Має бути мінімум 2 літери, без цифр, не в списку заборонених
      if(w1.length>=2 && w2.length>=2 && !/\d/.test(w1+w2) &&
         !NOT_NAMES.has(w1.toLowerCase()) && !NOT_NAMES.has(w2.toLowerCase()) &&
         !/mm|cm|zł|@/.test(w1+w2)){
        return w1+' '+w2;
      }
    }
    // Fallback: "jestem/nazywam się X"
    const m=t.match(/(?:jestem|nazywam się|imię:\s*)([A-Za-zżźćąśęłóńŻŹĆĄŚĘŁÓŃ]+(?:\s+[A-Za-zżźćąśęłóńŻŹĆĄŚĘŁÓŃ]+)?)/i);
    return m?m[1]:null;
  }
    function getAddress(t){
    const raw = String(t||'').trim();
    if(!raw || ADDR_EXCLUDE.test(raw)) return null;

    const withoutContact = normalizeAddressPart(raw);

    // Польський індекс — сильний сигнал адреси / міста
    if(/\d{2}-\d{3}/.test(raw)){
      rememberAddressPart(withoutContact || raw);
      return ses.address || withoutContact || raw;
    }

    // Стандартні маркери адреси
    if(/\b(ul\.?|ulica|al\.?|aleja)\b/i.test(raw)){
      rememberAddressPart(withoutContact || raw);
      return ses.address || withoutContact || raw;
    }

    // Якщо бот просив адресу, а клієнт написав частину з цифрою — це теж частина адреси
    const lastBot = hist.filter(m=>m.role==='assistant').slice(-1)[0]?.content || '';
    const botAskedAddress = /adres|ulica|miasto|kod pocztowy|dane do wysyłki|dostawy/i.test(lastBot);
    if(botAskedAddress && looksLikeAddressPart(raw)){
      rememberAddressPart(withoutContact || raw);
      return ses.address || withoutContact || raw;
    }

    // Якщо контакт і адреса прийшли одним повідомленням — забираємо контакт, решту беремо як адресу
    const hasContact = getEmail(raw) || getPhone(raw);
    if(hasContact && withoutContact && withoutContact.length > 3 && !ADDR_EXCLUDE.test(withoutContact)){
      rememberAddressPart(withoutContact);
      return ses.address || withoutContact;
    }

    return null;
  }
  function getNameFromBot(t){const m=t.match(/Dziękuję[,!\s]+([A-ZŻŹĆĄŚĘŁÓŃ][a-zżźćąśęłóń]{2,})/);return m?m[1]:null;}
  function buildSummary(){return hist.filter(m=>m.role==='user').slice(-4).map(m=>m.content.slice(0,80)).join(' | ');}
  function buildFullChat(){return hist.map(m=>(m.role==='user'?'👤 ':'🤖 ')+m.content).join('\n---\n');}

  function getAllDims(){
    const all=hist.map(m=>m.content).join(' ');
    const dims=[...new Set([...all.matchAll(/(\d{2,3})\s*[xX\u00d7]\s*(\d{2,3})\s*cm/g)].map(m=>{
      if(ses.circleSize&&m[1]===ses.circleSize)return 'okr\u0105g \u2300'+m[1]+' cm';
      return m[1]+'\u00d7'+m[2]+' cm';
    }))];
    return dims.length?dims.join(', '):null;
  }

  function formatProductForTG(){
    if(!ses.product) return 'уточнюється';
    // Extract product lines from bot confirmation or build from history
    const lines = ses.product.split('|').map(p => p.trim()).filter(Boolean);
    return lines.map(p => {
      const isCircle = p.includes('okrąg') || p.includes('⌀');
      const icon = isCircle ? '⭕' : '▪️';
      // Add (×1) if no quantity mentioned
      const hasQty = /×\d+|x\d+|\d+\s*szt/.test(p);
      return icon + ' ' + p + (hasQty ? '' : ' (×1)');
    }).join('\n');
  }

  // Формуємо дані для передачі
  function buildLeadData(extra={}){
    const utm=getUTM();
    const pNum=parseFloat(ses.price)||0;
    const delivery=pNum>=500?'gratis':'18';
    const total=pNum>0?(pNum>=500?pNum:pNum+18):0;
    if(total>0)ses.total=String(total);
    return{
      session_id:SID,
      name:ses.name||'',
      phone:ses.phone||'',
      email:ses.email||'',
      contact:ses.contact||'',
      product:ses.product||'',
      product_formatted:formatProductForTG(),
      price:ses.price||'',
      delivery,
      total:ses.total||'',
      address:ses.address||'',
      payment_method:ses.paymentMethod||'',
      stripe_url:ses.stripeUrl||'',
      summary:buildSummary(),
      full_chat:buildFullChat(),
      utm_source:utm.source,
      utm_medium:utm.medium,
      utm_campaign:utm.campaign,
      ...extra,
    };
  }

  // Відправити лід в TG — ТІЛЬКИ ОДИН РАЗ за сесію
  async function fireLead(){
    if(ses.leadFired)return;
    if(!ses.phone&&!ses.email)return; // без контакту не відправляємо
    ses.leadFired=true;
    try{
      await fetch(WORKER_URL+'/lead',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify(buildLeadData()),
      });
      console.log('[SG] Lead fired once, ID:',SID);
    }catch(e){console.error('[SG] Lead error:',e);}
  }

  // Відправити зміну замовлення (НЕ новий лід)
  async function fireUpdate(changeType, extra={}){
    try{
      await fetch(WORKER_URL+'/update',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...buildLeadData(),...extra,change_type:changeType}),
      });
      console.log('[SG] Update fired:',changeType);
    }catch(e){console.error('[SG] Update error:',e);}
  }

  function hasContactData(){
    return !!(ses.phone || ses.email || ses.contact);
  }

  function clearSessionTimer(){
    if(ses._saveTimer){
      clearTimeout(ses._saveTimer);
      ses._saveTimer = null;
    }
  }

  // Зберегти сесію в Sheets без Telegram.
  // Тепер це НЕ викликається після кожного повідомлення.
  // 1) До контакту: тільки якщо клієнт мовчить 60 секунд або закрив чат.
  // 2) Після вибору оплати: тільки якщо клієнт уже після цього щось змінює/пише.
  async function saveSessionNow(reason='session'){
    if(!hist.length) return;
    try{
      await fetch(WORKER_URL+'/session',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(buildLeadData({
          save_reason: reason,
          sheet_action: 'upsert_by_session_id',
          session_saved_before: ses.sessionSavedOnce ? 'yes' : 'no'
        })),
      });
      ses.sessionSavedOnce = true;
      console.log('[SG] Session saved:', reason, SID);
    }catch(e){
      console.error('[SG] Session save error:', e);
    }
  }

  function scheduleSessionSave(reason='idle_no_contact'){
    clearSessionTimer();
    if(hasContactData()) return;
    ses._saveTimer = setTimeout(()=>{
      if(!hasContactData()) saveSessionNow(reason);
    },60000);
  }

  function savePostPaymentUpdate(reason='post_payment_update'){
    if(!ses.paymentLinkSent) return;
    saveSessionNow(reason);
  }

  async function sendLeadWithStripe(stripeUrl){
    ses.stripeUrl=stripeUrl;
    if(ses.leadFired){
      // Лід вже був — відправляємо лише оновлення з посиланням
      await fireUpdate('payment_link',{stripe_url:stripeUrl,payment_method:'stripe'});
    } else {
      await fireLead();
    }
    // /lead у Worker вже записує повний чат у Sheets, тому окремий /session тут не дублюємо.
  }

    async function generateStripe(){
    try{
      const lastBot=hist.filter(m=>m.role==='assistant').slice(-1)[0]?.content||'';
      const rm=lastBot.match(/[Łł][ąa]cznie[:\s]+(\d+)|[Rr]azem[:\s]+(\d+)/);
      const pNum=parseFloat(ses.price)||0;
      const delivery=pNum>=500?0:18;
      const fromBot=rm?parseInt(rm[1]||rm[2]):0;
      const finalTotal=ses.total||(fromBot>0?String(fromBot):String(pNum+delivery));
      console.log('[SG] Stripe total:',finalTotal);
      const res=await fetch(WORKER_URL+'/payment',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          product:ses.product||'Elastyczne szkło',total:finalTotal,
          name:ses.name||'',contact:ses.email||ses.phone||ses.contact||'',session_id:SID,
        }),
      });
      const d=await res.json();
      if(d.ok&&d.url){
        showPayBtn(d.url,finalTotal);
        await sendLeadWithStripe(d.url); // один раз, з посиланням
      } else{
        console.error('[SG] Stripe:',d.error);
        addBot('Problem z płatnością online. Proszę skontaktować się: +48 45 104 05 40');
      }
    }catch(e){console.error('[SG] Stripe error:',e);}
  }

  async function send(quickText){
    const ta=el('sg-ta');
    const text=(quickText||ta.value).trim();
    if(!text||busy)return;
    if(!quickText){ta.value='';ta.style.height='auto';}
    busy=true;lock(true);
    clearSessionTimer();
    addUser(text);showTyping();

    // Payment method detection
    if(text.includes('Za pobraniem')||text.toLowerCase().includes('pobraniem'))ses.paymentMethod='cod';
    if(text.includes('Online')||text.includes('karta')||text.includes('BLIK'))ses.paymentMethod='stripe';

    // Circle detection - if user confirms okrągły, find last same-dimension and convert
    if(/tak.*okr[ąa]g|okr[ąa]g.*tak/i.test(text) || text === 'Tak, okrągły') {
      const allText = hist.map(m=>m.content).join(' ');
      const sameDims = [...allText.matchAll(/(\d{2,3})\s*[xX×]\s*(\d{2,3})\s*cm/g)]
        .filter(m => m[1] === m[2]);
      if(sameDims.length > 0) {
        const d = sameDims[sameDims.length-1][1];
        ses.circleSize = d;
        // Replace same-dim entry in product with circle notation
        if(ses.product) ses.product = ses.product.replace(new RegExp(d+'[×x]'+d+'\s*cm'), 'okrąg ⌀'+d+' cm');
        else ses.product = 'okrąg ⌀'+d+' cm';
      }
    }

    // Payment method change after stripe/payment step
    if(ses.paymentLinkSent && ses.paymentMethod !== 'cod' &&
       /pobraniem|zmienić.*met|cod|za pobraniem/i.test(text)) {
      ses.paymentMethod = 'cod';
      const pNum = parseFloat(ses.price)||0;
      const total = pNum>=500?pNum:pNum+18;
      ses.total = String(total);
      showCOD(total);
      if(ses.leadFired){
        await fireUpdate('payment_changed_to_cod', {payment_method:'cod', total});
      } else {
        await fireLead();
      }
      savePostPaymentUpdate('payment_changed_to_cod');
      busy=false;lock(false);el('sg-ta').focus();
      return;
    }

    // Extract contacts
    const phone=getPhone(text),email=getEmail(text),name=getName(text),addr=getAddress(text);
    if(phone&&!ses.phone)ses.phone=phone;
    if(email&&!ses.email)ses.email=email;
    if(name&&!ses.name)ses.name=name;
    if(addr)ses.address=addr;
    if((phone||email)&&!ses.contact)ses.contact=phone||email;

    hist.push({role:'user',content:text});

    // Не пишемо кожне повідомлення в Google Sheets.
    // До контакту — ставимо таймер 60 секунд. Після оплати — оновлюємо тільки якщо клієнт пише/змінює щось уже після вибору методу оплати.
    if(!hasContactData()){
      scheduleSessionSave('idle_no_contact_after_user');
    } else if(ses.paymentLinkSent){
      savePostPaymentUpdate('post_payment_user_message');
    }

    try{
      const res=await fetch(WORKER_URL,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({messages:hist}),
      });
      const data=await res.json();
      const reply=data.content?.[0]?.text||'Przepraszamy, spróbuj ponownie.';
      hist.push({role:'assistant',content:reply});

      const price=getPrice(reply),product=getProduct(reply),nameBot=getNameFromBot(reply),addrBot=getAddressFromBot(reply);
      if(price)ses.price=price;
      if(product)ses.product=product;
      if(nameBot&&!ses.name)ses.name=nameBot;
      if(addrBot)ses.address=addrBot;

      addBot(reply);addTime();detectQR(reply);

      // Не дублюємо Sheets після кожної відповіді.
      // До контакту — оновимо сесію лише після 60 секунд тиші.
      // Після оплати — оновимо існуючий ID, якщо клієнт уже після оплати продовжив діалог.
      if(!hasContactData()){
        scheduleSessionSave('idle_no_contact_after_bot');
      } else if(ses.paymentLinkSent){
        savePostPaymentUpdate('post_payment_bot_reply');
      }

      // Лід в TG — ОДИН РАЗ, тільки коли є і контакт і підтвердження замовлення
      const isConfirm=/przyjęłam zamówienie|pojawi się za chwilę|łącznie|razem:/i.test(reply);
      if(isConfirm && (ses.phone||ses.email) && !ses.paymentLinkSent){
        ses.paymentLinkSent=true;
        if(ses.paymentMethod==='cod'){
          const pNum=parseFloat(ses.price)||0;
          const total=pNum>=500?pNum:pNum+18;
          showCOD(total);
          fireLead(); // один раз
        } else {
          generateStripe(); // fireLead викликається всередині
        }
      }
    }catch(e){
      el('sg-log').querySelector('.sg-typing')?.remove();
      addBot('Brak połączenia. Proszę odświeżyć stronę.');
      if(!hasContactData()) scheduleSessionSave('idle_error_no_contact');
      else if(ses.paymentLinkSent) savePostPaymentUpdate('post_payment_error');
    }finally{
      busy=false;lock(false);el('sg-ta').focus();
    }
  }

  function autoOpen(){
    if(sessionStorage.getItem('sg_v'))return;
    setTimeout(()=>{
      if(!open){
        const t=el('sg-tooltip');t.style.display='block';
        setTimeout(()=>{if(!open)t.style.display='none';},8000);
      }
    },20000);
    setTimeout(()=>{
      if(!open){sessionStorage.setItem('sg_v','1');el('sg-tooltip').style.display='none';openChat();}
    },35000);
  }

  function init(){
    build();
    el('sg-btn').addEventListener('click',()=>open?closeChat():openChat());
    el('sg-x').addEventListener('click',closeChat);
    el('sg-go').addEventListener('click',()=>send());
    el('sg-tooltip').addEventListener('click',()=>openChat());
    el('sg-ta').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
    el('sg-ta').addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,80)+'px';});
    autoOpen();
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
