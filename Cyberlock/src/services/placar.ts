import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface EntradaPlacar {
  uid: string;
  nome: string;
  pontos: number;
  nivelUsuario: number;
}

export const NIVEL_DO_PLACAR = 'infinito';

export function publicarNoPlacar(
  uid: string,
  jogoId: string,
  dados: { nome: string; pontos: number; nivelUsuario: number },
): Promise<void> {
  const nome = dados.nome.trim().slice(0, 40) || 'Jogador';
  return setDoc(
    doc(db, 'placar', jogoId, 'jogadores', uid),
    { nome, pontos: dados.pontos, nivelUsuario: dados.nivelUsuario, atualizadoEm: serverTimestamp() },
    { merge: true },
  );
}
