import { Router } from '@angular/router';
import { OnInit, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ItemListagemTaxas } from './../../interfaces/taxa';
import { TiposPessoa } from './../../interfaces/index';
import { TaxaService } from '../taxa.service';
import { tap } from 'rxjs/operators';
import { zip, of } from 'rxjs';

declare const $: any;

interface TaxaViewModel extends ItemListagemTaxas {
    tipoPessoa?: any;
}

@Component({
    templateUrl: './component.html',
    styleUrls: ['./component.css'],
})
export class TaxaListComponent implements OnInit {
    constructor(
        private service: TaxaService,
        private router: Router,
    ) { }

    // PROPERTIES
    taxas: TaxaViewModel[] = [];
    filter = {
        idTipoPessoa: new FormControl(0),
        idRamoAtividade: new FormControl(0),
        inicioVigencia: new FormControl(),
        terminoVigencia: new FormControl(),
    };
    formFilter = new FormGroup(this.filter);
    tipoPessoas: any[] = [];

    // METHODS
    ngOnInit(): void {
        zip(this.getTipoPessoas()).subscribe(() => {
            this.list();
        });
    }

    getTipoPessoas() {
        const tipoPessoas = Object.keys(TiposPessoa.descricoes).map(id => ({
            id: +id,
            text: TiposPessoa.descricoes[id]
        }));
        tipoPessoas.unshift({ id: 0, text: 'Todos' });

        return of(tipoPessoas).pipe(
            tap(arr => this.tipoPessoas = arr)
        );
    }

    list(): void {
        this.taxas = [];
        this.service.list(this.formFilter.value).subscribe(arr => {
            this.taxas = arr.map(taxa => $.extend({
                tipoPessoa: this.tipoPessoas.find(o => o.id == (taxa.idTipoPessoa || 0))
            }, taxa));
        });
    }

    edit(id: number): void {
        this.router.navigateByUrl('/taxa/' + id);
    }

    duplicate(id: number): void {
        this.router.navigateByUrl('/taxa/dup' + id);
    }

    add(): void {
        this.router.navigateByUrl('/taxa/add');
    }

}
