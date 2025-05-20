import { TestBed } from '@angular/core/testing';

import { IspopupmessageService } from './ispopupmessage.service';

describe('IspopupmessageService', () => {
  let service: IspopupmessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IspopupmessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
