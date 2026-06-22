import { Type } from "@google/genai";

// Schema que força o Gemini a devolver exatamente os campos que o app precisa,
// já no formato pronto para virar cards no front-end e prompts para o MoneyPrinterTurbo.
export const cronogramaSchema = {
  type: Type.ARRAY,
  description: "Lista de posts do cronograma de conteúdo",
  items: {
    type: Type.OBJECT,
    properties: {
      data: {
        type: Type.STRING,
        description: "Data de postagem no formato YYYY-MM-DD",
      },
      canal: {
        type: Type.STRING,
        description: "Nome do canal (ex: Brasil ou Internacional)",
      },
      titulo: {
        type: Type.STRING,
        description: "Título sugerido para o vídeo/Short",
      },
      tema: {
        type: Type.STRING,
        description: "Resumo curto do tema/ângulo do vídeo",
      },
      promptMoneyPrinter: {
        type: Type.STRING,
        description:
          "Prompt completo e otimizado para colar no campo 'Video Subject' do MoneyPrinterTurbo",
      },
      keywordsMidia: {
        type: Type.STRING,
        description:
          "Palavras-chave em inglês separadas por vírgula, para busca de imagens/vídeos de banco (Pexels/Pixabay)",
      },
      roteiroManual: {
        type: Type.STRING,
        description:
          "Roteiro completo pronto para uso no modo de texto manual da ferramenta",
      },
      descricaoYoutube: {
        type: Type.STRING,
        description: "Descrição otimizada para a aba de descrição do YouTube",
      },
      hashtags: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Lista de 4 a 6 hashtags sem o caractere # incluso",
      },
    },
    required: [
      "data",
      "canal",
      "titulo",
      "tema",
      "promptMoneyPrinter",
      "keywordsMidia",
      "roteiroManual",
      "descricaoYoutube",
      "hashtags",
    ],
  },
};
