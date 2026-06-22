import React, { useEffect, useMemo, useState } from "react";
import { Copy, Check, Loader2, Calendar, Sparkles, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { PostCard, StatusPost } from "./types";
import { buscarCronograma, salvarCronogramaRemoto, gerarCronograma } from "./api";

const LOCAL_KEY = "history_creator_cronograma";

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function CopyButton({ texto, label }: { texto: string; label: string }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // fallback silencioso
    }
  };

  return (
    <button
      onClick={copiar}
      className="w-full flex justify-between items-center bg-slate-900 hover:bg-slate-950 text-xs text-slate-300 p-2.5 rounded border border-slate-700 hover:border-amber-500/40 transition-colors"
    >
      <span>{label}</span>
      <span className="flex items-center gap-1 text-[10px] text-amber-400 uppercase font-bold">
        {copiado ? (
          <>
            <Check size={12} /> Copiado
          </>
        ) : (
          <>
            <Copy size={12} /> Copiar
          </>
        )}
      </span>
    </button>
  );
}

function CardItem({
  card,
  onMudarStatus,
  onExcluir,
}: {
  card: PostCard;
  onMudarStatus: (id: string, status: StatusPost) => void;
  onExcluir: (id: string) => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const corBorda =
    card.canal.toLowerCase().includes("bras") || card.canal.toLowerCase().includes("pt")
      ? "border-emerald-500/20"
      : "border-blue-500/20";
  const corBadge =
    card.canal.toLowerCase().includes("bras") || card.canal.toLowerCase().includes("pt")
      ? "bg-emerald-500/10 text-emerald-400"
      : "bg-blue-500/10 text-blue-400";

  return (
    <div className={`border rounded-xl p-5 bg-slate-800/50 backdrop-blur-sm ${corBorda}`}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded flex items-center gap-1">
          <Calendar size={12} /> {card.data}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${corBadge}`}>
            {card.canal}
          </span>
          <button
            onClick={() => onExcluir(card.id)}
            className="text-slate-500 hover:text-red-400 transition-colors"
            title="Excluir card"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-100 mb-1 leading-snug">{card.titulo}</h3>
      <p className="text-xs text-slate-400 mb-4 italic">Tema: {card.tema}</p>

      <div className="space-y-2 mb-3">
        <CopyButton texto={card.promptMoneyPrinter} label="📋 Prompt do MoneyPrinter" />
        <CopyButton texto={card.keywordsMidia} label="🖼️ Keywords de Mídia" />
        <CopyButton texto={card.roteiroManual} label="📝 Roteiro Manual" />
        <CopyButton
          texto={`${card.descricaoYoutube}\n\n${card.hashtags.map((h) => `#${h}`).join(" ")}`}
          label="📺 Descrição + Hashtags"
        />
      </div>

      <button
        onClick={() => setExpandido((v) => !v)}
        className="w-full flex justify-center items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 py-1"
      >
        {expandido ? (
          <>
            Ocultar conteúdo <ChevronUp size={12} />
          </>
        ) : (
          <>
            Ver conteúdo completo <ChevronDown size={12} />
          </>
        )}
      </button>

      {expandido && (
        <div className="mt-2 space-y-3 text-xs text-slate-300 bg-slate-900/60 rounded-lg p-3 border border-slate-700/50">
          <div>
            <p className="font-semibold text-slate-400 mb-1">Prompt MoneyPrinter:</p>
            <p className="whitespace-pre-wrap">{card.promptMoneyPrinter}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-400 mb-1">Roteiro:</p>
            <p className="whitespace-pre-wrap">{card.roteiroManual}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-400 mb-1">Descrição YouTube:</p>
            <p className="whitespace-pre-wrap">{card.descricaoYoutube}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-400 mb-1">Hashtags:</p>
            <p>{card.hashtags.map((h) => `#${h}`).join(" ")}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center border-t border-slate-700/60 pt-3 mt-3">
        <span className="text-xs text-slate-400">Status:</span>
        <div className="flex gap-1">
          {(["Pendente", "Gerado", "Postado"] as const).map((status) => (
            <button
              key={status}
              onClick={() => onMudarStatus(card.id, status)}
              className={`text-[10px] px-2 py-1 rounded font-bold transition-all ${
                card.status === status
                  ? status === "Pendente"
                    ? "bg-amber-500 text-slate-950"
                    : status === "Gerado"
                    ? "bg-blue-500 text-slate-950"
                    : "bg-emerald-500 text-slate-950"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [cronograma, setCronograma] = useState<PostCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [canalFiltro, setCanalFiltro] = useState<string>("Todos");

  // Formulário de geração
  const [canal, setCanal] = useState("Brasil");
  const [idioma, setIdioma] = useState("pt-BR");
  const [foco, setFoco] = useState("história antiga, Grécia, Roma e curiosidades");
  const [quantidadeDias, setQuantidadeDias] = useState(7);
  const [dataInicio, setDataInicio] = useState(hojeISO());
  const [observacoes, setObservacoes] = useState("");

  // Carrega do backend ao iniciar; cai para localStorage se o backend não responder
  useEffect(() => {
    (async () => {
      try {
        const remoto = await buscarCronograma();
        setCronograma(remoto);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(remoto));
      } catch {
        const local = localStorage.getItem(LOCAL_KEY);
        if (local) {
          try {
            setCronograma(JSON.parse(local));
          } catch {
            // ignora cache corrompido
          }
        }
        setErro(
          "Não foi possível conectar ao backend. Mostrando dados locais (se houver). Verifique se o servidor está rodando em localhost:3001."
        );
      }
    })();
  }, []);

  // Persiste localmente sempre que o estado muda (rede de segurança)
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(cronograma));
  }, [cronograma]);

  const persistirRemoto = async (novo: PostCard[]) => {
    try {
      await salvarCronogramaRemoto(novo);
    } catch {
      // backend pode estar offline; localStorage já cobre esse caso
    }
  };

  const handleGerar = async () => {
    setLoading(true);
    setErro(null);
    try {
      const novosCards = await gerarCronograma({
        canal,
        idioma,
        quantidadeDias,
        dataInicio,
        foco,
        observacoes,
      });
      const atualizado = [...cronograma, ...novosCards];
      setCronograma(atualizado);
      await persistirRemoto(atualizado);
    } catch (e: any) {
      setErro(e.message || "Erro ao gerar cronograma.");
    } finally {
      setLoading(false);
    }
  };

  const mudarStatus = (id: string, novoStatus: StatusPost) => {
    const atualizado = cronograma.map((c) => (c.id === id ? { ...c, status: novoStatus } : c));
    setCronograma(atualizado);
    persistirRemoto(atualizado);
  };

  const excluirCard = (id: string) => {
    const atualizado = cronograma.filter((c) => c.id !== id);
    setCronograma(atualizado);
    persistirRemoto(atualizado);
  };

  const canais = useMemo(() => {
    const set = new Set(cronograma.map((c) => c.canal));
    return ["Todos", ...Array.from(set)];
  }, [cronograma]);

  const cardsFiltrados = useMemo(
    () =>
      [...cronograma]
        .filter((c) => canalFiltro === "Todos" || c.canal === canalFiltro)
        .sort((a, b) => a.data.localeCompare(b.data)),
    [cronograma, canalFiltro]
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <header className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          History Creator AI Studio
        </h1>
        <p className="text-sm text-slate-400">
          Gerador de cronograma editorial integrado ao Gemini, pronto para o MoneyPrinterTurbo
        </p>
      </header>

      {erro && (
        <div className="mb-6 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          {erro}
        </div>
      )}

      {/* Painel de Geração */}
      <section className="mb-8 bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" /> Gerar novo cronograma via Gemini
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">Canal</label>
            <input
              value={canal}
              onChange={(e) => setCanal(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm"
              placeholder="Brasil / Internacional"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">Idioma</label>
            <input
              value={idioma}
              onChange={(e) => setIdioma(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm"
              placeholder="pt-BR / en-US"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">Data início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">Qtd. de dias</label>
            <input
              type="number"
              min={1}
              max={30}
              value={quantidadeDias}
              onChange={(e) => setQuantidadeDias(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-2">
            <label className="text-[11px] text-slate-400">Foco temático</label>
            <input
              value={foco}
              onChange={(e) => setFoco(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm"
              placeholder="ex: Segunda Guerra, táticas militares"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-[11px] text-slate-400">Observações adicionais (opcional)</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={2}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm resize-none"
            placeholder="ex: evitar temas repetidos dos últimos 10 dias, priorizar formato 'E Se...'"
          />
        </div>
        <button
          onClick={handleGerar}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Gerando com IA...
            </>
          ) : (
            <>⚡ Gerar Cronograma</>
          )}
        </button>
      </section>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {canais.map((tipo) => (
          <button
            key={tipo}
            onClick={() => setCanalFiltro(tipo)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              canalFiltro === tipo
                ? "bg-slate-700 text-amber-400 border border-amber-500/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {tipo}
          </button>
        ))}
      </div>

      {/* Grid de Cards */}
      {cardsFiltrados.length === 0 ? (
        <div className="text-center text-slate-500 text-sm py-16 border border-dashed border-slate-700 rounded-xl">
          Nenhum post no cronograma ainda. Use o painel acima para gerar com a IA.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardsFiltrados.map((card) => (
            <CardItem key={card.id} card={card} onMudarStatus={mudarStatus} onExcluir={excluirCard} />
          ))}
        </div>
      )}
    </div>
  );
}
