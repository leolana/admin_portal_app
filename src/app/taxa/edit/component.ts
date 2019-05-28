import { Router } from '@angular/router';
import { OnInit, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NotificationService } from '../../core/notification/notification.service';
import { PromptService } from './../../core/prompt/prompt.service';
import { DominioService } from '../../dominio/dominio.service';
import { Taxa, TaxaRange } from './../../interfaces/taxa';
import { TiposPessoa } from '../../interfaces/index';
import { IdText } from './../../interfaces/index';
import { Prazo } from '../../interfaces/taxa';
import { TaxaService } from '../taxa.service';
import { zip, of, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DateTime } from 'luxon';

interface GrupoPrazoViewModel {
    prazo: Prazo;
    formTaxas: FormGroup;
    bandeira: IdText;
}

@Component({
    templateUrl: './component.html',
    styleUrls: ['./component.css'],
})
export class TaxaEditComponent implements OnInit {
    constructor(
        private service: TaxaService,
        private dominio: DominioService,
        private prompt: PromptService,
        private router: Router,
        private toastr: NotificationService,
    ) { }

    // LISTAS
    bandeiras: IdText[];
    tipoPessoas: IdText[];
    prazos: Prazo[];
    opcoesFaturamentoCartao: IdText[];

    // FILTRO
    filtro = {
        idTipoPessoa: new FormControl(0),
        idRamoAtividade: new FormControl(0),
        inicioVigencia: new FormControl(null),
        terminoVigencia: new FormControl(null),
    };
    formFiltro = new FormGroup(this.filtro);

    // BANDEIRAS
    formsBandeira: FormGroup[];

    // PRAZOS
    formsPrazo: FormGroup[];

    // TAXAS
    ranges: TaxaRange[];
    tableTaxas: {
        bandeira: IdText;
        prazos: GrupoPrazoViewModel[];
    }[];

    // PREVIEW
    formPreview = new FormGroup({
        idOpcaoFaturamento: new FormControl(),
    });

    // ITEM
    id = 0;
    model: Taxa = null;
    copiando = false;
    adicionando = false;
    editando = false;
    apenasVisualizacao = false;

    // METHODS
    ngOnInit(): void {
        this.findConfiguracao();
        this.getTipoPessoas().subscribe();
    }

    getPrazos(): Observable<Prazo[]> {
        return this.service.getTaxaPrazos().pipe(
            tap(arr => this.prazos = arr)
        );
    }

    getBandeiras(): Observable<IdText[]> {
        return this.dominio.obterBandeiras().pipe(
            tap(arr => this.bandeiras = arr)
        );
    }

    getTipoPessoas(): Observable<IdText[]> {
        const tipoPessoas = Object.keys(TiposPessoa.descricoes).map(id => ({
            id: +id,
            text: TiposPessoa.descricoes[id]
        }));
        tipoPessoas.unshift({ id: 0, text: 'Todos' });

        return of(tipoPessoas).pipe(
            tap(arr => this.tipoPessoas = arr)
        );
    }

    getOpcoesFaturamentoCartao(): Observable<IdText[]> {
        return this.dominio.obterOpcoesFaturamentoCartao().pipe(
            tap(arr => this.opcoesFaturamentoCartao = arr.reverse())
        );
    }

    getRanges() {
        return this.service.getTaxaRanges().pipe(
            tap(arr => this.ranges = arr)
        );
    }

    startPageToEditTaxas(): void {
        zip(
            this.getPrazos(),
            this.getRanges(),
            this.getBandeiras(),
            this.getOpcoesFaturamentoCartao()
        ).subscribe(() => {
            this.createDynamicFormBandeiras();
            this.createDynamicFormsPrazo();
            this.createDynamicTableTaxas();
        });
    }

    amanha(): string {
        const today = DateTime.local().startOf('day').toJSDate();
        today.setMinutes(today.getTimezoneOffset());

        const tomorrow = DateTime.fromJSDate(today).plus({ days: 1 }).toISO();
        return tomorrow;
    }

    vigenciaAcabou(item): boolean {
        if (!item.terminoVigencia) {
            return false;
        }
        return item.terminoVigencia < this.amanha();
    }

    minimoAmanha(data): Date {
        if (data) {
            const tomorrow = this.amanha();
            return data < tomorrow ? tomorrow : data;
        }
        return data;
    }

    fixVigencia(item): void {
        item.inicioVigencia = this.minimoAmanha(item.inicioVigencia);
        item.terminoVigencia = this.minimoAmanha(item.terminoVigencia);

        if (item.terminoVigencia <= item.inicioVigencia) {
            item.terminoVigencia = null;
        }
    }

    findConfiguracao(): void {
        if (/taxa\/\d+$/i.test(location.href)) {
            this.editando = true;
            this.id = +location.href.match(/\d+$/)[0];
        }

        if (/taxa\/dup\d+$/i.test(location.href)) {
            this.copiando = true;
            this.id = +location.href.match(/\d+$/)[0];
        }

        if (this.editando || this.copiando) {
            this.service.getById(this.id).subscribe(item => {
                if (this.editando && this.vigenciaAcabou(item)) {
                    this.apenasVisualizacao = true;
                } else {
                    this.fixVigencia(item);
                }

                this.filtro.idTipoPessoa.setValue(item.idTipoPessoa || 0);
                this.filtro.inicioVigencia.setValue(item.inicioVigencia);
                this.filtro.terminoVigencia.setValue(item.terminoVigencia);
                this.filtro.idRamoAtividade.setValue(item.idRamoAtividade || 0);
                this.model = item;

                if (this.copiando) {
                    this.id = 0;
                    this.model.id = 0;
                }

                if (this.editando) {
                    this.startPageToEditTaxas();
                }
            }, () => this.limpar());
        }
    }

    createDynamicFormBandeiras(): void {
        this.formsBandeira = [];

        this.bandeiras.forEach(bandeira => {
            const _bandeira = deep(this.model, 'bandeiras', { key: 'idBandeira', id: bandeira.id });
            const form = new FormGroup({
                taxaDebito: new FormControl(_bandeira.taxaDebito)
            });

            this.opcoesFaturamentoCartao.forEach(faturamento => {
                const _faturamento = deep(_bandeira, 'faturamentos', { key: 'idFaturamento', id: faturamento.id });
                form.addControl('coeficienteFaturamento' + faturamento.id, new FormControl(_faturamento.coeficiente));
            });

            this.formsBandeira.push(form);
        });
    }

    createDynamicFormsPrazo(): void {
        this.formsPrazo = this.prazos.map(prazo => {
            const _prazo = deep(this.model, 'prazos', { key: 'prazo', id: prazo.prazo });

            return new FormGroup({
                coeficiente: new FormControl(_prazo.coeficiente),
            });
        });
    }

    createDynamicTableTaxas(): void {
        this.tableTaxas = this.bandeiras.map(bandeira => ({
            bandeira: bandeira,
            prazos: this.prazos.map(prazo => {
                const _ranges = deep(this.model, 'prazos33', { key: 'idBandeira', id: bandeira.id }, 'ranges');

                const formTaxas = new FormGroup({});
                this.ranges.forEach(range => {
                    const _value = _ranges.find(_r => _r.minimo == range.minimo && _r.maximo == range.maximo);
                    formTaxas.addControl(`taxa${range.minimo}a${range.maximo}`, new FormControl(_value && _value.taxa));
                });

                return {
                    prazo: prazo,
                    formTaxas: formTaxas,
                    bandeira: bandeira,
                };
            })
        }));
    }

    limpar(): void {
        this.filtro.idTipoPessoa.setValue(0);
        this.filtro.inicioVigencia.setValue(null);
        this.filtro.terminoVigencia.setValue(null);
        this.filtro.idRamoAtividade.setValue(0);

        this.copiando = false;
        this.editando = false;
        this.adicionando = false;
        this.apenasVisualizacao = false;
        this.id = 0;
        this.model = null;

        this.router.navigateByUrl('/taxa/add');
    }

    voltar(): void {
        this.router.navigateByUrl('/taxas');
    }

    filtrar(): void {
        this.service.getByFilter(this.formFiltro.value).subscribe(item => {
            if (!item) throw `taxa: getByFilter: subscribed "${item}"`;

            if (item.overlaps && item.overlaps.length) {
                this.toastr.showErrorMessage(
                    'Esta configuração de Taxa conflita com as seguintes configurações de taxas existentes: ' +
                    item.overlaps.map(t => t.id).join(', ')
                );
                return;
            }

            const jaExiste = item.id;
            if (jaExiste) {
                this.prompt.confirm('Já existem Taxas cadastradas para essa Configuração. Deseja alterá-las?').then(yes => {
                    if (yes) {
                        this.router.navigateByUrl('/taxa/' + item.id);
                        this.editando = true;
                        this.id = item.id;
                        this.model = item;
                        this.startPageToEditTaxas();
                    }
                });
            } else {
                this.adicionando = true;

                if (!this.copiando) {
                    this.model = Object();
                }

                this.startPageToEditTaxas();
            }
        });
    }

    formFilterDisabled(): boolean {
        return this.editando || this.adicionando || null;
    }

    opcaoFaturamentoSelecionada(): number {
        return parseFloat(this.formPreview.controls.idOpcaoFaturamento.value || 0);
    }

    taxaAdministrativa(bandeira: IdText, prazoGroup: Prazo, range: TaxaRange): number {
        const bandeiraTaxas = this.tableTaxas.find(i => i.bandeira.id == bandeira.id);
        const firstGroupPrazo = bandeiraTaxas.prazos[0];
        const taxa = firstGroupPrazo.formTaxas.controls[`taxa${range.minimo}a${range.maximo}`];

        const bandeiraForm = this.formsBandeira[this.bandeiras.indexOf(bandeira)];
        const coeficienteFaturamento = bandeiraForm.controls['coeficienteFaturamento' + this.opcaoFaturamentoSelecionada()];

        const prazoForm = this.formsPrazo[this.prazos.indexOf(prazoGroup)];
        const prazo = prazoForm.controls.coeficiente;

        return parseFloat(taxa.value || 0) + parseFloat(coeficienteFaturamento.value || 0) + parseFloat(prazo.value || 0);
    }

    save() {
        Object.keys(this.formFiltro.controls).forEach(key => {
            this.model[key] = this.formFiltro.controls[key].value;
        });

        this.bandeiras.forEach((bandeira, i) => {
            const _bandeira = deep(this.model, 'bandeiras', { key: 'idBandeira', id: bandeira.id });
            const form = this.formsBandeira[i];
            _bandeira.taxaDebito = form.controls.taxaDebito.value || 0;

            this.opcoesFaturamentoCartao.forEach(faturamento => {
                const _faturamento = deep(_bandeira, 'faturamentos', { key: 'idFaturamento', id: faturamento.id });
                _faturamento.coeficiente = form.controls['coeficienteFaturamento' + faturamento.id].value || 0;
            });
        });

        this.prazos.forEach((prazo, i) => {
            const _prazo = deep(this.model, 'prazos', { key: 'prazo', id: prazo.prazo });
            const form = this.formsPrazo[i];
            _prazo.coeficiente = form.controls.coeficiente.value || 0;
        });

        this.bandeiras.forEach((bandeira, i) => {
            const form = this.tableTaxas[i].prazos[this.prazos.findIndex(p => p.prazo == 33)];
            if (!form) return;

            const _prazo = deep(this.model, 'prazos33', { key: 'idBandeira', id: bandeira.id });
            _prazo.ranges = this.ranges.map(range => ({
                maximo: range.maximo,
                minimo: range.minimo,
                taxa: form.formTaxas.controls[`taxa${range.minimo}a${range.maximo}`].value || 0
            }));
        });

        this.service.post(this.model).subscribe(taxa => {
            if (taxa && taxa.id) {
                this.router.navigateByUrl('/taxa/' + taxa.id);
                this.model.id = this.id = taxa.id;
            }

            if (this.adicionando) {
                this.toastr.showSuccessMessage('Valores incluidos com sucesso');
                this.adicionando = false;
                this.copiando = false;
                this.editando = true;
            } else {
                this.toastr.showSuccessMessage('Valores alterados com sucesso');
            }
            this.voltar();
        });
    }

}

function deep(model, ...props): any {
    return props.reduce((o, cur) => {
        if (!o) return {};
        if (typeof o.find === 'function') {
            const found = o.find(i => i[cur.key] == cur.id);
            if (!found) {
                const add = { [cur.key]: cur.id };
                o.push(add);
                return add;
            }
            return found;
        }
        if (o[cur]) return o[cur];
        return o[cur] = [];
    }, model) || {};
}
