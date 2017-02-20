import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'defect-page',
  template: `
    <div class="defect-page">
      <div class="info">
          <project-selector></project-selector>
          <div class="operations">
              <button class="btn btn-primary" (click)="newStory()">Add Story</button>
          </div>
        </div>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
  .defect-page {padding: 10px;}
  .info { height:40px; padding: 2px 0;}
  .info .project-select{ display: inline-block;}
  .info .operations { float: right;}
  `]
})
export class PageComponent {

  constructor( private router: Router) {  }
}
