from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "desafio-bq-documentacao-tecnica.pdf"

BLUE = colors.HexColor("#07518B")
DEEP = colors.HexColor("#062D4D")
INK = colors.HexColor("#071D2F")
GREEN = colors.HexColor("#79AD34")
SIGNAL = colors.HexColor("#A7D953")
PAPER = colors.HexColor("#F4F7F8")
LINE = colors.HexColor("#CBD9DF")
MUTED = colors.HexColor("#536B78")
CORAL = colors.HexColor("#D75D4A")
CODE = colors.HexColor("#0A2438")
WHITE = colors.white


def register_fonts() -> tuple[str, str]:
    regular = Path("C:/Windows/Fonts/segoeui.ttf")
    bold = Path("C:/Windows/Fonts/segoeuib.ttf")
    if regular.exists() and bold.exists():
        pdfmetrics.registerFont(TTFont("DocSans", str(regular)))
        pdfmetrics.registerFont(TTFont("DocSansBold", str(bold)))
        return "DocSans", "DocSansBold"
    return "Helvetica", "Helvetica-Bold"


FONT, FONT_BOLD = register_fonts()
PAGE_W, PAGE_H = A4
MARGIN_X = 18 * mm
CONTENT_W = PAGE_W - 2 * MARGIN_X


styles = getSampleStyleSheet()
BODY = ParagraphStyle(
    "Body",
    fontName=FONT,
    fontSize=9.2,
    leading=13.4,
    textColor=INK,
    spaceAfter=7,
)
SMALL = ParagraphStyle(
    "Small",
    parent=BODY,
    fontSize=7.7,
    leading=10.5,
    textColor=MUTED,
)
H1 = ParagraphStyle(
    "H1",
    fontName=FONT_BOLD,
    fontSize=28,
    leading=29,
    textColor=DEEP,
    spaceAfter=12,
)
H2 = ParagraphStyle(
    "H2",
    fontName=FONT_BOLD,
    fontSize=20,
    leading=23,
    textColor=DEEP,
    spaceBefore=5,
    spaceAfter=12,
)
H3 = ParagraphStyle(
    "H3",
    fontName=FONT_BOLD,
    fontSize=11.5,
    leading=14,
    textColor=DEEP,
    spaceBefore=5,
    spaceAfter=5,
)
EYEBROW = ParagraphStyle(
    "Eyebrow",
    fontName=FONT_BOLD,
    fontSize=7.6,
    leading=10,
    textColor=GREEN,
    tracking=1.5,
    spaceAfter=6,
)
COVER_EYEBROW = ParagraphStyle(
    "CoverEyebrow",
    parent=EYEBROW,
    textColor=SIGNAL,
    fontSize=8.4,
    leading=11,
)
COVER_TITLE = ParagraphStyle(
    "CoverTitle",
    fontName=FONT_BOLD,
    fontSize=47,
    leading=46,
    textColor=WHITE,
    spaceAfter=16,
)
COVER_LEAD = ParagraphStyle(
    "CoverLead",
    fontName=FONT,
    fontSize=13,
    leading=19,
    textColor=colors.HexColor("#D9E7ED"),
    spaceAfter=12,
)
CODE_STYLE = ParagraphStyle(
    "Code",
    fontName="Courier",
    fontSize=7.1,
    leading=10.2,
    textColor=colors.HexColor("#E2EDF1"),
    leftIndent=10,
    rightIndent=10,
    spaceBefore=4,
    spaceAfter=9,
)
TABLE_HEAD = ParagraphStyle(
    "TableHead",
    fontName=FONT_BOLD,
    fontSize=7.8,
    leading=10,
    textColor=WHITE,
)
TABLE_CELL = ParagraphStyle(
    "TableCell",
    fontName=FONT,
    fontSize=7.5,
    leading=10.2,
    textColor=INK,
)
TABLE_CELL_BOLD = ParagraphStyle(
    "TableCellBold",
    parent=TABLE_CELL,
    fontName=FONT_BOLD,
    textColor=DEEP,
)


def para(text: str, style: ParagraphStyle = BODY) -> Paragraph:
    return Paragraph(text, style)


def code_block(text: str) -> Table:
    pre = Preformatted(text.strip("\n"), CODE_STYLE)
    table = Table([[pre]], colWidths=[CONTENT_W])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CODE),
        ("BOX", (0, 0), (-1, -1), 0.6, CODE),
        ("LINEBEFORE", (0, 0), (0, -1), 4, SIGNAL),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def note(text: str, warning: bool = False) -> Table:
    accent = CORAL if warning else BLUE
    table = Table([[para(text, BODY)]], colWidths=[CONTENT_W])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("LINEBEFORE", (0, 0), (0, -1), 4, accent),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def bullet_list(items: list[str]) -> list[Flowable]:
    result: list[Flowable] = []
    for item in items:
        result.append(Paragraph(f"<font color='#79AD34'><b>-</b></font> {item}", ParagraphStyle(
            "BulletLine",
            parent=BODY,
            leftIndent=10,
            firstLineIndent=-8,
            spaceAfter=4,
        )))
    return result


def section_header(code: str, title: str) -> list[Flowable]:
    return [
        Spacer(1, 2 * mm),
        para(code, EYEBROW),
        para(title, H2),
    ]


def metric_table() -> Table:
    data = []
    for number, label in [("09", "estados de tela"), ("70", "perguntas validadas"), ("30s", "minigame")]:
        data.append([
            para(number, ParagraphStyle("MetricNumber", fontName=FONT_BOLD, fontSize=23, leading=25, textColor=BLUE)),
            para(label, SMALL),
        ])
    cells = [Table([[a], [b]], colWidths=[CONTENT_W / 3 - 6]) for a, b in data]
    table = Table([cells], colWidths=[CONTENT_W / 3] * 3)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return table


def standard_table(headers: list[str], rows: list[list[str]], widths: list[float]) -> Table:
    data: list[list[Paragraph]] = [[para(escape(value), TABLE_HEAD) for value in headers]]
    for row in rows:
        data.append([
            para(escape(value), TABLE_CELL_BOLD if index == 0 else TABLE_CELL)
            for index, value in enumerate(row)
        ])
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DEEP),
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return table


class CircuitFlow(Flowable):
    def __init__(self, steps: list[tuple[str, str, str]]):
        super().__init__()
        self.steps = steps
        self.width = CONTENT_W
        self.height = 228

    def draw(self) -> None:
        canvas = self.canv
        canvas.saveState()
        canvas.setFillColor(DEEP)
        canvas.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        x = 34
        top = self.height - 28
        gap = 25.5
        canvas.setStrokeColor(SIGNAL)
        canvas.setLineWidth(2.2)
        canvas.line(x, top, x, top - gap * (len(self.steps) - 1))
        for index, (name, description, state) in enumerate(self.steps, start=1):
            y = top - (index - 1) * gap
            canvas.setFillColor(DEEP)
            canvas.setStrokeColor(SIGNAL)
            canvas.circle(x, y, 9, fill=1, stroke=1)
            canvas.setFont(FONT_BOLD, 6.5)
            canvas.setFillColor(SIGNAL)
            canvas.drawCentredString(x, y - 2.4, f"{index:02d}")
            canvas.setFont(FONT_BOLD, 8.6)
            canvas.setFillColor(WHITE)
            canvas.drawString(x + 18, y + 1, name)
            canvas.setFont(FONT, 7.1)
            canvas.setFillColor(colors.HexColor("#BAD0DA"))
            canvas.drawString(x + 18, y - 8, description)
            canvas.setFont("Courier", 6.4)
            canvas.setFillColor(SIGNAL)
            canvas.drawRightString(self.width - 16, y - 2, state)
        canvas.restoreState()


def cover_page(canvas, doc) -> None:
    canvas.saveState()
    canvas.setFillColor(DEEP)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setStrokeColor(colors.Color(1, 1, 1, alpha=.06))
    canvas.setLineWidth(.4)
    for x in range(0, int(PAGE_W), 36):
        canvas.line(x, 0, x, PAGE_H)
    canvas.setFillColor(SIGNAL)
    canvas.rect(MARGIN_X, 22 * mm, 45 * mm, 2.5 * mm, fill=1, stroke=0)
    canvas.setFont("Courier", 7.5)
    canvas.setFillColor(colors.HexColor("#BAD0DA"))
    canvas.drawRightString(PAGE_W - MARGIN_X, 24 * mm, "REF / BQ / DEV / 2026")
    canvas.restoreState()


def body_page(canvas, doc) -> None:
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.line(MARGIN_X, PAGE_H - 14 * mm, PAGE_W - MARGIN_X, PAGE_H - 14 * mm)
    canvas.setFont(FONT_BOLD, 7.2)
    canvas.setFillColor(BLUE)
    canvas.drawString(MARGIN_X, PAGE_H - 10 * mm, "DESAFIO BQ  /  MANUAL TÉCNICO")
    canvas.setFont(FONT, 7.2)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 10 * mm, "EXPO BENTINHO 2026")
    canvas.setStrokeColor(LINE)
    canvas.line(MARGIN_X, 13 * mm, PAGE_W - MARGIN_X, 13 * mm)
    canvas.setFont(FONT, 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN_X, 8 * mm, "Base auditada em 31/08/2026")
    canvas.drawRightString(PAGE_W - MARGIN_X, 8 * mm, f"{doc.page:02d}")
    canvas.restoreState()


def build_story() -> list[Flowable]:
    story: list[Flowable] = []

    story += [
        Spacer(1, 34 * mm),
        para("EXPÔ BENTINHO 2026  /  REFERÊNCIA DE ENGENHARIA", COVER_EYEBROW),
        para("Manual técnico<br/><font color='#A7D953'>Desafio BQ</font>", COVER_TITLE),
        para("Arquitetura, mecânicas, execução local, exemplos e critérios verificáveis para implementar, revisar e manter a experiência.", COVER_LEAD),
        Spacer(1, 22 * mm),
        Table([
            [para("BASE AUDITADA", COVER_EYEBROW), para("31 AGO 2026", ParagraphStyle("CoverMeta", parent=COVER_EYEBROW, alignment=TA_RIGHT))],
            [para("Aplicação web de página única, sem backend.", ParagraphStyle("CoverBody", parent=BODY, textColor=WHITE)), para("15 TESTES + BUILD", ParagraphStyle("CoverStatus", parent=EYEBROW, textColor=SIGNAL, alignment=TA_RIGHT))],
        ], colWidths=[CONTENT_W * .62, CONTENT_W * .38], style=TableStyle([
            ("BOX", (0, 0), (-1, -1), .7, colors.Color(1, 1, 1, alpha=.25)),
            ("LINEABOVE", (0, 0), (-1, 0), 4, SIGNAL),
            ("BACKGROUND", (0, 0), (-1, -1), colors.Color(0, 0, 0, alpha=.14)),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ])),
        PageBreak(),
    ]

    story += section_header("SYS.01", "Visão técnica")
    story += [
        para("<b>Desafio BQ</b> é uma SPA para a Expô Bentinho 2026. A experiência combina um minigame em Canvas, controlado por clique, toque, teclado ou movimento facial, e um quiz de cinco perguntas com dicas conquistadas no jogo."),
        para("Todo o estado vive no navegador. Não há roteador, API própria, autenticação, banco de dados ou placar remoto. <font name='Courier'>App.tsx</font> funciona como máquina de estados e troca as telas por renderização condicional."),
        Spacer(1, 3 * mm),
        metric_table(),
        Spacer(1, 5 * mm),
        note("<b>Responsabilidade central.</b> <font name='Courier'>App.tsx</font> coordena progressão, pontuação, dicas, timers e ciclo do rastreador. Regras puras ficam nos motores de quiz, colisão, dificuldade e calibração."),
        Spacer(1, 5 * mm),
        para("Linguagens e plataforma", H3),
        para("TypeScript estrito modela contratos e lógica; TSX descreve as telas React; CSS nativo implementa identidade, layout e responsividade; Canvas 2D desenha o minigame; HTML5 fornece o shell e as APIs de mídia."),
        PageBreak(),
    ]

    story += section_header("SYS.02", "Stack e dependências")
    story += [
        para("Versões resolvidas no lockfile e instaladas durante a auditoria. Como o <font name='Courier'>package.json</font> usa <font name='Courier'>latest</font> na maioria dos pacotes, <font name='Courier'>npm ci</font> é o comando reproduzível."),
        standard_table(
            ["Tecnologia", "Versao", "Papel"],
            [
                ["TypeScript", "7.0.2", "Tipagem estrita e contratos dos motores."],
                ["React / React DOM", "19.2.8", "Componentes, estado e efeitos das telas."],
                ["Vite", "8.2.2", "Servidor, transformação e bundle."],
                ["MediaPipe Tasks Vision", "1.0.1", "Face Landmarker para a coordenada do nariz."],
                ["Vitest", "4.1.11", "Testes unitários e integrados em JSDOM."],
                ["Testing Library", "16.3.3", "Interações e asserções orientadas ao usuário."],
                ["Canvas 2D / CSS", "Nativo", "Jogo, layout, animação e responsividade."],
            ],
            [39 * mm, 30 * mm, CONTENT_W - 69 * mm],
        ),
        Spacer(1, 5 * mm),
        note("<b>Dependência de rede no modo câmera.</b> O WASM é baixado de <font name='Courier'>cdn.jsdelivr.net</font> e o modelo de <font name='Courier'>storage.googleapis.com</font>. Quiz e modo clássico não precisam desses arquivos.", warning=True),
        Spacer(1, 5 * mm),
        para("Requisitos", H3),
        *bullet_list([
            "Node.js 20.19 ou superior dentro da faixa aceita pelo Vite 8; uma versão LTS compatível é preferível.",
            "Navegador moderno com ES2022, módulos, Canvas 2D e requestAnimationFrame.",
            "Para câmera: getUserMedia, localhost ou HTTPS, permissão do usuário e acesso às duas origens externas.",
        ]),
        PageBreak(),
    ]

    story += section_header("SYS.03", "Fluxo da experiência")
    story += [
        para("A sequência é linear, com uma bifurcação de controle antes do minigame e fallbacks para o modo clássico. Cada troca de tela reposiciona o documento no topo."),
        Spacer(1, 4 * mm),
        CircuitFlow([
            ("Preloader", "Espera fixa de 1.050 ms.", "loading"),
            ("Introdução", "Apresenta regras e inicia a etapa bônus.", "intro"),
            ("Escolha do controle", "Câmera ou clique, toque e teclado.", "game-intro"),
            ("Configuração e calibração", "Somente no caminho da câmera.", "camera-setup > calibration"),
            ("Minigame", "Até 30 s, 3 dicas ou 3 impactos.", "minigame"),
            ("Saldo de dicas", "Confirma pistas que seguem ao quiz.", "minigame-result"),
            ("Quiz", "Cinco perguntas; feedback de 650 ms.", "quiz"),
            ("Resultado", "Acertos, percentual e nova rodada.", "result"),
        ]),
        Spacer(1, 5 * mm),
        note("Se um estado inválido impedir a renderização esperada, o fallback final de <font name='Courier'>App</font> volta à introdução com a mensagem para reiniciar a experiência."),
        PageBreak(),
    ]

    story += section_header("ENG.01", "Mecânicas - minigame e controles")
    story += [
        para("Loop do jogo", H3),
        para("<font name='Courier'>GameEngine</font> executa com <font name='Courier'>requestAnimationFrame</font>. O delta é limitado a 50 ms para evitar saltos grandes. O canvas lógico mede 960 x 540; o CSS adapta a exibição."),
        *bullet_list([
            "A dificuldade sobe aos 10 s e 20 s: velocidade aumenta, abertura e intervalo de spawn diminuem.",
            "Obstáculos, coletáveis e partículas que saem da tela são removidos.",
            "A rodada termina por tempo, ao coletar 3 dicas ou no 3º impacto.",
            "Cada impacto concede 1,05 s de invulnerabilidade e feedback visual.",
        ]),
        para("Controle clássico", H3),
        para("Aplica gravidade de 980 px/s² e impulso de -305 em <font name='Courier'>pointerdown</font> ou Espaço. A queda é limitada a 520 e as bordas amortecem a velocidade."),
        para("Controle facial", H3),
        para("Solicita câmera frontal 640 x 480, tenta GPU e recua para CPU. A leitura ocorre a cada 40 ms e usa o landmark 1, coordenada vertical do nariz."),
        *bullet_list([
            "Calibração: mínimo de 12 leituras, cerca de 1,7 s e variação máxima de 0,018.",
            "Zona morta de 0,012; deslocamento normalizado em mais ou menos 0,16.",
            "Alvo vertical entre 58 e 482 px, com suavização exponencial.",
            "Sem rosto detectado, o último alvo válido é mantido.",
        ]),
        para("Colisão e coleta", H3),
        para("Obstáculos usam interseção entre retângulos; dicas circulares usam o ponto do retângulo mais próximo do círculo. A hitbox é menor que o desenho do pássaro."),
        note("<b>Inconsistência conhecida.</b> A introdução afirma que colisões não encerram o jogo, mas o motor termina no terceiro impacto e o teste automatizado confirma a regra.", warning=True),
        PageBreak(),
    ]

    story += section_header("ENG.02", "Mecânicas - quiz, dicas e persistência")
    story += [
        para("Sorteio sem repetição", H3),
        para("<font name='Courier'>createQuizRound</font> filtra IDs inválidos, remove perguntas usadas e garante cinco itens com ao menos uma pergunta de informática. Uma reserva dinâmica impede consumir perguntas técnicas necessárias para rodadas futuras. O ciclo reinicia depois de 70 perguntas."),
        para("Banco validado", H3),
        para("Ao importar <font name='Courier'>questions.ts</font>, a aplicação exige exatamente 70 itens, 25 de informática, 45 gerais, IDs únicos, quatro alternativas e índice de resposta válido."),
        para("Dicas", H3),
        para("Cada coletável vira uma dica. Ela só pode ser gasta antes da resposta e uma vez por pergunta. A pista é ocultada ao avançar, mas o saldo é preservado."),
        para("Resposta e pontuação", H3),
        para("O primeiro clique bloqueia alternativas, incrementa o placar quando correto e revela a opção válida. Em 650 ms avança ou abre o resultado. O percentual é <font name='Courier'>Math.round(score / 5 * 100)</font>."),
        para("Persistência", H3),
        para("A chave <font name='Courier'>desafio-bq:used-question-ids:v1</font> guarda apenas IDs usados. JSON inválido ou armazenamento bloqueado resulta em lista vazia; o jogo continua na sessão."),
        PageBreak(),
    ]

    story += section_header("ARC.01", "Estrutura de pastas")
    story += [
        code_block("""
expo-bentinho2026/
|- public/assets/             logos, brasão, assinatura e mascote
|- src/
|  |- App.tsx                estados e transições
|  |- experience.types.ts    telas e modos de controle
|  |- types.ts               contrato Question
|  |- styles.css             tokens, layout e responsividade
|  |- components/            Button, BrandHeader, HintCounter
|  |- data/questions.ts      70 perguntas e validação
|  |- utils/quizEngine.ts    sorteio, reserva e localStorage
|  |- features/
|  |  |- faceTracking/       câmera, calibração e suavização
|  |  `- minigame/           motor, colisão, dificuldade, controles
|  |- pages/                 nove telas
|  `- test/                  setup do jest-dom
|- index.html                shell do Vite
|- vite.config.ts            React e Vitest/JSDOM
|- tsconfig*.json            TypeScript estrito e ES2022
|- package.json              scripts e dependencias
`- package-lock.json         resolucao reproduzivel
        """),
        para("Os testes ficam ao lado das unidades: <font name='Courier'>App.test.tsx</font>, <font name='Courier'>questions.test.ts</font>, <font name='Courier'>quizEngine.test.ts</font> e <font name='Courier'>gameEngine.test.ts</font>.", SMALL),
        Spacer(1, 5 * mm),
        para("Limites arquiteturais", H3),
        *bullet_list([
            "Não há roteador: atualizar a página reinicia a tela atual, embora preserve o ciclo de perguntas.",
            "Não há backend: placar e progresso não são fonte confiável para prêmios ou ranking.",
            "O estado de tela centralizado simplifica o fluxo atual, mas pode crescer demais se novas jornadas forem adicionadas.",
        ]),
        PageBreak(),
    ]

    story += section_header("OPS.01", "Execução local")
    story += [
        para("1. Verifique o ambiente", H3),
        code_block("node --version\nnpm --version"),
        para("Use Node 20.19 ou superior dentro da faixa suportada pelo Vite 8."),
        para("2. Reproduza o lockfile", H3),
        code_block("npm ci"),
        para("Use <font name='Courier'>npm install</font> apenas quando a intenção for atualizar dependências e o lockfile."),
        para("3. Inicie", H3),
        code_block("npm run dev"),
        para("Abra a URL indicada pelo Vite, normalmente <font name='Courier'>http://localhost:5173</font>. Câmera exige localhost ou HTTPS."),
        para("4. Valide", H3),
        code_block("npm test\nnpm run build"),
        para("Opcionalmente, <font name='Courier'>npm run dev -- --host 0.0.0.0</font> expõe o servidor à rede local. Não use o servidor de desenvolvimento em produção."),
        PageBreak(),
    ]

    story += section_header("DEV.01", "Exemplos de código")
    story += [
        para("Adicionar uma pergunta", H3),
        code_block("""
{
  id: 'tech-26',             // Deve ser único.
  category: 'informatica',   // 'informatica' ou 'geral'.
  prompt: 'Texto da pergunta',
  options: ['A', 'B', 'C', 'D'], // Exatamente quatro.
  correctAnswer: 0,          // Índice entre 0 e 3.
  hint: 'Uma pista curta.',
}
        """),
        para("A validação exige 70 itens na proporção 25/45. Ao adicionar um item, remova ou reclassifique outro, ou atualize validação, motor e testes."),
        para("Criar rodada com falha segura", H3),
        code_block("""
try {
  const usedIds = loadUsedQuestionIds()
  const nextRound = createQuizRound(questionBank, usedIds)
  saveUsedQuestionIds(nextRound.usedIds)
  setRound(nextRound.questions)
} catch (error) {
  console.error(error) // Diagnóstico técnico.
  setError('Não foi possível preparar a rodada.')
}
        """),
        para("Ao integrar uma API, transforme a resposta em <font name='Courier'>Question[]</font>, valide formato e contagens, trate timeout e status HTTP, e mantenha uma mensagem de recuperação."),
        PageBreak(),
    ]

    story += section_header("DEV.02", "Ciclo de vida e testes")
    story += [
        para("Liberar câmera e listeners", H3),
        code_block("""
useEffect(() => () => {
  window.clearTimeout(transitionTimer.current)
  trackerRef.current?.stop()
}, [])
        """),
        para("<font name='Courier'>FaceTracker.stop()</font> para tracks, limpa timer e assinaturas, desconecta vídeos e fecha o landmarker."),
        para("Sorteio determinístico", H3),
        code_block("""
const round = createQuizRound(
  questions,
  previouslyUsedIds,
  seededRandom(123456), // Mesma sequência em toda execução.
)

expect(round.questions).toHaveLength(5)
expect(round.questions.some(q => q.category === 'informatica')).toBe(true)
        """),
        para("A fonte aleatória injetável permite comprovar regras do sorteio sem testes instáveis."),
        PageBreak(),
    ]

    story += section_header("QA.01", "Qualidade e verificação")
    story += [
        standard_table(
            ["Verificacao", "Resultado", "Escopo"],
            [
                ["Vitest", "15 aprovados", "4 arquivos; banco, motores e interface."],
                ["TypeScript", "Aprovado", "Compilação estrita via tsc -b."],
                ["Vite build", "Aprovado", "42 módulos transformados; bundle gerado."],
            ],
            [38 * mm, 32 * mm, CONTENT_W - 70 * mm],
        ),
        Spacer(1, 5 * mm),
        para("Cobertura funcional existente", H3),
        *bullet_list([
            "Contagem, categorias, IDs e respostas do banco.",
            "14 rodadas sem repetição, reserva técnica e reinício de ciclo.",
            "Duração, limite de dicas e encerramento no terceiro impacto.",
            "Calibração e limites do mapeamento facial.",
            "Preloader, modo clássico, fallback, consumo de dicas e fim do quiz.",
        ]),
        para("Smoke test manual recomendado", H3),
        *bullet_list([
            "Percorra o fluxo em 360 x 800, 844 x 390, 768 x 1024 e 1440 x 900.",
            "Teste Tab, Enter, Espaço, toque e clique; confirme foco e ausência de overflow horizontal.",
            "Negue e autorize a câmera; valide fallback e processamento facial.",
            "Teste zoom 200%, movimento reduzido, retrato, paisagem e safe areas.",
            "Corrompa a chave local; o quiz deve continuar. Bloqueie as CDNs; o clássico deve funcionar.",
        ]),
        PageBreak(),
    ]

    story += section_header("SEC.01", "Erros, privacidade e segurança")
    security_rows = [
        ["Câmera", "Quadros processados no dispositivo; sem armazenamento pelo código. Tracks encerrados ao sair."],
        ["Fallback", "Mensagens para permissão, ausência, câmera ocupada, navegador e modelo; modo clássico disponível."],
        ["Armazenamento", "Somente IDs de perguntas; leitura e escrita protegidas por try/catch."],
        ["Fornecimento", "WASM e modelo externos exigem CSP, monitoramento e avaliação de hospedagem local."],
        ["Confiança", "Placar no cliente é manipulável. Backend autoritativo é necessário para uso sensível."],
        ["Acessibilidade", "Botões nativos, aria-live, roles, foco e movimento reduzido; Canvas não tem equivalência completa."],
    ]
    story += [
        standard_table(["Tema", "Tratamento atual e implicacao"], security_rows, [38 * mm, CONTENT_W - 38 * mm]),
        Spacer(1, 6 * mm),
        note("<b>Recomendação de produção.</b> Defina Content-Security-Policy para scripts, WASM, modelo e mídia; publique em HTTPS; mantenha o fallback clássico; monitore falhas de inicialização sem registrar imagens ou landmarks identificáveis.", warning=True),
        PageBreak(),
    ]

    story += section_header("REF.01", "Premissas, limites e manutenção")
    story += [
        para("Premissas", H3),
        *bullet_list([
            "Navegador moderno e uma única face por sessão de controle.",
            "Iluminação, enquadramento, desempenho e permissão influenciam o modo câmera.",
            "A aplicação é uma experiência local, sem sincronização entre dispositivos.",
        ]),
        para("Limitacoes", H3),
        *bullet_list([
            "Limpar dados do site ou trocar de navegador reinicia o ciclo das perguntas.",
            "Não existem contas, ranking, analytics próprio, persistência ou validação remota.",
            "O preloader usa tempo fixo e não representa progresso real de carregamento.",
            "O texto sobre impactos diverge do comportamento do motor.",
        ]),
        para("Manutenção segura", H3),
        *bullet_list([
            "Prefira faixas explícitas em vez de latest para upgrades controlados.",
            "Ao mudar 70 itens ou a proporção 25/45, atualize validação, testes e documentação.",
            "Novos estados devem limpar timers, listeners, streams e motores ao sair.",
            "Toda nova mecânica precisa de teste puro no motor e teste de fluxo quando afetar a interface.",
        ]),
        Spacer(1, 5 * mm),
        note("<b>Critério de entrega.</b> TypeScript compila, os 15 testes continuam verdes, novos ramos recebem cobertura proporcional e o fluxo crítico passa no smoke test de desktop, mobile e fallback sem câmera."),
        Spacer(1, 12 * mm),
        para("Fim da referência", ParagraphStyle("End", parent=H1, alignment=TA_CENTER, textColor=BLUE)),
        para("Documento derivado do repositório local auditado em 31/08/2026.", ParagraphStyle("EndSmall", parent=SMALL, alignment=TA_CENTER)),
    ]
    return story


def main() -> None:
    frame = Frame(
        MARGIN_X,
        17 * mm,
        CONTENT_W,
        PAGE_H - 34 * mm,
        leftPadding=0,
        rightPadding=0,
        topPadding=2 * mm,
        bottomPadding=0,
    )
    cover_frame = Frame(
        MARGIN_X,
        18 * mm,
        CONTENT_W,
        PAGE_H - 36 * mm,
        leftPadding=0,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
    )
    doc = BaseDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        title="Manual tecnico - Desafio BQ",
        author="Projeto Desafio BQ",
        subject="Documentacao tecnica da aplicacao Expo Bentinho 2026",
        leftMargin=MARGIN_X,
        rightMargin=MARGIN_X,
        topMargin=17 * mm,
        bottomMargin=17 * mm,
    )
    doc.addPageTemplates([
        PageTemplate(id="Cover", frames=[cover_frame], onPage=cover_page, autoNextPageTemplate="Body"),
        PageTemplate(id="Body", frames=[frame], onPage=body_page),
    ])
    doc.build(build_story())
    print(OUTPUT)


if __name__ == "__main__":
    main()
