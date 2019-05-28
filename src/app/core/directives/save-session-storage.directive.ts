import { Directive, Input, OnInit, AfterViewChecked } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TiposPessoa } from 'src/app/interfaces';


@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[saveSessionStorage], [url]',
})
export class SaveSessionStorageDirective implements OnInit {
    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router
    ) {
    }

    @Input() saveSessionStorage: FormGroup;
    @Input() name: string;
    @Input() url: string;

    @Input() set waitFor(value: boolean) {
        if (this.saveSessionStorage && value) {
            this.setFormValues();
        }
        if (value) {
            sessionStorage.setItem('currentUrl', this.router.url.toString());

            const pessoa = this.activatedRoute.snapshot.url[1].path;
            const idPessoa = Object.keys(TiposPessoa.urls).find(t => TiposPessoa.urls[t] === pessoa);
            sessionStorage.setItem('tipoPessoa', idPessoa);
        }
    }

    ngOnInit() {
        if (this.saveSessionStorage) {
            Object.keys(this.saveSessionStorage.controls).forEach(control => {
                this.saveSessionStorage.controls[control].valueChanges.subscribe(value => {
                    const session = this.current();
                    session[control] = value;
                    sessionStorage.setItem(this.name, JSON.stringify(session));
                });
            });
        }
    }
    current() {
        return JSON.parse(sessionStorage.getItem(this.name) || '{}');
    }

    setFormValues() {
        const session = this.current();
        Object.keys(this.saveSessionStorage.controls).forEach(control => {
            this.saveSessionStorage.controls[control].setValue(session[control]);
        });
    }
}

