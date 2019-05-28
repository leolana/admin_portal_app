# Datatable - Angular Material Table

No `seu.component.ts`, crie uma instância do datatable como no exemplo abaixo:

```TypeScript
import { Datatable } from '../../../core/datatable/datatable.interface';

export class SeuComponent {
    seuDatatable = new Datatable({
        table: [
            { property: 'bandeira', description: 'Bandeira' },
            { property: 'data', description: 'Data', pipe: 'date' },
            { property: 'valor', description: 'Valor', pipe: 'currency' },
        ],
        data: [],
    });
```

São obrigatórios para criar a instância do datatable as propriedades:
 - `table`,
 - e `data`.

Após buscar seus dados do servidor, para refletir no datatable faça assim:

```TypeScript
this.seuService.getSeusDados().subscribe(data => {
    this.seuDatatable.updateData(data);
});
```

A forma que mostrei acima fará paginação e sort de colunas no front considerando
que em `data` está todas as informações, caso você queira fazer esse 
gerenciamento server-side, passe uma função quando inicializar o datatable:

```TypeScript
serverSide: (pageSize, pageIndex, sortColumn, sortOrder) => {
    this.seuService
        .getSeusDados(pageSize, pageIndex, sortColumn, sortOrder)
        .subscribe(slicedData => {
            this.seuDatatable.internal.visibleData = slicedData;
        });
},
```

No HTML, use assim:

```HTML
<div class="table-primary">
    <alpe-datatable [datatable]="seuDatatable"></alpe-datatable>
</div>
```

Existem outras propriedades opcionais que você pode passar ao inicializar:

```TypeScript
table: {
    property: string,
    description: string,
    pipe?: 'date' | 'currency' | 'dateTime' | 'noSymbolCurrency',
    disableSort?: boolean,
    hideSort?: boolean,
    buttons?: {
        btnClass?: string,
        iconClass?: string,
        text?: string,
        notVisibleMessage?: string,
        visible?: (item: Item) => boolean;
        fnAction: (item: Item) => any;
    }[],
    inputNumber?: {
        max?: number,
        min?: number,
        valueChange: (item: Item) => any,
        label: (item: Item) => any
    },
    checkbox?: {
        isAllChecked: boolean,
        canCheck: (item: Item) => any,
        onThCheck: () => any,
        onCheck: (item: Item) => any
    }
    slideToggle?: {
        labelClass?: string,
        textTrue?: string,
        textFalse?: string,
        disableSlideToggle?: boolean,
        changeSlideToggle?: (item: Item) => any;
    }
}[],
// a propriedade "table" é obrigatória, porém dentro de cada configuração 
//     temos três propriedades opcionais:
// 
// pipe: pode ser tanto 'date', 'currency' e dateTime, serão aplicados os pipes adequados
//         caso você precise de outro pipe, NÃO altere o componente
//         importe o seu pipe no seu componente e mapeie o valor que precisa,
//         por exemplo:
//         -   data.forEach(row => {
//         -       row.documento = new DocumentoPipe().transform(row.documento);
//         -   });
//         -   seuDatatable.updateData(data);
// 
// disableSort: caso você tenha alguma coluna que não precise de ordenação, 
//                você pode usar essa propriedade com valor true
// hideSort: caso você não queira que mostra a arrow de ordenação.
// buttons: caso seja uma coluna de botões, você pode incluir quais botões você
//            quer que sejam exibidos um por objeto. Propriedades:
//                - btnClass: exemplo "btn-sm"
//                - iconClass: exemplo "fa-edit"
//                - text: exemplo "Reenviar Convite"
//                - notVisibleMessage: exemplo "Ativo"
//                      quando houver a propriedade *visible* e seu valor está como `falso` exibirá o valor dessa propriedade e não o botão 
//                - visible: exemplo "(item) => false"
//                - fnAction: exemplo "(item) => { console.log(item); /*...*/ }"
//            você terá que setar também:
//                > table[i].property = 'buttons';
// checkbox: caso você queira que uma das colunas seja de checkbox,
//                você deve incluir um objeto com as propriedades
//              - isAllChecked: exemplo "boolean"
//              - canCheck: exemplo "(item: Item) => any"
//              - onThCheck: exemplo "() => any"
//              - onCheck: exemplo "(item: Item) => any"
// slideToggle: caso você queira usar o slidetoggle
//            labelClass?: string
//            textTrue?: string
//            textFalse?: string
//            disableSlideToggle?: boolean
//            changeSlideToggle?: (item: Item) => any;

pageSizeOptions?: number[],
// as opções que aparecerão para quantidade de itens por página
// default: [3, 5, 10]

pageSize?: number,
// a quantidade inicial de itens por página
// default: 3

pageIndex?: number,
// o número da página visível para paginação
// default: 0

sortColumn?: string,
// o nome da coluna que está sendo ordenada
// default: null

sortOrder?: string,
// o tipo de ordenação por coluna:
// - 'asc' (default, para crescente) e 'desc' (para decrescente)

sortFunctionAsc?: (
    item1: any,
    item2: any,
    propertyName: string,
) => 1 | 0 | -1,
// recebe dois itens e o nome da propriedade que está se querendo ordenar
// a função de comparação será usada para determinar se um item
// quando ordenado de forma crescente deve:
//    (1) - vir antes,
//    (0) - na mesma ordem, ou
//   (-1) - vir depois
// a função default trata tipos 'currency' e para os demais tipos
// faz ordenação alfabética de strings
```

Para quem quiser entender melhor o "por baixo dos panos":

https://material.angular.io/components/table/overview

É esperado como resultado um layout parecido com esse:

![](https://i.stack.imgur.com/6NkaR.png)
