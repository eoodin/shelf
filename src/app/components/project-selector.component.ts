import { Component } from '@angular/core';
import {ProjectService} from "../project.service";

@Component({
  selector: 'project-selector',
  template: `
  <md-menu #projectSelect="mdMenu">
    <button md-menu-item *ngFor="let p of projects" (click)="projService.setCurrent(p)"> {{p.name}} </button>
  </md-menu>

  <button md-icon-button [mdMenuTriggerFor]="projectSelect">
    <md-icon>more_vert</md-icon>{{project.name}}
  </button>
  `,
  styles: [`.project-select{ display: inline-block;}`]
})
export class ProjectSelectorComponent {
  projects = [];
  project;

  constructor(
    private projService: ProjectService) {
    projService.projects.subscribe(ps => this.projects = ps);
    projService.current.subscribe(p => this.project = p);
  }
}
