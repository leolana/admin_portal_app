# Modal Cancelamento

No módulo em que `seu.component.ts` está declarado importe o módulo `ModalCancelamentoModule` para poder usar o componente modal-cancelamento:

```TypeScript
    import { ModalCancelamentoModule } from 'src/app/core/components/modal-cancelamento/modal-cancelamento.module';
    ...
    @NgModule({
        imports: [
            ModalCancelamentoModule
        ],
        declarations: [
            SeuComponent
        ],
        exports: [
            SeuComponent
        ]
    })
    export class SeuModule { }
```


No final do `seu.component.html`, inclua o componente modal-cancelamento:

```HTML
    <modal-cancelamento #modalReprovar (recusado)="reprovar($event)"></modal-cancelamento>
```

No seu HTML será incluído uma `div.modal` com os elementos necessários do modal-cancelamento. 


Use o decorator `#modalReprovar` para referenciar no `seu.component.ts`:

```TypeScript
    import { ModalCancelamentoComponent } from 'src/app/core/components/modal-cancelamento/modal-cancelamento.component';
    ...
    @ViewChild('modalReprovar') modalReprovar: ModalCancelamentoComponent;
```


Na função chamada para abrir a modal, use:

```TypeScript
    import { recusaTipoEnum } from 'src/app/core/components/modal-cancelamento/recusa-tipo.enum';
    ...
    this.modalReprovar.open(recusaTipoEnum.TIPO_MOTIVO, item);
```

O modal-cancelamento se encarrega de buscar quais os motivos de cancelamento de acordo com Id passado como primeiro parâmetro na função `open`.
`item` é o objeto referente ao que está sendo recusado (fornecedor, ec, vinculo)


No evento `(recusado)`, passe a função que será executada para fazer o cancelamento:
```TypeScript
    import { NumberFunctions } from 'src/app/core/functions/number.functions';
    ...
    reprovar(obj: { item: any, value: any }) {
        this.service
            .recusar({
                motivoRecusaId: obj.value.motivoRecusaId,
                documento: NumberFunctions.removeNonDigits(obj.item.documento),
                motivo: obj.value.observacao,
            })
            .subscribe(() => {
                this.notification.showSuccessMessage('Cancelado com sucesso.');
                this.getEntites();
            });
        this.modalReprovar.close();
    }
```

### =)

Caso precise de uma funcionalidade nova, altere o componente, teste bem, atualize a documentação aqui e avise no canal do slack.
