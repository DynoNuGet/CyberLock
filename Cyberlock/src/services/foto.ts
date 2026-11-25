import { deleteField, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { descreverErroFirestore } from './progresso';

export const LADO_FOTO = 256;
export const EVENTO_FOTO_LOCAL = 'cyberlock:foto-local';
const LIMITE_FIRESTORE_MS = 8000;

const chaveLocal = (uid: string) => `cyberlock:foto:${uid}`;

export function lerFotoLocal(uid: string): string | null {
  try {
    return localStorage.getItem(chaveLocal(uid));
  } catch {
    return null;
  }
}

function gravarFotoLocal(uid: string, valor: string | null) {
  try {
    if (valor === null) localStorage.removeItem(chaveLocal(uid));
    else localStorage.setItem(chaveLocal(uid), valor);
    window.dispatchEvent(new Event(EVENTO_FOTO_LOCAL));
  } catch {
  }
}

export interface ResultadoFoto {
  status: 'ok' | 'reserva';
  mensagem: string;
}

export async function salvarFotoPerfil(uid: string, dataUrl: string | null): Promise<ResultadoFoto> {
  try {
    const gravacao = setDoc(
      doc(db, 'usuarios', uid),
      { fotoPerfil: dataUrl === null ? deleteField() : dataUrl, atualizadoEm: serverTimestamp() },
      { merge: true },
    );
    await Promise.race([
      gravacao,
      new Promise<never>((_, rejeitar) => setTimeout(() => rejeitar({ code: 'unavailable' }), LIMITE_FIRESTORE_MS)),
    ]);
    gravarFotoLocal(uid, null);
    return { status: 'ok', mensagem: '' };
  } catch (erro) {
    gravarFotoLocal(uid, dataUrl ?? '');
    return { status: 'reserva', mensagem: descreverErroFirestore(erro) };
  }
}
