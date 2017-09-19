import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: '[defect-page]',
  template: `
    <div class="defect-page">
      <div class="info">
          <project-selector></project-selector>
          <div class="operations">
              <a md-button routerLink="/defects/new">New Defect</a>
          </div>
        </div>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
  :host {flex-grow: 1; display:flex; flex-direction: column;}
  .defect-page {flex-grow: 1; padding: 10px; display:flex; flex-direction: column;}
  .info { padding: 2px 0;}
  .info .project-select{ display: inline-block;}
  .info .operations { float: right;}
  `]
})
export class PageComponent {
  constructor( private router: Router) {  }
}
