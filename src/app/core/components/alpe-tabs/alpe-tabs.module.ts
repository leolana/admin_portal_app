import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material';
import { AlpeTabsComponent } from './alpe-tabs.component';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
    imports: [
        BrowserModule,
        MatTabsModule
    ],
    declarations: [
        AlpeTabsComponent
    ],
    exports: [
        AlpeTabsComponent
    ]
})
export class AlpeTabsModule { }
