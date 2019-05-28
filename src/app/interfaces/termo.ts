export enum TermoTipo {
    aditivo = 1,
    contratoMaeFornecedor = 2,
    contratoMaeEstabelecimento = 3,
}

export interface ITermo {
    id: number;
    titulo: string;
    texto: string;
    tipo: TermoTipo;
}
