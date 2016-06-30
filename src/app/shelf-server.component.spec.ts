import {
  beforeEachProviders,
  describe,
  expect,
  it,
  inject
} from '@angular/core/testing';
import { ShelfServerAppComponent } from '../app/shelf-server.component';

beforeEachProviders(() => [ShelfServerAppComponent]);

describe('App: ShelfServer', () => {
  it('should create the app',
      inject([ShelfServerAppComponent], (app: ShelfServerAppComponent) => {
    expect(app).toBeTruthy();
  }));

  it('should have as title \'shelf-server works!\'',
      inject([ShelfServerAppComponent], (app: ShelfServerAppComponent) => {
    expect(app.title).toEqual('shelf-server works!');
  }));
});
