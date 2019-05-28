import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { CredenciamentoService } from '../credenciamento.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { PromptService } from 'src/app/core/prompt/prompt.service';
import { CredenciamentoStatus } from 'src/app/interfaces/credenciamento';
import { TiposPessoa } from 'src/app/interfaces';
import { AlpeTabs } from 'src/app/core/components/alpe-tabs/alpe-tabs.component';

declare const $: any;

@Component({
  templateUrl: './credenciamento-status.component.html',
})
export class CredenciamentoStatusComponent implements OnInit, AfterViewInit {
  constructor(
    private service: CredenciamentoService,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private prompt: PromptService,
  ) {}

  resumo: any;
  tipoPessoas = TiposPessoa;

  @ViewChild('tabCadastro') tabCadastro: TemplateRef<any>;
  @ViewChild('tabSocios') tabSocios: TemplateRef<any>;
  @ViewChild('tabInstalacao') tabInstalacao: TemplateRef<any>;
  @ViewChild('tabDomicilio') tabDomicilio: TemplateRef<any>;
  @ViewChild('tabDocumentos') tabDocumentos: TemplateRef<any>;
  @ViewChild('tabAnaliseDocumentos') tabAnaliseDocumentos: TemplateRef<any>;
  @ViewChild('tabUsuarios') tabUsuarios: TemplateRef<any>;
  @ViewChild('tabConvites') tabConvites: TemplateRef<any>;

  tabs: AlpeTabs[];

  loaded = {
    resumo: false,
    view: false,
  };

  ngOnInit() {
    this.getResumo(() => {
      this.loaded.resumo = true;
      this.setTabs();
    });
  }

  ngAfterViewInit() {
    this.loaded.view = true;
    this.setTabs();
  }

  setTabs() {
    if (!this.loaded.resumo || !this.loaded.view) {
      return;
    }

    this.tabs = [
      {
        label: 'Resumo',
        template: this.tabCadastro,
        active: true,
      },
    ];

    if (this.resumo.cadastro.tipoPessoa === TiposPessoa.juridica) {
      this.tabs.push({
        label: 'Sócios',
        template: this.tabSocios,
      });
    }

    this.tabs = this.tabs.concat([
      {
        label: 'Instalação',
        template: this.tabInstalacao,
      },
      {
        label: 'Domicílio Bancário',
        template: this.tabDomicilio,
      },
      {
        label: 'Documentos',
        template: this.tabDocumentos,
      },
    ]);

    if (this.resumo.credenciamento.status === CredenciamentoStatus.emAnalise) {
      this.tabs.push({
        label: 'Análise',
        template: this.tabAnaliseDocumentos,
      });
    }

    if (this.resumo.credenciamento.status === CredenciamentoStatus.aprovado) {
      this.tabs.push({
        label: 'Usuários',
        template: this.tabUsuarios,
      });
      this.tabs.push({
        label: 'Convites',
        template: this.tabConvites,
      });
    }
  }

  getResumo(callback) {
    const id = +this.route.snapshot.paramMap.get('id');

    this.service.obterResumo(id).subscribe(res => {
      res.condicoesComerciais.taxasAdministrativas.sort((a: any, b: any) => {
        const prazoA = a.opcoesParcelamento.minimoParcelas;
        const prazoB = b.opcoesParcelamento.minimoParcelas;
        return prazoA - prazoB || a.bandeira.id - b.bandeira.id;
      });

      res.condicoesComerciais.taxasDebito.sort((a: any, b: any) => {
        return a.bandeira.id - b.bandeira.id;
      });

      const convites = [];

      const dadosSocios = res.socios.map((socio: any) => ({
        email: socio.email,
        nome: socio.nome,
        celular: socio.celular || socio.telefone,
      }));

      const dadosConvites = [
        {
          email: res.contato.email,
          nome: res.contato.nome,
          celular: res.contato.celular,
        },
        {
          email: res.instalacao.email,
          nome: res.instalacao.nome,
          celular: res.instalacao.celular,
        },
        ...dadosSocios,
      ];

      const emails = dadosConvites.map(convite => convite.email);
      const emailsNaoDuplicados = new Set(emails);

      emailsNaoDuplicados.forEach(email =>
        convites.push(dadosConvites.find(convite => convite.email === email)),
      );

      this.resumo = $.extend(true, res, {
        cadastro: {
          contato: res.contato,
        },
        convites,
      });

      callback();
    });
  }

  podeIniciarAnalise() {
    return this.resumo.credenciamento.status === CredenciamentoStatus.pendente;
  }

  iniciarAnalise() {
    this.prompt.confirm('Deseja Analisar este Credenciamento?', 'Confirmação').then(yes => {
      if (yes) {
        this.service.analisar(this.resumo.id).subscribe(() => {
          this.notification.showSuccessMessage(`Credenciamento separado para Análise.`);
          this.ngOnInit();
        });
      }
    });
  }

  podeAprovarRecusar() {
    return this.resumo.credenciamento.status === CredenciamentoStatus.emAnalise;
  }

  aprovar() {
    this.prompt.confirm('Deseja Aprovar este Credenciamento?', 'Confirmação').then(yes => {
      if (yes) {
        this.service.aprovar(this.resumo.id).subscribe(() => {
          this.notification.showSuccessMessage('Credenciamento Aprovado!');
          this.ngOnInit();
        });
      }
    });
  }

  recusar() {
    this.prompt.confirm('Deseja Recusar este Credenciamento?', 'Confirmação').then(yes => {
      if (yes) {
        this.service.recusar(this.resumo.id).subscribe(() => {
          this.notification.showSuccessMessage('Credenciamento Recusado!');
          this.ngOnInit();
        });
      }
    });
  }

  estaAprovadoOuRecusado() {
    const current = this.resumo.credenciamento.status;
    return current === CredenciamentoStatus.aprovado || current === CredenciamentoStatus.reprovado;
  }
}
