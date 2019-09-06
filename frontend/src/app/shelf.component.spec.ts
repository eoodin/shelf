import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {RouterLinkStubDirective, RouterOutletStubComponent} from '../../testing/router-stubs';
import {ShelfAppComponent} from './shelf.component';
import {MatDialogModule} from '@angular/material/dialog';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {NotifyService} from './notify.service';
import {ActivatedRoute} from '@angular/router';
import {LoginService} from './login.service';
import {UserService} from './user.service';
import {of} from 'rxjs';

describe('App: ShelfServer', () => {
    let component: ShelfAppComponent;
    let fixture: ComponentFixture<ShelfAppComponent>;

    beforeEach(async(() => {
        const notifyStub = {};
        const activeRouteStub = {};
        const loginStub = {};
        const userStub = {currentUser: of({name: 'tester'})};
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                MatDialogModule
            ],
            declarations: [ShelfAppComponent,
                RouterLinkStubDirective, RouterOutletStubComponent
            ],
            providers: [
                {provide: NotifyService, useValue: notifyStub },
                {provide: ActivatedRoute, useValue: activeRouteStub },
                {provide: UserService, useValue: userStub },
                {provide: LoginService, useValue: loginStub }
            ],
            schemas: [ NO_ERRORS_SCHEMA ]
        }).compileComponents();
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
