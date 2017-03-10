import {addProviders, inject, TestComponentBuilder} from '@angular/core/testing';
import {provide} from '@angular/core';
import {SpyLocation} from '@angular/common/testing';
import {Location} from '@angular/common';
import {ShelfAppComponent} from '../app/shelf.component';

declare var describe, it, expect, beforeEach;

describe('App: ShelfServer', () => {
    beforeEach(() => {
        addProviders([ShelfAppComponent, provide(Location, {useClass: SpyLocation})]);
    });

    it('should be able to test', inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

        return tcb.createAsync(ShelfAppComponent).then((componentFixture) => {
            componentFixture.detectChanges();
        });
    }));
});
