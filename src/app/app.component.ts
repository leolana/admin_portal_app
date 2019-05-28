import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { DialogService } from './core/dialog/dialog.service';
import { AuthService } from './core/auth/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    constructor(private viewRef: ViewContainerRef, private authService: AuthService) { }

    ngOnInit() {
        DialogService.appViewRef = this.viewRef;
        this.authService.setupRefreshInterval();
    }
}
