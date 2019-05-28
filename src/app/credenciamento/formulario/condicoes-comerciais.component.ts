import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { zip } from 'rxjs';

import { CredenciamentoNumeroSteps } from '../../interfaces/credenciamento';
import {
  ICondicaoComercial,
  CredenciamentoSteps,
  IOpcoesParcelamento,
} from '../../interfaces/credenciamento';
import { TiposPessoa } from '../../interfaces';

import { CredenciamentoService } from '../credenciamento.service';
import { DominioService } from '../../dominio/dominio.service';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { UsuariosService, VerificacaoUsuarioEnum } from '../../usuarios/usuarios.service';

@Component({
  templateUrl: './condicoes-comerciais.component.html',
  styleUrls: ['../credenciamento.styles.css'],
})
export class CredenciamentoCondicoesComerciaisComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private credenciamentoService: CredenciamentoService,
    private notification: NotificationService,
    private router: Router,
    private dominio: DominioService,
    private usuariosService: UsuariosService,
  ) {}

  // FORM CONTROLS
  opcaoSelecionada = new FormControl(null, Validators.required);
  formOpcaoSelecionada = new FormGroup({ opcaoSelecionada: this.opcaoSelecionada });

  // Somente edição
  tabela = new FormGroup({});
  taxaAntecipacao = new FormControl('', Validators.required);
  formTaxaAntecipacao = new FormGroup({ taxaAntecipacao: this.taxaAntecipacao });
  taxaAdesao = new FormControl('', Validators.required);
  formTaxaAdesao = new FormGroup({ taxaAdesao: this.taxaAdesao });
  taxasPorBandeira = {};

  // PROPERTIES
  tiposPessoa = TiposPessoa;
  tipoPessoa = TiposPessoa.fisica;
  isLoading = false;

  bandeiras = [];

  taxas: any = {
    contratual: {
      adesao: 0,
      antecipacao: 0,
      maximoParcelas: 0,
    },
    debito: [],
    administrativas: [],
    bandeiras: {},
  };

  mobile: boolean;

  edicao = false;
  analise = false;
  steps;
  loaded = false;
  wizardConfig = {
    stepValidation: () => true,
    adjustmentSessionStorage: () => {},
  };

  // METHODS
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.credenciamentoService.verificarCredenciamentoCorrente(params.pessoa);
      this.tipoPessoa = +sessionStorage.getItem('tipoPessoa');
      this.loaded = true;
      this.setSteps();
    });

    if (
      Boolean(sessionStorage.getItem('credenciamentoEdicao')) ||
      Boolean(sessionStorage.getItem('credenciamentoEmAnalise'))
    ) {
      this.getBandeiras().subscribe(() => {
        Boolean(sessionStorage.getItem('credenciamentoEdicao'))
          ? (this.edicao = true)
          : (this.analise = true);
        const condicoes = JSON.parse(sessionStorage.getItem('condicaoComercial'));
        this.preencheTaxasExistentes(condicoes);
      });
    } else {
      zip(this.getBandeiras(), this.getTaxasNovoCredenciamento()).subscribe(
        ([bandeiras, taxas]) => {
          this.taxas = this.montaTaxasPorBandeira(taxas);
          this.taxaAntecipacao.setValue(this.taxas.contratual.antecipacao);
          this.taxaAdesao.setValue(this.taxas.contratual.adesao);
        },
      );
    }
  }
  getBandeiras() {
    return this.dominio.obterBandeiras().pipe(tap(arr => (this.bandeiras = arr)));
  }

  getTaxasNovoCredenciamento() {
    return this.credenciamentoService.obterTaxas();
  }

  montaTaxasPorBandeira(taxas): any {
    taxas.administrativas.sort((a, b) => a.prazo - b.prazo);

    const resultado = {
      contratual: taxas.contratual,
      administrativas: taxas.administrativas,
      debito: taxas.debito,
      bandeiras: {},
    };

    this.bandeiras.forEach(b => {
      resultado.bandeiras[b.id] = {
        debito: null,
        nome: b.text,
        administrativas: {},
      };

      resultado.administrativas.forEach(a => {
        resultado.bandeiras[b.id].administrativas[a.prazo] = [];
      });
    });

    taxas.debito.forEach(d => {
      resultado.bandeiras[d.bandeiraId].debito = d;
    });

    taxas.administrativas.forEach(a => {
      a.valores.forEach(v => {
        resultado.bandeiras[v.bandeiraId].administrativas[a.prazo].push(v);
      });
    });

    // ordenações em adicao:

    // thead
    resultado.administrativas.forEach(bloco => {
      bloco.opcoesParcelamento.sort((x, y) => x.minimoParcelas - y.minimoParcelas);
    });

    // tbody
    Object.keys(resultado.bandeiras).forEach(idBandeira => {
      const taxasBandeira = resultado.bandeiras[idBandeira];

      Object.keys(taxasBandeira.administrativas).forEach(prazo => {
        const taxasPrazo = taxasBandeira.administrativas[prazo];

        taxasPrazo.sort((x, y) => x.minimo - y.minimo);
      });
    });

    return resultado;
  }

  preencheTaxasExistentes(condicoes) {
    this.taxas = {
      contratual: condicoes.taxaContratual,
      debito: condicoes.taxasDebito,
      administrativas: condicoes.taxasAdministrativas,
      prazoTaxaBase: condicoes.prazoTaxaBase,
      prazoTaxaEfetiva: condicoes.taxasAdministrativas[0].prazo,
      opcoesParcelamento: [],
    };

    this.taxas.administrativas.sort(
      (t1, t2) => t1.opcoesParcelamento.minimoParcelas - t2.opcoesParcelamento.minimoParcelas,
    );

    this.taxas.opcoesParcelamento = condicoes.taxasAdministrativas.reduce((acc, c) => {
      if (
        !acc.some(
          r =>
            r.minimoParcelas === c.opcoesParcelamento.minimoParcelas &&
            r.maximoParcelas === c.opcoesParcelamento.maximoParcelas,
        )
      ) {
        acc.push(c.opcoesParcelamento);
      }

      return acc;
    }, []);

    this.taxaAntecipacao.setValue(this.taxas.contratual.antecipacao);
    this.taxaAdesao.setValue(this.taxas.contratual.adesao);

    this.criaControlsTabela();
  }

  criaControlsTabela() {
    this.bandeiras.forEach(b => {
      const debito = this.taxas.debito.find(d => d.bandeira.id === b.id).valor;
      this.tabela.addControl(`b${b.id}deb`, new FormControl(debito, Validators.required));

      this.taxasPorBandeira[b.id] = [];

      this.taxas.administrativas
        .filter(d => d.bandeira.id === b.id)
        .forEach(t => {
          this.taxasPorBandeira[b.id].push(t);

          this.tabela.addControl(
            `b${b.id}tx${t.id}`,
            new FormControl(t.valor - t.coeficiente, Validators.required),
          );
        });
    });
  }

  setSteps() {
    this.steps = JSON.parse(sessionStorage.getItem('wizard'));
    this.steps.forEach((step, i) => {
      if (i === CredenciamentoNumeroSteps.condicoesComerciais) {
        step.url = `/credenciamento/${TiposPessoa.urls[this.tipoPessoa]}/condicoes-comerciais`;
        step.class = 'active';
        step.cursor = 'pointer';
      } else if (i < CredenciamentoNumeroSteps.condicoesComerciais) {
        step.class = 'activated';
      } else {
        step.class = '';
      }
    });
    sessionStorage.setItem('wizard', JSON.stringify(this.steps));
  }

  goBack() {
    this.credenciamentoService.retrocederCredenciamento(CredenciamentoSteps.condicoesComerciais);
  }

  taxaAdministrativa(bandeira, index) {
    const taxa = this.taxasPorBandeira[bandeira][index];
    const valor = this.tabela.controls[`b${bandeira}tx${taxa.id}`].value;

    return valor + taxa.coeficiente;
  }

  formataParcelamento(opcao: IOpcoesParcelamento) {
    return opcao.minimoParcelas === 1 && opcao.maximoParcelas === 1
      ? 'À Vista'
      : opcao.minimoParcelas + ' até ' + opcao.maximoParcelas;
  }

  submitForm() {
    if (!this.edicao && !this.analise && !this.opcaoSelecionada.value) {
      this.notification.showAlertMessage('Você não selecionou uma condição válida.');
      return;
    }

    if (this.edicao && this.taxaAntecipacao.invalid) {
      this.notification.showAlertMessage('Informe uma taxa de antecipação válida.');
      return;
    }

    if (this.taxaAdesao.invalid) {
      this.notification.showAlertMessage('Informe uma taxa de adesão válida.');
      return;
    }

    if (+sessionStorage.getItem('stepsValidationErrors') > 0) {
      this.notification.showAlertMessage('Preencha as informações corretas em todos os passos');
      return;
    }

    this.isLoading = true;

    let condicaoComercial: ICondicaoComercial = null;

    if (this.edicao || this.analise) {
      let error = false;
      const taxasDebito = [];
      const taxasAdministrativas = [];

      this.bandeiras.forEach(b => {
        const debitoId = this.taxas.debito.find(d => d.bandeira.id === b.id).id;
        const debitoControl = this.tabela.controls[`b${b.id}deb`];

        error = error || !!debitoControl.errors;

        taxasDebito.push({ id: debitoId, valor: debitoControl.value });

        this.taxasPorBandeira[b.id].forEach(t => {
          const admControl = this.tabela.controls[`b${b.id}tx${t.id}`];

          error = error || !!admControl.errors;

          taxasAdministrativas.push({
            id: t.id,
            valor: +Number(admControl.value + t.coeficiente).toFixed(2),
          });
        });

        condicaoComercial = {
          taxaContratual: {
            ...this.taxas.contratual,
            antecipacao: +this.taxaAntecipacao.value,
          },
          taxaAdesao: this.taxaAdesao.value,
          taxasDebito: taxasDebito,
          taxasAdministrativas: taxasAdministrativas,
        };
      });

      if (error) {
        this.notification.showAlertMessage('Verifique os campos de taxa antes de prosseguir!');
        this.isLoading = false;
        return;
      }
    } else {
      condicaoComercial = {
        taxaContratual: this.taxas.contratual.id,
        taxaAdesao: this.taxaAdesao.value,
        taxasDebito: this.taxas.debito.map(t => ({ id: t.id, valor: t.valor })),
        taxasAdministrativas: this.taxas.administrativas
          .find(t => t.prazo === this.opcaoSelecionada.value)
          .valores.map(t => ({ id: t.id, valor: t.valor })),
      };
    }
    this.credenciamentoService.enviarCredenciamento(condicaoComercial).subscribe(data => {
      this.notification.showSuccessMessage(
        this.edicao || this.analise
          ? 'Credenciamento modificado com sucesso'
          : 'Credenciamento realizado com sucesso',
      );
      this.isLoading = false;
      this.router.navigate(['credenciamento/pesquisa']);
      this.credenciamentoService.reset();
    });
  }
}
