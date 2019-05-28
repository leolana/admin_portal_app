import { NgModule } from '@angular/core';
import { AlpeExpandableDirective } from './alpe-expandable.directive';

@NgModule({
    declarations: [
        AlpeExpandableDirective,
    ],
    exports: [
        AlpeExpandableDirective,
    ]
})
export class AlpeExpandableModule { }
