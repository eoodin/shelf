import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {ShelfAppComponent} from '../app/shelf.component';

declare var describe, it, expect, beforeEach;

describe('App: ShelfServer', () => {
  let component: ShelfAppComponent;
  let fixture: ComponentFixture<ShelfAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShelfAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShelfAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
