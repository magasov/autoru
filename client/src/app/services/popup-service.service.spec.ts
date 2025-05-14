import { TestBed } from '@angular/core/testing';

import { PopupServiceService } from './popup-service.service';

describe('PopupServiceService', () => {
  let service: PopupServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopupServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
