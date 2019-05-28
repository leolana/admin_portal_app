import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentoPipe } from './documento.pipe';
import { CredenciamentoStatusPipe } from './credenciamento-status.pipe';
import { TipoDocumentoPipe } from './tipo-documento.pipe';
import { AberturaNascimentoPipe } from './abertura-nascimento.pipe';
import { TelefonePipe } from './telefone.pipe';
import { TaxaAdministrativaParcelasPipe } from './taxa-administrativa-parcelas.pipe';
import { TipoCapturaPipe } from './tipo-captura.pipe';
import { DiasSemanaPipe } from './dias-semana.pipe';
import { UsuarioStatusPipe } from './usuario-status.pipe';
import { VinculoStatusPipe } from './vinculo-status.pipe';
import { ParticipanteIndicacaoStatusPipe } from './participante-indicacao-status.pipe';
import { ControlPipe } from './control.pipe';
import { CessaoStatusPipe } from './cessao-status.pipe';
import { NumeroCartaoPipe } from './numero-cartao.pipe';
import { TipoPessoaPipe } from './tipo-pessoa.pipe';
import { HasErrorPipe } from './has-error.pipe';
import { TipoCessaoPipe, TipoCessaoECPipe } from './tipo-cessao.pipe';
import { DiluicaoPagamentoPipe } from './diluicao-pagamento.pipe';
import { DateTimePipe } from './datetime.pipe';
import { DatePipe } from './date.pipe';
import { TipoCanalEntradaPipe } from './tipo-canal-entrada.pipe';
import { RoleUsuarioPipe } from './role-usuario.pipe';

const pipes = [
  DocumentoPipe,
  CredenciamentoStatusPipe,
  TipoDocumentoPipe,
  AberturaNascimentoPipe,
  TelefonePipe,
  TaxaAdministrativaParcelasPipe,
  TipoCapturaPipe,
  DiasSemanaPipe,
  UsuarioStatusPipe,
  VinculoStatusPipe,
  ParticipanteIndicacaoStatusPipe,
  ControlPipe,
  CessaoStatusPipe,
  NumeroCartaoPipe,
  TipoPessoaPipe,
  HasErrorPipe,
  TipoCessaoPipe,
  DateTimePipe,
  TipoCessaoECPipe,
  DiluicaoPagamentoPipe,
  DatePipe,
  TipoCanalEntradaPipe,
  RoleUsuarioPipe,
];

@NgModule({
  imports: [CommonModule],
  declarations: pipes,
  exports: pipes,
})
export class PipesModule {}
