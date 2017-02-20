/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DefectService } from './defect.service';

describe('DefectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DefectService]
    });
  });

  it('should ...', inject([DefectService], (service: DefectService) => {
    expect(service).toBeTruthy();
  }));
});
