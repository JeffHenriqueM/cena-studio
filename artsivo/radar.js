/* ARTsivos — radar de visita
   Acompanha o que a pessoa olhou no site e, depois de 5 minutos, convida
   a deixar o contato. Nada é enviado para lugar nenhum enquanto LEAD_ENDPOINT
   estiver vazio: sem endereço, o convite funciona mas o dado morre no navegador. */
(function(){
  var PHONE = "5583986062797";

  /* URL que recebe os contatos (Formspree, Google Forms, API própria).
     Enquanto estiver vazia, nada é registrado — só o WhatsApp funciona. */
  var LEAD_ENDPOINT = "";

  var MINUTOS = 5;                 /* quando o convite aparece */
  var CHAVE   = 'artsivos.radar.v1';

  /* ---------- memória entre páginas ---------- */
  function ler(){
    try{
      var b = localStorage.getItem(CHAVE);
      if(b) return JSON.parse(b);
    }catch(e){}
    return null;
  }
  function gravar(){
    try{ localStorage.setItem(CHAVE, JSON.stringify(d)); }catch(e){}
  }

  var d = ler() || {};
  if(!d.desde)    d.desde    = new Date().toISOString();
  if(!d.segundos) d.segundos = 0;
  if(!d.paginas)  d.paginas  = [];
  if(!d.produtos) d.produtos = {};
  if(!d.acoes)    d.acoes    = [];
  if(!d.visitas)  d.visitas  = 0;
  d.visitas++;

  var pag = document.title.replace(/\s*[|·—-]\s*ARTsivos.*$/i, '').trim() || location.pathname;
  if(d.paginas.indexOf(pag) === -1) d.paginas.push(pag);
  gravar();

  function anota(texto){
    if(d.acoes.indexOf(texto) === -1){ d.acoes.push(texto); gravar(); }
  }
  function produto(nome){
    if(!nome) return;
    d.produtos[nome] = (d.produtos[nome] || 0) + 1;
    gravar();
  }

  /* ---------- tempo de verdade: só conta com a aba na frente ---------- */
  var ultimo = Date.now();
  function tique(){
    var agora = Date.now();
    if(!document.hidden){
      var dt = (agora - ultimo) / 1000;
      if(dt > 0 && dt < 30) d.segundos += dt;     /* pulo grande = máquina dormiu */
    }
    ultimo = agora;
    gravar();
    if(d.segundos >= MINUTOS * 60) convidar();
  }
  setInterval(tique, 5000);
  document.addEventListener('visibilitychange', function(){ ultimo = Date.now(); });

  /* ---------- o que a pessoa está buscando ---------- */
  document.addEventListener('click', function(e){
    var alvo = e.target.closest ? e.target.closest('[data-prod]') : null;
    if(alvo) produto(alvo.getAttribute('data-prod'));
    var art = e.target.closest ? e.target.closest('[data-post]') : null;
    if(art) anota('Leu sobre: ' + art.getAttribute('data-post'));
  }, true);

  var sel = document.getElementById('f-prod');
  if(sel) sel.addEventListener('change', function(){ produto(sel.value); });

  var valor = document.getElementById('out-valor');
  if(valor && 'MutationObserver' in window){
    var mo = new MutationObserver(function(){
      var t = valor.textContent.trim().replace('até', ' até ');
      if(t && t !== '—'){ d.estimativa = t; gravar(); anota('Simulou orçamento no site'); }
    });
    mo.observe(valor, {childList:true, characterData:true, subtree:true});
  }

  function resumo(){
    var nomes = Object.keys(d.produtos).sort(function(a,b){ return d.produtos[b] - d.produtos[a]; });
    return nomes.slice(0, 3);
  }
  function palpite(){
    var p = resumo();
    if(p.length) return p.join(', ');
    var outras = d.paginas.filter(function(x){ return x.indexOf('ARTsivos') === -1; });
    if(outras.length) return outras.join(', ');
    return '';
  }

  /* ---------- o convite ---------- */
  var aberto = false, fechado = false;
  try{ fechado = localStorage.getItem('artsivos.convite') === 'nao'; }catch(e){}

  function jaTemContato(){
    if(d.contato) return true;
    var n = document.getElementById('f-nome'), f = document.getElementById('f-fone');
    return !!(n && f && n.value.trim() && f.value.replace(/\D/g,'').length >= 10);
  }

  function convidar(){
    if(aberto || fechado || jaTemContato()) return;
    aberto = true;

    var cx = document.createElement('div');
    cx.className = 'convite';
    cx.setAttribute('role', 'dialog');
    cx.setAttribute('aria-modal', 'true');
    cx.setAttribute('aria-labelledby', 'cv-tit');
    cx.innerHTML =
      '<div class="convite-cx">' +
        '<button class="convite-x" type="button" aria-label="Fechar">&times;</button>' +
        '<p class="eyebrow">Já que você está por aqui</p>' +
        '<h3 id="cv-tit">Quer que a gente monte esse orçamento para você?</h3>' +
        '<p class="convite-sub">Deixe seu contato e a nossa equipe volta com valor, material e prazo — em até 2 horas, no horário comercial. Sem compromisso.</p>' +
        '<div class="convite-campos">' +
          '<label>Nome<input id="cv-nome" type="text" autocomplete="name" placeholder="Como te chamamos"></label>' +
          '<label>WhatsApp<input id="cv-fone" type="text" inputmode="tel" autocomplete="tel" placeholder="(83) 9 0000-0000"></label>' +
          '<label>E-mail <i>(opcional)</i><input id="cv-mail" type="email" autocomplete="email" placeholder="voce@empresa.com.br"></label>' +
          '<label>O que você está procurando<textarea id="cv-busca" rows="2" placeholder="Ex.: fachada nova para a loja"></textarea></label>' +
        '</div>' +
        '<p class="convite-aviso" id="cv-aviso" hidden>Preencha nome e WhatsApp para a gente conseguir te responder.</p>' +
        '<div class="convite-btns">' +
          '<button class="btn btn-primary" id="cv-ok" type="button">Quero receber o orçamento</button>' +
          '<a class="btn btn-ghost" id="cv-wa" href="#" target="_blank" rel="noopener">Prefiro falar agora</a>' +
        '</div>' +
        '<button class="convite-nao" id="cv-nao" type="button">Agora não, obrigado</button>' +
      '</div>';
    document.body.appendChild(cx);

    var nome = cx.querySelector('#cv-nome'), fone = cx.querySelector('#cv-fone'),
        mail = cx.querySelector('#cv-mail'), busca = cx.querySelector('#cv-busca'),
        aviso = cx.querySelector('#cv-aviso');

    var pre = palpite();
    if(pre) busca.value = pre;

    var texto = 'Olá! Estava vendo o site da ARTsivos'
      + (pre ? ' e me interessei por: ' + pre : '')
      + (d.estimativa ? '. O site estimou ' + d.estimativa : '') + '.';
    cx.querySelector('#cv-wa').href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(texto);

    function encerra(lembrar){
      if(lembrar){ try{ localStorage.setItem('artsivos.convite', 'nao'); }catch(e){} fechado = true; }
      cx.remove();
      aberto = false;
      document.body.classList.remove('travado');
    }
    cx.querySelector('.convite-x').addEventListener('click', function(){ encerra(true); });
    cx.querySelector('#cv-nao').addEventListener('click', function(){ encerra(true); });
    cx.querySelector('#cv-wa').addEventListener('click', function(){ encerra(true); });
    cx.addEventListener('click', function(e){ if(e.target === cx) encerra(true); });
    document.addEventListener('keydown', function esc(e){
      if(e.key === 'Escape' && aberto){ encerra(true); document.removeEventListener('keydown', esc); }
    });

    cx.querySelector('#cv-ok').addEventListener('click', function(){
      var faltaNome = !nome.value.trim(),
          faltaFone = fone.value.replace(/\D/g,'').length < 10;
      nome.classList.toggle('falta', faltaNome);
      fone.classList.toggle('falta', faltaFone);
      if(faltaNome || faltaFone){
        aviso.hidden = false;
        (faltaNome ? nome : fone).focus();
        return;
      }

      d.contato = {
        nome: nome.value.trim(),
        whatsapp: fone.value.trim(),
        email: mail.value.trim(),
        busca: busca.value.trim(),
        em: new Date().toISOString()
      };
      gravar();
      enviar();

      cx.querySelector('.convite-cx').innerHTML =
        '<p class="eyebrow">Recebido</p>' +
        '<h3>Pronto, ' + nome.value.trim().split(' ')[0].replace(/</g,'') + '.</h3>' +
        '<p class="convite-sub">A nossa equipe entra em contato pelo WhatsApp com valor, material e prazo. Se preferir adiantar, é só chamar a gente.</p>' +
        '<div class="convite-btns"><a class="btn btn-primary" href="https://wa.me/' + PHONE + '" target="_blank" rel="noopener">Falar no WhatsApp</a></div>';
      setTimeout(function(){ encerra(true); }, 4000);
    });

    document.body.classList.add('travado');
    setTimeout(function(){ cx.classList.add('vem'); nome.focus(); }, 20);
  }

  function enviar(){
    if(!LEAD_ENDPOINT) return;               /* sem endereço, não há para onde mandar */
    var carga = {
      origem: 'site artsivos',
      nome: d.contato.nome,
      whatsapp: d.contato.whatsapp,
      email: d.contato.email,
      procurando: d.contato.busca,
      produtos_vistos: Object.keys(d.produtos).join(', '),
      paginas: d.paginas.join(' · '),
      acoes: d.acoes.join(' · '),
      estimativa: d.estimativa || '',
      minutos_no_site: Math.round(d.segundos / 60),
      visitas: d.visitas
    };
    try{
      fetch(LEAD_ENDPOINT, {
        method: 'POST', keepalive: true,
        headers: {'Content-Type':'application/json', 'Accept':'application/json'},
        body: JSON.stringify(carga)
      }).catch(function(){});
    }catch(e){}
  }

  /* deixa o resto do site consultar o radar, se precisar */
  window.ARTsivosRadar = {dados: function(){ return d; }, convidar: convidar, endpoint: LEAD_ENDPOINT};
})();
