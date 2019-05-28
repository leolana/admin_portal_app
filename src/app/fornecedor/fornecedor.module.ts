import { NgModule } from '@angular/core';
import { NgxMaskModule } from 'ngx-mask';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { NgxCurrencyModule } from 'ngx-currency';
import { PipesModule } from '../pipes/pipes.module';
import { ThemeModule } from '../core/theme/theme.module';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatatableModule } from '../core/datatable/datatable.module';
import { WizardModule } from '../credenciamento/wizard/wizard.module';
import { DatePickerModule } from '../core/date-picker/date-picker.module';
import { AlpeTabsModule } from '../core/components/alpe-tabs/alpe-tabs.module';
import { ModalCancelamentoModule } from '../core/components/modal-cancelamento/modal-cancelamento.module';

import { EditarIndicacaoEstabelecimentoComponent } from './indicacao-estabelecimento/editar/editar-indicacao-estabelecimento.component';
import { EstabelecimentosCanceladosComponent } from './estabelecimentos/cancelados/estabelecimentos-cancelados.component';
import { EstabelecimentosReprovadosComponent } from './estabelecimentos/reprovados/estabelecimentos-reprovados.component';
import { EstabelecimentosAprovadosComponent } from './estabelecimentos/aprovados/estabelecimentos-aprovados.component';
import { EstabelecimentosPendentesComponent } from './estabelecimentos/pendentes/estabelecimentos-pendentes.component';
import { IndicacaoEstabelecimentoComponent } from './indicacao-estabelecimento/indicacao-estabelecimento.component';
import { FornecedoresCadastradosComponent } from './listagem/status/cadastrados/fornecedores-cadastrados.component';
import { DomicilioBancarioFornecedorComponent } from './cadastro/domicilio-bancario/domicilio-bancario.component';
import { FornecedoresCanceladosComponent } from './listagem/status/cancelados/fornecedores-cancelados.component';
import { FornecedoresPendentesComponent } from './listagem/status/pendentes/fornecedores-pendentes.component';
import { DadosCadastraisFornecedorComponent } from './cadastro/dados-cadastrais/dados-cadastrais.component';
import { GerenciamentoFornecedorComponent } from './listagem/gerenciamento/gerenciamento.component';
import { MeusEstabelecimentosComponent } from './estabelecimentos/meus-estabelecimentos.component';
import { TarifasFornecedorComponent } from './cadastro/tarifas/tarifas.component';
import { FornecedorTarifaComponent } from './tarifa/tarifa.component';
import { GerenciamentoInformacacoesFornecedorComponent } from './informacoes/gerenciamento/gerenciamento.component';
import { FornecedoresUsuariosComponent } from './informacoes/infos/usuarios/fornecedores-usuarios.component';
import { FornecedoresConvitesComponent } from './informacoes/infos/convites/fornecedores-convites.component';

@NgModule({
  imports: [
    WizardModule,
    CommonModule,
    CoreModule,
    ThemeModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    PipesModule,
    NgxMaskModule,
    NgxCurrencyModule,
    AlpeTabsModule,
    DatatableModule,
    ModalCancelamentoModule,
    DatePickerModule,
  ],
  declarations: [
    MeusEstabelecimentosComponent,
    FornecedorTarifaComponent,
    IndicacaoEstabelecimentoComponent,
    EditarIndicacaoEstabelecimentoComponent,
    GerenciamentoInformacacoesFornecedorComponent,
    FornecedoresUsuariosComponent,
    FornecedoresConvitesComponent,
    DadosCadastraisFornecedorComponent,
    DomicilioBancarioFornecedorComponent,
    TarifasFornecedorComponent,
    EstabelecimentosAprovadosComponent,
    EstabelecimentosPendentesComponent,
    EstabelecimentosCanceladosComponent,
    EstabelecimentosReprovadosComponent,
    GerenciamentoFornecedorComponent,
    FornecedoresPendentesComponent,
    FornecedoresCadastradosComponent,
    FornecedoresCanceladosComponent,
  ],
  exports: [],
})
export class FornecedorModule {}
