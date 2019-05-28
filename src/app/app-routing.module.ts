import {
    AuthenticationGuardService as Authenticate,
    AuthorizationGuardService as Authorize,
    ParticipanteGuardService as ParticipanteGuard
} from './core/auth/auth.guards';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Roles } from './core/auth/auth.roles';
import { CredenciamentoSteps } from './interfaces/credenciamento';
import { TiposPessoa } from './interfaces/';

import { LoginComponent } from './core/login/login.component';
import { ChangePasswordComponent } from './core/change-password/change-password.component';
import { ResetPasswordComponent } from './core/recover-password/reset-password.component';
import { RecoverPasswordComponent } from './core/recover-password/recover-password.component';
import { RegisterComponent } from './core/register/register.component';
import { HomeComponent } from './core/home/home.component';
import { NotPermittedComponent } from './core/theme/theme.components';
import { CredenciamentoCapturaComponent } from './credenciamento/formulario/captura.component';
import { CredenciamentoCondicoesComerciaisComponent } from './credenciamento/formulario/condicoes-comerciais.component';
import { CredenciamentoDadosCadastraisComponent } from './credenciamento/formulario/dados-cadastrais.component';
import { CredenciamentoDadosInstalacaoComponent } from './credenciamento/formulario/dados-instalacao.component';
import { CredenciamentoDadosSocietariosComponent } from './credenciamento/formulario/dados-societarios.component';
import { CredenciamentoDocumentosComponent } from './credenciamento/formulario/documentos.component';
import { CredenciamentoDomicilioBancarioComponent } from './credenciamento/formulario/domicilio-bancario.component';
import { CredenciamentoPesquisaComponent } from './credenciamento/pesquisa/pesquisa.component';
import { CredenciamentoProspectarComponent } from './credenciamento/prospectar/prospectar.component';
import { CredenciamentoUploadComponent } from './credenciamento/upload/upload.component';
import { CredenciamentoStatusComponent } from './credenciamento/status/credenciamento-status.component';
import { SolicitarCessaoComponent } from './cessao/solicitar/solicitar';
import { CessaoDetalheComponent } from './cessao/detalhe/cessao-detalhe.component';
import { ExtratoResumidoComponent } from './relatorios/extrato-resumido/extrato-resumido.component';
import { ExtratoDetalhadoComponent } from './relatorios/extrato-detalhado/extrato-detalhado.component';

import { AnteciparFornecedorComponent } from './antecipacao/antecipar-fornecedor/antecipar-fornecedor.component';
import { AnteciparEstabelecimentoComponent } from './antecipacao/antecipar-estabelecimento/antecipar-estabelecimento.component';
import { PesquisarAntecipacaoFornecedorComponent } from './antecipacao/pesquisar-fornecedor/pesquisar-antecipacao-fornecedor.component';
import {
    PesquisarAntecipacaoEstabelecimentoComponent
} from './antecipacao/pesquisar-estabelecimento/pesquisar-antecipacao-estabelecimento.component';

import { UsuariosGerenciamentoComponent } from './usuarios/gerenciamento/gerenciamento.component';
import { TermoComponent } from './termo/component';
import { CessaoConsultarComponent } from './cessao/consultar/consultar';
import { HealthComponent } from './health/health.component';
import { TaxaListComponent } from './taxa/list/component';
import { TaxaEditComponent } from './taxa/edit/component';
import { MeusEstabelecimentosComponent } from './fornecedor/estabelecimentos/meus-estabelecimentos.component';
import { FornecedorTarifaComponent } from './fornecedor/tarifa/tarifa.component';
import { ParticipanteTaxasComponent } from './participante/taxas/taxas.component';
import { RelatorioConsolidadoFornecedorComponent } from './relatorios/fornecedor/consolidado/relatorio-consolidado-fornecedor.component';
import { DadosCadastraisFornecedorComponent } from './fornecedor/cadastro/dados-cadastrais/dados-cadastrais.component';
import { DomicilioBancarioFornecedorComponent } from './fornecedor/cadastro/domicilio-bancario/domicilio-bancario.component';
import { TarifasFornecedorComponent } from './fornecedor/cadastro/tarifas/tarifas.component';
import { ParticipanteDadosCadastraisComponent } from './participante/dados-cadastrais/dados-cadastrais.component';

import { IndicacaoFornecedorComponent } from './estabelecimento/indicacao-fornecedor/indicacao-fornecedor.component';
import { ExportacaoComponent } from './exportacao/exportacao.component';
import { GerenciamentoConsultaFornecedorComponent } from './estabelecimento/consultar-fornecedor/gerenciamento/gerenciamento.component';
import { IndicacaoEstabelecimentoComponent } from './fornecedor/indicacao-estabelecimento/indicacao-estabelecimento.component';

import { GerenciamentoFornecedorComponent } from './fornecedor/listagem/gerenciamento/gerenciamento.component';
import {
    EditarIndicacaoEstabelecimentoComponent
} from './fornecedor/indicacao-estabelecimento/editar/editar-indicacao-estabelecimento.component';
import { GerenciamentoInformacacoesFornecedorComponent } from './fornecedor/informacoes/gerenciamento/gerenciamento.component';
import { NotificacoesComponent } from './core/notificacoes/notificacoes.component';
import { UsuarioEditarComponent } from './usuarios/editar-incluir-usuario/incluir-usuario.component';

// Routes
const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
            { path: 'acesso-bloqueado', component: NotPermittedComponent },
            {
                path: 'credenciamento/pessoa-fisica',
                component: CredenciamentoDadosCadastraisComponent,
                data: {
                    tipoPessoa: TiposPessoa.fisica, roles: [Roles.boAdministrador, Roles.boOperacoes],
                },
                canActivate: [Authorize]
            },
            {
                path: 'credenciamento/pessoa-juridica',
                component: CredenciamentoDadosCadastraisComponent,
                data: {
                    tipoPessoa: TiposPessoa.juridica, roles: [Roles.boAdministrador, Roles.boOperacoes],
                },
                canActivate: [Authorize]
            },
            {
                path: `credenciamento/:pessoa/${CredenciamentoSteps.dadosInstalacao}`,
                component: CredenciamentoDadosInstalacaoComponent,
                data: { roles: [Roles.boAdministrador, Roles.boOperacoes] },
                canActivate: [Authorize]
            },
            {
                path: `credenciamento/pessoa-juridica/${CredenciamentoSteps.dadosSocietarios}`,
                component: CredenciamentoDadosSocietariosComponent,
                data: { roles: [Roles.boAdministrador, Roles.boOperacoes] },
                canActivate: [Authorize]
            },
            {
                path: `credenciamento/:pessoa/${CredenciamentoSteps.captura}`,
                component: CredenciamentoCapturaComponent,
                data: { roles: [Roles.boAdministrador, Roles.boOperacoes] },
                canActivate: [Authorize]
            },
            {
                path: `credenciamento/:pessoa/${CredenciamentoSteps.condicoesComerciais}`,
                component: CredenciamentoCondicoesComerciaisComponent,
                data: { roles: [Roles.boAdministrador, Roles.boOperacoes] },
                canActivate: [Authorize]
            },
            {
                path: `credenciamento/:pessoa/${CredenciamentoSteps.documentos}`,
                component: CredenciamentoDocumentosComponent,
                data: { roles: [Roles.boAdministrador, Roles.boOperacoes] },
                canActivate: [Authorize]
            },
            {
                path: `credenciamento/:pessoa/${CredenciamentoSteps.domicilioBancario}`,
                component: CredenciamentoDomicilioBancarioComponent,
                data: { roles: [Roles.boAdministrador, Roles.boOperacoes] },
                canActivate: [Authorize]
            },
            {
                path: 'credenciamento/pesquisa',
                component: CredenciamentoPesquisaComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes],
                    breadcrumb: [{ label: 'Consulta' }]
                },
                canActivate: [Authorize]
            },
            {
                path: 'credenciamento/prospectar',
                component: CredenciamentoProspectarComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes],
                    breadcrumb: [{ label: 'Prospectar' }]
                },
                canActivate: [Authorize]
            },
            {
                path: 'credenciamento/upload',
                component: CredenciamentoUploadComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes, Roles.fcAdministrador, Roles.fcFinanceiro,
                    Roles.fcComercial],
                    somenteFornecedores: true,
                    breadcrumb: [{ label: 'Upload' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'estabelecimento/fornecedores/:aba',
                component: GerenciamentoConsultaFornecedorComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes, Roles.ecAdministrador, Roles.ecFinanceiro,
                    Roles.ecCompras],
                    somenteEstabelecimentos: true,
                    breadcrumb: [{ label: 'Consulta' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'fornecedor/estabelecimentos/:aba',
                component: MeusEstabelecimentosComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes, Roles.fcAdministrador, Roles.fcFinanceiro,
                    Roles.fcComercial],
                    somenteFornecedores: true,
                    breadcrumb: [{ label: 'Consulta' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'indicacao-estabelecimento',
                component: IndicacaoEstabelecimentoComponent,
                data: {
                    roles: [
                        Roles.boAdministrador,
                        Roles.boOperacoes,
                        Roles.fcAdministrador,
                        Roles.fcFinanceiro,
                        Roles.fcComercial
                    ],
                    somenteFornecedores: true,
                    breadcrumb: [{ label: 'Indicar Estabelecimento' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'indicacao-estabelecimento/:idIndicacao',
                component: EditarIndicacaoEstabelecimentoComponent,
                data: {
                    roles: [
                        Roles.boAdministrador,
                        Roles.boOperacoes,
                        Roles.fcAdministrador,
                        Roles.fcFinanceiro,
                        Roles.fcComercial
                    ],
                    somenteFornecedores: true,
                    breadcrumb: [
                        { label: 'Consulta', path: 'fornecedor/estabelecimentos/pendentes' },
                        { label: 'Indicação de Estabelecimento' },
                    ]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'indicacao-fornecedor',
                component: IndicacaoFornecedorComponent,
                data: {
                    roles: [
                        Roles.boAdministrador,
                        Roles.boOperacoes,
                        Roles.ecAdministrador,
                        Roles.ecFinanceiro,
                        Roles.ecCompras
                    ],
                    somenteEstabelecimentos: true,
                    breadcrumb: [{ label: 'Indicar Fornecedor' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'fornecedor/solicitarcessao/:idVinculo',
                component: SolicitarCessaoComponent,
                data: {
                    roles: [
                        Roles.boAdministrador,
                        Roles.boOperacoes,
                        Roles.fcAdministrador,
                        Roles.fcFinanceiro,
                        Roles.fcComercial
                    ],
                    somenteFornecedores: true,
                    breadcrumb: [
                        { label: 'Consulta', path: 'fornecedor/estabelecimentos/aprovados' },
                        { label: 'Cessão' }
                    ]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'fornecedor/gerenciamento/:aba',
                component: GerenciamentoFornecedorComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes],
                    breadcrumb: [{ label: 'Consulta' }]
                },
                canActivate: [Authorize]
            },
            {
                path: 'fornecedor/dados-cadastrais',
                component: DadosCadastraisFornecedorComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes],
                },
                canActivate: [Authorize]
            },
            {
                path: 'fornecedor/domicilio-bancario',
                component: DomicilioBancarioFornecedorComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes],
                },
                canActivate: [Authorize]
            },

            {
                path: 'fornecedor/tarifas',
                component: TarifasFornecedorComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes],
                },
                canActivate: [Authorize]
            },
            {
                path: 'fornecedor/dados-cadastrais/:documento',
                component: DadosCadastraisFornecedorComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes],
                },
                canActivate: [Authorize]
            },
            {
                path: 'cessoes',
                component: CessaoConsultarComponent,
                data: {
                    somenteEstabelecimentos: true,
                    somenteFornecedores: true,
                    breadcrumb: [
                        { label: 'Consulta' }
                    ]
                },
                canActivate: [ParticipanteGuard]
            },
            {
                path: 'cessao/detalhe/:id',
                component: CessaoDetalheComponent,
                data: {
                    somenteEstabelecimentos: true,
                    somenteFornecedores: true,
                    breadcrumb: [
                        { label: 'Consulta', path: '/cessoes' },
                        { label: 'Cessão' }
                    ]
                },
                canActivate: [ParticipanteGuard]
            },
            {
                path: 'fornecedor/relatorio/tarifas',
                component: FornecedorTarifaComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes, Roles.fcAdministrador, Roles.fcFinanceiro,
                    Roles.fcComercial],
                    somenteFornecedores: true,
                    breadcrumb: [{ label: 'Tarifas' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'fornecedor/relatorio/extratoresumido',
                component: ExtratoResumidoComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes, Roles.fcAdministrador, Roles.fcFinanceiro,
                    Roles.fcComercial],
                    somenteFornecedores: true,
                    breadcrumb: [{ label: 'Relatório Resumido' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            // {
            //     path: 'estabelecimento/relatorio/extratoresumido',
            //     component: ExtratoResumidoComponent,
            //     data: {
            //         roles: [Roles.boAdministrador, Roles.boOperacoes],
            //         breadcrumb: [{ label: 'Relatório Resumido' }]
            //     },
            //     canActivate: [Authorize]
            // },
            {
                path: 'fornecedor/relatorio/extratodetalhado',
                component: ExtratoDetalhadoComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes, Roles.fcAdministrador,
                    Roles.fcFinanceiro, Roles.fcComercial],
                    somenteFornecedores: true,
                    breadcrumb: [{ label: 'Relatório Detalhado' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'fornecedor/relatorio/exportacoes',
                component: ExportacaoComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes, Roles.fcAdministrador,
                    Roles.fcFinanceiro, Roles.fcComercial],
                    somenteFornecedores: true,
                    breadcrumb: [{ label: 'Exportações' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'estabelecimento/relatorio/extratodetalhado',
                component: ExtratoDetalhadoComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes, Roles.ecAdministrador,
                    Roles.ecFinanceiro, Roles.ecCompras],
                    somenteEstabelecimentos: true,
                    breadcrumb: [{ label: 'Relatório Detalhado' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'estabelecimento/relatorio/exportacoes',
                component: ExportacaoComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes, Roles.ecAdministrador,
                    Roles.ecFinanceiro, Roles.ecCompras],
                    somenteEstabelecimentos: true,
                    breadcrumb: [{ label: 'Exportações' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'credenciamento/:id',
                component: CredenciamentoStatusComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes],
                    breadcrumb: [
                        { label: 'Consulta', path: 'credenciamento/pesquisa' },
                        { label: 'Credenciamento' }
                    ]
                },
                canActivate: [Authorize]
            },
            {
                path: 'fornecedor/antecipacao/solicitar',
                component: AnteciparFornecedorComponent,
                data: {
                    roles: [
                        Roles.boAdministrador,
                        Roles.boOperacoes,
                        Roles.fcAdministrador,
                        Roles.fcFinanceiro,
                        Roles.fcComercial
                    ],
                    somenteFornecedores: true,
                    breadcrumb: [{ label: 'Antecipação' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'estabelecimento/antecipacao/solicitar',
                component: AnteciparEstabelecimentoComponent,
                data: {
                    roles: [
                        Roles.boAdministrador,
                        Roles.boOperacoes,
                        Roles.ecAdministrador,
                        Roles.ecFinanceiro,
                        Roles.ecCompras
                    ],
                    somenteEstabelecimentos: true,
                    breadcrumb: [{ label: 'Antecipação' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'fornecedor/antecipacao/realizadas',
                component: PesquisarAntecipacaoFornecedorComponent,
                data: {
                    roles: [
                        Roles.boAdministrador,
                        Roles.boOperacoes,
                        Roles.fcAdministrador,
                        Roles.fcFinanceiro,
                        Roles.fcComercial
                    ],
                    somenteFornecedores: true,
                    breadcrumb: [{ label: 'Consulta' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'estabelecimento/antecipacao/realizadas',
                component: PesquisarAntecipacaoEstabelecimentoComponent,
                data: {
                    roles: [
                        Roles.boAdministrador,
                        Roles.boOperacoes,
                        Roles.ecAdministrador,
                        Roles.ecFinanceiro,
                        Roles.ecCompras
                    ],
                    somenteEstabelecimentos: true,
                    breadcrumb: [{ label: 'Consulta' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'usuarios/:aba',
                component: UsuariosGerenciamentoComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.ecAdministrador, Roles.fcAdministrador],
                    breadcrumb: [{ label: 'Usuários' }]
                },
                canActivate: [Authorize]
            },
            {
                path: 'usuario/cadastrar',
                component: UsuarioEditarComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.ecAdministrador, Roles.fcAdministrador],
                    breadcrumb: [
                        { label: 'Consulta', path: 'usuarios/ativos' },
                        { label: 'Usuarios' }
                    ]                },
                canActivate: [Authorize]
            },
            {
                path: 'health-check',
                component: HealthComponent,
                data: {
                    roles: [Roles.super],
                    breadcrumb: [{ label: 'Health Check' }]
                },
            },
            {
                path: 'taxas',
                component: TaxaListComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes],
                    breadcrumb: [{ label: 'Consulta' }]
                },
                canActivate: [Authorize]
            },
            {
                path: 'taxa/:id',
                component: TaxaEditComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes],
                    breadcrumb: [
                        { label: 'Consulta', path: 'taxas' },
                        { label: 'Taxa' }
                    ]
                },
                canActivate: [Authorize]
            },
            {
                path: 'estabelecimento/detalhe/dados-cadastrais',
                component: ParticipanteDadosCadastraisComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes, Roles.ecAdministrador,
                    Roles.ecFinanceiro, Roles.ecCompras],
                    somenteEstabelecimentos: true,
                    breadcrumb: [{ label: 'Dados Cadastrais' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'estabelecimento/detalhe/condicoescomerciais',
                component: ParticipanteTaxasComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes, Roles.ecAdministrador,
                    Roles.ecFinanceiro, Roles.ecCompras],
                    somenteEstabelecimentos: true,
                    breadcrumb: [{ label: 'Taxas e Tarifas' }]
                },
                canActivate: [Authorize, ParticipanteGuard]
            },
            {
                path: 'fornecedor/relatorio/consolidado',
                component: RelatorioConsolidadoFornecedorComponent,
                data: {
                    roles: [Roles.fcAdministrador, Roles.fcComercial, Roles.fcFinanceiro],
                    somenteFornecedores: true,
                    breadcrumb: [{ label: 'Relatório Consolidado' }]
                }
            },
            {
                path: 'fornecedor/:id/informacoes',
                component: GerenciamentoInformacacoesFornecedorComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes],
                    breadcrumb: [
                        { label: 'Consulta', path: 'fornecedor/gerenciamento/cadastrados' },
                        { label: 'Informações' }
                    ]
                }
            },
            {
                path: 'notificacoes',
                component: NotificacoesComponent,
                data: {
                    roles: [Roles.boAdministrador, Roles.boOperacoes],
                    breadcrumb: [{ label: 'Notificações' }]
                }
            },
        ],
        canActivate: [Authenticate]
    },
    { path: 'login', component: LoginComponent },
    { path: 'trocar-senha', component: ChangePasswordComponent },
    { path: 'esqueci-minha-senha', component: RecoverPasswordComponent },
    { path: 'redefinir-senha/:email/:codigo', component: ResetPasswordComponent },
    { path: 'registrar/:email/:codigo', component: RegisterComponent },
    { path: 'termo-aceite', component: TermoComponent }
    // { path: '**', component: NotfoundComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        scrollPositionRestoration: 'enabled',
    })],
    exports: [RouterModule],
})
export class AppRoutingModule { }
