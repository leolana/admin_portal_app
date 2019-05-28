import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { ThemeModule } from '../core/theme/theme.module';
import { PipesModule } from '../pipes/pipes.module';
import { ParticipanteTaxasComponent } from './taxas/taxas.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgxCurrencyModule } from 'ngx-currency';
import { ParticipanteDadosCadastraisComponent } from './dados-cadastrais/dados-cadastrais.component';
import { ParticipanteCadastroComponent } from './dados-cadastrais/cadastro/cadastro.component';
import { ParticipanteContatoComponent } from './dados-cadastrais/contato/contato.component';
import { ParticipanteDomiciliosComponent } from './dados-cadastrais/domicilios/domicilios.component';

@NgModule({
    imports: [
        CommonModule,
        ThemeModule,
        PipesModule,
        ReactiveFormsModule,
        CoreModule,
        FormsModule,
        BrowserModule,
        HttpClientModule,
        NgxCurrencyModule,
    ],
    declarations: [
        ParticipanteCadastroComponent,
        ParticipanteContatoComponent,
        ParticipanteDomiciliosComponent,
        ParticipanteDadosCadastraisComponent,
       ParticipanteTaxasComponent
    ],
    exports: [
        ParticipanteTaxasComponent,
        ParticipanteContatoComponent,
        ParticipanteDomiciliosComponent,
        ParticipanteDadosCadastraisComponent,
       ParticipanteTaxasComponent
    ]
})
export class ParticipanteModule { }
