import { TestBed } from '@angular/core/testing';

import { InstallSiteService } from './install-site.service';

describe('InstallSiteService', () => {
  let service: InstallSiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstallSiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
