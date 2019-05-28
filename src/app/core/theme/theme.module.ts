import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent, ContentHeaderComponent, NotPermittedComponent } from './theme.components';
import { BreadcrumbComponent } from './bread-crumbs.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { FooterComponent } from './footer/footer.component';
import { CoreModule } from '../core.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AppRoutingModule,
        PipesModule,
        CoreModule
    ],
    declarations: [
        HeaderComponent,
        FooterComponent,
        ContentHeaderComponent,
        NotPermittedComponent,
        BreadcrumbComponent,
    ],
    exports: [
        HeaderComponent,
        FooterComponent,
        ContentHeaderComponent,
        NotPermittedComponent,
    ]
})
export class ThemeModule { }
