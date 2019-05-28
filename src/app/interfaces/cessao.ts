import { IParticipante, IVinculo, IFornecedor } from './participante';

export interface ICessao {
  id?: number;
  vinculoId?: number;
  tipo?: number;
  tipoCessao?: number;
  tipoDiluicaoPagamento?: number;
  valor?: number;
  valorDisponivel?: number;
  dataVencimento?: Date;
  dataExpiracao?: Date;
  dataFinalVigencia?: Date;
  valorMaximoRecorrente?: number;
  referencia?: string;

  fornecedor?: IFornecedor;
  estabelecimento?: IParticipante;
  vinculo?: IVinculo;
}

export const CessaoStatus = {
  aguardandoAprovacao: 1,
  aprovado: 2,
  recusado: 3,
  falha: 4,
  expirada: 5,

  descricoes: {
    1: 'Pendente',
    2: 'Aprovada',
    3: 'Recusada',
    4: 'Falha',
    5: 'Expirada',
  },
};

export const CessaoOperacoes = {
  cessaoDefault: 1,
  cessaoRecorrente: 2,
  cessaoParcelada: 3,

  descricoes: {
    1: 'Recebimento único',
    2: 'Recebimento mensal automático',
    3: 'Recebimento parcelado',
  },
  descricoesEC: {
    1: 'Pagamento único',
    2: 'Pagamento mensal automático',
    3: 'Pagamento parcelado',
  },
};

export const CessaoPagamentos = {
  diaVencimento: 0,
  seteDias: 7,
  quatorzeDias: 14,
  vinteumDias: 21,

  descricoes: {
    0: 'Sem diluição',
    7: 'Diluição em até 7 dias',
    14: 'Diluição em até 14 dias',
    21: 'Diluição em até 21 dias',
  },
};
