/* tslint:disable:no-unused-variable */

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';
import { NotifyService } from './notify.service';

describe('Notify Service', () => {
  beforeEachProviders(() => [NotifyService]);

  it('should ...',
      inject([NotifyService], (service: NotifyService) => {
    expect(service).toBeTruthy();
  }));
});
