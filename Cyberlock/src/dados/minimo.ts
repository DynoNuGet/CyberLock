export interface Dado {
  rotulo: string;
  necessario: boolean;
  motivo?: string;
}

export interface Cenario {
  id: string;
  nivel: number;
  servico: string;
  situacao: string;
  dados: Dado[];
}

export interface CenarioPreparado {
  cenario: Cenario;
  ordem: number[];
}

export interface Avaliacao {
  corretos: number;
  excessos: number;
  faltas: number;
  total: number;
  precisao: number;
  perfeita: boolean;
}

export const CENARIOS_POR_NIVEL = 6;
export const NIVEIS_NUMERADOS = 6;

export const MEDIDOR_INICIAL = 100;
export const PENALIDADE_POR_DADO = 6;
export const RECUPERACAO_PERFEITA = 8;
export const duracaoInfinita = (indice: number) => Math.max(12, 30 - indice * 1.5);
export const nivelInfinito = (indice: number) => Math.min(NIVEIS_NUMERADOS, 1 + Math.floor(indice / 3));

const sim = (rotulo: string, motivo?: string): Dado => ({ rotulo, necessario: true, motivo });
const nao = (rotulo: string, motivo?: string): Dado => ({ rotulo, necessario: false, motivo });

export const MOTIVO_PADRAO_SIM = 'Necessário para o serviço funcionar.';
export const MOTIVO_PADRAO_NAO = 'Não é necessário para essa finalidade. Quem pede além do necessário coleta dados demais.';

export const CENARIOS: Cenario[] = [
  { id: '1-1', nivel: 1, servico: 'Newsletter de receitas', situacao: 'Você quer receber receitas por e-mail toda semana.',
    dados: [sim('E-mail', 'Sem ele não há como enviar a newsletter.'), nao('CPF'), nao('Telefone'), nao('Endereço residencial'), nao('Data de nascimento'), nao('Estado civil')] },
  { id: '1-2', nivel: 1, servico: 'Aplicativo gratuito de lista de tarefas', situacao: 'Você vai criar uma conta para salvar suas listas.',
    dados: [sim('E-mail', 'Identifica a conta e permite recuperar o acesso.'), sim('Senha', 'Protege o acesso à sua conta.'), nao('CPF'), nao('Endereço residencial'), nao('Telefone'), nao('Renda mensal')] },
  { id: '1-3', nivel: 1, servico: 'Inscrição em corrida de rua', situacao: 'Você vai participar de uma corrida de 5 km organizada no bairro.',
    dados: [sim('Nome completo', 'Identifica o corredor na lista e no kit.'), sim('Data de nascimento', 'Define a categoria por faixa etária.'), sim('Tamanho da camiseta', 'Necessário para separar o seu kit.'), sim('Contato de emergência', 'Permite avisar alguém em caso de acidente.'), nao('Renda mensal'), nao('Religião'), nao('Profissão')] },
  { id: '1-4', nivel: 1, servico: 'Cupons de desconto da padaria pelo WhatsApp', situacao: 'A padaria vai enviar cupons para o seu WhatsApp.',
    dados: [sim('Número de WhatsApp', 'É o canal de envio dos cupons.'), nao('CPF'), nao('Endereço residencial'), nao('Data de nascimento'), nao('Nome da mãe'), nao('E-mail', 'Os cupons chegam por WhatsApp, então o e-mail não é necessário.')] },
  { id: '1-5', nivel: 1, servico: 'Lista de espera de restaurante', situacao: 'Você quer entrar na fila de espera para jantar.',
    dados: [sim('Nome', 'Para chamar você quando a mesa estiver pronta.'), sim('Número de pessoas', 'Define o tamanho da mesa.'), sim('Telefone', 'Para avisar quando chegar a sua vez.'), nao('CPF'), nao('Endereço residencial'), nao('E-mail'), nao('Data de nascimento')] },
  { id: '1-6', nivel: 1, servico: 'Conta em um jogo online gratuito', situacao: 'Você vai criar uma conta para jogar com os amigos.',
    dados: [sim('Nome de usuário', 'Identifica você dentro do jogo.'), sim('E-mail', 'Serve para recuperar a conta.'), sim('Senha', 'Protege a sua conta.'), nao('CPF'), nao('Endereço residencial'), nao('Telefone'), nao('Foto do documento')] },
  { id: '1-7', nivel: 1, servico: 'Pedido de orçamento para reforma', situacao: 'Você quer receber um orçamento de um pedreiro.',
    dados: [sim('Nome', 'Para o profissional se dirigir a você.'), sim('E-mail ou telefone', 'Para enviar o orçamento.'), sim('Endereço da obra', 'Necessário para estimar o serviço.'), sim('Descrição do serviço', 'Define o que será orçado.'), nao('CPF'), nao('Renda mensal'), nao('Estado civil')] },

  { id: '2-1', nivel: 2, servico: 'Aplicativo de previsão do tempo', situacao: 'Você quer ver a previsão para a sua cidade.',
    dados: [sim('Cidade ou localização aproximada', 'Define de onde mostrar a previsão.'), nao('E-mail', 'O aplicativo funciona sem criar conta.'), nao('Lista de contatos'), nao('Fotos'), nao('Data de nascimento'), nao('Histórico de navegação')] },
  { id: '2-2', nivel: 2, servico: 'Rede social', situacao: 'Você vai criar um perfil em uma rede social.',
    dados: [sim('Nome de usuário'), sim('E-mail', 'Para confirmar a conta e recuperar o acesso.'), sim('Senha'), sim('Data de nascimento', 'Para verificar a idade mínima de uso.'), nao('CPF'), nao('Endereço residencial'), nao('Renda mensal'), nao('Religião')] },
  { id: '2-3', nivel: 2, servico: 'Aplicativo de transporte', situacao: 'Você vai pedir uma corrida.',
    dados: [sim('Local de partida', 'Para o motorista buscar você.'), sim('Destino', 'Para calcular a rota e o preço.'), sim('Forma de pagamento', 'Para cobrar a corrida.'), nao('Lista de contatos'), nao('Fotos da galeria'), nao('Conversas de outros aplicativos'), nao('Renda mensal')] },
  { id: '2-4', nivel: 2, servico: 'Serviço de streaming de vídeo', situacao: 'Você vai assinar um serviço de filmes e séries.',
    dados: [sim('E-mail', 'Para criar e acessar a conta.'), sim('Senha'), sim('Forma de pagamento', 'Para cobrar a assinatura.'), sim('Nome do perfil', 'Para separar as recomendações de cada pessoa.'), nao('Localização em tempo real'), nao('Lista de contatos'), nao('Estado civil'), nao('Escolaridade')] },
  { id: '2-5', nivel: 2, servico: 'Abertura de conta em banco digital', situacao: 'Você vai abrir uma conta corrente pelo aplicativo.',
    dados: [sim('Nome completo', 'Identificação do titular.'), sim('CPF', 'Exigido por lei para abrir contas.'), sim('Data de nascimento', 'Confere a capacidade legal para abrir a conta.'), sim('Endereço residencial', 'Exigido pelas regras de cadastro financeiro.'), sim('Selfie com documento', 'Confirma sua identidade e previne fraudes.'), nao('Religião'), nao('Time de futebol'), nao('Opinião política')] },
  { id: '2-6', nivel: 2, servico: 'Aplicativo de entrega de comida', situacao: 'Você vai pedir comida em casa.',
    dados: [sim('Endereço de entrega'), sim('Telefone', 'Para o entregador falar com você se precisar.'), sim('Forma de pagamento'), sim('Nome', 'Para identificar o pedido e o destinatário.'), nao('Lista de contatos'), nao('Fotos da galeria'), nao('Estado civil')] },
  { id: '2-7', nivel: 2, servico: 'Aplicativo de meditação', situacao: 'Você quer acessar áudios de relaxamento.',
    dados: [sim('E-mail', 'Para criar a sua conta.'), sim('Senha'), nao('Lista de contatos'), nao('Localização em tempo real'), nao('CPF'), nao('Fotos da galeria'), nao('Microfone')] },

  { id: '3-1', nivel: 3, servico: 'Livro físico em loja online', situacao: 'Você vai comprar um livro para receber em casa.',
    dados: [sim('Nome', 'Identifica o destinatário da entrega.'), sim('Endereço de entrega', 'Para enviar o pedido.'), sim('CPF', 'Usado na nota fiscal da compra.'), sim('E-mail', 'Para a confirmação do pedido e o acompanhamento.'), sim('Dados do cartão', 'Para processar o pagamento.'), nao('Data de nascimento'), nao('Estado civil'), nao('Renda mensal')] },
  { id: '3-2', nivel: 3, servico: 'Ingresso digital para um show', situacao: 'Você vai comprar um ingresso que chega por e-mail.',
    dados: [sim('E-mail', 'É por onde o ingresso é enviado.'), sim('Dados do cartão', 'Para processar o pagamento.'), sim('CPF', 'Para a nota fiscal e o ingresso nominal.'), nao('Endereço de entrega', 'O ingresso é digital, não há envio físico.'), nao('Data de nascimento'), nao('Time de futebol'), nao('Estado civil')] },
  { id: '3-3', nivel: 3, servico: 'Compra com retirada na loja', situacao: 'Você vai pagar online e buscar o pedido na loja.',
    dados: [sim('Nome', 'Para identificar quem vai retirar.'), sim('E-mail', 'Para avisar que o pedido está pronto.'), sim('Dados do cartão', 'Para o pagamento online.'), sim('CPF', 'Para a nota fiscal.'), nao('Endereço residencial', 'Não há entrega em casa.'), nao('Data de nascimento'), nao('Estado civil')] },
  { id: '3-4', nivel: 3, servico: 'Pagamento por Pix em loja online', situacao: 'Você vai pagar com Pix e receber o produto em casa.',
    dados: [sim('Nome'), sim('CPF', 'Para a nota fiscal.'), sim('E-mail', 'Para o QR code e o comprovante.'), sim('Endereço de entrega'), nao('Número do cartão', 'Você está pagando com Pix, não com cartão.'), nao('Código de segurança (CVV)', 'Pertence ao cartão, que não é usado no Pix.'), nao('Senha do aplicativo do banco', 'Nenhuma loja deve pedir a senha do seu banco.'), nao('Data de nascimento')] },
  { id: '3-5', nivel: 3, servico: 'Entrega em apartamento', situacao: 'Você vai receber uma compra em um prédio.',
    dados: [sim('Endereço de entrega'), sim('Complemento (bloco e apartamento)', 'Para o entregador achar a unidade.'), sim('Telefone', 'Para o entregador contatar você.'), sim('Nome do destinatário'), nao('Fotos da fachada do prédio'), nao('Horários em que a casa fica vazia', 'Esse dado expõe você a riscos e não ajuda na entrega.'), nao('Nome da mãe')] },
  { id: '3-6', nivel: 3, servico: 'Assinatura mensal de caixa de café', situacao: 'Você vai assinar uma caixa que chega todo mês.',
    dados: [sim('Nome'), sim('Endereço de entrega'), sim('Dados do cartão', 'Para a cobrança mensal.'), sim('Tipo de moagem preferido', 'Define o produto enviado.'), nao('Renda mensal'), nao('Escolaridade'), nao('Religião')] },
  { id: '3-7', nivel: 3, servico: 'Passagem de ônibus intermunicipal', situacao: 'Você vai comprar uma passagem online.',
    dados: [sim('Nome completo', 'O bilhete é nominal.'), sim('Número do documento', 'A identificação do passageiro é exigida no embarque.'), sim('E-mail', 'Para receber o bilhete.'), sim('Forma de pagamento'), nao('Endereço residencial'), nao('Estado civil'), nao('Renda mensal')] },

  { id: '4-1', nivel: 4, servico: 'Aplicativo de navegação (GPS)', situacao: 'Você quer chegar a um endereço de carro.',
    dados: [sim('Localização', 'Sem ela não há como traçar a rota a partir de onde você está.'), nao('Contatos'), nao('Câmera'), nao('Histórico de ligações'), nao('Fotos'), nao('Calendário')] },
  { id: '4-2', nivel: 4, servico: 'Scanner de documentos', situacao: 'Você quer digitalizar papéis com o celular.',
    dados: [sim('Câmera', 'É preciso fotografar o documento.'), nao('Localização'), nao('Contatos'), nao('Microfone'), nao('Histórico de ligações'), nao('Calendário')] },
  { id: '4-3', nivel: 4, servico: 'Aplicativo de chamadas de vídeo', situacao: 'Você vai fazer uma chamada de vídeo com amigos.',
    dados: [sim('Câmera', 'Para enviar a sua imagem.'), sim('Microfone', 'Para enviar a sua voz.'), nao('Localização'), nao('Mensagens SMS'), nao('Calendário'), nao('Fotos')] },
  { id: '4-4', nivel: 4, servico: 'Gravador de voz', situacao: 'Você quer gravar memorandos de áudio.',
    dados: [sim('Microfone', 'É a função principal do aplicativo.'), nao('Câmera'), nao('Localização'), nao('Contatos'), nao('Calendário'), nao('Mensagens SMS')] },
  { id: '4-5', nivel: 4, servico: 'Aplicativo de corrida', situacao: 'Você quer registrar a rota e o ritmo dos seus treinos.',
    dados: [sim('Localização durante o treino', 'Para desenhar a rota e medir a distância.'), sim('Sensores de atividade física', 'Contam passos e ritmo.'), nao('Contatos'), nao('Microfone'), nao('Mensagens SMS'), nao('Fotos'), nao('Histórico de ligações')] },
  { id: '4-6', nivel: 4, servico: 'Editor de fotos', situacao: 'Você quer retocar fotos que já estão no celular.',
    dados: [sim('Acesso às fotos que você escolher', 'Para abrir e editar as imagens.'), nao('Microfone'), nao('Contatos'), nao('Localização'), nao('Mensagens SMS')] },
  { id: '4-7', nivel: 4, servico: 'Leitor de QR code', situacao: 'Você quer ler QR codes de cardápios e ingressos.',
    dados: [sim('Câmera', 'É preciso enquadrar o código.'), nao('Localização'), nao('Contatos'), nao('Microfone'), nao('Calendário'), nao('Fotos')] },
  { id: '4-8', nivel: 4, servico: 'Aplicativo de agenda e lembretes', situacao: 'Você quer organizar compromissos e ser avisado na hora.',
    dados: [sim('Calendário', 'Para ler e criar compromissos.'), sim('Notificações', 'Para avisar na hora do lembrete.'), nao('Câmera'), nao('Microfone'), nao('Localização'), nao('Contatos'), nao('Mensagens SMS')] },

  { id: '5-1', nivel: 5, servico: 'Agendamento de consulta em clínica', situacao: 'Você vai marcar uma consulta pelo site.',
    dados: [sim('Nome'), sim('Telefone', 'Para confirmar a consulta.'), sim('Plano de saúde', 'Para verificar a cobertura.'), sim('Especialidade desejada', 'Define o médico e o horário.'), nao('Religião', 'Dado sensível sem relação com o agendamento.'), nao('Orientação sexual', 'Dado sensível sem relação com o agendamento.'), nao('Origem étnica', 'Dado sensível sem relação com o agendamento.')] },
  { id: '5-2', nivel: 5, servico: 'Loja de roupas online', situacao: 'Você vai comprar uma camisa e receber em casa.',
    dados: [sim('Nome'), sim('Endereço de entrega'), sim('Tamanho', 'Define o produto enviado.'), sim('E-mail'), nao('Impressão digital', 'Dado biométrico sensível, sem relação com a compra.'), nao('Histórico médico', 'Dado de saúde sensível, sem relação com a compra.'), nao('Filiação a sindicato', 'Dado sensível sem relação com a compra.'), nao('Opinião política', 'Dado sensível sem relação com a compra.')] },
  { id: '5-3', nivel: 5, servico: 'Matrícula em academia', situacao: 'Você vai se matricular em uma academia.',
    dados: [sim('Nome'), sim('Contato de emergência', 'Permite avisar alguém em caso de problema durante o treino.'), sim('Condições de saúde relevantes para o treino', 'Dado sensível justificado: protege a sua segurança durante os exercícios.'), nao('Religião', 'Dado sensível sem relação com o treino.'), nao('Orientação sexual', 'Dado sensível sem relação com o treino.'), nao('Opinião política', 'Dado sensível sem relação com o treino.'), nao('Renda mensal')] },
  { id: '5-4', nivel: 5, servico: 'Processo seletivo de uma empresa', situacao: 'Você vai enviar a sua candidatura a uma vaga.',
    dados: [sim('Nome'), sim('Contato', 'Para a empresa retornar o resultado.'), sim('Experiência profissional', 'Avalia a adequação à vaga.'), sim('Formação', 'Avalia a adequação à vaga.'), nao('Religião', 'Pode gerar discriminação e não avalia a capacidade para o cargo.'), nao('Orientação sexual', 'Pode gerar discriminação e não avalia a capacidade para o cargo.'), nao('Intenção de ter filhos', 'Pergunta que pode gerar discriminação e não avalia a capacidade para o cargo.'), nao('Opinião política', 'Pode gerar discriminação e não avalia a capacidade para o cargo.'), nao('Filiação a sindicato', 'Pode gerar discriminação e não avalia a capacidade para o cargo.')] },
  { id: '5-5', nivel: 5, servico: 'Admissão de um novo funcionário', situacao: 'Você foi contratado e vai enviar documentos ao RH.',
    dados: [sim('Exame admissional de saúde', 'Dado sensível exigido por lei para a admissão.'), sim('CPF', 'Exigido para o registro e as obrigações trabalhistas.'), sim('Dados bancários', 'Para depositar o salário.'), sim('Nome completo'), nao('Opinião política', 'Dado sensível sem relação com o contrato.'), nao('Religião', 'Dado sensível sem relação com o contrato.'), nao('Orientação sexual', 'Dado sensível sem relação com o contrato.')] },
  { id: '5-6', nivel: 5, servico: 'Aplicativo de ciclo menstrual', situacao: 'Você vai registrar o seu ciclo para ter previsões.',
    dados: [sim('Datas do ciclo', 'É a finalidade principal do aplicativo.'), sim('Sintomas que você escolher registrar', 'Melhoram as previsões, com o seu consentimento.'), sim('E-mail', 'Para criar a conta.'), nao('Localização em tempo real'), nao('Lista de contatos'), nao('Envio dos dados de saúde a anunciantes', 'Dados de saúde não devem ser usados para publicidade.')] },
  { id: '5-7', nivel: 5, servico: 'Matrícula em uma escola', situacao: 'Você vai matricular uma criança.',
    dados: [sim('Nome do aluno'), sim('Data de nascimento do aluno', 'Define a série e a turma.'), sim('Nome e contato do responsável', 'Para avisos e emergências.'), sim('Alergias e condições de saúde relevantes', 'Dado sensível justificado: cuidado com a saúde da criança na escola.'), nao('Religião da família', 'Dado sensível sem relação com a matrícula.'), nao('Opinião política dos pais', 'Dado sensível sem relação com a matrícula.'), nao('Orientação sexual', 'Dado sensível sem relação com a matrícula.'), nao('Origem étnica', 'Dado sensível sem relação com a matrícula.')] },

  { id: '6-1', nivel: 6, servico: 'Telemedicina: consulta por vídeo', situacao: 'Você planeja o cadastro de um serviço de consultas médicas por vídeo.',
    dados: [sim('Nome completo', 'Identifica o paciente.'), sim('CPF', 'Identificação do paciente e emissão de receitas.'), sim('Data de nascimento', 'Necessária para o atendimento e a prescrição.'), sim('Sintomas e motivo da consulta', 'Dado sensível justificado pela finalidade do atendimento.'), sim('Alergias e medicamentos em uso', 'Dado sensível justificado: evita prescrições perigosas.'), sim('Dados do cartão', 'Para cobrar a consulta.'),
      nao('Gravação em vídeo da consulta', 'Gravar sem necessidade nem consentimento é desproporcional.'), nao('Localização em tempo real'), nao('Lista de contatos'), nao('Renda mensal')] },
  { id: '6-2', nivel: 6, servico: 'Coworking: reserva de salas', situacao: 'Você planeja o app de um espaço de trabalho compartilhado.',
    dados: [sim('Nome', 'Identifica quem reservou.'), sim('E-mail', 'Para confirmar as reservas.'), sim('Sala e horário desejados', 'É o objeto da reserva.'), sim('Forma de pagamento', 'Para cobrar o uso.'),
      nao('Biometria facial', 'Desproporcional: um código ou QR basta para entrar.'), nao('Histórico de navegação'), nao('Localização contínua'), nao('Renda mensal'), nao('Estado civil'), nao('Religião')] },
  { id: '6-3', nivel: 6, servico: 'Plataforma de cursos com certificado', situacao: 'Você planeja o cadastro de uma plataforma de cursos online.',
    dados: [sim('Nome completo', 'Para constar no certificado.'), sim('E-mail', 'Para criar a conta.'), sim('Senha'), sim('Progresso nas aulas', 'Permite retomar de onde parou e liberar o certificado.'), sim('Notas das provas', 'Necessárias para aprovação no curso.'),
      nao('Gravação contínua da webcam', 'Desproporcional para um curso livre.'), nao('Localização em tempo real'), nao('Lista de contatos'), nao('Renda familiar'), nao('Estado civil')] },
  { id: '6-4', nivel: 6, servico: 'Aplicativo de portaria de condomínio', situacao: 'Você planeja o controle de visitantes de um prédio.',
    dados: [sim('Nome do morador'), sim('Unidade (apartamento)', 'Indica quem autorizou a visita.'), sim('Nome do visitante', 'Registro de quem entrou.'), sim('Documento do visitante', 'Identificação para a segurança do prédio, guardada só pelo tempo necessário.'), sim('Horário de entrada e saída', 'Controle de acesso.'),
      nao('Renda do morador'), nao('Contatos do celular do morador'), nao('Religião'), nao('Localização contínua do morador'), nao('Histórico de compras do morador')] },
  { id: '6-5', nivel: 6, servico: 'Programa de fidelidade de supermercado', situacao: 'Você planeja o cadastro de um clube de pontos.',
    dados: [sim('Nome', 'Identifica o cliente.'), sim('CPF', 'Associa as compras ao cliente para acumular pontos.'), sim('E-mail', 'Para enviar extrato e ofertas, com consentimento.'), sim('Histórico de compras no programa', 'É a base do cálculo dos pontos.'),
      nao('Perfil de saúde deduzido das compras', 'Inferir dados sensíveis a partir de compras é desproporcional.'), nao('Localização contínua'), nao('Renda mensal'), nao('Estado civil'), nao('Religião'), nao('Opinião política')] },
  { id: '6-6', nivel: 6, servico: 'Aplicativo de treino e saúde', situacao: 'Você planeja um app que acompanha treinos e metas de corrida.',
    dados: [sim('Idade', 'Para calibrar metas e zonas de esforço.'), sim('Peso', 'Para estimar gasto de energia, com consentimento.'), sim('Rota do treino (GPS durante o treino)', 'Registra o percurso da atividade.'), sim('Frequência cardíaca durante o treino', 'Dado sensível justificado pela finalidade do app, se você usar o sensor.'),
      nao('Localização 24 horas por dia', 'O app só precisa saber onde você está durante o treino.'), nao('Lista de contatos'), nao('Renda mensal'), nao('Origem étnica'), nao('Microfone'), nao('Galeria de fotos')] },
  { id: '6-7', nivel: 6, servico: 'Caronas entre colegas de trabalho', situacao: 'Você planeja um app de caronas corporativas.',
    dados: [sim('Nome'), sim('E-mail corporativo', 'Confirma que a pessoa é da empresa.'), sim('Ponto de encontro', 'Define onde a carona começa.'), sim('Horário desejado', 'Combina as caronas compatíveis.'), sim('Telefone para contato', 'Para combinar detalhes na hora.'),
      nao('Endereço residencial completo', 'Um ponto de encontro basta; o endereço exato expõe o morador.'), nao('Histórico de localização do mês'), nao('Lista de contatos'), nao('Renda mensal'), nao('Estado civil')] },
  { id: '6-8', nivel: 6, servico: 'Agendamento em salão de beleza', situacao: 'Você planeja o cadastro de um salão que atende por aplicativo.',
    dados: [sim('Nome'), sim('Telefone', 'Para confirmar ou remarcar.'), sim('Serviço e horário desejados', 'É o objeto do agendamento.'), sim('Alergias a produtos', 'Dado sensível justificado: evita reações durante o serviço.'),
      nao('CPF'), nao('Foto do rosto', 'Desproporcional para agendar um horário.'), nao('Dados do cartão guardados', 'Desnecessário se o pagamento é feito no local.'), nao('Renda mensal'), nao('Estado civil'), nao('Lista de contatos')] },
];

export function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function prepararCenario(cenario: Cenario): CenarioPreparado {
  return { cenario, ordem: embaralhar(cenario.dados.map((_, i) => i)) };
}

export function sortearNivel(nivel: number): CenarioPreparado[] {
  return embaralhar(CENARIOS.filter((c) => c.nivel === nivel))
    .slice(0, CENARIOS_POR_NIVEL)
    .map(prepararCenario);
}

export function proximoCenarioInfinito(indice: number, usados: string[]): CenarioPreparado {
  const alvo = nivelInfinito(indice);
  const nivel = Math.random() < 0.6 ? alvo : 1 + Math.floor(Math.random() * alvo);
  let candidatos = CENARIOS.filter((c) => c.nivel === nivel && !usados.includes(c.id));
  if (candidatos.length === 0) candidatos = CENARIOS.filter((c) => !usados.includes(c.id));
  if (candidatos.length === 0) candidatos = CENARIOS.filter((c) => c.nivel === nivel);
  return prepararCenario(candidatos[Math.floor(Math.random() * candidatos.length)]);
}

export function avaliar(cenario: Cenario, selecionados: number[]): Avaliacao {
  let corretos = 0;
  let excessos = 0;
  let faltas = 0;
  cenario.dados.forEach((dado, i) => {
    const marcado = selecionados.includes(i);
    if (marcado === dado.necessario) corretos++;
    else if (marcado) excessos++;
    else faltas++;
  });
  const total = cenario.dados.length;
  return { corretos, excessos, faltas, total, precisao: corretos / total, perfeita: corretos === total };
}

export function pontosDaRodada(av: Avaliacao, sequenciaPerfeitas: number): number {
  const base = Math.max(0, Math.round(av.precisao * 10) - av.excessos);
  return base + (av.perfeita ? 5 + Math.min(sequenciaPerfeitas, 5) * 2 : 0);
}
