import {
  beforeEachProviders,
  describe,
  expect,
  it,
  inject,
  async,
  TestComponentBuilder
} from '@angular/core/testing';
import {provide} from '@angular/core';
import {SpyLocation} from '@angular/common/testing';
import {Location} from '@angular/common';
import { Router } from '@angular/router';
import { ShelfAppComponent } from '../app/shelf.component';

beforeEachProviders(() => [
  ShelfAppComponent,
  provide(Location, {useClass: SpyLocation}) 
]);

describe('App: ShelfServer', () => {
  it('should be able to test', inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

    return tcb.createAsync(ShelfAppComponent).then((componentFixture) => {
      componentFixture.detectChanges();
      console.log('info', componentFixture);
      expect(true).toBe(true);
    });
  }));
});
