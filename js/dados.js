/* =========================================================
   DADOS DO CAMPEONATO ANTEIKU — BRAWL STARS
   ---------------------------------------------------------
   Este é o ÚNICO arquivo que você precisa editar para
   atualizar a tabela e o chaveamento.
   ========================================================= */

/* ---------- TIMES ----------
   id        → código único (sem espaços), usado nos resultados
   nome      → nome que aparece no site
   sigla     → 2 ou 3 letras que aparecem no escudo
   cor       → cor do escudo (código hexadecimal)
   jogadores → (opcional) nicks do trio
   logo      → (opcional) caminho de uma imagem, ex.: "img/corvos.png"
   v, e, d   → vitórias, empates, derrotas
   kills, mortes → totais do campeonato

   PONTOS (calculados sozinhos): vitória = 3 · empate = 1 · derrota = 0
*/
const TIMES = [
  { id: "corvos",    nome: "Corvos Negros",     sigla: "CN",  cor: "#3b3b58", jogadores: ["Shadow", "Raven", "Nox"],     v: 9, e: 1, d: 0, kills: 120, mortes: 50 },
  { id: "kagune",    nome: "Kagune Squad",      sigla: "KS",  cor: "#e0233f", jogadores: ["Kaze", "Rize", "Touka"],      v: 8, e: 1, d: 1, kills: 110, mortes: 60 },
  { id: "mascaras",  nome: "Máscaras Brancas",  sigla: "MB",  cor: "#8a94ad", jogadores: ["Ghost", "Mask", "Pale"],      v: 7, e: 2, d: 1, kills: 100, mortes: 62 },
  { id: "corujas",   nome: "Corujas",           sigla: "CO",  cor: "#8b3dff", jogadores: ["Owl", "Hoot", "Night"],       v: 7, e: 1, d: 2, kills: 95,  mortes: 65 },
  { id: "cafe",      nome: "Café 20º Distrito", sigla: "C20", cor: "#9a5b2e", jogadores: ["Latte", "Mocha", "Bean"],     v: 6, e: 2, d: 2, kills: 90,  mortes: 66 },
  { id: "lua",       nome: "Lua Vermelha",      sigla: "LV",  cor: "#ff4d5e", jogadores: ["Luna", "Blood", "Eclipse"],   v: 6, e: 1, d: 3, kills: 85,  mortes: 70 },
  { id: "centopeia", nome: "Centopeia",         sigla: "CT",  cor: "#1fbf6a", jogadores: ["Venom", "Crawl", "Leg"],      v: 5, e: 3, d: 2, kills: 80,  mortes: 72 },
  { id: "arvore",    nome: "Árvore Escura",     sigla: "AE",  cor: "#1f7bff", jogadores: ["Root", "Leaf", "Bark"],       v: 5, e: 2, d: 3, kills: 78,  mortes: 74 },
  { id: "palhacos",  nome: "Palhaços",          sigla: "PL",  cor: "#ff8a00", jogadores: ["Joker", "Honk", "Grin"],      v: 5, e: 1, d: 4, kills: 75,  mortes: 75 },
  { id: "pomba",     nome: "Pomba Branca",      sigla: "PB",  cor: "#5fa8d3", jogadores: ["Dove", "Wing", "Sky"],        v: 4, e: 3, d: 3, kills: 70,  mortes: 74 },
  { id: "serpentes", nome: "Serpentes",         sigla: "SP",  cor: "#3c9d3c", jogadores: ["Viper", "Cobra", "Fang"],     v: 4, e: 2, d: 4, kills: 68,  mortes: 78 },
  { id: "dragoes",   nome: "Dragões de Fogo",   sigla: "DF",  cor: "#d9480f", jogadores: ["Blaze", "Ember", "Ash"],      v: 4, e: 1, d: 5, kills: 66,  mortes: 80 },
  { id: "nevoa",     nome: "Névoa Cinza",       sigla: "NC",  cor: "#6b7280", jogadores: ["Fog", "Mist", "Haze"],        v: 3, e: 2, d: 5, kills: 60,  mortes: 85 },
  { id: "trevo",     nome: "Trevo Roxo",        sigla: "TR",  cor: "#a21caf", jogadores: ["Clover", "Lucky", "Four"],    v: 3, e: 1, d: 6, kills: 58,  mortes: 88 },
  { id: "raposas",   nome: "Raposas",           sigla: "RP",  cor: "#ea580c", jogadores: ["Fox", "Kit", "Tail"],         v: 2, e: 2, d: 6, kills: 50,  mortes: 95 },
  { id: "lobos",     nome: "Lobos Azuis",       sigla: "LA",  cor: "#2563eb", jogadores: ["Wolf", "Howl", "Pack"],       v: 1, e: 1, d: 8, kills: 45,  mortes: 100 },
];

/* ---------- CHAVEAMENTO (MATA-MATA) ----------
   O chaveamento é montado SOZINHO com os melhores da tabela:
   1º x pior classificado, 2º x penúltimo, e assim por diante.

   classificados → quantos times da tabela vão para o mata-mata.
                   Se não fechar 4, 8 ou 16, os melhores colocados
                   ganham folga e avançam direto (com 14: o 1º e o 2º).

   resultados    → placares dos jogos do mata-mata.
                   times  = os dois ids que se enfrentaram
                   placar = placar na MESMA ordem dos times
                   Dica: dá para lançar o placar pelo site, clicando no confronto.
*/
const CHAVEAMENTO = {
  classificados: 14,

  // Formato das partidas do mata-mata: "x1", "2x2" ou "3x3"
  formato: "3x3",

  resultados: [
    // Oitavas de final
    { times: ["arvore",    "palhacos"],  placar: [2, 1] },
    { times: ["corujas",   "nevoa"],     placar: [3, 1] },
    { times: ["cafe",      "dragoes"],   placar: [1, 2] },
    { times: ["centopeia", "pomba"],     placar: [3, 2] },
    { times: ["mascaras",  "trevo"],     placar: [3, 0] },
    { times: ["lua",       "serpentes"], placar: [2, 0] },

    // Quartas de final
    { times: ["corvos",    "arvore"],    placar: [3, 0] },
    { times: ["corujas",   "dragoes"],   placar: [2, 1] },
  ],

  // Times movidos à mão (arrastando no site). Deixe [] para o chaveamento automático.
  movimentos: [],
};
