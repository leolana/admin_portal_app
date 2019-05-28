import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NotificacoesComponent } from './notificacoes.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ThemeModule } from '../theme/theme.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        BrowserModule,
        ThemeModule,
        FormsModule,
    ],
    declarations: [
        NotificacoesComponent
    ]

})
export class NotificacoesModule { }
