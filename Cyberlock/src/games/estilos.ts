import type React from 'react';
import './jogo.css';

export const estilosJogo: { [key: string]: React.CSSProperties } = {
  jogo: { width: '100%', maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' },

  banner: { display: 'flex', alignItems: 'center', gap: '12px' },
  bannerIcone: { width: '46px', height: '46px', flexShrink: 0, borderRadius: '14px', background: 'linear-gradient(135deg, #ec4899, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 0 rgba(0, 0, 0, 0.3)' },
  bannerTextos: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: 0 },
  bannerJogo: { fontFamily: 'var(--font-pixel)', fontSize: '0.7rem', color: '#ffffff', lineHeight: 1.4 },
  bannerSub: { color: '#ddd6fe', fontSize: '0.85rem', fontWeight: 600 },
  chipInfinito: { display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#facc15', color: '#3b0764', borderRadius: '999px', padding: '5px 12px', fontSize: '0.75rem', fontWeight: 800 },

  hud: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.18)', borderRadius: '16px', padding: '10px 14px', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' },
  hudGrupo: { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' },
  hudItem: { display: 'inline-flex', alignItems: 'center', gap: '6px' },
  hudPontos: { backgroundColor: '#facc15', color: '#3b0764', borderRadius: '12px', padding: '4px 14px', fontWeight: 800 },
  pontinhos: { display: 'flex', gap: '7px', justifyContent: 'center', flexWrap: 'wrap' },
  pontinho: { width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.22)', transition: 'background-color 0.3s, transform 0.3s' },
  barraFundo: { width: '100%', height: '12px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '12px', overflow: 'hidden' },
  barraPreenchida: { height: '100%', borderRadius: '12px' },
  tempoTexto: { display: 'inline-flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-end', color: '#ffffff', fontWeight: 700, fontSize: '0.8rem' },

  contexto: { backgroundColor: 'rgba(255, 255, 255, 0.12)', color: '#ede9fe', borderLeft: '5px solid #facc15', borderRadius: '12px', padding: '12px 16px', fontSize: '0.95rem', lineHeight: 1.5 },
  pergunta: { color: '#ffffff', fontSize: '1.2rem', fontWeight: 800 },
  instrucao: { color: '#ddd6fe', fontSize: '0.95rem', lineHeight: 1.5 },
  rotuloCartao: { color: '#6d28d9', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' },

  opcoes: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' },
  opcao: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', textAlign: 'left', backgroundColor: '#ffffff', color: '#3b00a5', border: '2px solid #c4b5fd', borderBottom: '5px solid #a78bfa', borderRadius: '16px', padding: '15px 18px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' },
  opcaoCorreta: { backgroundColor: '#dcfce7', color: '#14532d', borderColor: '#16a34a', borderBottomColor: '#15803d', cursor: 'default' },
  opcaoErrada: { backgroundColor: '#fee2e2', color: '#7f1d1d', borderColor: '#dc2626', borderBottomColor: '#b91c1c', cursor: 'default' },
  opcaoApagada: { opacity: 0.5, cursor: 'default' },
  opcaoRotulo: { display: 'inline-flex', alignItems: 'center', gap: '8px' },

  feedback: { borderRadius: '18px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', boxShadow: '0 6px 0 rgba(0, 0, 0, 0.22)' },
  feedbackCerto: { backgroundColor: '#dcfce7', color: '#14532d' },
  feedbackErrado: { backgroundColor: '#fee2e2', color: '#7f1d1d' },
  feedbackTopo: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem' },
  feedbackIcone: { width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  feedbackTexto: { fontSize: '0.93rem', lineHeight: 1.55 },
  lista: { paddingLeft: '20px', fontSize: '0.93rem', lineHeight: 1.6 },

  botaoPrimario: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#3b00a5', color: '#ffffff', border: 'none', borderBottom: '5px solid #24006b', borderRadius: '14px', padding: '13px 28px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' },
  botaoDestaque: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#facc15', color: '#3b0764', border: 'none', borderBottom: '5px solid #ca8a04', borderRadius: '14px', padding: '13px 28px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' },
  botaoSecundario: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#ffffff', color: '#3b00a5', border: '2px solid #c4b5fd', borderBottom: '5px solid #a78bfa', borderRadius: '14px', padding: '12px 24px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' },

  painel: { position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', padding: '18px 0' },
  iconeTela: { width: '74px', height: '74px', borderRadius: '22px', background: 'linear-gradient(135deg, #ec4899, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 0 rgba(0, 0, 0, 0.3)' },
  tituloTela: { color: '#ffffff', fontSize: '1.9rem', fontWeight: 800 },
  textoTela: { color: '#ddd6fe', fontSize: '1rem', lineHeight: 1.55 },
  regras: { color: '#ede9fe', fontSize: '0.95rem', lineHeight: 1.75, textAlign: 'left', paddingLeft: '22px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '14px 20px 14px 38px' },
  estrelas: { display: 'flex', gap: '10px' },
  resumo: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' },
  resumoItem: { backgroundColor: '#ffffff', color: '#4c1d95', borderRadius: '16px', padding: '12px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.8rem', minWidth: '122px', boxShadow: '0 5px 0 rgba(0, 0, 0, 0.22)' },
  resumoValor: { color: '#3b00a5', fontSize: '1.7rem' },
  recordeTexto: { color: '#fde68a', fontWeight: 800 },
  avisoReserva: { backgroundColor: '#fef3c7', color: '#78350f', borderRadius: '12px', padding: '10px 14px', fontSize: '0.88rem', lineHeight: 1.5, textAlign: 'left' },
  linhaBotoes: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' },
};
