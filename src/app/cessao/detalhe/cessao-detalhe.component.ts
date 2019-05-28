import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../core/notification/notification.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { DominioService } from '../../dominio/dominio.service';
import { CessaoService } from './../../cessao/cessao.service';
import { AuthService } from '../../core/auth/auth.service';
import { TermoTipo, ITermo } from '../../interfaces/termo';
import { CessaoStatus } from '../../interfaces/cessao';
import { CessaoOperacoes } from '../../interfaces/cessao';
import { DateTime } from 'luxon';

@Component({
  templateUrl: './cessao-detalhe.component.html',
  styleUrls: ['./cessao-detalhe.component.css'],
})
export class CessaoDetalheComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: CessaoService,
    private dominio: DominioService,
    private authService: AuthService,
    private toastr: NotificationService,
  ) {}

  // PROPERTIES
  cessao: any;

  status = CessaoStatus;
  canApprove: Boolean = false;
  user: any;
  currentDate = DateTime.local().toISO();
  acceptedTerms: Boolean = true;
  termo: ITermo;
  eventosNegativos: any[] = [22, 23, 24, 32, 33, 34];
  eventosPositivos: any[] = [123, 133];
  isNegativo: Boolean = false;

  referencia = new FormControl('', Validators.required);
  dataExpiracao = new FormControl('', Validators.required);

  formDadosCessao = new FormGroup({
    referencia: this.referencia,
    dataExpiracao: this.dataExpiracao,
  });

  id: number;
  operacoes = CessaoOperacoes;

  // METHODS
  ngOnInit(): void {
    this.user = this.authService.user;
    this.canApprove = this.user.participanteEstabelecimento;

    this.id = +this.route.snapshot.paramMap.get('id');

    this.service.obter(this.id).subscribe(cessao => {
      if (this.user.participanteEstabelecimento) {
        this.inverterSinais(cessao);
      }

      this.cessao = cessao;
      this.referencia.setValue(cessao.referencia);
      this.dataExpiracao.setValue(cessao.dataExpiracao);

      if (this.cessao.status === CessaoStatus.aguardandoAprovacao) {
        this.dominio.obterTermoPorTipo(TermoTipo.aditivo).subscribe(termo => {
          this.termo = termo;
        });
      }
    });
  }

  approve(): void {
    this.service
      .aprovar(this.id, this.termo)
      .subscribe(() => this.changeStatusCallback('Cessão aprovada com sucesso!'));
  }

  reject(): void {
    this.service
      .reprovar(this.id, this.termo)
      .subscribe(() => this.changeStatusCallback('Cessão reprovada com sucesso!'));
  }

  changeStatusCallback(message: string): void {
    this.toastr.showSuccessMessage(message);
    this.router.navigateByUrl('/cessoes');
  }

  changeCessao(): void {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const dataExpiracao = this.dataExpiracao.value;
    const dataVencimento = this.cessao.dataVencimento;

    if (dataExpiracao < tomorrow) {
      this.toastr.showErrorMessage('Data de Expiração deve expirar a partir do próximo dia.');
      return;
    }

    if (dataExpiracao >= dataVencimento) {
      this.toastr.showErrorMessage('Data de Vencimento deve ser maior que a Data de Expiração.');
      return;
    }

    Object.assign(this.cessao, this.formDadosCessao.value);

    this.service
      .alterar(this.cessao)
      .subscribe(() => this.toastr.showSuccessMessage('Cessão alterada com sucesso!'));
  }

  voltar(): void {
    this.router.navigateByUrl('/cessoes');
  }

  showReceivables(): boolean {
    const aguardando = this.cessao.status === this.status.aguardandoAprovacao;
    const aprovado = this.cessao.status === this.status.aprovado;
    return aguardando || aprovado;
  }

  getTituloItens(parcela): string {
    if (this.cessao.tipoCessao === this.operacoes.cessaoParcelada) {
      return 'Recebíveis da parcela ' + parcela.numeroParcelaCessao;
    }
    return 'Recebíveis';
  }

  pendente(): boolean {
    if (!this.cessao || !this.status) return false;
    return this.cessao.status === this.status.aguardandoAprovacao;
  }

  aprovado(): boolean {
    if (!this.cessao || !this.status) return false;
    return this.cessao.status === this.status.aprovado;
  }

  recusado(): boolean {
    if (!this.cessao || !this.status) return false;
    return this.cessao.status === this.status.recusado;
  }

  colorTextMoney(totalRecebiveis: number): string {
    return totalRecebiveis === 0 ? '' : totalRecebiveis < 0 ? 'text-red' : 'text-green';
  }

  inverterSinais(cessao: any) {
    cessao.parcelas.forEach(parcela => {
      parcela.total = parcela.total * -1
      ; [...parcela.ajustes, ...parcela.itens].forEach(item => {
        item.total = item.total * -1;
        item.recebiveis.forEach(recebivel => {
          recebivel.valorPagarEc = recebivel.valorPagarEc * -1;
          recebivel.valorVenda = recebivel.valorVenda * -1;
        });
      });
    });
    cessao.totalRecebiveis = cessao.totalRecebiveis * -1;
  }
}
