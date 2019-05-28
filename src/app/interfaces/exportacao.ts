export interface IExportacao {
  id: number;
  titulo?: string;
  descricao?: string;
}

export interface IFileResponse {
  filename: string;
  data: any;
}

export interface IVisaoExportacao {
  habilitado: boolean;
}
