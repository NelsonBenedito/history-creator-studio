import { PostCard } from "./types";

const BASE = "/api";

export interface GerarCronogramaInput {
  canal: string;
  idioma: string;
  quantidadeDias: number;
  dataInicio: string;
  foco: string;
  observacoes?: string;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}

export async function buscarCronograma(): Promise<PostCard[]> {
  const res = await fetch(`${BASE}/cronograma`);
  return handle<PostCard[]>(res);
}

export async function salvarCronogramaRemoto(cards: PostCard[]): Promise<PostCard[]> {
  const res = await fetch(`${BASE}/cronograma`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cards),
  });
  return handle<PostCard[]>(res);
}

export async function gerarCronograma(input: GerarCronogramaInput): Promise<PostCard[]> {
  const res = await fetch(`${BASE}/gerar-cronograma`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle<PostCard[]>(res);
}
