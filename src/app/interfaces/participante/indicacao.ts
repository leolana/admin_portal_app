import { TiposPessoa } from '../index';

export enum Status {
    pendente = 1,
    aprovado = 2,
    reprovado = 3,
}

const statusDescricao: { [id: number]: string } = {};
statusDescricao[Status.pendente] = 'Pendente';
statusDescricao[Status.aprovado] = 'Aprovado';
statusDescricao[Status.reprovado] = 'Reprovado';

export const StatusDescricao = statusDescricao;

export interface IParametrosPesquisa {
    tipoPessoa?: number;
    documento?: string;
    nome?: string;
    email?: string;
    telefone?: string;
    status?: number;
    dataInicioSolicitacao?: Date;
    dataFimSolicitacao?: Date;
    canalEntrada?: string;
}

export interface IIndicacao {
    id: number;
    nome: string;
    documento: string;
    email: string;
    telefone: string;
    status: Status;
    tipoPessoa?: number;
    solicitanteId: number;
    solicitanteNome: string;
    credenciamentoId: number;
    canalEntrada?: number;
    credenciamentoStatus: number;
    motivo?: string;
    dataFimIndicacao?: Date;
}
