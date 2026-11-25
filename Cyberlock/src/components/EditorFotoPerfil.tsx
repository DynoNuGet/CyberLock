import React, { useEffect, useRef, useState } from 'react';
import { Move, X, ZoomIn, ZoomOut } from 'lucide-react';
import { LADO_FOTO } from '../services/foto';

interface EditorFotoPerfilProps {
  arquivo: File;
  salvando: boolean;
  onCancelar: () => void;
  onSalvar: (dataUrl: string) => void;
}

const CAIXA = 280;
const ZOOM_MAX = 3;
const PASSO_TECLADO = 12;

const limitar = (valor: number, limite: number) => Math.max(-limite, Math.min(limite, valor));

export const EditorFotoPerfil: React.FC<EditorFotoPerfilProps> = ({ arquivo, salvando, onCancelar, onSalvar }) => {
  const [url, setUrl] = useState('');
  const [imagem, setImagem] = useState<HTMLImageElement | null>(null);
  const [erro, setErro] = useState('');
  const [zoom, setZoom] = useState(1);
  const [desvio, setDesvio] = useState({ x: 0, y: 0 });
  const arrasto = useRef<{ x: number; y: number; desvioX: number; desvioY: number } | null>(null);
  const botaoSalvar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const endereco = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      setUrl(endereco);
      setImagem(img);
    };
    img.onerror = () => setErro('Não foi possível abrir essa imagem. Tente outro arquivo.');
    img.src = endereco;
    return () => URL.revokeObjectURL(endereco);
  }, [arquivo]);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !salvando) onCancelar();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [onCancelar, salvando]);

  useEffect(() => {
    if (imagem) botaoSalvar.current?.focus();
  }, [imagem]);

  const base = imagem ? Math.max(CAIXA / imagem.naturalWidth, CAIXA / imagem.naturalHeight) : 1;
  const largura = imagem ? imagem.naturalWidth * base * zoom : CAIXA;
  const altura = imagem ? imagem.naturalHeight * base * zoom : CAIXA;
  const x = limitar(desvio.x, (largura - CAIXA) / 2);
  const y = limitar(desvio.y, (altura - CAIXA) / 2);
  const esquerda = CAIXA / 2 - largura / 2 + x;
  const topo = CAIXA / 2 - altura / 2 + y;

  const iniciarArrasto = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    arrasto.current = { x: e.clientX, y: e.clientY, desvioX: x, desvioY: y };
  };
  const arrastar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arrasto.current) return;
    setDesvio({
      x: arrasto.current.desvioX + (e.clientX - arrasto.current.x),
      y: arrasto.current.desvioY + (e.clientY - arrasto.current.y),
    });
  };
  const soltar = () => {
    arrasto.current = null;
  };
  const moverComTeclado = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const deslocamentos: Record<string, [number, number]> = {
      ArrowLeft: [PASSO_TECLADO, 0],
      ArrowRight: [-PASSO_TECLADO, 0],
      ArrowUp: [0, PASSO_TECLADO],
      ArrowDown: [0, -PASSO_TECLADO],
    };
    const d = deslocamentos[e.key];
    if (!d) return;
    e.preventDefault();
    setDesvio({ x: x + d[0], y: y + d[1] });
  };

  const salvar = () => {
    if (!imagem) return;
    const canvas = document.createElement('canvas');
    canvas.width = LADO_FOTO;
    canvas.height = LADO_FOTO;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setErro('Seu navegador não conseguiu processar a imagem.');
      return;
    }
    const k = LADO_FOTO / CAIXA;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, LADO_FOTO, LADO_FOTO);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imagem, esquerda * k, topo * k, largura * k, altura * k);
    onSalvar(canvas.toDataURL('image/jpeg', 0.85));
  };

  return (
    <div style={estilos.fundo} onClick={() => !salvando && onCancelar()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-editor-foto"
        style={estilos.janela}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={estilos.topo}>
          <h2 id="titulo-editor-foto" style={estilos.titulo}>
            Editar foto de perfil
          </h2>
          <button type="button" onClick={onCancelar} disabled={salvando} style={estilos.fechar} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        {erro && <p role="alert" style={estilos.erro}>{erro}</p>}

        {!imagem && !erro && <p style={estilos.texto}>Carregando imagem...</p>}

        {imagem && (
          <>
            <p style={estilos.texto}>
              <Move size={14} style={{ verticalAlign: '-2px' }} /> Arraste a imagem (ou use as setas do teclado) e ajuste o zoom.
            </p>

            <div
              style={estilos.area}
              tabIndex={0}
              role="group"
              aria-label="Área de recorte da foto"
              onPointerDown={iniciarArrasto}
              onPointerMove={arrastar}
              onPointerUp={soltar}
              onPointerCancel={soltar}
              onKeyDown={moverComTeclado}
            >
              <img
                src={url}
                alt="Pré-visualização da foto"
                draggable={false}
                style={{ position: 'absolute', left: esquerda, top: topo, width: largura, height: altura, maxWidth: 'none', userSelect: 'none', pointerEvents: 'none' }}
              />
              <div style={estilos.mascara} />
            </div>

            <div style={estilos.zoom}>
              <ZoomOut size={18} color="#6d28d9" />
              <input
                type="range"
                min={1}
                max={ZOOM_MAX}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label="Zoom"
                style={{ flex: 1, accentColor: '#7c3aed' }}
              />
              <ZoomIn size={18} color="#6d28d9" />
            </div>
          </>
        )}

        <div style={estilos.acoes}>
          <button type="button" onClick={onCancelar} disabled={salvando} style={estilos.botaoSecundario}>
            Cancelar
          </button>
          <button
            ref={botaoSalvar}
            type="button"
            onClick={salvar}
            disabled={!imagem || salvando}
            style={{ ...estilos.botaoPrimario, ...(!imagem || salvando ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
          >
            {salvando ? 'Salvando...' : 'Salvar foto'}
          </button>
        </div>
      </div>
    </div>
  );
};

const estilos: { [key: string]: React.CSSProperties } = {
  fundo: { position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(20, 8, 38, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
  janela: { width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', borderRadius: '24px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)' },
  topo: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  titulo: { color: '#2e1065', fontSize: '1.2rem', fontWeight: 800 },
  fechar: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex' },
  texto: { color: '#4c1d95', fontSize: '0.9rem', textAlign: 'center' },
  erro: { backgroundColor: '#fee2e2', color: '#7f1d1d', borderRadius: '10px', padding: '10px 12px', fontSize: '0.88rem', width: '100%' },
  area: { position: 'relative', width: `${CAIXA}px`, height: `${CAIXA}px`, overflow: 'hidden', borderRadius: '16px', backgroundColor: '#1d0f2e', cursor: 'grab', touchAction: 'none', outlineColor: '#7c3aed' },
  mascara: { position: 'absolute', inset: 0, borderRadius: '16px', pointerEvents: 'none', background: 'radial-gradient(circle at center, transparent 0, transparent 69%, rgba(20, 8, 38, 0.62) 70%)', boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.5)' },
  zoom: { width: `${CAIXA}px`, display: 'flex', alignItems: 'center', gap: '10px' },
  acoes: { width: '100%', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' },
  botaoSecundario: { padding: '11px 20px', borderRadius: '12px', border: '2px solid #ddd6fe', backgroundColor: '#ffffff', color: '#3b00a5', fontWeight: 700, cursor: 'pointer' },
  botaoPrimario: { padding: '11px 22px', borderRadius: '12px', border: 'none', borderBottom: '4px solid #24006b', backgroundColor: '#3b00a5', color: '#ffffff', fontWeight: 800, cursor: 'pointer' },
};
