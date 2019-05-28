# Alpe Tabs - Componente de Abas - Angular Mat Tabs

Vou explicar como o componente de abas está sendo usado na tela de Gerenciamento de Usuários para facilitar a explicação (`src/app/usuarios/gerenciamento/gerenciamento.component.html`).

Para cada aba, você terá que criar um componente no módulo adequado. Veja que no módulo `usuarios.module.ts` foram importados e declarados 4 componentes, um para cada aba:

```TypeScript
import { UsuariosAtivosComponent } from './por-status/ativo/usuarios-ativos.component';
import { UsuariosConviteAtivoComponent } from './por-status/convidado/usuarios-convite-ativo.component';
import { UsuariosConviteExpiradoComponent } from './por-status/expirado/usuarios-convite-expirado.component';
import { UsuariosInativosComponent } from './por-status/inativo/usuarios-inativos.component';

// ...
@NgModule({
    // ...
    declarations: [
        // ...
        UsuariosAtivosComponent,
        UsuariosConviteAtivoComponent,
        UsuariosConviteExpiradoComponent,
        UsuariosInativosComponent
    ],
```

Não tem nada de diferente na criação dos componentes, você irá criar hooks como `ngOnInit`, acessar métodos HTTP de serviços, pipes e etc. assim como faria em qualquer outro componente. No caso desses componentes de usuário, existem apenas datatables, mas poderia ter botões, boxes e outros elementos HTML sem problemas. 

No arquivo HTML de gerenciamento de usuários o componente de abas está assim:

```HTML
<alpe-tabs [tabs]="tabs">
    <ng-template #usuariosAtivos>
        <alpe-usuarios-ativos></alpe-usuarios-ativos>
    </ng-template>
    <ng-template #usuariosInativos>
        <alpe-usuarios-inativos></alpe-usuarios-inativos>
    </ng-template>
    <ng-template #usuariosConviteAtivo>
        <alpe-usuarios-convite-ativo></alpe-usuarios-convite-ativo>
    </ng-template>
    <ng-template #usuariosConviteExpirado>
        <alpe-usuarios-convite-expirado></alpe-usuarios-convite-expirado>
    </ng-template>
</alpe-tabs>
```

Perceba que os quatro componentes estão dentro de tags `<ng-template></ng-template>`. As tags de template por padrão carregam templates!! =P ... Logo não são incluídas no HTML e os métodos de hook como `ngOnInit()` de cada componente não são disparados, porque o componente não existe no documento.

Por isso é obrigatório o uso de tags de template. Assim se cada componente chama um endpoint para listagem, que é o caso de usuários, não são chamados quatro endpoints logo de início, cada endpoint de cada componente será chamado apenas quando a aba estiver ativa e o template respectivo da aba for incluído no documento.

Para que o componente de abas funcione, você precisa identificar na classe do componente qual template pertence a qual aba:

```TypeScript
// ...
import { AlpeTabs } from '../../core/components/alpe-tabs/alpe-tabs.component';
// ...

@Component({
    templateUrl: './gerenciamento.component.html'
})
export class UsuariosGerenciamentoComponent implements AfterViewInit {
    // ...

    @ViewChild('usuariosAtivos') usuariosAtivos: TemplateRef<any>;
    @ViewChild('usuariosInativos') usuariosInativos: TemplateRef<any>;
    @ViewChild('usuariosConviteAtivo') usuariosConviteAtivo: TemplateRef<any>;
    @ViewChild('usuariosConviteExpirado') usuariosConviteExpirado: TemplateRef<any>;

    // ...
```

Lembre que cada template de aba é um elemento `Child` na view HTML. Logo precisamos esperar que a view seja inicializada com o hook `AfterViewInit`, ou seja, assim que os templates forem lidos, o Angular passará a conhecê-los, antes disso eles estarão como `undefined`.

Então para cada aba informe a label e o respectivo template em ordem:

```TypeScript
    tabs: AlpeTabs[];

    ngAfterViewInit() {
        this.tabs = [
            { label: 'Ativos', template: this.usuariosAtivos },
            { label: 'Inativos', template: this.usuariosInativos },
            { label: 'Convidados', template: this.usuariosConviteAtivo },
            { label: 'Expirados', template: this.usuariosConviteExpirado }
        ];
    }
```

O componente de abas já estará funcionando.

### Refletir alteração externa

No caso de usuários, podemos incluir um novo usuário pela modal que se encontra fora das abas. E após incluir um usuário, esse deve aparecer na listagem de usuários convidados. Mas a lista não irá atualizar sozinha.

Você precisará em casos como esse pegar a referência do componente de usuários convidados:

Dentro do template:

```HTML
<alpe-usuarios-convite-ativo #refletirInclusao></alpe-usuarios-convite-ativo>
```

No componente:

```TypeScript
@ViewChild('refletirInclusao') refletirInclusao: UsuariosConviteAtivoComponent;
```

Feito isso, você poderá chamar os métodos do componente referenciado como quiser, veja como está sendo feito na tela de gerenciamento de usuários:

```TypeScript
adicionarUsuario() {
    this.dialogService
        .open(UsuarioEditarComponent, {})
        .then(() => this.refletirInclusao.obter());
}
```

### Iniciar determinada aba como ativa

Para isso, basta você setar a propriedade active na aba que deseja ser a primeira:

```TypeScript
this.tabs = [
    { label: 'Ativos', template: this.usuariosAtivos },
    { label: 'Inativos', template: this.usuariosInativos },
    { label: 'Convidados', template: this.usuariosConviteAtivo, active: true },
    { label: 'Expirados', template: this.usuariosConviteExpirado }
];
```

Isso é útil para casos onde a aba inicial é setada de acordo com a rota:

```TypeScript
    this.route.params.subscribe(params => {
        this.tabs[0].active = params.aba === 'cadastrados';
        this.tabs[1].active = params.aba === 'pendentes';
        this.tabs[2].active = params.aba === 'cancelados';
    });
```

Caso mais de uma aba esteja com valor verdadeiro em active, a primeira encontrada será a ativa.

Caso nenhuma aba esteja com valor verdadeiro em active, a primeira aba será a ativa.

É isso!