# History Creator AI Studio

App de organização de cronograma editorial para seus canais de história no YouTube, com geração de conteúdo via Gemini API (já no formato pronto para colar no MoneyPrinterTurbo).

## Estrutura

```
history-creator-studio/
├── server/     → Backend Express (conecta com a API do Gemini, guarda os dados em arquivo JSON)
└── client/     → Frontend React + Tailwind (interface com os cards)
```

## Modo rápido (Windows) — um clique

Se você está no Windows e já tem o [Node.js](https://nodejs.org) instalado, pode pular os passos manuais abaixo:

1. Dê duplo clique em **`iniciar.bat`** (na raiz do projeto).
2. Na primeira vez, ele vai:
   - Criar o `server\.env` automaticamente a partir do `.env.example`.
   - Pausar para você colar sua `GEMINI_API_KEY` nesse arquivo (abra com o Bloco de Notas, salve, feche, e aperte uma tecla no terminal para continuar).
   - Instalar as dependências do backend e do frontend (só acontece da primeira vez, demora alguns minutos).
3. Depois disso, ele sobe o backend, sobe o frontend, e abre o navegador automaticamente em `http://localhost:5173`.
4. Vão abrir **duas janelas pretas** (uma do backend, uma do frontend) — não feche elas enquanto estiver usando o app, é nelas que o servidor está rodando.
5. Para encerrar tudo de forma limpa, use o **`parar.bat`**, ou simplesmente feche as duas janelas pretas.

Nas próximas vezes, o `iniciar.bat` já pula a instalação de dependências e sobe tudo em segundos.

> Dica: se quiser, crie um atalho do `iniciar.bat` na Área de Trabalho (botão direito → "Criar atalho") para abrir o app como se fosse um programa normal.

## Modo manual (Windows, Mac ou Linux)

### 1. Configurar o backend

```bash
cd server
npm install
cp .env.example .env
```

Abra o `.env` e cole sua chave da API do Gemini (gere uma em https://aistudio.google.com/app/apikey):

```
GEMINI_API_KEY=sua_chave_aqui
PORT=3001
```

Suba o servidor:

```bash
npm run dev
```

Deve aparecer: `✅ Servidor rodando em http://localhost:3001`

### 2. Configurar o frontend

Em outro terminal:

```bash
cd client
npm install
npm run dev
```

Abra http://localhost:5173 no navegador. O Vite já está configurado para redirecionar chamadas `/api/*` para o backend na porta 3001 (veja `vite.config.ts`), então não precisa mexer em nada.

### 3. Como usar

1. No painel "Gerar novo cronograma via Gemini", preencha:
   - **Canal**: nome do seu canal (ex: "Brasil" ou "Internacional") — isso só serve para organizar/filtrar os cards.
   - **Idioma**: `pt-BR` ou `en-US`.
   - **Data início** e **Quantidade de dias**.
   - **Foco temático**: o assunto geral (ex: "história militar e Segunda Guerra" ou "Grécia Antiga e Roma").
   - **Observações**: qualquer instrução extra (ex: "evitar repetir temas dos últimos 10 dias").
2. Clique em **Gerar Cronograma**. O backend chama o Gemini, força a resposta em JSON estruturado, e os cards aparecem automaticamente.
3. Em cada card você pode copiar com um clique:
   - O **prompt para o MoneyPrinterTurbo**
   - As **keywords de mídia** (em inglês, para Pexels/Pixabay)
   - O **roteiro manual** completo
   - A **descrição + hashtags** prontas para o YouTube
4. Marque o status de cada vídeo como `Pendente`, `Gerado` ou `Postado` conforme avança na produção.
5. Os dados ficam salvos tanto no backend (`server/data/cronograma.json`) quanto no `localStorage` do navegador como rede de segurança — se o backend cair, você não perde o que já foi gerado.

## Segurança

- A chave do Gemini **nunca** fica no frontend — ela só existe no `server/.env`, que não deve ser commitado no Git (já está coberto por `.gitignore`).
- Se for publicar esse projeto, adicione autenticação no backend antes de deixá-lo acessível publicamente, já que qualquer pessoa com acesso ao endpoint `/api/gerar-cronograma` vai consumir sua cota da API.

## Próximos passos sugeridos

- Adicionar um banco de dados real (SQLite/Postgres) se o volume de cards crescer muito — arquivo JSON é ótimo para começar, mas não escala indefinidamente.
- Adicionar autenticação simples (ex: senha única) se for hospedar isso em um servidor acessível pela internet.
- Adicionar um botão "Exportar CSV" para levar o cronograma pra uma planilha, se quiser compartilhar com alguém.
