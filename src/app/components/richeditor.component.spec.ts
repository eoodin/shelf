/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RicheditorComponent } from './richeditor.component';

describe('RicheditorComponent', () => {
  let component: RicheditorComponent;
  let fixture: ComponentFixture<RicheditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RicheditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RicheditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
