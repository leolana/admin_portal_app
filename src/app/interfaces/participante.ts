export interface IParticipante {
  id?: number;
  nome?: string;
  documento?: string;
  tipo?: 'Fornecedor' | 'Estabelecimento';
  ehFornecedor?: boolean;
  ehEstabelecimento?: boolean;
  tipoPessoa?: number;
  telefone?: string;
  aberturaNascimento?: Date;
  dataAbertura?: Date;
  ramoAtividade?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  uf?: string;
  nomeMae?: string;
  razaoSocial?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  informacoesFinanceiras?: IInformacoesFinanceiras;
  socios?: ISocio[];
  domiciliosBancarios?: IDadosBancarios[];
  contato?: any;
}

export interface IFornecedor extends IParticipante {
  vinculos?: IVinculo[];
}

export interface IEstabelecimento extends IParticipante {
  vinculos?: IVinculo[];
  vlrDispCessao?: number;
}

export type IParticipantes = IFornecedor | IEstabelecimento;

export interface ISocio extends IParticipante {
  telefone: string;
  email: string;
  participacao?: string;
  rg?: string;
  celular: string;
  contato: boolean;
}

export interface IKeyValue<T> {
  id: T;
  text?: string;
}

export interface IInformacoesFinanceiras {
  faturamentoAnual: IKeyValue<number>;
  ticketMedio: IKeyValue<string>;
}

export interface IBandeira extends IKeyValue<number> {}

export interface IDadosBancarios {
  bandeira?: IBandeira;
  banco?: any;
  agencia?: string;
  conta?: number;
  digito?: string;
}

export const VinculoStatus = {
  pendente: 1,
  cancelado: 2,
  aprovado: 3,
  reprovado: 4,
  descricoes: {
    1: 'Pendente',
    2: 'Cancelado',
    3: 'Aprovado',
    4: 'Reprovado',
  },
};

export interface IVinculo {
  id?: number;
  status?: number;
  dataCadastro?: Date;
  exibeValorDisponivel?: Boolean;
  diasAprovacao?: number;
  participante: IParticipante;
  valorDisponivel?: number;
  valorMaximoExibicao?: number;
  estabelecimento?: {
    participante?: IParticipante
  };
  motivoRecusa?: string;
  dataRecusa?: Date;
}

export const participanteTaxaTipo = {
  cessao: 1,
  antecipacao: 2,

  descricoes: {
    1: 'Cessão',
    2: 'Antecipação',
  },
};

export const tipoCanalEntrada = {
  indicaoPorEc: 1,
  indicaoPorFornecedor: 2,
  backoffice: 3,

  descricoes: {
    1: 'Estabelecimento Comercial',
    2: 'Fornecedor',
    3: 'Backoffice',
  },

  idText: [
    { id: 1, text: 'Estabelecimento Comercial' },
    { id: 2, text: 'Fornecedor' },
    { id: 3, text: 'Backoffice' },
  ],
};
