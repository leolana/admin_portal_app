import { CnpjFunctions } from './../core/functions/cnpj.functions';
import { CpfFunctions } from './../core/functions/cpf.functions';

export const TiposPessoa = {
  fisica: 1,
  juridica: 2,

  descricoes: {
    1: 'Física',
    2: 'Jurídica',
  },
  urls: {
    1: 'pessoa-fisica',
    2: 'pessoa-juridica',
  },
};

export const VerificaTipoPessoa = documento => {
  return documento.length === 11 ? TiposPessoa.fisica : TiposPessoa.juridica;
};

export const TiposDocumentos = (() => {
  const result = {
    descricoes: {
      1: 'CPF',
      2: 'CNPJ',
    },
    isValidCpf: CpfFunctions.isValid,
    isValidCnpj: CnpjFunctions.isValid,
    isValidCpfCnpj: (documento: string): boolean => {
      return result.isValidCpf(documento) || result.isValidCnpj(documento);
    },
    format: (str: string): string => {
      str = String(str);
      str = CpfFunctions.format(str);
      str = CnpjFunctions.format(str);
      return str;
    },
  };

  return result;
})();

export const AberturaNascimento = {
  descricoes: {
    1: 'Data de Nascimento',
    2: 'Data de Abertura',
  },
};

export const ParticipanteIndicacaoStatus = {
  pendente: 1,
  cadastrado: 2,
  recusado: 3,

  descricoes: {
    1: 'Pendente',
    2: 'Cadastrado',
    3: 'Recusado',
  },
};

export const UsuarioStatus = {
  convidado: 1,
  expirado: 2,
  ativo: 3,
  inativo: 4,

  descricoes: {
    1: 'Convidado',
    2: 'Convite Expirado',
    3: 'Ativo',
    4: 'Inativo',
  },
};

export const ParticipanteStatus = {
  pendente: 1,
  aprovado: 2,
  cancelado: 3,
  reprovado: 4,
  indicacao: 4,

  descricoes: {
    1: 'Pendente',
    2: 'Aprovado',
    3: 'Cancelado',
    4: 'Reprovado',
    5: 'Indicacao',
  },
};

export interface IdText {
  id: any;
  text: string;
}

export const newIdText = (): IdText => ({
  id: 0,
  text: '',
});
