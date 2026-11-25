import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ListChecks, ShieldCheck, X } from 'lucide-react';
import {
  CENARIOS_POR_NIVEL,
  MEDIDOR_INICIAL,
  MOTIVO_PADRAO_NAO,
  MOTIVO_PADRAO_SIM,
  PENALIDADE_POR_DADO,
  RECUPERACAO_PERFEITA,
  avaliar,
  duracaoInfinita,
  nivelInfinito,
  pontosDaRodada,
  proximoCenarioInfinito,
  sortearNivel,
} from '../dados/minimo';
import type { Avaliacao, CenarioPreparado } from '../dados/minimo';
import { useProgresso } from '../contexts/ProgressoContext';
import { Placar } from '../components/Placar';
import { estilosJogo } from './estilos';
import { useSalvarPartida, useTempoLimite } from './hooks';
import { Banner, BarraTempo, Hud, Pontinhos, TelaInicio, TelaResultado } from './ui';

const JOGO_ID = '3';
const NOME_JOGO = 'Mínimo possível';
const ESTRELAS_PARA_CONCLUIR = 2;

interface MinimoPossivelProps {
  nivelId: string;
  proximoNivelId?: string;
  onAbrirNivel: (nivelId: string) => void;
}

type Fase = 'inicio' | 'jogando' | 'resultado';

function calcularEstrelas(precisaoMedia: number): number {
  return precisaoMedia >= 0.9 ? 3 : precisaoMedia >= 0.75 ? 2 : precisaoMedia >= 0.6 ? 1 : 0;
}

export const MinimoPossivel: React.FC<MinimoPossivelProps> = (props) => {
  const [tentativa, setTentativa] = useState(0);
  return <Partida key={`${props.nivelId}-${tentativa}`} {...props} onReiniciar={() => setTentativa((t) => t + 1)} />;
};

interface PartidaProps extends MinimoPossivelProps {
  onReiniciar: () => void;
}

const Medidor: React.FC<{ nome: string; valor: number }> = ({ nome, valor }) => (
  <span style={estilosJogo.hudItem} aria-label={`${nome} ${valor}`}>
    {nome}
    <span style={estilos.medidorFundo}>
      <span
        style={{
          ...estilos.medidorPreenchido,
          width: `${valor}%`,
          backgroundColor: valor <= 30 ? '#f87171' : '#4ade80',
        }}
      />
    </span>
  </span>
);

const Partida: React.FC<PartidaProps> = ({ nivelId, proximoNivelId, onAbrirNivel, onReiniciar }) => {
  const infinito = nivelId === 'infinito';
  const nivelPermissoes = nivelId === '4';

  const [fase, setFase] = useState<Fase>(infinito ? 'inicio' : 'jogando');
  const [cenarios, setCenarios] = useState<CenarioPreparado[]>(() =>
    infinito ? [proximoCenarioInfinito(0, [])] : sortearNivel(Number(nivelId)),
  );
  const [indice, setIndice] = useState(0);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [resultado, setResultado] = useState<Avaliacao | null>(null);
  const [resultados, setResultados] = useState<('ok' | 'erro')[]>([]);
  const [pontos, setPontos] = useState(0);
  const [perfeitas, setPerfeitas] = useState(0);
  const [somaPrecisao, setSomaPrecisao] = useState(0);
  const [sequencia, setSequencia] = useState(0);
  const [melhorSequencia, setMelhorSequencia] = useState(0);
  const [privacidade, setPrivacidade] = useState(MEDIDOR_INICIAL);
  const [servico, setServico] = useState(MEDIDOR_INICIAL);
  const { jogos } = useProgresso();
  const { estado: salvamento, salvar } = useSalvarPartida(JOGO_ID, nivelId);
  const botaoContinuar = useRef<HTMLButtonElement>(null);

  const atual = cenarios[indice];
  const respondida = resultado !== null;
  const duracao = infinito ? duracaoInfinita(indice) : 0;
  const rodadasJogadas = infinito ? indice + 1 : cenarios.length;
  const precisaoMedia = somaPrecisao / Math.max(rodadasJogadas, 1);
  const estrelas = infinito ? 0 : calcularEstrelas(precisaoMedia);
  const recordeSalvo = jogos[JOGO_ID]?.[nivelId]?.melhorPontos ?? 0;

  const finalizar = (pontosFinais: number) => {
    setFase('resultado');
    salvar({
      pontos: pontosFinais,
      acertos: perfeitas,
      totalRodadas: rodadasJogadas,
      estrelas,
      concluido: !infinito && estrelas >= ESTRELAS_PARA_CONCLUIR,
    });
  };

  const alternar = (i: number) => {
    if (respondida) return;
    setSelecionados((lista) => (lista.includes(i) ? lista.filter((x) => x !== i) : [...lista, i]));
  };

  const confirmar = () => {
    if (respondida || !atual) return;
    const av = avaliar(atual.cenario, selecionados);
    setResultado(av);
    setResultados((r) => [...r, av.perfeita ? 'ok' : 'erro']);
    setSomaPrecisao((s) => s + av.precisao);

    let bonusTempo = 0;
    if (av.perfeita) {
      if (infinito) bonusTempo = Math.round(tempo / 3);
      setPerfeitas((p) => p + 1);
      setSequencia(sequencia + 1);
      setMelhorSequencia((m) => Math.max(m, sequencia + 1));
    } else {
      setSequencia(0);
    }
    setPontos((p) => p + pontosDaRodada(av, sequencia) + bonusTempo);

    if (infinito) {
      const recuperacao = av.perfeita ? RECUPERACAO_PERFEITA : 0;
      setPrivacidade((m) => Math.max(0, Math.min(MEDIDOR_INICIAL, m - av.excessos * PENALIDADE_POR_DADO + recuperacao)));
      setServico((m) => Math.max(0, Math.min(MEDIDOR_INICIAL, m - av.faltas * PENALIDADE_POR_DADO + recuperacao)));
    }
  };

  const tempo = useTempoLimite(infinito && fase === 'jogando' && !respondida, duracao, indice, confirmar);

  const continuar = () => {
    if (infinito) {
      if (privacidade <= 0 || servico <= 0) {
        finalizar(pontos);
        return;
      }
      const usados = cenarios.map((c) => c.cenario.id);
      setCenarios((lista) => [...lista, proximoCenarioInfinito(indice + 1, usados)]);
    } else if (indice + 1 >= cenarios.length) {
      finalizar(pontos);
      return;
    }
    setIndice(indice + 1);
    setSelecionados([]);
    setResultado(null);
  };

  useEffect(() => {
    if (respondida) botaoContinuar.current?.focus();
  }, [respondida]);

  if (fase === 'inicio') {
    return (
      <TelaInicio
        icone={ListChecks}
        titulo="Modo Infinito"
        texto="Serviços aleatórios, um atrás do outro. Escolha só os dados necessários em cada um, antes que o tempo acabe."
        regras={[
          `Você tem dois medidores, Privacidade e Serviço, que começam em ${MEDIDOR_INICIAL}.`,
          `Cada dado a mais derruba ${PENALIDADE_POR_DADO} de Privacidade. Cada dado necessário que faltar derruba ${PENALIDADE_POR_DADO} de Serviço.`,
          `Seleção perfeita recupera ${RECUPERACAO_PERFEITA} nos dois. O jogo termina quando um medidor chega a zero.`,
          'Quando o tempo acaba, a sua seleção atual é enviada.',
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
          { valor: `${Math.round(precisaoMedia * 100)}%`, rotulo: 'precisão média' },
          { valor: `${perfeitas}/${rodadasJogadas}`, rotulo: 'seleções perfeitas' },
          { valor: pontos, rotulo: 'pontos' },
        ]}
        salvamento={salvamento}
        aviso={
          !infinito && estrelas < ESTRELAS_PARA_CONCLUIR
            ? 'Alcance pelo menos 75% de precisão média para concluir este nível.'
            : melhorSequencia >= 2
              ? `Melhor sequência de seleções perfeitas: ${melhorSequencia}`
              : undefined
        }
        comemorar={infinito ? salvamento.novoRecorde : estrelas >= ESTRELAS_PARA_CONCLUIR}
        proximoNivelId={proximoNivelId}
        onReiniciar={onReiniciar}
        onAbrirNivel={onAbrirNivel}
        extra={infinito ? <Placar jogoId={JOGO_ID} quantidade={5} /> : undefined}
        icone={ShieldCheck}
      />
    );
  }

  if (!atual) return null;
  const { cenario, ordem } = atual;
  const ultima = !infinito && indice + 1 >= cenarios.length;
  const fimPorMedidor = infinito && (privacidade <= 0 || servico <= 0);

  let titulo = '';
  if (resultado) {
    if (resultado.perfeita) titulo = 'Seleção perfeita!';
    else if (resultado.excessos > 0 && resultado.faltas > 0) titulo = 'Houve dados demais e dados que faltaram.';
    else if (resultado.excessos > 0) titulo = 'Você coletou dados demais.';
    else titulo = 'Faltaram dados necessários.';
  }

  return (
    <div style={estilosJogo.jogo}>
      <Banner
        icone={ListChecks}
        jogo={NOME_JOGO}
        nivel={infinito ? 'Modo Infinito' : `Nível ${nivelId} de ${CENARIOS_POR_NIVEL}`}
        infinito={infinito}
      />
      <Hud
        rotulo={infinito ? `Serviço ${indice + 1} · Nível ${nivelInfinito(indice)}` : `Serviço ${indice + 1}/${cenarios.length}`}
        pontos={pontos}
        sequencia={sequencia}
      >
        {infinito && (
          <>
            <Medidor nome="Privacidade" valor={privacidade} />
            <Medidor nome="Serviço" valor={servico} />
          </>
        )}
      </Hud>

      {infinito ? (
        <BarraTempo fracao={respondida ? 0 : tempo / duracao} texto={respondida ? '—' : `${tempo.toFixed(1)}s`} />
      ) : (
        <Pontinhos total={cenarios.length} resultados={resultados} atual={indice} />
      )}

      <div key={cenario.id} className="jg-entra" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="jg-card" style={estilos.cartaServico}>
          <span style={estilosJogo.rotuloCartao}>Serviço</span>
          <h3 style={estilos.cartaTitulo}>{cenario.servico}</h3>
          <p style={estilos.cartaTexto}>{cenario.situacao}</p>
        </div>

        <p style={estilosJogo.instrucao}>
          {nivelPermissoes ? 'Marque só as permissões que o aplicativo realmente precisa.' : 'Marque só os dados que o serviço realmente precisa coletar.'}{' '}
          <strong style={{ color: '#fde68a' }}>
            {selecionados.length} de {cenario.dados.length} marcados
          </strong>
        </p>

        <div style={estilos.listaDados} role="group" aria-label="Dados solicitados">
          {ordem.map((i) => {
            const dado = cenario.dados[i];
            const marcado = selecionados.includes(i);
            let estado: 'neutro' | 'certo' | 'excesso' | 'falta' | 'livre' = 'neutro';
            if (respondida) {
              if (marcado && dado.necessario) estado = 'certo';
              else if (marcado) estado = 'excesso';
              else if (dado.necessario) estado = 'falta';
              else estado = 'livre';
            }
            const estiloItem =
              estado === 'certo'
                ? estilos.dadoCerto
                : estado === 'excesso'
                  ? estilos.dadoExcesso
                  : estado === 'falta'
                    ? estilos.dadoFalta
                    : estado === 'livre'
                      ? estilos.dadoLivre
                      : marcado
                        ? estilos.dadoMarcado
                        : {};
            const etiqueta =
              estado === 'certo'
                ? 'Necessário'
                : estado === 'excesso'
                  ? 'Excesso'
                  : estado === 'falta'
                    ? 'Faltou'
                    : estado === 'livre'
                      ? 'Deixado de fora'
                      : '';
            return (
              <button
                key={i}
                className="jg-opcao"
                role="checkbox"
                aria-checked={marcado}
                disabled={respondida}
                onClick={() => alternar(i)}
                style={{ ...estilos.dado, ...estiloItem }}
              >
                <span style={{ ...estilos.caixa, ...(marcado ? estilos.caixaMarcada : {}) }}>
                  {marcado && <Check size={16} color="#ffffff" strokeWidth={3} />}
                </span>
                <span style={estilos.dadoConteudo}>
                  <span style={estilos.dadoTopo}>
                    <span style={estilos.dadoRotulo}>{dado.rotulo}</span>
                    {respondida && (
                      <span style={estilos.etiqueta}>
                        {(estado === 'excesso' || estado === 'falta') && <X size={13} />}
                        {(estado === 'certo' || estado === 'livre') && <Check size={13} />}
                        {etiqueta}
                      </span>
                    )}
                  </span>
                  {respondida && (
                    <span style={estilos.dadoMotivo}>{dado.motivo ?? (dado.necessario ? MOTIVO_PADRAO_SIM : MOTIVO_PADRAO_NAO)}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {!respondida && (
          <button className="jg-botao" style={{ ...estilosJogo.botaoDestaque, alignSelf: 'center' }} onClick={confirmar}>
            Confirmar seleção <Check size={18} />
          </button>
        )}
      </div>

      {respondida && resultado && (
        <div
          role="status"
          aria-live="polite"
          className={`jg-entra ${resultado.perfeita ? '' : 'jg-tremor'}`}
          style={{ ...estilosJogo.feedback, ...(resultado.perfeita ? estilosJogo.feedbackCerto : estilosJogo.feedbackErrado) }}
        >
          <div style={estilosJogo.feedbackTopo}>
            <span style={{ ...estilosJogo.feedbackIcone, backgroundColor: resultado.perfeita ? '#16a34a' : '#dc2626' }}>
              {resultado.perfeita ? <Check size={18} color="#ffffff" strokeWidth={3} /> : <X size={18} color="#ffffff" strokeWidth={3} />}
            </span>
            <strong>{titulo}</strong>
          </div>
          <p style={estilosJogo.feedbackTexto}>
            {resultado.corretos} de {resultado.total} decisões corretas · Excesso: {resultado.excessos} · Faltou: {resultado.faltas}
          </p>
          <button ref={botaoContinuar} className="jg-botao" style={estilosJogo.botaoPrimario} onClick={continuar}>
            {fimPorMedidor || ultima ? 'Ver resultado' : 'Continuar'} <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

const estilos: { [key: string]: React.CSSProperties } = {
  cartaServico: { padding: '16px 20px', borderLeft: '6px solid #7c3aed', display: 'flex', flexDirection: 'column', gap: '4px' },
  cartaTitulo: { color: '#2e1065', fontSize: '1.25rem', fontWeight: 800 },
  cartaTexto: { color: '#4c1d95', fontSize: '1rem', lineHeight: 1.45 },
  listaDados: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '12px' },
  dado: { display: 'flex', alignItems: 'flex-start', gap: '12px', textAlign: 'left', backgroundColor: '#ffffff', color: '#3b00a5', border: '2px solid #c4b5fd', borderBottom: '5px solid #a78bfa', borderRadius: '16px', padding: '13px 15px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' },
  dadoMarcado: { backgroundColor: '#ede9fe', borderColor: '#7c3aed', borderBottomColor: '#6d28d9' },
  dadoCerto: { backgroundColor: '#dcfce7', color: '#14532d', borderColor: '#16a34a', borderBottomColor: '#15803d', cursor: 'default' },
  dadoExcesso: { backgroundColor: '#fee2e2', color: '#7f1d1d', borderColor: '#dc2626', borderBottomColor: '#b91c1c', cursor: 'default' },
  dadoFalta: { backgroundColor: '#fef3c7', color: '#78350f', borderColor: '#d97706', borderBottomColor: '#b45309', cursor: 'default' },
  dadoLivre: { opacity: 0.75, cursor: 'default' },
  caixa: { flexShrink: 0, width: '26px', height: '26px', borderRadius: '8px', border: '2px solid #7c3aed', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' },
  caixaMarcada: { backgroundColor: '#7c3aed' },
  dadoConteudo: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: 0 },
  dadoTopo: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' },
  dadoRotulo: { overflowWrap: 'anywhere' },
  etiqueta: { display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3px' },
  dadoMotivo: { fontSize: '0.84rem', fontWeight: 500, lineHeight: 1.4 },
  medidorFundo: { display: 'inline-block', width: '70px', height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: '10px', overflow: 'hidden' },
  medidorPreenchido: { display: 'block', height: '100%', borderRadius: '10px', transition: 'width 0.3s' },
};
