import { Injectable, NgModule } from '@angular/core';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

declare const $: any;

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    constructor(
        private toastr: ToastrService
    ) {
        this.settings.timeOut = 2500;
        this.settings.positionClass = 'toast-top-right';
        this.settings.preventDuplicates = true;
        this.settings.progressBar = true;
        this.settings.tapToDismiss = false;
        this.settings.autoDismiss = true;
        this.settings.disableTimeOut = false;
        this.saveDefaultSettings();
    }

    settings = this.toastr.toastrConfig;
    defaultdSettings;

    showErrorMessage(content?: string, obj: any = {}): number {
        if (!content) content = 'Operação não concluída';
        this.changeSettings(obj);
        const toastrInstance = this.toastr.error(content, obj.title);
        this.restoreSettings();
        return toastrInstance.toastId;
    }

    showSuccessMessage(content?: string, obj: any = {}): number {
        if (!content) content = 'Operação concluída';
        this.changeSettings(obj);
        const toastrInstance = this.toastr.success(content, obj.title);
        this.restoreSettings();
        return toastrInstance.toastId;

    }

    showInfoMessage(content?: string, obj: any = {}): number {
        this.changeSettings(obj);
        const toastrInstance = this.toastr.info(content, obj.title);
        this.restoreSettings();
        return toastrInstance.toastId;
    }

    showAlertMessage(content?: string, obj: any = {}): number {
        this.changeSettings(obj);
        const toastrInstance = this.toastr.warning(content, obj.title);
        this.restoreSettings();
        return toastrInstance.toastId;
    }

    clearToastr(id) {
        this.toastr.clear(id);
    }

    setTimeOut(timeout?) {
        this.settings.timeOut = isNaN(timeout) ? 2500 : timeout;
    }

    changeSettings(settings: object) {
        $.extend(this.settings, settings);
    }

    restoreSettings() {
        $.extend(this.settings, JSON.parse(this.defaultdSettings));
    }

    saveDefaultSettings() {
        this.defaultdSettings = JSON.stringify(this.settings);
    }
}

@NgModule({
    imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot()
    ],
    providers: [
        NotificationService
    ]
})
export class NotificationModule { }
