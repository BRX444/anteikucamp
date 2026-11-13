/* =========================================================
   FUNÇÕES COMPARTILHADAS — CAMPEONATO ANTEIKU
   Sons, janelas (modais), confete, classificação e chaveamento.
   ========================================================= */

/* ---------------- TIMES EDITADOS NESTE APARELHO ----------------
   Se alguém usou o botão "Editar times", os times salvos no navegador
   substituem os do dados.js (só neste aparelho). */
const TIMES_ORIGINAIS = JSON.parse(JSON.stringify(TIMES));
let timesEditados = false;
try {
  const salvos = JSON.parse(localStorage.getItem("anteiku-times") || "null");
  if (Array.isArray(salvos) && salvos.length) {
    TIMES.splice(0, TIMES.length, ...salvos);
    timesEditados = true;
  }
} catch (e) {}

// Placares do mata-mata lançados pelo site (também só neste aparelho)
if (!Array.isArray(CHAVEAMENTO.resultados)) CHAVEAMENTO.resultados = [];
try {
  const placaresSalvos = JSON.parse(localStorage.getItem("anteiku-resultados") || "null");
  if (Array.isArray(placaresSalvos)) {
    CHAVEAMENTO.resultados = placaresSalvos;
    timesEditados = true;
  }
} catch (e) {}

// Times movidos à mão no chaveamento (arrastar e soltar)
if (!Array.isArray(CHAVEAMENTO.movimentos)) CHAVEAMENTO.movimentos = [];
try {
  const movimentosSalvos = JSON.parse(localStorage.getItem("anteiku-movimentos") || "null");
  if (Array.isArray(movimentosSalvos)) {
    CHAVEAMENTO.movimentos = movimentosSalvos;
    timesEditados = true;
  }
} catch (e) {}

// Evita que textos digitados quebrem o HTML
function esc(texto) {
  return String(texto == null ? "" : texto)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ---------------- SONS ---------------- */
let somLigado = true;
try { somLigado = localStorage.getItem("anteiku-som") !== "off"; } catch (e) {}
let audioCtx = null;

// Toca uma nota curta (estilo "bip" de jogo)
function nota(freqInicio, freqFim, duracao, atraso) {
  const t = audioCtx.currentTime + (atraso || 0);
  const osc = audioCtx.createOscillator();
  const ganho = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(freqInicio, t);
  osc.frequency.exponentialRampToValueAtTime(freqFim, t + duracao);
  ganho.gain.setValueAtTime(0.05, t);
  ganho.gain.exponentialRampToValueAtTime(0.0001, t + duracao);
  osc.connect(ganho).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + duracao);
}

function som(tipo) {
  if (!somLigado) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (tipo === "vitoria") {
      nota(523, 523, 0.12, 0);
      nota(659, 659, 0.12, 0.12);
      nota(784, 784, 0.12, 0.24);
      nota(1046, 1046, 0.35, 0.36);
    } else if (tipo === "abrir") {
      nota(380, 1100, 0.14);
    } else if (tipo === "passar") {
      nota(900, 1000, 0.03);
    } else {
      nota(520, 880, 0.08);
    }
  } catch (e) {}
}

/* ---------------- INICIALIZAÇÃO ---------------- */
document.addEventListener("DOMContentLoaded", function () {
  // Botão "Editar times" no canto, ao lado do botão de som
  const botaoSom = document.querySelector(".btn-som");
  if (botaoSom) {
    const botaoEditar = document.createElement("button");
    botaoEditar.type = "button";
    botaoEditar.className = "btn3d btn-editar";
    botaoEditar.innerHTML = '✏️ <span class="txt">Editar times</span>';
    botaoEditar.title = "Editar times";
    botaoEditar.addEventListener("click", abrirEditor);
    botaoSom.parentNode.insertBefore(botaoEditar, botaoSom);
  }

  if (botaoSom) {
    const atualizar = function () {
      botaoSom.textContent = somLigado ? "🔊" : "🔇";
      botaoSom.title = somLigado ? "Desligar sons" : "Ligar sons";
    };
    botaoSom.addEventListener("click", function () {
      somLigado = !somLigado;
      try { localStorage.setItem("anteiku-som", somLigado ? "on" : "off"); } catch (e) {}
      atualizar();
      som("clique");
    });
    atualizar();
  }

  // Links com botão 3D: toca o som e só depois muda de página
  document.querySelectorAll("a.btn3d").forEach(function (link) {
    link.addEventListener("click", function (ev) {
      if (!somLigado || ev.ctrlKey || ev.metaKey) return;
      ev.preventDefault();
      som("clique");
      setTimeout(function () { window.location.href = link.href; }, 140);
    });
  });
});

/* ---------------- JANELA (MODAL) ---------------- */
function abrirModal(conteudoHTML, classeExtra) {
  fecharModal();
  const fundo = document.createElement("div");
  fundo.className = "modal-fundo";
  fundo.innerHTML =
    '<div class="modal painel' + (classeExtra ? " " + classeExtra : "") + '" role="dialog" aria-modal="true">'
    + '<button class="btn3d modal-fechar" type="button" aria-label="Fechar">✕</button>'
    + conteudoHTML
    + "</div>";
  fundo.addEventListener("click", function (ev) {
    // No editor, clicar fora não fecha (para não perder o que foi digitado)
    const foraDoEditor = ev.target === fundo && !classeExtra;
    if (foraDoEditor || ev.target.closest(".modal-fechar")) {
      som("clique");
      fecharModal();
    }
  });
  document.body.appendChild(fundo);
  fundo.querySelector(".modal-fechar").focus();
  som("abrir");
  return fundo;
}

function fecharModal() {
  const aberto = document.querySelector(".modal-fundo");
  if (aberto) aberto.remove();
}

document.addEventListener("keydown", function (ev) {
  if (ev.key === "Escape" && !document.querySelector(".modal.editor")) fecharModal();
});

/* ---------------- EDITOR DE TIMES ---------------- */
function linhaEditorHTML(t) {
  const numero = function (campo, rotulo) {
    return "<label>" + rotulo + '<input type="number" min="0" step="1" class="ed-' + campo + '" value="' + (t[campo] || 0) + '"></label>';
  };
  return '<div class="editor-time" data-id="' + esc(t.id) + '">'
    + '<div class="ed-topo">'
    + '<input type="color" class="ed-cor" value="' + esc(t.cor || "#8b3dff") + '" title="Cor do escudo">'
    + '<input class="ed-sigla" maxlength="3" placeholder="SIG" value="' + esc(t.sigla) + '" title="Sigla (até 3 letras)">'
    + '<input class="ed-nome" placeholder="Nome do time" value="' + esc(t.nome) + '">'
    + '<button type="button" class="btn3d pequeno vermelho ed-remover" title="Remover time">🗑️</button>'
    + "</div>"
    + '<input class="ed-jogadores" placeholder="Jogadores, separados por vírgula" value="' + esc((t.jogadores || []).join(", ")) + '">'
    + '<div class="ed-numeros">'
    + numero("v", "V") + numero("e", "E") + numero("d", "D") + numero("kills", "Kills") + numero("mortes", "Mortes")
    + "</div></div>";
}

function abrirEditor() {
  const fundo = abrirModal(
    '<div class="editor-conteudo">'
    + '<h2 class="contorno">✏️ Editar times</h2>'
    + '<p class="aviso">As mudanças ficam salvas <b>só neste aparelho</b>. Para todo mundo ver, clique em '
    + '<b>“Baixar dados.js”</b> e envie o arquivo para a pasta <code>js</code> do repositório no GitHub. '
    + "O arquivo baixado já leva os times <b>e</b> os placares do mata-mata. "
    + "Os " + quantidadeClassificados() + " primeiros da tabela vão para o mata-mata (dá para mudar na página do chaveamento)."
    + (timesEditados ? '<br><span class="editado">● Este aparelho está usando times ou placares editados.</span>' : "")
    + "</p>"
    + '<div class="lista-editor">' + TIMES.map(linhaEditorHTML).join("") + "</div>"
    + '<button type="button" class="btn3d azul ed-adicionar">➕ Adicionar time</button>'
    + '<p class="erro" hidden></p>'
    + '<div class="ed-acoes">'
    + '<button type="button" class="btn3d ed-salvar">💾 Salvar</button>'
    + '<button type="button" class="btn3d azul ed-baixar">⬇️ Baixar dados.js</button>'
    + '<button type="button" class="btn3d vermelho ed-restaurar">↩️ Restaurar original</button>'
    + "</div></div>",
    "editor"
  );

  const lista = fundo.querySelector(".lista-editor");
  const erro = fundo.querySelector(".erro");

  fundo.querySelector(".ed-adicionar").addEventListener("click", function () {
    som("clique");
    lista.insertAdjacentHTML("beforeend", linhaEditorHTML({
      id: "time" + Date.now(), nome: "", sigla: "", cor: "#8b3dff", jogadores: [], v: 0, e: 0, d: 0, kills: 0, mortes: 0,
    }));
    const nova = lista.lastElementChild;
    nova.scrollIntoView({ behavior: "smooth", block: "center" });
    nova.querySelector(".ed-nome").focus();
  });

  lista.addEventListener("click", function (ev) {
    const remover = ev.target.closest(".ed-remover");
    if (!remover) return;
    som("clique");
    remover.closest(".editor-time").remove();
  });

  // Sigla sempre em maiúsculas
  lista.addEventListener("input", function (ev) {
    if (ev.target.classList.contains("ed-sigla")) ev.target.value = ev.target.value.toUpperCase();
  });

  // Lê o que foi digitado e devolve a lista de times (ou null se tiver erro)
  function lerTimes() {
    const times = [];
    const linhas = lista.querySelectorAll(".editor-time");
    for (const linha of linhas) {
      linha.classList.remove("com-erro");
      const nome = linha.querySelector(".ed-nome").value.trim();
      if (!nome) {
        linha.classList.add("com-erro");
        erro.textContent = "⚠️ Todo time precisa de um nome.";
        erro.hidden = false;
        linha.querySelector(".ed-nome").focus();
        return null;
      }
      const id = linha.dataset.id;
      const original = TIMES.find(function (t) { return t.id === id; });
      const num = function (campo) {
        return Math.max(0, Math.floor(Number(linha.querySelector(".ed-" + campo).value) || 0));
      };
      const time = {
        id: id,
        nome: nome,
        sigla: (linha.querySelector(".ed-sigla").value.trim() || nome.slice(0, 2)).toUpperCase().slice(0, 3),
        cor: linha.querySelector(".ed-cor").value,
        jogadores: linha.querySelector(".ed-jogadores").value.split(",").map(function (j) { return j.trim(); }).filter(Boolean),
        v: num("v"), e: num("e"), d: num("d"), kills: num("kills"), mortes: num("mortes"),
      };
      if (original && original.logo) time.logo = original.logo;
      times.push(time);
    }
    if (!times.length) {
      erro.textContent = "⚠️ Deixe pelo menos um time.";
      erro.hidden = false;
      return null;
    }
    erro.hidden = true;
    return times;
  }

  fundo.querySelector(".ed-salvar").addEventListener("click", function () {
    const times = lerTimes();
    if (!times) return;
    try {
      localStorage.setItem("anteiku-times", JSON.stringify(times));
    } catch (e) {
      erro.textContent = "⚠️ Este navegador não deixou salvar. Use “Baixar dados.js”.";
      erro.hidden = false;
      return;
    }
    som("vitoria");
    setTimeout(function () { window.location.reload(); }, 450);
  });

  fundo.querySelector(".ed-baixar").addEventListener("click", function () {
    const times = lerTimes();
    if (!times) return;
    som("clique");
    baixarDadosJS(times);
  });

  fundo.querySelector(".ed-restaurar").addEventListener("click", function () {
    if (!window.confirm("Voltar para os times e placares originais do dados.js? As edições deste aparelho serão apagadas.")) return;
    try {
      localStorage.removeItem("anteiku-times");
      localStorage.removeItem("anteiku-resultados");
      localStorage.removeItem("anteiku-movimentos");
      localStorage.removeItem("anteiku-formato");
      localStorage.removeItem("anteiku-classificados");
    } catch (e) {}
    window.location.reload();
  });
}

// Gera um dados.js novo com os times editados e baixa o arquivo
function baixarDadosJS(times) {
  const linhasTimes = times.map(function (t) { return "  " + JSON.stringify(t); }).join(",\n");
  const conteudo =
    "/* =========================================================\n"
    + "   DADOS DO CAMPEONATO ANTEIKU — BRAWL STARS\n"
    + "   Arquivo gerado pelo botão \"Editar times\" do site.\n"
    + "   Veja o README.md para entender cada campo.\n"
    + "   ========================================================= */\n\n"
    + "const TIMES = [\n" + linhasTimes + ",\n];\n\n"
    + "const CHAVEAMENTO = " + JSON.stringify(CHAVEAMENTO, null, 2) + ";\n";

  const blob = new Blob([conteudo], { type: "text/javascript" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "dados.js";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
}

/* ---------------- CONFETE ---------------- */
function confete() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.className = "confete";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const cores = ["#ffc800", "#1fa2ff", "#ff3d8b", "#3ddc5a", "#ffffff"];

  const pedacos = [];
  for (let i = 0; i < 160; i++) {
    pedacos.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.6,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      giro: Math.random() * 6.28,
      vGiro: (Math.random() - 0.5) * 0.3,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      cor: cores[Math.floor(Math.random() * cores.length)],
    });
  }

  const inicio = performance.now();
  function animar(agora) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pedacos.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.giro += p.vGiro;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.giro);
      ctx.fillStyle = p.cor;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (agora - inicio < 4000) requestAnimationFrame(animar);
    else canvas.remove();
  }
  requestAnimationFrame(animar);
}

/* ---------------- TIMES ---------------- */
function buscarTime(id) {
  return TIMES.find(function (t) { return t.id === id; }) || null;
}

function escudoHTML(time, classeExtra) {
  const classe = "escudo" + (classeExtra ? " " + classeExtra : "");
  if (!time) return '<span class="' + classe + ' vazio"></span>';
  if (time.logo) {
    return '<span class="' + classe + '"><img src="' + time.logo + '" alt="' + time.sigla + '"></span>';
  }
  return '<span class="' + classe + '" style="background:' + time.cor + '">' + time.sigla + "</span>";
}

// Sistema de pontos: vitória = 3 · empate = 1 · derrota = 0
const PONTOS_VITORIA = 3;
const PONTOS_EMPATE = 1;
const PONTOS_DERROTA = 0;

function pontos(t) {
  return (t.v || 0) * PONTOS_VITORIA + (t.e || 0) * PONTOS_EMPATE + (t.d || 0) * PONTOS_DERROTA;
}

// Ordem oficial: pontos → vitórias → (kills - mortes) → kills → nome
function classificacao() {
  return TIMES.slice().sort(function (a, b) {
    return (pontos(b) - pontos(a))
      || (b.v - a.v)
      || ((b.kills - b.mortes) - (a.kills - a.mortes))
      || (b.kills - a.kills)
      || a.nome.localeCompare(b.nome);
  });
}

function posicaoDe(time) {
  return classificacao().indexOf(time) + 1;
}

function estatisticas(t) {
  const jogos = (t.v || 0) + (t.e || 0) + (t.d || 0);
  return {
    jogos: jogos,
    pontos: pontos(t),
    kd: t.mortes ? (t.kills / t.mortes) : t.kills,
    pctVitorias: jogos ? Math.round((t.v / jogos) * 100) : 0,
  };
}

/* ---------------- FORMATO DO MATA-MATA (X1 / 2x2 / 3x3) ---------------- */
const FORMATOS = {
  "x1":  { rotulo: "X1",  jogadores: 1, descricao: "1 contra 1" },
  "2x2": { rotulo: "2x2", jogadores: 2, descricao: "2 contra 2" },
  "3x3": { rotulo: "3x3", jogadores: 3, descricao: "3 contra 3" },
};

function formatoAtual() {
  return FORMATOS[CHAVEAMENTO.formato] ? CHAVEAMENTO.formato : "3x3";
}

function salvarFormato(formato) {
  if (!FORMATOS[formato]) return false;
  CHAVEAMENTO.formato = formato;
  try {
    localStorage.setItem("anteiku-formato", formato);
    return true;
  } catch (e) {
    return false;
  }
}

// Quantidade de times no mata-mata escolhida neste aparelho
try {
  const qtdSalva = Number(localStorage.getItem("anteiku-classificados"));
  if (qtdSalva >= 2) {
    CHAVEAMENTO.classificados = qtdSalva;
    timesEditados = true;
  }
} catch (e) {}

function salvarClassificados(qtd) {
  qtd = Math.max(2, Math.min(TIMES.length, Math.floor(Number(qtd)) || 2));
  CHAVEAMENTO.classificados = qtd;
  try {
    localStorage.setItem("anteiku-classificados", String(qtd));
    return true;
  } catch (e) {
    return false;
  }
}

// Formato escolhido neste aparelho
try {
  const formatoSalvo = localStorage.getItem("anteiku-formato");
  if (formatoSalvo && FORMATOS[formatoSalvo]) {
    CHAVEAMENTO.formato = formatoSalvo;
    timesEditados = true;
  }
} catch (e) {}

// Cartão com as estatísticas de um time (abre na janela)
function cartaoTimeHTML(t) {
  const s = estatisticas(t);
  const pos = posicaoDe(t);
  const medalha = pos === 1 ? "🥇 " : pos === 2 ? "🥈 " : pos === 3 ? "🥉 " : "";
  const pct = function (n) { return s.jogos ? (n / s.jogos) * 100 : 0; };

  const jogadores = (t.jogadores && t.jogadores.length)
    ? '<div class="jogadores">' + t.jogadores.map(function (j) { return "<span>🎮 " + j + "</span>"; }).join("") + "</div>"
    : "";

  return '<div class="cartao-time">'
    + escudoHTML(t, "grande")
    + '<h2 class="contorno">' + t.nome + "</h2>"
    + '<div class="colocacao">' + medalha + pos + "º lugar na tabela</div>"
    + jogadores
    + '<div class="grade-stats">'
    + '<div class="stat amarelo"><b>' + s.pontos + "</b><span>Pontos</span></div>"
    + '<div class="stat"><b>' + s.jogos + "</b><span>Partidas</span></div>"
    + '<div class="stat amarelo"><b>' + s.kd.toFixed(2) + "</b><span>K/D</span></div>"
    + '<div class="stat verde"><b>' + t.v + "</b><span>Vitórias</span></div>"
    + '<div class="stat"><b>' + (t.e || 0) + "</b><span>Empates</span></div>"
    + '<div class="stat vermelho"><b>' + t.d + "</b><span>Derrotas</span></div>"
    + '<div class="stat verde"><b>' + t.kills + "</b><span>Kills</span></div>"
    + '<div class="stat vermelho"><b>' + t.mortes + "</b><span>Mortes</span></div>"
    + '<div class="stat"><b>' + s.pctVitorias + "%</b><span>Aproveit.</span></div>"
    + "</div>"
    + '<div class="barra">'
    + '<i class="v" style="width:' + pct(t.v) + '%"></i>'
    + '<i class="e" style="width:' + pct(t.e || 0) + '%"></i>'
    + '<i class="d" style="width:' + pct(t.d) + '%"></i>'
    + "</div>"
    + '<div class="legenda-barra"><span>🟩 Vitórias</span><span>⬜ Empates</span><span>🟥 Derrotas</span></div>'
    + "</div>";
}

function abrirTime(id) {
  const t = buscarTime(id);
  if (t) abrirModal(cartaoTimeHTML(t));
}

/* ---------------- CHAVEAMENTO ---------------- */
// Quantos times da tabela vão para o mata-mata (padrão: 14)
function quantidadeClassificados() {
  return Math.min(Number(CHAVEAMENTO.classificados) || 14, TIMES.length);
}

// Os melhores da tabela, na ordem de classificação
function classificadosMataMata() {
  return classificacao().slice(0, quantidadeClassificados());
}

// Ordem clássica de chaveamento: 1º x último, 2º x penúltimo...
// Para 16 vagas: 1,16, 8,9, 4,13, 5,12, 2,15, 7,10, 3,14, 6,11
function ordemSementes(tamanho) {
  let ordem = [1, 2];
  while (ordem.length < tamanho) {
    const n = ordem.length * 2;
    ordem = ordem.reduce(function (lista, s) { return lista.concat([s, n + 1 - s]); }, []);
  }
  return ordem;
}

function nomeFase(quantidadeJogos) {
  if (quantidadeJogos === 1) return "Final";
  if (quantidadeJogos === 2) return "Semifinal";
  if (quantidadeJogos === 4) return "Quartas de final";
  if (quantidadeJogos === 8) return "Oitavas de final";
  return "Fase de " + (quantidadeJogos * 2);
}

// Procura o placar de um confronto (os times podem estar em qualquer ordem)
function resultadoEntre(a, b) {
  for (const r of CHAVEAMENTO.resultados) {
    if (!r || !r.times || !r.placar) continue;
    if (r.times[0] === a && r.times[1] === b) return [r.placar[0], r.placar[1]];
    if (r.times[0] === b && r.times[1] === a) return [r.placar[1], r.placar[0]];
  }
  return null;
}

// Vagas de folga são marcadas como "folga-N"
function ehFolga(token) {
  return typeof token === "string" && token.indexOf("folga-") === 0;
}

// Aplica os movimentos feitos à mão (arrastar e soltar) numa fase
//   troca   → dois times (ou time e folga) trocam de lugar
//   colocar → um time vai para uma vaga específica
function aplicarMovimentos(vagas, fase) {
  CHAVEAMENTO.movimentos.forEach(function (m) {
    if (!m || m.fase !== fase) return;
    if (m.tipo === "troca") {
      const i = vagas.indexOf(m.a), j = vagas.indexOf(m.b);
      if (i !== -1 && j !== -1) { vagas[i] = m.b; vagas[j] = m.a; }
    } else if (m.tipo === "colocar" && m.vaga >= 0 && m.vaga < vagas.length && buscarTime(m.time)) {
      const i = vagas.indexOf(m.time);
      if (i !== -1) vagas[i] = vagas[m.vaga];   // se já estava nesta fase, troca de lugar
      vagas[m.vaga] = m.time;
    }
  });
  return vagas;
}

// Monta todas as fases: quem joga contra quem, placares e vencedores
function montarChaveamento() {
  const times = classificadosMataMata();
  if (times.length < 2) return { fases: [], campeao: null };

  // Tamanho do chaveamento: 4, 8, 16... (as vagas que sobram viram folga)
  let tamanho = 2;
  while (tamanho < times.length) tamanho *= 2;

  // Vagas da primeira fase, na ordem clássica (1º x último...)
  let vagas = ordemSementes(tamanho).map(function (s, i) {
    return s <= times.length ? times[s - 1].id : "folga-" + i;
  });

  const fases = [];
  let campeao = null;
  let numeroFase = 0;

  while (true) {
    vagas = aplicarMovimentos(vagas, numeroFase);
    const nome = nomeFase(vagas.length / 2);
    const jogos = [];
    for (let k = 0; k < vagas.length; k += 2) {
      const ta = vagas[k], tb = vagas[k + 1];
      const jogo = {
        fase: nome, numeroFase: numeroFase,
        vagaA: k, vagaB: k + 1, tokenA: ta || null, tokenB: tb || null,
        a: ta && !ehFolga(ta) && buscarTime(ta) ? ta : null,
        b: tb && !ehFolga(tb) && buscarTime(tb) ? tb : null,
        folgaA: ehFolga(ta), folgaB: ehFolga(tb),
        pa: null, pb: null, vencedor: null,
      };
      if (jogo.a && jogo.folgaB) {
        jogo.vencedor = jogo.a;               // passa direto
      } else if (jogo.b && jogo.folgaA) {
        jogo.vencedor = jogo.b;               // passa direto
      } else if (jogo.a && jogo.b) {
        const r = resultadoEntre(jogo.a, jogo.b);
        if (r && r[0] !== null && r[1] !== null) {
          jogo.pa = r[0];
          jogo.pb = r[1];
          if (jogo.pa > jogo.pb) jogo.vencedor = jogo.a;
          else if (jogo.pb > jogo.pa) jogo.vencedor = jogo.b;
        }
      }
      jogos.push(jogo);
    }
    fases.push({ nome: nome, jogos: jogos });

    if (jogos.length === 1) {
      campeao = jogos[0].vencedor;
      break;
    }
    // Os vencedores viram as vagas da próxima fase
    vagas = jogos.map(function (j) { return j.vencedor; });
    numeroFase++;
  }

  return { fases: fases, campeao: campeao };
}

// Registra um movimento feito arrastando um time e salva neste aparelho
function registrarMovimento(movimento) {
  CHAVEAMENTO.movimentos.push(movimento);
  return salvarMovimentos();
}

function salvarMovimentos() {
  try {
    if (CHAVEAMENTO.movimentos.length) {
      localStorage.setItem("anteiku-movimentos", JSON.stringify(CHAVEAMENTO.movimentos));
    } else {
      localStorage.setItem("anteiku-movimentos", "[]");
    }
    return true;
  } catch (e) {
    return false;
  }
}

// Salva (ou apaga) o placar de um confronto neste aparelho
function salvarResultado(a, b, placar) {
  CHAVEAMENTO.resultados = CHAVEAMENTO.resultados.filter(function (r) {
    return !(r && r.times && ((r.times[0] === a && r.times[1] === b) || (r.times[0] === b && r.times[1] === a)));
  });
  if (placar) CHAVEAMENTO.resultados.push({ times: [a, b], placar: placar });
  try {
    localStorage.setItem("anteiku-resultados", JSON.stringify(CHAVEAMENTO.resultados));
    return true;
  } catch (e) {
    return false;
  }
}

// Próximo jogo com os dois times definidos e sem placar
function proximaPartida() {
  const chave = montarChaveamento();
  for (const fase of chave.fases) {
    for (const jogo of fase.jogos) {
      if (jogo.a && jogo.b && jogo.pa === null) return jogo;
    }
  }
  return null;
}

// Janela com os detalhes de um confronto
function abrirConfronto(jogo) {
  const ta = buscarTime(jogo.a), tb = buscarTime(jogo.b);
  const finalizado = jogo.pa !== null;
  const formato = FORMATOS[formatoAtual()];
  // Escalação: os primeiros jogadores do time, conforme o formato (X1, 2x2, 3x3)
  const escalacao = function (t) {
    if (!t) return "";
    const lista = (t.jogadores || []).slice(0, formato.jogadores);
    while (lista.length < formato.jogadores) lista.push("Jogador " + (lista.length + 1));
    return '<div class="escalacao">' + lista.map(function (j) { return "<span>🎮 " + esc(j) + "</span>"; }).join("") + "</div>";
  };
  const ladoVS = function (t) {
    return '<div class="lado-vs"' + (t ? ' data-time="' + t.id + '"' : "") + ">"
      + escudoHTML(t, "grande") + "<span>" + (t ? t.nome : "A definir") + "</span>"
      + escalacao(t) + "</div>";
  };
  const vencedor = jogo.vencedor ? buscarTime(jogo.vencedor) : null;
  const folga = jogo.folgaA || jogo.folgaB;

  // Campos para lançar o placar (só quando os dois times já estão definidos)
  const podeLancar = ta && tb && !folga;
  const lancar = podeLancar
    ? '<div class="lancar-placar">'
      + "<h3>📝 Lançar placar</h3>"
      + '<div class="campos-placar">'
      + '<input type="number" min="0" step="1" class="pl-a" aria-label="Placar de ' + esc(ta.nome) + '" value="' + (finalizado ? jogo.pa : "") + '">'
      + '<span class="x">x</span>'
      + '<input type="number" min="0" step="1" class="pl-b" aria-label="Placar de ' + esc(tb.nome) + '" value="' + (finalizado ? jogo.pb : "") + '">'
      + "</div>"
      + '<p class="erro" hidden></p>'
      + '<div class="ed-acoes">'
      + '<button type="button" class="btn3d pl-salvar">💾 Salvar placar</button>'
      + (finalizado ? '<button type="button" class="btn3d vermelho pl-apagar">🗑️ Apagar placar</button>' : "")
      + "</div>"
      + '<p class="dica">Fica salvo neste aparelho. Para publicar: ✏️ Editar times → ⬇️ Baixar dados.js</p>'
      + "</div>"
    : "";

  let status;
  if (folga) status = '<div class="status vencedor">⏩ ' + (vencedor ? vencedor.nome : "") + " avança direto (folga por estar no topo da tabela)</div>";
  else if (vencedor) status = '<div class="status vencedor">⭐ ' + vencedor.nome + " venceu!</div>";
  else status = '<div class="status">' + (ta && tb ? "⏳ Partida ainda não jogada" : "Aguardando os classificados") + "</div>";

  const fundo = abrirModal(
    '<div class="confronto">'
    + '<div class="fase-nome">' + jogo.fase + ' <span class="selo-formato">' + formato.rotulo + "</span></div>"
    + '<div class="versus" style="margin-top:14px">' + ladoVS(ta)
    + '<span class="vs contorno">VS</span>' + ladoVS(tb) + "</div>"
    + (folga ? "" : '<div class="placar-grande contorno">' + (finalizado ? jogo.pa + " – " + jogo.pb : "? – ?") + "</div>")
    + status
    + '<p class="dica">Toque em um time para ver as estatísticas</p>'
    + lancar
    + "</div>"
  );

  fundo.querySelectorAll(".lado-vs[data-time]").forEach(function (el) {
    el.addEventListener("click", function () { abrirTime(el.dataset.time); });
  });

  if (podeLancar) {
    const erro = fundo.querySelector(".lancar-placar .erro");
    fundo.querySelector(".pl-salvar").addEventListener("click", function () {
      const va = fundo.querySelector(".pl-a").value, vb = fundo.querySelector(".pl-b").value;
      const pa = Math.floor(Number(va)), pb = Math.floor(Number(vb));
      if (va === "" || vb === "" || pa < 0 || pb < 0 || isNaN(pa) || isNaN(pb)) {
        erro.textContent = "⚠️ Preencha os dois placares.";
        erro.hidden = false;
        return;
      }
      if (pa === pb) {
        erro.textContent = "⚠️ No mata-mata não tem empate: alguém precisa vencer.";
        erro.hidden = false;
        return;
      }
      if (!salvarResultado(jogo.a, jogo.b, [pa, pb])) {
        erro.textContent = "⚠️ Este navegador não deixou salvar.";
        erro.hidden = false;
        return;
      }
      som("vitoria");
      setTimeout(function () { window.location.reload(); }, 450);
    });
    const apagar = fundo.querySelector(".pl-apagar");
    if (apagar) {
      apagar.addEventListener("click", function () {
        salvarResultado(jogo.a, jogo.b, null);
        window.location.reload();
      });
    }
  }
}
