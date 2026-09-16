/* ---------------------------------------------------------------------------
   AVALIAÇÕES — em todas as páginas
   A seção é montada por aqui e enfiada antes do rodapé, em qualquer página
   que carregue este arquivo. Assim existe um lugar só para mexer nela, em
   vez de sete cópias do mesmo HTML.

   Uma avaliação pode ser de três tipos:
     texto  — o que a pessoa escreveu
     print  — a imagem de uma conversa (WhatsApp, Instagram, Google)
     video  — um depoimento filmado

   Print e vídeo podem vir com texto junto; texto sozinho também vale.

   Regra que não muda: sem avaliação cadastrada, a seção não existe. Nada de
   seção vazia.

   As três de baixo são de EXEMPLO, e estão marcadas como tal na tela: servem
   para a empresa ver o formato antes de cadastrar as reais. Elogio inventado
   passando por verdadeiro não entra aqui de jeito nenhum — por isso cada
   cartão leva o selo "exemplo" e a seção leva o aviso em cima. No instante em
   que a primeira avaliação real for cadastrada no painel, estas somem.
--------------------------------------------------------------------------- */
(function(){
  /* Exemplos. A ARTsivos tem 5,0 com 42 avaliações no Google — o material
     real está lá, é só escolher quais destacar e cadastrar no painel. */
  var LOCAIS = [
    { exemplo:true, nome:"Nome do cliente", nota:5, servico:"Fachada em ACM", data:"março de 2026",
      texto:"Aqui entra o que o cliente escreveu, do jeito que ele escreveu. " +
            "Este texto é só um exemplo para mostrar como o depoimento aparece na página." },
    { exemplo:true, nome:"Nome do cliente", nota:5, servico:"Envelopamento de frota", data:"fevereiro de 2026",
      texto:"Exemplo de uma avaliação mais curta. Depoimento curto e direto costuma " +
            "convencer tanto quanto um longo." },
    { exemplo:true, nome:"Nome do cliente", nota:5, servico:"Letra caixa iluminada", data:"janeiro de 2026",
      texto:"Exemplo de um terceiro depoimento. No lugar destes três entram as " +
            "avaliações reais do Google, ou prints de conversa, ou um v\u00eddeo." }
  ];

  function esc(t){
    return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];
    });
  }

  function estrelas(nota){
    var d = "", i;
    for(i = 1; i <= 5; i++){
      d += '<svg viewBox="0 0 24 24" class="' + (i <= Math.round(nota) ? "on" : "") + '">' +
           '<path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z"/></svg>';
    }
    return d;
  }

  /* onde a seção entra: antes do rodapé da página */
  function lugar(){
    var pronto = document.getElementById("avaliacoes");
    if(pronto) return pronto;

    var rodape = document.querySelector("footer");
    if(!rodape) return null;

    var sec = document.createElement("section");
    sec.id = "avaliacoes";
    sec.hidden = true;
    sec.innerHTML =
      '<div class="wrap">' +
        '<div class="sec-head rv in">' +
          '<p class="eyebrow">Quem já contratou</p>' +
          '<h2>O que os clientes falam depois que a placa sobe.</h2>' +
          '<p class="aval-exemplo" id="aval-exemplo" hidden>' +
            '<b>Avaliações de exemplo.</b> Estão aqui só para mostrar o formato. ' +
            'Cadastre as reais no painel — elas substituem estas na hora.' +
          '</p>' +
          '<div class="aval-nota">' +
            '<b class="media" id="aval-media">—</b>' +
            '<span class="estrelas" id="aval-estrelas" aria-hidden="true"></span>' +
            '<span class="de" id="aval-de"></span>' +
            '<a class="fonte" id="aval-fonte" href="#" target="_blank" rel="noopener" hidden>Ver no Google</a>' +
          '</div>' +
        '</div>' +
        '<div class="avals" id="avals"></div>' +
        '<p class="avals-nota">O texto, o print e o vídeo são o que a pessoa mandou — nada aqui é reescrito.</p>' +
      '</div>';
    rodape.parentNode.insertBefore(sec, rodape);
    return sec;
  }

  function midia(a){
    if(a.tipo === "video" && a.midia){
      return '<div class="aval-midia video">' +
               '<video controls playsinline preload="metadata"' +
               (a.capa ? ' poster="' + esc(a.capa) + '"' : '') +
               '><source src="' + esc(a.midia) + '">' +
               'Seu navegador não toca este vídeo.</video>' +
             '</div>';
    }
    if(a.tipo === "print" && a.midia){
      /* o href continua ali para quem abre em outra aba de propósito, ou
         para quem está sem JavaScript; o clique normal a gente intercepta */
      return '<a class="aval-midia print" href="' + esc(a.midia) + '" target="_blank" rel="noopener" ' +
             'title="Ver o print inteiro">' +
             '<img src="' + esc(a.midia) + '" alt="Print da mensagem de ' + esc(a.nome) + '" loading="lazy">' +
             '</a>';
    }
    return "";
  }

  function montar(lista){
    var sec = lugar();
    if(!sec) return;

    /* print e vídeo valem por si; texto puro precisa de texto */
    lista = (lista || []).filter(function(a){
      if(!a || !a.nome) return false;
      return a.tipo === "print" || a.tipo === "video" ? !!a.midia : !!a.texto;
    });

    if(!lista.length){ sec.hidden = true; return; }

    var soma = 0, html = "";
    lista.forEach(function(a){
      var nota = Number(a.nota) || 5;
      soma += nota;
      html += '<article class="aval' + (a.tipo === "video" ? " tem-video" : "") +
                (a.exemplo ? " e-exemplo" : "") + '">' +
                (a.exemplo ? '<span class="selo-ex">exemplo</span>' : '') +
                '<span class="estrelas" aria-label="' + nota + ' de 5 estrelas">' + estrelas(nota) + '</span>' +
                midia(a) +
                (a.texto ? '<blockquote>' + esc(a.texto) + '</blockquote>' : '') +
                '<div class="quem">' +
                  '<span class="ini" aria-hidden="true">' + esc(a.nome.trim().charAt(0).toUpperCase()) + '</span>' +
                  '<div><b>' + esc(a.nome) + '</b>' +
                  (a.servico || a.data
                    ? '<span>' + esc([a.servico, a.data].filter(Boolean).join(" · ")) + '</span>' : '') +
                  '</div>' +
                '</div>' +
              '</article>';
    });

    document.getElementById("avals").innerHTML = html;

    /* enquanto for exemplo, a página diz que é exemplo — em cima e em cada cartão */
    var demo = lista.some(function(a){ return a && a.exemplo; });
    document.getElementById("aval-exemplo").hidden = !demo;

    var media = soma / lista.length;
    document.getElementById("aval-media").textContent = media.toFixed(1).replace(".", ",");
    document.getElementById("aval-estrelas").innerHTML = estrelas(media);
    document.getElementById("aval-de").textContent = demo
      ? "de " + lista.length + " avaliações de exemplo"
      : (lista.length === 1 ? "de 1 avaliação" : "de " + lista.length + " avaliações");

    var fonte = document.getElementById("aval-fonte");
    var perfil = (window.ARTSIVOS_DADOS && window.ARTSIVOS_DADOS.googlePerfil) || "";
    if(perfil){ fonte.href = perfil; fonte.hidden = false; } else { fonte.hidden = true; }

    sec.hidden = false;
  }

  /* ------------------------------ a lupa ------------------------------
     Print pequeno não se lê, e avaliação que não se lê não convence. Antes o
     clique abria outra aba com o endereço cru do arquivo: a pessoa saía do
     site para ver a prova de que devia confiar no site. Agora abre por cima,
     e fechar devolve ela onde estava.                                     */
  var lupa = null;

  function fecharLupa(){
    if(!lupa) return;
    lupa.hidden = true;
    lupa.querySelector("img").removeAttribute("src");
  }

  function abrirLupa(url, descricao){
    if(!lupa){
      lupa = document.createElement("div");
      lupa.className = "lupa";
      lupa.hidden = true;
      lupa.innerHTML = '<button class="fechar" type="button" aria-label="Fechar">×</button><img alt="">';
      lupa.addEventListener("click", function(e){ if(e.target === lupa) fecharLupa(); });
      lupa.querySelector(".fechar").addEventListener("click", fecharLupa);
      document.body.appendChild(lupa);
      document.addEventListener("keydown", function(e){
        if(e.key === "Escape" && lupa && !lupa.hidden) fecharLupa();
      });
    }
    var img = lupa.querySelector("img");
    img.src = url;
    img.alt = descricao || "";
    lupa.hidden = false;
    lupa.querySelector(".fechar").focus();
  }

  /* um ouvinte só, na seção, em vez de um por cartão: a lista é remontada
     toda vez que o painel manda dados novos */
  document.addEventListener("click", function(e){
    var alvo = e.target.closest ? e.target.closest(".aval-midia.print") : null;
    if(!alvo) return;
    e.preventDefault();
    var img = alvo.querySelector("img");
    abrirLupa(alvo.getAttribute("href"), img ? img.getAttribute("alt") : "");
  });

  montar(LOCAIS);

  /* o painel chega depois da página montada */
  document.addEventListener("artsivos:dados", function(ev){
    var d = (ev && ev.detail) || window.ARTSIVOS_DADOS || {};
    if(d.avaliacoes && d.avaliacoes.length) montar(d.avaliacoes);
  });
})();
