export interface Nivel {
  id: string;
  titulo: string;
  descricao: string;
  instrucao: string;
}

export interface Licao {
  id: string;
  titulo: string;
  imageUrl: string;
  progresso: number; // 0 a 100
}

export interface Game {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  rating: string;
  xp: string;
  imageUrl: string;
  badge: string;
  licoes: Licao[];
  niveis: Nivel[];
}

const IMG = {
  videochamada: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&q=80&w=800',
  reuniao: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=800',
  codigo: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
  notebook: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
};

export const JOGOS: Record<string, Game> = {
  '1': {
    id: '1',
    title: 'Análise de senhas',
    subtitle: 'Encontre os erros nas senhas',
    description: 'Aprenda a identificar senhas frágeis e crie senhas super seguras para proteger seus dados.',
    level: 'Nível 1',
    rating: '4.8',
    xp: '100 XP',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
    badge: 'Recomendado',
    licoes: [
      { id: '1', titulo: 'Introdução', imageUrl: IMG.videochamada, progresso: 80 },
      { id: '2', titulo: 'Senhas curtas e sem símbolos', imageUrl: IMG.reuniao, progresso: 0 },
      { id: '3', titulo: 'Reutilização de senhas', imageUrl: IMG.codigo, progresso: 0 },
      { id: '4', titulo: 'Gerenciadores de senha', imageUrl: IMG.notebook, progresso: 0 },
    ],
    niveis: [
      { id: '1', titulo: 'Senhas simples', descricao: 'Identifique padrões óbvios, sequências e palavras comuns.', instrucao: 'Analise as senhas e avalie-as. Avaliações corretas lhe darão pontos!' },
      { id: '2', titulo: 'Datas e nomes', descricao: 'Reconheça combinações com aniversários, nomes e informações pessoais.', instrucao: 'Descubra quais senhas usam datas e nomes que qualquer pessoa conseguiria adivinhar.' },
      { id: '3', titulo: 'Leetspeak e variações', descricao: 'Detecte substituições comuns, como 1 por i e E por 3.', instrucao: 'Identifique as senhas que apenas trocam letras por números parecidos.' },
      { id: '4', titulo: 'Senhas compostas', descricao: 'Avalie combinações de palavras, símbolos e números mais complexas.', instrucao: 'Avalie senhas mais elaboradas e decida se realmente são seguras.' },
      { id: '5', titulo: 'Frases-senha', descricao: 'Julgue frases longas e descubra o que as torna fortes.', instrucao: 'Compare frases-senha e escolha as que equilibram tamanho e facilidade de lembrar.' },
    ],
  },
  '2': {
    id: '2',
    title: 'LGPDle',
    subtitle: 'Decida rápido sobre consentimento',
    description: 'Pratique os princípios básicos da LGPD com desafios interativos e simples.',
    level: 'Nível 2',
    rating: '4.9',
    xp: '150 XP',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
    badge: 'Popular',
    licoes: [
      { id: '1', titulo: 'O que é a LGPD', imageUrl: IMG.notebook, progresso: 0 },
      { id: '2', titulo: 'Direitos do titular', imageUrl: IMG.reuniao, progresso: 0 },
      { id: '3', titulo: 'Consentimento', imageUrl: IMG.codigo, progresso: 0 },
      { id: '4', titulo: 'Bases legais', imageUrl: IMG.videochamada, progresso: 0 },
    ],
    niveis: [
      { id: '1', titulo: 'Conceitos básicos', descricao: 'Entenda o que são dados pessoais e dados sensíveis.', instrucao: 'Classifique cada informação como dado pessoal, sensível ou não pessoal.' },
      { id: '2', titulo: 'Direitos do titular', descricao: 'Saiba o que você pode solicitar sobre os seus dados.', instrucao: 'Relacione cada situação ao direito do titular correspondente.' },
      { id: '3', titulo: 'Consentimento', descricao: 'Reconheça quando o consentimento é válido.', instrucao: 'Decida se o consentimento pedido em cada caso é válido ou abusivo.' },
      { id: '4', titulo: 'Bases legais', descricao: 'Veja em quais casos dados podem ser tratados sem consentimento.', instrucao: 'Escolha a base legal que justifica cada tratamento de dados.' },
      { id: '5', titulo: 'Incidentes e vazamentos', descricao: 'Aprenda como uma empresa deve agir diante de um vazamento.', instrucao: 'Ordene as ações corretas que uma empresa deve tomar após um incidente.' },
    ],
  },
  '3': {
    id: '3',
    title: 'Mínimo possível',
    subtitle: 'Compartilhe só o necessário',
    description: 'Aprenda a compartilhar apenas os dados estritamente necessários ao usar apps.',
    level: 'Nível 3',
    rating: '4.7',
    xp: '120 XP',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600',
    badge: 'Novo',
    licoes: [
      { id: '1', titulo: 'Dados essenciais', imageUrl: IMG.codigo, progresso: 0 },
      { id: '2', titulo: 'Formulários e cadastros', imageUrl: IMG.notebook, progresso: 0 },
      { id: '3', titulo: 'Permissões de apps', imageUrl: IMG.videochamada, progresso: 0 },
      { id: '4', titulo: 'Redes sociais', imageUrl: IMG.reuniao, progresso: 0 },
    ],
    niveis: [
      { id: '1', titulo: 'Dados essenciais', descricao: 'Separe o que é necessário do que é excesso.', instrucao: 'Marque apenas os dados realmente necessários para cada serviço.' },
      { id: '2', titulo: 'Formulários', descricao: 'Preencha cadastros compartilhando o mínimo.', instrucao: 'Escolha quais campos do formulário você deve preencher.' },
      { id: '3', titulo: 'Permissões de apps', descricao: 'Revise acessos e decida o que liberar.', instrucao: 'Permita ou negue cada permissão solicitada pelo aplicativo.' },
      { id: '4', titulo: 'Redes sociais', descricao: 'Ajuste o que você expõe publicamente.', instrucao: 'Identifique o que não deveria estar visível no perfil.' },
      { id: '5', titulo: 'Compras online', descricao: 'Evite entregar dados desnecessários ao comprar.', instrucao: 'Descubra quais dados a loja realmente precisa para concluir a compra.' },
    ],
  },
  '4': {
    id: '4',
    title: 'Reme ao tema',
    subtitle: 'Revise e proteja seus dados',
    description: 'Tenha domínio total sobre as configurações e tecnologia na área de proteção de dados.',
    level: 'Nível 4',
    rating: '4.8',
    xp: '200 XP',
    imageUrl: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&q=80&w=600',
    badge: 'Novo',
    licoes: [
      { id: '1', titulo: 'Revisão geral', imageUrl: IMG.notebook, progresso: 0 },
      { id: '2', titulo: 'Vazamentos de dados', imageUrl: IMG.codigo, progresso: 0 },
      { id: '3', titulo: 'Prevenção no dia a dia', imageUrl: IMG.reuniao, progresso: 0 },
      { id: '4', titulo: 'Resposta a incidentes', imageUrl: IMG.videochamada, progresso: 0 },
    ],
    niveis: [
      { id: '1', titulo: 'Revisão rápida', descricao: 'Reforce os conceitos-chave dos outros jogos.', instrucao: 'Responda rápido e acumule pontos em cada acerto.' },
      { id: '2', titulo: 'Vazamentos', descricao: 'Reconheça sinais de que seus dados vazaram.', instrucao: 'Identifique quais situações indicam um possível vazamento.' },
      { id: '3', titulo: 'Prevenção', descricao: 'Monte uma rotina de proteção eficiente.', instrucao: 'Escolha os hábitos que realmente reduzem o risco.' },
      { id: '4', titulo: 'Resposta a incidentes', descricao: 'Saiba o que fazer logo após um vazamento.', instrucao: 'Organize as ações na ordem correta para reagir ao incidente.' },
      { id: '5', titulo: 'Desafio final', descricao: 'Coloque tudo o que aprendeu à prova.', instrucao: 'Complete o desafio final combinando todos os temas.' },
    ],
  },
};

export const JOGOS_LISTA: Game[] = Object.values(JOGOS);

export function obterJogo(id: string | undefined): Game | undefined {
  return id ? JOGOS[id] : undefined;
}
