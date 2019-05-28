export interface Taxa {
  id: number;
  idRamoAtividade: number;
  ramoAtividade: string;
  idTipoPessoa: number;
  inicioVigencia: Date;
  terminoVigencia: Date;
  bandeiras: {
    idBandeira: number
    taxaDebito: number
    faturamentos: {
      idFaturamento: number
      coeficiente: number
    }[]
  }[];
  prazos: {
    prazo: number
    coeficiente: number
  }[];
  prazo33: {
    idBandeira: number
    ranges: {
      minimo: number
      maximo: number
      taxa: number
    }[]
  }[];
}

export interface ItemListagemTaxas {
  id: number;
  idTipoPessoa: number;
  ramoAtividade: string;
  inicioVigencia: Date;
  terminoVigencia: Date;
}

export interface FiltroTaxa {
  idTipoPessoa?: number;
  idRamoAtividade?: number;
  inicioVigencia?: Date;
  terminoVigencia?: Date;
}

export interface Prazo {
  prazo: number;
  disabled: boolean;
}

export interface TaxaRange {
  minimo: number;
  maximo: number;
  descricao: string;
}
