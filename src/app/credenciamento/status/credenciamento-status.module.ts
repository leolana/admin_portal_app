import { NgModule } from '@angular/core';
import { CredenciamentoStatusResumoComponent } from './credenciamento-status-resumo.component';
import { CredenciamentoStatusComponent } from './credenciamento-status.component';
import { CredenciamentoStatusInstalacaoComponent } from './credenciamento-status-instalacao.component';
import { CredenciamentoStatusDomicilioComponent } from './credenciamento-status-domicilio.component';
import { CredenciamentoStatusDocumentosComponent } from './credenciamento-status-documentos.component';
import { CredenciamentoStatusSociosComponent } from './credenciamento-status-socios.component';
import { CredenciamentoStatusAnaliseDocumentosComponent } from './credenciamento-status-analise-documentos.components';
import { BrowserModule } from '@angular/platform-browser';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ThemeModule } from 'src/app/core/theme/theme.module';
import { FormsModule } from '@angular/forms';
import { AlpeTabsModule } from 'src/app/core/components/alpe-tabs/alpe-tabs.module';
import { CredenciamentoStatusUsuariosComponent } from './credenciamento-status-usuarios.component';
import { DatatableModule } from 'src/app/core/datatable/datatable.module';
import { CredenciamentoStatusConvitesComponent } from './credenciamento-status-convites.component';

@NgModule({
  imports: [BrowserModule, PipesModule, ThemeModule, FormsModule, AlpeTabsModule, DatatableModule],
  declarations: [
    CredenciamentoStatusComponent,
    CredenciamentoStatusResumoComponent,
    CredenciamentoStatusInstalacaoComponent,
    CredenciamentoStatusDomicilioComponent,
    CredenciamentoStatusDocumentosComponent,
    CredenciamentoStatusSociosComponent,
    CredenciamentoStatusAnaliseDocumentosComponent,
    CredenciamentoStatusUsuariosComponent,
    CredenciamentoStatusConvitesComponent,
  ],
  exports: [],
})
export class CredenciamentoStatusModule {}
