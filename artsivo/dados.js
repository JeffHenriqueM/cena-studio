/* ---------------------------------------------------------------------------
   DADOS DO PAINEL — leitura pública
   Busca o que a empresa cadastrou no painel (fotos e preços) e aplica na
   página. Não usa o SDK do Firebase: é uma leitura REST do Firestore, umas
   poucas centenas de bytes, sem biblioteca nenhuma.

   Regra que não pode ser quebrada: se a busca falhar, demorar ou vier vazia,
   a página fica exatamente como está escrita no HTML. O site nunca depende
   do painel para funcionar.
--------------------------------------------------------------------------- */
(function(){
  var PROJETO = "finpay-134b0";
  var CHAVE   = "AIzaSyDHsfm8CPaaJE7_Kf0MMrIK8i39W5ekGhg";
  var DOC     = "artsivos_site/publico";
  var URL = "https://firestore.googleapis.com/v1/projects/" + PROJETO +
            "/databases/(default)/documents/" + DOC + "?key=" + CHAVE;

  /* O Firestore devolve cada valor embrulhado no tipo dele. Desembrulha. */
  function valor(v){
    if(!v || typeof v !== "object") return null;
    if("stringValue"  in v) return v.stringValue;
    if("booleanValue" in v) return v.booleanValue;
    if("integerValue" in v) return Number(v.integerValue);
    if("doubleValue"  in v) return Number(v.doubleValue);
    if("nullValue"    in v) return null;
    if("timestampValue" in v) return v.timestampValue;
    if("mapValue"     in v) return mapa((v.mapValue && v.mapValue.fields) || {});
    if("arrayValue"   in v){
      var it = (v.arrayValue && v.arrayValue.values) || [];
      var saida = [], i;
      for(i = 0; i < it.length; i++) saida.push(valor(it[i]));
      return saida;
    }
    return null;
  }
  function mapa(campos){
    var saida = {}, k;
    for(k in campos) if(Object.prototype.hasOwnProperty.call(campos, k)) saida[k] = valor(campos[k]);
    return saida;
  }

  /* Fotos dos trabalhos: cada bloco da seção tem data-obra. */
  function aplicarFotos(fotos){
    if(!fotos) return;
    var blocos = document.querySelectorAll("[data-obra]"), i;
    for(i = 0; i < blocos.length; i++){
      var chave = blocos[i].getAttribute("data-obra");
      var foto  = fotos[chave];
      if(!foto || !foto.url) continue;
      var img = blocos[i].querySelector("img");
      if(img && img.getAttribute("src") !== foto.url) img.setAttribute("src", foto.url);
    }
  }

  if(typeof fetch !== "function") return;

  fetch(URL, {cache:"no-store"}).then(function(r){
    return r.ok ? r.json() : null;
  }).then(function(d){
    if(!d || !d.fields) return;
    var dados = mapa(d.fields);
    window.ARTSIVOS_DADOS = dados;
    aplicarFotos(dados.fotos);
    /* quem depende dos preços (a calculadora) escuta este evento */
    try{ document.dispatchEvent(new CustomEvent("artsivos:dados", {detail:dados})); }
    catch(e){
      var ev = document.createEvent("CustomEvent");
      ev.initCustomEvent("artsivos:dados", false, false, dados);
      document.dispatchEvent(ev);
    }
  })["catch"](function(){ /* silêncio de propósito: o HTML já basta */ });
})();
