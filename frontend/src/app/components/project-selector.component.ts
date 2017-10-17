import { Component } from '@angular/core';
import {ProjectService} from '../project.service';

@Component({
  selector: 'project-selector',
  template: `
  <md-menu #projectSelect="mdMenu">
    <button md-menu-item *ngFor="let p of excludeCurrent()"
    (click)="projService.setCurrent(p)"> {{p.name}} </button>
  </md-menu>

  <button md-button [mdMenuTriggerFor]="projectSelect">
    <span class="button-text">{{project.name}}</span><md-icon>keyboard_arrow_down</md-icon>
  </button>
  `,
  styles: [`
    .project-select{ display: inline-block;}
    .button-text {font-size: 16px;}`]
})
export class ProjectSelectorComponent {
  projects = [];
  project;

  constructor(
    private projService: ProjectService) {
    projService.projects.subscribe(ps => this.projects = ps);
    projService.current.subscribe(p => this.project = p);
  }

  excludeCurrent() {
    return this.projects.filter(p => p != this.project);
  }
}
