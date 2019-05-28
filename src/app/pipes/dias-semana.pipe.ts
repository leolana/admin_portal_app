import { Pipe, PipeTransform } from '@angular/core';

export enum DiaSemana {
  segunda = 1,
  terca = 2,
  quarta = 4,
  quinta = 8,
  sexta = 16,
  sabado = 32,
  domingo = 64
}

@Pipe({
  name: 'diasSemana'
})
export class DiasSemanaPipe implements PipeTransform {

  transform(value: number): string {
    const diasSelecionados = [];

    // tslint:disable-next-line:no-bitwise
    if (value & DiaSemana.segunda) {
      diasSelecionados.push('Segunda');
    }
    // tslint:disable-next-line:no-bitwise
    if (value & DiaSemana.terca) {
      diasSelecionados.push('Terça');
    }
    // tslint:disable-next-line:no-bitwise
    if (value & DiaSemana.quarta) {
      diasSelecionados.push('Quarta');
    }
    // tslint:disable-next-line:no-bitwise
    if (value & DiaSemana.quinta) {
      diasSelecionados.push('Quinta');
    }
    // tslint:disable-next-line:no-bitwise
    if (value & DiaSemana.sexta) {
      diasSelecionados.push('Sexta');
    }
    // tslint:disable-next-line:no-bitwise
    if (value & DiaSemana.sabado) {
      diasSelecionados.push('Sábado');
    }
    // tslint:disable-next-line:no-bitwise
    if (value & DiaSemana.domingo) {
      diasSelecionados.push('Domingo');
    }

    return diasSelecionados.join(', ');
  }

}
