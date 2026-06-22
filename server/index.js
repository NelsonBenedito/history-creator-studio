import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { cronogramaSchema } from "./schema.js";
import { lerCronograma, salvarCronograma } from "./store.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3001;

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "⚠️  GEMINI_API_KEY não definida. Copie server/.env.example para server/.env e cole sua chave."
  );
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Health check simples
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Lista o cronograma salvo (persistência em arquivo)
app.get("/api/cronograma", async (_req, res) => {
  try {
    const cards = await lerCronograma();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Substitui o cronograma salvo inteiro (usado pelo front após editar status, deletar, etc.)
app.put("/api/cronograma", async (req, res) => {
  try {
    const cards = req.body;
    if (!Array.isArray(cards)) {
      return res.status(400).json({ error: "Corpo deve ser um array de cards" });
    }
    const salvo = await salvarCronograma(cards);
    res.json(salvo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gera um novo cronograma via Gemini e ANEXA ao existente
app.post("/api/gerar-cronograma", async (req, res) => {
  const {
    canal = "Brasil",
    idioma = "pt-BR",
    quantidadeDias = 7,
    dataInicio,
    foco = "história antiga, curiosidades e fatos pouco conhecidos",
    observacoes = "",
  } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error:
        "GEMINI_API_KEY não configurada no servidor. Configure o arquivo server/.env.",
    });
  }

  const inicio = dataInicio || new Date().toISOString().slice(0, 10);

  const prompt = `
Você é um analista de conteúdo sênior especializado em canais de história no YouTube Shorts.

Gere um cronograma editorial de ${quantidadeDias} dias consecutivos, começando em ${inicio}, para o canal "${canal}" (idioma de produção: ${idioma}), com foco em: ${foco}.
${observacoes ? `Observações adicionais do usuário: ${observacoes}` : ""}

Regras obrigatórias para cada item do cronograma:
- Um vídeo por dia, em formato Short (40 a 60 segundos de narração, ~130-140 palavras).
- Títulos curtos, com gatilho de curiosidade ou cenário hipotético ("E Se...", "A Verdade Sobre...", "Why...", "What Happened...").
- O roteiro deve ter gancho forte e chocante nos primeiros 3 segundos, ritmo acelerado, e terminar com um loop (a última frase conecta com a primeira) ou uma pergunta de engajamento.
- As keywords de mídia devem estar em inglês, mesmo que o roteiro esteja em português, pois alimentam bancos de imagem como Pexels/Pixabay.
- A descrição do YouTube deve ter 2-4 frases + uma chamada para se inscrever.
- Gere de 4 a 6 hashtags relevantes, sem o caractere #.

Responda SOMENTE com o JSON estruturado conforme o schema fornecido, sem texto adicional.
`.trim();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: cronogramaSchema,
      },
    });

    const novosCards = JSON.parse(response.text).map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      status: "Pendente",
      criadoEm: new Date().toISOString(),
    }));

    const existentes = await lerCronograma();
    const atualizado = [...existentes, ...novosCards];
    await salvarCronograma(atualizado);

    res.status(200).json(novosCards);
  } catch (error) {
    console.error("Erro ao gerar cronograma:", error);
    res.status(500).json({ error: error.message || "Erro desconhecido ao gerar cronograma" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
