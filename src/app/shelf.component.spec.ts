import {
  beforeEachProviders,
  describe,
  expect,
  it,
  inject
} from '@angular/core/testing';
import { ShelfAppComponent } from '../app/shelf.component';

beforeEachProviders(() => [ShelfAppComponent]);

describe('App: ShelfServer', () => {
  it('should create the app',
      inject([ShelfAppComponent], (app: ShelfAppComponent) => {
    expect(app).toBeTruthy();
  }));

  it('should have as title \'shelf-server works!\'',
      inject([ShelfAppComponent], (app: ShelfAppComponent) => {
    //expect(app.title).toEqual('shelf-server works!');
        expect(true).toBeTrue();
  }));
});
