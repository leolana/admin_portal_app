import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ThemeModule } from '../core/theme/theme.module';
import { PipesModule } from '../pipes/pipes.module';
import { DatatableModule } from '../core/datatable/datatable.module';
import { AlpeTabsModule } from '../core/components/alpe-tabs/alpe-tabs.module';
import { NgxMaskModule } from 'ngx-mask';
import { GerenciamentoConsultaFornecedorComponent } from './consultar-fornecedor/gerenciamento/gerenciamento.component';
import { FornecedorAprovadoComponent } from './consultar-fornecedor/status-fornecedor/aprovado/fornecedor-aprovado.component';
import { FornecedorCanceladoComponent } from './consultar-fornecedor/status-fornecedor/cancelado/fornecedor-cancelado.component';
import { FornecedorIndicacaoComponent } from './consultar-fornecedor/status-fornecedor/indicacao/fornecedor-indicacao.component';
import { FornecedorPendenteComponent } from './consultar-fornecedor/status-fornecedor/pendente/fornecedor-pendente.component';
import { FornecedorReprovadoComponent } from './consultar-fornecedor/status-fornecedor/reprovado/fornecedor-reprovado.component';
import { NgxCurrencyModule } from 'ngx-currency';
import { CoreModule } from '../core/core.module';
import { IndicacaoFornecedorComponent } from './indicacao-fornecedor/indicacao-fornecedor.component';
import { ModalCancelamentoModule } from '../core/components/modal-cancelamento/modal-cancelamento.module';

@NgModule({
    imports: [
        ReactiveFormsModule,
        BrowserModule,
        ThemeModule,
        PipesModule,
        DatatableModule,
        AlpeTabsModule,
        NgxMaskModule,
        FormsModule,
        ReactiveFormsModule,
        NgxMaskModule,
        NgxCurrencyModule,
        CoreModule,
        ModalCancelamentoModule,
    ],
    declarations: [
        GerenciamentoConsultaFornecedorComponent,
        FornecedorPendenteComponent,
        FornecedorAprovadoComponent,
        FornecedorCanceladoComponent,
        FornecedorReprovadoComponent,
        FornecedorIndicacaoComponent,
        IndicacaoFornecedorComponent,
    ],
    exports: [],
})
export class EstabelecimentoModule { }
