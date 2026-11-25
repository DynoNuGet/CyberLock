import React, { useEffect, useRef, useState } from 'react';
import { Check, Heart, Lock, X } from 'lucide-react';
import {
  RODADAS_POR_NIVEL,
  VIDAS_INFINITO,
  duracaoRodadaInfinita,
  nivelDaRodadaInfinita,
  proximaRodadaInfinita,
  sortearNivel,
} from '../dados/senhas';
import type { RodadaPreparada } from '../dados/senhas';
import { useProgresso } from '../contexts/ProgressoContext';
import { Placar } from '../components/Placar';
import { estilosJogo } from './estilos';
import { useSalvarPartida, useTempoLimite } from './hooks';
import { Banner, BarraTempo, Hud, PainelFeedback, Pontinhos, TelaInicio, TelaResultado } from './ui';

const JOGO_ID = '1';
const NOME_JOGO = 'Análise de senhas';
const ESTRELAS_PARA_CONCLUIR = 2;

interface AnalisarSenhasProps {
  nivelId: string;
  proximoNivelId?: string;
  onAbrirNivel: (nivelId: string) => void;
}

type Fase = 'inicio' | 'jogando' | 'resultado';

function calcularEstrelas(proporcao: number): number {
  return proporcao >= 0.9 ? 3 : proporcao >= 0.7 ? 2 : proporcao >= 0.5 ? 1 : 0;
}

export const AnalisarSenhas: React.FC<AnalisarSenhasProps> = (props) => {
  const [tentativa, setTentativa] = useState(0);
  return <Partida key={`${props.nivelId}-${tentativa}`} {...props} onReiniciar={() => setTentativa((t) => t + 1)} />;
};

interface PartidaProps extends AnalisarSenhasProps {
  onReiniciar: () => void;
}

const Partida: React.FC<PartidaProps> = ({ nivelId, proximoNivelId, onAbrirNivel, onReiniciar }) => {
  const infinito = nivelId === 'infinito';

  const [fase, setFase] = useState<Fase>(infinito ? 'inicio' : 'jogando');
  const [rodadas, setRodadas] = useState<RodadaPreparada[]>(() =>
    infinito ? [proximaRodadaInfinita(0, [])] : sortearNivel(Number(nivelId)),
  );
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [resultados, setResultados] = useState<('ok' | 'erro')[]>([]);
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [sequencia, setSequencia] = useState(0);
  const [melhorSequencia, setMelhorSequencia] = useState(0);
  const [vidas, setVidas] = useState(VIDAS_INFINITO);
  const { jogos } = useProgresso();
  const { estado: salvamento, salvar } = useSalvarPartida(JOGO_ID, nivelId);
  const botaoContinuar = useRef<HTMLButtonElement>(null);

  const atual = rodadas[indice];
  const respondida = escolha !== null;
  const duracao = infinito ? duracaoRodadaInfinita(indice) : 0;
  const rodadasJogadas = infinito ? indice + 1 : rodadas.length;
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

  const responder = (posicao: number) => {
    if (respondida || !atual) return;
    const acertou = posicao >= 0 && atual.ordem[posicao] === atual.rodada.correta;
    setEscolha(posicao);
    setResultados((r) => [...r, acertou ? 'ok' : 'erro']);

    if (acertou) {
      const bonusTempo = infinito ? Math.round(tempo / 2) : 0;
      setPontos((p) => p + 10 + Math.min(sequencia, 5) * 2 + bonusTempo);
      setAcertos((a) => a + 1);
      setSequencia(sequencia + 1);
      setMelhorSequencia((m) => Math.max(m, sequencia + 1));
    } else {
      setSequencia(0);
      if (infinito) setVidas((v) => v - 1);
    }
  };

  const tempo = useTempoLimite(infinito && fase === 'jogando' && !respondida, duracao, indice, () => responder(-1));

  const continuar = () => {
    if (infinito) {
      if (vidas <= 0) {
        finalizar(pontos);
        return;
      }
      const usadas = rodadas.map((r) => r.rodada.id);
      setRodadas((lista) => [...lista, proximaRodadaInfinita(indice + 1, usadas)]);
    } else if (indice + 1 >= rodadas.length) {
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
        icone={Lock}
        titulo="Modo Infinito"
        texto="Identifique senhas vulneráveis sem parar. A dificuldade sobe a cada rodada e o tempo para responder diminui."
        regras={[
          `Você começa com ${VIDAS_INFINITO} vidas.`,
          'Resposta errada ou tempo esgotado custa uma vida.',
          'Acertos em sequência e respostas rápidas valem mais pontos.',
        ]}
        recorde={recordeSalvo}
        onComecar={() => setFase('jogando')}
        extra={<Placar jogoId={JOGO_ID} quantidade={5} />}
      />
    );
  }

  if (fase === 'resultado') {
    return (
      <TelaResultado
        infinito={infinito}
        titulo={infinito ? 'Fim de jogo!' : estrelas >= ESTRELAS_PARA_CONCLUIR ? 'Nível concluído!' : 'Quase lá!'}
        estrelas={estrelas}
        itens={[
          { valor: infinito ? indice + 1 : `${acertos}/${rodadas.length}`, rotulo: infinito ? 'rodadas jogadas' : 'acertos' },
          { valor: pontos, rotulo: 'pontos' },
          { valor: melhorSequencia, rotulo: 'melhor sequência' },
        ]}
        salvamento={salvamento}
        aviso={!infinito && estrelas < ESTRELAS_PARA_CONCLUIR ? 'Acerte pelo menos 70% das rodadas para concluir este nível.' : undefined}
        comemorar={infinito ? salvamento.novoRecorde : estrelas >= ESTRELAS_PARA_CONCLUIR}
        proximoNivelId={proximoNivelId}
        onReiniciar={onReiniciar}
        onAbrirNivel={onAbrirNivel}
        extra={infinito ? <Placar jogoId={JOGO_ID} quantidade={5} /> : undefined}
        icone={Lock}
      />
    );
  }

  if (!atual) return null;
  const { rodada, ordem } = atual;
  const acertou = respondida && escolha !== null && escolha >= 0 && ordem[escolha] === rodada.correta;
  const ultimaRodada = !infinito && indice + 1 >= rodadas.length;
  const fimPorVidas = infinito && vidas <= 0;

  return (
    <div style={estilosJogo.jogo}>
      <Banner
        icone={Lock}
        jogo={NOME_JOGO}
        nivel={infinito ? 'Modo Infinito' : `Nível ${nivelId} de ${RODADAS_POR_NIVEL}`}
        infinito={infinito}
      />
      <Hud
        rotulo={infinito ? `Rodada ${indice + 1} · Nível ${nivelDaRodadaInfinita(indice)}` : `Rodada ${indice + 1}/${rodadas.length}`}
        pontos={pontos}
        sequencia={sequencia}
      >
        {infinito && (
          <span style={estilosJogo.hudItem} aria-label={`${vidas} vidas`}>
            {Array.from({ length: VIDAS_INFINITO }, (_, i) => (
              <Heart key={i} size={20} color="#f87171" fill={i < vidas ? '#f87171' : 'none'} />
            ))}
          </span>
        )}
      </Hud>

      {infinito ? (
        <BarraTempo fracao={respondida ? 0 : tempo / duracao} texto={respondida ? '—' : `${tempo.toFixed(1)}s`} />
      ) : (
        <Pontinhos total={rodadas.length} resultados={resultados} atual={indice} />
      )}

      <div key={rodada.id} className="jg-entra" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {rodada.contexto && <p style={estilosJogo.contexto}>{rodada.contexto}</p>}

        {rodada.senha && (
          <div style={estilos.terminal} aria-label={`Senha: ${rodada.senha}`}>
            <div style={estilos.terminalTopo}>
              <span style={{ ...estilos.bolinha, backgroundColor: '#f87171' }} />
              <span style={{ ...estilos.bolinha, backgroundColor: '#facc15' }} />
              <span style={{ ...estilos.bolinha, backgroundColor: '#4ade80' }} />
              <span style={estilos.terminalTitulo}>senha.txt</span>
            </div>
            <div style={estilos.terminalCorpo}>
              <span style={estilos.terminalRotulo}>senha&gt;</span>
              <span style={estilos.terminalSenha}>{rodada.senha}</span>
            </div>
          </div>
        )}

        <h3 style={estilosJogo.pergunta}>{rodada.pergunta}</h3>

        <div style={estilosJogo.opcoes}>
          {ordem.map((indiceOriginal, posicao) => {
            const eCorreta = indiceOriginal === rodada.correta;
            const eEscolhida = escolha === posicao;
            let estilo = estilosJogo.opcao;
            if (respondida) {
              if (eCorreta) estilo = { ...estilo, ...estilosJogo.opcaoCorreta };
              else if (eEscolhida) estilo = { ...estilo, ...estilosJogo.opcaoErrada };
              else estilo = { ...estilo, ...estilosJogo.opcaoApagada };
            }
            return (
              <button
                key={posicao}
                className="jg-opcao"
                disabled={respondida}
                onClick={() => responder(posicao)}
                style={{ ...estilo, ...(rodada.mono ? estilos.opcaoMono : {}) }}
              >
                <span style={estilos.opcaoTexto}>{rodada.opcoes[indiceOriginal]}</span>
                {respondida && eCorreta && <Check size={22} />}
                {respondida && eEscolhida && !eCorreta && <X size={22} />}
              </button>
            );
          })}
        </div>
      </div>

      {respondida && (
        <PainelFeedback
          acertou={acertou}
          titulo={acertou ? 'Correto!' : escolha === -1 ? 'Tempo esgotado!' : 'Não foi dessa vez.'}
          rotuloBotao={fimPorVidas || ultimaRodada ? 'Ver resultado' : 'Continuar'}
          onContinuar={continuar}
          botaoRef={botaoContinuar}
        >
          <p style={estilosJogo.feedbackTexto}>{rodada.explicacao}</p>
        </PainelFeedback>
      )}
    </div>
  );
};

const estilos: { [key: string]: React.CSSProperties } = {
  terminal: { borderRadius: '16px', overflow: 'hidden', backgroundColor: '#140826', boxShadow: '0 6px 0 rgba(0, 0, 0, 0.3), inset 0 0 0 2px #4c1d95' },
  terminalTopo: { display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 14px', backgroundColor: '#24104a' },
  bolinha: { width: '11px', height: '11px', borderRadius: '50%', display: 'inline-block' },
  terminalTitulo: { marginLeft: '8px', color: '#a78bfa', fontFamily: 'monospace', fontSize: '0.8rem' },
  terminalCorpo: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '24px 20px' },
  terminalRotulo: { color: '#a78bfa', fontFamily: 'monospace', fontSize: '1rem' },
  terminalSenha: { color: '#86efac', fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '2px', overflowWrap: 'anywhere', textShadow: '0 0 12px rgba(134, 239, 172, 0.55)' },
  opcaoMono: { fontFamily: 'monospace', fontSize: '1.05rem' },
  opcaoTexto: { overflowWrap: 'anywhere' },
};
