import { Component, Input, TemplateRef, ViewEncapsulation } from '@angular/core';

export interface AlpeTabs {
  label: string;
  template: TemplateRef<any>;
  active?: boolean;
}

@Component({
  selector: 'alpe-tabs',
  templateUrl: './alpe-tabs.component.html',
  styleUrls: ['./alpe-tabs.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AlpeTabsComponent {
  @Input() tabs: AlpeTabs[];
  @Input() milisecondsAnimation = 0;

  getActiveTab() {
    if (!this.tabs) {
      return null;
    }
    const active = this.tabs.findIndex(t => t.active);
    return active !== -1 ? active : 0;
  }
}
