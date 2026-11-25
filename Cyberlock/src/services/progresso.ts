import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { JOGOS_LISTA } from '../dados/jogos';

export const META_XP_DIARIA = 50;
export const XP_POR_NIVEL_DO_USUARIO = 100;

export interface ProgressoNivel {
  melhorPontos: number;
  melhorAcertos: number;
  totalRodadas: number;
  estrelas: number;
  tentativas: number;
  concluido: boolean;
}

export type ProgressoJogo = Record<string, ProgressoNivel>;

export interface ResultadoPartida {
  pontos: number;
  acertos: number;
  totalRodadas: number;
  estrelas: number;
  concluido: boolean;
}

export interface RetornoPartida {
  xpGanho: number;
  recordeAnterior: number;
  novoRecorde: boolean;
}

const TITULOS = ['Iniciante', 'Aprendiz', 'Analista', 'Especialista', 'Mestre'];

export function nivelDoUsuario(xpTotal: number): number {
  return Math.floor(xpTotal / XP_POR_NIVEL_DO_USUARIO) + 1;
}

export function tituloDoNivel(nivel: number): string {
  return TITULOS[Math.min(nivel, TITULOS.length) - 1];
}

export function chaveDia(data: Date = new Date()): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function contarJogosConcluidos(jogos: Record<string, ProgressoJogo>): number {
  return JOGOS_LISTA.filter((jogo) =>
    jogo.niveis.filter((n) => n.id !== 'infinito').every((n) => jogos[jogo.id]?.[n.id]?.concluido),
  ).length;
}

export function registrarPartida(
  uid: string,
  jogoId: string,
  nivelId: string,
  resultado: ResultadoPartida,
): Promise<RetornoPartida> {
  const refJogo = doc(db, 'usuarios', uid, 'progresso', jogoId);
  const refUsuario = doc(db, 'usuarios', uid);

  return runTransaction(db, async (transacao) => {
    const snapJogo = await transacao.get(refJogo);
    const snapUsuario = await transacao.get(refUsuario);

    const anterior = (snapJogo.data()?.niveis?.[nivelId] ?? null) as ProgressoNivel | null;
    const recordeAnterior = anterior?.melhorPontos ?? 0;
    const xpGanho = Math.max(0, resultado.pontos - recordeAnterior);

    const novo: ProgressoNivel = {
      melhorPontos: Math.max(recordeAnterior, resultado.pontos),
      melhorAcertos: Math.max(anterior?.melhorAcertos ?? 0, resultado.acertos),
      totalRodadas: resultado.totalRodadas,
      estrelas: Math.max(anterior?.estrelas ?? 0, resultado.estrelas),
      tentativas: (anterior?.tentativas ?? 0) + 1,
      concluido: (anterior?.concluido ?? false) || resultado.concluido,
    };

    transacao.set(refJogo, { niveis: { [nivelId]: novo }, atualizadoEm: serverTimestamp() }, { merge: true });

    if (xpGanho > 0) {
      const dados = snapUsuario.data();
      const dia = chaveDia();
      transacao.set(
        refUsuario,
        {
          xpTotal: (dados?.xpTotal ?? 0) + xpGanho,
          xpPorDia: { [dia]: (dados?.xpPorDia?.[dia] ?? 0) + xpGanho },
          atualizadoEm: serverTimestamp(),
        },
        { merge: true },
      );
    }

    return { xpGanho, recordeAnterior, novoRecorde: resultado.pontos > recordeAnterior };
  });
}

export function descreverErroFirestore(erro: unknown): string {
  const codigo = typeof erro === 'object' && erro !== null && 'code' in erro ? String((erro as { code: unknown }).code) : '';
  if (codigo.includes('permission-denied')) {
    return 'O Firestore recusou a gravação (permission-denied). Publique as regras do arquivo firestore.rules no console do Firebase.';
  }
  if (codigo.includes('not-found') || codigo.includes('failed-precondition')) {
    return 'O banco Firestore ainda não existe neste projeto. No console do Firebase, abra Firestore Database e clique em "Criar banco de dados".';
  }
  if (codigo.includes('unavailable') || codigo.includes('deadline-exceeded')) {
    return 'Não foi possível falar com o Firestore (unavailable). Verifique a conexão e se o banco Firestore foi criado no console do Firebase.';
  }
  if (codigo.includes('unauthenticated')) {
    return 'Você não está autenticado. Saia e entre novamente na sua conta.';
  }
  return `Não foi possível salvar no Firestore${codigo ? ` (${codigo})` : ''}. Seu progresso foi guardado neste navegador.`;
}

export interface ProgressoLocal {
  xpTotal: number;
  xpPorDia: Record<string, number>;
  jogos: Record<string, ProgressoJogo>;
}

export const EVENTO_PROGRESSO_LOCAL = 'cyberlock:progresso-local';
const chaveLocal = (uid: string) => `cyberlock:progresso:${uid}`;

export function lerProgressoLocal(uid: string): ProgressoLocal {
  try {
    const bruto = localStorage.getItem(chaveLocal(uid));
    if (bruto) {
      const dados = JSON.parse(bruto) as Partial<ProgressoLocal>;
      return { xpTotal: dados.xpTotal ?? 0, xpPorDia: dados.xpPorDia ?? {}, jogos: dados.jogos ?? {} };
    }
  } catch {
  }
  return { xpTotal: 0, xpPorDia: {}, jogos: {} };
}

export function registrarPartidaLocal(
  uid: string,
  jogoId: string,
  nivelId: string,
  resultado: ResultadoPartida,
): RetornoPartida {
  const local = lerProgressoLocal(uid);
  const anterior = local.jogos[jogoId]?.[nivelId] ?? null;
  const recordeAnterior = anterior?.melhorPontos ?? 0;
  const xpGanho = Math.max(0, resultado.pontos - recordeAnterior);

  local.jogos[jogoId] = {
    ...(local.jogos[jogoId] ?? {}),
    [nivelId]: {
      melhorPontos: Math.max(recordeAnterior, resultado.pontos),
      melhorAcertos: Math.max(anterior?.melhorAcertos ?? 0, resultado.acertos),
      totalRodadas: resultado.totalRodadas,
      estrelas: Math.max(anterior?.estrelas ?? 0, resultado.estrelas),
      tentativas: (anterior?.tentativas ?? 0) + 1,
      concluido: (anterior?.concluido ?? false) || resultado.concluido,
    },
  };
  if (xpGanho > 0) {
    const dia = chaveDia();
    local.xpTotal += xpGanho;
    local.xpPorDia[dia] = (local.xpPorDia[dia] ?? 0) + xpGanho;
  }

  try {
    localStorage.setItem(chaveLocal(uid), JSON.stringify(local));
    window.dispatchEvent(new Event(EVENTO_PROGRESSO_LOCAL));
  } catch {
  }
  return { xpGanho, recordeAnterior, novoRecorde: resultado.pontos > recordeAnterior };
}

export function mesclarProgresso(
  remoto: { xpTotal: number; xpPorDia: Record<string, number>; jogos: Record<string, ProgressoJogo> },
  local: ProgressoLocal,
) {
  const jogos: Record<string, ProgressoJogo> = {};
  const ids = new Set([...Object.keys(remoto.jogos), ...Object.keys(local.jogos)]);
  ids.forEach((jogoId) => {
    const niveis: ProgressoJogo = {};
    const nivelIds = new Set([...Object.keys(remoto.jogos[jogoId] ?? {}), ...Object.keys(local.jogos[jogoId] ?? {})]);
    nivelIds.forEach((nivelId) => {
      const a = remoto.jogos[jogoId]?.[nivelId];
      const b = local.jogos[jogoId]?.[nivelId];
      if (a && b) {
        niveis[nivelId] = {
          melhorPontos: Math.max(a.melhorPontos, b.melhorPontos),
          melhorAcertos: Math.max(a.melhorAcertos, b.melhorAcertos),
          totalRodadas: a.totalRodadas || b.totalRodadas,
          estrelas: Math.max(a.estrelas, b.estrelas),
          tentativas: Math.max(a.tentativas, b.tentativas),
          concluido: a.concluido || b.concluido,
        };
      } else {
        niveis[nivelId] = (a ?? b) as ProgressoNivel;
      }
    });
    jogos[jogoId] = niveis;
  });

  const xpPorDia: Record<string, number> = { ...remoto.xpPorDia };
  Object.entries(local.xpPorDia).forEach(([dia, xp]) => {
    xpPorDia[dia] = Math.max(xpPorDia[dia] ?? 0, xp);
  });

  return { xpTotal: Math.max(remoto.xpTotal, local.xpTotal), xpPorDia, jogos };
}
