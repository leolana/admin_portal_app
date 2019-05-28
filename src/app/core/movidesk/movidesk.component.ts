import { Component, Input } from '@angular/core';


@Component({
    selector: 'app-movidesk',
    template: `
        <a href="mailto:meajuda@alpenet.com.br" [class]="direction">
            <i class="fa fa-envelope" aria-hidden="true"></i>
            meajuda@alpenet.com.br
        </a>
    `
})


export class MovideskComponent{
    constructor() { }
    @Input() direction;

}
