import React, { useEffect, useState } from 'react';
import { collection, getCountFromServer, limit as limitar, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { Trophy } from 'lucide-react';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useProgresso } from '../contexts/ProgressoContext';
import { descreverErroFirestore } from '../services/progresso';
import { NIVEL_DO_PLACAR } from '../services/placar';
import type { EntradaPlacar } from '../services/placar';

interface PlacarProps {
  jogoId: string;
  quantidade?: number;
  titulo?: string;
}

interface EstadoLista {
  jogoId: string;
  lista: EntradaPlacar[];
  pronto: boolean;
  erro: string;
}

function usePlacar(jogoId: string, quantidade: number, meuMelhor: number, uid?: string) {
  const [estado, setEstado] = useState<EstadoLista>({ jogoId, lista: [], pronto: false, erro: '' });
  const [posicao, setPosicao] = useState<number | null>(null);

  useEffect(() => {
    const consulta = query(collection(db, 'placar', jogoId, 'jogadores'), orderBy('pontos', 'desc'), limitar(quantidade));
    return onSnapshot(
      consulta,
      (snap) => {
        const lista = snap.docs.map((d) => ({
          uid: d.id,
          nome: String(d.data().nome ?? 'Jogador'),
          pontos: Number(d.data().pontos ?? 0),
          nivelUsuario: Number(d.data().nivelUsuario ?? 1),
        }));
        setEstado({ jogoId, lista, pronto: true, erro: '' });
      },
      (erro) => setEstado({ jogoId, lista: [], pronto: true, erro: descreverErroFirestore(erro) }),
    );
  }, [jogoId, quantidade]);

  const atual = estado.jogoId === jogoId ? estado : { jogoId, lista: [], pronto: false, erro: '' };
  const noTop = !!uid && atual.lista.some((e) => e.uid === uid);

  useEffect(() => {
    if (!uid || meuMelhor <= 0 || noTop || !atual.pronto || atual.erro) return;
    let ativo = true;
    getCountFromServer(query(collection(db, 'placar', jogoId, 'jogadores'), where('pontos', '>', meuMelhor)))
      .then((r) => {
        if (ativo) setPosicao(r.data().count + 1);
      })
      .catch(() => {
        if (ativo) setPosicao(null);
      });
    return () => {
      ativo = false;
    };
  }, [jogoId, uid, meuMelhor, noTop, atual.pronto, atual.erro]);

  return { ...atual, noTop, posicao };
}

const CORES_MEDALHA = ['#facc15', '#e5e7eb', '#fb923c'];

export const Placar: React.FC<PlacarProps> = ({ jogoId, quantidade = 10, titulo = 'Placar do Modo Infinito' }) => {
  const { usuario } = useAuth();
  const { jogos, nivelUsuario } = useProgresso();
  const meuMelhor = jogos[jogoId]?.[NIVEL_DO_PLACAR]?.melhorPontos ?? 0;
  const { lista, pronto, erro, noTop, posicao } = usePlacar(jogoId, quantidade, meuMelhor, usuario?.uid);

  return (
    <section style={estilos.placar} aria-label={titulo}>
      <header style={estilos.cabecalho}>
        <Trophy size={22} color="#facc15" />
        <div style={estilos.cabecalhoTextos}>
          <h3 style={estilos.titulo}>{titulo}</h3>
          <span style={estilos.subtitulo}>Maiores pontuações dos jogadores</span>
        </div>
      </header>

      {!pronto && <p style={estilos.mensagem}>Carregando placar...</p>}
      {pronto && erro && <p style={estilos.erro}>{erro}</p>}
      {pronto && !erro && lista.length === 0 && (
        <p style={estilos.mensagem}>Ninguém pontuou ainda. Jogue o Modo Infinito e seja o primeiro do placar!</p>
      )}

      {pronto && !erro && lista.length > 0 && (
        <ol style={estilos.lista}>
          <li style={{ ...estilos.linha, ...estilos.linhaTitulo }} aria-hidden="true">
            <span style={estilos.colPos}>#</span>
            <span style={estilos.colNome}>Jogador</span>
            <span style={estilos.colNivel}>Nível</span>
            <span style={estilos.colPontos}>Pontos</span>
          </li>
          {lista.map((entrada, i) => {
            const eu = entrada.uid === usuario?.uid;
            return (
              <li key={entrada.uid} style={{ ...estilos.linha, ...(eu ? estilos.linhaEu : {}) }}>
                <span style={estilos.colPos}>
                  <span style={{ ...estilos.posicao, ...(i < 3 ? { backgroundColor: CORES_MEDALHA[i], color: '#3b0764' } : {}) }}>{i + 1}</span>
                </span>
                <span style={estilos.colNome}>
                  {entrada.nome}
                  {eu && <span style={estilos.voce}> (você)</span>}
                </span>
                <span style={estilos.colNivel}>{entrada.nivelUsuario}</span>
                <span style={estilos.colPontos}>{entrada.pontos}</span>
              </li>
            );
          })}
        </ol>
      )}

      {pronto && !erro && usuario && !noTop && meuMelhor > 0 && (
        <div style={{ ...estilos.linha, ...estilos.linhaEu, ...estilos.linhaForaDoTop }}>
          <span style={estilos.colPos}>
            <span style={estilos.posicao}>{posicao ?? '–'}</span>
          </span>
          <span style={estilos.colNome}>
            {usuario.nome}
            <span style={estilos.voce}> (você)</span>
          </span>
          <span style={estilos.colNivel}>{nivelUsuario}</span>
          <span style={estilos.colPontos}>{meuMelhor}</span>
        </div>
      )}

      <p style={estilos.nota}>Só o seu nome, nível e pontuação do Modo Infinito aparecem no placar.</p>
    </section>
  );
};

const estilos: { [key: string]: React.CSSProperties } = {
  placar: { width: '100%', maxWidth: '620px', margin: '0 auto', textAlign: 'left', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '20px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', color: '#ffffff' },
  cabecalho: { display: 'flex', alignItems: 'center', gap: '12px' },
  cabecalhoTextos: { display: 'flex', flexDirection: 'column' },
  titulo: { fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' },
  subtitulo: { fontSize: '0.8rem', color: '#ddd6fe' },
  lista: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' },
  linha: { display: 'grid', gridTemplateColumns: '48px 1fr 64px 84px', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.08)', fontSize: '0.95rem', fontWeight: 600 },
  linhaTitulo: { backgroundColor: 'transparent', color: '#c4b5fd', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 12px' },
  linhaEu: { backgroundColor: 'rgba(250, 204, 21, 0.2)', boxShadow: 'inset 0 0 0 2px #facc15' },
  linhaForaDoTop: { marginTop: '2px' },
  colPos: { display: 'flex', alignItems: 'center' },
  colNome: { overflowWrap: 'anywhere', minWidth: 0 },
  colNivel: { textAlign: 'center', color: '#ddd6fe' },
  colPontos: { textAlign: 'right', fontWeight: 800, color: '#fde68a' },
  posicao: { minWidth: '28px', height: '28px', padding: '0 6px', borderRadius: '14px', backgroundColor: 'rgba(255, 255, 255, 0.18)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 },
  voce: { color: '#fde68a', fontSize: '0.8rem' },
  mensagem: { color: '#ede9fe', fontSize: '0.92rem', textAlign: 'center', padding: '10px 0' },
  erro: { backgroundColor: '#fee2e2', color: '#7f1d1d', borderRadius: '12px', padding: '10px 14px', fontSize: '0.86rem', lineHeight: 1.5 },
  nota: { color: '#c4b5fd', fontSize: '0.75rem', textAlign: 'center' },
};
