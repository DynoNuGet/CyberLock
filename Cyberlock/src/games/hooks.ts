import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProgresso } from '../contexts/ProgressoContext';
import { descreverErroFirestore, nivelDoUsuario, registrarPartida, registrarPartidaLocal } from '../services/progresso';
import { NIVEL_DO_PLACAR, publicarNoPlacar } from '../services/placar';
import type { ResultadoPartida } from '../services/progresso';

export interface EstadoSalvamento {
  status: 'ocioso' | 'salvando' | 'ok' | 'reserva';
  xpGanho: number;
  recorde: number;
  novoRecorde: boolean;
  mensagemErro: string;
}

const INICIAL: EstadoSalvamento = { status: 'ocioso', xpGanho: 0, recorde: 0, novoRecorde: false, mensagemErro: '' };
const LIMITE_FIRESTORE_MS = 8000;

function comLimiteDeTempo<T>(promessa: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const temporizador = setTimeout(() => reject({ code: 'unavailable' }), ms);
    promessa.then(
      (valor) => {
        clearTimeout(temporizador);
        resolve(valor);
      },
      (erro) => {
        clearTimeout(temporizador);
        reject(erro);
      },
    );
  });
}

export function useSalvarPartida(jogoId: string, nivelId: string) {
  const { usuario } = useAuth();
  const { xpTotal } = useProgresso();
  const [estado, setEstado] = useState<EstadoSalvamento>(INICIAL);

  const salvar = (resultado: ResultadoPartida) => {
    setEstado({ ...INICIAL, status: 'salvando' });
    const uid = usuario?.uid ?? 'anonimo';

    const usarReserva = (erro: unknown) => {
      const r = registrarPartidaLocal(uid, jogoId, nivelId, resultado);
      setEstado({
        status: 'reserva',
        xpGanho: r.xpGanho,
        recorde: Math.max(r.recordeAnterior, resultado.pontos),
        novoRecorde: r.novoRecorde,
        mensagemErro: descreverErroFirestore(erro),
      });
    };

    if (!usuario) {
      usarReserva({ code: 'unauthenticated' });
      return;
    }

    comLimiteDeTempo(registrarPartida(usuario.uid, jogoId, nivelId, resultado), LIMITE_FIRESTORE_MS)
      .then((r) => {
        const recorde = Math.max(r.recordeAnterior, resultado.pontos);
        setEstado({ status: 'ok', xpGanho: r.xpGanho, recorde, novoRecorde: r.novoRecorde, mensagemErro: '' });

        if (nivelId === NIVEL_DO_PLACAR) {
          publicarNoPlacar(usuario.uid, jogoId, {
            nome: usuario.nome,
            pontos: recorde,
            nivelUsuario: nivelDoUsuario(xpTotal + r.xpGanho),
          }).catch((erro) => console.warn('Não foi possível atualizar o placar:', erro));
        }
      })
      .catch(usarReserva);
  };

  return { estado, salvar };
}

export function useTempoLimite(ativo: boolean, duracao: number, chave: unknown, aoEsgotar: () => void): number {
  const [tempo, setTempo] = useState(duracao);
  const aoEsgotarRef = useRef(aoEsgotar);

  useEffect(() => {
    aoEsgotarRef.current = aoEsgotar;
  });

  useEffect(() => {
    if (!ativo) return;
    const limite = Date.now() + duracao * 1000;
    setTempo(duracao);
    const intervalo = setInterval(() => {
      const restante = Math.max(0, (limite - Date.now()) / 1000);
      setTempo(restante);
      if (restante <= 0) {
        clearInterval(intervalo);
        aoEsgotarRef.current();
      }
    }, 100);
    return () => clearInterval(intervalo);
  }, [ativo, duracao, chave]);

  return tempo;
}
