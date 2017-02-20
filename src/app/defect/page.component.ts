import { Component } from '@angular/core';

@Component({
  selector: 'defect-page',
  template: `
    <div>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: []
})
export class PageComponent {
  constructor() { }
}
