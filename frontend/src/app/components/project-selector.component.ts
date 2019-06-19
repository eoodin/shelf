import { Component } from '@angular/core';
import {ProjectService} from '../project.service';

@Component({
  selector: 'project-selector',
  template: `
  <mat-menu #projectSelect="matMenu">
    <button mat-menu-item *ngFor="let p of excludeCurrent()"
    (click)="projService.setCurrent(p)"> {{p.name}} </button>
  </mat-menu>

  <button mat-button [matMenuTriggerFor]="projectSelect">
    <span class="button-text">{{project.name}}</span>
      <mat-icon aria-hidden="false" aria-label="Example home icon">keyboard_arrow_down</mat-icon>
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
