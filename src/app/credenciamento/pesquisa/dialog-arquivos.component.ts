import { Component, ElementRef } from '@angular/core';
import { CredenciamentoService } from '../credenciamento.service';
import { DialogComponent } from '../../core/dialog/dialog.component';

@Component({ templateUrl: './dialog-arquivos.component.html' })
export class CredenciamentoArquivosComponent extends DialogComponent {
  constructor(private element: ElementRef, private credenciamentoService: CredenciamentoService) {
    super(element);
  }

  documento = null;
  fichaCadastro = null;
  identidade = null;
  comprovanteDeResidencia = null;
  contratoSocial = null;
  extratosBancarios = [];

  formatarNomeArquivo(arquivo) {
    if (!arquivo) {
      return arquivo;
    }

    return arquivo.substring(arquivo.lastIndexOf('/') + 1, arquivo.length);
  }

  onInit(options) {
    this.documento = options.documento;

    this.fichaCadastro = this.formatarNomeArquivo(options.arquivos.fichaCadastro);
    this.identidade = this.formatarNomeArquivo(options.arquivos.identidade);
    this.comprovanteDeResidencia = this.formatarNomeArquivo(
      options.arquivos.comprovanteDeResidencia,
    );
    this.contratoSocial = this.formatarNomeArquivo(options.arquivos.contratoSocial);
    this.extratosBancarios = options.arquivos.extratosBancarios.map(this.formatarNomeArquivo);
  }

  download(tipo, indice = null) {
    const doc = this.documento.replace(/[\./-]/g, '');
    let file = this[tipo];

    if (indice != null) {
      file = file[indice];
    }

    this.credenciamentoService.download('credenciamentoProposta', doc, tipo, indice, file);
  }

  downloadAll() {
    this.download('fichaCadastro');

    if (this.identidade) {
      this.download('fichaCadastro');
    }

    if (this.comprovanteDeResidencia) {
      this.download('comprovanteDeResidencia');
    }

    if (this.contratoSocial) {
      this.download('contratoSocial');
    }

    for (let i = 0; i < this.extratosBancarios.length; i++) {
      this.download('extratosBancarios', i);
    }

    this.result();
  }
}
