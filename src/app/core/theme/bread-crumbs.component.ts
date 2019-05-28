import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

interface IBreadcrumb {
    label: string;
    params: Params;
    url: string;
}

@Component({
    selector: 'app-breadcrumb',
    template: `
    <ol class='breadcrumb'>
      <li class='breadcrumb-item fa fa-home'><a routerLink=''> Home</a></li>
      <li *ngFor='let breadcrumb of breadcrumbs'
          class='breadcrumb-item'>
        <a [routerLink]='[breadcrumb.url]'>{{ breadcrumb.label }}</a>
      </li>
    </ol>
  `
})
export class BreadcrumbComponent implements OnInit {

    public breadcrumbs: IBreadcrumb[];

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router) {}
    ngOnInit() {
        this.load();
        this.activatedRoute.data.subscribe(this.load);
    }

    load() {
        if (!this.activatedRoute) {
            return;
        }
        const obj = this.activatedRoute.snapshot;
        const data = obj.data;
        this.breadcrumbs = [];

        if (data && data.breadcrumb) {
            this.breadcrumbs = data.breadcrumb.map(b => ({
                label: b.label ,
                url: '/' + (!b.path ? obj.url.map(s => s.path).join('/') : b.path),
                params: obj.params,
            }));
        }
    }
}
