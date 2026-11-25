import React, { useMemo } from 'react';
import { ArrowRight, Check, Flame, RotateCcw, Star, Timer, Trophy, X, Zap } from 'lucide-react';
import type { EstadoSalvamento } from './hooks';
import { estilosJogo as e } from './estilos';

export const Banner: React.FC<{ icone: React.ElementType; jogo: string; nivel: string; infinito?: boolean }> = ({
  icone: Icone,
  jogo,
  nivel,
  infinito,
}) => (
  <div className="jg-entra" style={e.banner}>
    <div style={e.bannerIcone}>
      <Icone size={24} color="#ffffff" />
    </div>
    <div style={e.bannerTextos}>
      <span style={e.bannerJogo}>{jogo}</span>
      <span style={e.bannerSub}>{nivel}</span>
    </div>
    {infinito && (
      <span style={e.chipInfinito}>
        <Zap size={14} /> Infinito
      </span>
    )}
  </div>
);

export const Hud: React.FC<{ rotulo: string; pontos: number; sequencia: number; children?: React.ReactNode }> = ({
  rotulo,
  pontos,
  sequencia,
  children,
}) => (
  <div style={e.hud}>
    <span>{rotulo}</span>
    <div className="jg-hud-grupo" style={e.hudGrupo}>
      {children}
      {sequencia >= 2 && (
        <span className="jg-brilho" style={{ ...e.hudItem, color: '#fed7aa' }} aria-label={`Sequência de ${sequencia}`}>
          <Flame size={18} color="#fb923c" fill="#fb923c" /> {sequencia}
        </span>
      )}
      <span style={e.hudPontos}>{pontos} pts</span>
    </div>
  </div>
);

export const Pontinhos: React.FC<{ total: number; resultados: ('ok' | 'erro')[]; atual: number }> = ({
  total,
  resultados,
  atual,
}) => (
  <div style={e.pontinhos} aria-hidden="true">
    {Array.from({ length: total }, (_, i) => {
      const r = resultados[i];
      const cor = r === 'ok' ? '#4ade80' : r === 'erro' ? '#f87171' : i === atual ? '#facc15' : undefined;
      return (
        <span
          key={i}
          style={{ ...e.pontinho, ...(cor ? { backgroundColor: cor } : {}), ...(i === atual && !r ? { transform: 'scale(1.35)' } : {}) }}
        />
      );
    })}
  </div>
);

export const BarraTempo: React.FC<{ fracao: number; texto: string }> = ({ fracao, texto }) => {
  const pct = Math.max(0, Math.min(1, fracao)) * 100;
  return (
    <>
      <div
        style={e.barraFundo}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label="Tempo restante"
      >
        <div
          style={{
            ...e.barraPreenchida,
            width: `${pct}%`,
            backgroundColor: pct < 30 ? '#f87171' : '#facc15',
          }}
        />
      </div>
      <span style={e.tempoTexto}>
        <Timer size={14} /> {texto}
      </span>
    </>
  );
};

interface PainelFeedbackProps {
  acertou: boolean;
  titulo: string;
  rotuloBotao: string;
  onContinuar: () => void;
  botaoRef: React.RefObject<HTMLButtonElement | null>;
  children?: React.ReactNode;
}

export const PainelFeedback: React.FC<PainelFeedbackProps> = ({ acertou, titulo, rotuloBotao, onContinuar, botaoRef, children }) => (
  <div
    role="status"
    aria-live="polite"
    className={`jg-entra ${acertou ? '' : 'jg-tremor'}`}
    style={{ ...e.feedback, ...(acertou ? e.feedbackCerto : e.feedbackErrado) }}
  >
    <div style={e.feedbackTopo}>
      <span style={{ ...e.feedbackIcone, backgroundColor: acertou ? '#16a34a' : '#dc2626' }}>
        {acertou ? <Check size={18} color="#ffffff" strokeWidth={3} /> : <X size={18} color="#ffffff" strokeWidth={3} />}
      </span>
      <strong>{titulo}</strong>
    </div>
    {children}
    <button ref={botaoRef} className="jg-botao" style={e.botaoPrimario} onClick={onContinuar}>
      {rotuloBotao} <ArrowRight size={18} />
    </button>
  </div>
);

export const TelaInicio: React.FC<{
  icone: React.ElementType;
  titulo: string;
  texto: string;
  regras: string[];
  recorde: number;
  onComecar: () => void;
  rotuloBotao?: string;
  extra?: React.ReactNode;
}> = ({ icone: Icone, titulo, texto, regras, recorde, onComecar, rotuloBotao = 'Começar', extra }) => (
  <div className="jg-entra" style={e.painel}>
    <div className="jg-brilho" style={e.iconeTela}>
      <Icone size={36} color="#ffffff" />
    </div>
    <h2 style={e.tituloTela}>{titulo}</h2>
    <p style={e.textoTela}>{texto}</p>
    <ul style={e.regras}>
      {regras.map((regra) => (
        <li key={regra}>{regra}</li>
      ))}
    </ul>
    {recorde > 0 && <p style={e.recordeTexto}>Seu recorde: {recorde} pontos</p>}
    <button className="jg-botao" style={e.botaoDestaque} onClick={onComecar}>
      <Zap size={18} /> {rotuloBotao}
    </button>
    {extra}
  </div>
);

const CORES_CONFETE = ['#facc15', '#ec4899', '#38bdf8', '#4ade80', '#fb923c', '#c084fc'];

export const Confetes: React.FC = () => {
  const pecas = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        esquerda: Math.round(Math.random() * 100),
        dx: Math.round((Math.random() - 0.5) * 160),
        atraso: Math.round(Math.random() * 900),
        cor: CORES_CONFETE[i % CORES_CONFETE.length],
      })),
    [],
  );
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {pecas.map((p, i) => (
        <span
          key={i}
          className="jg-confete"
          style={{ left: `${p.esquerda}%`, backgroundColor: p.cor, animationDelay: `${p.atraso}ms`, '--dx': `${p.dx}px` } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

interface ItemResumo {
  valor: string | number;
  rotulo: string;
}

export const TelaResultado: React.FC<{
  infinito: boolean;
  titulo: string;
  estrelas: number;
  itens: ItemResumo[];
  salvamento: EstadoSalvamento;
  aviso?: string;
  comemorar: boolean;
  proximoNivelId?: string;
  onReiniciar: () => void;
  onAbrirNivel: (nivelId: string) => void;
  icone?: React.ElementType;
  extra?: React.ReactNode;
}> = ({ infinito, titulo, estrelas, itens, salvamento, aviso, comemorar, proximoNivelId, onReiniciar, onAbrirNivel, icone: Icone = Trophy, extra }) => (
  <div className="jg-entra" style={e.painel}>
    {comemorar && <Confetes />}
    <div className="jg-brilho" style={e.iconeTela}>
      <Icone size={38} color="#ffffff" />
    </div>
    <h2 style={e.tituloTela}>{titulo}</h2>

    {!infinito && (
      <div style={e.estrelas} aria-label={`${estrelas} de 3 estrelas`}>
        {[1, 2, 3].map((n) => (
          <span key={n} className="jg-pop" style={{ animationDelay: `${n * 220}ms` }}>
            <Star size={40} color="#facc15" fill={n <= estrelas ? '#facc15' : 'none'} />
          </span>
        ))}
      </div>
    )}

    <div style={e.resumo}>
      {itens.map((item) => (
        <div key={item.rotulo} style={e.resumoItem}>
          <strong style={e.resumoValor}>{item.valor}</strong>
          <span>{item.rotulo}</span>
        </div>
      ))}
    </div>

    {salvamento.status === 'salvando' && <p style={e.recordeTexto}>Salvando seu progresso...</p>}
    {(salvamento.status === 'ok' || salvamento.status === 'reserva') && (
      <p style={e.recordeTexto}>
        {salvamento.novoRecorde ? 'Novo recorde!' : `Recorde: ${salvamento.recorde} pontos`}
        {salvamento.xpGanho > 0 && ` · +${salvamento.xpGanho} XP`}
      </p>
    )}
    {salvamento.status === 'reserva' && (
      <p style={e.avisoReserva}>
        <strong>Progresso guardado só neste navegador.</strong> {salvamento.mensagemErro}
      </p>
    )}
    {aviso && <p style={e.textoTela}>{aviso}</p>}

    <div style={e.linhaBotoes}>
      <button className="jg-botao" style={e.botaoSecundario} onClick={onReiniciar}>
        <RotateCcw size={16} /> Jogar novamente
      </button>
      {!infinito && proximoNivelId && (
        <button className="jg-botao" style={e.botaoDestaque} onClick={() => onAbrirNivel(proximoNivelId)}>
          {proximoNivelId === 'infinito' ? 'Modo Infinito' : 'Próximo nível'} <ArrowRight size={18} />
        </button>
      )}
    </div>
    {extra}
  </div>
);
