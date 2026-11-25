export type PlanoId = 'gratis' | 'pro' | 'anual';

export interface Plano {
  id: PlanoId;
  badge?: string;
  badgeType?: 'primary' | 'popular' | 'discount';
  title: string;
  price?: string;
  period?: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  nomeNoPedido: string;
  valor: number;
  renovacao: string;
}

export const PLANOS: Plano[] = [
  {
    id: 'gratis',
    badge: 'INICIANTE',
    badgeType: 'primary',
    title: 'Grátis',
    features: ['Jogos de aprendizado', 'Acompanhamento de progresso básico', 'Certificado de conclusão', 'Modo competitivo'],
    buttonText: 'Comece agora',
    nomeNoPedido: 'Plano Grátis',
    valor: 0,
    renovacao: 'Sem cobrança.',
  },
  {
    id: 'pro',
    badge: 'MAIS POPULAR',
    badgeType: 'popular',
    title: 'PRO',
    price: '$24',
    period: '/MÊS',
    features: ['Personalização de personagens ilimitada', 'Sem anúncios', 'Suporte prioritário'],
    buttonText: 'Seja Pro',
    isPopular: true,
    nomeNoPedido: 'Plano PRO mensal',
    valor: 24,
    renovacao: 'Renovação mensal. Cancele quando quiser.',
  },
  {
    id: 'anual',
    badge: 'PLANO ANUAL',
    badgeType: 'discount',
    title: '27% DE DESCONTO',
    price: '$210',
    period: '/ANO',
    features: ['Maior economia', 'Personalização de personagens ilimitada', 'Sem anúncios', 'Suporte prioritário'],
    buttonText: 'Contrate agora',
    nomeNoPedido: 'Plano PRO anual',
    valor: 210,
    renovacao: 'Renovação anual. Cancele quando quiser.',
  },
];

export function obterPlano(id: string | undefined): Plano | undefined {
  return PLANOS.find((p) => p.id === id);
}
