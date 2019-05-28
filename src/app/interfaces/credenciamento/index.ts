import { IParticipante, IBandeira } from '../participante';

export const MaxUploadSize = 20971520; // 20 MB

export const TiposCaptura = {
  aluguel: 1,
  venda: 2,

  descricoes: {
    1: 'Aluguel',
    2: 'Venda',
  },
};

export const CredenciamentoStatus = {
  pendente: 1,
  emAnalise: 2,
  aprovado: 3,
  reprovado: 4,

  descricoes: {
    1: 'Pendente',
    2: 'Em Análise',
    3: 'Aprovado',
    4: 'Reprovado',
  },
};

export const CredenciamentoSteps = {
  captura: 'captura',
  condicoesComerciais: 'condicoes-comerciais',
  dadosCadastrais: '',
  dadosInstalacao: 'dados-instalacao',
  dadosSocietarios: 'dados-societarios',
  documentos: 'documentos',
  domicilioBancario: 'domicilio-bancario',
};

export const CredenciamentoNumeroSteps = {
  dadosCadastrais: 0,
  dadosSocietarios: 1,
  dadosInstalacao: 2,
  domicilioBancario: 3,
  captura: 4,
  documentos: 5,
  condicoesComerciais: 6,
};

export const Horarios = {
  horarioComercial: 1,
  h24horas: 2,
  manha: 3,
  tarde: 4,
  noite: 5,

  descricoes: {
    1: 'Horário Comercial',
    2: '24 Horas',
    3: 'Manhã',
    4: 'Tarde',
    5: 'Noite',
  },
};

export const Wizard = {
  steps: [
    {
      label: 'Cadastro',
      icon: 'fa fa-user',
      class: 'active',
    },
    {
      label: 'Sócios',
      icon: 'fa fa-users',
      class: '',
      escondido: true,
    },
    {
      label: 'Instalação',
      icon: 'fa fa-wrench',
      class: '',
    },
    {
      label: 'Dados Bancários',
      icon: 'fa fa-credit-card',
      class: '',
    },
    {
      label: 'Tecnologia',
      icon: 'fa fa-image',
      class: '',
    },
    {
      label: 'Documentos',
      icon: 'fa fa-file',
      class: '',
    },
    {
      label: 'Condições Comerciais',
      icon: 'fa fa-check',
      class: '',
    },
  ],
};

export class Credenciamento {
  constructor(tipoPessoa) {
    this.tipoPessoa = tipoPessoa;
  }

  tipoPessoa: number;
  dadosCadastrais: IParticipante;
  instalacao: IDadosInstalacao;
  captura: ICaptura;
  documentos: IDocumento[];
  condicaoComercial: ICondicaoComercial;

  parseJSONString(): string {
    return JSON.stringify({
      tipoPessoa: this.tipoPessoa,
      instalacao: this.instalacao,
      dadosCadastrais: this.dadosCadastrais,
      captura: this.captura,
      condicaoComercial: this.condicaoComercial,
    });
  }

  reset(): void {
    const props = Object.getOwnPropertyNames(this);
    for (let i = 0; i < props.length; i++) {
      delete this[props[i]];
    }
  }
}

export interface ICaptura {
  capturas: ICapturaItem[];
  url?: string;
}

export interface ICapturaItem {
  id: number;
  quantidade: number;
  valor?: number;
  captura?: {
    id: number
    tipoCaptura?: number
    produto?: IProduto
    valor?: number
  };
}

export interface IProduto {
  id: number;
  nome: string;
}

export interface IDocumento {
  id: string;
  arquivo: any;
}

export interface ICondicaoComercial {
  taxaContratual: ITaxaContratual;
  taxasAdministrativas: ITaxaAdministrativa[];
  taxasDebito: ITaxa[];
  taxaAdesao?: number;
}

export interface ITaxaContratual {
  id: number;
  antecipacao?: number;
  adesao?: number;
  maximoParcelas?: number;
}

export interface ITaxa {
  id: number;
  bandeira?: IBandeira;
  valor?: number;
  idTaxaCredenciamento?: number;
}

export interface ITaxaAdministrativa extends ITaxa {
  prazo?: number;
  coeficiente?: number;
  opcoesParcelamento?: IOpcoesParcelamento;
}

export interface IOpcoesParcelamento {
  minimoParcelas: number;
  maximoParcelas: number;
}

export interface IDadosInstalacao {
  cep: string;
  logradouro: string;
  numero: number;
  complemento: string;
  bairro: string;
  cidade: ICidade;
  pontoReferencia: string;
  dias: number;
  horario: number;
  nome: string;
  email: string;
  telefone: string;
  celular: string;
}

export interface ICidade {
  nome: string;
  estado: string;
}
