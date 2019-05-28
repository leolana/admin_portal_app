import { Component, OnInit, Input } from '@angular/core';
import { CredenciamentoService } from '../credenciamento.service';
import { MaxUploadSize } from 'src/app/interfaces/credenciamento';
import { NotificationService } from 'src/app/core/notification/notification.service';

@Component({
  selector: 'alpe-credenciamento-status-analise-documentos',
  templateUrl: './credenciamento-status-analise-documentos.component.html',
  styleUrls: ['./credenciamento-status-analise-documentos.component.css'],
})
export class CredenciamentoStatusAnaliseDocumentosComponent implements OnInit {
  constructor(
    private credenciamentoService: CredenciamentoService,
    private notificationService: NotificationService,
  ) {}

  @Input() dados: any[];
  @Input() resumoId: any;
  documentos: any[];

  formatarNomeArquivo(arquivo) {
    if (!arquivo) {
      return arquivo;
    }

    return arquivo.substring(arquivo.lastIndexOf('/') + 1, arquivo.length);
  }

  ngOnInit(): void {
    this.documentos = this.dados
      .filter(d => d.tipo === 'analise')
      .map(documento => {
        return {
          id: documento.id,
          tipo: 'analises',
          arquivo: documento.arquivo,
          nomeArquivo: this.formatarNomeArquivo(documento.arquivo),
          observacao: documento.observacao,
          editando: false,
          invalid: false,
          dirty: false,
        };
      });
  }

  bindFile(event, documento) {
    const file = event.target.files[0];
    documento.arquivo = file;
    documento.nomeArquivo = file.name;
  }

  habilitarEdicao(documento): void {
    documento.editando = true;
  }

  cancelar(documento): void {
    documento.editando = false;
    this.documentos = this.documentos.filter(d => d.id);
  }

  salvarDocumento(documento): void {
    if (documento.observacao === '' || documento.arquivo === '') {
      documento.invalid = true;
      documento.dirty = true;
      return;
    }

    if (documento.arquivo.size > MaxUploadSize) {
      const megaBytes = Math.floor(MaxUploadSize / (1024 * 1024));
      const message = `O arquivo selecionado ultrapassa o tamanho máximo de ${megaBytes}MB`;
      this.notificationService.showErrorMessage(message);
      return;
    }

    this.credenciamentoService
      .uploadDocumentoAnalise(this.resumoId, documento)
      .subscribe((analises: any) => {
        this.documentos = analises.map(a => ({
          id: a.id,
          tipo: 'analises',
          arquivo: a.arquivo,
          nomeArquivo: this.formatarNomeArquivo(a.arquivo),
          observacao: a.observacao,
          editando: false,
          invalid: false,
          dirty: false,
        }));
      });
  }

  adicionar(): void {
    if (this.documentos.filter(d => d.editando).length) {
      return;
    }

    const novoDocumento = {
      tipo: 'analises',
      arquivo: '',
      nomeArquivo: '',
      observacao: '',
      invalid: true,
      dirty: false,
    };

    this.documentos.push(novoDocumento);
    this.habilitarEdicao(novoDocumento);
  }

  download(tipo, arquivo, file, indice = null) {
    const patternParaRemoverPontosTracos = /[\./-]/g;

    const partes = arquivo.split('/');
    const doc = partes[2] && partes[2].replace(patternParaRemoverPontosTracos, '');

    this.credenciamentoService.download('credenciamento', doc, tipo, indice, file);
  }

  downloadAll() {
    this.documentos.forEach((item, index) => {
      this.download(item.tipo, item.arquivo, item.nomeArquivo, index);
    });
  }
}
