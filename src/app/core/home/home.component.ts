import { Component, OnInit, ViewEncapsulation } from '@angular/core';

declare const $: any;

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  ngOnInit() {}
}
