import React, { useEffect, useRef, useState } from 'react';
import {
  Globe,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import {
  CENARIOS_POR_NIVEL,
  CUSTO_BLOQUEOU_LEGITIMO,
  CUSTO_CAIU_NO_GOLPE,
  CUSTO_TEMPO_ESGOTADO,
  ESCUDOS_INFINITO,
  ROTULOS_CANAL,
  duracaoInfinita,
  nivelInfinito,
  proximoCenarioInfinito,
  sortearNivel,
} from '../dados/golpes';
import type { Canal, Cenario } from '../dados/golpes';
import { useProgresso } from '../contexts/ProgressoContext';
import { Placar } from '../components/Placar';
import { estilosJogo } from './estilos';
import { useSalvarPartida, useTempoLimite } from './hooks';
import { Banner, BarraTempo, Hud, PainelFeedback, Pontinhos, TelaInicio, TelaResultado } from './ui';

const JOGO_ID = '2';
const NOME_JOGO = 'Golpe ou Não';
const ESTRELAS_PARA_CONCLUIR = 2;

interface GolpeOuNaoProps {
  nivelId: string;
  proximoNivelId?: string;
  onAbrirNivel: (nivelId: string) => void;
}

type Fase = 'inicio' | 'jogando' | 'resultado';
type Escolha = 'golpe' | 'legitimo' | 'tempo';

function calcularEstrelas(proporcao: number): number {
  return proporcao >= 0.9 ? 3 : proporcao >= 0.7 ? 2 : proporcao >= 0.5 ? 1 : 0;
}

const ICONES_CANAL: Record<Canal, React.ElementType> = {
  sms: MessageSquare,
  whatsapp: MessageCircle,
  email: Mail,
  site: Globe,
  rede: Users,
  ligacao: Phone,
  app: Smartphone,
};

const CORES_CANAL: Record<Canal, string> = {
  sms: '#0284c7',
  whatsapp: '#15803d',
  email: '#2563eb',
  site: '#6d28d9',
  rede: '#be185d',
  ligacao: '#c2410c',
  app: '#0e7490',
};

interface CartaoProps {
  cenario: Cenario;
  reveladas: number[];
  respondida: boolean;
  onInspecionar: (indice: number) => void;
}

const Cartao: React.FC<CartaoProps> = ({ cenario, reveladas, respondida, onInspecionar }) => {
  const Icone = ICONES_CANAL[cenario.canal];
  const temInspecao = cenario.campos.some((c) => c.revela);
  return (
    <div className="jg-card" style={estilos.cartao}>
      <div style={{ ...estilos.cartaoTopo, backgroundColor: CORES_CANAL[cenario.canal] }}>
        <Icone size={18} />
        <span>{ROTULOS_CANAL[cenario.canal]}</span>
        {temInspecao && !respondida && <span style={estilos.dicaInspecao}>Toque em "Inspecionar" para ver detalhes</span>}
      </div>
      {cenario.campos.map((campo, i) => {
        const mostrar = respondida || reveladas.includes(i);
        return (
          <div key={i} style={estilos.campo}>
            <span style={estilos.campoRotulo}>{campo.rotulo}</span>
            <span style={{ ...estilos.campoValor, ...(campo.mono ? estilos.mono : {}) }}>{campo.valor}</span>
            {campo.revela && !respondida && (
              <button className="jg-inspecionar jg-botao" style={estilos.botaoInspecionar} onClick={() => onInspecionar(i)} aria-expanded={mostrar}>
                <Search size={13} /> {mostrar ? 'Ocultar' : 'Inspecionar'}
              </button>
            )}
            {campo.revela && mostrar && (
              <div className="jg-entra" style={estilos.revelacao}>
                {campo.revela}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const GolpeOuNao: React.FC<GolpeOuNaoProps> = (props) => {
  const [tentativa, setTentativa] = useState(0);
  return <Partida key={`${props.nivelId}-${tentativa}`} {...props} onReiniciar={() => setTentativa((t) => t + 1)} />;
};

interface PartidaProps extends GolpeOuNaoProps {
  onReiniciar: () => void;
}

const Partida: React.FC<PartidaProps> = ({ nivelId, proximoNivelId, onAbrirNivel, onReiniciar }) => {
  const infinito = nivelId === 'infinito';

  const [fase, setFase] = useState<Fase>(infinito ? 'inicio' : 'jogando');
  const [cenarios, setCenarios] = useState<Cenario[]>(() =>
    infinito ? [proximoCenarioInfinito(0, [])] : sortearNivel(Number(nivelId)),
  );
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState<Escolha | null>(null);
  const [reveladas, setReveladas] = useState<number[]>([]);
  const [resultados, setResultados] = useState<('ok' | 'erro')[]>([]);
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [sequencia, setSequencia] = useState(0);
  const [melhorSequencia, setMelhorSequencia] = useState(0);
  const [escudos, setEscudos] = useState(ESCUDOS_INFINITO);
  const [ultimoCusto, setUltimoCusto] = useState(0);
  const { jogos } = useProgresso();
  const { estado: salvamento, salvar } = useSalvarPartida(JOGO_ID, nivelId);
  const botaoContinuar = useRef<HTMLButtonElement>(null);

  const atual = cenarios[indice];
  const respondida = escolha !== null;
  const duracao = infinito ? duracaoInfinita(indice) : 0;
  const rodadasJogadas = infinito ? indice + 1 : cenarios.length;
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
    const acertou = resposta !== 'tempo' && (resposta === 'golpe') === atual.golpe;
    setEscolha(resposta);
    setResultados((r) => [...r, acertou ? 'ok' : 'erro']);

    if (acertou) {
      const bonusTempo = infinito ? Math.round(tempo / 3) : 0;
      setPontos((p) => p + 10 + Math.min(sequencia, 5) * 2 + bonusTempo);
      setAcertos((a) => a + 1);
      setSequencia(sequencia + 1);
      setMelhorSequencia((m) => Math.max(m, sequencia + 1));
      setUltimoCusto(0);
    } else {
      setSequencia(0);
      if (infinito) {
        const custo =
          resposta === 'tempo' ? CUSTO_TEMPO_ESGOTADO : atual.golpe ? CUSTO_CAIU_NO_GOLPE : CUSTO_BLOQUEOU_LEGITIMO;
        setUltimoCusto(custo);
        setEscudos((e) => Math.max(0, e - custo));
      }
    }
  };

  const tempo = useTempoLimite(infinito && fase === 'jogando' && !respondida, duracao, indice, () => responder('tempo'));

  const continuar = () => {
    if (infinito) {
      if (escudos <= 0) {
        finalizar(pontos);
        return;
      }
      const usados = cenarios.map((x) => x.id);
      setCenarios((lista) => [...lista, proximoCenarioInfinito(indice + 1, usados)]);
    } else if (indice + 1 >= cenarios.length) {
      finalizar(pontos);
      return;
    }
    setIndice(indice + 1);
    setEscolha(null);
    setReveladas([]);
  };

  const alternarInspecao = (i: number) =>
    setReveladas((lista) => (lista.includes(i) ? lista.filter((x) => x !== i) : [...lista, i]));

  useEffect(() => {
    if (respondida) botaoContinuar.current?.focus();
  }, [respondida]);

  if (fase === 'inicio') {
    return (
      <TelaInicio
        icone={ShieldAlert}
        titulo="Modo Infinito"
        texto="Cenários aleatórios, entre golpes e situações legítimas, com dificuldade crescente e tempo limitado."
        regras={[
          `Você começa com ${ESCUDOS_INFINITO} escudos.`,
          `Cair em um golpe custa ${CUSTO_CAIU_NO_GOLPE} escudos. Desconfiar de algo legítimo custa ${CUSTO_BLOQUEOU_LEGITIMO}.`,
          `Tempo esgotado custa ${CUSTO_TEMPO_ESGOTADO} escudo. O jogo termina quando os escudos acabam.`,
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
          { valor: `${acertos}/${rodadasJogadas}`, rotulo: 'acertos' },
          { valor: pontos, rotulo: 'pontos' },
          { valor: melhorSequencia, rotulo: 'melhor sequência' },
        ]}
        salvamento={salvamento}
        aviso={!infinito && estrelas < ESTRELAS_PARA_CONCLUIR ? 'Acerte pelo menos 70% dos cenários para concluir este nível.' : undefined}
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
  const acertou = respondida && escolha !== 'tempo' && (escolha === 'golpe') === atual.golpe;
  const ultima = !infinito && indice + 1 >= cenarios.length;
  const fimPorEscudos = infinito && escudos <= 0;

  let titulo: string;
  if (acertou) {
    titulo = atual.golpe ? 'Correto! Era um golpe.' : 'Correto! Era legítimo.';
  } else {
    if (escolha === 'tempo') titulo = 'Tempo esgotado!';
    else titulo = atual.golpe ? 'Era um golpe!' : 'Essa mensagem era legítima.';
    if (infinito && ultimoCusto > 0) titulo += ` (-${ultimoCusto} ${ultimoCusto > 1 ? 'escudos' : 'escudo'})`;
  }

  const opcoes: { valor: 'golpe' | 'legitimo'; rotulo: string; Icone: React.ElementType; cor: string }[] = [
    { valor: 'golpe', rotulo: 'Golpe', Icone: ShieldAlert, cor: '#dc2626' },
    { valor: 'legitimo', rotulo: 'Legítimo', Icone: ShieldCheck, cor: '#16a34a' },
  ];

  return (
    <div style={estilosJogo.jogo}>
      <Banner
        icone={ShieldAlert}
        jogo={NOME_JOGO}
        nivel={infinito ? 'Modo Infinito' : `Nível ${nivelId} de ${CENARIOS_POR_NIVEL}`}
        infinito={infinito}
      />
      <Hud
        rotulo={infinito ? `Cenário ${indice + 1} · Nível ${nivelInfinito(indice)}` : `Cenário ${indice + 1}/${cenarios.length}`}
        pontos={pontos}
        sequencia={sequencia}
      >
        {infinito && (
          <span style={estilosJogo.hudItem} aria-label={`${escudos} escudos`}>
            {Array.from({ length: ESCUDOS_INFINITO }, (_, i) => (
              <Shield key={i} size={20} color="#c4b5fd" fill={i < escudos ? '#a78bfa' : 'none'} />
            ))}
          </span>
        )}
      </Hud>

      {infinito ? (
        <BarraTempo fracao={respondida ? 0 : tempo / duracao} texto={respondida ? '—' : `${tempo.toFixed(1)}s`} />
      ) : (
        <Pontinhos total={cenarios.length} resultados={resultados} atual={indice} />
      )}

      <div key={atual.id} className="jg-entra" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {atual.contexto && <p style={estilosJogo.contexto}>{atual.contexto}</p>}
        <Cartao cenario={atual} reveladas={reveladas} respondida={respondida} onInspecionar={alternarInspecao} />

        <h3 style={estilosJogo.pergunta}>É golpe ou é legítimo?</h3>

        <div style={estilosJogo.opcoes}>
          {opcoes.map(({ valor, rotulo, Icone, cor }) => {
            const eCorreta = (valor === 'golpe') === atual.golpe;
            const eEscolhida = escolha === valor;
            let estilo = estilosJogo.opcao;
            if (respondida) {
              if (eCorreta) estilo = { ...estilo, ...estilosJogo.opcaoCorreta };
              else if (eEscolhida) estilo = { ...estilo, ...estilosJogo.opcaoErrada };
              else estilo = { ...estilo, ...estilosJogo.opcaoApagada };
            }
            return (
              <button
                key={valor}
                className="jg-opcao"
                disabled={respondida}
                onClick={() => responder(valor)}
                style={{ ...estilo, justifyContent: 'center', padding: '18px', fontSize: '1.15rem' }}
              >
                <span style={estilosJogo.opcaoRotulo}>
                  <Icone size={24} color={respondida ? undefined : cor} />
                  {rotulo}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {respondida && (
        <PainelFeedback
          acertou={acertou}
          titulo={titulo}
          rotuloBotao={fimPorEscudos || ultima ? 'Ver resultado' : 'Continuar'}
          onContinuar={continuar}
          botaoRef={botaoContinuar}
        >
          <p style={estilosJogo.feedbackTexto}>
            <strong>{atual.golpe ? 'Sinais de golpe:' : 'Por que é legítimo:'}</strong>
          </p>
          <ul style={estilosJogo.lista}>
            {atual.sinais.map((sinal) => (
              <li key={sinal}>{sinal}</li>
            ))}
          </ul>
        </PainelFeedback>
      )}
    </div>
  );
};

const estilos: { [key: string]: React.CSSProperties } = {
  cartao: { overflow: 'hidden' },
  cartaoTopo: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', color: '#ffffff', padding: '11px 16px', fontWeight: 800, fontSize: '0.92rem' },
  dicaInspecao: { marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 600, opacity: 0.9 },
  campo: { display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px 12px', padding: '11px 16px', borderBottom: '1px solid #ede9fe' },
  campoRotulo: { width: '110px', flexShrink: 0, color: '#6d28d9', fontWeight: 800, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  campoValor: { flex: 1, minWidth: '180px', color: '#2e1065', fontSize: '1rem', lineHeight: 1.5, overflowWrap: 'anywhere' },
  mono: { fontFamily: 'monospace' },
  botaoInspecionar: { display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#ede9fe', color: '#3b00a5', border: '1px solid #7c3aed', borderRadius: '12px', padding: '4px 11px', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' },
  revelacao: { flexBasis: '100%', backgroundColor: '#fef3c7', color: '#78350f', borderRadius: '10px', padding: '9px 12px', fontSize: '0.9rem', lineHeight: 1.5, overflowWrap: 'anywhere', borderLeft: '4px solid #f59e0b' },
};
