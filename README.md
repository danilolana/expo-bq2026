# Desafio BQ — Expô Bentinho 2026

Quiz responsivo em React + TypeScript com identidade visual do Colégio Técnico Bento Quirino. Cada rodada possui cinco perguntas e sempre inclui ao menos uma de informática. As 70 perguntas são usadas sem repetição antes de um novo ciclo.

## Executar

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Validação completa:

```bash
npm test
npm run build
```

## Estrutura

```text
public/assets/              logos, brasão, assinatura e mascote
src/
  data/questions.ts        banco e validação das 70 perguntas
  utils/quizEngine.ts      sorteio, reserva por categoria e persistência
  App.tsx                  estados e fluxo da experiência
  styles.css               identidade visual, animações e responsividade
  *.test.ts(x)             testes do banco, motor e interface
```

## Regras implementadas

- Banco validado em tempo de execução: 70 itens, IDs únicos, quatro alternativas e índice de resposta válido.
- Distribuição fixa: 25 perguntas de informática e 45 de conhecimentos gerais.
- Cinco perguntas por rodada, com ao menos uma de informática.
- Sorteio aleatório sem repetição durante um ciclo de 14 rodadas.
- Reserva dinâmica de perguntas de informática: o sorteio atual não pode consumir as perguntas necessárias às rodadas futuras.
- Histórico persistido em `localStorage` com a chave `desafio-bq:used-question-ids:v1`; dados inválidos são descartados com segurança.
- Se o armazenamento estiver bloqueado, o quiz continua funcionando durante a sessão.

## Editar ou integrar perguntas

Cada item em `src/data/questions.ts` segue o contrato `Question`:

```ts
{
  id: 'tech-26',
  category: 'informatica',
  prompt: 'Texto da pergunta',
  options: ['A', 'B', 'C', 'D'],
  correctAnswer: 0,
  hint: 'Uma pista curta.',
}
```

Ao alterar a quantidade total ou a proporção, atualize também `validateQuestionBank`. Para consumir uma API real no futuro, transforme os dados recebidos nesse contrato, valide antes de chamar `createQuizRound` e mostre uma mensagem de erro quando a carga falhar. Nenhuma API externa é necessária na versão atual.

## Animações e acessibilidade

O feedback de resposta dura 650 ms e usa apenas transformações, cor e opacidade. `prefers-reduced-motion` reduz todas as animações. Alternativas usam botões nativos, foco visível e mensagens de resultado com `aria-live`/`role="status"`. O layout da dica passa de coluna lateral para faixa superior em telas menores que 760 px.

O minigame aceita toque, clique e teclado. O `canvas` recebe foco visível no modo clássico, os controles mantêm alvo mínimo de 44 px e uma orientação curta aparece em celulares no modo retrato. As páginas também respeitam safe areas e usam `100dvh` com fallback para `100vh`, evitando cortes causados pelas barras móveis do navegador.

## Responsividade

### Premissas e decisões

- SPA executada em navegadores modernos, sem framework CSS e sem backend.
- Layout fluido com Grid/Flexbox; o breakpoint principal de 760 px transforma colunas em fluxo vertical.
- Breakpoints complementares em 410/420 px tratam celulares compactos; 900/1050 px ajustam tablets; uma media query por altura trata celulares em paisagem.
- Conteúdo continua rolável verticalmente. Somente o excesso horizontal decorativo é recortado.
- O mascote é servido em WebP (cerca de 193 KiB) com fallback PNG (cerca de 1,9 MiB), reduzindo o download nos navegadores compatíveis sem perder compatibilidade.
- A troca de etapa reposiciona o documento no topo para não herdar o scroll da tela anterior.

### Validação manual recomendada

Use o modo responsivo do navegador e percorra o fluxo completo em, no mínimo:

1. `360 × 800` — celular em retrato: textos sem corte, botões com 44 px, quiz em uma coluna e aviso de orientação no minigame.
2. `844 × 390` — celular em paisagem: cabeçalho e hero compactos, câmera/minigame visíveis sem overflow horizontal.
3. `768 × 1024` — tablet: transição coerente entre as colunas e o fluxo móvel.
4. `1440 × 900` — desktop: largura máxima, alinhamentos e proporção 16:9 do minigame preservados.

Em cada viewport, valide: navegação por `Tab`, ativação por `Enter`/`Espaço`, toque nas alternativas, fallback da câmera, zoom do navegador em 200%, ausência de rolagem horizontal e rotação retrato/paisagem. Repita o smoke test nas versões atuais de Chrome, Edge e Firefox; em Safari/iOS, confirme safe areas e permissão de câmera. A câmera exige `localhost` ou HTTPS.

Para desempenho móvel, execute Lighthouse com simulação de rede/CPU e confirme que o WebP é selecionado na aba Network. Os logos têm dimensões intrínsecas declaradas para reduzir mudança de layout durante o carregamento.

As cores e durações ficam em `src/styles.css`; altere primeiro os tokens em `:root`. Os assets mantêm os arquivos oficiais fornecidos e são servidos diretamente por Vite.

## Limitações e premissas

- O histórico é local ao navegador e ao dispositivo; limpar os dados do site reinicia o ciclo.
- Não há autenticação, placar remoto ou backend, pois não foram definidos no escopo.
- O mascote fornecido é PNG; o enquadramento é feito por CSS para preservar o arquivo original.
