# Plugin Toastr

Foi adicionado ao projeto o [`ngx-toastr`](https://github.com/scttcper/ngx-toastr). A partir da branch que você está atuando faça:

```sh
$ git merge develop
$ npm install
```

Após deverá ter a seguinte estrutura dentro de `node_modules/ngx-toastr`:

[![](https://user-images.githubusercontent.com/13021912/49542812-abd26580-f8bd-11e8-86fc-0f7ffa55ecf1.png)

### Como Usar

Na classe do seu `component.ts`, inclua o serviço de notificação (o caminho do serviço é relativo ao seu componente):

```TypeScript
import { NotificationService } from '../notification/notification.service';

export class WIP_Component {
    constructor(
        private notification: NotificationService,
    ) { }
```

Nos métodos dessa mesma classe, você poderá usar:

```TypeScript
    ... () {
        this.notification.showErrorMessage('Email não verificado');
        this.notification.showSuccessMessage('Salvo com sucesso');	
        this.notification.showInfoMessage('Copiando dados do registro 123');
        this.notification.showAlertMessage('Informe o endereço');
    }
```

### Resultado esperado

Mensagens como a do gif ilustrativo abaixo:

[![](https://user-images.githubusercontent.com/13021912/49244685-847c2400-f3f7-11e8-8b11-992b8e0866f6.gif)
