/* tslint:disable:no-unused-variable */

import {addProviders, inject} from '@angular/core/testing';
import {NotifyService} from './notify.service';

describe('Notify Service', () => {
    beforeEach(() => {
        addProviders([NotifyService]);
    });

    it('should ...',
        inject([NotifyService], (service: NotifyService) => {
            expect(service).toBeTruthy();
        }));
});
