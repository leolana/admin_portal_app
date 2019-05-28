import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { PipesModule } from '../pipes/pipes.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ThemeModule } from '../core/theme/theme.module';
import { BrowserModule } from '@angular/platform-browser';
import { AlpeSelect2Module } from '../core/directives/alpe-select2/alpe-select2.module';
import { AlpeExpandableModule } from '../core/directives/alpe-expandable/alpe-expandable.module';
import { DatatableModule } from '../core/datatable/datatable.module';
import { ExtratoDetalhadoComponent } from './extrato-detalhado/extrato-detalhado.component';
import { ExtratoResumidoComponent } from './extrato-resumido/extrato-resumido.component';
import { RelatorioConsolidadoFornecedorComponent } from './fornecedor/consolidado/relatorio-consolidado-fornecedor.component';
import { DatePickerModule } from '../core/date-picker/date-picker.module';

@NgModule({
  imports: [
    ThemeModule,
    ReactiveFormsModule,
    CoreModule,
    BrowserModule,
    PipesModule,
    AlpeSelect2Module,
    AlpeExpandableModule,
    DatatableModule,
    DatePickerModule,
  ],
  declarations: [
    ExtratoDetalhadoComponent,
    ExtratoResumidoComponent,
    RelatorioConsolidadoFornecedorComponent,
  ],
  exports: [
    ExtratoDetalhadoComponent,
    ExtratoResumidoComponent,
    RelatorioConsolidadoFornecedorComponent,
  ],
})
export class RelatoriosModule {}
