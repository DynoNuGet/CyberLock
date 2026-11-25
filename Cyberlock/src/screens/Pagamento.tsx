import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, FileText, Lock, QrCode, ShieldCheck } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { NaoEncontrado } from '../components/NaoEncontrado';
import { useAuth } from '../contexts/AuthContext';
import { obterPlano } from '../dados/planos';
import '../main.css';

type Metodo = 'cartao' | 'pix' | 'boleto';

interface Erros {
  nome?: string;
  numero?: string;
  validade?: string;
  cvv?: string;
  email?: string;
}

const apenasDigitos = (texto: string) => texto.replace(/\D/g, '');

const formatarNumero = (texto: string) =>
  apenasDigitos(texto)
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();

const formatarValidade = (texto: string) => {
  const d = apenasDigitos(texto).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function numeroValido(numero: string): boolean {
  const d = apenasDigitos(numero);
  if (d.length < 13 || d.length > 19) return false;
  let soma = 0;
  let dobrar = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (dobrar) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    soma += n;
    dobrar = !dobrar;
  }
  return soma % 10 === 0;
}

function validadeValida(validade: string): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(validade);
  if (!m) return false;
  const mes = Number(m[1]);
  const ano = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return false;
  const hoje = new Date();
  return ano > hoje.getFullYear() || (ano === hoje.getFullYear() && mes >= hoje.getMonth() + 1);
}

async function processarPagamento(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
}

const formatarPreco = (valor: number) => `$${valor.toFixed(2).replace('.', ',')}`;

export const Pagamento: React.FC = () => {
  const { planoId } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const plano = obterPlano(planoId);

  const [metodo, setMetodo] = useState<Metodo>('cartao');
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [erros, setErros] = useState<Erros>({});
  const [processando, setProcessando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  if (!plano || plano.id === 'gratis') {
    return <NaoEncontrado mensagem="Plano não encontrado" voltarPara="/planos" textoBotao="Ver planos" />;
  }

  const validar = (): Erros => {
    const novos: Erros = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) novos.email = 'Informe um e-mail válido para receber o recibo.';
    if (metodo === 'cartao') {
      if (nome.trim().split(/\s+/).length < 2) novos.nome = 'Informe o nome como está no cartão.';
      if (!numeroValido(numero)) novos.numero = 'Número de cartão inválido. Confira os dígitos.';
      if (!validadeValida(validade)) novos.validade = 'Validade inválida ou vencida.';
      if (cvv.length < 3) novos.cvv = 'Informe o código de segurança.';
    }
    return novos;
  };

  const confirmar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (processando) return;
    const novos = validar();
    setErros(novos);
    if (Object.keys(novos).length > 0) return;

    setProcessando(true);
    await processarPagamento();
    setNumero('');
    setValidade('');
    setCvv('');
    setNome('');
    setProcessando(false);
    setConcluido(true);
  };

  const metodos: { id: Metodo; rotulo: string; Icone: React.ElementType }[] = [
    { id: 'cartao', rotulo: 'Cartão', Icone: CreditCard },
    { id: 'pix', rotulo: 'Pix', Icone: QrCode },
    { id: 'boleto', rotulo: 'Boleto', Icone: FileText },
  ];

  return (
    <div style={estilos.pagina}>
      <Header />

      <main style={estilos.main}>
        <button style={estilos.voltar} onClick={() => navigate('/planos')}>
          <ArrowLeft size={16} /> Voltar aos planos
        </button>

        {concluido ? (
          <section style={{ ...estilos.cartao, ...estilos.sucesso }} aria-live="polite">
            <div style={estilos.sucessoIcone}>
              <Check size={40} color="#ffffff" strokeWidth={3} />
            </div>
            <h1 style={estilos.titulo}>Pagamento simulado com sucesso!</h1>
            <p style={estilos.texto}>
              {plano.nomeNoPedido} · {formatarPreco(plano.valor)}
              {plano.period?.toLowerCase()}
            </p>
            <p style={estilos.aviso}>
              Esta é uma demonstração: nenhuma cobrança foi feita e nenhum dado de pagamento foi enviado ou guardado. Para
              ativar cobranças reais, é preciso integrar um provedor de pagamentos.
            </p>
            <button style={estilos.botao} onClick={() => navigate('/jogos')}>
              Ir para os jogos
            </button>
          </section>
        ) : (
          <div style={estilos.grade}>
            <form style={estilos.cartao} onSubmit={confirmar} noValidate>
              <h1 style={estilos.titulo}>Pagamento</h1>
              <p style={estilos.texto}>Pedimos só os dados necessários para concluir a assinatura.</p>

              <div role="tablist" aria-label="Forma de pagamento" style={estilos.abas}>
                {metodos.map(({ id, rotulo, Icone }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={metodo === id}
                    onClick={() => setMetodo(id)}
                    style={{ ...estilos.aba, ...(metodo === id ? estilos.abaAtiva : {}) }}
                  >
                    <Icone size={18} /> {rotulo}
                  </button>
                ))}
              </div>

              <Campo id="email" rotulo="E-mail para o recibo" erro={erros.email}>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={estilos.input}
                  aria-invalid={!!erros.email}
                />
              </Campo>

              {metodo === 'cartao' && (
                <>
                  <Campo id="nome" rotulo="Nome no cartão" erro={erros.nome}>
                    <input
                      id="nome"
                      type="text"
                      autoComplete="cc-name"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      style={estilos.input}
                      aria-invalid={!!erros.nome}
                    />
                  </Campo>
                  <Campo id="numero" rotulo="Número do cartão" erro={erros.numero}>
                    <input
                      id="numero"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="0000 0000 0000 0000"
                      value={numero}
                      onChange={(e) => setNumero(formatarNumero(e.target.value))}
                      style={estilos.input}
                      aria-invalid={!!erros.numero}
                    />
                  </Campo>
                  <div style={estilos.linha}>
                    <Campo id="validade" rotulo="Validade" erro={erros.validade}>
                      <input
                        id="validade"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/AA"
                        value={validade}
                        onChange={(e) => setValidade(formatarValidade(e.target.value))}
                        style={estilos.input}
                        aria-invalid={!!erros.validade}
                      />
                    </Campo>
                    <Campo id="cvv" rotulo="CVV" erro={erros.cvv}>
                      <input
                        id="cvv"
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(apenasDigitos(e.target.value).slice(0, 4))}
                        style={estilos.input}
                        aria-invalid={!!erros.cvv}
                      />
                    </Campo>
                  </div>
                </>
              )}

              {metodo === 'pix' && (
                <div style={estilos.caixaAlternativa}>
                  <QrCode size={64} color="#3b00a5" />
                  <p style={estilos.texto}>O QR code e o código "copia e cola" do Pix são gerados ao confirmar, pelo provedor de pagamentos (demonstração).</p>
                </div>
              )}

              {metodo === 'boleto' && (
                <div style={estilos.caixaAlternativa}>
                  <FileText size={64} color="#3b00a5" />
                  <p style={estilos.texto}>O boleto é gerado ao confirmar e vence em 3 dias. A assinatura é ativada após a compensação (demonstração).</p>
                </div>
              )}

              <button type="submit" disabled={processando} style={{ ...estilos.botao, ...(processando ? estilos.botaoDesativado : {}) }}>
                {processando ? 'Processando...' : `Confirmar ${formatarPreco(plano.valor)}`}
              </button>

              <p style={estilos.seguranca}>
                <ShieldCheck size={16} /> Demonstração: nenhuma cobrança é feita e os dados não são enviados nem guardados.
              </p>
            </form>

            <aside style={estilos.cartao} aria-label="Resumo do pedido">
              <h2 style={estilos.subtitulo}>Resumo do pedido</h2>
              <div style={estilos.itemResumo}>
                <strong>{plano.nomeNoPedido}</strong>
                <strong>
                  {formatarPreco(plano.valor)}
                  <small style={estilos.periodo}>{plano.period?.toLowerCase()}</small>
                </strong>
              </div>
              <ul style={estilos.beneficios}>
                {plano.features.map((item) => (
                  <li key={item} style={estilos.beneficio}>
                    <Check size={16} color="#16a34a" /> {item}
                  </li>
                ))}
              </ul>
              <div style={estilos.total}>
                <span>Total hoje</span>
                <strong>{formatarPreco(plano.valor)}</strong>
              </div>
              <p style={estilos.textoPequeno}>
                <Lock size={13} /> {plano.renovacao}
              </p>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

const Campo: React.FC<{ id: string; rotulo: string; erro?: string; children: React.ReactNode }> = ({ id, rotulo, erro, children }) => (
  <div style={estilos.campo}>
    <label htmlFor={id} style={estilos.rotulo}>
      {rotulo}
    </label>
    {children}
    {erro && (
      <span role="alert" style={estilos.erro}>
        {erro}
      </span>
    )}
  </div>
);

const estilos: { [key: string]: React.CSSProperties } = {
  pagina: { background: 'linear-gradient(180deg, #4400a3 0%, #7c2ff0 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  main: { flex: 1, width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '36px 24px 64px', display: 'flex', flexDirection: 'column', gap: '20px' },
  voltar: { alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#ede9fe', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' },
  grade: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' },
  cartao: { backgroundColor: '#ffffff', borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 8px 0 rgba(0, 0, 0, 0.2), 0 20px 40px rgba(0, 0, 0, 0.2)' },
  titulo: { color: '#2e1065', fontSize: '1.7rem', fontWeight: 800 },
  subtitulo: { color: '#2e1065', fontSize: '1.2rem', fontWeight: 800 },
  texto: { color: '#4c1d95', fontSize: '0.95rem', lineHeight: 1.5 },
  textoPequeno: { display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '0.82rem' },
  abas: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  aba: { flex: 1, minWidth: '96px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px 12px', borderRadius: '12px', border: '2px solid #ddd6fe', backgroundColor: '#ffffff', color: '#4c1d95', fontWeight: 700, cursor: 'pointer' },
  abaAtiva: { borderColor: '#7c3aed', backgroundColor: '#ede9fe', color: '#3b00a5' },
  campo: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  rotulo: { color: '#3b00a5', fontSize: '0.85rem', fontWeight: 700 },
  input: { padding: '12px 14px', borderRadius: '12px', border: '2px solid #ddd6fe', fontSize: '1rem', color: '#2e1065', backgroundColor: '#faf5ff', outlineColor: '#7c3aed', width: '100%', boxSizing: 'border-box',
}, erro: { color: '#b91c1c', fontSize: '0.82rem', fontWeight: 600 },
  linha: { display: 'flex', gap: '12px' },
  caixaAlternativa: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', backgroundColor: '#faf5ff', borderRadius: '16px', padding: '24px' },
  botao: { backgroundColor: '#3b00a5', color: '#ffffff', border: 'none', borderBottom: '5px solid #24006b', borderRadius: '14px', padding: '14px 24px', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer' },
  botaoDesativado: { opacity: 0.7, cursor: 'wait' },
  seguranca: { display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.4 },
  itemResumo: { display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#2e1065', fontSize: '1.05rem' },
  periodo: { color: '#6b7280', fontWeight: 600, marginLeft: '2px' },
  beneficios: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' },
  beneficio: { display: 'flex', alignItems: 'center', gap: '8px', color: '#4c1d95', fontSize: '0.92rem' },
  total: { display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #ddd6fe', paddingTop: '14px', color: '#2e1065', fontSize: '1.15rem' },
  sucesso: { alignItems: 'center', textAlign: 'center', maxWidth: '560px', margin: '0 auto' },
  sucessoIcone: { width: '76px', height: '76px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  aviso: { backgroundColor: '#fef3c7', color: '#78350f', borderRadius: '12px', padding: '12px 14px', fontSize: '0.88rem', lineHeight: 1.5 },
};
