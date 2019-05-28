
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../core/core.module';
import { ThemeModule } from '../../core/theme/theme.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { AppRoutingModule } from '../../app-routing.module';
import { NgxMaskModule } from 'ngx-mask';
import { NgxCurrencyModule } from 'ngx-currency';

import { WizardComponent } from './wizard.component';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        ThemeModule,
        CoreModule,
        PipesModule,
        NgxMaskModule.forRoot(),
        NgxCurrencyModule,
    ],
    declarations: [
        WizardComponent
    ],
    exports: [
        WizardComponent,
    ]
})
export class WizardModule { }
