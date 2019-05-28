export interface IRecebivel {
    selecionado?: boolean;
    autorizacao?: any;
    dataVenda?: Date;
    valorVenda?: number;
    dataAntecipacao?: Date;
    dataPagamento?: Date;
    diasAntecipacao?: number;
    valorPagar?: number;
    taxaAntecipacao?: number;
    descontoAntecipacao?: number;
    valorAntecipado?: number;
    bandeiraId?: number;
    bandeira?: any;
    eventoId?: number;
    evento?: any;
    parcelaAtual?: number;
    qtdeParcelas?: number;
    rowId: string;
    valorParcela: number;
    valorDescontoMdr: number;
    nsu: string;
}
