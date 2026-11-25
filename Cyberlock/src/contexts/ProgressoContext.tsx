import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { EVENTO_FOTO_LOCAL, lerFotoLocal } from '../services/foto';
import {
  EVENTO_PROGRESSO_LOCAL,
  lerProgressoLocal,
  mesclarProgresso,
  nivelDoUsuario,
  type ProgressoJogo,
} from '../services/progresso';

interface ProgressoValue {
  xpTotal: number;
  nivelUsuario: number;
  xpPorDia: Record<string, number>;
  jogos: Record<string, ProgressoJogo>;
  carregando: boolean;
  erro: boolean;
  fotoPerfil: string | null;
}

const VAZIO: ProgressoValue = { xpTotal: 0, nivelUsuario: 1, xpPorDia: {}, jogos: {}, carregando: false, erro: false, fotoPerfil: null };

interface Dados {
  uid: string;
  xpTotal: number;
  xpPorDia: Record<string, number>;
  jogos: Record<string, ProgressoJogo>;
  resumoPronto: boolean;
  jogosPronto: boolean;
  erro: boolean;
  fotoPerfil: string | null;
}

const ProgressoContext = createContext<ProgressoValue>(VAZIO);

export function ProgressoProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const uid = usuario?.uid;
  const [dados, setDados] = useState<Dados | null>(null);
  const [versaoLocal, setVersaoLocal] = useState(0);

  useEffect(() => {
    if (!uid) return;

    const atualizar = (parcial: Partial<Dados>) =>
      setDados((atual) => {
        const base: Dados =
          atual && atual.uid === uid
            ? atual
            : { uid, xpTotal: 0, xpPorDia: {}, jogos: {}, resumoPronto: false, jogosPronto: false, erro: false, fotoPerfil: null };
        return { ...base, ...parcial };
      });

    const cancelarResumo = onSnapshot(
      doc(db, 'usuarios', uid),
      (snap) => {
        const d = snap.data();
        atualizar({
          xpTotal: d?.xpTotal ?? 0,
          xpPorDia: d?.xpPorDia ?? {},
          fotoPerfil: typeof d?.fotoPerfil === 'string' ? d.fotoPerfil : null,
          resumoPronto: true,
        });
      },
      () => atualizar({ erro: true, resumoPronto: true }),
    );

    const cancelarJogos = onSnapshot(
      collection(db, 'usuarios', uid, 'progresso'),
      (snap) => {
        const jogos: Record<string, ProgressoJogo> = {};
        snap.forEach((d) => {
          jogos[d.id] = d.data().niveis ?? {};
        });
        atualizar({ jogos, jogosPronto: true });
      },
      () => atualizar({ erro: true, jogosPronto: true }),
    );

    return () => {
      cancelarResumo();
      cancelarJogos();
    };
  }, [uid]);

  useEffect(() => {
    const atualizar = () => setVersaoLocal((v) => v + 1);
    window.addEventListener(EVENTO_PROGRESSO_LOCAL, atualizar);
    window.addEventListener(EVENTO_FOTO_LOCAL, atualizar);
    return () => {
      window.removeEventListener(EVENTO_PROGRESSO_LOCAL, atualizar);
      window.removeEventListener(EVENTO_FOTO_LOCAL, atualizar);
    };
  }, []);

  const local = useMemo(() => (uid ? lerProgressoLocal(uid) : null), [uid, versaoLocal]);
  const fotoLocal = useMemo(() => (uid ? lerFotoLocal(uid) : null), [uid, versaoLocal]);

  const atual = dados && dados.uid === uid ? dados : null;
  let valor: ProgressoValue = VAZIO;
  if (uid && local) {
    const unido = mesclarProgresso(
      { xpTotal: atual?.xpTotal ?? 0, xpPorDia: atual?.xpPorDia ?? {}, jogos: atual?.jogos ?? {} },
      local,
    );
    valor = {
      xpTotal: unido.xpTotal,
      nivelUsuario: nivelDoUsuario(unido.xpTotal),
      xpPorDia: unido.xpPorDia,
      jogos: unido.jogos,
      carregando: !(atual?.resumoPronto && atual?.jogosPronto),
      erro: atual?.erro ?? false,
      fotoPerfil: fotoLocal !== null ? fotoLocal || null : (atual?.fotoPerfil ?? null),
    };
  }

  return <ProgressoContext.Provider value={valor}>{children}</ProgressoContext.Provider>;
}

export function useProgresso(): ProgressoValue {
  return useContext(ProgressoContext);
}

export function useFotoUrl(): string | null {
  const { usuario } = useAuth();
  const { fotoPerfil } = useProgresso();
  return fotoPerfil ?? usuario?.fotoUrl ?? null;
}
