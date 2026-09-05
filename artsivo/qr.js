/* QR code — gerador próprio, sem depender de serviço de fora.
   Modo byte, correção de erro nível M, versões 1 a 10. Suficiente para uma URL.
   Uso: QR.svg("https://exemplo.com", 200) -> string com o <svg>. */
var QR = (function(){

  /* ---- campo de Galois GF(256), usado pela correção de erro ---- */
  var EXP = new Array(512), LOG = new Array(256);
  (function(){
    var x = 1;
    for(var i = 0; i < 255; i++){
      EXP[i] = x; LOG[x] = i;
      x <<= 1; if(x & 0x100) x ^= 0x11D;
    }
    for(i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  function mul(a, b){ return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]]; }

  function polGerador(grau){
    var g = [1];
    for(var i = 0; i < grau; i++){
      var novo = new Array(g.length + 1);
      for(var j = 0; j < novo.length; j++) novo[j] = 0;
      for(j = 0; j < g.length; j++){
        novo[j] ^= g[j];                       /* multiplica por x */
        novo[j + 1] ^= mul(g[j], EXP[i]);      /* e por alfa^i */
      }
      g = novo;
    }
    return g;
  }

  function correcao(dados, qtd){
    var g = polGerador(qtd), r = dados.slice().concat(new Array(qtd).fill(0));
    for(var i = 0; i < dados.length; i++){
      var c = r[i];
      if(c === 0) continue;
      for(var j = 0; j < g.length; j++) r[i + j] ^= mul(g[j], c);
    }
    return r.slice(dados.length);
  }

  /* ---- tabelas do nível M, versões 1..10 ----
     [total de códigos, blocos do grupo 1, dados por bloco g1, blocos g2, dados por bloco g2] */
  var M = {
    1:  [26,   1, 16, 0, 0],
    2:  [44,   1, 28, 0, 0],
    3:  [70,   1, 44, 0, 0],
    4:  [100,  2, 32, 0, 0],
    5:  [134,  2, 43, 0, 0],
    6:  [172,  4, 27, 0, 0],
    7:  [196,  4, 31, 0, 0],
    8:  [242,  2, 38, 2, 39],
    9:  [292,  3, 36, 2, 37],
    10: [346,  4, 43, 1, 44]
  };
  var ALINHA = {1:[], 2:[6,18], 3:[6,22], 4:[6,26], 5:[6,30], 6:[6,34],
                7:[6,22,38], 8:[6,24,42], 9:[6,26,46], 10:[6,28,50]};

  function bytesDe(txt){
    var s = unescape(encodeURIComponent(txt)), out = [];
    for(var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }

  function versaoPara(n){
    for(var v = 1; v <= 10; v++){
      var t = M[v], ecPorBloco = Math.floor(t[0] / (t[1] + t[3])) - (v < 10 && t[3] === 0 ? Math.floor(t[0] / t[1]) - t[2] : 0);
      var capacidade = t[1] * t[2] + t[3] * t[4];
      var cabecalho = 2 + (v < 10 ? 8 : 16);           /* modo (4 bits) + contador */
      if(capacidade * 8 >= n * 8 + 4 + (v < 10 ? 8 : 16)) return v;
    }
    return 0;
  }

  function bits(dados, v){
    var t = M[v], capacidade = t[1] * t[2] + t[3] * t[4];
    var b = [];
    function push(valor, n){ for(var i = n - 1; i >= 0; i--) b.push((valor >> i) & 1); }
    push(4, 4);                                   /* modo byte */
    push(dados.length, v < 10 ? 8 : 16);
    for(var i = 0; i < dados.length; i++) push(dados[i], 8);
    var falta = capacidade * 8 - b.length;
    push(0, Math.min(4, falta));                  /* terminador */
    while(b.length % 8) b.push(0);
    var bytes = [];
    for(i = 0; i < b.length; i += 8){
      var by = 0;
      for(var j = 0; j < 8; j++) by = (by << 1) | b[i + j];
      bytes.push(by);
    }
    var enche = [0xEC, 0x11], k = 0;
    while(bytes.length < capacidade) bytes.push(enche[k++ % 2]);
    return bytes;
  }

  function entrelaca(bytes, v){
    var t = M[v], blocos = [], p = 0, i, j;
    for(i = 0; i < t[1]; i++){ blocos.push(bytes.slice(p, p + t[2])); p += t[2]; }
    for(i = 0; i < t[3]; i++){ blocos.push(bytes.slice(p, p + t[4])); p += t[4]; }
    var ecPorBloco = Math.floor((t[0] - (t[1] * t[2] + t[3] * t[4])) / (t[1] + t[3]));
    var ecs = blocos.map(function(b){ return correcao(b, ecPorBloco); });

    var out = [], maior = Math.max(t[2], t[4] || 0);
    for(i = 0; i < maior; i++)
      for(j = 0; j < blocos.length; j++)
        if(i < blocos[j].length) out.push(blocos[j][i]);
    for(i = 0; i < ecPorBloco; i++)
      for(j = 0; j < ecs.length; j++) out.push(ecs[j][i]);
    return out;
  }

  /* ---- desenho da matriz ---- */
  function matriz(v){
    var n = v * 4 + 17, m = [], reservado = [], i, j;
    for(i = 0; i < n; i++){
      m.push(new Array(n).fill(0));
      reservado.push(new Array(n).fill(false));
    }
    function marca(x, y, val){ if(x >= 0 && y >= 0 && x < n && y < n){ m[y][x] = val; reservado[y][x] = true; } }

    function localizador(cx, cy){
      for(var dy = -1; dy <= 7; dy++)
        for(var dx = -1; dx <= 7; dx++){
          var x = cx + dx, y = cy + dy;
          var dentro = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
          var preto = dentro && (dx === 0 || dx === 6 || dy === 0 || dy === 6 ||
                     (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
          marca(x, y, preto ? 1 : 0);
        }
    }
    localizador(0, 0); localizador(n - 7, 0); localizador(0, n - 7);

    for(i = 8; i < n - 8; i++){                    /* linhas de tempo */
      marca(i, 6, i % 2 === 0 ? 1 : 0);
      marca(6, i, i % 2 === 0 ? 1 : 0);
    }
    marca(8, n - 8, 1);                            /* módulo escuro fixo */

    var al = ALINHA[v];
    for(i = 0; i < al.length; i++)
      for(j = 0; j < al.length; j++){
        var cx = al[i], cy = al[j];
        if((cx <= 8 && cy <= 8) || (cx >= n - 9 && cy <= 8) || (cx <= 8 && cy >= n - 9)) continue;
        for(var dy = -2; dy <= 2; dy++)
          for(var dx = -2; dx <= 2; dx++)
            marca(cx + dx, cy + dy, (Math.abs(dx) === 2 || Math.abs(dy) === 2 || (dx === 0 && dy === 0)) ? 1 : 0);
      }

    if(v >= 7){                                    /* espaço da informação de versão */
      for(i = 0; i < 18; i++){
        var a = n - 11 + i % 3, b = Math.floor(i / 3);
        reservado[b][a] = true; reservado[a][b] = true;
      }
    }

    for(i = 0; i <= 8; i++){                       /* espaço do formato */
      if(i !== 6){ reservado[8][i] = true; reservado[i][8] = true; }
    }
    reservado[8][8] = true;
    for(i = 0; i < 8; i++){ reservado[n - 1 - i][8] = true; reservado[8][n - 1 - i] = true; }

    return {m: m, r: reservado, n: n};
  }

  function preenche(mat, bytes){
    var m = mat.m, r = mat.r, n = mat.n, bit = 0, total = bytes.length * 8;
    function proximo(){
      if(bit >= total) return 0;
      var b = (bytes[bit >> 3] >> (7 - (bit & 7))) & 1;
      bit++;
      return b;
    }
    var cima = true;
    for(var col = n - 1; col > 0; col -= 2){
      if(col === 6) col--;                          /* pula a coluna de tempo */
      for(var k = 0; k < n; k++){
        var y = cima ? n - 1 - k : k;
        for(var d = 0; d < 2; d++){
          var x = col - d;
          if(!r[y][x]) m[y][x] = proximo();
        }
      }
      cima = !cima;
    }
  }

  function mascara(m, n, r, id){
    var f = [
      function(x,y){ return (x + y) % 2 === 0; },
      function(x,y){ return y % 2 === 0; },
      function(x,y){ return x % 3 === 0; },
      function(x,y){ return (x + y) % 3 === 0; },
      function(x,y){ return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0; },
      function(x,y){ return (x * y) % 2 + (x * y) % 3 === 0; },
      function(x,y){ return ((x * y) % 2 + (x * y) % 3) % 2 === 0; },
      function(x,y){ return ((x + y) % 2 + (x * y) % 3) % 2 === 0; }
    ][id];
    var out = m.map(function(l){ return l.slice(); });
    for(var y = 0; y < n; y++)
      for(var x = 0; x < n; x++)
        if(!r[y][x] && f(x, y)) out[y][x] ^= 1;
    return out;
  }

  function formato(m, n, id){
    var dados = (0x00 << 3) | id;                   /* 00 = nível M */
    var v = dados << 10, g = 0x537;
    for(var i = 4; i >= 0; i--) if(v & (1 << (i + 10))) v ^= g << i;
    var bitsF = ((dados << 10) | v) ^ 0x5412;
    function põe(x, y, b){ m[y][x] = b; }
    for(i = 0; i < 15; i++){
      var b = (bitsF >> i) & 1;
      if(i < 6) põe(8, i, b);
      else if(i < 8) põe(8, i + 1, b);
      else if(i === 8) põe(7, 8, b);
      else põe(14 - i, 8, b);

      if(i < 8) põe(n - 1 - i, 8, b);
      else põe(8, n - 15 + i, b);
    }
  }

  /* versões 7 e acima carregam o número da versão em dois blocos de 18 bits */
  function infoVersao(m, n, v){
    if(v < 7) return;
    var r = v, g = 0x1F25;
    for(var i = 0; i < 12; i++) r = (r << 1) ^ ((r >> 11) & 1 ? g : 0);
    var bitsV = (v << 12) | (r & 0xFFF);
    for(i = 0; i < 18; i++){
      var b = (bitsV >> i) & 1, a = n - 11 + i % 3, c = Math.floor(i / 3);
      m[c][a] = b; m[a][c] = b;
    }
  }

  function penalidade(m, n){
    var p = 0, x, y, i;
    for(y = 0; y < n; y++){
      for(var eixo = 0; eixo < 2; eixo++){
        var run = 1;
        for(x = 1; x < n; x++){
          var a = eixo ? m[x][y] : m[y][x], b = eixo ? m[x-1][y] : m[y][x-1];
          if(a === b) run++;
          else { if(run >= 5) p += run - 2; run = 1; }
        }
        if(run >= 5) p += run - 2;
      }
    }
    for(y = 0; y < n - 1; y++)
      for(x = 0; x < n - 1; x++){
        var s = m[y][x] + m[y][x+1] + m[y+1][x] + m[y+1][x+1];
        if(s === 0 || s === 4) p += 3;
      }
    var pad = [1,0,1,1,1,0,1,0,0,0,0], pad2 = [0,0,0,0,1,0,1,1,1,0,1];
    function bate(get, pos, alvo){
      for(var k = 0; k < 11; k++) if(get(pos + k) !== alvo[k]) return false;
      return true;
    }
    for(y = 0; y < n; y++)
      for(x = 0; x + 11 <= n; x++){
        var linha = function(i){ return m[y][i]; }, col = function(i){ return m[i][y]; };
        if(bate(linha, x, pad) || bate(linha, x, pad2)) p += 40;
        if(bate(col, x, pad) || bate(col, x, pad2)) p += 40;
      }
    var escuros = 0;
    for(y = 0; y < n; y++) for(x = 0; x < n; x++) escuros += m[y][x];
    var pct = escuros * 100 / (n * n);
    p += Math.floor(Math.abs(pct - 50) / 5) * 10;
    return p;
  }

  function gerar(texto, mascaraFixa){
    var dados = bytesDe(texto), v = versaoPara(dados.length);
    if(!v) throw new Error('texto grande demais para o QR');
    var mat = matriz(v);
    preenche(mat, entrelaca(bits(dados, v), v));

    var melhor = null, melhorP = Infinity;
    for(var id = 0; id < 8; id++){
      if(mascaraFixa != null && id !== mascaraFixa) continue;
      var m = mascara(mat.m, mat.n, mat.r, id);
      formato(m, mat.n, id);
      infoVersao(m, mat.n, v);
      var p = penalidade(m, mat.n);
      if(p < melhorP){ melhorP = p; melhor = m; }
    }
    return {m: melhor, n: mat.n, versao: v};
  }

  function svg(texto, lado, mascaraFixa){
    var q = gerar(texto, mascaraFixa), n = q.n, borda = 4, total = n + borda * 2;
    var d = '';
    for(var y = 0; y < n; y++)
      for(var x = 0; x < n; x++)
        if(q.m[y][x]) d += 'M' + (x + borda) + ' ' + (y + borda) + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total +
           '" width="' + lado + '" height="' + lado + '" shape-rendering="crispEdges" role="img" aria-label="QR code">' +
           '<rect width="' + total + '" height="' + total + '" fill="#fff"/>' +
           '<path d="' + d + '" fill="#0A0A0C"/></svg>';
  }

  return {gerar: gerar, svg: svg};
})();
if(typeof module !== 'undefined') module.exports = QR;
