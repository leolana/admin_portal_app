import { NgxMaskModule } from 'ngx-mask';
import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { PipesModule } from '../pipes/pipes.module';
import { ThemeModule } from '../core/theme/theme.module';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AlpeSelect2Module } from '../core/directives/alpe-select2/alpe-select2.module';
import { DatePickerModule } from '../core/date-picker/date-picker.module';
import { DatatableModule } from '../core/datatable/datatable.module';

import { AnteciparEstabelecimentoComponent } from './antecipar-estabelecimento/antecipar-estabelecimento.component';
import { AnteciparFornecedorComponent } from './antecipar-fornecedor/antecipar-fornecedor.component';
import { PesquisarAntecipacaoEstabelecimentoComponent } from './pesquisar-estabelecimento/pesquisar-antecipacao-estabelecimento.component';
import { PesquisarAntecipacaoFornecedorComponent } from './pesquisar-fornecedor/pesquisar-antecipacao-fornecedor.component';

@NgModule({
    imports: [
        CoreModule,
        ThemeModule,
        PipesModule,
        ReactiveFormsModule,
        BrowserModule,
        FormsModule,
        AlpeSelect2Module,
        NgxMaskModule,
        DatePickerModule,
        DatatableModule
    ],
    declarations: [
        AnteciparEstabelecimentoComponent,
        AnteciparFornecedorComponent,
        PesquisarAntecipacaoEstabelecimentoComponent,
        PesquisarAntecipacaoFornecedorComponent,
    ],
    exports: [
        AnteciparEstabelecimentoComponent,
        AnteciparFornecedorComponent,
        PesquisarAntecipacaoEstabelecimentoComponent,
        PesquisarAntecipacaoFornecedorComponent,
    ],
})
export class AntecipacaoModule { }
