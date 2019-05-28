import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CredenciamentoService } from '../credenciamento.service';
import { TiposPessoa } from '../../interfaces';
import { CredenciamentoStatus } from '../../interfaces/credenciamento';
import {
  Status,
  StatusDescricao,
  IIndicacao,
  IParametrosPesquisa,
} from '../../interfaces/participante/indicacao';
import { NotificationService } from '../../core/notification/notification.service';
import { PromptService } from 'src/app/core/prompt/prompt.service';
import { ModalCancelamentoComponent } from '../../core/components/modal-cancelamento/modal-cancelamento.component';
import { recusaTipoEnum } from '../../core/components/modal-cancelamento/recusa-tipo.enum';
import { tipoCanalEntrada } from 'src/app/interfaces/participante';

@Component({
  templateUrl: './prospectar.component.html',
  styleUrls: ['./prospectar.component.css'],
})
export class CredenciamentoProspectarComponent implements OnInit {
  indicacaoStatus = Status;
  indicacaoStatusDescricao = StatusDescricao;
  tiposPessoaDescricao = TiposPessoa.descricoes;
  tiposPessoaUrl = TiposPessoa.urls;
  credeciamentoStatusDescricao = CredenciamentoStatus.descricoes;
  tipoCanalEntrada = tipoCanalEntrada.idText;

  constructor(
    private service: CredenciamentoService,
    private notification: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private prompt: PromptService,
  ) {}

  @ViewChild('modalReprovar') modalReprovar: ModalCancelamentoComponent;

  data: IIndicacao[] = null;

  // CONTROLS
  de = new FormControl('');
  ate = new FormControl('');
  status = new FormControl('');
  canalEntrada = new FormControl(tipoCanalEntrada.indicaoPorFornecedor);
  documento = new FormControl('');

  formPesquisa = new FormGroup({
    de: this.de,
    ate: this.ate,
    canalEntrada: this.canalEntrada,
    status: this.status,
    documento: this.documento,
  });

  hasError = {
    de: () => {
      if (new Date(this.de.value) > new Date(this.ate.value)) {
        return 'Range de datas inválidas';
      }
    },
    ate: () => {
      if (new Date(this.de.value) > new Date(this.ate.value)) {
        return 'Range de datas inválidas';
      }
    },
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe(query => {
      if (query.documento) this.documento.setValue(query.documento);
      if (query.canalEntrada) this.canalEntrada.setValue(query.canalEntrada);
      if (query.status) this.status.setValue(query.status);
      if (query.dataInicioSolicitacao) this.de.setValue(new Date(query.dataInicioSolicitacao));
      if (query.dataFimSolicitacao) this.ate.setValue(new Date(query.dataFimSolicitacao));

      this.search();
    });
  }

  search() {
    const errors = Object.keys(this.hasError)
      .map(key => (this.formPesquisa.controls[key].markAsDirty(), this.hasError[key]()))
      .filter(error => error);

    if (errors.length) {
      errors.forEach(e => this.notification.showErrorMessage(e));
      return;
    }

    const parameters: IParametrosPesquisa = {};

    if (this.de.value) {
      parameters.dataInicioSolicitacao = this.de.value.toJSON();
    }

    if (this.ate.value) {
      parameters.dataFimSolicitacao = this.ate.value.toJSON();
    }

    if (this.status.value > 0) {
      parameters.status = this.status.value;
    }

    if (this.canalEntrada.value > 0) {
      parameters.canalEntrada = this.canalEntrada.value;
    }

    if (this.documento.value) {
      parameters.documento = this.documento.value;
    }

    this.router.navigate([], {
      queryParams: parameters,
      replaceUrl: true,
    });

    this.service.pesquisarIndicacoes(parameters).subscribe(data => {
      this.data = data;
    });
  }

  clear() {
    this.formPesquisa.reset();
    this.search();
  }

  credenciar(data: IIndicacao) {
    const dados = sessionStorage.getItem('dadosCadastrais');
    const edicao = sessionStorage.getItem('credenciamentoEdicao');

    const validate =
      dados && dados.length > 0
        ? this.prompt.confirm(
            `Existe um${
              edicao ? 'a edição' : ' cadastro'
            } de credenciamento em andamento e os dados serão perdidos.
                Deseja prosseguir com o cadastro da indicação?`,
            'Credeciamento',
          )
        : Promise.resolve(true);

    validate.then(yes => {
      if (yes) {
        const registryData = {
          documento: data.documento,
          telefone: data.telefone,
          nome: data.nome,
          tipo: 'Estabelecimento',
          ehFornecedor: false,
          ehEstabelecimento: true,
        };

        const contact = {
          emailContato: data.email,
        };

        this.service.reset();

        sessionStorage.setItem('dadosCadastrais', JSON.stringify(registryData));
        sessionStorage.setItem('contato', JSON.stringify(contact));

        this.router.navigate([`credenciamento/${this.tiposPessoaUrl[data.tipoPessoa]}`]);
      }
    });
  }

  cancelar(item: IIndicacao) {
    this.modalReprovar.open(recusaTipoEnum.cad_estabelecimento, item);
  }

  reprovar(obj: { item: IIndicacao; value: any }) {
    this.service
      .cancelarIndicacao(obj.item.id, obj.value.motivoTipoRecusaId, obj.value.observacao)
      .subscribe(() => {
        this.notification.showSuccessMessage('Indicação cancelada.');
        this.search();
        this.modalReprovar.close();
      });
  }

  detalhe(data: IIndicacao) {
    this.service.pesquisarCredenciamentoIndicacao(data.documento).subscribe(arr => {
      this.router.navigate([`credenciamento/${arr.id}`]);
    });
  }

  buttonVisible(data: IIndicacao) {
    return (
      data.canalEntrada !== tipoCanalEntrada.indicaoPorFornecedor ||
      data.status !== this.indicacaoStatus.pendente ||
      data.credenciamentoStatus
    );
  }
}
