import React, { useEffect, useRef, useState } from 'react';
import { Anchor, Check, Flag, Scale, X } from 'lucide-react';
import {
  AFIRMACOES_POR_NIVEL,
  ENERGIA_INICIAL,
  ENERGIA_RECUPERADA,
  ROTULOS,
  duracaoInfinita,
  nivelInfinito,
  penalidadeDoErro,
  proximaAfirmacaoInfinita,
  sortearNivel,
} from '../dados/rema';
import type { Afirmacao, Resposta } from '../dados/rema';
import { useProgresso } from '../contexts/ProgressoContext';
import { Placar } from '../components/Placar';
import { estilosJogo } from './estilos';
import { useSalvarPartida, useTempoLimite } from './hooks';
import { Banner, BarraTempo, Hud, PainelFeedback, Pontinhos, TelaInicio, TelaResultado } from './ui';

const JOGO_ID = '4';
const NOME_JOGO = 'Rema ao Tema';
const ESTRELAS_PARA_CONCLUIR = 2;

interface RemaAoTemaProps {
  nivelId: string;
  proximoNivelId?: string;
  onAbrirNivel: (nivelId: string) => void;
}

type Fase = 'inicio' | 'jogando' | 'resultado';
type Escolha = Resposta | 'tempo';

function calcularEstrelas(proporcao: number): number {
  return proporcao >= 0.9 ? 3 : proporcao >= 0.7 ? 2 : proporcao >= 0.5 ? 1 : 0;
}

const opcoesDe = (a: Afirmacao): Resposta[] => (a.nivel === 6 ? ['verdade', 'mito', 'depende'] : ['verdade', 'mito']);

const ondaSvg = (cor: string, largura: number, amplitude: number) => {
  const q = largura / 4;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${largura}' height='24' viewBox='0 0 ${largura} 24'>` +
    `<path d='M0 12 Q ${q / 2} ${12 - amplitude} ${q} 12 T ${2 * q} 12 T ${3 * q} 12 T ${largura} 12 V24 H0 Z' fill='${cor}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const ALTURA_AGUA = 52;

const Agua: React.FC = () => (
  <>
    <div className="jg-agua-2" style={{ bottom: ALTURA_AGUA - 6, height: 24, backgroundImage: ondaSvg('#7dd3fc', 160, 9), backgroundSize: '160px 24px' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: ALTURA_AGUA, background: 'linear-gradient(#2563eb, #1e3a8a)' }} />
    <div className="jg-agua-1" style={{ bottom: ALTURA_AGUA - 12, height: 24, backgroundImage: ondaSvg('#2563eb', 120, 10), backgroundSize: '120px 24px' }} />
  </>
);

const Ceu: React.FC = () => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#38bdf8, #bae6fd 70%, #e0f2fe)' }} />
    <div style={{ position: 'absolute', top: 14, right: 22, width: 34, height: 34, borderRadius: '50%', backgroundColor: '#fde047', boxShadow: '0 0 22px 8px rgba(253, 224, 71, 0.55)' }} />
    <div className="jg-nuvem" style={{ position: 'absolute', top: 16, left: '14%', width: 64, height: 20, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)' }} />
    <div className="jg-nuvem" style={{ position: 'absolute', top: 38, left: '48%', width: 48, height: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.8)', animationDuration: '12s' }} />
  </>
);

const Barco: React.FC<{ tamanho?: number }> = ({ tamanho = 56 }) => (
  <svg width={tamanho} height={tamanho * 0.9} viewBox="0 0 44 40" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
    <path d="M22 3 L22 24 L6 24 Z" fill="#ffffff" stroke="#3b00a5" strokeWidth="2" strokeLinejoin="round" />
    <path d="M24 8 L24 24 L36 24 Z" fill="#fde68a" stroke="#3b00a5" strokeWidth="2" strokeLinejoin="round" />
    <path d="M4 27 H40 L35 36 H9 Z" fill="#ec4899" stroke="#3b00a5" strokeWidth="2" strokeLinejoin="round" />
    <path d="M22 3 V-2 L29 0 L22 2" fill="#facc15" stroke="#3b00a5" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

const RioProgresso: React.FC<{ progresso: number }> = ({ progresso }) => (
  <div className="jg-cena" style={{ height: 150 }} role="img" aria-label={`Barco com ${Math.round(progresso * 100)}% do caminho percorrido`}>
    <Ceu />
    <div style={{ position: 'absolute', right: 0, bottom: ALTURA_AGUA - 10, width: 86, height: 38, background: 'linear-gradient(#4ade80, #16a34a)', borderTopLeftRadius: '80% 100%' }} />
    <Flag size={24} color="#3b00a5" fill="#facc15" style={{ position: 'absolute', right: 30, bottom: ALTURA_AGUA + 20 }} />
    <Agua />
    <div style={{ position: 'absolute', bottom: ALTURA_AGUA - 12, left: `calc(${progresso} * (100% - 160px) + 12px)`, transition: 'left 0.9s ease-in-out' }}>
      <div className="jg-barco">
        <Barco />
      </div>
      <div className="jg-espuma" style={{ position: 'absolute', left: -14, bottom: 2, width: 22, height: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.8)' }} />
    </div>
  </div>
);

const ALTURA_TSUNAMI = 176;

const Tsunami: React.FC = () => (
  <svg
    width={(ALTURA_TSUNAMI * 100) / 150}
    height={ALTURA_TSUNAMI}
    viewBox="0 0 100 150"
    aria-hidden="true"
    style={{ position: 'absolute', right: 0, bottom: 0, overflow: 'visible' }}
  >
    <defs>
      <linearGradient id="gradTsunami" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3b82f6" />
        <stop offset="1" stopColor="#1e3a8a" />
      </linearGradient>
    </defs>
    <rect x="-900" y="30" width="900" height="130" fill="url(#gradTsunami)" />
    <path
      d="M0 150 V30 C10 8 38 0 60 6 C82 12 92 34 84 54 C82 60 74 60 73 52 C72 44 78 38 74 34 C66 24 46 26 38 44 C32 58 36 100 52 150 Z"
      fill="url(#gradTsunami)"
    />
    <path d="M-6 30 C10 8 38 0 60 6 C82 12 92 34 84 54" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
    <g className="jg-espuma" fill="#ffffff">
      <circle cx="92" cy="36" r="3" />
      <circle cx="99" cy="50" r="2.2" />
      <circle cx="93" cy="64" r="2" />
      <circle cx="78" cy="14" r="2.4" />
    </g>
  </svg>
);

const RioTsunami: React.FC<{ distancia: number; abalada: boolean }> = ({ distancia, abalada }) => {
  const frente = 8 + (1 - distancia / ENERGIA_INICIAL) * 78;
  return (
    <div
      className={`jg-cena ${abalada ? 'jg-tremor' : ''}`}
      style={{ height: ALTURA_TSUNAMI }}
      role="img"
      aria-label={`A tsunami está a ${distancia}% de distância do barco`}
    >
      <Ceu />
      <Agua />
      <div style={{ position: 'absolute', bottom: ALTURA_AGUA - 12, left: 'calc(84% - 40px)' }}>
        <div className="jg-barco">
          <Barco tamanho={64} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${frente}%`, transition: 'width 0.9s cubic-bezier(0.3, 0.1, 0.2, 1)' }}>
        <Tsunami />
      </div>
    </div>
  );
};

export const RemaAoTema: React.FC<RemaAoTemaProps> = (props) => {
  const [tentativa, setTentativa] = useState(0);
  return <Partida key={`${props.nivelId}-${tentativa}`} {...props} onReiniciar={() => setTentativa((t) => t + 1)} />;
};

interface PartidaProps extends RemaAoTemaProps {
  onReiniciar: () => void;
}

const Partida: React.FC<PartidaProps> = ({ nivelId, proximoNivelId, onAbrirNivel, onReiniciar }) => {
  const infinito = nivelId === 'infinito';

  const [fase, setFase] = useState<Fase>(infinito ? 'inicio' : 'jogando');
  const [afirmacoes, setAfirmacoes] = useState<Afirmacao[]>(() =>
    infinito ? [proximaAfirmacaoInfinita(0, [])] : sortearNivel(Number(nivelId)),
  );
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState<Escolha | null>(null);
  const [resultados, setResultados] = useState<('ok' | 'erro')[]>([]);
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [sequencia, setSequencia] = useState(0);
  const [melhorSequencia, setMelhorSequencia] = useState(0);
  const [distancia, setDistancia] = useState(ENERGIA_INICIAL);
  const [erros, setErros] = useState(0);
  const [ultimaPenalidade, setUltimaPenalidade] = useState(0);
  const { jogos } = useProgresso();
  const { estado: salvamento, salvar } = useSalvarPartida(JOGO_ID, nivelId);
  const botaoContinuar = useRef<HTMLButtonElement>(null);

  const atual = afirmacoes[indice];
  const respondida = escolha !== null;
  const duracao = infinito ? duracaoInfinita(indice) : 0;
  const rodadasJogadas = infinito ? indice + 1 : afirmacoes.length;
  const estrelas = infinito ? 0 : calcularEstrelas(acertos / Math.max(rodadasJogadas, 1));
  const recordeSalvo = jogos[JOGO_ID]?.[nivelId]?.melhorPontos ?? 0;

  const finalizar = (pontosFinais: number) => {
    setFase('resultado');
    salvar({
      pontos: pontosFinais,
      acertos,
      totalRodadas: rodadasJogadas,
      estrelas,
      concluido: !infinito && estrelas >= ESTRELAS_PARA_CONCLUIR,
    });
  };

  const responder = (resposta: Escolha) => {
    if (respondida || !atual) return;
    const acertou = resposta === atual.resposta;
    setEscolha(resposta);
    setResultados((r) => [...r, acertou ? 'ok' : 'erro']);

    if (acertou) {
      const bonusTempo = infinito ? Math.round(tempo / 2) : 0;
      setPontos((p) => p + 10 + Math.min(sequencia, 5) * 2 + bonusTempo);
      setAcertos((a) => a + 1);
      setSequencia(sequencia + 1);
      setMelhorSequencia((m) => Math.max(m, sequencia + 1));
      setUltimaPenalidade(0);
      if (infinito) setDistancia((d) => Math.min(ENERGIA_INICIAL, d + ENERGIA_RECUPERADA));
    } else {
      setSequencia(0);
      if (infinito) {
        const penalidade = penalidadeDoErro(erros);
        setUltimaPenalidade(penalidade);
        setErros(erros + 1);
        setDistancia((d) => Math.max(0, d - penalidade));
      }
    }
  };

  const tempo = useTempoLimite(infinito && fase === 'jogando' && !respondida, duracao, indice, () => responder('tempo'));

  const continuar = () => {
    if (infinito) {
      if (distancia <= 0) {
        finalizar(pontos);
        return;
      }
      const usadas = afirmacoes.map((a) => a.id);
      setAfirmacoes((lista) => [...lista, proximaAfirmacaoInfinita(indice + 1, usadas)]);
    } else if (indice + 1 >= afirmacoes.length) {
      finalizar(pontos);
      return;
    }
    setIndice(indice + 1);
    setEscolha(null);
  };

  useEffect(() => {
    if (respondida) botaoContinuar.current?.focus();
  }, [respondida]);

  if (fase === 'inicio') {
    return (
      <TelaInicio
        icone={Anchor}
        titulo="Modo Infinito"
        texto="Uma tsunami persegue o seu barco! Responda afirmações aleatórias para manter distância dela. A cada erro a onda avança mais."
        regras={[
          `A distância da onda é a sua vida: começa em ${ENERGIA_INICIAL} e cada acerto afasta a onda em ${ENERGIA_RECUPERADA}.`,
          'O 1º erro custa 10, o 2º custa 15, o 3º custa 20, e assim por diante: as penalidades se acumulam.',
          'O tempo para responder diminui a cada rodada. Tempo esgotado conta como erro.',
          'Se a onda alcançar o barco, o jogo acaba.',
        ]}
        recorde={recordeSalvo}
        onComecar={() => setFase('jogando')}
        extra={<Placar jogoId={JOGO_ID} quantidade={5} />}
        rotuloBotao="Começar a remar"
      />
    );
  }

  if (fase === 'resultado') {
    return (
      <TelaResultado
        infinito={infinito}
        titulo={infinito ? 'A onda alcançou o barco!' : estrelas >= ESTRELAS_PARA_CONCLUIR ? 'Você remou até a margem!' : 'Quase lá!'}
        estrelas={estrelas}
        itens={[
          { valor: `${acertos}/${infinito ? indice + 1 : afirmacoes.length}`, rotulo: 'acertos' },
          { valor: pontos, rotulo: 'pontos' },
          { valor: melhorSequencia, rotulo: 'melhor sequência' },
        ]}
        salvamento={salvamento}
        aviso={!infinito && estrelas < ESTRELAS_PARA_CONCLUIR ? 'Acerte pelo menos 70% das afirmações para concluir este nível.' : undefined}
        comemorar={infinito ? salvamento.novoRecorde : estrelas >= ESTRELAS_PARA_CONCLUIR}
        proximoNivelId={proximoNivelId}
        onReiniciar={onReiniciar}
        onAbrirNivel={onAbrirNivel}
        extra={infinito ? <Placar jogoId={JOGO_ID} quantidade={5} /> : undefined}
        icone={Anchor}
      />
    );
  }

  if (!atual) return null;
  const acertou = respondida && escolha === atual.resposta;
  const tempoEsgotado = escolha === 'tempo';
  const ultima = !infinito && indice + 1 >= afirmacoes.length;
  const fimPelaOnda = infinito && distancia <= 0;

  let titulo = 'Correto!';
  if (!acertou) {
    if (tempoEsgotado) titulo = 'Tempo esgotado!';
    else titulo = infinito ? 'Não foi dessa vez.' : 'A correnteza segurou o barco.';
    if (infinito && ultimaPenalidade > 0) titulo += ` A onda avançou ${ultimaPenalidade}!`;
  }

  return (
    <div style={estilosJogo.jogo}>
      <Banner
        icone={Anchor}
        jogo={NOME_JOGO}
        nivel={infinito ? 'Modo Infinito' : `Nível ${nivelId} de ${AFIRMACOES_POR_NIVEL}`}
        infinito={infinito}
      />
      <Hud
        rotulo={infinito ? `Afirmação ${indice + 1} · Nível ${nivelInfinito(indice)}` : `Afirmação ${indice + 1}/${afirmacoes.length}`}
        pontos={pontos}
        sequencia={sequencia}
      >
        {infinito && <span style={estilosJogo.hudItem}>Distância da onda: {distancia}</span>}
      </Hud>

      {infinito ? (
        <>
          <RioTsunami distancia={distancia} abalada={respondida && !acertou} />
          <BarraTempo fracao={respondida ? 0 : tempo / duracao} texto={respondida ? '—' : `${tempo.toFixed(1)}s`} />
        </>
      ) : (
        <>
          <RioProgresso progresso={acertos / AFIRMACOES_POR_NIVEL} />
          <Pontinhos total={afirmacoes.length} resultados={resultados} atual={indice} />
        </>
      )}

      <div key={atual.id} className="jg-entra jg-card" style={estilos.cartaAfirmacao}>
        <span style={estilosJogo.rotuloCartao}>Afirmação</span>
        <p style={estilos.cartaTexto}>{atual.texto}</p>
      </div>

      <div style={estilosJogo.opcoes}>
        {opcoesDe(atual).map((opcao) => {
          const eCorreta = opcao === atual.resposta;
          const eEscolhida = escolha === opcao;
          let estilo = estilosJogo.opcao;
          if (respondida) {
            if (eCorreta) estilo = { ...estilo, ...estilosJogo.opcaoCorreta };
            else if (eEscolhida) estilo = { ...estilo, ...estilosJogo.opcaoErrada };
            else estilo = { ...estilo, ...estilosJogo.opcaoApagada };
          }
          return (
            <button
              key={opcao}
              className="jg-opcao"
              disabled={respondida}
              onClick={() => responder(opcao)}
              style={{ ...estilo, justifyContent: 'center', padding: '17px', fontSize: '1.1rem' }}
            >
              <span style={estilosJogo.opcaoRotulo}>
                {opcao === 'verdade' && <Check size={22} />}
                {opcao === 'mito' && <X size={22} />}
                {opcao === 'depende' && <Scale size={22} />}
                {ROTULOS[opcao]}
              </span>
            </button>
          );
        })}
      </div>

      {respondida && (
        <PainelFeedback
          acertou={acertou}
          titulo={titulo}
          rotuloBotao={fimPelaOnda || ultima ? 'Ver resultado' : 'Continuar'}
          onContinuar={continuar}
          botaoRef={botaoContinuar}
        >
          <p style={estilosJogo.feedbackTexto}>
            <strong>Resposta: {ROTULOS[atual.resposta]}.</strong> {atual.explicacao}
          </p>
        </PainelFeedback>
      )}
    </div>
  );
};

const estilos: { [key: string]: React.CSSProperties } = {
  cartaAfirmacao: { padding: '20px 22px', borderLeft: '6px solid #7c3aed', display: 'flex', flexDirection: 'column', gap: '8px' },
  cartaTexto: { color: '#2e1065', fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.45 },
};
