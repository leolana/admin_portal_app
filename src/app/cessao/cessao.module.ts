import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SolicitarCessaoRecorrenteComponent } from './solicitar/recorrente/recorrente';
import { SolicitarCessaoParceladoComponent } from './solicitar/parcelado/parcelado';
import { SolicitarCessaoDefaultComponent } from './solicitar/default/default';
import { CoreModule } from '../core/core.module';
import { CessaoConsultarComponent } from './consultar/consultar';
import { SolicitarCessaoComponent } from './solicitar/solicitar';
import { CessaoDetalheComponent } from './detalhe/cessao-detalhe.component';
import { CessaoStatusStepComponent } from './detalhe/status-step.component';
import { TimeLineRecebiveisComponent } from './detalhe/timeline-recebiveis.component';
import { ThemeModule } from '../core/theme/theme.module';
import { PipesModule } from '../pipes/pipes.module';
import { NgxCurrencyModule } from 'ngx-currency';
import { DatePickerModule } from '../core/date-picker/date-picker.module';

@NgModule({
    imports: [
        CommonModule,
        ThemeModule,
        PipesModule,
        ReactiveFormsModule,
        CoreModule,
        FormsModule,
        NgxCurrencyModule,
        DatePickerModule,
    ],
    declarations: [
        CessaoDetalheComponent,
        CessaoStatusStepComponent,
        TimeLineRecebiveisComponent,
        CessaoConsultarComponent,
        SolicitarCessaoComponent,
        SolicitarCessaoDefaultComponent,
        SolicitarCessaoRecorrenteComponent,
        SolicitarCessaoParceladoComponent,
    ],
    exports: [
        SolicitarCessaoComponent,
        CessaoDetalheComponent,
        CessaoConsultarComponent,
    ]
})
export class CessaoModule { }
