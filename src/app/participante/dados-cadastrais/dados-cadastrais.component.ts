import { Component, OnInit } from '@angular/core';
import { IdText } from '../../interfaces';

@Component({
  templateUrl: 'dados-cadastrais.component.html',
  styleUrls: ['../participante.styles.css'],
})
export class ParticipanteDadosCadastraisComponent implements OnInit {
  mobile: boolean;

  statuses: IdText[] = [
    { id: 'tabCadastrais', text: 'Dados Cadastrais' },
    { id: 'tabContato', text: 'Dados de Contato' },
    { id: 'tabDomicilio', text: 'Domicílios Bancários' },
  ];
  cessoes: any;
  statusSelecionado = this.statuses[0];

  ngOnInit(): void {
    this.solveLayout();
  }

  solveLayout(): void {
    const checkScreenSize = () => {
      this.mobile = document.body.offsetWidth < 992;
    };

    window.onresize = checkScreenSize;
    checkScreenSize();
  }

  selecionarStatus(status) {
    return status === this.statusSelecionado;
  }
}
