import { NgModule } from '@angular/core';
import { UsuarioEditarComponent } from './editar-incluir-usuario/incluir-usuario.component';
import { UsuarioExistenteComponent } from './gerenciamento/dialog-existente.component';
import { UsuariosGerenciamentoComponent } from './gerenciamento/gerenciamento.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ThemeModule } from '../core/theme/theme.module';
import { PipesModule } from '../pipes/pipes.module';
import { DatatableModule } from '../core/datatable/datatable.module';
import { UsuariosAtivosComponent } from './por-status/ativo/usuarios-ativos.component';
import { UsuariosConviteAtivoComponent } from './por-status/convidado/usuarios-convite-ativo.component';
import { UsuariosConviteExpiradoComponent } from './por-status/expirado/usuarios-convite-expirado.component';
import { UsuariosInativosComponent } from './por-status/inativo/usuarios-inativos.component';
import { AlpeTabsModule } from '../core/components/alpe-tabs/alpe-tabs.module';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
    imports: [
        ReactiveFormsModule,
        BrowserModule,
        ThemeModule,
        PipesModule,
        DatatableModule,
        AlpeTabsModule,
        NgxMaskModule
    ],
    declarations: [
        UsuarioEditarComponent,
        UsuarioExistenteComponent,
        UsuariosGerenciamentoComponent,
        UsuariosAtivosComponent,
        UsuariosConviteAtivoComponent,
        UsuariosConviteExpiradoComponent,
        UsuariosInativosComponent
    ],
    exports: [
        UsuariosGerenciamentoComponent
    ],
    entryComponents: [
        UsuarioEditarComponent,
        UsuarioExistenteComponent,
    ]
})
export class UsuariosModule { }
