export type StatusPost = "Pendente" | "Gerado" | "Postado";

export interface PostCard {
  id: string;
  data: string; // YYYY-MM-DD
  canal: string; // ex: "Brasil" ou "Internacional"
  titulo: string;
  tema: string;
  promptMoneyPrinter: string;
  keywordsMidia: string;
  roteiroManual: string;
  descricaoYoutube: string;
  hashtags: string[];
  status: StatusPost;
  criadoEm?: string;
}
