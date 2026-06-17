(function () {
  'use strict';

  const WORKER_URL = 'https://bot.metsukisutemi.workers.dev';

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
    return '№ ' + String(Math.floor(100000 + Math.random() * 900000));
  }

  const CSS = `
    #sg-root{position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}
    #sg-btn{width:58px;height:58px;border-radius:50%;background:#1c3d2e;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.22);transition:transform .2s,box-shadow .2s;position:relative;}
    #sg-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.28);}
    #sg-btn{animation:sg-chat-btn-pulse 1.9s ease-out infinite;}
    #sg-btn:hover{animation-play-state:paused;}
    @keyframes sg-chat-btn-pulse{0%{box-shadow:0 4px 16px rgba(0,0,0,.22),0 0 0 0 rgba(28,61,46,.45);}70%{box-shadow:0 4px 16px rgba(0,0,0,.22),0 0 0 13px rgba(28,61,46,0);}100%{box-shadow:0 4px 16px rgba(0,0,0,.22),0 0 0 0 rgba(28,61,46,0);}}
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
    #sg-trust{display:flex;justify-content:center;gap:0;background:#eef3ee;flex-shrink:0;border-bottom:1px solid #dde8dd;}
    .sg-ti{flex:1;text-align:center;font-size:10px;font-weight:600;color:#2c5840;padding:5px 2px;letter-spacing:.1px;}
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
    .sg-pay-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;background:linear-gradient(180deg,#1a1a1a 0%,#0d0d0d 100%);color:#fff;text-decoration:none;padding:11px 15px;border-radius:14px;font-size:16px;font-weight:800;letter-spacing:-0.01em;box-shadow:0 8px 20px rgba(0,0,0,.16);transition:transform .15s,box-shadow .15s,filter .15s;min-width:218px;max-width:100%;border:1.5px solid #171717;}
    .sg-pay-btn:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(0,0,0,.20);filter:brightness(1.03);}
    .sg-pay-btn .sg-blik-logo{display:inline-flex;align-items:center;justify-content:center;background:#fff;border-radius:8px;padding:3px 7px;line-height:1;box-shadow:0 0 0 1px rgba(255,255,255,.12);}
    .sg-pay-btn .sg-blik-logo-img{display:block;height:17px;width:auto;}
    .sg-pay-btn .sg-pay-amount{font-size:17px;font-weight:900;color:#fff;white-space:nowrap;}
    .sg-pay-note{font-size:12px;color:#6b7280;text-align:center;margin-top:2px;}
    .sg-pay-loading{margin:8px 12px;padding:14px 14px;border-radius:14px;background:#f7f7f5;border:1px solid #ece7de;}
    .sg-pay-loading-top{font-size:13px;color:#374151;line-height:1.45;margin-bottom:10px;text-align:center;}
    .sg-pay-loading-btn{display:flex;align-items:center;justify-content:center;gap:10px;min-width:218px;max-width:100%;margin:0 auto;background:linear-gradient(180deg,#1a1a1a 0%,#0d0d0d 100%);color:#fff;border-radius:14px;padding:11px 15px;border:1.5px solid #171717;opacity:.92;}
    .sg-pay-loading-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.28);border-top-color:#ffffff;animation:sg-spin .8s linear infinite;}
    @keyframes sg-spin{to{transform:rotate(360deg);}}
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
    thickness:null,
    price:null,product:null,address:null,
    paymentMethod:null,total:null,delivery:null,stripeUrl:null,
    leadFired:false,
    phoneRequest:false,
    paymentLinkSent:false,
    pendingAddressParts:[],
    sessionSavedOnce:false,
    _saveTimer:null,
    _warmLeadSent:false,
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
        <div id="sg-trust">
          <span class="sg-ti">✓ 100 000+ zamówień</span>
          <span class="sg-ti">✓ Bezpieczna płatność</span>
          <span class="sg-ti">✓ Cięcie na wymiar</span>
        </div>
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
      <div id="sg-tooltip">Policzę cenę Twojego blatu w 30 sek. 👋</div>
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
    const questionCount=(botText.match(/[?]/g)||[]).length;
    if(questionCount>1)return;

    const t=botText.toLowerCase();

    if(ses.paymentLinkSent)return;
    if(t.includes('przyjęłam zamówienie'))return;

    // Typ blatu — startowe pytanie (nowe: pokazuje się zaraz po przywitaniu)
    if(t.includes('rodzaj blatu')||t.includes('jaki rodzaj blatu')||t.includes('jaki masz blat')){
      setQR(['Drewno matowe','Szkło / lakier / połysk','Laminat']);
    // Intensywność
    } else if(t.includes('intensywnie')&&!t.includes('wymiar')){
      setQR(['Intensywnie (kuchnia/dzieci)','Rzadziej (biurko/salon)']);
    // Grubość
    } else if(t.includes('1.5mm')&&t.includes('2mm')&&!t.includes('wymiar')&&!ses.price){
      setQR(['1.5mm — tańsze','2mm — mocniejsze']);
    // Wymiary — popularne rozmiary jako skróty
    } else if((t.includes('wymiary w cm')||t.includes('proszę podać wymiary')||t.includes('podać wymiary'))&&!ses.price){
      setQR(['80×60 cm','100×80 cm','120×80 cm','140×80 cm','160×90 cm','Inne wymiary']);
    // Okrągły?
    } else if((t.includes('okrągły')||t.includes('jest okrągły'))&&!t.includes('wymiar')){
      setQR(['Tak, okrągły','Nie, prostokątny']);
    // Kolejne stoły?
    } else if(t.includes('inne stoły')||t.includes('inne blaty')||t.includes('jeszcze inne')){
      setQR(['Tak, mam jeszcze','Nie, to wszystko']);
    // Metoda płatności
    } else if((t.includes('jak woli')&&t.includes('zapłaci'))||(t.includes('metod')&&t.includes('płat'))){
      setQR(['💳 Online (karta/BLIK)','🚚 Za pobraniem']);
    // Pytanie ogólne — jeśli nie pasuje do nic innego
    } else if(t.includes('mam pytanie')||t.includes('w czym mogę')){
      setQR(['Chcę zamówić','Mam pytanie o produkt']);
    }
  }

  function clearPaymentUi(){
    el('sg-log').querySelectorAll('#sg-pay-state, .sg-pay-loading, .sg-pay-ready').forEach(n=>n.remove());
  }

  function showPaymentLoading(total){
    clearQR();clearPaymentUi();
    const sidEl=el('sg-sid');
    if(sidEl)sidEl.textContent='Nr zamówienia: '+SID;
    const w=document.createElement('div');
    w.id='sg-pay-state';w.className='sg-pay-loading';
    w.innerHTML=
      '<div class="sg-pay-loading-top">Przygotowuję bezpieczny link do płatności. Zwykle zajmuje to kilka sekund.</div>'+
      '<div class="sg-pay-loading-btn">'+
        '<span class="sg-pay-loading-spinner"></span>'+
        '<span class="sg-pay-amount">Generuję link '+total+' zł</span>'+
      '</div>'+
      '<div class="sg-pay-note">Po wygenerowaniu pojawi się przycisk płatności BLIK / karta.</div>';
    el('sg-log').appendChild(w);scroll();
  }

  function showPayBtn(url,total){
    clearQR();clearPaymentUi();
    const sidEl=el('sg-sid');
    if(sidEl)sidEl.textContent='Nr zamówienia: '+SID;
    const w=document.createElement('div');
    w.id='sg-pay-state';w.className='sg-pay-ready';
    w.style.cssText='padding:8px 12px;';
    w.innerHTML=
      '<div style="font-size:13px;color:#374151;margin-bottom:8px;line-height:1.4;">'+
        'Zamówienie <strong>'+SID+'</strong> zostanie przekazane do realizacji po opłaceniu.'+
      '</div>'+
      '<div style="display:flex;justify-content:center;margin-bottom:8px;">'+
        '<a href="'+url+'" target="_blank" rel="noopener" class="sg-pay-btn" aria-label="Zapłać BLIK lub kartą">'+
          '<span class="sg-blik-logo"><img src="https://static.tildacdn.com/stor3662-3134-4163-b239-356435383131/817b5e7e6041069785d45e017434adcd.png" alt="BLIK" class="sg-blik-logo-img"></span>'+
          '<span class="sg-pay-amount">Zapłać '+total+' zł</span>'+
        '</a>'+
      '</div>'+
      '<div class="sg-pay-note">Płatność otworzy się przez Stripe, ale można zapłacić także BLIK-iem.</div>'+
      '<div style="font-size:11px;color:#9ca3af;text-align:center;cursor:pointer;margin-top:8px;" onclick="window.__sgChangeToCOD&&window.__sgChangeToCOD('+total+')">'+
        'Zmienić na płatność za pobraniem →'+
      '</div>';
    el('sg-log').appendChild(w);scroll();

    window.__sgChangeToCOD=function(t){
      ses.paymentMethod='cod';
      clearPaymentUi();clearQR();
      showCOD(t);
      fireUpdate('payment_changed_to_cod',{payment_method:'cod',total:t});
      savePostPaymentUpdate('payment_changed_to_cod_button');
    };
  }

  function showCOD(total){
    clearQR();
    const sidEl=el('sg-sid');
    if(sidEl)sidEl.textContent='Nr zamówienia: '+SID;
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
      // Nowa wiadomość startowa: pomijamy krok "zamówić/pytanie", od razu typ blatu
      addBot('Dzień dobry! 👋 Jestem Marta z elastyczne-szklo.com.\n\nPoliczę cenę szkła ochronnego na Pana/Pani blat w mniej niż minutę.\n\nJaki rodzaj blatu?');
      addTime();
      setQR(['Drewno matowe','Szkło / lakier / połysk','Laminat','Mam pytanie']);
    }
    el('sg-ta').focus();
  }

  function closeChat(){
    sessionStorage.setItem('sg_auto_block','1');
    open=false;el('sg-box').classList.add('hidden');
    if(!hasContactData()&&hist.length>1){
      saveSessionNow('close_no_contact');
    }
  }

  // ── Data extraction ──────────────────────────────────────────────────────
  function getPhone(t){
    const raw=String(t||'');
    const m=raw.match(/(?:\+48[\s-]?)?([0-9]{3}[\s-]?[0-9]{3}[\s-]?[0-9]{3})/);
    if(!m)return null;
    return m[0].replace(/[\s-]/g,'');
  }
  function getEmail(t){const m=t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);return m?m[0]:null;}

  const NOT_NAMES=new Set(['chcę','chce','mam','tak','nie','intensywnie','rzadziej','drewno','szkło','szklo','laminat','online','pobraniem','zamówienie','zamowienie','okrągły','okragly','prostokątny','prostokatny','mocniejsze','tańsze','tansze','oblicz','inne','jeszcze','czy','jak','jaki','jakie','ktore','które','gdzie','kiedy','proszę','prosze','dziękuję','dziekuje','świetnie','dobrze','rozumiem','oczywiście','pewnie','interesuje','mnie','sam','dotne','dotnę','wolę','wole','kontakt','telefoniczny','efoniczny','jaka','ile','kosztuje','potrzebuję','potrzebuje','posiadam','mój','moj','stoł','stół','stol','kwadrat','brzegi','szafka','szfka','kuchenna']);
  const ADDR_EXCLUDE=/^(?:🛒\s*)?Chcę zamówić$|^(?:❓\s*)?Mam pytanie$|^Drewno matowe$|^Szkło\s*\/\s*lakier\s*\/\s*połysk$|^Laminat$|^Intensywnie\s*\(kuchnia\/dzieci\)$|^Rzadziej\s*\(biurko\/salon\)$|^1\.5mm\s*—\s*tańsze$|^2mm\s*—\s*mocniejsze$|^Tak,\s*okrągły$|^Nie,\s*prostokątny$|^Tak,\s*mam jeszcze$|^Nie,\s*to wszystko$|^(?:💳\s*)?Online\s*\(karta\/BLIK\)$|^(?:🚚\s*)?Za pobraniem$|^\d{2,3}[×x]\d{2,3}\s*cm$|^Inne wymiary$|^Mam pytanie o produkt$|^Chcę zamówić$/i;

  function normalizeAddressPart(t){
    return String(t||'')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,'')
      .replace(/(\+48[\s-]?)?[4-9]\d{2}[\s-]?\d{3}[\s-]?\d{3}/g,'')
      .replace(/^[,;\s]+|[,;\s]+$/g,'')
      .replace(/\s+/g,' ')
      .trim();
  }

  function looksLikeAddressPart(t){
    const v=String(t||'').trim();
    if(!v||ADDR_EXCLUDE.test(v))return false;
    if(getEmail(v)&&normalizeAddressPart(v).length<3)return false;
    if(/^[+\d\s-]{7,}$/.test(v))return false;
    if(/\d{2,3}\s*[xX×]\s*\d{2,3}/.test(v))return false;
    return /\d{2}-\d{3}|\b(ul\.?|ulica|al\.?|aleja)\b/i.test(v)||/\d/.test(v);
  }

  function rememberAddressPart(t){
    const part=normalizeAddressPart(t);
    if(!part||part.length<3||ADDR_EXCLUDE.test(part))return;
    if(!looksLikeAddressPart(part))return;
    if(!ses.pendingAddressParts.includes(part))ses.pendingAddressParts.push(part);
    ses.address=ses.pendingAddressParts.join(', ');
  }

  function getAddressFromBot(t){
    const m=String(t||'').match(/Adres:\s*([\s\S]*?)(?:\n\s*\n|Link do płatności|Skontaktujemy|$)/i);
    if(!m)return null;
    const addr=m[1].split('\n').map(x=>x.trim()).filter(Boolean).join(', ').replace(/^[,;\s]+|[,;\s]+$/g,'').trim();
    return addr||null;
  }

  function getNameFromAddressValue(addr){
    const raw=String(addr||'').trim();
    if(!raw)return null;
    let first=raw.split(',')[0]||'';
    first=first
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,' ')
      .replace(/(?:tel\.?|telefon|phone|nr\.?\s*tel\.?)\s*[:.]?/ig,' ')
      .replace(/(\+48[\s-]?)?[4-9]\d{2}[\s-]?\d{3}[\s-]?\d{3}/g,' ')
      .replace(/\b(ul\.?|ulica|al\.?|aleja)\b[\s\S]*$/i,' ')
      .replace(/\d{2}-\d{3}[\s\S]*$/,' ')
      .replace(/[^A-Za-zżźćąśęłóńŻŹĆĄŚĘŁÓŃ .'-]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
    const words=first.split(/\s+/).filter(Boolean).slice(0,3);
    if(words.length<2)return null;
    if(words.some(w=>w.length<2||NOT_NAMES.has(w.toLowerCase())||/mm|cm|zł/i.test(w)))return null;
    const name=words.join(' ');
    return isBadName(name)?null:name;
  }

  function getNameFromBotAddress(t){return getNameFromAddressValue(getAddressFromBot(t));}

  function cleanMoney(v){return String(v||'').replace(/\s+/g,'').replace(',','.');}

  function getMoneyValuesFromLine(line){
    return [...String(line||'').matchAll(/([\d\s]+(?:[,.]\d+)?)\s*z[łl]/gi)]
      .map(m=>parseFloat(cleanMoney(m[1])))
      .filter(n=>Number.isFinite(n));
  }

  function isProductLine(line){
    const l=String(line||'').trim();
    if(!/^[-—•▪■]/.test(l))return false;
    if(/dostawa|łącznie|razem|czas|adres|link|płatno|opłata/i.test(l))return false;
    return /\d{2,4}\s*[xX×х]\s*\d{2,4}|okr[ąa]g|prostok[ąa]t|kwadrat|średnica|śr\.|cm|mm|błyszczące|ryflowane|wyprzedaż/i.test(l)&&/z[łl]/i.test(l);
  }

  function getProductLines(t){
    return String(t||'').split('\n').map(l=>l.trim()).filter(isProductLine);
  }

  function sumProductLines(t){
    const lines=getProductLines(t);
    let sum=0;
    for(const line of lines){
      const vals=getMoneyValuesFromLine(line);
      if(vals.length)sum+=vals[vals.length-1];
    }
    return sum>0?String(Math.round(sum*100)/100).replace('.00',''):null;
  }

  function getPrice(t){
    let m=String(t||'').match(/Razem\s+szk[łl]o[:\s]+([\d\s]+(?:[,.]\d+)?)\s*z[łl]/i);
    if(m)return cleanMoney(m[1]);
    m=String(t||'').match(/Cena\s+towaru[:\s]+([\d\s]+(?:[,.]\d+)?)\s*z[łl]/i);
    if(m)return cleanMoney(m[1]);
    m=String(t||'').match(/Cena\s+produktu[:\s]+([\d\s]+(?:[,.]\d+)?)\s*z[łl]/i);
    if(m)return cleanMoney(m[1]);
    const summed=sumProductLines(t);
    if(summed)return summed;
    return null;
  }

  function getTotal(t){
    const m=String(t||'').match(/[Łł][ąa]cznie[:\s]+([\d\s]+(?:[,.]\d+)?)\s*z[łl]?/i);
    return m?cleanMoney(m[1]):null;
  }

  function getDelivery(t){
    const s=String(t||'');
    if(/Dostawa\s+InPost[:\s]+GRATIS|Dostawa[:\s]+GRATIS/i.test(s))return 'gratis';
    const m=s.match(/Dostawa\s+InPost[:\s]+([\d\s]+(?:[,.]\d+)?)\s*z[łl]/i)||s.match(/Dostawa[:\s]+([\d\s]+(?:[,.]\d+)?)\s*z[łl]/i);
    return m?cleanMoney(m[1]):null;
  }

  function getProduct(t){
    const productLines=getProductLines(t);
    return productLines.length?productLines.map(l=>l.replace(/^[-—•▪■]\s*/,'').trim()).join(' | '):null;
  }

  // ── FIX: fallback товару з усього діалогу ──────────────────────────────────
  // Викликається лише коли ses.product порожній (немає класичного підсумку з
  // buletами). Збирає всі унікальні розміри з історії, щоб у TG/Sheets/Base
  // не падало "уточнięться".
  // ── FIX: визначення товщини з будь-якого тексту ────────────────────────────
  // Повертає 'ryflowane 1.5mm' / 'błyszczące 2mm' / 'błyszczące 1.5mm' / 'wyprzedaż'
  // або null, якщо у тексті немає сигналу про варіант.
  function detectThickness(text){
    const s=String(text||'').toLowerCase();
    if(/wyprzeda[żz]|outlet|-50%/.test(s))return 'wyprzedaż -50%';
    const ryf=/ryflowane|ryflowany|ryflo/.test(s);
    if(/2\s*mm|2mm|2\.0\s*mm|mocniejsz/.test(s))return ryf?'ryflowane 2mm':'błyszczące 2mm';
    if(/1[\s.,]*5\s*mm|1\.5mm|1,5mm|ta[ńn]sz|cie[ńn]sz/.test(s))return ryf?'ryflowane 1.5mm':'błyszczące 1.5mm';
    if(ryf)return 'ryflowane 1.5mm'; // ryflowane domyślnie 1.5mm
    return null;
  }

  // Спробувати оновити ses.thickness з тексту (клієнта або бота)
  function captureThickness(text){
    const t=detectThickness(text);
    if(t)ses.thickness=t;
  }

  function getDimsFallback(){
    // ВАЖЛИВО: скануємо ТІЛЬКИ повідомлення клієнта, не бота —
    // інакше у товар потраплять приклади з підказки ("np. 120×80, 150×150").
    const userText=hist.filter(m=>m.role==='user').map(m=>m.content).join('\n');
    const found=[];
    const pushDim=(w,h)=>{
      w=parseInt(w,10);h=parseInt(h,10);
      // правдоподібні розміри столу (відсікаємо ціни/телефони/"×2 szt")
      if(!(w>=20&&w<=2000&&h>=20&&h<=2000))return;
      found.push(w+'×'+h+' cm');
    };
    // 1) з "cm": 120×80 cm, 81x40 cm, 150х150 cm
    for(const m of userText.matchAll(/(\d{2,4})\s*[xX×х\/]\s*(\d{2,4})\s*cm/gi))pushDim(m[1],m[2]);
    // 2) БЕЗ "cm": 120x80, 120 × 80, 120/80, 120 na 80
    //    (запобіжники: число не приклеєне до інших цифр — щоб не ловити телефон/ціну)
    for(const m of userText.matchAll(/(?:^|[^\d.,])(\d{2,4})\s*(?:[xX×х\/]|na)\s*(\d{2,4})(?![\d.,])/gi))pushDim(m[1],m[2]);
    // круги: okrąg ⌀90 cm, śr. 90 cm, średnica 90 cm
    const circles=[...userText.matchAll(/(?:okr[ąa]g|śr\.?|średnica|srednica)\s*[⌀]?\s*(\d{2,4})\s*cm?/gi)]
      .map(m=>'okrąg ⌀'+m[1]+' cm');
    let all=[...new Set([...found,...circles])];
    // якщо клієнт обрав "okrągły" для квадрата — підмінити квадрат на круг
    if(ses.circleSize){
      const d=ses.circleSize;
      const idx=all.indexOf(d+'×'+d+' cm');
      if(idx>=0)all[idx]='okrąg ⌀'+d+' cm';
      all=[...new Set(all)];
    }
    if(!all.length)return null;
    // FIX: доклеюємо форму (Prostokąt/Okrąg) + товщину, щоб товщина завжди долітала.
    const th=ses.thickness?(', '+ses.thickness):'';
    return all.map(dim=>{
      if(dim.indexOf('okrąg')===0||dim.indexOf('⌀')>=0){
        const d=(dim.match(/(\d{2,4})/)||[])[1]||'';
        return 'Okrąg śr. '+d+' cm'+th;
      }
      return 'Prostokąt '+dim+th;
    }).join(' | ');
  }

  const BAD_NAME_RE=/\b(interesuje\s+mnie|szukam|sam\s+dotn[eę]|wol[eę]\s+kontakt|kontakt\s+telefoniczny|telefoniczny|efoniczny|st[óo]ł|stol|kwadrat|prostok[ąa]t|okr[ąa]g|brzegi|szafka|szfka|kuchenna|jaka\s+jest|jaka\s+cena|ile\s+kosztuje|potrzebuj[eę]|posiadam|m[óo]j\s+st[óo]ł|dzie[nń]\s+dobry|czy\s+|to\s+jest|nie\s+mam|co\s+to|znikn[eę]ła|płatno|dostaw|adres|wymiar|grubo[śs][ćc]|produkt)\b/i;

  function titleCaseName(name){
    return String(name||'').split(/\s+/).filter(Boolean).map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');
  }

  function cleanFinalName(name){
    const n=String(name||'').trim().replace(/\s+/g,' ');
    if(!n||isBadName(n))return'';
    return titleCaseName(n);
  }

  function wantsPhoneContact(text){
    return/(zam[oó]wi[eę]\s+telefonicznie|kontakt\s+telefoniczny|wol[eę]\s+kontakt|prosz[eę]\s+o\s+kontakt|prosz[eę]\s+zadzwoni[ćc]|oddzwo[nń]|zadzwo[nń]|zam[oó]wienie\s+tel|przez\s+telefon|telefonicznie)/i.test(String(text||''));
  }

  function isBadName(n){
    const v=String(n||'').trim().toLowerCase();
    if(!v)return true;
    if(BAD_NAME_RE.test(v))return true;
    if(/[,@0-9]/.test(v))return true;
    const parts=v.split(/\s+/).filter(Boolean);
    if(parts.length<2||parts.length>3)return true;
    if(parts.some(p=>NOT_NAMES.has(p)||p.length<2||/mm|cm|zł|zl/i.test(p)))return true;
    if(!/^[a-ząćęłńóśźż .'-]+$/i.test(v))return true;
    return false;
  }

  function cleanNameCandidate(t){
    let v=String(t||'')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,' ')
      .replace(/(?:tel\.?|telefon|phone|nr\.?\s*tel\.?)\s*[:.]?/ig,' ')
      .replace(/(\+48[\s-]?)?[4-9]\d{2}[\s-]?\d{3}[\s-]?\d{3}/g,' ')
      .replace(/\b(ul\.?|ulica|al\.?|aleja)\b[\s\S]*$/i,' ')
      .replace(/\d{2}-\d{3}[\s\S]*$/,' ')
      .split(',')[0]
      .replace(/^[,;:\s]+|[,;:\s]+$/g,'')
      .replace(/\s+/g,' ')
      .trim();
    return v;
  }

  function getName(t){
    const raw=String(t||'').trim();
    if(!raw||ADDR_EXCLUDE.test(raw))return null;
    const lastBot=hist.filter(m=>m.role==='assistant').slice(-1)[0]?.content||'';
    const botAskedShipping=/imi[eę]|nazwisko|dane do wysyłki|dostawy|telefon|email|adres/i.test(lastBot);
    const hasContactOrAddress=!!(getPhone(raw)||getEmail(raw)||/\d{2}-\d{3}|\b(ul\.?|ulica|al\.?|aleja)\b/i.test(raw));
    if(!botAskedShipping&&!hasContactOrAddress&&!/(?:jestem|nazywam się|imi[eę]|nazwisko)[:\s]/i.test(raw))return null;
    let explicit=raw.match(/(?:jestem|nazywam się|imi[eę](?:\s+i\s+nazwisko)?\s*:?)([A-Za-zżźćąśęłóńŻŹĆĄŚĘŁÓŃ .'-]+(?:\s+[A-Za-zżźćąśęłóńŻŹĆĄŚĘŁÓŃ .'-]+)?)/i);
    let candidate=explicit?explicit[1]:cleanNameCandidate(raw);
    const words=candidate.replace(/[^A-Za-zżźćąśęłóńŻŹĆĄŚĘŁÓŃ .'-]/g,' ').split(/\s+/).map(w=>w.trim()).filter(Boolean).slice(0,3);
    if(words.length<2)return null;
    if(words.some(w=>w.length<2||NOT_NAMES.has(w.toLowerCase())||/mm|cm|zł/i.test(w)))return null;
    const name=words.join(' ');
    return isBadName(name)?null:name;
  }

  function getAddress(t){
    const raw=String(t||'').trim();
    if(!raw||ADDR_EXCLUDE.test(raw))return null;
    const withoutContact=normalizeAddressPart(raw);
    if(/\d{2}-\d{3}/.test(raw)){rememberAddressPart(withoutContact||raw);return ses.address||withoutContact||raw;}
    if(/\b(ul\.?|ulica|al\.?|aleja)\b/i.test(raw)){rememberAddressPart(withoutContact||raw);return ses.address||withoutContact||raw;}
    const lastBot=hist.filter(m=>m.role==='assistant').slice(-1)[0]?.content||'';
    const botAskedAddress=/adres|ulica|miasto|kod pocztowy|dane do wysyłki|dostawy/i.test(lastBot);
    if(botAskedAddress&&looksLikeAddressPart(raw)){rememberAddressPart(withoutContact||raw);return ses.address||withoutContact||raw;}
    const hasContact=getEmail(raw)||getPhone(raw);
    if(hasContact&&withoutContact&&withoutContact.length>3&&!ADDR_EXCLUDE.test(withoutContact)){rememberAddressPart(withoutContact);return ses.address||withoutContact;}
    return null;
  }

  function buildSummary(){return hist.filter(m=>m.role==='user').slice(-4).map(m=>m.content.slice(0,80)).join(' | ');}
  function buildFullChat(){return hist.map(m=>(m.role==='user'?'👤 ':'🤖 ')+m.content).join('\n---\n');}

  function formatProductForTG(){
    // FIX: якщо немає ses.product — пробуємо fallback з усього діалогу
    const src=ses.product||getDimsFallback();
    if(!src)return'уточнюється';
    const lines=src.split('|').map(p=>p.trim()).filter(Boolean);
    return lines.map(p=>{
      const isCircle=p.includes('okrąg')||p.includes('⌀');
      const icon=isCircle?'⭕':'▪️';
      const hasQty=/×\d+|x\d+|\d+\s*szt/.test(p);
      return icon+' '+p+(hasQty?'':' (×1)');
    }).join('\n');
  }

  function buildLeadData(extra={}){
    const utm=getUTM();
    const pNum=parseFloat(ses.price)||0;
    let delivery=ses.delivery||(pNum>=500?'gratis':'18');
    let total=ses.total;
    if(!total&&pNum>0)total=String(delivery==='gratis'?pNum:pNum+(parseFloat(delivery)||0));
    if(total)ses.total=String(total);
    const derivedName=(!ses.name||isBadName(ses.name))?getNameFromAddressValue(ses.address):null;
    if(derivedName)ses.name=derivedName;
    if(ses.name&&isBadName(ses.name))ses.name='';
    const finalName=cleanFinalName(ses.name);
    return{
      session_id:SID,
      request_type:ses.phoneRequest?'phone_request':'',
      name:finalName,
      phone:ses.phone||'',
      email:ses.email||'',
      contact:ses.contact||'',
      // FIX: product теж підстраховано fallback'ом
      product:ses.product||getDimsFallback()||(ses.phoneRequest?'Prośba o kontakt telefoniczny':''),
      product_formatted:ses.phoneRequest&&!ses.product?'📞 Prośba o kontakt telefoniczny':formatProductForTG(),
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

  async function fireLead(extra={}){
    if(ses.leadFired)return;
    if(!ses.phone&&!ses.email&&!ses.contact)return;
    try{
      const payload=buildLeadData(extra);
      const res=await fetch(WORKER_URL+'/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      let data={};
      try{data=await res.json();}catch(_){}
      if(res.ok&&data.ok!==false){ses.leadFired=true;}
      else{console.error('[SG] Lead failed:',data.error||res.status);}
    }catch(e){console.error('[SG] Lead error:',e);}
  }

  async function fireUpdate(changeType,extra={}){
    try{
      await fetch(WORKER_URL+'/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...buildLeadData(),...extra,change_type:changeType})});
    }catch(e){console.error('[SG] Update error:',e);}
  }

  function hasContactData(){return!!(ses.phone||ses.email||ses.contact);}

  function clearSessionTimer(){if(ses._saveTimer){clearTimeout(ses._saveTimer);ses._saveTimer=null;}}

  async function saveSessionNow(reason='session'){
    if(!hist.length)return;
    try{
      await fetch(WORKER_URL+'/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(buildLeadData({save_reason:reason,sheet_action:'upsert_by_session_id',session_saved_before:ses.sessionSavedOnce?'yes':'no'}))});
      ses.sessionSavedOnce=true;
    }catch(e){console.error('[SG] Session save error:',e);}
  }

  function scheduleSessionSave(reason='idle_no_contact'){
    clearSessionTimer();
    if(hasContactData())return;
    ses._saveTimer=setTimeout(()=>{if(!hasContactData())saveSessionNow(reason);},60000);
  }

  function savePostPaymentUpdate(reason='post_payment_update'){
    if(!ses.paymentLinkSent)return;
    saveSessionNow(reason);
  }

  // ── Warm lead: email przechwycony, cena znana, zamówienie niedokończone ────
  async function scheduleWarmLead(){
    if(ses._warmLeadSent)return;
    if(!ses.email&&!ses.contact)return;
    if(!ses.price)return;
    if(ses.paymentLinkSent)return;
    ses._warmLeadSent=true;
    try{
      await fetch(WORKER_URL+'/warm-lead',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(buildLeadData({warm_captured_at:Date.now()})),
      });
    }catch(e){console.error('[SG] Warm lead error:',e);}
  }

  async function sendLeadWithStripe(stripeUrl){
    ses.stripeUrl=stripeUrl;
    if(ses.leadFired){
      // Lead już poszedł — cicho aktualizujemy Stripe URL tylko w Sheets (bez TG)
      // TG dostanie info przy payment_changed_to_cod lub w success webhook
      await fetch(WORKER_URL+'/session',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(buildLeadData({save_reason:'stripe_url_update',stripe_url:stripeUrl,payment_method:'stripe',sheet_action:'upsert_by_session_id'})),
      });
    } else {
      await fireLead();
    }
  }

  async function generateStripe(){
    try{
      const lastBot=hist.filter(m=>m.role==='assistant').slice(-1)[0]?.content||'';
      const pNum=parseFloat(ses.price)||0;
      const parsedTotal=getTotal(lastBot);
      const deliveryVal=ses.delivery||getDelivery(lastBot)||(pNum>=500?'gratis':'18');
      if(deliveryVal)ses.delivery=deliveryVal;
      const finalTotal=ses.total||parsedTotal||String(deliveryVal==='gratis'?pNum:pNum+(parseFloat(deliveryVal)||0));
      ses.total=String(finalTotal);
      const paymentPayload=buildLeadData({product:ses.product||getDimsFallback()||'Elastyczne szkło',product_formatted:formatProductForTG(),total:finalTotal,payment_method:'stripe',contact:ses.email||ses.phone||ses.contact||''});
      showPaymentLoading(finalTotal);
      const res=await fetch(WORKER_URL+'/payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(paymentPayload)});
      const d=await res.json();
      if(d.ok&&d.url){
        ses.stripeUrl=d.url;
        ses.stripeSessionId=d.session_id||'';
        showPayBtn(d.url,finalTotal);
        await sendLeadWithStripe(d.url);
      }else{
        clearPaymentUi();
        console.error('[SG] Stripe:',d.error);
        addBot('Problem z płatnością online. Proszę skontaktować się: +48 45 104 05 40');
      }
    }catch(e){clearPaymentUi();console.error('[SG] Stripe error:',e);}
  }

  async function send(quickText){
    const ta=el('sg-ta');
    const text=(quickText||ta.value).trim();
    if(!text||busy)return;
    if(!quickText){ta.value='';ta.style.height='auto';}
    busy=true;lock(true);
    clearSessionTimer();
    addUser(text);showTyping();

    if(wantsPhoneContact(text))ses.phoneRequest=true;
    if(/za pobraniem|pobraniem|przy dostawie|przy odbiorze|płatność przy odbiorze|gotówką|gotowką|gotowka|odbiór/i.test(text))ses.paymentMethod='cod';
    if(/online|karta|blik|przelew|zapłać|zaplac/i.test(text))ses.paymentMethod='stripe';

    if(/tak.*okr[ąa]g|okr[ąa]g.*tak/i.test(text)||text==='Tak, okrągły'){
      const allText=hist.map(m=>m.content).join(' ');
      const sameDims=[...allText.matchAll(/(\d{2,3})\s*[xX×]\s*(\d{2,3})\s*cm/g)].filter(m=>m[1]===m[2]);
      if(sameDims.length>0){
        const d=sameDims[sameDims.length-1][1];
        ses.circleSize=d;
        if(ses.product)ses.product=ses.product.replace(new RegExp(d+'[×x]'+d+'\s*cm'),'okrąg ⌀'+d+' cm');
        else ses.product='okrąg ⌀'+d+' cm';
      }
    }

    if(ses.paymentLinkSent&&ses.paymentMethod!=='cod'&&/pobraniem|zmienić.*met|cod|za pobraniem/i.test(text)){
      ses.paymentMethod='cod';
      const pNum=parseFloat(ses.price)||0;
      const deliveryVal=ses.delivery||(pNum>=500?'gratis':'18');
      const total=ses.total||String(deliveryVal==='gratis'?pNum:pNum+(parseFloat(deliveryVal)||0));
      ses.delivery=deliveryVal;ses.total=String(total);
      showCOD(total);
      if(ses.leadFired){await fireUpdate('payment_changed_to_cod',{payment_method:'cod',total});}
      else{await fireLead();}
      savePostPaymentUpdate('payment_changed_to_cod');
      busy=false;lock(false);el('sg-ta').focus();return;
    }

    const phone=getPhone(text),email=getEmail(text),name=getName(text),addr=getAddress(text);
    captureThickness(text); // FIX: товщина з повідомлення клієнта (кнопки "2mm", "1.5mm — tańsze" тощо)
    if(phone&&!ses.phone)ses.phone=phone;
    if(email&&!ses.email)ses.email=email;
    if(name&&(!ses.name||isBadName(ses.name)))ses.name=name;
    if(addr)ses.address=addr;
    if((phone||email)&&!ses.contact)ses.contact=phone||email;

    hist.push({role:'user',content:text});

    if(ses.phoneRequest&&(ses.phone||ses.contact)&&!ses.leadFired){
      if(!ses.product)ses.product='Prośba o kontakt telefoniczny';
      await fireLead({status:'phone_request',request_type:'phone_request'});
    }

    if(!hasContactData()){scheduleSessionSave('idle_no_contact_after_user');}
    else if(ses.paymentLinkSent){savePostPaymentUpdate('post_payment_user_message');}

    try{
      const res=await fetch(WORKER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:hist})});
      const data=await res.json();
      const reply=data.content?.[0]?.text||'Przepraszamy, spróbuj ponownie.';
      hist.push({role:'assistant',content:reply});

      const price=getPrice(reply),totalParsed=getTotal(reply),deliveryParsed=getDelivery(reply),product=getProduct(reply),addrBot=getAddressFromBot(reply),nameAddr=getNameFromBotAddress(reply);
      captureThickness(reply); // FIX: товщина з рекомендації/підсумку бота
      if(price)ses.price=price;
      if(totalParsed)ses.total=totalParsed;
      if(deliveryParsed)ses.delivery=deliveryParsed;
      if(product)ses.product=product;
      if(addrBot)ses.address=addrBot;
      if(nameAddr&&(!ses.name||isBadName(ses.name)))ses.name=nameAddr;
      if(/kontakt telefoniczny|oddzwonimy|zadzwonimy|numer telefonu/i.test(reply))ses.phoneRequest=true;
      if(/płatność przy odbiorze|platnosc przy odbiorze|za pobraniem|przy dostawie|przy odbiorze/i.test(reply))ses.paymentMethod='cod';
      if(/link do płatności pojawi|link do platnosci pojawi|online kartą|online karta|BLIK/i.test(reply)&&ses.paymentMethod!=='cod')ses.paymentMethod='stripe';

      addBot(reply);addTime();detectQR(reply);

      // Warm lead: email + cena znana → zapisz w KV dla cron recovery
      if(ses.email&&ses.price&&!ses.paymentLinkSent&&!ses._warmLeadSent){
        scheduleWarmLead();
      }

      if(!hasContactData()){scheduleSessionSave('idle_no_contact_after_bot');}
      else if(ses.paymentLinkSent){savePostPaymentUpdate('post_payment_bot_reply');}

      const isConfirm=/przyjęłam zamówienie|pojawi się za chwilę|łącznie|razem:/i.test(reply);
      if(isConfirm&&(ses.phone||ses.email)&&!ses.paymentLinkSent){
        ses.paymentLinkSent=true;
        if(ses.paymentMethod==='cod'){
          const pNum=parseFloat(ses.price)||0;
          const deliveryVal=ses.delivery||(pNum>=500?'gratis':'18');
          const total=ses.total||String(deliveryVal==='gratis'?pNum:pNum+(parseFloat(deliveryVal)||0));
          ses.delivery=deliveryVal;ses.total=String(total);
          showCOD(total);
          fireLead();
        }else{
          generateStripe();
        }
      }
    }catch(e){
      el('sg-log').querySelector('.sg-typing')?.remove();
      addBot('Brak połączenia. Proszę odświeżyć stronę.');
      if(!hasContactData())scheduleSessionSave('idle_error_no_contact');
      else if(ses.paymentLinkSent)savePostPaymentUpdate('post_payment_error');
    }finally{
      busy=false;lock(false);el('sg-ta').focus();
    }
  }

  function autoOpen(){
    if(sessionStorage.getItem('sg_auto_done')||sessionStorage.getItem('sg_auto_block'))return;

    // Tooltip po 5 sek (było 8)
    setTimeout(()=>{
      if(!open&&!sessionStorage.getItem('sg_auto_block')){
        const t=el('sg-tooltip');
        if(t)t.style.display='block';
      }
    },5000);

    // Auto-open po 30 sek (było 50)
    setTimeout(()=>{
      if(!open&&!sessionStorage.getItem('sg_auto_block')){
        sessionStorage.setItem('sg_auto_done','1');
        openChat();
      }
    },30000);
  }

  function init(){
    build();
    el('sg-btn').addEventListener('click',()=>{sessionStorage.setItem('sg_auto_block','1');open?closeChat():openChat();});
    el('sg-x').addEventListener('click',closeChat);
    el('sg-go').addEventListener('click',()=>send());
    el('sg-tooltip').addEventListener('click',()=>{sessionStorage.setItem('sg_auto_block','1');openChat();});
    el('sg-ta').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
    el('sg-ta').addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,80)+'px';});
    autoOpen();
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
