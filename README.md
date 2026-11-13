# Campeonato ANTEIKU

Site com a **tabela** e o **chaveamento** do campeonato de Brawl Stars da ANTEIKU, feito para rodar no GitHub Pages.
Site de fã, sem ligação oficial com a Supercell.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | Página inicial com os dois botões |
| `tabela.html` | Tabela (Pts, V, E, D, Kills, Mortes) |
| `chaveamento.html` | Chaveamento do mata-mata |
| `js/dados.js` | **Times e resultados (é aqui que você atualiza tudo)** |
| `js/app.js` | Sons, janelas de detalhes, confete e cálculos |
| `css/style.css` | Visual do site (cores no topo do arquivo) |
| `logo.png` | (opcional) logo da ANTEIKU, coloque na pasta principal |

## Como atualizar os resultados

### Jeito fácil: botão ✏️ Editar times

1. No site, clique em **✏️ Editar times** (canto de cima, ao lado do 🔊).
2. Mude nomes, siglas, cores, jogadores e números. Use ➕ para adicionar e 🗑️ para remover.
3. **💾 Salvar** → as mudanças aparecem na hora, mas **só no seu aparelho**.
4. **⬇️ Baixar dados.js** → baixa o arquivo atualizado.
5. No GitHub, abra a pasta `js`, clique em **Add file → Upload files**, envie o `dados.js` baixado e clique em **Commit changes**. Agora todo mundo vê.
6. Depois de publicar, use **↩️ Restaurar original** no seu aparelho para voltar a ler o arquivo do site.

### Pontos da tabela

- **Vitória = 3 pontos · Empate = 1 ponto · Derrota = 0 pontos.** Os pontos são calculados sozinhos.
- Ordem da tabela: mais pontos → mais vitórias → maior diferença entre kills e mortes → mais kills.

### Formato do mata-mata (X1 / 2x2 / 3x3)

- Na página do chaveamento, escolha **X1**, **2x2** ou **3x3** no topo.
- O formato aparece em cada fase, e ao tocar num confronto aparece a escalação com o número certo de jogadores (os primeiros nicks de cada time).
- Fica salvo no seu aparelho e vai junto no **⬇️ Baixar dados.js** (campo `formato`).

### Mata-mata automático (top 14)

- O chaveamento é montado **sozinho** com os **14 primeiros da tabela**. Se a tabela mudar, o chaveamento muda junto.
- Como 14 não fecha um chaveamento de 16, o **1º e o 2º ganham folga** e entram direto nas quartas.
- Os confrontos seguem a ordem clássica: 3º x 14º, 4º x 13º, 5º x 12º, 6º x 11º, 7º x 10º e 8º x 9º.
- **Lançar placar:** na página do chaveamento, toque no confronto, digite o placar e clique em **💾 Salvar placar**. O vencedor avança sozinho.
  O placar também fica só no seu aparelho até você usar **⬇️ Baixar dados.js** (o arquivo baixado leva times **e** placares).
- **Quantidade de times no mata-mata:** na página do chaveamento, use **− / +**, digite o número ou toque nos atalhos (4, 8, 16, Todos).
  A tabela mostra a linha de corte no lugar certo. Se o número não fechar 4, 8, 16..., os melhores colocados ganham folga.
  Fica salvo no seu aparelho e vai junto no **⬇️ Baixar dados.js** (campo `classificados`).

### Mover times à mão (arrastar e soltar)

- Na página do chaveamento, **segure o botão esquerdo em cima de um time e arraste**.
  - Soltou em cima de outro time da mesma fase → os dois **trocam de lugar**.
  - Soltou numa vaga "A definir", "Folga" ou em outra fase → o time **vai para essa vaga**.
- **↩️ Desfazer último** desfaz a última mudança. **🔄 Voltar ao automático** volta para o top 14 normal.
- As mudanças ficam no seu aparelho e vão junto no **⬇️ Baixar dados.js** (campo `movimentos`).

### Editando o arquivo direto

Abra `js/dados.js`:

- **Tabela:** mude os números `v`, `e`, `d`, `kills` e `mortes` de cada time. A ordem da tabela é calculada sozinha.
  Em `jogadores`, coloque os nicks do trio (aparecem no cartão do time).
- **Placares do mata-mata:** em `resultados`, adicione uma linha por jogo:
  `{ times: ["id_do_time_1", "id_do_time_2"], placar: [3, 1] }` (o placar fica na mesma ordem dos times).

## Como publicar no GitHub (sem instalar nada)

1. Entre em [github.com](https://github.com) e faça login.
2. Clique em **New** (novo repositório), dê o nome `anteiku-campeonato`, deixe **Public** e clique em **Create repository**.
3. Na página do repositório, clique em **uploading an existing file**.
4. Arraste **todo o conteúdo** desta pasta (os arquivos `.html`, o `README.md` e as pastas `css` e `js`) e clique em **Commit changes**.
5. Vá em **Settings → Pages**. Em **Branch**, escolha `main` e a pasta `/ (root)`, e clique em **Save**.
6. Espere 1 ou 2 minutos e atualize a página: vai aparecer o link do site, algo como
   `https://SEU-USUARIO.github.io/anteiku-campeonato/`.

Para atualizar depois: abra `js/dados.js` no GitHub, clique no lápis ✏️, edite e clique em **Commit changes**. O site atualiza em cerca de 1 minuto.
