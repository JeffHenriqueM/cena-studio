/* ARTsivos — radar de visita
   Acompanha o que a pessoa olhou, convida a deixar o contato depois de 5 minutos
   e tenta uma última vez quando ela vai embora. Também carrega o código de
   indicação de quem chegou por um link de cliente.
   Nada é enviado para lugar nenhum enquanto LEAD_ENDPOINT estiver vazio. */
(function(){
  var PHONE = "5583986062797";

  /* URL que recebe os contatos (Formspree, Google Forms, API própria).
     Enquanto estiver vazia, nada é registrado — só o WhatsApp funciona. */
  var LEAD_ENDPOINT = "";

  var MINUTOS  = 5;      /* quando o convite por tempo aparece */
  var ESPERA   = 45;     /* segundos mínimos antes de tentar o convite de saída */
  var DESCONTO = 50;     /* R$ por indicação */
  var CHAVE    = 'artsivos.radar.v1';

  /* ---------- memória entre páginas ---------- */
  function ler(){
    try{ var b = localStorage.getItem(CHAVE); if(b) return JSON.parse(b); }catch(e){}
    return null;
  }
  function gravar(){ try{ localStorage.setItem(CHAVE, JSON.stringify(d)); }catch(e){} }

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

  /* ---------- quem chegou por indicação ---------- */
  function param(nome){
    var m = new RegExp('[?&]' + nome + '=([^&#]*)').exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }
  var indNovo = param('ind').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20);
  if(indNovo){
    d.indicacao = indNovo;
    var quem = param('de').replace(/[^\wÀ-ÿ .'-]/g, '').slice(0, 40);
    if(quem) d.indicadoPor = quem;
  }
  gravar();

  function anota(t){ if(d.acoes.indexOf(t) === -1){ d.acoes.push(t); gravar(); } }
  function produto(n){ if(n){ d.produtos[n] = (d.produtos[n] || 0) + 1; gravar(); } }

  /* faixa que avisa que o desconto está valendo */
  if(d.indicacao){
    var faixa = document.createElement('div');
    faixa.className = 'faixa-ind';
    faixa.innerHTML = '<b>R$ ' + DESCONTO + ' de desconto</b> no seu pedido — você chegou pela indicação'
      + (d.indicadoPor ? ' de ' + d.indicadoPor.replace(/</g,'') : '')
      + '. <span>Código ' + d.indicacao + '</span>';
    document.addEventListener('DOMContentLoaded', function(){
      document.body.insertBefore(faixa, document.body.firstChild);
      document.body.classList.add('com-faixa');
    });
  }

  /* ---------- tempo de verdade: só conta com a aba na frente ---------- */
  var ultimo = Date.now();
  setInterval(function(){
    var agora = Date.now();
    if(!document.hidden){
      var dt = (agora - ultimo) / 1000;
      if(dt > 0 && dt < 30) d.segundos += dt;
    }
    ultimo = agora;
    gravar();
    if(d.segundos >= MINUTOS * 60) convidar('tempo');
  }, 5000);
  document.addEventListener('visibilitychange', function(){ ultimo = Date.now(); });

  /* ---------- o que a pessoa está buscando ---------- */
  document.addEventListener('click', function(e){
    var alvo = e.target.closest ? e.target.closest('[data-prod]') : null;
    if(alvo) produto(alvo.getAttribute('data-prod'));
  }, true);

  var sel = document.getElementById('f-prod');
  if(sel) sel.addEventListener('change', function(){ produto(sel.value); });

  var valor = document.getElementById('out-valor');
  if(valor && 'MutationObserver' in window){
    new MutationObserver(function(){
      var t = valor.textContent.trim().replace('até', ' até ');
      if(t && t !== '—'){ d.estimativa = t; gravar(); anota('Simulou orçamento no site'); }
    }).observe(valor, {childList:true, characterData:true, subtree:true});
  }

  function palpite(){
    var nomes = Object.keys(d.produtos).sort(function(a,b){ return d.produtos[b] - d.produtos[a]; });
    if(nomes.length) return nomes.slice(0, 3).join(', ');
    var outras = d.paginas.filter(function(x){ return x.indexOf('ARTsivos') === -1; });
    return outras.length ? outras.join(', ') : '';
  }

  /* ---------- o convite ---------- */
  var aberto = false, fechado = false, jaTentouSaida = false;
  try{ fechado = localStorage.getItem('artsivos.convite') === 'nao'; }catch(e){}

  function jaTemContato(){
    if(d.contato) return true;
    var n = document.getElementById('f-nome'), f = document.getElementById('f-fone');
    return !!(n && f && n.value.trim() && f.value.replace(/\D/g,'').length >= 10);
  }

  var COPIA = {
    tempo: {
      olho: 'Já que você está por aqui',
      tit:  'Quer que a gente monte esse orçamento para você?',
      sub:  'Deixe seu contato e a nossa equipe volta com valor, material e prazo — em até 2 horas, no horário comercial. Sem compromisso.',
      ok:   'Quero receber o orçamento'
    },
    saida: {
      olho: 'Antes de você ir',
      tit:  'Leva o orçamento com você.',
      sub:  'Deixe o contato e a gente manda valor, material e prazo por WhatsApp — em até 2 horas, no horário comercial. Você decide depois, com o número na mão.',
      ok:   'Quero receber e decidir depois'
    }
  };

  function convidar(motivo){
    if(aberto || fechado || jaTemContato()) return;
    var c = COPIA[motivo] || COPIA.tempo;
    aberto = true;

    var cx = document.createElement('div');
    cx.className = 'convite';
    cx.setAttribute('role', 'dialog');
    cx.setAttribute('aria-modal', 'true');
    cx.setAttribute('aria-labelledby', 'cv-tit');
    cx.innerHTML =
      '<div class="convite-cx">' +
        '<button class="convite-x" type="button" aria-label="Fechar">&times;</button>' +
        '<p class="eyebrow">' + c.olho + '</p>' +
        '<h3 id="cv-tit">' + c.tit + '</h3>' +
        '<p class="convite-sub">' + c.sub + '</p>' +
        '<div class="convite-campos">' +
          '<label>Nome<input id="cv-nome" type="text" autocomplete="name" placeholder="Como te chamamos"></label>' +
          '<label>WhatsApp<input id="cv-fone" type="text" inputmode="tel" autocomplete="tel" placeholder="(83) 9 0000-0000"></label>' +
          '<label>E-mail <i>(opcional)</i><input id="cv-mail" type="email" autocomplete="email" placeholder="voce@empresa.com.br"></label>' +
          '<label>O que você está procurando<textarea id="cv-busca" rows="2" placeholder="Ex.: fachada nova para a loja"></textarea></label>' +
        '</div>' +
        '<p class="convite-aviso" id="cv-aviso" hidden>Preencha nome e WhatsApp para a gente conseguir te responder.</p>' +
        '<div class="convite-btns">' +
          '<button class="btn btn-primary" id="cv-ok" type="button">' + c.ok + '</button>' +
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

    cx.querySelector('#cv-wa').href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(
      'Olá! Estava vendo o site da ARTsivos'
      + (pre ? ' e me interessei por: ' + pre : '')
      + (d.estimativa ? '. O site estimou ' + d.estimativa : '') + '.' + sufixo());

    function encerra(lembrar){
      if(lembrar){ try{ localStorage.setItem('artsivos.convite', 'nao'); }catch(e){} fechado = true; }
      cx.remove(); aberto = false;
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
      var faltaNome = !nome.value.trim(), faltaFone = fone.value.replace(/\D/g,'').length < 10;
      nome.classList.toggle('falta', faltaNome);
      fone.classList.toggle('falta', faltaFone);
      if(faltaNome || faltaFone){ aviso.hidden = false; (faltaNome ? nome : fone).focus(); return; }

      d.contato = {nome: nome.value.trim(), whatsapp: fone.value.trim(),
                   email: mail.value.trim(), busca: busca.value.trim(),
                   em: new Date().toISOString(), momento: motivo};
      gravar();
      enviar({});

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

  /* ---------- quando a pessoa vai embora ---------- */
  function tentaSaida(){
    if(jaTentouSaida || d.segundos < ESPERA) return;
    jaTentouSaida = true;
    convidar('saida');
  }
  /* no computador: o cursor sobe para fechar a aba ou digitar outro endereço */
  document.addEventListener('mouseout', function(e){
    if(e.clientY <= 0 && !e.relatedTarget && !e.toElement) tentaSaida();
  });
  /* no celular não existe esse gesto: vale a rolagem rápida de volta ao topo */
  var yAnt = window.pageYOffset, tAnt = Date.now();
  window.addEventListener('scroll', function(){
    var y = window.pageYOffset, agora = Date.now(), dt = agora - tAnt;
    if(dt > 60){
      if(yAnt - y > 420 && dt < 700 && y < 260) tentaSaida();
      yAnt = y; tAnt = agora;
    }
  }, {passive:true});

  /* ---------- envio ---------- */
  function sufixo(){
    return d.indicacao ? '\n\nIndicação: ' + d.indicacao
      + (d.indicadoPor ? ' (' + d.indicadoPor + ')' : '') + ' — R$ ' + DESCONTO + ' de desconto.' : '';
  }

  function enviar(extra){
    if(!LEAD_ENDPOINT) return;               /* sem endereço, não há para onde mandar */
    var c = d.contato || {};
    var carga = {
      origem: 'site artsivos',
      nome: c.nome || '', whatsapp: c.whatsapp || '', email: c.email || '',
      procurando: c.busca || '',
      momento: c.momento || '',
      indicado_por: d.indicacao || '',
      produtos_vistos: Object.keys(d.produtos).join(', '),
      paginas: d.paginas.join(' · '),
      acoes: d.acoes.join(' · '),
      estimativa: d.estimativa || '',
      minutos_no_site: Math.round(d.segundos / 60),
      visitas: d.visitas
    };
    for(var k in extra){ if(extra.hasOwnProperty(k)) carga[k] = extra[k]; }
    try{
      fetch(LEAD_ENDPOINT, {
        method: 'POST', keepalive: true,
        headers: {'Content-Type':'application/json', 'Accept':'application/json'},
        body: JSON.stringify(carga)
      }).catch(function(){});
    }catch(e){}
  }

  /* ---------- código de indicação de um cliente ---------- */
  function codigoDe(nome, fone){
    var n = (nome || '').normalize ? nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : (nome || '');
    n = n.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) || 'ART';
    var dig = (fone || '').replace(/\D/g, '').slice(-4) || '0000';
    return n + '-' + dig;
  }

  window.ARTsivosRadar = {
    dados: function(){ return d; },
    convidar: convidar,
    enviar: enviar,
    sufixo: sufixo,
    codigoDe: codigoDe,
    indicacao: function(){ return d.indicacao || ''; },
    endpoint: LEAD_ENDPOINT,
    phone: PHONE,
    desconto: DESCONTO
  };
})();

/* ARTsivos — botão de tema
   O site é escuro por identidade; o claro atende quem prefere. Sem escolha
   gravada, vale a configuração do aparelho (`prefers-color-scheme`) — o
   `<script>` no <head> de cada página aplica a escolha antes da primeira
   pintura, para a tela não piscar branca. Aqui só entra o botão. */
(function(){
  var CHAVE = 'artsivos.tema';
  var raiz  = document.documentElement;

  function doAparelho(){
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function atual(){
    return raiz.getAttribute('data-theme') || doAparelho();
  }
  function aplicar(t){
    raiz.setAttribute('data-theme', t);
    try{ localStorage.setItem(CHAVE, t); }catch(e){}
    marcar(t);
  }
  function marcar(t){
    var b = document.querySelector('.tema');
    if(!b) return;
    var vai = t === 'dark' ? 'claro' : 'escuro';
    b.setAttribute('aria-label', 'Mudar para o tema ' + vai);
    b.setAttribute('title', 'Tema ' + vai);
  }

  function montar(){
    var barra = document.querySelector('.nav-in');
    if(!barra || document.querySelector('.tema')) return;

    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tema';
    b.innerHTML =
      '<svg class="lua" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>' +
      '<svg class="sol" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/>' +
      '<path d="M12 2.4v2.2M12 19.4v2.2M4.2 12H2M22 12h-2.2M6.1 6.1 4.6 4.6M19.4 19.4l-1.5-1.5M17.9 6.1l1.5-1.5M4.6 19.4l1.5-1.5"/></svg>';

    /* antes do botão de orçamento, que é o último da barra */
    var cta = barra.querySelector('.btn');
    if(cta) barra.insertBefore(b, cta); else barra.appendChild(b);

    b.addEventListener('click', function(){
      aplicar(atual() === 'dark' ? 'light' : 'dark');
    });
    marcar(atual());
  }

  /* quem nunca tocou no botão continua acompanhando o aparelho ao vivo */
  if(window.matchMedia){
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var ouvir = function(){
      var salvo = null;
      try{ salvo = localStorage.getItem(CHAVE); }catch(e){}
      if(!salvo) marcar(doAparelho());
    };
    if(mq.addEventListener) mq.addEventListener('change', ouvir);
    else if(mq.addListener) mq.addListener(ouvir);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();
})();
