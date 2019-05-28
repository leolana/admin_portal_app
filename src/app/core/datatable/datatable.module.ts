import { NgModule } from '@angular/core';
import {
  MatTableModule,
  MatPaginatorModule,
  MatPaginatorIntl,
  MatSortModule,
  MatSlideToggleModule,
  MatCheckboxModule,
} from '@angular/material';
import { AlpeDatatableComponent } from './datatable.component';
import { CoreModule } from '../core.module';
import { BrowserModule } from '@angular/platform-browser';
import { PipesModule } from '../../pipes/pipes.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export class MatPaginatorIntlPtBr extends MatPaginatorIntl {
  itemsPerPageLabel = 'Linhas por página';
  nextPageLabel = 'Pŕoxima página';
  previousPageLabel = 'Página Anterior';
  lastPageLabel = 'Última página';
  firstPageLabel = 'Primeira página';

  getRangeLabel = (page, pageSize, length) => {
    length = Math.max(0, length);
    if (length === 0 || pageSize === 0) {
      return '0 de ' + length;
    }

    const from = page * pageSize;
    const to = Math.min(from + pageSize, length);
    return `${from + 1} - ${to} de ${length}`;
  }
}

@NgModule({
  imports: [
    CoreModule,
    BrowserModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    PipesModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatCheckboxModule,
  ],
  declarations: [AlpeDatatableComponent],
  exports: [AlpeDatatableComponent],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlPtBr }],
})
export class DatatableModule {}
