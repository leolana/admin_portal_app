import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CollapseDirective } from './directives/collapse.directive';
import { MaskDocumentoDirective } from './directives/mask-documento.directive';
import { MaskDirective } from './directives/mask.directive';
import { Select2Directive } from './directives/select2.directive';
import { SwitchDirective } from './directives/switch.directive';
import { TriggerDirective } from './directives/trigger.directive';
import { TooltipDirective } from './directives/tooltip.directive';
import { SaveSessionStorageDirective } from './directives/save-session-storage.directive';
import { CloneRowValuesDirective } from './directives/clone-row-values.directive';
import { MovideskComponent } from './movidesk/movidesk.component';
import { PreserveBehaviorDirective } from './directives/preserve-behavior.directive';
import { InputTelefoneComponent } from './input-telefone/input-telefone';
import { InputNovaSenhaComponent } from './components/inputs/input-nova-senha.component';
import { InputConfirmarSenhaComponent } from './components/inputs/input-confirmar-senha.component';

const core = [
    CollapseDirective,
    MaskDocumentoDirective,
    MaskDirective,
    Select2Directive,
    SwitchDirective,
    TriggerDirective,
    TooltipDirective,
    SaveSessionStorageDirective,
    CloneRowValuesDirective,
    PreserveBehaviorDirective,
    MovideskComponent,
    InputTelefoneComponent,
    InputNovaSenhaComponent,
    InputConfirmarSenhaComponent
];

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: core,
    exports: core,
})
export class CoreModule { }
