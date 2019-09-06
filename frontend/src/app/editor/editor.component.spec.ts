import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorComponent } from './editor.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {HttpService} from '../http.service';
import {HttpClientModule} from '@angular/common/http';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {NO_ERRORS_SCHEMA} from '@angular/core';

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;

  beforeEach(async(() => {
      const httpStub = {};
      const activeRouteStub = {};
      TestBed.configureTestingModule({
      declarations: [ EditorComponent ],
        imports: [MatButtonModule, MatIconModule, HttpClientModule, RouterModule],
        providers: [
            {provide: HttpService, useValue: httpStub},
            {provide: ActivatedRoute, useValue: activeRouteStub}
        ],
        schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
