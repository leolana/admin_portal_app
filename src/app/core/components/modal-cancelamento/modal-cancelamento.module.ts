import { NgModule } from '@angular/core';
import { ModalCancelamentoComponent } from './modal-cancelamento.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AlpeSelect2Module } from '../../directives/alpe-select2/alpe-select2.module';
import { PipesModule } from '../../../pipes/pipes.module';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  imports: [ReactiveFormsModule, AlpeSelect2Module, PipesModule, BrowserModule],
  declarations: [ModalCancelamentoComponent],
  exports: [ModalCancelamentoComponent],
})
export class ModalCancelamentoModule {}
