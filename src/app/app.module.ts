// I18N PT_BR
import { registerLocaleData } from '@angular/common';
import localePT from '@angular/common/locales/pt';
registerLocaleData(localePT, 'pt');

// MODULES
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ThemeModule } from './core/theme/theme.module';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { NgModule, LOCALE_ID, ErrorHandler } from '@angular/core';
import * as Raven from 'raven-js';
import { environment } from './../environments/environment';
import { NgxMaskModule } from 'ngx-mask';
import { NgxCurrencyModule } from 'ngx-currency';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'ngx-currency/src/currency-mask.config';
import { NotificationModule } from './core/notification/notification.service';
import { CredenciamentoStatusModule } from './credenciamento/status/credenciamento-status.module';
import { CessaoModule } from './cessao/cessao.module';
import { AntecipacaoModule } from './antecipacao/antecipacao.module';
import { FornecedorModule } from './fornecedor/fornecedor.module';
import { EstabelecimentoModule } from './estabelecimento/estabelecimento.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { DatePickerModule } from './core/date-picker/date-picker.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { WizardModule } from './credenciamento/wizard/wizard.module';

const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: 'right',
  allowNegative: true,
  allowZero: true,
  decimal: ',',
  precision: 2,
  prefix: '',
  suffix: '',
  thousands: '.',
  nullable: true,
};

// COMPONENTS
import { AppComponent } from './app.component';
import { LoginComponent } from './core/login/login.component';
import { ChangePasswordComponent } from './core/change-password/change-password.component';
import { ResetPasswordComponent } from './core/recover-password/reset-password.component';
import { RecoverPasswordComponent } from './core/recover-password/recover-password.component';
import { RegisterComponent } from './core/register/register.component';
import { HomeComponent } from './core/home/home.component';
import { PromptComponent } from './core/prompt/prompt.component';
import { MenuComponent } from './core/menu/menu.component';

// APP COMPONENTS
import { CredenciamentoCapturaComponent } from './credenciamento/formulario/captura.component';
import { CredenciamentoCondicoesComerciaisComponent } from './credenciamento/formulario/condicoes-comerciais.component';
import { CredenciamentoDadosCadastraisComponent } from './credenciamento/formulario/dados-cadastrais.component';
import { CredenciamentoDadosInstalacaoComponent } from './credenciamento/formulario/dados-instalacao.component';
import { CredenciamentoDadosSocietariosComponent } from './credenciamento/formulario/dados-societarios.component';
import { CredenciamentoDocumentosComponent } from './credenciamento/formulario/documentos.component';
import { CredenciamentoDomicilioBancarioComponent } from './credenciamento/formulario/domicilio-bancario.component';
import { CredenciamentoPesquisaComponent } from './credenciamento/pesquisa/pesquisa.component';
import { CredenciamentoProspectarComponent } from './credenciamento/prospectar/prospectar.component';
import { CredenciamentoArquivosComponent } from './credenciamento/pesquisa/dialog-arquivos.component';
import { CredenciamentoUploadComponent } from './credenciamento/upload/upload.component';

import { TaxaComponents } from './taxa/taxa.components';

import { ImpersonateParticipanteComponent } from './core/impersonate/dialog-participante.component';

import { HealthComponent } from './health/health.component';

import { ExportacaoComponent } from './exportacao/exportacao.component';

// INTERCEPTORS
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor, ISODatesHttpInterceptor } from './core/http.interceptors';
import { TermoComponent } from './termo/component';
import { PipesModule } from './pipes/pipes.module';
import { LoaderComponent } from './core/loader/loader.component';
import { ParticipanteModule } from './participante/participante.module';
import { ModalCancelamentoModule } from './core/components/modal-cancelamento/modal-cancelamento.module';
import { NotificacoesModule } from './core/notificacoes/notificacoes.module';

// TODO: Extrair essa classe para outro arquivo e corrigir
export class RavenErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    Raven.captureException(err);
  }
}

if (environment.sentryClientKey) {
  Raven.config(environment.sentryClientKey, {
    environment: environment.envName,
  }).install();
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ChangePasswordComponent,
    ResetPasswordComponent,
    RecoverPasswordComponent,
    RegisterComponent,
    HomeComponent,
    PromptComponent,
    MenuComponent,
    LoaderComponent,
    CredenciamentoArquivosComponent,
    CredenciamentoCapturaComponent,
    CredenciamentoCondicoesComerciaisComponent,
    CredenciamentoDadosCadastraisComponent,
    CredenciamentoDadosInstalacaoComponent,
    CredenciamentoDadosSocietariosComponent,
    CredenciamentoDocumentosComponent,
    CredenciamentoDomicilioBancarioComponent,
    CredenciamentoPesquisaComponent,
    CredenciamentoProspectarComponent,
    CredenciamentoUploadComponent,
    TermoComponent,
    ImpersonateParticipanteComponent,
    HealthComponent,
    ExportacaoComponent,
    ...TaxaComponents,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ThemeModule,
    CoreModule,
    PipesModule,
    NotificacoesModule,
    NgxMaskModule.forRoot(),
    NgxCurrencyModule,
    NotificationModule,
    CredenciamentoStatusModule,
    CessaoModule,
    AntecipacaoModule,
    FornecedorModule,
    RelatoriosModule,
    ParticipanteModule,
    DatePickerModule,
    WizardModule,
    EstabelecimentoModule,
    UsuariosModule,
    EstabelecimentoModule,
    ModalCancelamentoModule,
  ],
  entryComponents: [
    PromptComponent,
    CredenciamentoArquivosComponent,
    ImpersonateParticipanteComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ISODatesHttpInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'pt' },
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
    { provide: ErrorHandler, useClass: RavenErrorHandler },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
