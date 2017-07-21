import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterLinkStubDirective, RouterOutletStubComponent } from '../../testing/router-stubs'
import { ShelfAppComponent } from '../app/shelf.component';

declare var describe, it, expect, beforeEach;

describe('App: ShelfServer', () => {
  let component: ShelfAppComponent;
  let fixture: ComponentFixture<ShelfAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShelfAppComponent,
        RouterLinkStubDirective, RouterOutletStubComponent
      ]
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
