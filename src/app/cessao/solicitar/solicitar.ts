import { OnInit, Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ICessao, CessaoPagamentos, CessaoOperacoes } from '../../interfaces/cessao';
import { FornecedorService } from '../../fornecedor/fornecedor.service';
import { PromptService } from '../../core/prompt/prompt.service';
import { DocumentoPipe } from '../../pipes/documento.pipe';
import { IVinculo } from '../../interfaces/participante';
import { CessaoService } from '../cessao.service';
import { IdText } from '../../interfaces/index';
import { Observable, zip, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  templateUrl: './solicitar.html',
  styleUrls: ['./solicitar.css'],
})
export class SolicitarCessaoComponent implements OnInit {
  constructor(
    private service: CessaoService,
    private router: Router,
    private prompt: PromptService,
    private fornecedor: FornecedorService,
    private route: ActivatedRoute,
  ) {}

  // PROPERTIES
  mobile: boolean;
  vinculo: any;
  estabelecimento: any;
  operacoes: IdText[];
  pagamentos: IdText[];

  _operacoes = CessaoOperacoes;
  operacaoSelecionada: number;

  subtitle = new Subject<string>();

  // METHODS
  ngOnInit(): void {
    this.solveLayout();

    const idVinculo = +this.route.snapshot.paramMap.get('idVinculo');
    this.fornecedor.obterVinculo(idVinculo).subscribe(vinculo => {
      this.vinculo = vinculo;
      this.estabelecimento = vinculo.estabelecimento.participante;

      const nome = this.estabelecimento.nome;
      const documento = this.estabelecimento.documento;
      const documentoFormatado = new DocumentoPipe().transform(documento);

      const subtitle = nome + ' - ' + documentoFormatado;
      this.subtitle.next(subtitle);
    });

    this.getOperacoes().subscribe();
    this.getPagamentos().subscribe();
  }

  getOperacoes() {
    return this.service.getOperacoes().pipe(tap(arr => (this.operacoes = arr)));
  }

  getPagamentos() {
    return this.service.getPagamentos().pipe(tap(arr => (this.pagamentos = arr)));
  }

  filter(value) {
    this.operacaoSelecionada = value;
  }

  resetFilter(): void {
    this.operacaoSelecionada = null;
  }

  voltar(): void {
    this.router.navigateByUrl('/fornecedor/estabelecimentos/aprovados');
  }

  solveLayout(): void {
    const bootstrapColMdSize = 992;

    const checkScreenSize = () => {
      this.mobile = document.body.offsetWidth < bootstrapColMdSize;
    };

    window.onresize = checkScreenSize;
    checkScreenSize();
  }
}
